import { L } from "./store.js";

export const TEAM = {
  pt: { name: "Sarah Chen, PT", role: { en: "Physical therapist", es: "Fisioterapeuta" }, initials: "SC", phone: "(555) 010-0198" },
  pta: { name: "Jenna Ruiz, PTA", role: { en: "Physical therapist assistant", es: "Asistente de fisioterapia" }, initials: "JR", phone: "(555) 010-0144" },
  surgeon: { name: "Dr. Anita Patel", role: { en: "Surgeon", es: "Cirujana" }, initials: "AP", phone: "(555) 010-0142", office: { en: "Westlake Orthopedic", es: "Westlake Orthopedic" } },
};

const pair = (en, es) => ({ en, es });
export const t = (obj) => (obj ? obj[L("en", "es") === "es" ? "es" : "en"] : "");

export const EXERCISES = {
  knee: [
    { id: "heel-slides", kind: "reps", target: 10, name: pair("Heel slides", "Deslizamiento de talón"), why: pair("Helps the knee bend and straighten.", "Ayuda a doblar y estirar la rodilla."), motion: "slide" },
    { id: "quad-sets", kind: "reps", target: 10, name: pair("Thigh squeezes", "Apretar el muslo"), why: pair("Wakes up the muscle on the front of the thigh.", "Activa el músculo de enfrente del muslo."), motion: "quad" },
    { id: "ankle-pumps", kind: "reps", target: 20, name: pair("Ankle pumps", "Bombear los tobillos"), why: pair("Keeps blood moving in the lower leg.", "Ayuda a que la sangre se mueva en la pierna."), motion: "ankle" },
    { id: "short-walk", kind: "once", target: 1, name: pair("Short walk", "Caminata corta"), why: pair("A few minutes around the home is enough today.", "Unos minutos por la casa son suficientes hoy."), motion: "walk" },
  ],
  hip: [
    { id: "ankle-pumps", kind: "reps", target: 20, name: pair("Ankle pumps", "Bombear los tobillos"), why: pair("Keeps blood moving in the lower leg.", "Ayuda a que la sangre se mueva en la pierna."), motion: "ankle" },
    { id: "glute-sets", kind: "reps", target: 10, name: pair("Buttock squeezes", "Apretar los glúteos"), why: pair("Turns the hip muscles back on.", "Vuelve a encender los músculos de la cadera."), motion: "quad" },
    { id: "heel-slides", kind: "reps", target: 10, name: pair("Heel slides", "Deslizamiento de talón"), why: pair("Helps the hip and knee move again.", "Ayuda a que la cadera y la rodilla se muevan."), motion: "slide" },
    { id: "sit-stand", kind: "reps", target: 8, name: pair("Sit and stand", "Sentarse y pararse"), why: pair("Practice from a firm chair with your hands ready.", "Practique desde una silla firme, con las manos listas."), motion: "sit" },
    { id: "short-walk", kind: "once", target: 1, name: pair("Short walk", "Caminata corta"), why: pair("Use the walker or cane your therapist gave you.", "Use el andador o el bastón que le dio su terapeuta."), motion: "walk" },
  ],
  shoulder: [
    { id: "pendulum", kind: "reps", target: 10, name: pair("Easy arm swings", "Balanceo suave del brazo"), why: pair("Let the arm hang and swing a little. Do not force it.", "Deje colgar el brazo y muévalo un poco. No lo fuerce."), motion: "swing" },
    { id: "elbow-bend", kind: "reps", target: 10, name: pair("Elbow bends", "Doblar el codo"), why: pair("Bends and straightens the elbow.", "Dobla y estira el codo."), motion: "slide" },
    { id: "fist", kind: "reps", target: 10, name: pair("Open and close the hand", "Abrir y cerrar la mano"), why: pair("Keeps the hand from getting stiff.", "Evita que la mano se ponga rígida."), motion: "ankle" },
    { id: "blade", kind: "reps", target: 8, name: pair("Shoulder blade squeeze", "Juntar los omóplatos"), why: pair("A gentle squeeze, then relax.", "Un apretón suave y luego relaje."), motion: "quad" },
  ],
  pain: [
    { id: "easy-walk", kind: "once", target: 1, name: pair("Easy walk", "Caminata suave"), why: pair("Stop while you can still talk in full sentences.", "Pare mientras todavía pueda hablar con frases completas."), motion: "walk" },
    { id: "sit-stand", kind: "reps", target: 6, name: pair("Sit and stand", "Sentarse y pararse"), why: pair("Use a firm chair. Move slowly.", "Use una silla firme. Muévase despacio."), motion: "sit" },
    { id: "gentle-bend", kind: "reps", target: 8, name: pair("Gentle bend", "Doble suave"), why: pair("Move only in a range that feels safe today.", "Muévase solo en un rango que hoy se sienta seguro."), motion: "slide" },
    { id: "ankle-pumps", kind: "reps", target: 15, name: pair("Ankle pumps", "Bombear los tobillos"), why: pair("A simple move you can do in a chair.", "Un movimiento simple que puede hacer sentado."), motion: "ankle" },
  ],
  preop: [
    { id: "ankle-pumps", kind: "reps", target: 15, name: pair("Ankle pumps", "Bombear los tobillos"), why: pair("A move you can keep doing after surgery.", "Un movimiento que podrá seguir haciendo después de la cirugía."), motion: "ankle" },
    { id: "sit-stand", kind: "reps", target: 6, name: pair("Sit and stand", "Sentarse y pararse"), why: pair("Practice now, while standing is still easier.", "Practique ahora, mientras pararse es más fácil."), motion: "sit" },
    { id: "easy-walk", kind: "once", target: 1, name: pair("Easy walk", "Caminata suave"), why: pair("A short daily walk helps you get ready.", "Una caminata corta cada día ayuda a prepararse."), motion: "walk" },
    { id: "breath", kind: "reps", target: 5, name: pair("Slow breaths", "Respiraciones lentas"), why: pair("Breathe in through the nose and out through the mouth.", "Inhale por la nariz y exhale por la boca."), motion: "quad" },
  ],
};

export function exerciseList(profile) {
  if (!profile) return EXERCISES.knee;
  if (profile.track === "pain") return EXERCISES.pain;
  if (profile.when === "future") return EXERCISES.preop;
  return EXERCISES[profile.track] || EXERCISES.knee;
}

export const ARTICLES = [
  {
    id: "week",
    tag: pair("What to expect", "Qué esperar"),
    title: pair("Week by week", "Semana por semana"),
    summary: pair("A plain look at the first weeks. Your path can be slower or faster.", "Una mirada simple a las primeras semanas. Su camino puede ser más lento o más rápido."),
    body: {
      en: [
        "Every person heals at a different pace. This is a sample picture, not a promise. Follow the plan your own surgeon and therapist give you.",
        "Before surgery: get the home ready, plan a ride, and learn the exercises. The goal is to feel prepared, not perfect.",
        "The first week: rest, short walks, ice, and the starter exercises. Swelling and stiffness are common. Sharp pain, a fever, or a calf that hurts are reasons to call.",
        "Weeks 2 and 3: walks get a little longer. The joint should bend a little more. You may still need a walker or cane.",
        "Weeks 4 to 6: many people do more of their own day. Stairs and sleep may still be hard. Your therapist will say when to add harder moves.",
        "Later: strength and trust come back slowly. Tell your therapist if progress stalls for more than a few days.",
      ],
      es: [
        "Cada persona sana a un ritmo distinto. Esto es una muestra, no una promesa. Siga el plan de su cirujano y de su terapeuta.",
        "Antes de la cirugía: prepare la casa, organice el transporte y aprenda los ejercicios. La meta es sentirse preparado.",
        "La primera semana: descanse, camine poco, ponga hielo y haga los ejercicios iniciales. La hinchazón y la rigidez son comunes. Dolor punzante, fiebre o dolor en la pantorrilla son motivos para llamar.",
        "Semanas 2 y 3: las caminatas se alargan un poco. La articulación debe doblar un poco más. Aún puede necesitar andador o bastón.",
        "Semanas 4 a 6: muchas personas retoman más de su día. Las escaleras y el sueño pueden seguir difíciles. Su terapeuta dirá cuándo avanzar.",
        "Después: la fuerza y la confianza vuelven poco a poco. Avise si el avance se detiene por varios días.",
      ],
    },
  },
  {
    id: "wound",
    tag: pair("The incision", "La herida"),
    title: pair("Caring for the wound", "Cuidado de la herida"),
    summary: pair("Keep it clean and dry, and know when to call.", "Manténgala limpia y seca, y sepa cuándo llamar."),
    body: {
      en: [
        "Wash your hands before you touch the dressing. Keep the wound dry until your surgeon says water is ok.",
        "Do not put cream, powder, or ointment on the incision unless your surgeon told you to.",
        "A little bruising can be normal. Call the surgeon if redness spreads, drainage increases, the wound opens, or you have a fever.",
        "This sample does not look at a real wound. If you are worried, call the office. Do not wait on an app message.",
      ],
      es: [
        "Lávese las manos antes de tocar el vendaje. Mantenga la herida seca hasta que su cirujano diga que el agua está bien.",
        "No ponga crema, talco ni ungüento en la herida, a menos que su cirujano se lo haya indicado.",
        "Un poco de moretón puede ser normal. Llame al cirujano si el enrojecimiento se extiende, sale más líquido, la herida se abre o tiene fiebre.",
        "Esta muestra no mira una herida real. Si está preocupado, llame al consultorio. No espere un mensaje en la aplicación.",
      ],
    },
  },
  {
    id: "falls",
    tag: pair("Safety", "Seguridad"),
    title: pair("How to avoid a fall", "Cómo evitar una caída"),
    summary: pair("Slow steps, clear floors, and a light on at night.", "Pasos lentos, piso despejado y una luz de noche."),
    body: {
      en: [
        "Wear closed shoes that stay on. Skip socks without grips and floppy slippers.",
        "Move throw rugs, cords, and pets out of the walking path. Turn on a light before you get up at night.",
        "Use the walker, cane, or rail your therapist recommended. Stand up slowly and wait before you step.",
        "Ask someone to walk with you if you feel dizzy. If you do fall, call your surgeon's office even if you feel fine.",
      ],
      es: [
        "Use zapatos cerrados que no se salgan. Evite calcetines sin agarre y pantuflas sueltas.",
        "Quite tapetes, cables y mascotas del camino. Encienda una luz antes de levantarse de noche.",
        "Use el andador, el bastón o el pasamanos que recomendó su terapeuta. Párese despacio y espere antes de caminar.",
        "Pida que alguien lo acompañe si se siente mareado. Si se cae, llame al consultorio del cirujano aunque se sienta bien.",
      ],
    },
  },
  {
    id: "call",
    tag: pair("When to call", "Cuándo llamar"),
    title: pair("When to call the doctor", "Cuándo llamar al médico"),
    summary: pair("Some things can wait for a message. Some things cannot.", "Algunas cosas pueden esperar un mensaje. Otras no."),
    body: {
      en: [
        "Call your surgeon's office the same day for a fever, a calf that hurts or swells on one side, a wound that is redder, draining, or opening, or pain that suddenly becomes much worse.",
        "Call 911 for chest pain, trouble breathing, heavy bleeding that will not stop, a face that droops, sudden weakness, or if you feel you might pass out.",
        "Message your therapist if an exercise feels too hard, if soreness after exercise does not settle, or if you missed a few days.",
        "Do not wait for a reply in the app when the problem is a fever, a calf, a wound, or trouble breathing.",
      ],
      es: [
        "Llame el mismo día al consultorio del cirujano por fiebre, dolor o hinchazón en una pantorrilla, una herida más roja, con secreción o abierta, o un dolor que de pronto empeora mucho.",
        "Llame al 911 por dolor en el pecho, dificultad para respirar, un sangrado que no para, la cara caída, debilidad súbita, o si siente que puede desmayarse.",
        "Escriba a su terapeuta si un ejercicio es demasiado difícil, si el dolor después del ejercicio no cede, o si faltó varios días.",
        "No espere una respuesta en la aplicación si hay fiebre, dolor en la pantorrilla, un problema de la herida o dificultad para respirar.",
      ],
    },
  },
  {
    id: "ice",
    tag: pair("Comfort", "Alivio"),
    title: pair("Ice, rest, and swelling", "Hielo, descanso e hinchazón"),
    summary: pair("Swelling after a walk is common if it goes down with rest.", "La hinchazón después de caminar es común si baja con el descanso."),
    body: {
      en: [
        "Lie down and raise the leg on pillows if your surgeon said that is ok. Do not put a pillow only under the knee if you were told to keep it straight.",
        "Use ice wrapped in a cloth for about 15 minutes. Do not put ice directly on skin.",
        "If swelling stays up, the calf hurts, or one leg is much bigger, call your surgeon.",
      ],
      es: [
        "Acuéstese y eleve la pierna sobre almohadas si su cirujano lo permitió. No ponga una almohada solo bajo la rodilla si le pidieron mantenerla recta.",
        "Use hielo envuelto en un paño por unos 15 minutos. No ponga el hielo directo sobre la piel.",
        "Si la hinchazón no baja, la pantorrilla duele, o una pierna está mucho más grande, llame a su cirujano.",
      ],
    },
  },
  {
    id: "sleep",
    tag: pair("Daily life", "Vida diaria"),
    title: pair("Sleep and getting comfortable", "Sueño y comodidad"),
    summary: pair("Nights are often the hard part. A steady spot helps.", "Las noches suelen ser la parte difícil. Un lugar fijo ayuda."),
    body: {
      en: [
        "Many people sleep better in a recliner or with pillows around the joint for the first weeks.",
        "Take pain medicine on the schedule your surgeon gave you, including a dose before bed if they said to.",
        "If you cannot sleep because of new calf pain, chest pain, or trouble breathing, call. Do not wait until morning.",
      ],
      es: [
        "Muchas personas duermen mejor en un sillón reclinable o con almohadas alrededor de la articulación las primeras semanas.",
        "Tome la medicina para el dolor en el horario que le dio su cirujano, incluso una dosis antes de dormir si se lo indicaron.",
        "Si no puede dormir por un dolor nuevo en la pantorrilla, dolor en el pecho o falta de aire, llame. No espere a la mañana.",
      ],
    },
  },
  {
    id: "ready",
    tag: pair("Before surgery", "Antes de la cirugía"),
    title: pair("Get the home ready", "Prepare la casa"),
    summary: pair("A few changes now make the first days safer.", "Unos cambios ahora hacen más seguros los primeros días."),
    body: {
      en: [
        "Pick a firm chair with arms. Place a phone charger, water, and your medicines where you can reach them without bending low.",
        "Clear a path from the bed to the bathroom. Add a night light. Ask someone to stay the first night if you can.",
        "Plan the ride home before the surgery day. You will not be able to drive yourself.",
        "Write your questions for the surgeon now, while you have time to think.",
      ],
      es: [
        "Elija una silla firme con apoyabrazos. Deje el cargador, agua y medicinas donde pueda alcanzarlos sin agacharse.",
        "Despeje el camino de la cama al baño. Ponga una luz de noche. Pida que alguien se quede la primera noche si puede.",
        "Organice el transporte a casa antes del día de la cirugía. No podrá conducir.",
        "Escriba ahora sus preguntas para el cirujano, con tiempo para pensar.",
      ],
    },
  },
  {
    id: "questions",
    tag: pair("Before surgery", "Antes de la cirugía"),
    title: pair("Questions for your surgeon", "Preguntas para su cirujano"),
    summary: pair("Take this list to the visit. Add your own.", "Lleve esta lista a la cita. Agregue las suyas."),
    body: {
      en: [
        "Which medicines should I stop, and which should I keep taking?",
        "How will I get home, and who should stay with me the first night?",
        "When can I shower, climb stairs, and drive?",
        "What pain and swelling are expected, and what should make me call the same day?",
      ],
      es: [
        "¿Qué medicinas debo suspender y cuáles debo seguir tomando?",
        "¿Cómo vuelvo a casa y quién debe quedarse conmigo la primera noche?",
        "¿Cuándo puedo ducharme, subir escaleras y conducir?",
        "¿Qué dolor e hinchazón son esperables y qué debe hacerme llamar el mismo día?",
      ],
    },
  },
  {
    id: "medicine",
    tag: pair("Medicines", "Medicinas"),
    title: pair("Pain medicine, in plain words", "Medicina para el dolor, en palabras simples"),
    summary: pair("Take only what your surgeon told you to take.", "Tome solo lo que su cirujano le indicó."),
    body: {
      en: [
        "This app can remind you. It does not choose a dose. The label on your bottle and your surgeon's instructions are the ones to follow.",
        "Many people use a regular pain reliever plus a short course of a stronger pain pill. Your surgeon decides if that is right for you.",
        "A medicine that lowers the chance of a blood clot is different from pain medicine. Do not skip it unless the office tells you to.",
        "Call the office if pain stays very high, if the medicine makes you too sleepy, or if your stomach is getting sick.",
      ],
      es: [
        "Esta aplicación puede recordarle. No elige una dosis. Siga la etiqueta del frasco y las indicaciones de su cirujano.",
        "Muchas personas usan un calmante común y, por poco tiempo, una pastilla más fuerte. Su cirujano decide si eso es adecuado para usted.",
        "La medicina que reduce el riesgo de un coágulo es distinta de la medicina para el dolor. No la suspenda a menos que el consultorio se lo diga.",
        "Llame al consultorio si el dolor sigue muy alto, si la medicina lo pone demasiado somnoliento, o si el estómago se enferma.",
      ],
    },
  },
];

export function articleById(id) {
  return ARTICLES.find((item) => item.id === id) || ARTICLES[0];
}

export function dailyTipId(profile) {
  if (!profile) return "ice";
  if (profile.track === "pain") return ["ice", "falls", "sleep"][Math.abs(daysSafe(profile)) % 3];
  if (profile.when === "future") return ["ready", "questions", "falls"][Math.abs(daysSafe(profile)) % 3];
  return ["ice", "falls", "week", "sleep", "wound"][Math.abs(daysSafe(profile)) % 5];
}

function daysSafe(profile) {
  if (!profile?.date) return 0;
  const [y, m, d] = profile.date.split("-").map(Number);
  const a = Date.UTC(y, m - 1, d);
  const b = Date.UTC(2026, 10, 21);
  return Math.round((b - a) / 86400000);
}

export const QUESTIONS = {
  knee: [
    pair("How much does the knee hurt when you walk across a room?", "¿Cuánto duele la rodilla al cruzar una habitación?"),
    pair("How much does the knee hurt on stairs?", "¿Cuánto duele la rodilla en las escaleras?"),
    pair("How stiff is the knee after you have been sitting?", "¿Qué tan rígida queda la rodilla después de estar sentado?"),
    pair("How hard is it to stand up from a chair?", "¿Qué tan difícil es pararse de una silla?"),
    pair("How sure do you feel on this knee during a normal day?", "¿Qué tan seguro se siente con esta rodilla en un día normal?"),
  ],
  hip: [
    pair("How much does the hip hurt when you walk across a room?", "¿Cuánto duele la cadera al cruzar una habitación?"),
    pair("How hard is it to stand up after sitting?", "¿Qué tan difícil es pararse después de estar sentado?"),
    pair("How hard is it to put on socks or shoes?", "¿Qué tan difícil es ponerse calcetines o zapatos?"),
    pair("How much does the hip hurt if you sit for a while?", "¿Cuánto duele la cadera si se sienta un rato?"),
    pair("How sure do you feel on this hip during a normal day?", "¿Qué tan seguro se siente con esta cadera en un día normal?"),
  ],
  shoulder: [
    pair("How much does the shoulder hurt when you reach up?", "¿Cuánto duele el hombro al alcanzar algo arriba?"),
    pair("How much does it hurt to lift a light bag?", "¿Cuánto duele levantar una bolsa ligera?"),
    pair("How hard is it to wash your hair?", "¿Qué tan difícil es lavarse el cabello?"),
    pair("How much does it hurt to lie on that side?", "¿Cuánto duele acostarse de ese lado?"),
    pair("How sure do you feel using this arm during a normal day?", "¿Qué tan seguro se siente al usar este brazo en un día normal?"),
  ],
  pain: [
    pair("How much did the sore spot hurt while you were resting?", "¿Cuánto dolió la zona adolorida mientras descansaba?"),
    pair("How much did it hurt when you moved around the home?", "¿Cuánto dolió al moverse por la casa?"),
    pair("How much did pain limit what you wanted to do today?", "¿Cuánto limitó el dolor lo que quería hacer hoy?"),
    pair("How was your sleep last night?", "¿Cómo durmió anoche?"),
    pair("How sure did you feel moving around today?", "¿Qué tan seguro se sintió al moverse hoy?"),
  ],
};

export const ANSWERS = [
  { value: 4, label: pair("Not at all", "Nada") },
  { value: 3, label: pair("A little", "Un poco") },
  { value: 2, label: pair("Some", "Regular") },
  { value: 1, label: pair("A lot", "Mucho") },
  { value: 0, label: pair("I cannot do it", "No puedo hacerlo") },
];

export const CLINIC = [
  {
    id: "robert",
    name: "Robert Hale",
    age: 74,
    track: "knee",
    side: "right",
    day: "Day 9",
    dayEs: "Día 9",
    level: "high",
    surgeon: true,
    reason: pair("Fever and a wound that looks redder this morning.", "Fiebre y una herida que se ve más roja esta mañana."),
    pain: "6",
    steps: "640",
    bend: "70°",
    exercises: "1 of 4",
    contact: pair("Therapy called at 8:40 AM.", "Terapia llamó a las 8:40 a. m."),
    story: pair("Sarah asked him to call Dr. Patel today. He said he would. He is resting at home with his daughter nearby.", "Sarah le pidió llamar hoy a la Dra. Patel. Él dijo que lo haría. Está en casa, con su hija cerca."),
  },
  {
    id: "elena",
    name: "Elena Vasquez",
    age: 71,
    track: "hip",
    side: "left",
    day: "Day 12",
    dayEs: "Día 12",
    level: "high",
    surgeon: true,
    reason: pair("New pain in one calf, reported on this morning's check-in.", "Dolor nuevo en una pantorrilla, anotado en el registro de esta mañana."),
    pain: "5",
    steps: "980",
    bend: "78°",
    exercises: "3 of 5",
    contact: pair("Therapy called at 9:05 AM.", "Terapia llamó a las 9:05 a. m."),
    story: pair("Jenna reached Elena and told her to call the surgeon now. Elena is on her way to the office.", "Jenna habló con Elena y le dijo que llamara ahora al cirujano. Elena va camino al consultorio."),
  },
  {
    id: "dorothy",
    name: "Dorothy Ellis",
    age: 80,
    track: "knee",
    side: "left",
    day: "Day 22",
    dayEs: "Día 22",
    level: "watch",
    surgeon: false,
    reason: pair("No check-in for 3 days. Pain was going up before that.", "Sin registro por 3 días. El dolor iba subiendo antes de eso."),
    pain: "7",
    steps: "400",
    bend: "84°",
    exercises: "0 of 4",
    contact: pair("No call marked yet today.", "Hoy no hay una llamada marcada."),
    story: pair("A good person for a same-day phone call. No fever, calf pain, or wound problem is on file.", "Es una buena persona para una llamada hoy mismo. No hay fiebre, dolor de pantorrilla ni problema de herida anotado."),
  },
  {
    id: "james",
    name: "James Whitaker",
    age: 66,
    track: "shoulder",
    side: "right",
    day: "Day 16",
    dayEs: "Día 16",
    level: "watch",
    surgeon: false,
    reason: pair("Exercises missed for 4 days. Pain is steady, not rising.", "Lleva 4 días sin ejercicios. El dolor está estable, no sube."),
    pain: "4",
    steps: "2200",
    bend: "86°",
    exercises: "0 of 4",
    contact: pair("Message sent yesterday.", "Mensaje enviado ayer."),
    story: pair("He is walking. He is skipping the arm moves. A short reminder is enough unless he reports a warning sign.", "Está caminando. Está saltando los ejercicios del brazo. Un recordatorio corto basta, a menos que reporte una señal de alerta."),
  },
  {
    id: "aisha",
    name: "Aisha Rahman",
    age: 63,
    track: "hip",
    side: "right",
    day: "Day 40",
    dayEs: "Día 40",
    level: "ok",
    surgeon: false,
    reason: pair("Check-ins and exercises are in. Pain is low.", "Los registros y los ejercicios están hechos. El dolor es bajo."),
    pain: "2",
    steps: "4100",
    bend: "100°",
    exercises: "5 of 5",
    contact: pair("Routine call last week.", "Llamada de rutina la semana pasada."),
    story: pair("On the sample path. No action today.", "Va en el camino de muestra. Hoy no hay nada que hacer."),
  },
  {
    id: "luis",
    name: "Luis Ortega",
    age: 69,
    track: "knee",
    side: "right",
    day: "Day 60",
    dayEs: "Día 60",
    level: "ok",
    surgeon: false,
    reason: pair("Ahead of the sample bend path. Walking every day.", "Va adelante en la flexión de muestra. Camina todos los días."),
    pain: "1",
    steps: "5300",
    bend: "122°",
    exercises: "4 of 4",
    contact: pair("No contact needed this week.", "Esta semana no hace falta contactarlo."),
    story: pair("Celebrate and keep the plan. Nothing for the surgeon.", "Hay que felicitarlo y seguir el plan. Nada para el cirujano."),
  },
  {
    id: "tom",
    name: "Tom Nguyen",
    age: 58,
    track: "pain",
    side: "",
    day: "Week 6, no surgery",
    dayEs: "Semana 6, sin cirugía",
    level: "ok",
    surgeon: false,
    reason: pair("Joint pain plan. Pain is down from last week.", "Plan para dolor articular. El dolor bajó desde la semana pasada."),
    pain: "3",
    steps: "3600",
    bend: "Comfort up",
    exercises: "3 of 4",
    contact: pair("Checked in this morning.", "Hizo su registro esta mañana."),
    story: pair("Non-surgical track. Therapy is coaching the walks. No surgeon task.", "Camino sin cirugía. Terapia acompaña las caminatas. No hay tarea para el cirujano."),
  },
  {
    id: "helen",
    name: "Helen Cho",
    age: 72,
    track: "knee",
    side: "left",
    day: "Surgery in 5 days",
    dayEs: "Cirugía en 5 días",
    level: "ok",
    surgeon: false,
    reason: pair("Getting ready. Home checklist is done.", "Se está preparando. La lista de la casa está hecha."),
    pain: "3",
    steps: "2500",
    bend: "Not started",
    exercises: "3 of 4",
    contact: pair("Pre-surgery class completed.", "Completó la clase previa a la cirugía."),
    story: pair("She has a ride home and a chair with arms. No office task.", "Tiene transporte a casa y una silla con apoyabrazos. No hay tarea para el consultorio."),
  },
];

export const DEMO = [
  { href: "/welcome", title: pair("This is Recoveroo", "Esto es Recoveroo"), body: pair("Patients use only their phone. A therapist watches and reaches out when something is off.", "El paciente usa solo su teléfono. Un terapeuta revisa y llama cuando algo no va bien.") },
  { href: "/setup/track", title: pair("Setup is a few big steps", "La preparación son unos pasos grandes"), body: pair("Knee, hip, shoulder, or pain without surgery. A family member can tap for them.", "Rodilla, cadera, hombro, o dolor sin cirugía. Un familiar puede tocar la pantalla por ellos.") },
  { href: "/today", title: pair("Today has three jobs", "Hoy hay tres tareas"), body: pair("Exercises, a short check-in, and one lesson. One big button starts the next job.", "Ejercicios, un registro corto y una lección. Un botón grande empieza la siguiente tarea.") },
  { href: "/exercise/quad-sets", title: pair("Moves are simple to follow", "Los ejercicios son fáciles de seguir"), body: pair("A video placeholder, a big counter, and a choice: too easy, just right, or too hard.", "Un video de muestra, un contador grande y una opción: muy fácil, bien así, o muy difícil.") },
  { href: "/checkin/pain", title: pair("One question at a time", "Una pregunta a la vez"), body: pair("Pain, swelling, sleep, medicines, and warning signs. No long forms on one screen.", "Dolor, hinchazón, sueño, medicinas y señales de alerta. No hay formularios largos en una sola pantalla.") },
  { href: "/bend", title: pair("The phone checks the bend", "El teléfono revisa la flexión"), body: pair("A sample camera guide. No extra device. The real camera stays off in this demo.", "Una guía de cámara de muestra. Sin aparato extra. En esta demo la cámara real queda apagada.") },
  { href: "/track", title: pair("A simple on-track view", "Una vista simple de si va bien"), body: pair("A plain status and a sample recovery curve. Badges mark the milestones.", "Un estado claro y una curva de recuperación de muestra. Las insignias marcan los logros.") },
  { href: "/messages", title: pair("Message or call the therapist", "Escriba o llame al terapeuta"), body: pair("Sarah Chen leads the team. One tap starts a sample call. Nothing is sent to a real clinic.", "Sarah Chen dirige el equipo. Un toque inicia una llamada de muestra. No se envía nada a una clínica real.") },
  { href: "/learn", title: pair("Lessons in plain words", "Lecciones en palabras simples"), body: pair("What to expect, wound care, falls, and when to call the doctor.", "Qué esperar, cuidado de la herida, caídas y cuándo llamar al médico.") },
  { href: "/reminders", title: pair("Medicines and visits", "Medicinas y citas"), body: pair("Big reminders. The app does not choose a dose.", "Recordatorios grandes. La aplicación no elige una dosis.") },
  { href: "/alert-sample", title: pair("Warning signs say who to call", "Las alertas dicen a quién llamar"), body: pair("Fever, calf pain, or wound trouble opens clear steps: call the surgeon, or call 911.", "Fiebre, dolor en la pantorrilla o problema de la herida abre pasos claros: llamar al cirujano o al 911.") },
  { href: "/clinic", title: pair("Therapy sees who needs them", "Terapia ve quién la necesita"), body: pair("The list puts warning signs first. People on track stay quiet at the bottom.", "La lista pone primero las señales de alerta. Quienes van bien quedan abajo, en calma.") },
  { href: "/summary", title: pair("The surgeon's page is short", "La página del cirujano es corta"), body: pair("Two names, already called by therapy. Nothing to type and nothing to sign.", "Dos nombres, ya llamados por terapia. Nada que escribir y nada que firmar.") },
];

export const MILESTONES = [
  { id: "checkin", title: pair("First check-in", "Primer registro"), detail: pair("You told your therapist how the day felt.", "Le contó a su terapeuta cómo se sintió el día.") },
  { id: "bend90", title: pair("Bend past 90 degrees", "Flexión de más de 90 grados"), detail: pair("A common early goal after knee surgery.", "Una meta temprana común después de una cirugía de rodilla.") },
  { id: "steps2k", title: pair("2,000 steps in a day", "2,000 pasos en un día"), detail: pair("Your phone counted them. No extra device.", "Su teléfono los contó. Sin aparato extra.") },
  { id: "alldone", title: pair("All moves in one day", "Todos los ejercicios en un día"), detail: pair("You finished the list your therapist set.", "Terminó la lista que puso su terapeuta.") },
  { id: "questions", title: pair("Weekly questions", "Preguntas de la semana"), detail: pair("Five short questions, in our own words.", "Cinco preguntas cortas, con nuestras propias palabras.") },
];
