import { chapters, lessons } from "./lessons.js?v=4";

const $ = (selector) => document.querySelector(selector);
const chaptersNav = $("#chapters");
const stepNav = $("#step-nav");
const lessonContent = $("#lesson-content");
const start = $("#start");
const previous = $("#previous");
const next = $("#next");
const indexDialog = $("#index-dialog");
const imageDialog = $("#image-dialog");
const search = $("#search");
const status = $("#status");
const storageKey = "engaging-students-assistive-tech-v1";

const validStep = (number) => Number.isInteger(number) && number >= 1 && number <= lessons.length;
const hashStep = () => Number(location.hash.match(/^#step-(\d+)$/)?.[1]);
const shotPath = (number) => "./images/" + String(number).padStart(2, "0") + ".webp";
const entities = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const escape = (value) => value.replace(/[&<>"']/g, (character) => entities[character]);

function readProgress() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) ?? {};
  } catch {
    return {};
  }
}

const saved = readProgress();
const completed = new Set(Array.isArray(saved.done) ? saved.done.filter(validStep) : []);
const initialStep = hashStep();
let current = validStep(initialStep) ? initialStep : validStep(saved.last) ? saved.last : 1;

function saveProgress() {
  try {
    localStorage.setItem(storageKey, JSON.stringify({ last: current, done: [...completed] }));
  } catch {
    // Navigation still works when the browser disables local storage.
  }
}

function stepLink(lesson, number) {
  const state = number === current ? ' aria-current="step"' : "";
  const done = completed.has(number) ? ' <span class="sr-only">Completed.</span>' : "";
  return '<a class="step-link" href="#step-' + number + '" data-step="' + number + '"' + state +
    '><span class="step-number">' + number + '</span><span class="step-name">' + escape(lesson.title) + done + '</span></a>';
}

function renderChapters(chapter) {
  chaptersNav.innerHTML = chapters.map((item, index) => {
    const selected = item === chapter ? ' aria-current="true"' : "";
    return '<a class="chapter-tile ' + item.color + '" href="#step-' + item.first +
      '" data-step="' + item.first + '"' + selected + '><span><span class="tile-no">CHAPTER ' +
      String(index + 1).padStart(2, "0") + '</span><b>' + escape(item.title) +
      '</b></span><small>' + escape(item.summary) + '</small></a>';
  }).join("");
  $("#chapter-heading").textContent = chapter.title;
}

function renderStepNav(chapter) {
  stepNav.innerHTML = lessons.slice(chapter.first - 1, chapter.last)
    .map((lesson, index) => stepLink(lesson, chapter.first + index)).join("");
  const selected = stepNav.querySelector('[aria-current="step"]');
  if (selected && stepNav.scrollWidth > stepNav.clientWidth) {
    stepNav.scrollLeft += selected.getBoundingClientRect().left - stepNav.getBoundingClientRect().left - 6;
  }
}

function accordion(label, body) {
  return '<details><summary>' + label + '</summary><div class="details-body">' + body + '</div></details>';
}

function stepList(steps) {
  return '<ol class="steps" role="list">' + steps.map((step, index) =>
    '<li><span class="task-number" aria-hidden="true">' + (index + 1) +
    '</span><span>' + escape(step) + '</span></li>').join("") + '</ol>';
}

function screenshot(src, alt) {
  return '<figure><button type="button" class="shot" data-zoom aria-label="Enlarge screenshot: ' +
    escape(alt) + '"><img src="' + escape(src) + '" alt="' + escape(alt) +
    '"><span class="zoom" aria-hidden="true">Enlarge →</span></button><figcaption>' +
    escape(alt) + '.</figcaption></figure>';
}

function helpLink([label, url]) {
  return '<a href="' + escape(url) + '" target="_blank" rel="noopener noreferrer">' + escape(label) + '</a>';
}

function renderLesson(lesson) {
  const links = lesson.links?.map((link) => "<li>" + helpLink(link) + "</li>").join("");
  const guide = lesson.extraGuide;
  const noteImage = lesson.noteImage;
  const extras = [
    accordion("Help & teaching notes", "<p>" + escape(lesson.note) + "</p>" +
      (noteImage ? screenshot("./images/" + noteImage.file, noteImage.alt) : "")),
    lesson.example && accordion("Classroom example", "<p>" + escape(lesson.example) + "</p>"),
    ...(lesson.prompts ?? []).map(({ title, text }, index) => {
      const id = "sample-prompt-" + index;
      return accordion(escape(title),
        '<button class="copy" type="button" data-copy-prompt="' + index + '" aria-controls="' + id +
        '">Copy prompt</button><pre class="prompt" id="' + id + '" tabindex="0">' + escape(text) + '</pre>');
    }),
    guide && accordion(escape(guide.title), '<div class="lesson-grid"><div>' + stepList(guide.steps) +
      "<p>" + helpLink(guide.link) + "</p></div>" +
      screenshot("./images/" + guide.image, guide.alt) + "</div>"),
    links && accordion(escape(lesson.linkTitle ?? "Links & setup guides"), "<ul>" + links + "</ul>")
  ].filter(Boolean).join("");

  lessonContent.innerHTML =
    '<header class="lesson-header"><div><p class="eyebrow">STEP ' + String(current).padStart(2, "0") +
    ' / ' + lessons.length + '</p><h3 id="lesson-title" tabindex="-1">' + escape(lesson.title) +
    '</h3></div><button class="done-button" id="done" type="button" aria-pressed="false">Mark done</button></header>' +
    '<p class="intro">' + escape(lesson.intro) + '</p>' +
    (lesson.featuredLink ? '<p class="featured-resource">' + helpLink(lesson.featuredLink) + '</p>' : "") +
    '<div class="lesson-grid">' + stepList(lesson.steps) +
    screenshot(shotPath(current), lesson.alt) + '</div><div class="more">' + extras + '</div>';
}

function updateProgress() {
  const done = completed.has(current);
  $("#done").setAttribute("aria-pressed", String(done));
  $("#done").textContent = done ? "✓ Completed" : "Mark done";
  $("#progress").value = completed.size;
  $("#progress-label").textContent = completed.size + " of " + lessons.length + " completed";
}

function render() {
  const chapter = chapters.find(({ first, last }) => current >= first && current <= last);
  renderChapters(chapter);
  renderStepNav(chapter);
  renderLesson(lessons[current - 1]);
  updateProgress();
  previous.disabled = current === 1;
  next.textContent = current === lessons.length ? "Browse chapters ↑" : "Next step →";
  start.firstChild.textContent = current > 1 ? "Continue walkthrough " : "Start walkthrough ";
}

function focusLesson() {
  $("#lesson-title").focus({ preventScroll: true });
  $("#walkthrough").scrollIntoView({ block: "start" });
}

function goTo(number, { addHistory = true, focus = true } = {}) {
  if (!validStep(number)) return;
  if (addHistory && location.hash !== "#step-" + number) history.pushState(null, "", "#step-" + number);
  current = number;
  saveProgress();
  render();
  if (focus) focusLesson();
}

function renderIndex() {
  const words = search.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const groups = chapters.map((chapter) => {
    const matching = lessons.slice(chapter.first - 1, chapter.last).flatMap((lesson, index) => {
      const number = chapter.first + index;
      const searchable = [number, lesson.title, lesson.intro, chapter.title, lesson.extraGuide?.title, ...lesson.steps].join(" ").toLowerCase();
      return words.every((word) => searchable.includes(word)) ? [stepLink(lesson, number)] : [];
    });
    return matching.length ? "<section><h3>" + escape(chapter.title) + "</h3>" + matching.join("") + "</section>" : "";
  });
  $("#index-results").innerHTML = groups.join("") || '<p role="status">No matching steps. Try a tool name like Gemini or Classroom.</p>';
}

$("#open-index").addEventListener("click", () => {
  search.value = "";
  renderIndex();
  indexDialog.showModal();
  search.focus();
});
search.addEventListener("input", renderIndex);

document.addEventListener("click", (event) => {
  const anchor = event.target.closest("a[data-step]");
  if (anchor && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();
    if (indexDialog.open) indexDialog.close();
    goTo(Number(anchor.dataset.step));
  }

  const close = event.target.closest("[data-close]");
  if (close) close.closest("dialog").close();
});

start.addEventListener("click", (event) => {
  event.preventDefault();
  goTo(current);
});
previous.addEventListener("click", () => goTo(current - 1));
next.addEventListener("click", () => {
  if (current === lessons.length) {
    chaptersNav.querySelector("a").focus({ preventScroll: true });
    $("#chapter-picker").scrollIntoView();
  } else {
    goTo(current + 1);
  }
});

lessonContent.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.id === "done") {
    if (completed.has(current)) completed.delete(current);
    else completed.add(current);
    saveProgress();
    updateProgress();
    renderStepNav(chapters.find(({ first, last }) => current >= first && current <= last));
    status.textContent = completed.has(current) ? "Step marked complete." : "Step marked incomplete.";
  }
  if (button.hasAttribute("data-zoom")) {
    const thumbnail = button.querySelector("img");
    $("#enlarged").src = thumbnail.src;
    $("#enlarged").alt = thumbnail.alt;
    $("#full-image").href = thumbnail.src;
    $("#image-title").textContent = "Step " + current + " · Screenshot";
    imageDialog.showModal();
  }
  if (button.hasAttribute("data-copy-prompt")) {
    const prompt = document.getElementById(button.getAttribute("aria-controls"));
    const { text } = lessons[current - 1].prompts[Number(button.dataset.copyPrompt)];
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied!";
      status.textContent = "Prompt copied.";
    } catch {
      const range = new Range();
      range.selectNodeContents(prompt);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      button.textContent = "Prompt selected";
      status.textContent = "Copy the selected prompt.";
    }
  }
});

window.addEventListener("hashchange", () => {
  const number = hashStep();
  if (validStep(number)) goTo(number, { addHistory: false });
});

render();
if (validStep(initialStep)) {
  saveProgress();
  requestAnimationFrame(focusLesson);
}
