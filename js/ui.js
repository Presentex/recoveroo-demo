import { bendGuide, FIGURES } from "./figures.js";
import { esc } from "./store.js";

const PATHS = {
  home: '<path d="M4 11.5 12 4l8 7.5"/><path d="M7 10.5V20h10v-9.5"/>',
  move: '<circle cx="12" cy="5" r="2"/><path d="M12 7.5v6l-3 3M12 13.5l3 3M8 20l1.5-4M16 20l-1.5-4"/>',
  chart: '<path d="M4 19h16"/><path d="M6 15l4-5 3 3 5-7"/>',
  more: '<circle cx="6" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="18" cy="12" r="1.4" fill="currentColor"/>',
  speaker: '<path d="M4 10h3l4-3v10l-4-3H4z"/><path d="M16 9a4 4 0 0 1 0 6"/><path d="M18 7a7 7 0 0 1 0 10"/>',
  phone: '<path d="M8 4h8v16H8z"/><path d="M11 17h2"/>',
  book: '<path d="M5 5.5h6a3 3 0 0 1 3 3V20H8a3 3 0 0 0-3 3z"/><path d="M19 5.5h-6a3 3 0 0 0-3 3V20h6a3 3 0 0 1 3 3z"/>',
  pill: '<rect x="3" y="8" width="18" height="8" rx="4"/><path d="M12 8v8"/>',
  calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M8 3v4M16 3v4M4 10h16"/>',
  camera: '<path d="M4 8h3l2-2h6l2 2h3v11H4z"/><circle cx="12" cy="13" r="3"/>',
  message: '<path d="M5 6h14v10H8l-3 3z"/>',
  check: '<path d="M5 12.5 10 17l9-10"/>',
  alert: '<path d="M12 4 3 19h18z"/><path d="M12 10v4M12 16.5v.5"/>',
  person: '<circle cx="12" cy="8" r="3"/><path d="M6 19c1.2-3 3.2-4.5 6-4.5S16.8 16 18 19"/>',
  back: '<path d="M15 5 8 12l7 7"/>',
  steps: '<circle cx="12" cy="5" r="2"/><path d="M10 21l2-6 2 2 2-3"/><path d="M9 12l3 1 2-2 3 1"/>',
  stop: '<rect x="7" y="7" width="10" height="10" rx="1"/>',
};

export function icon(name) {
  return `<svg class="ico" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${PATHS[name] || ""}</svg>`;
}

export function ring(percent, color, label) {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  const radius = 30;
  const circ = 2 * Math.PI * radius;
  const dash = (p / 100) * circ;
  return `<div class="ring" role="img" aria-label="${esc(label)}">
    <svg viewBox="0 0 76 76" aria-hidden="true">
      <circle cx="38" cy="38" r="${radius}" class="ring-track"></circle>
      <circle cx="38" cy="38" r="${radius}" class="ring-value" stroke="${color}" stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"></circle>
    </svg>
    <strong>${esc(label)}</strong>
  </div>`;
}

export function btn(label, extra, variant = "primary") {
  return `<button type="button" class="btn btn-${variant}" ${extra}>${label}</button>`;
}

export function h(kicker, title, lede) {
  return `<header class="page-head">
    ${kicker ? `<p class="kicker">${kicker}</p>` : ""}
    <h1>${title}</h1>
    ${lede ? `<p class="lede">${lede}</p>` : ""}
  </header>`;
}

export function backLink(href, label) {
  return `<button type="button" class="back" data-href="${href}">${icon("back")}<span>${label}</span></button>`;
}

export function choice(label, extra, pressed) {
  return `<button type="button" class="choice" aria-pressed="${pressed ? "true" : "false"}" ${extra}>${label}</button>`;
}

export function figure(id, playing) {
  const inner = FIGURES[id] || FIGURES["heel-slides"];
  return `<div class="stage-video ${playing ? "is-playing" : ""}" data-move="${esc(id)}">
    <svg viewBox="0 0 360 210" aria-hidden="true">
      <rect width="360" height="210" rx="24" fill="#F4F7FB"/>
      ${inner}
    </svg>
  </div>`;
}

export { bendGuide };
