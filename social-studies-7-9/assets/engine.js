/* ============================================================
   Social Studies 7–9 — Activity Engine
   Powers every activity type from a single data config:
     type: "categorize" | "compare" | "spectrum" | "sequence" | "match"
   Desktop drag + mobile touch. No build step, no dependencies.
   ============================================================ */
(function (global) {
  "use strict";

  // Inline emoji → SVG data URI (instant load, no external assets)
  function icon(emoji) {
    if (!emoji) return null;
    return "data:image/svg+xml," + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="80">' + emoji + "</text></svg>"
    );
  }
  function shuffle(a) { return a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(v => v[1]); }
  function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }

  // ---- Universal draggable item ----
  function makeItem(data) {
    const e = el("div", "item" + (data.text ? " text-item" : ""));
    e.draggable = true;
    e.dataset.key = data.key;
    const img = data.emoji ? '<img src="' + icon(data.emoji) + '">' : "";
    e.innerHTML = img + "<span>" + data.label + "</span>";
    e.addEventListener("dragstart", onDragStart);
    e.addEventListener("dragend", onDragEnd);
    e.addEventListener("touchstart", onTouchStart, { passive: false });
    return e;
  }

  // ---- Drop target wiring (works for any .drop-zone-like element) ----
  function wireDropTarget(zone) {
    zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("over"); });
    zone.addEventListener("dragleave", () => zone.classList.remove("over"));
    zone.addEventListener("drop", e => {
      e.preventDefault(); zone.classList.remove("over");
      if (!dragged) return;
      placeInto(zone, dragged);
    });
  }
  // Single-capacity targets (sequence slot, match target) bump existing item back to bank
  function placeInto(zone, item) {
    const cap = zone.dataset.capacity;
    if (cap === "1") {
      const existing = zone.querySelector(".item");
      if (existing && existing !== item) bank.appendChild(existing);
    }
    zone.appendChild(item);
    clearMarks();
  }

  // ---- Desktop drag ----
  let dragged = null;
  function onDragStart(e) { dragged = e.currentTarget; setTimeout(() => dragged && (dragged.style.opacity = ".5"), 0); }
  function onDragEnd(e) { e.currentTarget.style.opacity = "1"; document.querySelectorAll(".over").forEach(z => z.classList.remove("over")); dragged = null; }

  // ---- Mobile touch drag ----
  let touchItem = null, clone = null, offX = 0, offY = 0;
  function onTouchStart(e) {
    e.preventDefault();
    touchItem = e.currentTarget;
    const r = touchItem.getBoundingClientRect(), t = e.touches[0];
    offX = t.clientX - r.left; offY = t.clientY - r.top;
    clone = touchItem.cloneNode(true);
    clone.classList.add("dragging");
    Object.assign(clone.style, { width: r.width + "px", height: r.height + "px", left: r.left + "px", top: r.top + "px" });
    document.body.appendChild(clone);
    touchItem.style.opacity = ".3";
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd);
  }
  function dropTargetUnder(x, y) {
    const below = document.elementFromPoint(x, y);
    return below ? below.closest(".drop-zone, .seq-slot, .match-target, #items-container") : null;
  }
  function onTouchMove(e) {
    e.preventDefault(); if (!clone) return;
    const t = e.touches[0];
    clone.style.left = (t.clientX - offX) + "px";
    clone.style.top = (t.clientY - offY) + "px";
    document.querySelectorAll(".over").forEach(z => z.classList.remove("over"));
    const tgt = dropTargetUnder(t.clientX, t.clientY);
    if (tgt && tgt.id !== "items-container") tgt.classList.add("over");
  }
  function onTouchEnd(e) {
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", onTouchEnd);
    const t = e.changedTouches[0];
    const tgt = dropTargetUnder(t.clientX, t.clientY);
    if (tgt) { if (tgt.id === "items-container") bank.appendChild(touchItem); else placeInto(tgt, touchItem); }
    if (clone) clone.remove();
    touchItem.style.opacity = "1";
    document.querySelectorAll(".over").forEach(z => z.classList.remove("over"));
    touchItem = null; clone = null;
  }

  // ---- shared refs ----
  let bank, msg, cfg, score;
  function clearMarks() {
    document.querySelectorAll(".item").forEach(i => i.classList.remove("correct", "wrong"));
    if (msg) msg.textContent = "";
    if (score) score.style.width = "0";
  }

  // ============================================================
  //  RENDERERS
  // ============================================================
  function header(c) {
    document.body.dataset.grade = c.grade || "";
    const top = el("div", "topbar",
      '<a href="' + (c.home || "../index.html") + '">&larr; All activities</a>' +
      '<span class="badge">Grade ' + (c.grade || "") + " · " + (c.dok || "") + "</span>");
    document.body.appendChild(top);
    document.body.appendChild(el("h1", null, c.title));
    document.body.appendChild(el("p", "subtitle", c.subtitle || ""));
  }
  function shell() {
    const g = el("div", "game-container");
    g.innerHTML =
      '<div id="play"></div>' +
      '<div class="controls"><button id="check-btn">Check Answers</button><button id="reset-btn">Start Over</button></div>' +
      '<div class="scorebar"><div id="score"></div></div>' +
      '<div id="message-area"></div>';
    document.body.appendChild(g);
    return g.querySelector("#play");
  }

  function buildBank(items) {
    bank = el("div", null, "");
    bank.id = "items-container";
    shuffle(items).forEach(it => bank.appendChild(makeItem(it)));
    return bank;
  }

  // ----- categorize / compare / spectrum -----
  function renderCategorize(play, c) {
    if (c.type === "spectrum" && c.poles) {
      const poles = el("div", "spectrum-poles", "<span>" + c.poles[0] + "</span><span>" + c.poles[1] + "</span>");
      play.appendChild(poles);
      play.appendChild(el("div", "spectrum-bar"));
    }
    play.appendChild(buildBank(c.items));
    const zc = el("div", "zones-container");
    c.categories.forEach(cat => {
      const name = typeof cat === "string" ? cat : cat.name;
      const sub = typeof cat === "string" ? "" : (cat.sub ? "<small>" + cat.sub + "</small>" : "");
      const w = el("div", "zone-wrapper");
      w.innerHTML = '<div class="zone-label">' + name + sub + "</div>";
      const z = el("div", "drop-zone");
      z.dataset.category = name;
      wireDropTarget(z);
      w.appendChild(z);
      zc.appendChild(w);
    });
    play.appendChild(zc);
  }
  function checkCategorize() {
    let correct = 0; const items = document.querySelectorAll(".item");
    items.forEach(it => {
      const z = it.closest(".drop-zone");
      it.classList.remove("correct", "wrong");
      if (!z) return;
      const want = cfg.items.find(x => x.key === it.dataset.key).category;
      if (z.dataset.category === want) { correct++; it.classList.add("correct"); }
      else it.classList.add("wrong");
    });
    finish(correct, cfg.items.length);
  }

  // ----- sequence -----
  function renderSequence(play, c) {
    play.appendChild(buildBank(c.items));
    const track = el("div", "sequence-track");
    c.items.forEach((_, i) => {
      const row = el("div", "seq-row");
      row.innerHTML = '<div class="seq-num">' + (i + 1) + "</div>";
      const slot = el("div", "seq-slot");
      slot.dataset.capacity = "1"; slot.dataset.pos = i + 1;
      wireDropTarget(slot);
      row.appendChild(slot);
      track.appendChild(row);
    });
    play.appendChild(track);
  }
  function checkSequence() {
    let correct = 0;
    document.querySelectorAll(".seq-slot").forEach(slot => {
      const it = slot.querySelector(".item");
      if (!it) return;
      it.classList.remove("correct", "wrong");
      const want = cfg.items.find(x => x.key === it.dataset.key).order;
      if (String(want) === slot.dataset.pos) { correct++; it.classList.add("correct"); }
      else it.classList.add("wrong");
    });
    finish(correct, cfg.items.length);
  }

  // ----- match -----
  function renderMatch(play, c) {
    play.appendChild(buildBank(c.pairs.map(p => ({ key: p.key, label: p.right, emoji: p.emoji, text: !p.emoji }))));
    const grid = el("div", "match-grid");
    shuffle(c.pairs.slice()).forEach(p => {
      const row = el("div", "match-row");
      row.appendChild(el("div", "match-prompt", p.left));
      const t = el("div", "match-target");
      t.dataset.capacity = "1"; t.dataset.key = p.key;
      wireDropTarget(t);
      row.appendChild(t);
      grid.appendChild(row);
    });
    play.appendChild(grid);
  }
  function checkMatch() {
    let correct = 0;
    document.querySelectorAll(".match-target").forEach(t => {
      const it = t.querySelector(".item");
      if (!it) return;
      it.classList.remove("correct", "wrong");
      if (it.dataset.key === t.dataset.key) { correct++; it.classList.add("correct"); }
      else it.classList.add("wrong");
    });
    finish(correct, cfg.pairs.length);
  }

  // ----- result -----
  function finish(correct, total) {
    const placed = total - bank.querySelectorAll(".item").length;
    if (placed < total) {
      msg.textContent = "Keep going — place all the cards first!";
      msg.style.color = "var(--reset)";
      score.style.width = "0"; return;
    }
    score.style.width = Math.round((correct / total) * 100) + "%";
    if (correct === total) {
      msg.textContent = "Perfect! All " + total + " correct! 🎉";
      msg.style.color = "var(--correct)";
    } else {
      msg.textContent = correct + " of " + total + " correct — green = right, red = move it.";
      msg.style.color = "var(--wrong)";
    }
  }

  // ============================================================
  //  PUBLIC: init
  // ============================================================
  function init(c) {
    cfg = c;
    header(c);
    const play = shell();
    msg = document.getElementById("message-area");
    score = document.getElementById("score");

    let checker;
    if (c.type === "sequence") { renderSequence(play, c); checker = checkSequence; }
    else if (c.type === "match") { renderMatch(play, c); checker = checkMatch; }
    else { renderCategorize(play, c); checker = checkCategorize; } // categorize/compare/spectrum

    // bank is also a drop target (to pull cards back out)
    wireDropTarget(bank);
    bank.addEventListener("drop", () => { if (dragged) bank.appendChild(dragged); });

    document.getElementById("check-btn").addEventListener("click", checker);
    document.getElementById("reset-btn").addEventListener("click", () => location.reload());
  }

  global.Activity = { init };
})(window);
