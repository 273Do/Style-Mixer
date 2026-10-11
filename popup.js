const ALL_ATTRS = ["class", "id", "style"];
const SKIP = "script, style, noscript, template, link, meta";

function mix(attrs, allAttrs, skip) {
  const els = [...document.body.querySelectorAll("*")].filter(
    (el) => !el.matches(skip),
  );

  // Initial save
  if (!window.__styleMixerOriginal) {
    window.__styleMixerOriginal = els.map((el) => [
      el,
      Object.fromEntries(allAttrs.map((a) => [a, el.getAttribute(a)])),
    ]);
  }

  for (const attr of attrs) {
    const values = els.map((el) => el.getAttribute(attr));

    for (let i = values.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [values[i], values[j]] = [values[j], values[i]];
    }

    els.forEach((el, i) => {
      if (values[i] === null) el.removeAttribute(attr);
      else el.setAttribute(attr, values[i]);
    });
  }
}

function restore() {
  const original = window.__styleMixerOriginal;
  if (!original) return;
  for (const [el, attrs] of original) {
    for (const [attr, value] of Object.entries(attrs)) {
      if (value === null) el.removeAttribute(attr);
      else el.setAttribute(attr, value);
    }
  }
  delete window.__styleMixerOriginal;
}

async function run(func, args = []) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func,
    args,
  });
}

document.getElementById("mix").addEventListener("click", () => {
  const attrs = [
    ...document.querySelectorAll('input[name="attr"]:checked'),
  ].map((el) => el.value);
  if (attrs.length === 0) return;
  run(mix, [attrs, ALL_ATTRS, SKIP]);
});
document
  .getElementById("restore")
  .addEventListener("click", () => run(restore));
