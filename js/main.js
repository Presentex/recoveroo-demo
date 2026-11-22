import { DEMO, QUESTIONS, dailyTipId, exerciseList, t } from "./content.js";
import { celebrateCopy, renderRoute, routeOf } from "./screens.js";
import {
  L, TODAY, earn, esc, freshMetrics, hydrate, loadSample, save, state,
} from "./store.js";
import { romTrack } from "./rom-track.js";
import { btn, icon, syncVidToggle } from "./ui.js";

const app = document.getElementById("app");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let lastHash = "";
let callTimer = 0;
let toastTimer = 0;
let demoTimer = 0;

function navigate(href) {
  const path = String(href || "/welcome").replace(/^#/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (normalized.startsWith("/call")) state.callPhase = "ringing";
  if (location.hash === `#${normalized}`) render();
  else location.hash = normalized;
}

function toast(message) {
  state.toast = message;
  render();
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    state.toast = "";
    render();
  }, 3200);
}

function ensureSetup() {
  if (!state.setup) {
    state.setup = {
      helper: null,
      patientName: "",
      helperName: "",
      track: "",
      side: "",
      when: "",
      date: "",
    };
  }
}

function finishCheckin() {
  const draft = { ...(state.metrics.draft || {}) };
  state.metrics.checkin = { ...draft, date: TODAY, partial: false };
  if (typeof draft.pain === "number") {
    state.metrics.history.pain = [...(state.metrics.history.pain || []), draft.pain].slice(-8);
  }
  state.metrics.draft = {};
  earn("checkin");
  save();
  navigate("/checkin/done");
}

function clearCall() {
  window.clearTimeout(callTimer);
  callTimer = 0;
}

function armCall() {
  if (callTimer) return;
  if (routeOf().name !== "call" || state.callPhase !== "ringing") return;
  callTimer = window.setTimeout(() => {
    callTimer = 0;
    if (routeOf().name === "call" && state.callPhase === "ringing") {
      state.callPhase = "connected";
      render();
    }
  }, 1400);
}

function armDemo() {
  window.clearInterval(demoTimer);
  demoTimer = 0;
  if (!state.demo?.auto) return;
  demoTimer = window.setInterval(() => {
    if (!state.demo?.auto) return;
    stepDemo(1);
  }, 7000);
}

function stepDemo(dir) {
  if (!state.demo) return;
  const next = state.demo.i + dir;
  if (next >= DEMO.length) {
    state.demo = null;
    save();
    armDemo();
    navigate("/welcome");
    return;
  }
  if (next < 0) return;
  state.demo.i = next;
  save();
  navigate(DEMO[next].href);
}

function deskNav(route) {
  const id = route.id || "";
  const items = [
    ["/clinic", L("Patients", "Pacientes"), route.name === "clinic" && !["alerts", "calls", "billing", "docs", "settings"].includes(id)],
    ["/clinic/alerts", L("Alerts", "Alertas"), id === "alerts"],
    ["/clinic/calls", L("Calls", "Llamadas"), id === "calls"],
    ["/clinic/billing", L("Billing", "Cobros"), id === "billing"],
    ["/summary", L("Practice summary", "Resumen"), route.name === "summary"],
    ["/clinic/docs", L("Documentation", "Notas"), id === "docs"],
    ["/clinic/settings", L("Settings", "Ajustes"), id === "settings"],
  ];
  return `<aside class="desk-nav">
    <button type="button" class="brand brand-on-navy" data-href="/clinic">
      <img src="./logo.svg" width="41" height="22" alt="">
      <span>recoveroo</span>
    </button>
    <nav aria-label="${L("Care team desk", "Escritorio del equipo")}">
      ${items.map(([href, label, on]) => `<button type="button" data-href="${href}" ${on ? 'aria-current="page"' : ""}>${label}</button>`).join("")}
    </nav>
    <button type="button" class="desk-phone" data-href="/today">${L("Patient phone", "Teléfono")}</button>
  </aside>`;
}

function tools(route, clinic) {
  if (clinic) return deskNav(route);
  const home = route.name === "welcome" ? "/welcome" : clinic ? "/clinic" : "/today";
  const sizes = [18, 21, 24];
  const atMin = state.text === sizes[0];
  const atMax = state.text === sizes[sizes.length - 1];
  return `<div class="tools">
    <button type="button" class="brand" data-href="${home}">
      <img src="./logo.svg" width="41" height="22" alt="">
      <span>recoveroo</span>
    </button>
    <div class="tool-row">
      <button type="button" class="tool icon-only" data-action="speak" aria-label="${state.speaking ? L("Stop reading", "Parar") : L("Read aloud", "Leer en voz alta")}">${icon("speaker")}</button>
      <button type="button" class="tool icon-only" data-action="text" data-dir="1" aria-disabled="${atMax}" aria-label="${L("Larger text", "Texto más grande")}">A+</button>
      <button type="button" class="tool icon-only" data-action="text" data-dir="-1" aria-disabled="${atMin}" aria-label="${L("Smaller text", "Texto más pequeño")}">A-</button>
      <button type="button" class="tool icon-only" data-action="lang" aria-label="${L("Spanish", "Inglés")}">${state.lang === "es" ? "EN" : "ES"}</button>
    </div>
  </div>`;
}

function patientNav(active) {
  const items = [
    ["/today", "home", L("Today", "Hoy"), "today"],
    ["/checkin", "check", L("Check-in", "Registro"), "checkin"],
    ["/move", "move", L("Exercises", "Ejercicios"), "move"],
    ["/track", "chart", L("Progress", "Avance"), "track"],
    ["/messages", "message", L("Care team", "Equipo"), "care"],
  ];
  return `<nav class="nav" aria-label="${L("Patient", "Paciente")}">${items.map(([href, name, label, id]) => `<button type="button" data-href="${href}" ${active === id ? 'aria-current="page"' : ""}>${icon(name)}<span>${label}</span></button>`).join("")}</nav>`;
}

function clinicNav() {
  return "";
}

function demoDock() {
  const step = DEMO[state.demo.i] || DEMO[0];
  return `<section class="demo" aria-label="${L("Guided tour", "Recorrido guiado")}">
    <p class="demo-kicker">${L("Tour", "Recorrido")} ${state.demo.i + 1} / ${DEMO.length}</p>
    <p><strong>${t(step.title)}</strong> ${t(step.body)}</p>
    <div class="demo-row">
      <button type="button" class="btn btn-secondary" data-action="demo-prev">${L("Back", "Atrás")}</button>
      <button type="button" class="btn btn-primary" data-action="demo-next">${state.demo.i === DEMO.length - 1 ? L("Finish", "Terminar") : L("Next", "Siguiente")}</button>
    </div>
    <div class="demo-row minor">
      <button type="button" class="tool" data-action="demo-auto">${state.demo.auto ? L("Pause", "Pausa") : L("Play through", "Reproducir")}</button>
      <button type="button" class="tool" data-action="demo-exit">${L("Exit tour", "Salir")}</button>
    </div>
  </section>`;
}

function celebrate() {
  const copy = celebrateCopy(state.metrics.justEarned);
  const bits = reduceMotion ? "" : `<div class="confetti" aria-hidden="true">${Array.from({ length: 26 }, (_, i) => {
    const colors = ["#0071E3", "#13294B", "#5EEAD4", "#FFFFFF"];
    return `<i style="left:${(i * 37) % 100}%;background:${colors[i % colors.length]};animation-delay:${(i % 7) * 0.07}s"></i>`;
  }).join("")}</div>`;
  return `<div class="celebrate" role="dialog" aria-modal="true" aria-labelledby="badge-title">
    ${bits}
    <div class="celebrate-card">
      <p class="kicker">${L("A milestone", "Un logro")}</p>
      <h2 id="badge-title">${esc(copy.title)}</h2>
      <p>${esc(copy.detail)}</p>
      ${btnNice()}
    </div>
  </div>`;
}

function btnNice() {
  return `<button type="button" class="btn btn-primary" data-action="close-badge">${L("Nice", "Qué bien")}</button>`;
}

function asideCopy(clinic) {
  const title = document.getElementById("aside-title");
  const copy = document.getElementById("aside-copy");
  if (!title || !copy) return;
  title.textContent = clinic ? L("Care team desk", "Escritorio del equipo") : "Recoveroo";
  copy.textContent = clinic
    ? L("Sorted by who needs a person. The surgeon page is one short list.", "Ordenado por quién necesita a una persona. La página del cirujano es una lista corta.")
    : L("At-home recovery on the phone they already have. For hip, knee, shoulder, and other joint and muscle recovery.", "Recuperación en casa, en el teléfono que ya tienen. Para la recuperación de cadera, rodilla, hombro y de otros músculos y articulaciones.");
}

function wideWelcome() {
  return window.matchMedia("(min-width: 1100px)").matches;
}

function isFrame() {
  return new URLSearchParams(location.search).get("frame") === "1";
}

function mountHero(on) {
  const phones = document.getElementById("warm-art");
  if (!phones) return;
  phones.hidden = !on;
  phones.querySelectorAll("iframe").forEach((frame) => {
    const next = frame.dataset.src || "";
    if (!on) {
      if (frame.getAttribute("src")) frame.removeAttribute("src");
      return;
    }
    if (frame.getAttribute("src") !== next) frame.setAttribute("src", next);
  });
}

function landingBar() {
  const links = [
    ["#how", L("How it works", "Cómo funciona")],
    ["#for-patients", L("For patients", "Para pacientes")],
    ["#for-practices", L("For practices", "Para clínicas")],
  ];
  return `
    <button type="button" class="brand" data-scroll="#how">
      <img src="./logo.svg" width="52" height="28" alt="">
      <span>recoveroo</span>
    </button>
    <nav class="landing-nav" aria-label="${L("On this page", "En esta página")}">
      ${links.map(([href, label]) => `<button type="button" data-scroll="${href}">${label}</button>`).join("")}
      <button type="button" data-href="/clinic">${L("Care team", "Equipo")}</button>
    </nav>
    <button type="button" class="book-demo" data-action="demo-start">${L("Book a demo", "Reservar una demo")}</button>
  `;
}

function landingCopy() {
  return `
    <p class="warm-tag" id="how"><img src="./logo.svg" alt="">${L("At-home orthopedic recovery", "Recuperación ortopédica en casa")}</p>
    <h1 id="for-patients">${L("A happier, easier recovery <em>at home.</em>", "Una recuperación más alegre y fácil <em>en casa.</em>")}</h1>
    <p class="landing-lede">${L(
      "For hip, knee, shoulder, and other joint and muscle recovery. A few short exercises, a quick check-in, and a licensed PT team in their corner, all on the phone they already have.",
      "Para la recuperación de cadera, rodilla, hombro y de otros músculos y articulaciones. Unos ejercicios cortos, un registro rápido y un equipo de PT con licencia, en el teléfono que ya tienen.",
    )}</p>
    <div class="warm-ctas">
      ${btn(L("Try Maria's app", "Probar la app de Maria"), 'data-action="open-maria"')}
      ${btn(L("See how practices use it", "Ver cómo lo usa la clínica"), 'data-href="/clinic"', "secondary")}
    </div>
    <div class="warm-badges" id="for-practices">
      <span>${L("Big, easy text", "Texto grande y fácil")}</span>
      <span>${L("Read aloud and Spanish", "Lectura en voz alta y español")}</span>
      <span>${L("Licensed PT team", "Equipo de PT con licencia")}</span>
    </div>
    <div class="warm-more">
      <button type="button" data-action="demo-start">${L("Play the guided tour", "Ver el recorrido guiado")}</button>
      <button type="button" data-href="/setup/hello">${L("Set up a new patient", "Preparar a un paciente nuevo")}</button>
    </div>
  `;
}

function render() {
  const route = routeOf();
  if (!state.profile || !state.metrics) loadSample();
  if (route.name === "setup") ensureSetup();
  if (route.name === "learn" && route.id && state.profile && route.id === dailyTipId(state.profile)) {
    state.metrics.tipSeen = state.metrics.tipSeen || {};
    if (!state.metrics.tipSeen[route.id]) {
      state.metrics.tipSeen[route.id] = true;
      save();
    }
  }
  if (state.metrics?.stepsToday >= 2000) earn("steps2k");
  const landing = route.name === "welcome" && wideWelcome() && !state.demo && !isFrame();
  document.body.classList.toggle("landing", landing);
  const bar = document.getElementById("landing-bar");
  const copy = document.getElementById("landing-copy");
  let phoneRoute = route;
  let view;
  if (landing) {
    if (state.profile?.source !== "sample") loadSample();
    view = { html: "", speak: "", footer: "", nav: "none", active: "" };
    if (bar) {
      bar.hidden = false;
      bar.innerHTML = landingBar();
    }
    if (copy) {
      copy.hidden = false;
      copy.innerHTML = landingCopy();
    }
    mountHero(true);
  } else {
    if (bar) {
      bar.hidden = true;
      bar.innerHTML = "";
    }
    if (copy) {
      copy.hidden = true;
      copy.innerHTML = "";
    }
    view = renderRoute(route);
    mountHero(false);
  }
  document.body.classList.toggle("frame", isFrame());
  document.body.dataset.screen = route.name;
  state.speakText = view.speak || "";
  const clinic = view.nav === "clinic";
  document.body.classList.toggle("clinic", clinic);
  document.documentElement.lang = state.lang === "es" ? "es" : "en";
  document.documentElement.style.setProperty("--text", `${state.text}px`);
  asideCopy(clinic);
  const hash = location.hash;
  const sameScreen = hash === lastHash && lastHash !== "";
  const keptScroll = sameScreen ? (document.getElementById("scroll")?.scrollTop || 0) : 0;
  app.innerHTML = `<div class="screen${clinic ? " is-desk" : ""}">
    ${tools(phoneRoute, clinic)}
    <div class="scroll" id="scroll">${view.html}</div>
    ${view.footer ? `<div class="dock-primary">${view.footer}</div>` : ""}
    ${state.demo ? demoDock() : view.nav === "patient" ? patientNav(view.active) : view.nav === "clinic" ? clinicNav(view.active) : ""}
    ${state.metrics?.justEarned ? celebrate() : ""}
    ${state.toast ? `<p class="toast" role="status">${esc(state.toast)}</p>` : ""}
  </div>`;
  const scroller = document.getElementById("scroll");
  if (scroller) scroller.scrollTop = keptScroll;
  if (hash !== lastHash) {
    window.speechSynthesis?.cancel();
    state.speaking = false;
    const heading = app.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }
  lastHash = hash;
  app.querySelectorAll("[data-count]").forEach((node) => {
    const end = Number(node.dataset.count || 0);
    if (!end || reduceMotion) {
      node.textContent = String(end);
      return;
    }
    const started = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - started) / 800);
      node.textContent = String(Math.round(end * progress));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  if (route.name !== "call") clearCall();
  else armCall();
  armScrollCue();
  app.querySelectorAll("video.ex-clip").forEach((video) => {
    const sync = () => syncVidToggle(video);
    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);
    sync();
  });
  armRomClip();
  armLiveAngle();
  armBendDrag();
  armWalk();
}

function readField(name) {
  const node = app.querySelector(`[data-field="${name}"]`);
  return node ? node.value : "";
}

function sampleBend(track) {
  if (track === "shoulder") return 96;
  if (track === "hip") return 86;
  if (track === "pain") return 70;
  return 87;
}

function commitBend(angle) {
  const track = state.profile.track;
  const value = Math.max(0, Math.min(140, Math.round(Number(angle) || 0)));
  state.metrics.romLive = value;
  state.metrics.romAdjust = value;
  state.metrics.rom = { ...(state.metrics.rom || {}), angle: value, date: TODAY, flow: 3 };
  state.metrics.history.bend = [...(state.metrics.history.bend || []), value].slice(-8);
  if (track === "knee" && value >= 90) earn("bend90");
  save();
  render();
}

function armScrollCue() {
  const cue = app.querySelector("[data-scroll-cue]");
  const feel = app.querySelector("[data-feel]");
  const scroller = document.getElementById("scroll");
  if (!cue || !feel || !scroller) return;
  const update = () => {
    const box = feel.getBoundingClientRect();
    const root = scroller.getBoundingClientRect();
    const seen = box.top >= root.top + 4 && box.bottom <= root.bottom - 4;
    cue.hidden = seen;
    const dock = cue.closest(".dock-primary");
    if (dock) dock.hidden = seen;
  };
  cue.addEventListener("click", () => {
    const top = feel.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - 8;
    scroller.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  });
  scroller.addEventListener("scroll", update, { passive: true });
  scroller.querySelectorAll("img, video").forEach((media) => {
    media.addEventListener("load", update);
    media.addEventListener("loadeddata", update);
  });
  if (window.ResizeObserver) {
    const observer = new ResizeObserver(update);
    observer.observe(scroller);
    observer.observe(feel);
  }
  update();
  requestAnimationFrame(update);
}

function paintRom(video) {
  const overlay = video.parentElement?.querySelector(".rom-overlay");
  const node = overlay?.querySelector("[data-live-angle]");
  if (!overlay || !node) return;
  const samples = romTrack.samples;
  const span = Math.max(0, (video.currentTime || 0) % romTrack.duration);
  const index = Math.min(samples.length - 1, Math.round(span * romTrack.fps));
  const [angle, hx, hy, kx, ky, ax, ay] = samples[index];
  const shown = Math.round(angle);
  node.textContent = `${shown}°`;
  const thigh = overlay.querySelector("[data-thigh]");
  const shin = overlay.querySelector("[data-shin]");
  thigh?.setAttribute("x1", hx);
  thigh?.setAttribute("y1", hy);
  thigh?.setAttribute("x2", kx);
  thigh?.setAttribute("y2", ky);
  shin?.setAttribute("x1", kx);
  shin?.setAttribute("y1", ky);
  shin?.setAttribute("x2", ax);
  shin?.setAttribute("y2", ay);
  overlay.querySelector("[data-hip]")?.setAttribute("cx", hx);
  overlay.querySelector("[data-hip]")?.setAttribute("cy", hy);
  overlay.querySelector("[data-knee]")?.setAttribute("cx", kx);
  overlay.querySelector("[data-knee]")?.setAttribute("cy", ky);
  overlay.querySelector("[data-ankle]")?.setAttribute("cx", ax);
  overlay.querySelector("[data-ankle]")?.setAttribute("cy", ay);
  state.metrics.romLive = shown;
}

function armRomClip() {
  app.querySelectorAll("img.rom-poster").forEach((img) => {
    const hide = () => { img.hidden = true; };
    img.addEventListener("error", hide);
    if (img.complete && img.naturalWidth === 0) hide();
  });
  app.querySelectorAll("video.rom-clip").forEach((video) => {
    const missing = () => video.classList.add("is-missing");
    video.addEventListener("error", missing);
    if (video.error) missing();
    const draw = () => paintRom(video);
    if (reduceMotion) {
      video.pause();
      const park = () => {
        video.currentTime = romTrack.hold;
        draw();
      };
      if (video.readyState >= 1) park();
      else video.addEventListener("loadeddata", park, { once: true });
      return;
    }
    const follow = () => {
      draw();
      if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(follow);
    };
    if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(follow);
    else {
      const loop = () => {
        draw();
        if (!video.paused && !video.ended) requestAnimationFrame(loop);
      };
      video.addEventListener("play", () => requestAnimationFrame(loop));
      requestAnimationFrame(loop);
    }
    video.addEventListener("seeked", draw);
    video.play()?.catch(() => {});
  });
}

function armLiveAngle() {
  if (app.querySelector("video.rom-clip")) return;
  const node = app.querySelector("[data-live-angle]");
  if (!node || !state.profile) return;
  const end = sampleBend(state.profile.track);
  if (reduceMotion) {
    node.textContent = String(end);
    state.metrics.romLive = end;
    return;
  }
  const start = 36;
  const started = performance.now();
  const tick = (now) => {
    if (!node.isConnected) return;
    const progress = Math.min(1, (now - started) / 1400);
    const value = Math.round(start + (end - start) * progress);
    node.textContent = String(value);
    state.metrics.romLive = value;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function armBendDrag() {
  const svg = app.querySelector("[data-bend-svg]");
  if (!svg) return;
  const kneeX = 150;
  const kneeY = 96;
  const len = 118;
  const shin = svg.querySelector("[data-shin]");
  const foot = svg.querySelector("[data-foot]");
  const readout = app.querySelector("[data-bend-readout]");
  const apply = (angle) => {
    const deg = Math.max(0, Math.min(140, Math.round(angle)));
    state.metrics.romAdjust = deg;
    const rad = (deg * Math.PI) / 180;
    const x2 = (kneeX + Math.cos(rad) * len).toFixed(1);
    const y2 = (kneeY + Math.sin(rad) * len).toFixed(1);
    shin?.setAttribute("x2", x2);
    shin?.setAttribute("y2", y2);
    foot?.setAttribute("cx", x2);
    foot?.setAttribute("cy", y2);
    if (readout) readout.textContent = String(deg);
  };
  const fromEvent = (event) => {
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const local = point.matrixTransform(ctm.inverse());
    return (Math.atan2(local.y - kneeY, local.x - kneeX) * 180) / Math.PI;
  };
  svg.addEventListener("pointerdown", (event) => {
    svg.setPointerCapture(event.pointerId);
    const deg = fromEvent(event);
    if (deg != null) apply(deg);
  });
  svg.addEventListener("pointermove", (event) => {
    if (!svg.hasPointerCapture(event.pointerId)) return;
    const deg = fromEvent(event);
    if (deg != null) apply(deg);
  });
  const finish = () => save();
  svg.addEventListener("pointerup", finish);
  svg.addEventListener("pointercancel", finish);
}

const actions = {
  speak() {
    const synth = window.speechSynthesis;
    if (!synth) {
      toast(L("Read aloud is not available in this browser.", "Leer en voz alta no está disponible en este navegador."));
      return;
    }
    if (synth.speaking || synth.pending || state.speaking) {
      synth.cancel();
      state.speaking = false;
      render();
      return;
    }
    const utter = new SpeechSynthesisUtterance(state.speakText || document.title);
    utter.lang = state.lang === "es" ? "es-MX" : "en-US";
    utter.rate = 0.95;
    utter.onend = () => {
      state.speaking = false;
      render();
    };
    state.speaking = true;
    synth.speak(utter);
    render();
  },
  text(el) {
    const sizes = [18, 21, 24];
    const dir = Number(el.dataset.dir);
    const index = Math.min(sizes.length - 1, Math.max(0, sizes.indexOf(state.text) + dir));
    if (sizes[index] === state.text) {
      toast(dir > 0
        ? L("Text is as large as it gets.", "El texto ya está en el tamaño más grande.")
        : L("This is the smaller text size. It stays easy to read.", "Este es el tamaño más pequeño. Sigue siendo fácil de leer."));
      return;
    }
    state.text = sizes[index];
    save();
    render();
  },
  lang() {
    state.lang = state.lang === "es" ? "en" : "es";
    save();
    render();
  },
  "open-maria"() {
    loadSample();
    navigate("/today");
  },
  "demo-start"() {
    loadSample();
    state.demo = { i: 0, auto: false };
    save();
    armDemo();
    navigate(DEMO[0].href);
  },
  "demo-next"() { stepDemo(1); },
  "demo-prev"() { stepDemo(-1); },
  "demo-exit"() {
    state.demo = null;
    save();
    armDemo();
    navigate("/welcome");
  },
  "demo-auto"() {
    if (!state.demo) return;
    state.demo.auto = !state.demo.auto;
    save();
    armDemo();
    render();
  },
  "close-badge"() {
    state.metrics.justEarned = "";
    save();
    render();
  },
  "setup-flag"(el) {
    ensureSetup();
    if (el.dataset.key === "helper") state.setup.helper = el.dataset.value === "yes";
    else state.setup[el.dataset.key] = el.dataset.value;
    save();
    if (el.dataset.href) navigate(el.dataset.href);
    else render();
  },
  "setup-date"(el) {
    ensureSetup();
    state.setup.when = el.dataset.when;
    state.setup.date = el.dataset.date;
    save();
    render();
  },
  "use-sample-name"() {
    ensureSetup();
    state.setup.patientName = "Maria Gonzalez";
    if (state.setup.helper && !state.setup.helperName) state.setup.helperName = "Luis Gonzalez";
    save();
    navigate("/setup/track");
  },
  "setup-name-next"() {
    ensureSetup();
    state.setup.patientName = readField("patientName").trim();
    state.setup.helperName = readField("helperName").trim();
    if (!state.setup.patientName) {
      toast(L("Please add a name, or use the sample name.", "Agregue un nombre, o use el nombre de muestra."));
      return;
    }
    save();
    navigate("/setup/track");
  },
  "setup-require"(el) {
    ensureSetup();
    const picked = readField("setupDate");
    if (picked) {
      state.setup.date = picked;
      state.setup.when = picked > TODAY ? "future" : "past";
    }
    if (!state.setup[el.dataset.key]) {
      toast(L("Please choose one to continue.", "Elija una opción para seguir."));
      return;
    }
    save();
    navigate(el.dataset.href);
  },
  "setup-finish"() {
    ensureSetup();
    const setup = state.setup;
    if (!setup.patientName || !setup.track || !setup.date) {
      toast(L("Please finish the earlier steps.", "Termine los pasos anteriores."));
      navigate("/setup/hello");
      return;
    }
    state.profile = {
      source: "setup",
      patientName: setup.patientName.trim(),
      helper: Boolean(setup.helper),
      helperName: setup.helperName || "",
      track: setup.track,
      side: setup.side || "left",
      when: setup.track === "pain" ? "past" : setup.when || "past",
      date: setup.date,
      consent: true,
    };
    state.metrics = freshMetrics();
    if (state.profile.when === "future") state.metrics.stepsToday = 1800;
    save();
    navigate("/setup/done");
  },
  pick(el) {
    const key = el.dataset.key;
    let value = el.dataset.value;
    if (["fever", "calf", "wound", "worse"].includes(key)) value = value === "yes";
    else if (key === "pain" || key.startsWith("q")) value = Number(value);
    state.metrics.draft = state.metrics.draft || {};
    state.metrics.draft[key] = value;
    save();
    render();
  },
  "checkin-next"(el) {
    const key = el.dataset.key;
    const draft = state.metrics.draft || {};
    if (draft[key] === undefined) {
      toast(L("Please choose one.", "Elija una opción."));
      return;
    }
    const danger = ["fever", "calf", "wound", "worse"].includes(key) && draft[key] === true;
    if (danger) {
      state.metrics.checkin = { ...(state.metrics.checkin || {}), [key]: true, date: TODAY, partial: true };
      save();
      const after = el.dataset.finish ? "/checkin/done" : `/checkin/${el.dataset.after}`;
      navigate(`/alert?next=${encodeURIComponent(after)}`);
      return;
    }
    if (el.dataset.finish) finishCheckin();
    else navigate(`/checkin/${el.dataset.after}`);
  },
  "question-next"(el) {
    const n = Number(el.dataset.n);
    const draft = state.metrics.draft || {};
    if (draft[`q${n}`] === undefined) {
      toast(L("Please choose one.", "Elija una opción."));
      return;
    }
    const set = QUESTIONS[state.profile.track] || QUESTIONS.knee;
    if (el.dataset.last === "1") {
      let sum = 0;
      for (let i = 1; i <= set.length; i += 1) sum += Number(draft[`q${i}`] || 0);
      const score = Math.round((sum / (set.length * 4)) * 100);
      if (state.metrics.questions?.score != null) state.metrics.lastScore = state.metrics.questions.score;
      state.metrics.questions = { score, date: TODAY };
      earn("questions");
      save();
      navigate("/questions/result");
      return;
    }
    save();
    navigate(`/questions/${n + 1}`);
  },
  play(el) {
    const video = app.querySelector(`video.ex-clip[data-id="${el.dataset.id}"]`);
    if (video) {
      if (video.paused) video.play();
      else video.pause();
      syncVidToggle(video);
      return;
    }
    state.metrics.playing = state.metrics.playing === el.dataset.id ? "" : el.dataset.id;
    render();
  },
  rep(el) {
    const item = exerciseList(state.profile).find((entry) => entry.id === el.dataset.id);
    if (!item) return;
    const sets = item.kind === "once" ? 1 : 2;
    const cur = { reps: 0, set: 1, done: false, feedback: null, ...(state.metrics.exercises[item.id] || {}) };
    if (item.kind === "once") {
      cur.reps = 1;
      cur.set = 1;
    } else {
      cur.reps = (cur.reps || 0) + 1;
      if (cur.reps >= item.target && (cur.set || 1) < sets) {
        cur.set = (cur.set || 1) + 1;
        cur.reps = 0;
      }
    }
    state.metrics.exercises[item.id] = cur;
    save();
    render();
  },
  feedback(el) {
    const list = exerciseList(state.profile);
    const cur = { reps: 0, done: false, feedback: null, ...(state.metrics.exercises[el.dataset.id] || {}) };
    cur.done = true;
    cur.feedback = el.dataset.value;
    state.metrics.exercises[el.dataset.id] = cur;
    if (list.every((item) => state.metrics.exercises[item.id]?.done)) earn("alldone");
    save();
    const next = list.find((item) => !state.metrics.exercises[item.id]?.done);
    navigate(next ? `/exercise/${next.id}` : "/move");
  },
  "rom-flow"(el) {
    const flow = Number(el.dataset.flow);
    if (flow === 2) {
      state.metrics.romAdjust = state.profile.track === "knee" ? (state.metrics.rom?.angle || 87) : (state.metrics.rom?.angle || 90);
    }
    state.metrics.rom = { ...(state.metrics.rom || {}), flow };
    save();
    render();
  },
  "rom-save"() {
    const reading = state.profile.track === "knee" ? (state.metrics.rom?.angle || 87) : sampleBend(state.profile.track);
    state.metrics.romLive = reading;
    state.metrics.romAdjust = reading;
    state.metrics.rom = { ...(state.metrics.rom || {}), angle: reading, date: TODAY, flow: 0 };
    const history = state.metrics.history.bend || [];
    if (history.at(-1) !== reading) state.metrics.history.bend = [...history, reading].slice(-14);
    state.metrics.romSaved = true;
    if (state.profile.track === "knee" && reading >= 90) earn("bend90");
    save();
    render();
  },
  "rom-retake"() {
    state.metrics.romSaved = false;
    save();
    const note = app.querySelector(".saved-note");
    if (note) note.remove();
    const video = app.querySelector("video.rom-clip");
    if (video) {
      video.currentTime = 0;
      const play = video.play();
      if (play?.catch) play.catch(() => {});
    }
  },
  span(el) {
    state.metrics.chartSpan = el.dataset.value;
    save();
    render();
  },
  surgeon(el) {
    state.metrics.surgeonFilter = el.dataset.value;
    save();
    render();
  },
  "checkin-sheet"() {
    const draft = { ...(state.metrics.draft || {}) };
    if (draft.pain === undefined) draft.pain = Number(app.querySelector("[data-field='painSlider']")?.value ?? 3);
    state.metrics.draft = draft;
    const needed = ["swell", "sleep", "meds", "fever", "calf", "wound", "worse"];
    if (needed.some((key) => draft[key] === undefined)) {
      toast(L("Please answer each row.", "Responda cada fila."));
      return;
    }
    if (["fever", "calf", "wound", "worse"].some((key) => draft[key] === true)) {
      state.metrics.checkin = { ...draft, date: TODAY, partial: true };
      save();
      navigate("/alert?next=/checkin/done");
      return;
    }
    finishCheckin();
  },
  "rom-use"() {
    const live = Number(app.querySelector("[data-live-angle]")?.textContent);
    commitBend(live || state.metrics.romLive || sampleBend(state.profile.track));
  },
  "rom-keep"() {
    commitBend(state.metrics.romAdjust ?? state.metrics.romLive ?? state.metrics.rom?.angle ?? 90);
  },
  "rom-nudge"(el) {
    const dir = Number(el.dataset.dir) || 0;
    const cur = state.metrics.romAdjust ?? state.metrics.rom?.angle ?? 90;
    state.metrics.romAdjust = Math.max(0, Math.min(140, cur + dir));
    save();
    render();
  },
  "rom-capture"() {
    commitBend(sampleBend(state.profile.track));
  },
  quick(el) {
    const map = {
      finished: { en: "I finished my exercises.", es: "Terminé mis ejercicios." },
      sore: { en: "I feel sore today.", es: "Hoy me siento adolorido." },
      question: { en: "I have a question when you have a moment.", es: "Tengo una pregunta cuando tenga un momento." },
    };
    pushMessage("me", map[el.dataset.text] || map.question);
    pushMessage("pt", {
      en: "Thank you. I can see it here. This sample stays on the phone.",
      es: "Gracias. Ya lo veo aquí. Esta muestra se queda en el teléfono.",
    });
    save();
    render();
  },
  photo() {
    state.metrics.photo = true;
    save();
    render();
  },
  send() {
    const text = (state.metrics.draftMessage || readField("draftMessage") || "").trim();
    if (!text) {
      toast(L("Write a note, or tap one of the ready messages.", "Escriba una nota, o toque uno de los mensajes listos."));
      return;
    }
    pushMessage("me", { en: text, es: text });
    pushMessage("pt", {
      en: "I got your note. A real clinic would reply here. This one stays on the phone.",
      es: "Recibí su nota. Una clínica real respondería aquí. Esta se queda en el teléfono.",
    });
    state.metrics.draftMessage = "";
    save();
    render();
  },
  "end-call"() {
    clearCall();
    state.callPhase = "ended";
    render();
  },
  visit(el) {
    state.metrics.visit = el.dataset.phase;
    save();
    render();
  },
  med(el) {
    state.metrics.meds[el.dataset.id] = !state.metrics.meds[el.dataset.id];
    save();
    render();
  },
  prep(el) {
    state.metrics.prep[el.dataset.id] = !state.metrics.prep[el.dataset.id];
    save();
    render();
  },
  filter(el) {
    state.metrics.clinicFilter = el.dataset.value;
    save();
    render();
  },
  called(el) {
    state.metrics.clinicAck[el.dataset.id] = true;
    if (el.dataset.id === "phone") {
      pushMessage("pt", {
        en: "I called and left this on the sample desk.",
        es: "Llamé y lo dejé en el escritorio de muestra.",
      });
    }
    save();
    render();
  },
  note(el) {
    state.metrics.clinicNote[el.dataset.id] = true;
    if (el.dataset.id === "phone") {
      pushMessage("pt", {
        en: "Note from your therapist: keep today's plan short, and call if a warning sign shows up.",
        es: "Nota de su terapeuta: deje el plan de hoy corto, y llame si aparece una señal de alerta.",
      });
    }
    save();
    render();
  },
  noted() {
    state.metrics.summaryNoted = true;
    save();
    render();
  },
};

function pushMessage(from, text) {
  state.metrics.messages = state.metrics.messages || [];
  state.metrics.messages.push({
    from,
    text,
    time: L("Now", "Ahora"),
  });
}

function onClick(event) {
  const el = event.target.closest("button, [data-href], [data-scroll]");
  if (!el || !document.querySelector(".page")?.contains(el)) return;
  if (el.dataset.scroll) {
    const target = document.querySelector(el.dataset.scroll);
    target?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    document.querySelectorAll(".is-target").forEach((node) => node.classList.remove("is-target"));
    target?.classList.add("is-target");
    el.closest("nav")?.querySelectorAll("button").forEach((button) => button.removeAttribute("aria-current"));
    if (el.closest(".landing-nav")) el.setAttribute("aria-current", "true");
    return;
  }
  if (el.dataset.action) {
    actions[el.dataset.action]?.(el);
    return;
  }
  if (el.dataset.href) navigate(el.dataset.href);
}

function onInput(event) {
  const el = event.target.closest("[data-field]");
  if (!el) return;
  if (el.dataset.field === "patientName" || el.dataset.field === "helperName") {
    ensureSetup();
    state.setup[el.dataset.field] = el.value;
  } else if (el.dataset.field === "draftMessage") {
    state.metrics.draftMessage = el.value;
  } else if (el.dataset.field === "painSlider") {
    state.metrics.draft = state.metrics.draft || {};
    state.metrics.draft.pain = Number(el.value);
    const readout = app.querySelector("[data-pain-readout]");
    if (readout) readout.textContent = el.value;
    save();
    return;
  } else if (el.dataset.field === "setupDate") {
    ensureSetup();
    state.setup.date = el.value;
    state.setup.when = el.value > TODAY ? "future" : "past";
  }
  save();
}

let tourRunning = false;

function tourSleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function ensureTourChrome() {
  let cursor = document.getElementById("tour-cursor");
  let caption = document.getElementById("tour-caption");
  if (!cursor) {
    cursor = document.createElement("div");
    cursor.id = "tour-cursor";
    document.body.appendChild(cursor);
  }
  if (!caption) {
    caption = document.createElement("p");
    caption.id = "tour-caption";
    document.body.appendChild(caption);
  }
  return { cursor, caption };
}

async function glide(selector) {
  const el = document.querySelector(selector);
  const { cursor } = ensureTourChrome();
  if (!el) {
    console.warn("tour missed", selector);
    return false;
  }
  el.scrollIntoView({ block: "center", behavior: "smooth" });
  await tourSleep(450);
  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2 - 20;
  const y = rect.top + rect.height / 2 - 20;
  cursor.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
  await tourSleep(800);
  await tourSleep(1000);
  cursor.classList.add("is-press");
  await tourSleep(260);
  el.click();
  await tourSleep(280);
  cursor.classList.remove("is-press");
  return true;
}

async function runWalk() {
  const { cursor, caption } = ensureTourChrome();
  cursor.style.transform = "translate(70px, 140px)";
  loadSample();
  if (!location.hash.startsWith("#/today")) location.hash = "#/today?walk=1";
  else render();
  const say = async (text, ms) => {
    caption.textContent = text;
    await tourSleep(ms);
  };
  await say("Today", 2800);
  caption.textContent = "Daily check-in";
  await glide('[data-tour="checkin"]');
  await say("Daily check-in", 3000);
  caption.textContent = "Today";
  await glide('nav.nav button[data-href="/today"]');
  await say("Today", 1600);
  caption.textContent = "Knee bend";
  await glide('[data-tour="bend"]');
  await say("Knee bend", 6000);
  caption.textContent = "Adjust it yourself";
  await glide('[data-tour="adjust"]');
  await say("Adjust it yourself", 2200);
  await glide('[data-action="rom-nudge"][data-dir="1"]');
  await say("Adjust it yourself", 1800);
  caption.textContent = "Exercises";
  await glide('nav.nav button[data-href="/move"]');
  await say("Exercises", 1600);
  await glide('button[data-href="/exercise/quad-sets"]');
  await say("Exercises", 4500);
  caption.textContent = "Progress";
  await glide('nav.nav button[data-href="/track"]');
  await say("Progress", 3500);
  caption.textContent = "Care team";
  await glide('nav.nav button[data-href="/messages"]');
  await say("Care team", 3500);
  caption.textContent = "Patients";
  location.hash = "#/clinic?walk=1";
  await tourSleep(900);
  await say("Patients", 3500);
  caption.textContent = "Patient detail";
  await glide('[data-tour="patient"]');
  await say("Patient detail", 3500);
  caption.remove();
  cursor.remove();
}

function armWalk() {
  if (tourRunning || !location.hash.includes("walk=1")) return;
  tourRunning = true;
  runWalk();
}

hydrate();
document.addEventListener("click", onClick);
window.matchMedia("(min-width: 1100px)").addEventListener("change", () => {
  if (routeOf().name === "welcome") render();
});
app.addEventListener("input", onInput);
app.addEventListener("change", onInput);
window.addEventListener("hashchange", render);
if (!location.hash) location.hash = "/welcome";
else render();
