(() => {
  'use strict';

  // Public OAuth web client ID for this GitHub Pages origin.
  const CLIENT_ID = '';
  const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  const API = 'https://www.googleapis.com/drive/v3';
  const UPLOAD = 'https://www.googleapis.com/upload/drive/v3';
  const APP = 'spanish-practice-progress';
  const DEVICE_KEY = 'tmSpanish_drive_device_v1';
  const ACCOUNT_KEY = 'tmSpanish_drive_account_v1';
  const GROUPS = ['words', 'phrases', 'challenges'];
  const isRecord = value => value && typeof value === 'object' && !Array.isArray(value);
  const count = value => Number.isSafeInteger(value) && value >= 0 ? value : 0;
  const date = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : '';

  function cleanRow(row, challenge) {
    const attempts = count(row.attempts);
    const correct = Math.min(attempts, count(row.correct));
    if (challenge) return { attempts, correct };
    const level = Math.min(6, count(row.level));
    return {
      attempts, correct, level, mastered: level === 6,
      dueAt: date(row.dueAt), lastReviewedAt: date(row.lastReviewedAt),
    };
  }

  function mergeProgress(...snapshots) {
    const challengeResetAt = Math.max(0, ...snapshots.map(p => count(p.challengeResetAt)));
    const merged = { challengeResetAt };
    for (const group of GROUPS) {
      const challenge = group === 'challenges';
      const entries = new Map();
      for (const snapshot of snapshots) {
        if (challenge && count(snapshot.challengeResetAt) < challengeResetAt) continue;
        for (const [key, value] of Object.entries(snapshot[group])) {
          if (!isRecord(value)) continue;
          const incoming = cleanRow(value, challenge);
          if (!incoming.attempts) continue;
          const current = entries.get(key);
          if (!current) {
            entries.set(key, incoming);
            continue;
          }
          const incomingTime = Date.parse(incoming.lastReviewedAt) || 0;
          const currentTime = Date.parse(current.lastReviewedAt) || 0;
          const newer = incomingTime !== currentTime
            ? incomingTime > currentTime
            : incoming.attempts > current.attempts
              || (incoming.attempts === current.attempts && incoming.level > current.level);
          entries.set(key, {
            ...(newer ? incoming : current),
            attempts: Math.max(current.attempts, incoming.attempts),
            correct: Math.max(current.correct, incoming.correct),
          });
        }
      }
      merged[group] = Object.fromEntries(entries);
    }
    return merged;
  }

  async function driveRequest(token, url, options = {}) {
    const response = await fetch(url, {
      ...options,
      cache: 'no-store',
      headers: { ...options.headers, Authorization: 'Bearer ' + token },
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) {
      const error = new Error('Google Drive could not finish syncing.');
      error.status = response.status;
      throw error;
    }
    return response.json();
  }

  async function readBackups(token) {
    const query = new URLSearchParams({
      spaces: 'appDataFolder',
      q: "appProperties has { key='app' and value='" + APP + "' }",
      fields: 'nextPageToken,files(id,appProperties)',
      pageSize: '100',
    });
    const files = [];
    do {
      const page = await driveRequest(token, API + '/files?' + query);
      files.push(...(page.files || []));
      if (!page.nextPageToken) break;
      query.set('pageToken', page.nextPageToken);
    } while (true);
    const backups = await Promise.all(files.map(file =>
      driveRequest(token, API + '/files/' + encodeURIComponent(file.id) + '?alt=media')
    ));
    if (backups.some(b => b?.version !== 1 || !isRecord(b.progress)
      || GROUPS.some(group => !isRecord(b.progress[group])))) {
      throw new Error('A Drive progress backup could not be read. Your device save is safe.');
    }
    return { files, progress: backups.map(b => b.progress) };
  }

  function writeBackup(token, file, deviceId, progress) {
    const body = JSON.stringify({ version: 1, progress });
    if (file) return driveRequest(token, UPLOAD + '/files/' + encodeURIComponent(file.id)
      + '?uploadType=media&fields=id', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const boundary = 'spanish-practice-' + crypto.randomUUID();
    const metadata = {
      name: 'Spanish Practice Progress.json',
      mimeType: 'application/json',
      parents: ['appDataFolder'],
      appProperties: { app: APP, device: deviceId },
    };
    return driveRequest(token, UPLOAD + '/files?uploadType=multipart&fields=id', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/related; boundary=' + boundary },
      body: [
        '--' + boundary, 'Content-Type: application/json; charset=UTF-8', '',
        JSON.stringify(metadata), '--' + boundary, 'Content-Type: application/json', '',
        body, '--' + boundary + '--', '',
      ].join('\r\n'),
    });
  }

  function mount({ readProgress, applyProgress }) {
    if (!CLIENT_ID) return;
    const panel = document.getElementById('driveSyncPanel');
    const button = document.getElementById('driveSyncButton');
    const status = document.getElementById('driveSyncStatus');
    let authorization;
    let chooseAccount = !localStorage.getItem(ACCOUNT_KEY);
    panel.hidden = false;
    button.disabled = true;

    const sdk = document.createElement('script');
    sdk.src = 'https://accounts.google.com/gsi/client';
    sdk.async = true;
    sdk.onload = () => { button.disabled = false; };
    sdk.onerror = () => { status.textContent = 'Google sign-in is unavailable. Practice still saves here.'; };
    document.head.append(sdk);

    function accessToken() {
      if (authorization?.expiresAt > Date.now() + 30000) return Promise.resolve(authorization.token);
      return new Promise((resolve, reject) => {
        const cancelled = () => reject(new Error('Drive connection was cancelled. Practice still saves here.'));
        const client = google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPE,
          include_granted_scopes: false,
          error_callback: cancelled,
          callback: response => {
            if (!response.access_token) return cancelled();
            authorization = {
              token: response.access_token,
              expiresAt: Date.now() + Number(response.expires_in) * 1000,
            };
            resolve(authorization.token);
          },
        });
        client.requestAccessToken({ prompt: chooseAccount ? 'select_account' : '' });
      });
    }

    async function sync(token) {
      const { user } = await driveRequest(token, API + '/about?fields=user(permissionId)');
      if (!user?.permissionId) throw new Error('Google Drive could not verify the connected account.');
      const account = localStorage.getItem(ACCOUNT_KEY);
      if (account && user.permissionId !== account) {
        authorization = null;
        chooseAccount = true;
        throw new Error('Choose the Google account you previously used to sync this device.');
      }
      let device = localStorage.getItem(DEVICE_KEY);
      if (!device) {
        device = crypto.randomUUID();
        localStorage.setItem(DEVICE_KEY, device);
      }
      const { files, progress } = await readBackups(token);
      const before = readProgress();
      const merged = mergeProgress(...progress, before);
      // Each browser writes its own file, so two devices can sync at the same time.
      const own = files.find(file => file.appProperties?.device === device);
      await writeBackup(token, own, device, merged);
      localStorage.setItem(ACCOUNT_KEY, user.permissionId);
      chooseAccount = false;
      const after = readProgress();
      const changedWhileSyncing = JSON.stringify(before) !== JSON.stringify(after);
      applyProgress(mergeProgress(merged, after));
      status.textContent = changedWhileSyncing
        ? 'Synced. Your newest practice is saved here. Tap Sync again to send it to Drive.'
        : 'Synced to Drive at ' + new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + '.';
    }

    button.addEventListener('click', async () => {
      button.disabled = true;
      status.textContent = 'Connecting to Drive…';
      try {
        const token = await accessToken();
        status.textContent = 'Syncing your progress…';
        if (navigator.locks) await navigator.locks.request(APP, () => sync(token));
        else await sync(token);
      } catch (error) {
        if (error.status === 401) {
          authorization = null;
          status.textContent = 'Drive authorization expired. Tap Sync to reconnect.';
        } else if (error.status === 403) {
          status.textContent = 'Drive access was blocked. Practice still saves here.';
        } else if (!navigator.onLine || error.name === 'TimeoutError') {
          status.textContent = 'Could not reach Drive. Your progress is saved here.';
        } else {
          status.textContent = error.message + ' You can try again.';
        }
      } finally {
        button.disabled = false;
      }
    });
  }

  window.SpanishDriveProgress = { mount };
})();
