const N = "#13294B";
const B = "#0071E3";
const G = "#C9D3E0";
const MAT = "#E4EDF7";

function capsule(x1, y1, x2, y2, w, color) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const px = (-dy / len) * (w / 2);
  const py = (dx / len) * (w / 2);
  const a = (x1 + px).toFixed(1);
  const b = (y1 + py).toFixed(1);
  const c = (x2 + px).toFixed(1);
  const d = (y2 + py).toFixed(1);
  const e = (x2 - px).toFixed(1);
  const f = (y2 - py).toFixed(1);
  const g = (x1 - px).toFixed(1);
  const h = (y1 - py).toFixed(1);
  return `<path d="M${a} ${b} L${c} ${d} A${w / 2} ${w / 2} 0 0 1 ${e} ${f} L${g} ${h} A${w / 2} ${w / 2} 0 0 1 ${a} ${b} Z" fill="${color}"/>`;
}

function head(x, y, r = 18) {
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${N}"/>
    <circle cx="${x + r * 0.35}" cy="${y - r * 0.15}" r="${r * 0.22}" fill="#243656"/>`;
}

function torso(x, y, rx, ry) {
  return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${N}"/>`;
}

function arrow(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy;
  const py = ux;
  const hx = x2 - ux * 11;
  const hy = y2 - uy * 11;
  return `<path d="M${x1} ${y1} L${x2} ${y2}" fill="none" stroke="${B}" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M${x2} ${y2} L${(hx + px * 7).toFixed(1)} ${(hy + py * 7).toFixed(1)} M${x2} ${y2} L${(hx - px * 7).toFixed(1)} ${(hy - py * 7).toFixed(1)}" fill="none" stroke="${B}" stroke-width="3.5" stroke-linecap="round"/>`;
}

function mat() {
  return `<rect x="24" y="156" width="312" height="28" rx="14" fill="${MAT}"/>`;
}

function shadow(x) {
  return `<ellipse cx="${x}" cy="188" rx="62" ry="8" fill="${N}" opacity="0.08"/>`;
}

function heelSlides() {
  return `${mat()}
    ${head(70, 112, 18)}
    ${torso(118, 124, 34, 16)}
    ${capsule(146, 124, 200, 100, 18, N)}
    ${capsule(200, 100, 236, 150, 16, B)}
    ${capsule(236, 150, 262, 144, 12, B)}
    ${arrow(270, 172, 196, 172)}`;
}

function quadSets() {
  return `${mat()}
    ${head(70, 116, 18)}
    ${torso(118, 128, 34, 16)}
    ${capsule(150, 130, 228, 134, 20, B)}
    ${capsule(228, 134, 310, 138, 16, N)}
    ${capsule(310, 138, 332, 128, 12, N)}
    ${arrow(190, 78, 190, 112)}`;
}

function anklePumps() {
  return `${shadow(160)}
    <rect x="70" y="120" width="84" height="58" rx="14" fill="${MAT}"/>
    ${head(112, 58, 17)}
    ${torso(114, 100, 16, 28)}
    ${capsule(114, 124, 176, 150, 16, N)}
    ${capsule(176, 150, 178, 178, 14, N)}
    <g class="anim anim-foot" style="transform-box:view-box;transform-origin:178px 178px">
      ${capsule(178, 178, 220, 160, 13, B)}
    </g>`;
}

function walk(withWalker) {
  return `${shadow(160)}
    ${withWalker ? `<path d="M78 92 v86 M78 108 h22 M62 178 h34" fill="none" stroke="${G}" stroke-width="7" stroke-linecap="round"/>` : ""}
    ${head(148, 40, 17)}
    ${torso(146, 90, 17, 30)}
    ${capsule(140, 74, 112, 108, 12, N)}
    ${capsule(152, 74, 184, 102, 12, N)}
    ${capsule(142, 116, 108, 156, 18, N)}
    ${capsule(108, 156, 92, 186, 14, N)}
    ${capsule(150, 116, 196, 154, 18, B)}
    ${capsule(196, 154, 222, 184, 14, B)}
    ${capsule(222, 184, 242, 178, 10, B)}`;
}

function gluteSets() {
  return `${mat()}
    ${head(74, 112, 17)}
    ${torso(122, 126, 36, 16)}
    ${capsule(152, 126, 198, 84, 18, N)}
    ${capsule(198, 84, 220, 152, 15, N)}
    ${capsule(156, 128, 210, 96, 18, B)}
    ${capsule(210, 96, 234, 154, 15, B)}
    ${arrow(164, 104, 184, 118)}
    ${arrow(214, 104, 194, 118)}`;
}

function sitStand() {
  return `${shadow(150)}
    <rect x="92" y="136" width="92" height="14" rx="7" fill="${MAT}"/>
    <rect x="96" y="150" width="12" height="34" rx="4" fill="${MAT}"/>
    <rect x="168" y="150" width="12" height="34" rx="4" fill="${MAT}"/>
    <g class="anim anim-rise" style="transform-box:view-box;transform-origin:150px 136px">
      ${head(128, 46, 17)}
      ${torso(136, 92, 16, 30)}
      ${capsule(128, 78, 100, 108, 12, N)}
      ${capsule(142, 118, 176, 136, 18, B)}
      ${capsule(176, 136, 176, 172, 15, B)}
    </g>
    ${arrow(214, 156, 214, 92)}`;
}

function pendulum() {
  return `${shadow(150)}
    ${head(188, 48, 16)}
    ${torso(168, 100, 18, 32)}
    ${capsule(160, 124, 176, 168, 16, N)}
    ${capsule(176, 168, 164, 192, 13, N)}
    ${capsule(158, 126, 196, 166, 16, N)}
    ${capsule(196, 166, 188, 192, 13, N)}
    <g class="anim anim-arm" style="transform-box:view-box;transform-origin:156px 86px">
      ${capsule(156, 86, 118, 138, 13, B)}
    </g>
    <path d="M118 140 A 42 42 0 0 1 186 150" fill="none" stroke="${B}" stroke-width="3" stroke-dasharray="5 6" stroke-linecap="round"/>`;
}

function elbowBend() {
  return `${shadow(160)}
    ${head(160, 42, 17)}
    ${torso(160, 96, 17, 32)}
    ${capsule(168, 78, 196, 70, 12, N)}
    ${capsule(154, 118, 150, 176, 16, N)}
    <g class="anim anim-elbow" style="transform-box:view-box;transform-origin:154px 92px">
      ${capsule(154, 92, 208, 108, 14, B)}
      <circle cx="208" cy="108" r="8" fill="${B}"/>
    </g>`;
}

function fist() {
  return `<g transform="translate(40 28)">
      <rect x="46" y="78" width="50" height="64" rx="22" fill="${N}"/>
      <rect x="38" y="24" width="15" height="66" rx="8" fill="${N}"/>
      <rect x="56" y="10" width="15" height="80" rx="8" fill="${N}"/>
      <rect x="74" y="18" width="15" height="72" rx="8" fill="${N}"/>
      <rect x="92" y="36" width="15" height="54" rx="8" fill="${N}"/>
      <rect x="24" y="64" width="32" height="15" rx="8" transform="rotate(-40 40 72)" fill="${B}"/>
    </g>
    ${arrow(168, 110, 214, 110)}
    <g transform="translate(196 64)">
      <rect x="8" y="28" width="58" height="50" rx="20" fill="${B}"/>
      <rect x="8" y="12" width="13" height="28" rx="7" fill="${B}"/>
      <rect x="24" y="6" width="13" height="32" rx="7" fill="${B}"/>
      <rect x="40" y="8" width="13" height="30" rx="7" fill="${B}"/>
      <rect x="54" y="16" width="13" height="24" rx="7" fill="${B}"/>
    </g>`;
}

function blade() {
  return `${shadow(180)}
    ${head(180, 40, 17)}
    ${torso(180, 112, 26, 46)}
    <path d="M158 78 C138 96 140 132 154 150" fill="none" stroke="${B}" stroke-width="12" stroke-linecap="round"/>
    <path d="M202 78 C222 96 220 132 206 150" fill="none" stroke="${B}" stroke-width="12" stroke-linecap="round"/>
    ${arrow(118, 112, 146, 116)}
    ${arrow(242, 112, 214, 116)}`;
}

function gentleBend() {
  return `${shadow(140)}
    <rect x="62" y="128" width="78" height="52" rx="14" fill="${MAT}"/>
    ${head(100, 58, 17)}
    ${torso(108, 100, 16, 28)}
    ${capsule(112, 126, 176, 128, 18, N)}
    <g class="anim anim-gentle" style="transform-box:view-box;transform-origin:176px 128px">
      ${capsule(176, 128, 220, 168, 16, B)}
      ${capsule(220, 168, 246, 160, 12, B)}
    </g>
    <path d="M220 168 A 46 46 0 0 0 236 132" fill="none" stroke="${B}" stroke-width="3" stroke-dasharray="4 5" stroke-linecap="round"/>`;
}

function breath() {
  return `${shadow(180)}
    ${head(180, 44, 17)}
    <ellipse cx="180" cy="112" rx="30" ry="42" fill="${N}"/>
    <ellipse cx="180" cy="110" rx="16" ry="22" fill="${B}"/>
    ${capsule(168, 150, 146, 186, 15, N)}
    ${capsule(192, 150, 214, 186, 15, N)}
    <g class="anim anim-breath" style="transform-box:view-box;transform-origin:180px 110px">
      ${arrow(214, 100, 252, 90)}
      ${arrow(146, 100, 108, 90)}
    </g>`;
}

export const FIGURES = {
  "heel-slides": heelSlides(),
  "quad-sets": quadSets(),
  "ankle-pumps": anklePumps(),
  "short-walk": walk(true),
  "easy-walk": walk(false),
  "glute-sets": gluteSets(),
  "sit-stand": sitStand(),
  pendulum: pendulum(),
  "elbow-bend": elbowBend(),
  fist: fist(),
  blade: blade(),
  "gentle-bend": gentleBend(),
  breath: breath(),
};

export function bendGuide() {
  return `<svg class="guide" viewBox="0 0 360 210" aria-hidden="true">
    <rect width="360" height="210" rx="22" fill="#F4F7FB"/>
    <rect x="46" y="138" width="92" height="16" rx="8" fill="${MAT}"/>
    <rect x="52" y="154" width="12" height="36" rx="4" fill="${MAT}"/>
    <rect x="118" y="154" width="12" height="36" rx="4" fill="${MAT}"/>
    ${head(96, 58, 17)}
    ${torso(104, 102, 16, 30)}
    ${capsule(112, 128, 168, 150, 18, N)}
    ${capsule(168, 150, 196, 186, 15, N)}
    ${capsule(96, 92, 70, 118, 12, N)}
    <rect x="214" y="86" width="34" height="56" rx="8" fill="${N}"/>
    <circle cx="231" cy="108" r="6" fill="${B}"/>
    <rect x="198" y="140" width="70" height="10" rx="5" fill="${MAT}"/>
    <text x="252" y="176" fill="${N}" font-size="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif">Phone</text>
  </svg>`;
}
