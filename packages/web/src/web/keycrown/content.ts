export const tiers = ["Beginner", "Novice", "Intermediate", "Advanced", "Expert", "Master"];
export const tierNotes = [
  "Build muscle memory from the home row.",
  "Reach every row without looking down.",
  "Find your rhythm in everyday writing.",
  "Keep your pace through symbols and numbers.",
  "Stay precise in demanding text and code.",
  "Prove your speed, accuracy, and endurance.",
];
export const ranks = ["Peasant", "Squire", "Knight", "Noble", "Royal", "Emperor"];
export const rankXP = [0, 150, 400, 800, 1500, 2600];
export function rankFor(xp: number) {
  return rankXP.reduce((r, x, i) => (xp >= x ? i : r), 0);
}
export type Lesson = {
  id: number;
  tier: number;
  name: string;
  focus: string;
  text: string;
  wpm: number;
  accuracy: number;
  seconds?: number;
};
const programs: Omit<Lesson, "id" | "tier" | "accuracy">[][] = [
  [
    {
      name: "The Home Row",
      focus: "ASDF · JKL;",
      text: "asdf jkl; fdsa ;lkj asdf jkl; ff jj dd kk ss ll aa ;;",
      wpm: 8,
    },
    {
      name: "Index Finger Reach",
      focus: "F · G · H · J",
      text: "fgf jhj fjfj ghgh fgjh hgjf gfg jhj hag jag flag flask",
      wpm: 10,
    },
    {
      name: "Home Row Words",
      focus: "Home row combinations",
      text: "ask fall glad glass dash hall salad shall flash flask add all",
      wpm: 12,
    },
  ],
  [
    {
      name: "Top Row",
      focus: "QWERTY · UIOP",
      text: "qwer tyui op qw er ty ui op quit wire type rope power writer quiet trip",
      wpm: 14,
    },
    {
      name: "Bottom Row",
      focus: "ZXCV · BNM",
      text: "zxcv bnm vxcz mnb mix zen box cab van zoom climb move name calm",
      wpm: 16,
    },
    {
      name: "Across the Alphabet",
      focus: "All 26 letters",
      text: "pack my box with five dozen liquor jugs then grab six warm quilts and jump",
      wpm: 18,
    },
  ],
  [
    {
      name: "The Common Ground",
      focus: "High-frequency words",
      text: "the people who make time for small things often find that life feels a little more like their own",
      wpm: 20,
    },
    {
      name: "Capitals & Shift",
      focus: "Uppercase letters",
      text: "On Monday we left London for a quiet village. Maria and Jules met us at the station.",
      wpm: 23,
    },
    {
      name: "The Pause Between",
      focus: "Periods, commas, and questions",
      text: "Will it rain today? Bring a coat, a hat, and a pair of boots. If the sky clears, we can walk home.",
      wpm: 26,
    },
  ],
  [
    {
      name: "Number Line",
      focus: "Digits and decimals",
      text: "01234 56789 42 365 1.618 2026 128 16:45 0.001 12,345 789 60 9000 512",
      wpm: 28,
    },
    {
      name: "Signs & Symbols",
      focus: "Shifted symbols",
      text: "Save 20% today! Order #128 includes 3 x $15 + $4.50. Send a note to hello@example.com.",
      wpm: 30,
    },
    {
      name: "Steady Acceleration",
      focus: "Long paragraphs",
      text: "The first mile felt slow, but the runner kept an even pace. By the footbridge, breathing and footsteps had settled into a rhythm. With the finish in sight, there was still enough energy for a final sprint.",
      wpm: 34,
    },
  ],
  [
    {
      name: "Code Craft",
      focus: "Brackets, operators, and quotes",
      text: 'const scores = [12, 24, 36]; const best = scores.filter((score) => score >= 20); console.log("Top scores:", best);',
      wpm: 34,
    },
    {
      name: "Quote Keeper",
      focus: "Quotes and mixed punctuation",
      text: '"Wait," she said, "there is one more thing." He turned the key (a small, worn brass one) and opened the door; nothing moved.',
      wpm: 38,
    },
    {
      name: "Precision Protocol",
      focus: "Mixed case and symbols",
      text: 'Ticket QC-204: User_ID=8aB7; retry in 0.25s. Keep "readOnly" set to true, then check /var/log/app.log.',
      wpm: 40,
    },
  ],
  [
    {
      name: "The Long Run",
      focus: "Endurance · 120 seconds",
      seconds: 120,
      text: "An old clock looked down over the workshop. Each time its hand moved, the sound seemed to change. Some ticks were sharp; others were soft enough to vanish into the noise of the street. Outside, a bicycle rolled past the window.",
      wpm: 45,
    },
    {
      name: "Flawless Form",
      focus: "No-error challenge",
      text: "Accuracy comes first. Slow down when the pattern changes, then build the pace again. A clear rhythm beats a hurried guess.",
      wpm: 48,
    },
    {
      name: "The Crown Test",
      focus: "The final mixed-text trial",
      text: 'At 07:45, the gates opened. "Ready?" called the marshal. Six riders crossed the courtyard, split into teams of three, and settled beneath the clock. The final tally read: North 128, South 126. It was close enough that every last point mattered.',
      wpm: 55,
    },
  ],
];
export const lessons: Lesson[] = programs.flatMap((p, tier) =>
  p.map((l, i) => ({
    ...l,
    id: tier * 3 + i,
    tier,
    accuracy: l.name === "Flawless Form" ? 100 : tier === 5 ? 98 : 95,
  })),
);
export const languages = ["English", "Español", "Français"] as const;
export type Language = (typeof languages)[number];
export const difficulty = [
  "Easy words",
  "Common words",
  "Sentences",
  "Punctuation",
  "Numbers",
  "Code snippets",
] as const;
export type Difficulty = (typeof difficulty)[number];
const corpus = {
  English: {
    easy: "the path this that from work into time feel hand little calm green bright fire book open fine rain pace walk light warm rose pond hill word line air silk key crown wish dawn wind sand dusk moon wave glow soft gold leaf gray frost bird seed fern mist reed woods lake dust snow ink pine stone",
    common:
      "about people through little between around another should under being simple practice however world while never school change think rhythm follow building story give right hand point great would after number part become against problem during place paper improve often study group system fact important different write happen course public present together quiet steady",
    sentences: [
      "A little practice each day can make a remarkable difference.",
      "The mist lifted slowly from the hills as the sun reached the valley.",
      "The best way to build speed is to start with a steady rhythm.",
      "She kept a small journal beside the window and wrote in it every morning.",
      "The first step always feels slower than the next.",
    ],
    punct: [
      '"Where are we going?" he asked, looking down the road.',
      "The bag contained three things: a key, a note, and an old map.",
      "Keep the receipt (you might need it later), and ask for a copy.",
      'She looked back; the light was gone. "Wait!"',
    ],
  },
  Español: {
    easy: "casa sol luna agua mano llave cielo vida campo luz pan sal dos día río rosa flor aire nube hoja gato perro mesa voz paso oro calma rápido cerca tierra mar fuego estrella puente reloj ciudad verde",
    common:
      "donde tiempo cuando mundo camino palabra persona pequeño primero ahora siempre cuenta historia nuevo escribir caminar aprender después mirar mañana tarde hacer pensar trabajar lugar manos mientras desde cada sobre otras ritmo",
    sentences: [
      "Cada día aprendo algo nuevo.",
      "La luna se refleja en el agua tranquila.",
      "Una palabra a la vez, el ritmo se vuelve natural.",
      "Mañana iremos al río con nuestros amigos.",
    ],
    punct: [
      "¿Dónde está la llave? ¡Mira debajo de la mesa!",
      "Trae tres cosas: agua, pan y queso.",
      'Ana dijo: "Mañana será un buen día".',
    ],
  },
  Français: {
    easy: "jour nuit lune ciel main eau mot feu jeu chat chien porte table ami arbre vent pluie soleil vite calme clé été école lampe bleu vert or roi page fleur neige ombre étoile chemin voix",
    common:
      "maison toujours bientôt ensemble écrire encore alors depuis aussi comme apprendre quelque souvent personne jamais travail prendre premier chaque après trouver autour fenêtre simple naturel autre avancer pendant temps rythme monde",
    sentences: [
      "Chaque jour apporte une occasion de mieux écrire.",
      "Le soleil se lève doucement derrière les arbres.",
      "Une lettre à la fois, le rythme devient naturel.",
      "Nous marchons près de la rivière avant le déjeuner.",
    ],
    punct: [
      'Il demanda : "Où est la clé ?"',
      "Du pain, du fromage et des fruits : tout est prêt !",
      "Elle prit un livre (son préféré), puis ouvrit la fenêtre.",
    ],
  },
};
const snippets = [
  "const next = (value) => value + 1;",
  "for (const key of Object.keys(data)) { total += data[key]; }",
  "if (items.length === 0) return null;",
  'console.log("Ready to begin?");',
  "const sorted = list.slice().sort((a, b) => a - b);",
  "await cache.put(request, response.clone());",
];
export const demoText =
  "the art of typing is not just about speed but about finding your rhythm and making every keystroke count with quiet confidence";
export function random(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
export function makeText(mode: Difficulty, lang: Language, count: number, seed: number) {
  const rng = random(seed);
  const c = corpus[lang];
  const list =
    mode === "Easy words"
      ? c.easy.split(" ")
      : mode === "Common words"
        ? c.common.split(" ")
        : mode === "Sentences"
          ? c.sentences
          : mode === "Punctuation"
            ? c.punct
            : mode === "Code snippets"
              ? snippets
              : null;
  const result: string[] = [];
  let n = 0;
  while (n < count) {
    const piece = list
      ? list[Math.floor(rng() * list.length)]!
      : String(Math.floor(rng() * 10 ** (1 + Math.floor(rng() * 5))));
    result.push(piece);
    n += piece.split(" ").length;
  }
  return result.join(" ").split(" ").slice(0, count).join(" ");
}
export function dateKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dailyText(day: string, lang: Language) {
  return makeText("Sentences", lang, 48, Number(day.replace(/-/g, "")));
}
