const KEY = "recoveroo-demo-v1";

export const TODAY = "2026-11-21";

export const state = {
  lang: "en",
  text: 18,
  profile: null,
  metrics: null,
  setup: null,
  demo: null,
  toast: "",
  speakText: "",
  callPhase: "ringing",
};

export function L(en, es) {
  return state.lang === "es" ? es : en;
}

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

export function isoShift(days) {
  const [y, m, d] = TODAY.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const z = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}`;
}

export function daysFromToday(iso) {
  if (!iso) return 0;
  const [y, m, d] = iso.split("-").map(Number);
  const [ty, tm, td] = TODAY.split("-").map(Number);
  const a = Date.UTC(y, m - 1, d);
  const b = Date.UTC(ty, tm - 1, td);
  return Math.round((b - a) / 86400000);
}

export function phaseOf(profile) {
  if (!profile) return "postop";
  if (profile.track === "pain") return "pain";
  if (profile.when === "future") return "preop";
  return "postop";
}

export function dayCount(profile) {
  if (!profile?.date) return 0;
  return daysFromToday(profile.date);
}

export function trackNoun(profile) {
  const map = {
    knee: [L("knee replacement", "reemplazo de rodilla"), L("Knee", "Rodilla")],
    hip: [L("hip replacement", "reemplazo de cadera"), L("Hip", "Cadera")],
    shoulder: [L("shoulder replacement", "reemplazo de hombro"), L("Shoulder", "Hombro")],
    pain: [L("muscle and joint pain", "dolor muscular y de las articulaciones"), L("Joint pain", "Dolor articular")],
  };
  return map[profile?.track] || map.knee;
}

export function phaseLine(profile) {
  const phase = phaseOf(profile);
  const [noun] = trackNoun(profile);
  if (phase === "preop") {
    const left = Math.abs(dayCount(profile));
    return L(`Surgery in ${left} days`, `Cirugía en ${left} días`);
  }
  if (phase === "pain") {
    const weeks = Math.max(1, Math.ceil(dayCount(profile) / 7));
    return L(`Week ${weeks} of your pain plan`, `Semana ${weeks} de su plan para el dolor`);
  }
  const day = Math.max(0, dayCount(profile));
  return L(`Day ${day} after ${noun}`, `Día ${day} después del ${noun}`);
}

export function sideLine(profile) {
  const side = {
    left: L("Left", "Lado izquierdo"),
    right: L("Right", "Lado derecho"),
    both: L("Both sides", "Ambos lados"),
  }[profile?.side];
  if (!side || profile.track === "pain") return "";
  return side;
}

function lerp(pts, day) {
  if (day <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i += 1) {
    const [d1, v1] = pts[i];
    const [d0, v0] = pts[i - 1];
    if (day <= d1) return v0 + ((day - d0) / (d1 - d0)) * (v1 - v0);
  }
  return pts[pts.length - 1][1];
}

export function expectedBend(day, track) {
  if (track === "shoulder") return Math.round(lerp([[0, 40], [7, 70], [14, 90], [21, 110], [42, 130], [84, 150]], day));
  if (track === "hip") return Math.round(lerp([[0, 50], [7, 70], [14, 85], [21, 95], [42, 105], [84, 115]], day));
  if (track === "pain") return null;
  return Math.round(lerp([[0, 55], [7, 75], [14, 90], [21, 105], [42, 120], [84, 125]], day));
}

export function bendWord(track) {
  if (track === "shoulder") return L("arm lift", "elevación del brazo");
  if (track === "pain") return L("comfort", "comodidad");
  return L("bend", "flexión");
}

export function phoneLevel(profile, metrics) {
  const c = metrics?.checkin;
  if (c?.fever || c?.calf || c?.wound || c?.worse) return "high";
  if (c && Number(c.pain) >= 8) return "watch";
  if (phaseOf(profile) === "postop" && metrics?.rom?.angle) {
    const exp = expectedBend(Math.max(0, dayCount(profile)), profile.track);
    if (exp && metrics.rom.angle < exp - 20) return "watch";
  }
  return "ok";
}

export function levelLabel(level) {
  if (level === "high") return L("Needs a call", "Hay que llamar");
  if (level === "watch") return L("Check soon", "Revisar pronto");
  return L("On track", "Va bien");
}

export function sampleProfile() {
  return {
    source: "sample",
    patientName: "Maria Gonzalez",
    helper: false,
    helperName: "",
    track: "knee",
    side: "left",
    when: "past",
    date: "2026-11-03",
    consent: true,
  };
}

export function sampleMetrics() {
  return {
    draft: {},
    checkin: null,
    exercises: {
      "heel-slides": { done: true, reps: 10, set: 2, feedback: "right" },
      "quad-sets": { done: false, reps: 0, set: 1, feedback: null },
      "ankle-pumps": { done: true, reps: 20, set: 2, feedback: "easy" },
      "short-walk": { done: false, reps: 0, set: 1, feedback: null },
    },
    rom: { angle: 95, date: "2026-11-20", flow: 0 },
    romLive: null,
    questions: null,
    lastScore: 58,
    messages: [
      { from: "pt", text: { en: "Hi Maria. I looked at yesterday. Your pain is coming down and your bend is close to the sample path. Try the heel slides a little slower today.", es: "Hola Maria. Revisé el día de ayer. El dolor va bajando y la flexión está cerca del camino de muestra. Haga los deslizamientos de talón un poco más despacio hoy." }, time: "8:10 AM" },
      { from: "me", text: { en: "The knee felt stiff this morning. It loosened up after I walked in the kitchen.", es: "La rodilla estaba rígida esta mañana. Se aflojó después de caminar en la cocina." }, time: "8:22 AM" },
      { from: "pt", text: { en: "That is common this week. Ice after the walk if it swells. I am here if sharp pain shows up.", es: "Eso es común esta semana. Ponga hielo después de caminar si se hincha. Estoy aquí si aparece un dolor fuerte y punzante." }, time: "8:24 AM" },
    ],
    meds: { am: true, clot: true, pm: false },
    prep: { home: false, ride: false, bag: false, questions: false },
    apptAck: {},
    history: {
      pain: [8, 7, 7, 6, 6, 5, 5, 4, 4, 3],
      bend: [40, 48, 55, 62, 70, 78, 84, 88, 90, 95],
      steps: [600, 700, 800, 900, 1100, 900, 1400, 1600, 1800, 2140],
    },
    stepsToday: 2140,
    chartSpan: "w",
    walkMin: 28,
    milestones: { checkin: true, bend90: true, steps2k: true, alldone: false, questions: false },
    justEarned: "",
    tipSeen: {},
    photo: false,
    visit: "idle",
    summaryNoted: false,
    clinicAck: {},
    clinicNote: {},
  };
}

export function freshMetrics() {
  return {
    draft: {},
    checkin: null,
    exercises: {},
    rom: { angle: null, date: "", flow: 0 },
    romLive: null,
    questions: null,
    lastScore: null,
    messages: [
      { from: "pt", text: { en: "Welcome. I am Sarah Chen, your physical therapist. Each day you will see a short plan. I review what you enter.", es: "Bienvenida. Soy Sarah Chen, su fisioterapeuta. Cada día verá un plan corto. Yo reviso lo que usted anota." }, time: "9:00 AM" },
    ],
    meds: { am: false, clot: false, pm: false },
    prep: { home: false, ride: false, bag: false, questions: false },
    apptAck: {},
    history: { pain: [], bend: [], steps: [] },
    stepsToday: 420,
    walkMin: 8,
    milestones: { checkin: false, bend90: false, steps2k: false, alldone: false, questions: false },
    justEarned: "",
    tipSeen: {},
    photo: false,
    visit: "idle",
    summaryNoted: false,
    clinicAck: {},
    clinicNote: {},
  };
}

export function loadSample() {
  const lang = state.lang;
  const text = state.text;
  const demo = state.demo;
  state.profile = sampleProfile();
  state.metrics = sampleMetrics();
  state.setup = null;
  state.lang = lang;
  state.text = text;
  state.demo = demo;
  state.toast = "";
  save();
}

export function save() {
  try {
    const { speakText, toast, callPhase, ...rest } = state;
    localStorage.setItem(KEY, JSON.stringify(rest));
  } catch {
    /* sample only */
  }
}

export function hydrate() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      loadSample();
      return;
    }
    const data = JSON.parse(raw);
    if (!data.profile || !data.metrics) {
      loadSample();
      return;
    }
    state.lang = data.lang === "es" ? "es" : "en";
    state.text = [18, 21, 24].includes(data.text) ? data.text : 18;
    state.profile = data.profile;
    state.metrics = { ...sampleMetrics(), ...data.metrics };
    state.setup = data.setup || null;
    state.demo = data.demo || null;
  } catch {
    loadSample();
  }
}

export function weekdayLabel() {
  return L("Saturday, November 21", "sábado 21 de noviembre");
}

export function earn(id) {
  if (!state.metrics.milestones) state.metrics.milestones = {};
  if (state.metrics.milestones[id]) return false;
  state.metrics.milestones[id] = true;
  state.metrics.justEarned = id;
  save();
  return true;
}
