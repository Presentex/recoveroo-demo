import { DEMO, QUESTIONS, dailyTipId, exerciseList, t } from "./content.js";
import { celebrateCopy, renderRoute, routeOf, shareText } from "./screens.js";
import {
  L, TODAY, earn, esc, freshMetrics, hydrate, loadSample, save, state,
} from "./store.js";
import { icon } from "./ui.js";

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

function tools(route, clinic) {
  const home = route.name === "welcome" ? "/welcome" : clinic ? "/clinic" : "/today";
  const sizes = [18, 21, 24];
  const atMin = state.text === sizes[0];
  const atMax = state.text === sizes[sizes.length - 1];
  return `<div class="tools">
    <button type="button" class="brand" data-href="${home}">
      <img src="./favicon.svg" width="40" height="40" alt="">
      <span>Recoveroo</span>
    </button>
    <div class="tool-row">
      <button type="button" class="tool" data-action="speak">${icon("speaker")}<span>${state.speaking ? L("Stop", "Parar") : L("Read", "Leer")}</span></button>
      <button type="button" class="tool" data-action="text" data-dir="-1" aria-disabled="${atMin}" aria-label="${L("Smaller text", "Texto más pequeño")}">A-</button>
      <button type="button" class="tool" data-action="text" data-dir="1" aria-disabled="${atMax}" aria-label="${L("Larger text", "Texto más grande")}">A+</button>
      <button type="button" class="tool" data-action="lang">${state.lang === "es" ? "English" : "Español"}</button>
    </div>
  </div>`;
}

function patientNav(active) {
  const items = [
    ["/today", "home", L("Today", "Hoy"), "today"],
    ["/move", "move", L("Move", "Mover"), "move"],
    ["/track", "chart", L("Progress", "Avance"), "track"],
    ["/more", "more", L("More", "Más"), "more"],
  ];
  return `<nav class="nav" aria-label="${L("Patient", "Paciente")}">${items.map(([href, name, label, id]) => `<button type="button" data-href="${href}" ${active === id ? 'aria-current="page"' : ""}>${icon(name)}<span>${label}</span></button>`).join("")}</nav>`;
}

function clinicNav(active) {
  const items = [
    ["/clinic", "person", L("Patients", "Pacientes"), "patients"],
    ["/summary", "chart", L("Surgeon", "Cirujano"), "summary"],
    ["/today", "phone", L("Phone", "Teléfono"), "phone"],
  ];
  return `<nav class="nav" aria-label="${L("Care team", "Equipo")}">${items.map(([href, name, label, id]) => `<button type="button" data-href="${href}" ${active === id ? 'aria-current="page"' : ""}>${icon(name)}<span>${label}</span></button>`).join("")}</nav>`;
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
    const colors = ["#F07862", "#13294B", "#F6D36B", "#8FD0A6", "#FFFFFF"];
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
    : L("At-home recovery on the phone they already have. A therapist watches with them.", "Recuperación en casa, en el teléfono que ya tienen. Un terapeuta los acompaña.");
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
  const view = renderRoute(route);
  state.speakText = view.speak || "";
  const clinic = view.nav === "clinic";
  document.body.classList.toggle("clinic", clinic);
  document.documentElement.lang = state.lang === "es" ? "es" : "en";
  document.documentElement.style.setProperty("--text", `${state.text}px`);
  asideCopy(clinic);
  app.innerHTML = `<div class="screen">
    ${tools(route, clinic)}
    <div class="scroll" id="scroll">${view.html}</div>
    ${view.footer ? `<div class="dock-primary">${view.footer}</div>` : ""}
    ${state.demo ? demoDock() : view.nav === "patient" ? patientNav(view.active) : view.nav === "clinic" ? clinicNav(view.active) : ""}
    ${state.metrics?.justEarned ? celebrate() : ""}
    ${state.toast ? `<p class="toast" role="status">${esc(state.toast)}</p>` : ""}
  </div>`;
  const scroller = document.getElementById("scroll");
  const hash = location.hash;
  if (scroller && hash !== lastHash) scroller.scrollTop = 0;
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
}

function readField(name) {
  const node = app.querySelector(`[data-field="${name}"]`);
  return node ? node.value : "";
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
    state.metrics.playing = state.metrics.playing === el.dataset.id ? "" : el.dataset.id;
    render();
  },
  rep(el) {
    const item = exerciseList(state.profile).find((entry) => entry.id === el.dataset.id);
    if (!item) return;
    const cur = { reps: 0, done: false, feedback: null, ...(state.metrics.exercises[item.id] || {}) };
    cur.reps = item.kind === "once" ? 1 : Math.min(item.target, (cur.reps || 0) + 1);
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
    state.metrics.rom = { ...(state.metrics.rom || {}), flow: Number(el.dataset.flow) };
    save();
    render();
  },
  "rom-capture"() {
    const track = state.profile.track;
    const angle = track === "shoulder" ? 96 : track === "hip" ? 86 : track === "pain" ? 70 : 92;
    state.metrics.romLive = angle;
    state.metrics.rom = { ...(state.metrics.rom || {}), angle, date: TODAY, flow: 3 };
    state.metrics.history.bend = [...(state.metrics.history.bend || []), angle].slice(-8);
    if (track === "knee" && angle >= 90) earn("bend90");
    save();
    render();
  },
  "copy-share"() {
    const text = shareText();
    const done = () => toast(L("Copied. You can paste it to your family.", "Copiado. Puede pegarlo para su familia."));
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
    else done();
  },
  "native-share"() {
    const text = shareText();
    if (navigator.share) {
      navigator.share({ title: "Recoveroo", text }).catch(() => {});
      return;
    }
    actions["copy-share"]();
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
  const el = event.target.closest("button, [data-href]");
  if (!el || !app.contains(el)) return;
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
  } else if (el.dataset.field === "setupDate") {
    ensureSetup();
    state.setup.date = el.value;
    state.setup.when = el.value > TODAY ? "future" : "past";
  }
  save();
}

hydrate();
app.addEventListener("click", onClick);
app.addEventListener("input", onInput);
app.addEventListener("change", onInput);
window.addEventListener("hashchange", render);
if (!location.hash) location.hash = "/welcome";
else render();
