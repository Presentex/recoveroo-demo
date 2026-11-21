import {
  ARTICLES, CLINIC, MILESTONES, QUESTIONS, ANSWERS, TEAM,
  articleById, dailyTipId, exerciseList, t,
} from "./content.js";
import {
  L, TODAY, bendWord, dayCount, esc, expectedBend, isoShift,
  levelLabel, phaseLine, phaseOf, phoneLevel, sideLine, state, trackNoun, weekdayLabel,
} from "./store.js";
import { backLink, bendGuide, btn, choice, figure, h, hasVideo, icon, ring } from "./ui.js";

function num(n) {
  return Number(n || 0).toLocaleString(state.lang === "es" ? "es-MX" : "en-US");
}

function listExercises() {
  return exerciseList(state.profile);
}

function exState(id) {
  return state.metrics.exercises?.[id] || { done: false, reps: 0, feedback: null };
}

function findEx(id) {
  return listExercises().find((item) => item.id === id);
}

function exercisesDone() {
  return listExercises().every((item) => exState(item.id).done);
}

function exerciseProgress() {
  const list = listExercises();
  const done = list.filter((item) => exState(item.id).done).length;
  return { done, total: list.length };
}

function checkinDone() {
  return state.metrics.checkin?.date === TODAY && !state.metrics.checkin.partial;
}

function tipDone() {
  return Boolean(state.metrics.tipSeen?.[dailyTipId(state.profile)]);
}

function flagged(source) {
  const c = source || state.metrics.checkin;
  return Boolean(c && (c.fever || c.calf || c.wound || c.worse));
}

function statusSentence() {
  const level = phoneLevel(state.profile, state.metrics);
  const phase = phaseOf(state.profile);
  if (level === "high") {
    return L(
      "A warning sign is on your check-in. Call your surgeon now. Do not wait for a message.",
      "Hay una señal de alerta en su registro. Llame ahora a su cirujano. No espere un mensaje.",
    );
  }
  if (level === "watch") {
    return L(
      "Your therapist would look at this today. You are not in the emergency screen.",
      "Su terapeuta revisaría esto hoy. Esta no es la pantalla de emergencia.",
    );
  }
  if (phase === "preop") {
    return L(
      "You are getting ready. The sample plan is about the home, the ride, and easy movement.",
      "Se está preparando. El plan de muestra trata de la casa, el transporte y el movimiento suave.",
    );
  }
  if (!state.metrics.history.pain.length && !state.metrics.checkin) {
    return L(
      "You are at the start. Today's check-in lets your therapist see you.",
      "Está al inicio. El registro de hoy permite que su terapeuta lo vea.",
    );
  }
  if (phase === "pain") {
    return L(
      "You are on track with the pain plan. Keep the short walks and tell your therapist if pain jumps.",
      "Va bien con el plan para el dolor. Siga con las caminatas cortas y avise si el dolor sube de golpe.",
    );
  }
  return L(
    "You are on track with the sample plan. Recent pain is easing, and your bend is close to the usual path for this week.",
    "Va bien con el plan de muestra. El dolor reciente va bajando y la flexión está cerca del camino habitual de esta semana.",
  );
}

function prepItems() {
  return [
    ["home", L("Clear a path and pick a firm chair", "Despeje un camino y elija una silla firme")],
    ["ride", L("Plan the ride home", "Organice el transporte a casa")],
    ["bag", L("Pack a small bag and charger", "Prepare una bolsa pequeña y el cargador")],
    ["questions", L("Write questions for your surgeon", "Escriba preguntas para su cirujano")],
  ];
}

function prepDone() {
  return prepItems().every(([id]) => state.metrics.prep?.[id]);
}

function nextTask() {
  if (phoneLevel(state.profile, state.metrics) === "high") {
    return { href: "/alert", label: L("See what to do now", "Ver qué hacer ahora") };
  }
  if (phaseOf(state.profile) === "preop" && !prepDone()) {
    return { href: "/prep", label: L("Continue getting ready", "Seguir la preparación") };
  }
  if (!exercisesDone()) {
    return { href: "/move", label: L("Start exercises", "Empezar ejercicios") };
  }
  if (!checkinDone()) {
    return { href: "/checkin/pain", label: L("Start check-in", "Empezar el registro") };
  }
  if (!tipDone()) {
    return { href: `/learn/${dailyTipId(state.profile)}`, label: L("Read today's tip", "Leer el consejo de hoy") };
  }
  return { href: "/track", label: L("See your progress", "Ver su avance") };
}

function helperBanner() {
  if (!state.profile?.helper) return "";
  const who = esc(state.profile.helperName || L("A family member", "Un familiar"));
  const patient = esc(state.profile.patientName || "");
  return `<p class="banner">${L(`${who} is helping ${patient}. Big buttons are ready for either of you.`, `${who} está ayudando a ${patient}. Los botones grandes sirven para los dos.`)}</p>`;
}

function checkinFlow() {
  const phase = phaseOf(state.profile);
  if (phase === "preop") return ["pain", "sleep", "fever", "meds"];
  const wound = state.profile.track === "pain" ? "worse" : "wound";
  return ["pain", "swell", "sleep", "fever", "calf", wound, "meds", "strong"];
}

function stepIndex(id) {
  return checkinFlow().indexOf(id);
}

function stepAfter(id) {
  const flow = checkinFlow();
  const i = flow.indexOf(id);
  if (i < 0 || i === flow.length - 1) return "finish";
  return flow[i + 1];
}

export function routeOf() {
  const raw = (location.hash || "#/welcome").replace(/^#/, "");
  const [path, query = ""] = raw.split("?");
  const parts = path.split("/").filter(Boolean);
  return {
    name: parts[0] || "welcome",
    id: parts[1] || "",
    rest: parts.slice(2),
    next: new URLSearchParams(query).get("next") || "",
    parts,
  };
}

function view(html, speak, extra = {}) {
  return {
    html,
    speak,
    footer: extra.footer || "",
    nav: extra.nav ?? "patient",
    active: extra.active || "",
  };
}

function welcome() {
  const speak = L(
    "Recoveroo. Healing at home with your phone. A physical therapist and therapy assistants review your progress and reach out when something is off. Open the patient phone, play the guided tour, or open the care team desk.",
    "Recoveroo. Recuperación en casa con su teléfono. Un fisioterapeuta y asistentes revisan su avance y lo contactan cuando algo no va bien. Abra el teléfono del paciente, el recorrido, o el escritorio del equipo.",
  );
  return view(`
    <section class="hero-card hero-blue bleed">
      <h1>${L("Healing at home, with a person watching.", "Recuperarse en casa, con alguien pendiente.")}</h1>
      <p>${L(
        "Hip, knee, and shoulder replacement, plus muscle and joint pain without surgery. You only need your phone.",
        "Reemplazo de cadera, rodilla y hombro, y dolor muscular y articular sin cirugía. Solo necesita su teléfono.",
      )}</p>
    </section>
    <div class="stack">
      ${btn(L("Open Maria's phone", "Abrir el teléfono de Maria"), 'data-action="open-maria"')}
      ${btn(L("Play the guided tour", "Ver el recorrido guiado"), 'data-action="demo-start"', "navy")}
      ${btn(L("Open the care team desk", "Abrir el escritorio del equipo"), 'data-href="/clinic"', "secondary")}
      ${btn(L("Set up someone new", "Preparar a otra persona"), 'data-href="/setup/hello"', "secondary")}
    </div>
    <p class="fine">${L(
      "Fictional sample. Not a real clinic and not medical advice. The people on this phone are made up.",
      "Muestra ficticia. No es una clínica real ni un consejo médico. Las personas de este teléfono son inventadas.",
    )}</p>
  `, speak, { nav: "none" });
}

function setupProgress(n, total) {
  return `<p class="progress-label">${L(`Step ${n} of ${total}`, `Paso ${n} de ${total}`)}</p><div class="bar" aria-hidden="true"><span style="width:${Math.round((n / total) * 100)}%"></span></div>`;
}

function setup() {
  const step = routeOf().id || "hello";
  const s = state.setup || {};
  const total = 7;
  if (step === "hello") {
    return view(`
      ${setupProgress(1, total)}
      ${h(L("Welcome", "Bienvenida"), L("We will set this up in a few big steps.", "Lo prepararemos en unos pasos grandes."), L("You can do it yourself, or a family member can tap for you.", "Puede hacerlo usted, o un familiar puede tocar la pantalla por usted."))}
      <div class="stack">
        ${choice(L("I am the patient", "Yo soy el paciente"), 'data-action="setup-flag" data-key="helper" data-value="no" data-href="/setup/name"', s.helper === false)}
        ${choice(L("I am helping a family member", "Estoy ayudando a un familiar"), 'data-action="setup-flag" data-key="helper" data-value="yes" data-href="/setup/name"', s.helper === true)}
      </div>
    `, L("Setup welcome. Choose if you are the patient or a family member helping.", "Inicio. Elija si usted es el paciente o un familiar que ayuda."), {
      nav: "none",
      footer: btn(L("Continue", "Seguir"), 'data-href="/setup/name"'),
    });
  }
  if (step === "name") {
    const helper = Boolean(s.helper);
    return view(`
      ${setupProgress(2, total)}
      ${backLink("/setup/hello", L("Back", "Atrás"))}
      ${h(L("Name", "Nombre"), helper ? L("Who are you helping?", "¿A quién ayuda?") : L("What is your name?", "¿Cómo se llama?"), L("This sample stays on the phone.", "Esta muestra se queda en el teléfono."))}
      <label class="field">${helper ? L("Patient's name", "Nombre del paciente") : L("Your name", "Su nombre")}
        <input data-field="patientName" value="${esc(s.patientName || "")}" autocomplete="name">
      </label>
      ${helper ? `<label class="field">${L("Your name", "Su nombre")}<input data-field="helperName" value="${esc(s.helperName || "")}" autocomplete="name"></label>` : ""}
      <div class="stack top-gap">
        ${btn(L("Use the sample name, Maria Gonzalez", "Usar el nombre de muestra, Maria Gonzalez"), 'data-action="use-sample-name"', "secondary")}
      </div>
    `, L("Enter a name, or use the sample name Maria Gonzalez.", "Escriba un nombre, o use el nombre de muestra Maria Gonzalez."), {
      nav: "none",
      footer: btn(L("Continue", "Seguir"), 'data-action="setup-name-next"'),
    });
  }
  if (step === "track") {
    const options = [
      ["knee", L("Knee replacement", "Reemplazo de rodilla")],
      ["hip", L("Hip replacement", "Reemplazo de cadera")],
      ["shoulder", L("Shoulder replacement", "Reemplazo de hombro")],
      ["pain", L("Muscle or joint pain, no surgery", "Dolor muscular o articular, sin cirugía")],
    ];
    return view(`
      ${setupProgress(3, total)}
      ${backLink("/setup/name", L("Back", "Atrás"))}
      ${h(L("Your plan", "Su plan"), L("What are you recovering from?", "¿De qué se está recuperando?"), "")}
      <div class="stack">${options.map(([id, label]) => choice(label, `data-action="setup-flag" data-key="track" data-value="${id}"`, s.track === id)).join("")}</div>
    `, L("Choose knee, hip, shoulder, or pain without surgery.", "Elija rodilla, cadera, hombro, o dolor sin cirugía."), {
      nav: "none",
      footer: btn(L("Continue", "Seguir"), 'data-action="setup-require" data-key="track" data-href="/setup/side"'),
    });
  }
  if (step === "side") {
    const pain = s.track === "pain";
    const options = pain
      ? [["knee", L("Knee", "Rodilla")], ["hip", L("Hip", "Cadera")], ["shoulder", L("Shoulder", "Hombro")], ["other", L("Another spot", "Otro lugar")]]
      : [["left", L("Left side", "Lado izquierdo")], ["right", L("Right side", "Lado derecho")], ["both", L("Both sides", "Ambos lados")]];
    return view(`
      ${setupProgress(4, total)}
      ${backLink("/setup/track", L("Back", "Atrás"))}
      ${h(L("Which side", "Qué lado"), pain ? L("Where does it hurt most?", "¿Dónde duele más?") : L("Which side is the surgery?", "¿De qué lado es la cirugía?"), "")}
      <div class="stack">${options.map(([id, label]) => choice(label, `data-action="setup-flag" data-key="side" data-value="${id}"`, s.side === id)).join("")}</div>
    `, pain ? L("Choose where it hurts most.", "Elija dónde duele más.") : L("Choose the side of surgery.", "Elija el lado de la cirugía."), {
      nav: "none",
      footer: btn(L("Continue", "Seguir"), 'data-action="setup-require" data-key="side" data-href="/setup/when"'),
    });
  }
  if (step === "when") {
    const pain = s.track === "pain";
    const past = [
      [L("About 1 week ago", "Hace cerca de 1 semana"), "past", isoShift(-7)],
      [L("About 3 weeks ago", "Hace cerca de 3 semanas"), "past", isoShift(-21)],
      [L("About 6 weeks ago", "Hace cerca de 6 semanas"), "past", isoShift(-42)],
    ];
    const future = [
      [L("Next week", "La próxima semana"), "future", isoShift(7)],
      [L("In about a month", "En cerca de un mes"), "future", isoShift(30)],
    ];
    const painOpts = [
      [L("A few days", "Unos días"), "past", isoShift(-4)],
      [L("A few weeks", "Unas semanas"), "past", isoShift(-21)],
      [L("A few months", "Unos meses"), "past", isoShift(-100)],
    ];
    const opts = pain ? painOpts : past;
    return view(`
      ${setupProgress(5, total)}
      ${backLink("/setup/side", L("Back", "Atrás"))}
      ${h(L("When", "Cuándo"), pain ? L("How long has it hurt?", "¿Hace cuánto duele?") : L("When was, or when is, the surgery?", "¿Cuándo fue, o cuándo será, la cirugía?"), L("A close answer is enough.", "Una respuesta aproximada basta."))}
      ${pain ? "" : `<p class="section-label">${L("Already happened", "Ya ocurrió")}</p>`}
      <div class="stack">${opts.map(([label, when, date]) => choice(label, `data-action="setup-date" data-when="${when}" data-date="${date}"`, s.date === date)).join("")}</div>
      ${pain ? "" : `<p class="section-label">${L("Still coming up", "Todavía falta")}</p><div class="stack">${future.map(([label, when, date]) => choice(label, `data-action="setup-date" data-when="${when}" data-date="${date}"`, s.date === date)).join("")}</div>`}
      <label class="field">${L("Or pick a date", "O elija una fecha")}
        <input type="date" data-field="setupDate" value="${esc(s.date || "")}">
      </label>
    `, L("Choose about when. You can also pick a date.", "Elija más o menos cuándo. También puede elegir una fecha."), {
      nav: "none",
      footer: btn(L("Continue", "Seguir"), 'data-action="setup-require" data-key="date" data-href="/setup/team"'),
    });
  }
  if (step === "team") {
    return view(`
      ${setupProgress(6, total)}
      ${backLink("/setup/when", L("Back", "Atrás"))}
      ${h(L("Your team", "Su equipo"), L("Meet the people who watch your progress.", "Conozca a quienes revisan su avance."), L("This is a sample team for the demo.", "Este es un equipo de muestra para la demo."))}
      ${teamCards()}
    `, L("Sarah Chen is the physical therapist. Jenna Ruiz assists. Dr. Anita Patel is the surgeon.", "Sarah Chen es la fisioterapeuta. Jenna Ruiz asiste. La Dra. Anita Patel es la cirujana."), {
      nav: "none",
      footer: btn(L("Continue", "Seguir"), 'data-href="/setup/consent"'),
    });
  }
  if (step === "consent") {
    return view(`
      ${setupProgress(7, total)}
      ${backLink("/setup/team", L("Back", "Atrás"))}
      ${h(L("Before you start", "Antes de empezar"), L("Please read this. It is short.", "Léalo, por favor. Es corto."), "")}
      <ul class="plain">
        <li>${L("Your therapist reviews what you enter.", "Su terapeuta revisa lo que usted anota.")}</li>
        <li>${L("This sample stays on this phone. It does not contact a real clinic.", "Esta muestra se queda en este teléfono. No contacta a una clínica real.")}</li>
        <li>${L("You can stop anytime.", "Puede parar cuando quiera.")}</li>
        <li>${L("In an emergency, call 911. Do not wait for a message.", "En una emergencia, llame al 911. No espere un mensaje.")}</li>
      </ul>
    `, L("This sample stays on the phone. In an emergency call 911. Do not wait for a message.", "Esta muestra se queda en el teléfono. En una emergencia llame al 911. No espere un mensaje."), {
      nav: "none",
      footer: btn(L("I agree and start", "Acepto y empiezo"), 'data-action="setup-finish"'),
    });
  }
  const name = esc(state.profile?.patientName || s.patientName || "");
  return view(`
    ${h(L("You are set", "Listo"), L(`You are ready, ${name}.`, `Todo listo, ${name}.`), L("Your first day is on the next screen.", "Su primer día está en la siguiente pantalla."))}
    ${teamCards()}
  `, L(`You are ready, ${state.profile?.patientName || ""}. Go to today.`, `Todo listo, ${state.profile?.patientName || ""}. Vaya a hoy.`), {
    nav: "none",
    footer: btn(L("Go to today", "Ir a hoy"), 'data-href="/today"'),
  });
}

function teamCards() {
  return `<div class="stack">
    ${personRow(TEAM.pt, true)}
    ${personRow(TEAM.pta, false)}
    ${personRow(TEAM.surgeon, false)}
  </div>`;
}

function personRow(person, lead) {
  return `<article class="person">
    <span class="avatar">${person.initials}</span>
    <span>
      <strong>${esc(person.name)}</strong>
      <em>${t(person.role)}${lead ? L(" · leads your plan", " · dirige su plan") : ""}</em>
    </span>
  </article>`;
}

function phaseTitle(profile) {
  const phase = phaseOf(profile);
  const day = Math.max(0, dayCount(profile));
  if (phase === "preop") return phaseLine(profile);
  if (phase === "pain") return phaseLine(profile);
  if (day < 14) return L("Phase 1: Early healing", "Fase 1: Sanar");
  if (day < 42) return L("Phase 2: Building motion", "Fase 2: Ganar movimiento");
  return L("Phase 3: Getting stronger", "Fase 3: Más fuerza");
}

function today() {
  const p = state.profile;
  const tip = articleById(dailyTipId(p));
  const prog = exerciseProgress();
  const hour = new Date().getHours();
  const hello = p.source === "sample"
    ? L("Good morning", "Buenos días")
    : hour < 12 ? L("Good morning", "Buenos días") : hour < 18 ? L("Good afternoon", "Buenas tardes") : L("Good evening", "Buenas noches");
  const phase = phaseOf(p);
  const day = Math.max(0, dayCount(p));
  const daysOut = Math.max(0, -dayCount(p));
  const bend = state.metrics.rom?.angle || (state.metrics.history.bend || []).at(-1) || 95;
  const pain = state.metrics.checkin?.pain ?? (state.metrics.history.pain || []).at(-1) ?? 3;
  const [, joint] = trackNoun(p);
  const ringPct = phase === "preop" ? 100 : Math.min(100, Math.round((day / 90) * 100));
  const ringLabel = phase === "preop" ? String(daysOut) : String(day);
  const tasks = [];
  if (phoneLevel(p, state.metrics) === "high") {
    tasks.push({ href: "/alert", title: L("Warning sign", "Señal de alerta"), detail: L("See what to do now", "Ver qué hacer ahora"), start: true });
  }
  if (phase === "preop" && !prepDone()) {
    tasks.push({ href: "/prep", title: L("Getting ready", "Preparación"), detail: L(`${daysOut} days to surgery`, `${daysOut} días para la cirugía`), start: !tasks.length });
  }
  tasks.push({
    href: "/checkin",
    title: L("2-minute check-in", "Registro de 2 minutos"),
    detail: checkinDone() ? L("Done for today", "Hecho por hoy") : L("Pain, swelling, sleep, and medicines", "Dolor, hinchazón, sueño y medicinas"),
    start: !checkinDone() && !tasks.some((item) => item.start),
  });
  tasks.push({
    href: "/move",
    title: L("Exercises", "Ejercicios"),
    detail: L(`${prog.done} of ${prog.total} done`, `${prog.done} de ${prog.total} hechos`),
  });
  tasks.push({
    href: "/bend",
    title: phase === "pain" ? L("Comfort check", "Revisión de comodidad") : L(`${joint} bend measurement`, `Medición de flexión, ${joint}`),
    detail: bend ? L(`${bend} degrees last time`, `${bend} grados la vez pasada`) : L("Side view with the phone", "Vista de lado con el teléfono"),
  });
  if (!tipDone()) {
    tasks.push({ href: `/learn/${tip.id}`, title: L("Today's lesson", "Lección de hoy"), detail: t(tip.title) });
  }
  const first = tasks.find((item) => item.start) || tasks[0];
  const speak = `${hello}, ${p.patientName}. ${phaseTitle(p)}. ${joint} bend ${bend} degrees. ${num(state.metrics.stepsToday)} steps. Pain ${pain} out of 10. ${tasks.map((item) => item.title).join(". ")}. Next care team call Thursday at 2 PM with Jenna Ruiz.`;
  return view(`
    ${helperBanner()}
    <section class="hero-card hero-navy hero-split bleed">
      <div class="hero-copy">
        <h1>${hello}, ${esc(p.patientName.split(" ")[0])}</h1>
        <p>${phaseTitle(p)}</p>
      </div>
      <div class="day-ring">
        ${ring(ringPct, "#F07862", ringLabel)}
        <span>${phase === "preop" ? L("days to go", "días") : L("of 90 days", "de 90 días")}</span>
      </div>
    </section>
    <div class="stats">
      <article><strong>${bend}°</strong><span>${L(`${joint} bend`, `Flexión, ${joint}`)}</span></article>
      <article><strong>${num(state.metrics.stepsToday)}</strong><span>${L("Steps", "Pasos")}</span></article>
      <article><strong>${pain}/10</strong><span>${L("Pain", "Dolor")}</span></article>
    </div>
    <h2>${L("Today's tasks", "Tareas de hoy")}</h2>
    <div class="group">
      ${tasks.map((item) => `<button type="button" class="task ${item.start ? "has-pill" : ""}" data-href="${item.href}" ${item.href === "/checkin" ? 'data-tour="checkin"' : ""} ${item.href === "/bend" ? 'data-tour="bend"' : ""}>
        <span><strong>${item.title}</strong><em>${esc(item.detail)}</em></span>
        ${item.start ? `<span class="start-pill">${L("Start", "Empezar")}</span>` : ""}
      </button>`).join("")}
    </div>
    <article class="call-card">
      <p class="kicker">${L("Next care team call", "Próxima llamada del equipo")}</p>
      <h2>${L("Thursday 2:00 PM", "Jueves 2:00 p. m.")}</h2>
      <p>${L("with Jenna Ruiz, PTA", "con Jenna Ruiz, PTA")}</p>
      ${btn(L("Add to calendar", "Agregar al calendario"), 'data-href="/reminders"', "secondary")}
    </article>
  `, speak, { active: "today", footer: btn(first.start ? L("Start check-in", "Empezar el registro") : L("Continue", "Seguir"), `data-href="${first.href}"`) });
}

function prepList() {
  return `<div class="group">${prepItems().map(([id, label]) => {
    const on = Boolean(state.metrics.prep?.[id]);
    return `<button type="button" class="choice" aria-pressed="${on}" data-action="prep" data-id="${id}">${on ? `${icon("check")} ` : ""}${label}</button>`;
  }).join("")}</div>`;
}

function prep() {
  const preop = phaseOf(state.profile) === "preop";
  const daysOut = Math.max(0, -dayCount(state.profile));
  return view(`
    ${backLink("/more", L("Back", "Atrás"))}
    ${h(
      preop ? L(`${daysOut} days to surgery`, `${daysOut} días para la cirugía`) : L("Before surgery", "Antes de la cirugía"),
      L("Getting ready", "Preparación"),
      preop
        ? L("One list for the days before surgery.", "Una lista para los días antes de la cirugía.")
        : L("This list is for the days before surgery. Yours has already passed.", "Esta lista es para los días antes de la cirugía. La suya ya pasó."),
    )}
    ${prepList()}
    <button type="button" class="text-link" data-href="/learn/ready">${L("Read how to get the home ready", "Lea cómo preparar la casa")}</button>
  `, L("Getting ready checklist. Clear a path, plan the ride, pack a bag, and write questions for your surgeon.", "Lista de preparación. Despeje un camino, organice el transporte, prepare una bolsa y escriba preguntas para su cirujano."), {
    active: "more",
    footer: prepDone() ? btn(L("Back to today", "Volver a hoy"), 'data-href="/today"') : "",
  });
}

function move() {
  const list = listExercises();
  const speak = L("Move. Today's exercises, your step count, and a bend check with the phone camera guide.", "Moverse. Los ejercicios de hoy, los pasos y una revisión de la flexión con la guía de la cámara.");
  return view(`
    ${h(L("Exercises", "Ejercicios"), L("Today's exercises", "Ejercicios de hoy"), L("One list. Rest between moves.", "Una lista. Descanse entre ejercicios."))}
    <div class="group">
      ${list.map((item) => {
        const st = exState(item.id);
        const note = st.done
          ? L(`Done · ${feedbackWord(st.feedback)}`, `Hecho · ${feedbackWord(st.feedback)}`)
          : item.kind === "once"
            ? t(item.why)
            : L(`Set ${st.set || 1} of 2 · ${t(item.why)}`, `Serie ${st.set || 1} de 2 · ${t(item.why)}`);
        return `<button type="button" class="task ${st.done ? "is-done" : ""}" data-href="/exercise/${item.id}">
          <span class="n tone-blue">${st.done ? icon("check") : icon("move")}</span>
          <span><strong>${t(item.name)}</strong><em>${esc(note)}</em></span>
        </button>`;
      }).join("")}
      <button type="button" class="task" data-href="/activity"><span class="n tone-teal">${icon("steps")}</span><span><strong>${L("Steps", "Pasos")}</strong><em>${num(state.metrics.stepsToday)} ${L("today, from this phone", "hoy, de este teléfono")}</em></span></button>
      <button type="button" class="task" data-href="/bend"><span class="n tone-navy">${icon("camera")}</span><span><strong>${L("Check your bend", "Revise su flexión")}</strong><em>${L("Sample camera guide", "Guía de cámara de muestra")}</em></span></button>
    </div>
  `, speak, {
    active: "move",
    footer: btn(L("Start the next exercise", "Empezar el siguiente ejercicio"), `data-href="/exercise/${(list.find((item) => !exState(item.id).done) || list[0]).id}"`),
  });
}

function feedbackWord(id) {
  return {
    easy: L("too easy", "muy fácil"),
    right: L("just right", "bien así"),
    hard: L("too hard", "muy difícil"),
  }[id] || L("done", "hecho");
}

function exercise() {
  const item = findEx(routeOf().id);
  if (!item) return missing();
  const st = exState(item.id);
  const playing = state.metrics.playing === item.id;
  const sets = item.kind === "once" ? 1 : 2;
  const setNum = st.set || (st.done ? sets : 1);
  const ready = st.done || (setNum >= sets && st.reps >= item.target);
  const speak = `${t(item.name)}. ${t(item.why)} ${item.kind === "once"
    ? L("When you finish, tap the big button.", "Cuando termine, toque el botón grande.")
    : L(`Set ${setNum} of ${sets}. Do ${item.target} slow reps. The big button counts one.`, `Serie ${setNum} de ${sets}. Haga ${item.target} repeticiones lentas. El botón grande cuenta una.`)}`;
  const feedback = `
    <p class="section-label">${L("How did that feel?", "¿Cómo se sintió?")}</p>
    <div class="stack">
      ${choice(L("Too easy", "Muy fácil"), `data-action="feedback" data-id="${item.id}" data-value="easy"`, st.feedback === "easy")}
      ${choice(L("Just right", "Bien así"), `data-action="feedback" data-id="${item.id}" data-value="right"`, st.feedback === "right")}
      ${choice(L("Too hard", "Muy difícil"), `data-action="feedback" data-id="${item.id}" data-value="hard"`, st.feedback === "hard")}
    </div>
    <p class="fine">${L("Stop if pain is sharp. Soreness can be normal. Sharp pain is a reason to stop and tell your therapist.", "Pare si el dolor es punzante. Un dolor muscular puede ser normal. El dolor punzante es motivo para parar y avisarle a su terapeuta.")}</p>`;
  const repsShown = item.kind === "once" ? (st.reps ? 1 : 0) : (st.reps || 0);
  const repPct = item.kind === "once" ? (st.reps ? 100 : 8) : Math.min(100, Math.round((repsShown / Math.max(1, item.target)) * 100));
  const others = listExercises().filter((entry) => entry.id !== item.id);
  return view(`
    ${backLink("/move", L("All exercises", "Todos los ejercicios"))}
    ${h(L("Exercise", "Ejercicio"), t(item.name), t(item.why))}
    <div class="rep-hero">
      ${ring(repPct, "#F07862", String(repsShown))}
      <div>
        <p class="kicker">${item.kind === "once" ? L("One time today", "Una vez hoy") : L(`Set ${setNum} of ${sets}`, `Serie ${setNum} de ${sets}`)}</p>
        <p class="measure">${repsShown} <small>${item.kind === "once" ? L("done", "hecho") : L(`of ${item.target}`, `de ${item.target}`)}</small></p>
      </div>
    </div>
    ${figure(item.id, playing)}
    ${hasVideo(item.id) ? "" : `<div class="stack">${btn(playing ? L("Pause video", "Pausar video") : L("Play video", "Ver video"), `data-action="play" data-id="${item.id}"`, "secondary")}</div>`}
    <h2>${L("Today's list", "Lista de hoy")}</h2>
    <div class="group">
      ${others.map((entry) => {
        const done = exState(entry.id).done;
        return `<button type="button" class="task ${done ? "is-done" : ""}" data-href="/exercise/${entry.id}"><span><strong>${t(entry.name)}</strong><em>${done ? L("Done", "Hecho") : t(entry.why)}</em></span></button>`;
      }).join("")}
    </div>
    ${ready ? "" : `<p class="fine">${L("Stop if something feels sharp or wrong.", "Pare si algo se siente punzante o mal.")}</p>`}
  `, speak, {
    active: "move",
    footer: ready
      ? feedback
      : btn(
        item.kind === "once" ? L("I finished", "Ya terminé") : L("Add one rep", "Contar una repetición"),
        `data-action="rep" data-id="${item.id}"`,
      ),
  });
}

function seg(key, pairs, selected) {
  return `<div class="seg" role="group">${pairs.map(([value, label]) => choice(label, `data-action="pick" data-key="${key}" data-value="${value}"`, selected === value)).join("")}</div>`;
}

function checkinSheet() {
  const draft = state.metrics.draft || {};
  const pain = draft.pain ?? 3;
  const yesNo = (key) => seg(key, [["no", L("No", "No")], ["yes", L("Yes", "Sí")]], draft[key] === true ? "yes" : draft[key] === false ? "no" : undefined);
  return view(`
    <header class="page-head">
      <p class="kicker">${L("Daily check-in", "Registro del día")}</p>
      <h1>${L("How are you today?", "¿Cómo está hoy?")}</h1>
    </header>
    <label class="sheet-block">${L("Pain", "Dolor")}
      <strong class="pain-read" data-pain-readout>${pain}</strong>
      <input type="range" min="0" max="10" step="1" value="${pain}" data-field="painSlider" aria-label="${L("Pain from 0 to 10", "Dolor de 0 a 10")}">
      <span class="range-ends"><em>0</em><em>10</em></span>
    </label>
    <div class="sheet-block">
      <h2>${L("Swelling", "Hinchazón")}</h2>
      ${seg("swell", [["none", L("None", "Ninguna")], ["little", L("Mild", "Leve")], ["some", L("Moderate", "Moderada")], ["alot", L("Severe", "Fuerte")]], draft.swell)}
    </div>
    <div class="sheet-block">
      <h2>${L("Sleep", "Sueño")}</h2>
      ${seg("sleep", [["under4", L("Under 4 hours", "Menos de 4 horas")], ["to6", L("4 to 6", "4 a 6")], ["to8", L("6 to 8", "6 a 8")], ["over8", L("8 or more", "8 o más")]], draft.sleep)}
    </div>
    <div class="sheet-block">
      <h2>${L("Pain medicine", "Medicina para el dolor")}</h2>
      ${seg("meds", [["yes", L("Yes", "Sí")], ["notyet", L("Not yet", "Todavía no")], ["none", L("I do not take any", "No tomo ninguna")]], draft.meds)}
    </div>
    <div class="sheet-block">
      <h2>${L("Warning signs", "Señales de alerta")}</h2>
      <div class="yn"><span>${L("Fever", "Fiebre")}</span>${yesNo("fever")}</div>
      <div class="yn"><span>${L("Calf pain", "Dolor de pantorrilla")}</span>${yesNo("calf")}</div>
      <div class="yn"><span>${L("Wound problem", "Problema de la herida")}</span>${yesNo("wound")}</div>
      <div class="yn"><span>${L("Suddenly much worse", "Empeoró de golpe")}</span>${yesNo("worse")}</div>
    </div>
    <div class="stack">
      ${btn(state.metrics.photo ? L("Sample photo added", "Foto de muestra agregada") : L("Add wound photo", "Agregar foto de la herida"), 'data-action="photo"', "secondary")}
      <p class="fine">${L("This sample does not open your camera.", "Esta muestra no abre su cámara.")}</p>
    </div>
  `, L("Daily check-in. Pain, swelling, sleep, medicine, and warning signs. Then submit.", "Registro del día. Dolor, hinchazón, sueño, medicina y señales de alerta. Luego envíe."), {
    active: "checkin",
    footer: btn(L("Submit check-in", "Enviar registro"), 'data-action="checkin-sheet"'),
  });
}

function checkin() {
  const id = routeOf().id || "";
  if (!id) return checkinSheet();
  if (id === "done") return checkinDoneScreen();
  const flow = checkinFlow();
  if (!flow.includes(id)) return checkinDoneScreen();
  const index = flow.indexOf(id);
  const draft = state.metrics.draft || {};
  const after = stepAfter(id);
  const titles = {
    pain: [L("Pain", "Dolor"), L("How is the pain right now?", "¿Cómo está el dolor ahora?"), L("0 is none. 10 is the worst you can imagine.", "0 es nada. 10 es lo peor que puede imaginar.")],
    swell: [L("Swelling", "Hinchazón"), L("Any swelling today?", "¿Hay hinchazón hoy?"), ""],
    sleep: [L("Sleep", "Sueño"), L("How did you sleep?", "¿Cómo durmió?"), ""],
    fever: [L("Warning sign", "Señal de alerta"), L("Do you have a fever, or feel feverish?", "¿Tiene fiebre o se siente afiebrado?"), ""],
    calf: [L("Warning sign", "Señal de alerta"), L("Does one calf hurt, or is it more swollen than the other?", "¿Le duele una pantorrilla, o está más hinchada que la otra?"), ""],
    wound: [L("Warning sign", "Señal de alerta"), L("Is the wound more red, draining, or opening?", "¿La herida está más roja, supura o se abre?"), ""],
    worse: [L("Warning sign", "Señal de alerta"), L("Is a joint hot, much redder, or suddenly much worse?", "¿Una articulación está caliente, mucho más roja, o empeoró de golpe?"), ""],
    meds: [L("Medicine", "Medicina"), L("Did you take your pain medicine today?", "¿Tomó hoy su medicina para el dolor?"), L("Only what your surgeon told you to take.", "Solo lo que su cirujano le indicó.")],
    strong: [L("Medicine", "Medicina"), L("Was any of it a stronger pain pill your surgeon prescribed?", "¿Alguna fue una pastilla más fuerte que recetó su cirujano?"), ""],
  };
  const [kicker, title, lede] = titles[id];
  let body = "";
  if (id === "pain") {
    body = `<div class="pain-grid">${Array.from({ length: 11 }, (_, n) => {
      const label = n === 0 ? L("0 None", "0 Nada") : n === 10 ? L("10 Worst", "10 Lo peor") : String(n);
      return choice(label, `data-action="pick" data-key="pain" data-value="${n}"`, draft.pain === n);
    }).join("")}</div>`;
  } else if (id === "swell") {
    body = stackPicks("swell", [[ "none", L("None", "Ninguna") ], [ "little", L("A little", "Un poco") ], [ "some", L("Quite a bit", "Bastante") ], [ "alot", L("A lot", "Mucha") ]], draft.swell);
  } else if (id === "sleep") {
    body = stackPicks("sleep", [[ "good", L("Slept well", "Dormí bien") ], [ "some", L("Woke a few times", "Desperté varias veces") ], [ "hard", L("Hard night", "Noche difícil") ]], draft.sleep);
  } else if (id === "fever" || id === "calf" || id === "wound" || id === "worse") {
    body = stackPicks(id, [[ "no", L("No", "No") ], [ "yes", L("Yes", "Sí") ]], draft[id] === true ? "yes" : draft[id] === false ? "no" : undefined);
    if (id === "wound" || id === "worse") {
      body += `<div class="stack top-gap">
        ${btn(state.metrics.photo ? L("Sample photo added", "Foto de muestra agregada") : L("Add a sample photo", "Agregar una foto de muestra"), 'data-action="photo"', "secondary")}
        <p class="fine">${state.metrics.photo
          ? L("A sample picture of a covered bandage is saved. This demo does not open your camera.", "Se guardó una foto de muestra de un vendaje cubierto. Esta demo no abre su cámara.")
          : L("Optional. This demo does not open your camera.", "Opcional. Esta demo no abre su cámara.")}</p>
      </div>`;
    }
  } else if (id === "meds") {
    body = stackPicks("meds", [[ "yes", L("Yes", "Sí") ], [ "notyet", L("Not yet", "Todavía no") ], [ "none", L("I do not take any", "No tomo ninguna") ]], draft.meds);
  } else {
    body = stackPicks("strong", [[ "yes", L("Yes", "Sí") ], [ "no", L("No", "No") ], [ "none", L("I do not take those", "No tomo esas") ]], draft.strong);
  }
  const speak = `${title} ${lede || ""} ${L(`Question ${index + 1} of ${flow.length}.`, `Pregunta ${index + 1} de ${flow.length}.`)}`;
  const footer = after === "finish"
    ? btn(L("Finish check-in", "Terminar el registro"), `data-action="checkin-next" data-key="${id}" data-finish="1"`)
    : btn(L("Next", "Siguiente"), `data-action="checkin-next" data-key="${id}" data-after="${after}"`);
  return view(`
    ${backLink(index === 0 ? "/today" : `/checkin/${flow[index - 1]}`, L("Back", "Atrás"))}
    <p class="progress-label">${L(`Question ${index + 1} of ${flow.length}`, `Pregunta ${index + 1} de ${flow.length}`)}</p>
    ${h(kicker, title, lede)}
    ${body}
  `, speak, { active: "today", footer });
}

function stackPicks(key, pairs, selected) {
  return `<div class="stack">${pairs.map(([value, label]) => choice(label, `data-action="pick" data-key="${key}" data-value="${value}"`, selected === value)).join("")}</div>`;
}

function checkinDoneScreen() {
  const c = state.metrics.checkin || {};
  const speak = flagged(c)
    ? L("Check-in saved. A warning sign needs a call to your surgeon.", "Registro guardado. Una señal de alerta necesita una llamada a su cirujano.")
    : L("Check-in saved. Your therapist can see it in this sample.", "Registro guardado. Su terapeuta puede verlo en esta muestra.");
  return view(`
    ${h(L("Saved", "Guardado"), L("Your check-in is in.", "Su registro quedó listo."), speak)}
    <ul class="plain">
      <li>${L("Pain", "Dolor")}: ${c.pain ?? "-"}</li>
      ${c.swell ? `<li>${L("Swelling", "Hinchazón")}: ${esc(c.swell)}</li>` : ""}
      ${c.sleep ? `<li>${L("Sleep", "Sueño")}: ${esc(c.sleep)}</li>` : ""}
      <li>${L("Fever", "Fiebre")}: ${yesNo(c.fever)}</li>
      <li>${L("Calf", "Pantorrilla")}: ${yesNo(c.calf)}</li>
      <li>${L("Wound or sudden change", "Herida o cambio súbito")}: ${yesNo(c.wound || c.worse)}</li>
    </ul>
    <p class="fine">${L("Answers stay on this phone. This demo does not alert a real clinic.", "Las respuestas se quedan en este teléfono. Esta demo no alerta a una clínica real.")}</p>
  `, speak, {
    active: "today",
    footer: flagged(c)
      ? btn(L("See what to do now", "Ver qué hacer ahora"), 'data-href="/alert"', "danger")
      : btn(L("Back to today", "Volver a hoy"), 'data-href="/today"'),
  });
}

function yesNo(value) {
  if (value === true) return L("Yes", "Sí");
  if (value === false) return L("No", "No");
  return L("Not asked", "No se preguntó");
}

function alert(sample) {
  const c = sample
    ? { fever: true, calf: true, wound: true }
    : (state.metrics.checkin || state.metrics.draft || {});
  const blocks = [];
  if (c.fever) {
    blocks.push(L(
      "You reported a fever or feeling feverish. Call your surgeon's office now. If you are very sick, cannot stay awake, or have trouble breathing, call 911.",
      "Indicó fiebre o que se siente afiebrado. Llame ahora al consultorio de su cirujano. Si está muy enfermo, no puede mantenerse despierto o le falta el aire, llame al 911.",
    ));
  }
  if (c.calf) {
    blocks.push(L(
      "You reported calf pain or one-sided swelling. This can be a sign of a blood clot. Call your surgeon now. If you also have chest pain, shortness of breath, or you feel faint, call 911.",
      "Indicó dolor en la pantorrilla o hinchazón de un solo lado. Puede ser un signo de un coágulo. Llame ahora a su cirujano. Si además tiene dolor en el pecho, falta de aire o se siente a punto de desmayarse, llame al 911.",
    ));
  }
  if (c.wound || c.worse) {
    blocks.push(L(
      "You reported a wound problem, or a joint that is hot, much redder, or suddenly worse. Call your surgeon's office now. If bleeding will not stop, call 911.",
      "Indicó un problema de la herida, o una articulación caliente, mucho más roja, o que empeoró de golpe. Llame ahora al consultorio. Si el sangrado no para, llame al 911.",
    ));
  }
  if (!blocks.length) {
    blocks.push(L(
      "No warning sign is saved on this check-in. If you are worried anyway, call your surgeon's office.",
      "No hay una señal de alerta guardada en este registro. Si igual está preocupado, llame al consultorio.",
    ));
  }
  const next = routeOf().next;
  const speak = `${L("This needs a person now.", "Esto necesita a una persona ahora.")} ${blocks.join(" ")} ${L("This sample does not place a phone call.", "Esta muestra no hace la llamada.")}`;
  return view(`
    <section class="alert-screen">
      ${sample ? `<p class="banner">${L("Sample warning screen. This is not your check-in.", "Pantalla de alerta de muestra. No es su registro.")}</p>` : ""}
      <p class="kicker">${L("Please read this", "Lea esto, por favor")}</p>
      <h1>${L("This needs a person now.", "Esto necesita a una persona ahora.")}</h1>
      ${blocks.map((line) => `<p class="lede">${line}</p>`).join("")}
      <p class="lede">${L("Do not wait for a reply in the app.", "No espere una respuesta en la aplicación.")}</p>
      <p class="fine">${L("This sample will not dial. On your own phone, use the real numbers your office gave you.", "Esta muestra no marca. En su propio teléfono, use los números reales que le dio el consultorio.")}</p>
    </section>
  `, speak, {
    nav: "none",
    footer: `<div class="stack">
      ${btn(L("Call my surgeon", "Llamar a mi cirujano"), 'data-href="/call/surgeon"', "danger")}
      ${btn(L("Call 911", "Llamar al 911"), 'data-href="/emergency"', "secondary")}
      ${next ? btn(L("I understand. Continue.", "Entiendo. Seguir."), `data-href="${esc(next)}"`, "secondary") : btn(L("Back to today", "Volver a hoy"), 'data-href="/today"', "secondary")}
    </div>`,
  });
}

function emergency() {
  const speak = L(
    "Call 911 if you have chest pain, trouble breathing, heavy bleeding, a face that droops, sudden weakness, or you feel you might pass out. This sample does not dial. On your phone, call 9 1 1.",
    "Llame al 911 si tiene dolor en el pecho, falta de aire, un sangrado fuerte, la cara caída, debilidad súbita, o siente que puede desmayarse. Esta muestra no marca. En su teléfono, llame al 9 1 1.",
  );
  return view(`
    <section class="alert-screen">
      <p class="kicker">${L("Emergency", "Emergencia")}</p>
      <h1>${L("Call 911 for an emergency.", "Llame al 911 si es una emergencia.")}</h1>
      <p class="big-num" aria-hidden="true">911</p>
      <p class="lede">${speak}</p>
      ${btn(L("Back to the warning", "Volver a la alerta"), 'data-href="/alert"', "secondary")}
    </section>
  `, speak, { nav: "none" });
}

function questions() {
  const route = routeOf();
  const set = QUESTIONS[state.profile.track] || QUESTIONS.knee;
  if (!route.id) {
    return view(`
      ${backLink("/more", L("Back", "Atrás"))}
      ${h(L("This week", "Esta semana"), L("Five short questions", "Cinco preguntas cortas"), L("Clinics ask questions like these after knee, hip, or shoulder surgery. These are our own words. Higher scores mean easier days.", "Las clínicas hacen preguntas como estas después de una cirugía de rodilla, cadera u hombro. Estas son nuestras palabras. Un puntaje más alto significa días más fáciles."))}
    `, L("Five short questions about how the joint feels this week.", "Cinco preguntas cortas sobre cómo se siente la articulación esta semana."), {
      active: "more",
      footer: btn(L("Start", "Empezar"), 'data-href="/questions/1"'),
    });
  }
  if (route.id === "result") {
    const score = state.metrics.questions?.score ?? 0;
    const last = state.metrics.lastScore;
    const compare = last == null
      ? L("This is the first score saved on this phone.", "Este es el primer puntaje guardado en este teléfono.")
      : score >= last
        ? L(`Up from ${last} last time.`, `Subió desde ${last} la vez pasada.`)
        : L(`Down from ${last} last time. Your therapist will look at this with you.`, `Bajó desde ${last} la vez pasada. Su terapeuta lo verá con usted.`);
    return view(`
      ${h(L("Your score", "Su puntaje"), `${score}`, compare)}
      <p class="fine">${L("Out of 100. Higher means easier. This sample score is not a diagnosis.", "De 100. Más alto significa más fácil. Este puntaje de muestra no es un diagnóstico.")}</p>
    `, `${L("Your score is", "Su puntaje es")} ${score}. ${compare}`, {
      active: "more",
      footer: btn(L("Back to progress", "Volver al avance"), 'data-href="/track"'),
    });
  }
  const n = Number(route.id);
  const q = set[n - 1];
  if (!q) return missing();
  const selected = state.metrics.draft?.[`q${n}`];
  const last = n === set.length;
  return view(`
    ${backLink(n === 1 ? "/questions" : `/questions/${n - 1}`, L("Back", "Atrás"))}
    <p class="progress-label">${L(`Question ${n} of ${set.length}`, `Pregunta ${n} de ${set.length}`)}</p>
    ${h(L("This week", "Esta semana"), t(q), "")}
    <div class="stack">${ANSWERS.map((item) => choice(t(item.label), `data-action="pick" data-key="q${n}" data-value="${item.value}"`, selected === item.value)).join("")}</div>
  `, t(q), {
    active: "more",
    footer: btn(last ? L("See my score", "Ver mi puntaje") : L("Next", "Siguiente"), `data-action="question-next" data-n="${n}" data-last="${last ? "1" : "0"}"`),
  });
}

function activity() {
  const steps = [...(state.metrics.history.steps || []), state.metrics.stepsToday];
  const goal = 2000;
  const speak = L(
    `You have ${state.metrics.stepsToday} steps today. Your phone counted them. No extra device. Walking time today is about ${state.metrics.walkMin} minutes.`,
    `Lleva ${state.metrics.stepsToday} pasos hoy. Su teléfono los contó. Sin aparato extra. El tiempo caminando hoy es de unos ${state.metrics.walkMin} minutos.`,
  );
  return view(`
    ${backLink("/move", L("Back", "Atrás"))}
    ${h(L("From your phone", "Desde su teléfono"), num(state.metrics.stepsToday), L("steps today", "pasos hoy"))}
    <p class="lede">${L(`Sample goal: ${num(goal)} steps. Walking time: about ${state.metrics.walkMin} minutes.`, `Meta de muestra: ${num(goal)} pasos. Tiempo caminando: unos ${state.metrics.walkMin} minutos.`)}</p>
    ${chart(steps, 0, Math.max(goal, ...steps), "#0071E3")}
    <p class="fine">${L("The last bar is today. Earlier bars are the sample week. Your phone counted every step.", "La última barra es hoy. Las anteriores son la semana de muestra. Su teléfono contó cada paso.")}</p>
  `, speak, { active: "move", footer: btn(L("Back to today", "Volver a hoy"), 'data-href="/today"') });
}

function dualChart(actual, expected, days) {
  const w = 340;
  const h = 248;
  const left = 52;
  const right = 14;
  const top = 36;
  const bottom = 42;
  const min = 0;
  const max = 120;
  const span = max - min;
  const plotW = w - left - right;
  const plotH = h - top - bottom;
  const coords = (values) => values.map((value, i) => {
    const x = left + (i / Math.max(1, values.length - 1)) * plotW;
    const y = top + (1 - (Math.min(max, Math.max(min, Number(value))) - min) / span) * plotH;
    return [x, y];
  });
  const path = (values) => coords(values).map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const yLabels = [120, 80, 40, 0].map((value) => {
    const y = top + (1 - value / span) * plotH;
    return `<text x="2" y="${(y + 5).toFixed(1)}" fill="#13294B" font-size="15" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${value}</text>`;
  }).join("");
  const xLabels = (days || actual.map((_, i) => i + 1)).map((day, i) => {
    const x = left + (i / Math.max(1, actual.length - 1)) * plotW;
    return `<text x="${x.toFixed(1)}" y="${h - 16}" text-anchor="middle" fill="#13294B" font-size="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${day}</text>`;
  }).join("");
  const last = coords(actual).at(-1);
  const latest = actual.at(-1);
  const callout = last && latest != null
    ? `<text x="${Math.max(left, last[0] - 92).toFixed(1)}" y="${Math.max(22, last[1] - 14).toFixed(1)}" fill="#13294B" font-size="16" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${latest} ${L("degrees", "grados")}</text>`
    : "";
  const dots = coords(actual).map((p, i) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${i === actual.length - 1 ? 6 : 4}" fill="#F07862"></circle>`).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(L("Your bend in degrees by day, and the sample path", "Su flexión en grados por día, y el camino de muestra"))}">
    <text x="2" y="16" fill="#3a3a3c" font-size="14" font-family="-apple-system, BlinkMacSystemFont, sans-serif">${L("Degrees", "Grados")}</text>
    ${yLabels}
    <path d="${path(expected)}" fill="none" stroke="#13294B" stroke-width="4" stroke-dasharray="8 6" stroke-linecap="round"></path>
    <path d="${path(actual)}" fill="none" stroke="#F07862" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"></path>
    ${dots}
    ${callout}
    ${xLabels}
  </svg>
  <p class="legend"><i class="swatch coral"></i> ${L("Your bend", "Su flexión")} <i class="swatch navy"></i> ${L("Sample path", "Camino de muestra")}</p>
  <p class="fine">${L("Numbers under the line are days after surgery.", "Los números bajo la línea son días después de la cirugía.")}</p>`;
}

function chart(values, min, max, color) {
  if (!values.length) return `<p class="fine">${L("No readings yet.", "Todavía no hay lecturas.")}</p>`;
  const w = 320;
  const h = 140;
  const span = Math.max(1, max - min);
  const coords = values.map((value, i) => {
    const x = 16 + (i / Math.max(1, values.length - 1)) * (w - 32);
    const y = 16 + (1 - (value - min) / span) * (h - 36);
    return [x, y];
  });
  const d = coords.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const dots = coords.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5" fill="${color}"></circle>`).join("");
  return `<svg class="chart" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(L("Chart of recent readings", "Gráfica de lecturas recientes"))}"><path d="${d}" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"></path>${dots}</svg>`;
}

function bendDiagram(angle) {
  const kneeX = 150;
  const kneeY = 96;
  const len = 118;
  const rad = (Number(angle) || 0) * Math.PI / 180;
  const x2 = (kneeX + Math.cos(rad) * len).toFixed(1);
  const y2 = (kneeY + Math.sin(rad) * len).toFixed(1);
  return `<svg class="bend-svg" data-bend-svg viewBox="0 0 320 280" role="img" aria-label="${esc(L("Leg diagram. Drag the lower leg.", "Diagrama de la pierna. Arrastre la pierna de abajo."))}">
    <rect width="320" height="280" rx="20" fill="#F4F7FB"/>
    <line x1="36" y1="${kneeY}" x2="${kneeX}" y2="${kneeY}" stroke="#13294B" stroke-width="20" stroke-linecap="round"/>
    <circle cx="${kneeX}" cy="${kneeY}" r="14" fill="#13294B"/>
    <line data-shin x1="${kneeX}" y1="${kneeY}" x2="${x2}" y2="${y2}" stroke="#F07862" stroke-width="20" stroke-linecap="round"/>
    <circle data-foot cx="${x2}" cy="${y2}" r="14" fill="#F07862"/>
  </svg>`;
}

function sheetReading() {
  const track = state.profile.track;
  if (track === "hip") return { angle: state.metrics.rom?.angle || 86, delta: 2, goal: 105 };
  if (track === "shoulder") return { angle: state.metrics.rom?.angle || 96, delta: 4, goal: 120 };
  if (track === "pain") return { angle: state.metrics.rom?.angle || 70, delta: 0, goal: null };
  return { angle: state.metrics.rom?.angle || 95, delta: 3, goal: 110 };
}

function sparkline(values) {
  if (!values?.length) return "";
  const w = 280;
  const h = 64;
  const min = Math.min(...values) - 4;
  const max = Math.max(...values) + 4;
  const span = Math.max(1, max - min);
  const coords = values.map((value, i) => {
    const x = (i / Math.max(1, values.length - 1)) * (w - 8) + 4;
    const y = h - 6 - ((value - min) / span) * (h - 16);
    return [x, y];
  });
  const d = coords.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="none" stroke="#F07862" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
}

function bend() {
  const flow = state.metrics.rom?.flow || 0;
  const track = state.profile.track;
  const word = bendWord(track);
  if (flow === 2) {
    const angle = state.metrics.romAdjust ?? state.metrics.rom?.angle ?? 90;
    return view(`
      <p class="kicker">${L("Step 2 of 2", "Paso 2 de 2")}</p>
      ${h(L("Bend check", "Revisión de flexión"), L("Adjust it yourself", "Ajústelo usted"), L("Drag the blue lower leg so it matches your bend. Use the buttons for a small change.", "Arrastre la pierna azul de abajo para que coincida con su flexión. Use los botones para un cambio pequeño."))}
      <p class="live-deg" aria-live="polite"><span data-bend-readout>${angle}</span> <small>${L("degrees", "grados")}</small></p>
      ${bendDiagram(angle)}
      <div class="nudge">
        ${btn(L("Minus 1", "Menos 1"), 'data-action="rom-nudge" data-dir="-1"', "secondary")}
        ${btn(L("Plus 1", "Más 1"), 'data-action="rom-nudge" data-dir="1"', "secondary")}
      </div>
      <p class="lede">${L("Sarah Chen, PT, reviews this reading.", "Sarah Chen, PT, revisa esta lectura.")}</p>
    `, L(`Adjust the lower leg. It is ${angle} degrees. Your physical therapist reviews this reading.`, `Ajuste la pierna de abajo. Son ${angle} grados. Su fisioterapeuta revisa esta lectura.`), {
      active: "move",
      footer: `<div class="stack">${btn(L("Save this reading", "Guardar esta lectura"), 'data-action="rom-keep"')}${btn(L("Back to the camera", "Volver a la cámara"), 'data-action="rom-flow" data-flow="0"', "secondary")}</div>`,
    });
  }
  const kneeClip = track === "knee";
  const reading = sheetReading();
  const bends = state.metrics.history.bend || [];
  const cameraView = kneeClip
    ? `<img class="rom-poster" src="assets/videos/rom-knee-bend.jpg" alt="" aria-hidden="true">
      <video class="rom-clip" src="assets/videos/rom-knee-bend.mp4" poster="assets/videos/rom-knee-bend.jpg" muted loop playsinline autoplay preload="metadata" aria-hidden="true"></video>`
    : `<svg viewBox="0 0 320 180" aria-hidden="true">
        <rect width="320" height="180" fill="#13294B"/>
        <circle cx="78" cy="78" r="16" fill="#F4F7FB"/>
        <line x1="94" y1="86" x2="150" y2="100" stroke="#F4F7FB" stroke-width="16" stroke-linecap="round"/>
        <line x1="150" y1="100" x2="230" y2="78" stroke="#F4F7FB" stroke-width="14" stroke-linecap="round"/>
        <line x1="230" y1="78" x2="250" y2="130" stroke="#F07862" stroke-width="14" stroke-linecap="round"/>
      </svg>`;
  const saved = state.metrics.romSaved
    ? `<p class="saved-note">${L("Saved. Sarah Chen, PT, reviews this reading.", "Guardado. Sarah Chen, PT, revisa esta lectura.")}</p>`
    : `<p class="fine">${L("Sarah Chen, PT, reviews this reading.", "Sarah Chen, PT, revisa esta lectura.")}</p>`;
  return view(`
    <p class="kicker">${L("Knee bend", "Flexión de rodilla")}</p>
    <h1>${L("Prop the phone. Side view.", "Apoye el teléfono. Vista de lado.")}</h1>
    <p class="lede">${L(`Sit in a firm chair. The phone looks at your ${word} from the side. This clip stands in for the camera.`, `Siéntese en una silla firme. El teléfono mira su ${word} de lado. Este video representa la cámara.`)}</p>
    <div class="finder-frame camera-sim${kneeClip ? " has-clip" : ""}">
      ${cameraView}
    </div>
    <section class="result-sheet">
      <p class="kicker">${L("Today's measurement", "Medición de hoy")}</p>
      <p class="measure">${reading.angle} <small>${L("degrees", "grados")}</small></p>
      <p class="delta">${reading.delta > 0 ? L(`+${reading.delta} this week`, `+${reading.delta} esta semana`) : L("Same as last week", "Igual que la semana pasada")}</p>
      ${reading.goal ? `<p>${L(`Goal ${reading.goal} degrees`, `Meta ${reading.goal} grados`)}</p>` : ""}
      <p class="section-label">${L("Last readings", "Lecturas anteriores")}</p>
      ${sparkline(bends)}
      ${saved}
      <div class="split sheet-actions">
        ${btn(L("Retake", "Repetir"), 'data-action="rom-retake" data-tour="retake"', "secondary")}
        ${btn(L("Save measurement", "Guardar medición"), 'data-action="rom-save" data-tour="save"')}
      </div>
      ${btn(L("Adjust it yourself", "Ajústelo usted"), 'data-action="rom-flow" data-flow="2" data-tour="adjust"', "secondary")}
    </section>
  `, L(`Knee bend camera. Today's measurement is ${reading.angle} degrees. You can retake, save, or adjust it yourself. Your physical therapist reviews the reading.`, `Cámara de flexión. La medición de hoy es ${reading.angle} grados. Puede repetir, guardar, o ajustarla usted. Su fisioterapeuta revisa la lectura.`), {
    active: "move",
  });
}

function bendArt() {
  return bendGuide().replace(">Phone<", `>${L("Phone", "Teléfono")}<`);
}

function sliceSpan(values) {
  const span = state.metrics.chartSpan || "w";
  const count = span === "w" ? 7 : span === "2w" ? 14 : values.length;
  return values.slice(-count);
}

function stepBars(values) {
  const max = Math.max(...values, 1);
  return `<div class="bars" role="img" aria-label="${esc(L("Steps each day", "Pasos cada día"))}">${values.map((value) => `<span style="height:${Math.max(8, Math.round((value / max) * 100))}%"></span>`).join("")}</div>`;
}

function track() {
  const p = state.profile;
  const level = phoneLevel(p, state.metrics);
  const span = state.metrics.chartSpan || "w";
  const bends = sliceSpan(state.metrics.history.bend || []);
  const pains = sliceSpan(state.metrics.history.pain || []);
  const steps = sliceSpan(state.metrics.history.steps || []);
  const day = Math.max(0, dayCount(p));
  const expSeries = bends.map((_, i) => expectedBend(day - bends.length + i, p.track)).filter((n) => n != null);
  const speak = `${levelLabel(level)}. ${statusSentence()}`;
  const days = bends.map((_, i) => Math.max(0, day - (bends.length - 1) + i));
  const delta = bends.length > 1 ? bends.at(-1) - bends[0] : 0;
  const spans = [["w", L("W", "S")], ["2w", L("2W", "2S")], ["all", L("All", "Todo")]];
  const curve = p.track === "pain"
    ? ""
    : `<h2>${L(`Your ${bendWord(p.track)}`, `Su ${bendWord(p.track)}`)}</h2>
      <p class="delta">${delta >= 0 ? "+" : ""}${delta} ${L("since week 1", "desde la semana 1")}</p>
      ${expSeries.length && bends.length ? dualChart(bends, expSeries, days) : chart(bends, 0, 120, "#F07862")}`;
  return view(`
    <header class="page-head">
      <p class="kicker">${weekdayLabel()}</p>
      <h1>${L("My progress", "Mi avance")}</h1>
      <p class="pill pill-${level}">${levelLabel(level)}</p>
    </header>
    <p class="lede">${statusSentence()}</p>
    <div class="seg span-seg">${spans.map(([id, label]) => `<button type="button" class="choice" aria-pressed="${span === id}" data-action="span" data-value="${id}">${label}</button>`).join("")}</div>
    <section class="block card">${curve}</section>
    <section class="block card">
      <h2>${L("Steps per day", "Pasos por día")}</h2>
      ${steps.length ? stepBars(steps) : ""}
      <p class="fine">${L(`${num(state.metrics.stepsToday)} steps today, from this phone.`, `${num(state.metrics.stepsToday)} pasos hoy, de este teléfono.`)}</p>
    </section>
    <section class="block card">
      <h2>${L("Pain", "Dolor")}</h2>
      ${chart(pains, 0, 10, "#13294B")}
      <p class="fine">${L("Lower on the chart is better.", "Más abajo en la gráfica es mejor.")}</p>
    </section>
    <h2>${L("Milestones", "Logros")}</h2>
    <div class="badges">${MILESTONES.map((item) => {
      const on = Boolean(state.metrics.milestones?.[item.id]);
      return `<article class="badge ${on ? "is-on" : ""}">${ring(on ? 100 : 8, on ? "#087A6A" : "#C7C7CC", "")}<span><strong>${t(item.title)}</strong><em>${on ? t(item.detail) : L("Not yet", "Todavía no")}</em></span></article>`;
    }).join("")}</div>
    ${state.metrics.questions ? `<p class="lede">${L("This week's question score", "Puntaje de las preguntas de esta semana")}: ${state.metrics.questions.score}</p>` : `<button type="button" class="text-link" data-href="/questions">${L("Answer this week's questions", "Responder las preguntas de esta semana")}</button>`}
  `, speak, { active: "track" });
}

function messages() {
  const lines = state.metrics.messages || [];
  const speak = L(
    "Messages with Sarah Chen, physical therapist. Jenna Ruiz may reply too. One tap calls Sarah. This sample stores messages on the phone only.",
    "Mensajes con Sarah Chen, fisioterapeuta. Jenna Ruiz también puede responder. Un toque llama a Sarah. Esta muestra guarda los mensajes solo en el teléfono.",
  );
  return view(`
    <header class="page-head">
      <p class="kicker">${L("Care team", "Equipo")}</p>
      <h1>${esc(TEAM.pta.name)}</h1>
      <p class="lede">${t(TEAM.pta.role)}. ${esc(TEAM.pt.name)} ${L("leads your plan.", "dirige su plan.")}</p>
    </header>
    <article class="call-card">
      <p>${L("Your care coordinator will call Thursday at 2:00 PM.", "Su coordinadora llamará el jueves a las 2:00 p. m.")}</p>
      ${btn(L("Call my therapist", "Llamar a mi terapeuta"), 'data-href="/call/pt" data-tour="call"')}
    </article>
    <p class="lock">${icon("check")} ${L("Locked to your care team in a real version. This sample stays on the phone.", "En una versión real, iría solo a su equipo. Esta muestra se queda en el teléfono.")}</p>
    <div class="thread">
      ${lines.map((line) => `<article class="bubble ${line.from === "me" ? "mine" : ""}"><p>${esc(t(line.text))}</p><span>${esc(line.time)}</span></article>`).join("")}
      ${state.metrics.photo ? `<article class="bubble mine"><p>${L("Sample photo of a covered bandage. The camera did not open.", "Foto de muestra de un vendaje cubierto. La cámara no se abrió.")}</p></article>` : ""}
    </div>
    <div class="stack">
      ${btn(L("I finished my exercises", "Terminé mis ejercicios"), 'data-action="quick" data-text="finished"', "secondary")}
      ${btn(L("I feel sore today", "Hoy me siento adolorido"), 'data-action="quick" data-text="sore"', "secondary")}
      ${btn(L("I have a question", "Tengo una pregunta"), 'data-action="quick" data-text="question"', "secondary")}
      ${btn(state.metrics.photo ? L("Sample photo added", "Foto de muestra agregada") : L("Add a sample photo", "Agregar una foto de muestra"), 'data-action="photo"', "secondary")}
    </div>
    <label class="field">${L("Write your own note", "Escriba su propia nota")}
      <textarea data-field="draftMessage" rows="3">${esc(state.metrics.draftMessage || "")}</textarea>
    </label>
  `, speak, {
    active: "care",
    footer: `<div class="split">${btn(L("Send", "Enviar"), 'data-action="send"', "secondary")}${btn(L("Call my therapist", "Llamar a mi terapeuta"), 'data-href="/call/pt"')}</div>`,
  });
}

function call() {
  const who = routeOf().id === "surgeon" ? TEAM.surgeon : TEAM.pt;
  const phase = state.callPhase || "ringing";
  const speak = phase === "ended"
    ? L(`Call ended. In real life, ${who.name} would be on your phone line.`, `Llamada terminada. En la vida real, ${who.name} estaría en la línea de su teléfono.`)
    : L(`Calling ${who.name}. This sample does not use your phone line.`, `Llamando a ${who.name}. Esta muestra no usa la línea de su teléfono.`);
  return view(`
    <section class="call">
      <span class="avatar xl">${who.initials}</span>
      <h1>${phase === "ended" ? L("Call ended", "Llamada terminada") : phase === "connected" ? L("Connected", "En línea") : L("Calling", "Llamando")}</h1>
      <p class="lede">${esc(who.name)}</p>
      <p>${t(who.role)}</p>
      <p class="big-num">${esc(who.phone)}</p>
      <p class="fine">${speak}</p>
      <div class="stack">
        ${phase === "ended"
          ? btn(L("Back", "Volver"), 'data-href="/messages"')
          : btn(L("End sample call", "Terminar llamada de muestra"), 'data-action="end-call"', "danger")}
      </div>
    </section>
  `, speak, { nav: "none" });
}

function visit() {
  const phase = state.metrics.visit || "idle";
  const speak = L(
    "Video visit with Sarah Chen. This sample does not open your camera or microphone.",
    "Videollamada con Sarah Chen. Esta muestra no abre su cámara ni su micrófono.",
  );
  return view(`
    ${backLink("/reminders", L("Back", "Atrás"))}
    ${h(L("Tue, Nov 24 · 2:00 PM", "mar 24 nov · 2:00 p. m."), L("Video visit", "Videollamada"), TEAM.pt.name)}
    <div class="visit ${phase === "live" ? "is-live" : ""}">
      <span class="avatar xl">${TEAM.pt.initials}</span>
      <p>${phase === "live" ? L("Sarah would appear here.", "Sarah aparecería aquí.") : L("The visit has not started.", "La visita no ha empezado.")}</p>
    </div>
    <p class="fine">${speak}</p>
  `, speak, {
    active: "more",
    footer: phase === "live"
      ? btn(L("Leave visit", "Salir de la visita"), 'data-action="visit" data-phase="idle"', "secondary")
      : btn(L("Start sample visit", "Empezar visita de muestra"), 'data-action="visit" data-phase="live"'),
  });
}

function learn() {
  const id = routeOf().id;
  if (!id) {
    return view(`
      ${h(L("Lessons", "Lecciones"), L("Plain answers for home.", "Respuestas simples para la casa."), L("Read one. Your therapist still knows your case better than a page.", "Lea una. Su terapeuta conoce su caso mejor que una página."))}
      <div class="stack">
        ${ARTICLES.map((item) => `<button type="button" class="task" data-href="/learn/${item.id}"><span class="n">${icon("book")}</span><span><strong>${t(item.title)}</strong><em>${t(item.summary)}</em></span></button>`).join("")}
      </div>
    `, L("Lessons: what to expect, wound care, falls, when to call the doctor, and more.", "Lecciones: qué esperar, cuidado de la herida, caídas, cuándo llamar al médico y más."), { active: "more" });
  }
  const item = articleById(id);
  const paras = (state.lang === "es" ? item.body.es : item.body.en).map((p) => `<p>${esc(p)}</p>`).join("");
  return view(`
    ${backLink("/learn", L("All lessons", "Todas las lecciones"))}
    ${h(t(item.tag), t(item.title), t(item.summary))}
    <div class="prose">${paras}</div>
    <p class="fine">${L("Sample education. Follow your own surgeon and therapist.", "Educación de muestra. Siga a su propio cirujano y terapeuta.")}</p>
  `, `${t(item.title)}. ${t(item.summary)} ${(state.lang === "es" ? item.body.es : item.body.en).join(" ")}`, {
    active: "more",
  });
}

function reminders() {
  const meds = [
    ["am", L("Morning pain medicine", "Medicina para el dolor, en la mañana"), L("As your surgeon directed", "Como indicó su cirujano")],
    ["clot", L("Blood clot medicine", "Medicina para prevenir coágulos"), L("Do not skip unless the office says so", "No la suspenda a menos que el consultorio lo diga")],
    ["pm", L("Evening pain medicine", "Medicina para el dolor, en la noche"), L("As your surgeon directed", "Como indicó su cirujano")],
  ];
  const speak = L(
    "Medicine and visit reminders. The app does not choose a dose. Take only what your surgeon told you. Tuesday at 2 PM is a video visit with Sarah. December 4 at 9:30 AM is an office visit with Dr. Patel.",
    "Recordatorios de medicinas y citas. La aplicación no elige una dosis. Tome solo lo que indicó su cirujano. El martes a las 2 hay una videollamada con Sarah. El 4 de diciembre a las 9:30 es una cita con la Dra. Patel.",
  );
  return view(`
    ${h(L("Reminders", "Recordatorios"), L("Medicines and visits", "Medicinas y citas"), L("Sample reminders only. The bottle label wins.", "Solo recordatorios de muestra. Gana la etiqueta del frasco."))}
    <div class="stack">
      ${meds.map(([id, title, detail]) => {
        const on = Boolean(state.metrics.meds?.[id]);
        return `<button type="button" class="choice" aria-pressed="${on}" data-action="med" data-id="${id}">${on ? "✓ " : ""}${title}<em>${detail}</em></button>`;
      }).join("")}
    </div>
    <h2>${L("Visits", "Citas")}</h2>
    <button type="button" class="task" data-href="/visit"><span class="n">${icon("calendar")}</span><span><strong>${L("Tue, Nov 24 · 2:00 PM", "mar 24 nov · 2:00 p. m.")}</strong><em>${L("Video visit with Sarah Chen, PT", "Videollamada con Sarah Chen, PT")}</em></span></button>
    <article class="task static"><span class="n">${icon("calendar")}</span><span><strong>${L("Fri, Dec 4 · 9:30 AM", "vie 4 dic · 9:30 a. m.")}</strong><em>${L("Office visit with Dr. Anita Patel", "Cita en el consultorio con la Dra. Anita Patel")}</em></span></article>
    <p class="fine">${L("Covered by most Medicare and Medicare Advantage plans. Your usual copay may apply.", "Cubierto por la mayoría de los planes de Medicare y Medicare Advantage. Puede aplicar su copago habitual.")}</p>
  `, speak, {
    active: "more",
    footer: state.metrics.meds?.pm ? "" : btn(L("Mark evening medicine taken", "Marcar la medicina de la noche"), 'data-action="med" data-id="pm"'),
  });
}

function more() {
  const rows = [
    ["/messages", "message", L("Messages and call", "Mensajes y llamada"), TEAM.pt.name],
    ["/prep", "check", L("Getting ready", "Preparación"), L("Checklist and countdown before surgery", "Lista y cuenta regresiva antes de la cirugía")],
    ["/learn", "book", L("Lessons", "Lecciones"), L("Week by week, wound, falls, when to call", "Semana por semana, herida, caídas, cuándo llamar")],
    ["/reminders", "pill", L("Medicines and visits", "Medicinas y citas"), L("Reminders your office would set", "Recordatorios que pondría el consultorio")],
    ["/questions", "check", L("This week's questions", "Preguntas de esta semana"), L("Five plain questions", "Cinco preguntas simples")],
    ["/activity", "steps", L("Steps", "Pasos"), L("From this phone only", "Solo de este teléfono")],
    ["/bend", "camera", L("Bend check", "Revisión de flexión"), L("Sample camera guide", "Guía de cámara de muestra")],
    ["/visit", "phone", L("Video visit", "Videollamada"), L("Tue, Nov 24 at 2:00 PM", "mar 24 nov a las 2:00 p. m.")],
    ["/clinic", "person", L("Care team desk", "Escritorio del equipo"), L("What Sarah sees", "Lo que ve Sarah")],
  ];
  return view(`
    ${h(L("More", "Más"), esc(state.profile.patientName), phaseLine(state.profile))}
    ${helperBanner()}
    <div class="group">
      ${rows.map(([href, ic, title, detail]) => `<button type="button" class="task" data-href="${href}"><span class="n tone-blue">${icon(ic)}</span><span><strong>${title}</strong><em>${esc(detail)}</em></span></button>`).join("")}
    </div>
    <p class="fine">${state.profile.helper
      ? L(`${state.profile.helperName || "A family member"} can use this phone with ${state.profile.patientName}.`, `${state.profile.helperName || "Un familiar"} puede usar este teléfono con ${state.profile.patientName}.`)
      : L("A family member can help. Set that up if someone else will tap for you.", "Un familiar puede ayudar. Configúrelo si otra persona va a tocar por usted.")}</p>
    <div class="stack top-gap">
      ${btn(L("Play the guided tour", "Ver el recorrido guiado"), 'data-action="demo-start"', "secondary")}
      ${btn(L("Set up again", "Preparar de nuevo"), 'data-href="/setup/hello"', "secondary")}
      ${btn(L("Reset to Maria's sample day", "Volver al día de muestra de Maria"), 'data-action="open-maria"', "secondary")}
    </div>
    <p class="fine">${L("Covered by most Medicare and Medicare Advantage plans. Your usual copay may apply.", "Cubierto por la mayoría de los planes de Medicare y Medicare Advantage. Puede aplicar su copago habitual.")}</p>
    <p class="fine">${L("Fictional sample. Not medical advice. getrecoveroo.com", "Muestra ficticia. No es un consejo médico. getrecoveroo.com")}</p>
  `, L("More. Messages, lessons, medicines, questions, steps, bend check, and the care team desk.", "Más. Mensajes, lecciones, medicinas, preguntas, pasos, flexión y el escritorio del equipo."), { active: "more" });
}

function showDay(card) {
  if (card.live) return card.day;
  if (state.lang === "es" && card.dayEs) return card.dayEs;
  return card.day;
}

function phoneCard() {
  const p = state.profile;
  const m = state.metrics;
  const level = phoneLevel(p, m);
  const c = m.checkin;
  let reason = t({ en: "On the sample plan. No warning sign today.", es: "En el plan de muestra. Hoy no hay señal de alerta." });
  if (c?.fever) reason = L("Fever reported on the phone check-in.", "Fiebre anotada en el registro del teléfono.");
  else if (c?.calf) reason = L("Calf pain reported on the phone check-in.", "Dolor de pantorrilla anotado en el registro del teléfono.");
  else if (c?.wound || c?.worse) reason = L("Wound or sudden change reported on the phone check-in.", "Herida o cambio súbito anotado en el registro del teléfono.");
  else if (c && Number(c.pain) >= 8) reason = L("Pain is high on today's check-in.", "El dolor está alto en el registro de hoy.");
  else if (level === "watch") reason = L("Bend is behind the sample path.", "La flexión va detrás del camino de muestra.");
  const prog = exerciseProgress();
  const [noun] = trackNoun(p);
  return {
    id: "phone",
    name: p.patientName,
    age: p.source === "sample" ? 67 : "",
    track: p.track,
    side: sideLine(p),
    day: phaseLine(p),
    level,
    surgeon: level === "high",
    reason,
    pain: c?.pain ?? m.history.pain.at(-1) ?? "--",
    steps: num(m.stepsToday),
    bend: m.rom?.angle ? `${m.rom.angle}°` : "--",
    exercises: `${prog.done} ${L("of", "de")} ${prog.total}`,
    contact: state.metrics.clinicAck?.phone
      ? L("You marked a call today.", "Marcó una llamada hoy.")
      : L("No call marked yet today.", "Hoy no hay una llamada marcada."),
    story: `${noun}. ${reason}`,
    live: true,
  };
}

function allCards() {
  const phone = phoneCard();
  const rest = CLINIC.filter((item) => item.name !== phone.name);
  const cards = [phone, ...rest];
  const rank = { high: 0, watch: 1, ok: 2 };
  return cards.sort((a, b) => rank[a.level] - rank[b.level]);
}

function surgeonOf(card) {
  if (card.id === "elena" || card.id === "aisha") return "Dr. Omar Shah";
  return "Dr. Anita Patel";
}

function procedureOf(card) {
  const map = {
    knee: L("Knee replacement", "Reemplazo de rodilla"),
    hip: L("Hip replacement", "Reemplazo de cadera"),
    shoulder: L("Shoulder replacement", "Reemplazo de hombro"),
    pain: L("Joint pain, no surgery", "Dolor articular, sin cirugía"),
  };
  return map[card.track] || map.knee;
}

function dayNumber(card) {
  const match = String(showDay(card)).match(/\d+/);
  return match ? match[0] : "--";
}

function billingOf(card) {
  if (card.level === "high") return L("Hold", "En espera");
  if (card.level === "watch") return L("Review", "Revisar");
  return L("Ready", "Listo");
}

function minutesOf(card) {
  const steps = Number(String(card.steps).replace(/,/g, "")) || 0;
  return String(Math.max(12, Math.round(steps / 18)));
}

function clinic(mode = "patients") {
  const all = allCards();
  const surgeon = state.metrics.surgeonFilter || "all";
  const surgeons = ["all", "Dr. Anita Patel", "Dr. Omar Shah"];
  let cards = all.filter((card) => surgeon === "all" || surgeonOf(card) === surgeon);
  if (mode === "alerts") cards = cards.filter((card) => card.level !== "ok");
  if (mode === "calls") cards = cards.filter((card) => card.level !== "ok");
  const high = all.filter((card) => card.level === "high").length;
  const watch = all.filter((card) => card.level === "watch").length;
  const ready = all.filter((card) => billingOf(card) === L("Ready", "Listo")).length;
  const titles = {
    patients: L("Patients", "Pacientes"),
    alerts: L("Alerts", "Alertas"),
    calls: L("Calls", "Llamadas"),
    billing: L("Billing", "Cobros"),
    docs: L("Documentation", "Notas"),
    settings: L("Settings", "Ajustes"),
  };
  const speak = L(
    `Patients for Sarah Chen. ${all.length} active. ${high} high risk. ${watch} on the watch list.`,
    `Pacientes de Sarah Chen. ${all.length} activos. ${high} de alto riesgo. ${watch} en observación.`,
  );
  const stats = `<div class="desk-stats">
    <article><strong>${all.length}</strong><span>${L("Active patients", "Pacientes activos")}</span></article>
    <article><strong>${high}</strong><span>${L("High risk", "Alto riesgo")}</span></article>
    <article><strong>${watch}</strong><span>${L("Watch list", "En observación")}</span></article>
    <article><strong>${ready}</strong><span>${L("Billing ready", "Cobro listo")}</span></article>
    <article><strong>${high + watch}</strong><span>${L("Calls due", "Llamadas pendientes")}</span></article>
  </div>`;
  const chips = `<div class="filters">${surgeons.map((name) => {
    const label = name === "all" ? L("All surgeons", "Todos los cirujanos") : name;
    return `<button type="button" class="chip" aria-pressed="${surgeon === name}" data-action="surgeon" data-value="${esc(name)}">${label}</button>`;
  }).join("")}</div>`;
  const table = `<div class="table-wrap"><table class="desk-table">
    <thead><tr>
      <th>${L("Patient", "Paciente")}</th>
      <th>${L("Risk", "Riesgo")}</th>
      <th>${L("Procedure", "Procedimiento")}</th>
      <th>${L("Surgeon", "Cirujano")}</th>
      <th>${L("Day", "Día")}</th>
      <th>${L("Flag", "Aviso")}</th>
      <th>${L("Data days", "Días con datos")}</th>
      <th>${L("Minutes", "Minutos")}</th>
      <th>${L("Last call", "Última llamada")}</th>
      <th>${L("Billing", "Cobro")}</th>
    </tr></thead>
    <tbody>${cards.map((card, index) => {
      const reason = typeof card.reason === "string" ? card.reason : t(card.reason);
      const contact = card.live ? card.contact : t(card.contact);
      const risk = card.level === "high" ? L("High", "Alto") : card.level === "watch" ? L("Watch", "Observar") : L("On track", "Va bien");
      return `<tr data-href="/clinic/${card.id}" ${index === 0 ? 'data-tour="patient"' : ""}>
        <td><strong>${esc(card.name)}</strong></td>
        <td><span class="risk risk-${card.level}">${risk}</span></td>
        <td>${procedureOf(card)}</td>
        <td>${surgeonOf(card)}</td>
        <td>${esc(dayNumber(card))}</td>
        <td>${esc(reason)}</td>
        <td>${esc(dayNumber(card))}</td>
        <td>${minutesOf(card)}</td>
        <td>${esc(contact)}</td>
        <td>${billingOf(card)}</td>
      </tr>`;
    }).join("")}</tbody>
  </table></div>`;
  let body = `${stats}${chips}<p class="fine">${L("Fictional patients. Not a real clinic.", "Pacientes ficticios. No es una clínica real.")}</p>${table}`;
  if (mode === "billing") {
    body = `${stats}<p class="lede">${L("Covered by most Medicare and Medicare Advantage plans. Your usual copay may apply.", "Cubierto por la mayoría de los planes de Medicare y Medicare Advantage. Puede aplicar su copago habitual.")}</p>${table}`;
  }
  if (mode === "docs") {
    body = `<p class="lede">${L("Notes live on each patient. This desk does not keep a separate chart.", "Las notas viven en cada paciente. Este escritorio no guarda otro expediente.")}</p>${table}`;
  }
  if (mode === "settings") {
    body = `<p class="lede">${L("The patient phone has read-aloud, text size, and Spanish in the header.", "El teléfono del paciente tiene lectura en voz alta, tamaño de texto y español en el encabezado.")}</p>
      <div class="stack">${btn(L("Open Maria's phone", "Abrir el teléfono de Maria"), 'data-href="/today"')}</div>`;
  }
  return view(`
    <header class="desk-head">
      <div>
        <p class="kicker">${esc(TEAM.pt.name)}</p>
        <h1>${titles[mode] || titles.patients}</h1>
      </div>
      <button type="button" class="btn btn-secondary desk-link" data-href="/summary">${L("Practice summary", "Resumen del consultorio")}</button>
    </header>
    ${body}
  `, speak, { nav: "clinic", active: mode === "patients" ? "patients" : mode });
}

function clinicDetail() {
  const id = routeOf().id;
  const card = id === "phone" ? phoneCard() : CLINIC.find((item) => item.id === id);
  if (!card) return missing();
  const reason = typeof card.reason === "string" ? card.reason : t(card.reason);
  const story = card.live ? card.story : t(card.story);
  const contact = card.live ? card.contact : (state.metrics.clinicAck?.[card.id] ? L("You marked a call today.", "Marcó una llamada hoy.") : t(card.contact));
  const speak = `${card.name}. ${levelLabel(card.level)}. ${reason} ${story}`;
  return view(`
    ${backLink("/clinic", L("All patients", "Todos los pacientes"))}
    ${h(levelLabel(card.level), esc(card.name), esc(showDay(card)))}
    <section class="block card">
      <h2>${L("Summary", "Resumen")}</h2>
      <p>${esc(story)}</p>
      <p class="fine">${procedureOf(card)} · ${surgeonOf(card)} · ${billingOf(card)}</p>
    </section>
    <p class="status status-${card.level}">${esc(reason)}</p>
    <ul class="plain">
      <li>${L("Pain", "Dolor")}: ${esc(card.pain)}</li>
      <li>${L("Steps", "Pasos")}: ${esc(card.steps)}</li>
      <li>${L("Bend", "Flexión")}: ${esc(card.bend)}</li>
      <li>${L("Exercises", "Ejercicios")}: ${esc(card.exercises)}</li>
      <li>${esc(contact)}</li>
    </ul>
    <p class="lede">${esc(story)}</p>
    ${state.metrics.clinicNote?.[card.id] ? `<p class="banner">${L("Note saved on this desk.", "Nota guardada en este escritorio.")}</p>` : ""}
    <div class="stack">
      ${btn(L("I called them", "Ya los llamé"), `data-action="called" data-id="${card.id}"`)}
      ${btn(L("Save a short note", "Guardar una nota corta"), `data-action="note" data-id="${card.id}"`, "secondary")}
      ${card.live ? btn(L("Open their messages", "Abrir sus mensajes"), 'data-href="/messages"', "secondary") : ""}
    </div>
  `, speak, { nav: "clinic", active: "patients" });
}

function summary() {
  const cards = allCards();
  const surgeonCards = cards.filter((card) => card.level === "high");
  const watch = cards.filter((card) => card.level === "watch").length;
  const ok = cards.filter((card) => card.level === "ok").length;
  const noted = Boolean(state.metrics.summaryNoted);
  const speak = surgeonCards.length
    ? L(
      `${surgeonCards.length} names need a surgeon's eye. Therapy is already handling the calls. The other patients stay with the therapy team. Nothing to type and nothing to sign.`,
      `${surgeonCards.length} nombres necesitan la mirada del cirujano. Terapia ya está haciendo las llamadas. Los demás se quedan con el equipo de terapia. Nada que escribir y nada que firmar.`,
    )
    : L(
      "Nothing for the surgeon today. Therapy is watching the panel.",
      "Hoy no hay nada para el cirujano. Terapia está mirando el panel.",
    );
  return view(`
    <section class="hero-card hero-blue bleed">
      <p class="kicker">${L("For Dr. Anita Patel", "Para la Dra. Anita Patel")}</p>
      <h1>${surgeonCards.length ? L("A short list, already in motion.", "Una lista corta, ya en marcha.") : L("Nothing for you today.", "Hoy no hay nada para usted.")}</h1>
      <p>${L("Prepared by Sarah Chen, PT. Nothing to enter.", "Preparado por Sarah Chen, PT. Nada que ingresar.")}</p>
    </section>
    <p class="lede">${speak}</p>
    <ul class="plain">
      <li>${L(`${cards.length} patients on this sample panel`, `${cards.length} pacientes en este panel de muestra`)}</li>
      <li>${L(`${ok} on track`, `${ok} van bien`)}</li>
      <li>${L(`${watch} being coached by therapy`, `${watch} los acompaña terapia`)}</li>
    </ul>
    <div class="stack">
      ${surgeonCards.map((card) => {
        const called = card.live ? state.metrics.clinicAck?.phone : state.metrics.clinicAck?.[card.id] || card.id === "robert" || card.id === "elena";
        const reason = typeof card.reason === "string" ? card.reason : t(card.reason);
        return `<article class="letter"><h2>${esc(card.name)}</h2><p>${esc(reason)}</p><p>${called ? L("Therapy already marked a call.", "Terapia ya marcó una llamada.") : L("Therapy has not marked a call yet.", "Terapia todavía no marca una llamada.")}</p></article>`;
      }).join("")}
    </div>
    ${noted ? `<p class="banner">${L("You noted this today. Therapy keeps watching.", "Hoy usted tomó nota. Terapia sigue pendiente.")}</p>` : ""}
    <p class="fine">${L("Covered by most Medicare and Medicare Advantage plans. Your usual copay may apply.", "Cubierto por la mayoría de los planes de Medicare y Medicare Advantage. Puede aplicar su copago habitual.")}</p>
  `, speak, {
    nav: "clinic",
    active: "summary",
    footer: noted ? "" : btn(L("Noted. No change from me.", "Anotado. No cambio nada."), 'data-action="noted"'),
  });
}

function missing() {
  return view(`
    ${h(L("Missing page", "Página no está"), L("That screen is not in this sample.", "Esa pantalla no está en esta muestra."), "")}
    ${btn(L("Go to the start", "Ir al inicio"), 'data-href="/welcome"')}
  `, L("That screen is not in this sample.", "Esa pantalla no está en esta muestra."), { nav: "none" });
}

export function renderRoute(route) {
  switch (route.name) {
    case "welcome": return welcome();
    case "setup": return setup();
    case "today": return today();
    case "move": return move();
    case "exercise": return exercise();
    case "checkin": return checkin();
    case "alert": return alert(false);
    case "alert-sample": return alert(true);
    case "emergency": return emergency();
    case "questions": return questions();
    case "activity": return activity();
    case "bend": return bend();
    case "track": return track();
    case "messages": return messages();
    case "call": return call();
    case "visit": return visit();
    case "learn": return learn();
    case "reminders": return reminders();
    case "prep": return prep();
    case "more": return more();
    case "clinic": {
      const pages = ["alerts", "calls", "billing", "docs", "settings"];
      if (!route.id) return clinic("patients");
      if (pages.includes(route.id)) return clinic(route.id);
      return clinicDetail();
    }
    case "summary": return summary();
    default: return missing();
  }
}

export function celebrateCopy(id) {
  const item = MILESTONES.find((entry) => entry.id === id);
  if (!item) return { title: L("Nice work", "Bien hecho"), detail: "" };
  return { title: t(item.title), detail: t(item.detail) };
}
