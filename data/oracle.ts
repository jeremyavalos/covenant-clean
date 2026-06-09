export type LocalizedText = {
  en: string;
  es: string;
};

export type DailyNumber = {
  number: number;
  title: LocalizedText;
  meaning: LocalizedText;
  reflection: LocalizedText;
};

export type TarotVisualSymbol =
  | "threshold"
  | "will"
  | "veil"
  | "garden"
  | "throne"
  | "pillar"
  | "union"
  | "chariot"
  | "flame"
  | "lantern"
  | "wheel"
  | "scales"
  | "suspension"
  | "gate"
  | "vessel"
  | "chain"
  | "tower"
  | "star"
  | "moon"
  | "sun"
  | "call"
  | "world";

export type TarotCard = {
  id: string;
  romanNumeral: string;
  name: LocalizedText;
  archetype: LocalizedText;
  meaning: LocalizedText;
  todayReflection: LocalizedText;
  question: LocalizedText;
  visualSymbol: TarotVisualSymbol;
};

export type DailyCounsel = {
  id: string;
  number: number;
  title: LocalizedText;
  statement: LocalizedText;
  explanation: LocalizedText;
  action: LocalizedText;
};

const NUMBER_TITLES: LocalizedText[] = [
  { en: "The Threshold", es: "El Umbral" },
  { en: "The Witness", es: "El Testigo" },
  { en: "The Flame", es: "La Llama" },
  { en: "The Builder", es: "El Constructor" },
  { en: "The Gate", es: "La Puerta" },
  { en: "The Vow", es: "El Voto" },
  { en: "The Mirror", es: "El Espejo" },
  { en: "The Hammer", es: "El Martillo" },
  { en: "The Root", es: "La Raíz" },
  { en: "The Watch", es: "La Guardia" },
  { en: "The Blade", es: "La Hoja" },
  { en: "The Vessel", es: "El Recipiente" },
  { en: "The Anchor", es: "El Ancla" },
  { en: "The Signal", es: "La Señal" },
  { en: "The Quiet", es: "La Quietud" },
  { en: "The Standard", es: "El Estandarte" },
  { en: "The Measure", es: "La Medida" },
  { en: "The Return", es: "El Regreso" },
  { en: "The Lantern", es: "La Linterna" },
  { en: "The Oath", es: "El Juramento" },
  { en: "The Stone", es: "La Piedra" },
  { en: "The Current", es: "La Corriente" },
  { en: "The Trial", es: "La Prueba" },
  { en: "The Seal", es: "El Sello" },
  { en: "The Line", es: "La Línea" },
  { en: "The Breath", es: "El Aliento" },
  { en: "The Compass", es: "La Brújula" },
  { en: "The Fast", es: "El Ayuno" },
  { en: "The Crown", es: "La Corona" },
  { en: "The Forge", es: "La Forja" },
  { en: "The Listening", es: "La Escucha" },
  { en: "The Cut", es: "El Corte" },
  { en: "The Offering", es: "La Ofrenda" },
  { en: "The Pillar", es: "El Pilar" },
  { en: "The Tide", es: "La Marea" },
  { en: "The Question", es: "La Pregunta" },
  { en: "The Field", es: "El Campo" },
  { en: "The Key", es: "La Llave" },
  { en: "The Chamber", es: "La Cámara" },
  { en: "The Spark", es: "La Chispa" },
  { en: "The Weight", es: "El Peso" },
  { en: "The Pact", es: "El Pacto" },
  { en: "The Step", es: "El Paso" },
  { en: "The Ash", es: "La Ceniza" },
  { en: "The Thread", es: "El Hilo" },
  { en: "The Cup", es: "La Copa" },
  { en: "The Bell", es: "La Campana" },
  { en: "The Law", es: "La Ley" },
  { en: "The Door", es: "La Entrada" },
  { en: "The Ledger", es: "El Registro" },
  { en: "The Ember", es: "La Brasa" },
  { en: "The North", es: "El Norte" },
  { en: "The Veil", es: "El Velo" },
  { en: "The Hand", es: "La Mano" },
  { en: "The Path", es: "El Camino" },
  { en: "The Rootfire", es: "El Fuego Raíz" },
  { en: "The Hour", es: "La Hora" },
  { en: "The Name", es: "El Nombre" },
  { en: "The Pattern", es: "El Patrón" },
  { en: "The Wall", es: "El Muro" },
  { en: "The River", es: "El Río" },
  { en: "The Edge", es: "El Filo" },
  { en: "The Shelter", es: "El Refugio" },
  { en: "The Command", es: "El Mandato" },
  { en: "The Pause", es: "La Pausa" },
  { en: "The Dark Road", es: "El Camino Oscuro" },
  { en: "The Grain", es: "La Fibra" },
  { en: "The Vigil", es: "La Vigilia" },
  { en: "The Descent", es: "El Descenso" },
  { en: "The Rise", es: "El Ascenso" },
  { en: "The Binding", es: "La Atadura" },
  { en: "The Clear Eye", es: "El Ojo Claro" },
  { en: "The Table", es: "La Mesa" },
  { en: "The Signal Fire", es: "La Señal de Fuego" },
  { en: "The Narrow Road", es: "El Sendero Estrecho" },
  { en: "The Inner Court", es: "El Patio Interior" },
  { en: "The Burden", es: "La Carga" },
  { en: "The Rhythm", es: "El Ritmo" },
  { en: "The Open Palm", es: "La Palma Abierta" },
  { en: "The Iron Word", es: "La Palabra de Hierro" },
  { en: "The Deep Well", es: "El Pozo Profundo" },
  { en: "The Mark", es: "La Marca" },
  { en: "The Honest Hour", es: "La Hora Honesta" },
  { en: "The Kept Flame", es: "La Llama Guardada" },
  { en: "The Clean Break", es: "El Corte Limpio" },
  { en: "The Hidden Root", es: "La Raíz Oculta" },
  { en: "The Covenant", es: "El Covenant" },
  { en: "The Long Road", es: "El Camino Largo" },
  { en: "The Second Breath", es: "El Segundo Aliento" },
  { en: "The Unmoved", es: "Lo Inamovible" },
  { en: "The Bowl", es: "El Cuenco" },
  { en: "The True North", es: "El Norte Verdadero" },
  { en: "The Final Step", es: "El Paso Final" },
  { en: "The New Gate", es: "La Puerta Nueva" },
  { en: "The Silent Crown", es: "La Corona Silenciosa" },
  { en: "The Last Ember", es: "La Última Brasa" },
  { en: "The Whole Circle", es: "El Círculo Entero" },
  { en: "The Morning Seal", es: "El Sello de la Mañana" },
];

const NUMBER_MEANING_PATTERNS: LocalizedText[] = [
  {
    en: "Return to the work before the mind turns resistance into a story.",
    es: "Vuelve al trabajo antes de que la mente convierta la resistencia en relato.",
  },
  {
    en: "Let one precise act matter more than a dramatic intention.",
    es: "Deja que un acto preciso pese más que una intención dramática.",
  },
  {
    en: "Protect the small discipline that keeps the larger life from drifting.",
    es: "Protege la pequeña disciplina que impide que la vida mayor se disperse.",
  },
  {
    en: "Hold the line quietly. Strength does not need to announce itself.",
    es: "Sostén la línea en silencio. La fuerza no necesita anunciarse.",
  },
  {
    en: "Choose structure before appetite begins to negotiate.",
    es: "Elige estructura antes de que el apetito empiece a negociar.",
  },
  {
    en: "Treat repetition as devotion to the person you are becoming.",
    es: "Trata la repetición como devoción hacia la persona que estás formando.",
  },
  {
    en: "Notice the impulse, name it clearly, and move without obeying it.",
    es: "Observa el impulso, nómbralo con claridad y avanza sin obedecerlo.",
  },
  {
    en: "Today asks for steadiness, not intensity. Build without spectacle.",
    es: "Hoy pide firmeza, no intensidad. Construye sin espectáculo.",
  },
  {
    en: "Let the habit become a clean measurement of your current honesty.",
    es: "Deja que el hábito mida con limpieza tu honestidad actual.",
  },
];

const NUMBER_REFLECTION_PATTERNS: LocalizedText[] = [
  {
    en: "Where are you abandoning discipline too early?",
    es: "¿Dónde estás abandonando la disciplina demasiado pronto?",
  },
  {
    en: "What would become possible if you obeyed the next small command?",
    es: "¿Qué sería posible si obedecieras el próximo mandato pequeño?",
  },
  {
    en: "Which excuse loses power when you name it plainly?",
    es: "¿Qué excusa pierde fuerza cuando la nombras sin adornos?",
  },
  {
    en: "What part of your practice needs less emotion and more order?",
    es: "¿Qué parte de tu práctica necesita menos emoción y más orden?",
  },
  {
    en: "What are you still treating as optional?",
    es: "¿Qué sigues tratando como opcional?",
  },
  {
    en: "Where would quiet consistency be more honest than force?",
    es: "¿Dónde sería más honesta la constancia silenciosa que la fuerza?",
  },
];

const FALLBACK_NUMBER_TITLE: LocalizedText = {
  en: "The Daily Seal",
  es: "El Sello del Día",
};

const FALLBACK_NUMBER_MEANING: LocalizedText = {
  en: "Return to one honest act before the day scatters your attention.",
  es: "Vuelve a un acto honesto antes de que el día disperse tu atención.",
};

const FALLBACK_NUMBER_REFLECTION: LocalizedText = {
  en: "What small discipline is asking to be protected today?",
  es: "¿Qué pequeña disciplina pide ser protegida hoy?",
};

function getLocalizedItem(items: LocalizedText[], index: number) {
  if (items.length === 0) {
    return null;
  }

  return items[index % items.length] ?? null;
}

export const DAILY_NUMBERS: DailyNumber[] = Array.from(
  { length: 99 },
  (_, index) => {
    const title =
      getLocalizedItem(NUMBER_TITLES, index) ?? FALLBACK_NUMBER_TITLE;
    const meaning =
      getLocalizedItem(NUMBER_MEANING_PATTERNS, index) ??
      FALLBACK_NUMBER_MEANING;
    const reflection =
      getLocalizedItem(NUMBER_REFLECTION_PATTERNS, index) ??
      FALLBACK_NUMBER_REFLECTION;

    return {
      number: index + 1,
      title,
      meaning: {
        en: `${title.en}: ${meaning.en} Let this number mark one concrete act of discipline before the day scatters.`,
        es: `${title.es}: ${meaning.es} Deja que este número marque un acto concreto de disciplina antes de que el día se disperse.`,
      },
      reflection: {
        en: `${reflection.en} What does ${title.en.toLowerCase()} ask you to practice today?`,
        es: `${reflection.es} ¿Qué te pide practicar hoy ${title.es.toLowerCase()}?`,
      },
    };
  }
);

export const MAJOR_ARCANA: TarotCard[] = [
  {
    id: "fool",
    romanNumeral: "0",
    name: { en: "The Fool", es: "El Loco" },
    archetype: {
      en: "Beginning, trust, sacred risk.",
      es: "Inicio, confianza, riesgo consciente.",
    },
    meaning: {
      en: "A first step before certainty has arrived.",
      es: "Un primer paso antes de que llegue la certeza.",
    },
    todayReflection: {
      en: "Begin the practice without needing the whole road revealed.",
      es: "Comienza la práctica sin exigir que todo el camino esté revelado.",
    },
    question: {
      en: "Where is fear disguising itself as preparation?",
      es: "¿Dónde se disfraza el miedo de preparación?",
    },
    visualSymbol: "threshold",
  },
  {
    id: "magician",
    romanNumeral: "I",
    name: { en: "The Magician", es: "El Mago" },
    archetype: {
      en: "Will, craft, focused power.",
      es: "Voluntad, oficio, poder enfocado.",
    },
    meaning: {
      en: "The tools are present; the question is command.",
      es: "Las herramientas están presentes; la pregunta es el mando.",
    },
    todayReflection: {
      en: "Use what is already in your hands before asking for more.",
      es: "Usa lo que ya está en tus manos antes de pedir más.",
    },
    question: {
      en: "What power are you wasting through distraction?",
      es: "¿Qué poder estás desperdiciando por distracción?",
    },
    visualSymbol: "will",
  },
  {
    id: "high-priestess",
    romanNumeral: "II",
    name: { en: "The High Priestess", es: "La Sacerdotisa" },
    archetype: {
      en: "Intuition, silence, hidden knowledge.",
      es: "Intuición, silencio, conocimiento oculto.",
    },
    meaning: {
      en: "The deeper truth is quiet but not absent.",
      es: "La verdad profunda es silenciosa, no ausente.",
    },
    todayReflection: {
      en: "Listen beneath your first explanation before acting.",
      es: "Escucha debajo de tu primera explicación antes de actuar.",
    },
    question: {
      en: "What do you know that you keep pretending not to know?",
      es: "¿Qué sabes y sigues fingiendo no saber?",
    },
    visualSymbol: "veil",
  },
  {
    id: "empress",
    romanNumeral: "III",
    name: { en: "The Empress", es: "La Emperatriz" },
    archetype: {
      en: "Nourishment, embodiment, growth.",
      es: "Nutrición, cuerpo, crecimiento.",
    },
    meaning: {
      en: "What is tended becomes strong enough to endure.",
      es: "Lo que se cuida se vuelve lo bastante fuerte para durar.",
    },
    todayReflection: {
      en: "Give the discipline conditions where it can actually live.",
      es: "Dale a la disciplina condiciones donde pueda vivir de verdad.",
    },
    question: {
      en: "What part of your practice needs care, not force?",
      es: "¿Qué parte de tu práctica necesita cuidado, no fuerza?",
    },
    visualSymbol: "garden",
  },
  {
    id: "emperor",
    romanNumeral: "IV",
    name: { en: "The Emperor", es: "El Emperador" },
    archetype: {
      en: "Order, structure, authority.",
      es: "Orden, estructura, autoridad.",
    },
    meaning: {
      en: "Discipline becomes mercy when it gives chaos a boundary.",
      es: "La disciplina se vuelve misericordia cuando pone límite al caos.",
    },
    todayReflection: {
      en: "Set the rule before appetite begins negotiating.",
      es: "Define la regla antes de que el apetito empiece a negociar.",
    },
    question: {
      en: "Where do you need authority instead of mood?",
      es: "¿Dónde necesitas autoridad en lugar de ánimo?",
    },
    visualSymbol: "throne",
  },
  {
    id: "hierophant",
    romanNumeral: "V",
    name: { en: "The Hierophant", es: "El Hierofante" },
    archetype: {
      en: "Tradition, teaching, sacred structure.",
      es: "Tradición, enseñanza, estructura sagrada.",
    },
    meaning: {
      en: "A proven form can carry you when emotion cannot.",
      es: "Una forma probada puede sostenerte cuando la emoción no puede.",
    },
    todayReflection: {
      en: "Let ritual hold the part of you that feels unstable.",
      es: "Deja que el ritual sostenga la parte de ti que se siente inestable.",
    },
    question: {
      en: "What structure deserves your renewed respect?",
      es: "¿Qué estructura merece tu respeto renovado?",
    },
    visualSymbol: "pillar",
  },
  {
    id: "lovers",
    romanNumeral: "VI",
    name: { en: "The Lovers", es: "Los Enamorados" },
    archetype: {
      en: "Choice, union, alignment.",
      es: "Elección, unión, alineación.",
    },
    meaning: {
      en: "Every vow asks what you are willing to join yourself to.",
      es: "Todo voto pregunta a qué estás dispuesto a unirte.",
    },
    todayReflection: {
      en: "Choose the action that keeps you aligned with your covenant.",
      es: "Elige la acción que te mantiene alineado con tu covenant.",
    },
    question: {
      en: "What are you choosing each time you delay?",
      es: "¿Qué eliges cada vez que postergas?",
    },
    visualSymbol: "union",
  },
  {
    id: "chariot",
    romanNumeral: "VII",
    name: { en: "The Chariot", es: "El Carro" },
    archetype: {
      en: "Direction, control, victory through will.",
      es: "Dirección, control, victoria por voluntad.",
    },
    meaning: {
      en: "The self moves when opposing forces are commanded.",
      es: "El yo avanza cuando las fuerzas opuestas reciben mando.",
    },
    todayReflection: {
      en: "Harness discomfort and desire toward one disciplined action.",
      es: "Conduce incomodidad y deseo hacia una acción disciplinada.",
    },
    question: {
      en: "What part of you needs to be led, not obeyed?",
      es: "¿Qué parte de ti necesita ser dirigida, no obedecida?",
    },
    visualSymbol: "chariot",
  },
  {
    id: "strength",
    romanNumeral: "VIII",
    name: { en: "Strength", es: "La Fuerza" },
    archetype: {
      en: "Courage, restraint, embodied patience.",
      es: "Coraje, dominio, paciencia encarnada.",
    },
    meaning: {
      en: "True force does not panic. It stays present under pressure.",
      es: "La fuerza real no entra en pánico. Permanece bajo presión.",
    },
    todayReflection: {
      en: "Meet resistance without flinching or becoming harsh.",
      es: "Encuentra la resistencia sin retroceder ni endurecerte de más.",
    },
    question: {
      en: "Where would gentler control be stronger than force?",
      es: "¿Dónde sería más fuerte un control sereno que la fuerza bruta?",
    },
    visualSymbol: "flame",
  },
  {
    id: "hermit",
    romanNumeral: "IX",
    name: { en: "The Hermit", es: "El Ermitaño" },
    archetype: {
      en: "Withdrawal, silence, inner listening.",
      es: "Retiro, silencio, escucha interior.",
    },
    meaning: {
      en: "Wisdom appears when performance is set down.",
      es: "La sabiduría aparece cuando dejas de actuar para otros.",
    },
    todayReflection: {
      en: "Step away from noise before choosing your next action.",
      es: "Aléjate del ruido antes de elegir tu próxima acción.",
    },
    question: {
      en: "What truth appears only when you stop performing?",
      es: "¿Qué verdad aparece solo cuando dejas de representar?",
    },
    visualSymbol: "lantern",
  },
  {
    id: "wheel-of-fortune",
    romanNumeral: "X",
    name: { en: "Wheel of Fortune", es: "La Rueda de la Fortuna" },
    archetype: {
      en: "Cycles, change, timing.",
      es: "Ciclos, cambio, momento justo.",
    },
    meaning: {
      en: "Conditions turn; the vow reveals what remains steady.",
      es: "Las condiciones giran; el voto revela lo que permanece firme.",
    },
    todayReflection: {
      en: "Do not confuse a shifting mood with a changed command.",
      es: "No confundas un ánimo cambiante con un mandato distinto.",
    },
    question: {
      en: "What stays true even when the day changes shape?",
      es: "¿Qué sigue siendo verdad aunque el día cambie de forma?",
    },
    visualSymbol: "wheel",
  },
  {
    id: "justice",
    romanNumeral: "XI",
    name: { en: "Justice", es: "La Justicia" },
    archetype: {
      en: "Truth, consequence, balance.",
      es: "Verdad, consecuencia, equilibrio.",
    },
    meaning: {
      en: "Reality becomes workable when it is measured honestly.",
      es: "La realidad se vuelve trabajable cuando se mide con honestidad.",
    },
    todayReflection: {
      en: "Tell the truth about your effort without self-punishment.",
      es: "Di la verdad sobre tu esfuerzo sin castigarte.",
    },
    question: {
      en: "What consequence are you already living inside?",
      es: "¿Dentro de qué consecuencia ya estás viviendo?",
    },
    visualSymbol: "scales",
  },
  {
    id: "hanged-man",
    romanNumeral: "XII",
    name: { en: "The Hanged Man", es: "El Colgado" },
    archetype: {
      en: "Surrender, suspension, new sight.",
      es: "Rendición, suspensión, nueva mirada.",
    },
    meaning: {
      en: "Progress may require a different posture, not more strain.",
      es: "El avance quizá pide otra postura, no más tensión.",
    },
    todayReflection: {
      en: "Pause long enough to see the pattern from another angle.",
      es: "Pausa lo suficiente para ver el patrón desde otro ángulo.",
    },
    question: {
      en: "What changes when you stop trying to control the image?",
      es: "¿Qué cambia cuando dejas de controlar la imagen?",
    },
    visualSymbol: "suspension",
  },
  {
    id: "death",
    romanNumeral: "XIII",
    name: { en: "Death", es: "La Muerte" },
    archetype: {
      en: "Ending, release, transformation.",
      es: "Final, liberación, transformación.",
    },
    meaning: {
      en: "Something false must end for the vow to breathe.",
      es: "Algo falso debe terminar para que el voto respire.",
    },
    todayReflection: {
      en: "Let one old permission die without ceremony.",
      es: "Deja morir un viejo permiso sin ceremonia.",
    },
    question: {
      en: "What identity keeps surviving because you keep feeding it?",
      es: "¿Qué identidad sobrevive porque sigues alimentándola?",
    },
    visualSymbol: "gate",
  },
  {
    id: "temperance",
    romanNumeral: "XIV",
    name: { en: "Temperance", es: "La Templanza" },
    archetype: {
      en: "Integration, moderation, alchemy.",
      es: "Integración, moderación, alquimia.",
    },
    meaning: {
      en: "Discipline matures when extremes are brought into order.",
      es: "La disciplina madura cuando los extremos entran en orden.",
    },
    todayReflection: {
      en: "Blend effort with patience; do not confuse excess with devotion.",
      es: "Mezcla esfuerzo con paciencia; no confundas exceso con devoción.",
    },
    question: {
      en: "Where does balance require more courage than intensity?",
      es: "¿Dónde el equilibrio exige más coraje que la intensidad?",
    },
    visualSymbol: "vessel",
  },
  {
    id: "devil",
    romanNumeral: "XV",
    name: { en: "The Devil", es: "El Diablo" },
    archetype: {
      en: "Attachment, compulsion, unconscious bargain.",
      es: "Apego, compulsión, pacto inconsciente.",
    },
    meaning: {
      en: "Bondage often speaks in the language of relief.",
      es: "La atadura suele hablar con el lenguaje del alivio.",
    },
    todayReflection: {
      en: "Notice what still negotiates with your discipline.",
      es: "Observa qué sigue negociando con tu disciplina.",
    },
    question: {
      en: "What impulse keeps asking for permission?",
      es: "¿Qué impulso sigue pidiendo permiso?",
    },
    visualSymbol: "chain",
  },
  {
    id: "tower",
    romanNumeral: "XVI",
    name: { en: "The Tower", es: "La Torre" },
    archetype: {
      en: "Disruption, revelation, collapse of illusion.",
      es: "Ruptura, revelación, caída de la ilusión.",
    },
    meaning: {
      en: "False structures fall so truth can stand without disguise.",
      es: "Las estructuras falsas caen para que la verdad permanezca sin disfraz.",
    },
    todayReflection: {
      en: "Let the uncomfortable revelation simplify your next action.",
      es: "Deja que la revelación incómoda simplifique tu próxima acción.",
    },
    question: {
      en: "What has to break because it was never honest?",
      es: "¿Qué debe romperse porque nunca fue honesto?",
    },
    visualSymbol: "tower",
  },
  {
    id: "star",
    romanNumeral: "XVII",
    name: { en: "The Star", es: "La Estrella" },
    archetype: {
      en: "Hope, restoration, clear devotion.",
      es: "Esperanza, restauración, devoción clara.",
    },
    meaning: {
      en: "After severity, the spirit remembers why it continues.",
      es: "Después de la severidad, el ánimo recuerda por qué continúa.",
    },
    todayReflection: {
      en: "Practice as an act of restoration, not punishment.",
      es: "Practica como un acto de restauración, no de castigo.",
    },
    question: {
      en: "What part of you is ready to trust the long repair?",
      es: "¿Qué parte de ti está lista para confiar en la reparación larga?",
    },
    visualSymbol: "star",
  },
  {
    id: "moon",
    romanNumeral: "XVIII",
    name: { en: "The Moon", es: "La Luna" },
    archetype: {
      en: "Dream, uncertainty, hidden fear.",
      es: "Sueño, incertidumbre, miedo oculto.",
    },
    meaning: {
      en: "Not every shadow is a command. Some are only weather.",
      es: "No toda sombra es un mandato. Algunas solo son clima interior.",
    },
    todayReflection: {
      en: "Move carefully through confusion without surrendering to it.",
      es: "Avanza con cuidado por la confusión sin rendirte ante ella.",
    },
    question: {
      en: "Which fear becomes smaller when you look at it directly?",
      es: "¿Qué miedo se vuelve más pequeño cuando lo miras de frente?",
    },
    visualSymbol: "moon",
  },
  {
    id: "sun",
    romanNumeral: "XIX",
    name: { en: "The Sun", es: "El Sol" },
    archetype: {
      en: "Clarity, vitality, honest joy.",
      es: "Claridad, vitalidad, alegría honesta.",
    },
    meaning: {
      en: "Truth can be bright without being shallow.",
      es: "La verdad puede ser luminosa sin volverse superficial.",
    },
    todayReflection: {
      en: "Let the practice give energy back to the body.",
      es: "Deja que la práctica devuelva energía al cuerpo.",
    },
    question: {
      en: "Where are you allowed to receive strength today?",
      es: "¿Dónde puedes recibir fuerza hoy?",
    },
    visualSymbol: "sun",
  },
  {
    id: "judgement",
    romanNumeral: "XX",
    name: { en: "Judgement", es: "El Juicio" },
    archetype: {
      en: "Awakening, reckoning, call.",
      es: "Despertar, rendición de cuentas, llamado.",
    },
    meaning: {
      en: "The old life is heard clearly, and a higher response is asked.",
      es: "La vida anterior se escucha con claridad y pide una respuesta más alta.",
    },
    todayReflection: {
      en: "Answer the call with action, not self-analysis alone.",
      es: "Responde al llamado con acción, no solo con análisis.",
    },
    question: {
      en: "What would obedience look like if you stopped postponing it?",
      es: "¿Cómo se vería la obediencia si dejaras de postergarla?",
    },
    visualSymbol: "call",
  },
  {
    id: "world",
    romanNumeral: "XXI",
    name: { en: "The World", es: "El Mundo" },
    archetype: {
      en: "Completion, integration, earned wholeness.",
      es: "Culminación, integración, totalidad ganada.",
    },
    meaning: {
      en: "The path circles back as a more integrated self.",
      es: "El camino vuelve como un yo más integrado.",
    },
    todayReflection: {
      en: "Honor the whole practice by completing the small part in front of you.",
      es: "Honra toda la práctica completando la parte pequeña frente a ti.",
    },
    question: {
      en: "What is becoming whole through your repetition?",
      es: "¿Qué se está volviendo entero gracias a tu repetición?",
    },
    visualSymbol: "world",
  },
];

const COUNSEL_SEEDS: Array<{
  title: LocalizedText;
  virtue: LocalizedText;
  enemy: LocalizedText;
  practice: LocalizedText;
}> = [
  { title: { en: "Guard the First Hour", es: "Guarda la Primera Hora" }, virtue: { en: "command", es: "mando" }, enemy: { en: "drift", es: "dispersión" }, practice: { en: "start before checking noise", es: "empieza antes de revisar ruido" } },
  { title: { en: "Let Silence Work", es: "Deja Trabajar al Silencio" }, virtue: { en: "restraint", es: "dominio" }, enemy: { en: "explanation", es: "explicación" }, practice: { en: "answer one urge with quiet", es: "responde a un impulso con quietud" } },
  { title: { en: "Spend No Strength on Display", es: "No Gastes Fuerza en Exhibición" }, virtue: { en: "reserve", es: "reserva" }, enemy: { en: "performance", es: "actuación" }, practice: { en: "complete one task unseen", es: "completa una tarea sin público" } },
  { title: { en: "Move Before Mood Votes", es: "Muévete Antes de que Vote el Ánimo" }, virtue: { en: "obedience", es: "obediencia" }, enemy: { en: "negotiation", es: "negociación" }, practice: { en: "take the next disciplined step", es: "da el próximo paso disciplinado" } },
  { title: { en: "Keep Your Word Small", es: "Haz Pequeña tu Palabra" }, virtue: { en: "precision", es: "precisión" }, enemy: { en: "boasting", es: "alarde" }, practice: { en: "promise less and finish more", es: "promete menos y termina más" } },
  { title: { en: "Study the Room Before Acting", es: "Estudia la Sala Antes de Actuar" }, virtue: { en: "timing", es: "momento justo" }, enemy: { en: "haste", es: "prisa" }, practice: { en: "observe before entering conflict", es: "observa antes de entrar al conflicto" } },
  { title: { en: "Do Not Feed Every Fire", es: "No Alimentes Cada Fuego" }, virtue: { en: "discernment", es: "discernimiento" }, enemy: { en: "reaction", es: "reacción" }, practice: { en: "let one provocation pass", es: "deja pasar una provocación" } },
  { title: { en: "Make Reputation Quietly Expensive", es: "Haz Costosa tu Reputación en Silencio" }, virtue: { en: "consistency", es: "constancia" }, enemy: { en: "carelessness", es: "descuido" }, practice: { en: "protect one standard today", es: "protege un estándar hoy" } },
  { title: { en: "Choose Distance Over Drama", es: "Elige Distancia Antes que Drama" }, virtue: { en: "separation", es: "separación" }, enemy: { en: "entanglement", es: "enredo" }, practice: { en: "step back without announcing it", es: "retrocede sin anunciarlo" } },
  { title: { en: "Let Results Speak Last", es: "Deja que el Resultado Hable al Final" }, virtue: { en: "proof", es: "prueba" }, enemy: { en: "noise", es: "ruido" }, practice: { en: "finish before explaining", es: "termina antes de explicar" } },
  { title: { en: "Hold the Line Under Praise", es: "Sostén la Línea Bajo el Elogio" }, virtue: { en: "sobriety", es: "sobriedad" }, enemy: { en: "vanity", es: "vanidad" }, practice: { en: "receive praise without changing pace", es: "recibe elogio sin cambiar el paso" } },
  { title: { en: "Hold the Line Under Blame", es: "Sostén la Línea Bajo la Culpa" }, virtue: { en: "steadiness", es: "firmeza" }, enemy: { en: "panic", es: "pánico" }, practice: { en: "correct what is true, release the rest", es: "corrige lo verdadero, suelta lo demás" } },
  { title: { en: "Never Crown an Impulse", es: "Nunca Corones un Impulso" }, virtue: { en: "rule", es: "gobierno" }, enemy: { en: "appetite", es: "apetito" }, practice: { en: "delay one craving by ten minutes", es: "retrasa un deseo diez minutos" } },
  { title: { en: "Let Patience Gather Force", es: "Deja que la Paciencia Reúna Fuerza" }, virtue: { en: "patience", es: "paciencia" }, enemy: { en: "premature action", es: "acción prematura" }, practice: { en: "wait until the next clear signal", es: "espera la próxima señal clara" } },
  { title: { en: "Keep One Door Closed", es: "Mantén una Puerta Cerrada" }, virtue: { en: "boundary", es: "límite" }, enemy: { en: "access", es: "acceso" }, practice: { en: "refuse one old permission", es: "rechaza un permiso antiguo" } },
  { title: { en: "Train the Face", es: "Entrena el Rostro" }, virtue: { en: "composure", es: "compostura" }, enemy: { en: "leakage", es: "fuga" }, practice: { en: "breathe before your expression answers", es: "respira antes de que responda tu expresión" } },
  { title: { en: "Protect the Unfinished Work", es: "Protege la Obra Incompleta" }, virtue: { en: "privacy", es: "privacidad" }, enemy: { en: "exposure", es: "exposición" }, practice: { en: "keep one plan off display", es: "mantén un plan fuera de exhibición" } },
  { title: { en: "Make the Easy Thing Earn Entry", es: "Haz que lo Fácil Gane Entrada" }, virtue: { en: "standard", es: "estándar" }, enemy: { en: "convenience", es: "comodidad" }, practice: { en: "add one honest condition", es: "añade una condición honesta" } },
  { title: { en: "Refuse the Second Wound", es: "Rechaza la Segunda Herida" }, virtue: { en: "recovery", es: "recuperación" }, enemy: { en: "rumination", es: "rumiación" }, practice: { en: "stop rehearsing one injury", es: "deja de ensayar una herida" } },
  { title: { en: "Read Incentives, Not Speeches", es: "Lee Incentivos, no Discursos" }, virtue: { en: "clarity", es: "claridad" }, enemy: { en: "flattery", es: "adulación" }, practice: { en: "ask what the action rewards", es: "pregunta qué recompensa la acción" } },
  { title: { en: "Make Anger Pay a Toll", es: "Haz que la Ira Pague Peaje" }, virtue: { en: "control", es: "control" }, enemy: { en: "eruption", es: "estallido" }, practice: { en: "write the response before sending none", es: "escribe la respuesta antes de no enviar ninguna" } },
  { title: { en: "Do Not Borrow Tomorrow's Fear", es: "No Tomes Prestado el Miedo de Mañana" }, virtue: { en: "presence", es: "presencia" }, enemy: { en: "projection", es: "proyección" }, practice: { en: "solve only the present step", es: "resuelve solo el paso presente" } },
  { title: { en: "Let Repetition Become Rank", es: "Deja que la Repetición Sea Rango" }, virtue: { en: "discipline", es: "disciplina" }, enemy: { en: "novelty", es: "novedad" }, practice: { en: "repeat the core practice cleanly", es: "repite limpia la práctica central" } },
  { title: { en: "Keep Counsel Above Complaint", es: "Pon Consejo Sobre Queja" }, virtue: { en: "wisdom", es: "sabiduría" }, enemy: { en: "complaint", es: "queja" }, practice: { en: "turn one complaint into instruction", es: "convierte una queja en instrucción" } },
  { title: { en: "Be Hard to Distract", es: "Sé Difícil de Distraer" }, virtue: { en: "focus", es: "enfoque" }, enemy: { en: "fragmentation", es: "fragmentación" }, practice: { en: "remove one interruption before work", es: "quita una interrupción antes de trabajar" } },
  { title: { en: "Do Not Negotiate with Collapse", es: "No Negocies con el Derrumbe" }, virtue: { en: "resolve", es: "resolución" }, enemy: { en: "surrender", es: "rendición" }, practice: { en: "stand up and complete one small order", es: "levántate y completa un pequeño orden" } },
  { title: { en: "Measure Before You Judge", es: "Mide Antes de Juzgar" }, virtue: { en: "accuracy", es: "exactitud" }, enemy: { en: "assumption", es: "suposición" }, practice: { en: "check the facts once", es: "verifica los hechos una vez" } },
  { title: { en: "Keep Victory Clean", es: "Mantén Limpia la Victoria" }, virtue: { en: "honor", es: "honor" }, enemy: { en: "cruelty", es: "crueldad" }, practice: { en: "win without humiliating", es: "vence sin humillar" } },
  { title: { en: "Lose Without Selling the Throne", es: "Pierde Sin Vender el Trono" }, virtue: { en: "dignity", es: "dignidad" }, enemy: { en: "despair", es: "desesperación" }, practice: { en: "take the lesson without self-betrayal", es: "toma la lección sin traicionarte" } },
  { title: { en: "Hide the Root, Show the Fruit", es: "Oculta la Raíz, Muestra el Fruto" }, virtue: { en: "depth", es: "profundidad" }, enemy: { en: "display", es: "exhibición" }, practice: { en: "protect the source of one strength", es: "protege la fuente de una fuerza" } },
  { title: { en: "Choose the Battlefield", es: "Elige el Campo de Batalla" }, virtue: { en: "strategy", es: "estrategia" }, enemy: { en: "impulse", es: "impulso" }, practice: { en: "decline one poorly timed fight", es: "rechaza una lucha mal situada" } },
  { title: { en: "Let Scarcity Clarify", es: "Deja que la Escasez Aclare" }, virtue: { en: "priority", es: "prioridad" }, enemy: { en: "excess", es: "exceso" }, practice: { en: "choose the one thing that matters", es: "elige lo único que importa" } },
  { title: { en: "Make Rest Serve Command", es: "Haz que el Descanso Sirva al Mando" }, virtue: { en: "renewal", es: "renovación" }, enemy: { en: "escape", es: "escape" }, practice: { en: "rest without abandoning tomorrow", es: "descansa sin abandonar mañana" } },
  { title: { en: "Speak After the Heat Leaves", es: "Habla Cuando se Vaya el Calor" }, virtue: { en: "coolness", es: "templanza" }, enemy: { en: "heat", es: "calor" }, practice: { en: "wait for your tone to clear", es: "espera a que se limpie tu tono" } },
  { title: { en: "Turn Envy into Study", es: "Convierte Envidia en Estudio" }, virtue: { en: "learning", es: "aprendizaje" }, enemy: { en: "envy", es: "envidia" }, practice: { en: "name one skill worth training", es: "nombra una habilidad que valga entrenar" } },
  { title: { en: "Keep the Inner Court Sober", es: "Mantén Sobrio el Patio Interior" }, virtue: { en: "inner order", es: "orden interior" }, enemy: { en: "fantasy", es: "fantasía" }, practice: { en: "tell yourself the plain truth", es: "dite la verdad sencilla" } },
  { title: { en: "Do the Unglamorous Part", es: "Haz la Parte Sin Gloria" }, virtue: { en: "service", es: "servicio" }, enemy: { en: "avoidance", es: "evasión" }, practice: { en: "complete the neglected detail", es: "completa el detalle descuidado" } },
  { title: { en: "Keep Tools Sharpened", es: "Mantén Afiladas las Herramientas" }, virtue: { en: "preparation", es: "preparación" }, enemy: { en: "decay", es: "deterioro" }, practice: { en: "repair one system before it fails", es: "repara un sistema antes de que falle" } },
  { title: { en: "Let Loyalty Require Truth", es: "Haz que la Lealtad Exija Verdad" }, virtue: { en: "truth", es: "verdad" }, enemy: { en: "blindness", es: "ceguera" }, practice: { en: "be honest without theatrics", es: "sé honesto sin teatro" } },
  { title: { en: "Leave Before You Are Owned", es: "Sal Antes de Ser Poseído" }, virtue: { en: "freedom", es: "libertad" }, enemy: { en: "dependency", es: "dependencia" }, practice: { en: "exit one weakening pattern early", es: "sal temprano de un patrón debilitante" } },
  { title: { en: "Give No Throne to Urgency", es: "No Des Trono a la Urgencia" }, virtue: { en: "pace", es: "ritmo" }, enemy: { en: "urgency", es: "urgencia" }, practice: { en: "separate urgent from important", es: "separa urgente de importante" } },
  { title: { en: "Make Gratitude Practical", es: "Haz Práctica la Gratitud" }, virtue: { en: "reverence", es: "reverencia" }, enemy: { en: "entitlement", es: "derecho automático" }, practice: { en: "honor one gift with action", es: "honra un regalo con acción" } },
  { title: { en: "Keep the Standard When Alone", es: "Mantén el Estándar a Solas" }, virtue: { en: "integrity", es: "integridad" }, enemy: { en: "permission", es: "permiso" }, practice: { en: "do the right thing unseen", es: "haz lo correcto sin testigos" } },
  { title: { en: "Use Pain as Intelligence", es: "Usa el Dolor como Inteligencia" }, virtue: { en: "interpretation", es: "interpretación" }, enemy: { en: "self-pity", es: "autocompasión" }, practice: { en: "ask what the pain is teaching", es: "pregunta qué enseña el dolor" } },
  { title: { en: "Do Not Confuse Access with Trust", es: "No Confundas Acceso con Confianza" }, virtue: { en: "discernment", es: "discernimiento" }, enemy: { en: "familiarity", es: "familiaridad" }, practice: { en: "set one clean boundary", es: "define un límite limpio" } },
  { title: { en: "Give the Body a Command", es: "Dale un Mandato al Cuerpo" }, virtue: { en: "embodiment", es: "encarnación" }, enemy: { en: "inertia", es: "inercia" }, practice: { en: "move with deliberate posture", es: "muévete con postura deliberada" } },
  { title: { en: "Let the Day Close Accountably", es: "Cierra el Día con Cuenta Clara" }, virtue: { en: "accountability", es: "rendición de cuentas" }, enemy: { en: "forgetting", es: "olvido" }, practice: { en: "review one action without excuse", es: "revisa una acción sin excusa" } },
  { title: { en: "Return Without Ceremony", es: "Regresa Sin Ceremonia" }, virtue: { en: "return", es: "regreso" }, enemy: { en: "shame", es: "vergüenza" }, practice: { en: "restart the practice immediately", es: "reinicia la práctica de inmediato" } },
];

export const DAILY_COUNSELS: DailyCounsel[] = COUNSEL_SEEDS.map(
  (seed, index) => ({
    id: `counsel-${String(index + 1).padStart(2, "0")}`,
    number: index + 1,
    title: seed.title,
    statement: {
      en: `${seed.title.en}. Protect ${seed.virtue.en} from ${seed.enemy.en}.`,
      es: `${seed.title.es}. Protege ${seed.virtue.es} de ${seed.enemy.es}.`,
    },
    explanation: {
      en: `Power becomes discipline when it is governed before pressure arrives. Today, ${seed.virtue.en} is not an idea; it is the boundary that keeps ${seed.enemy.en} from taking command of your conduct.`,
      es: `El poder se vuelve disciplina cuando recibe gobierno antes de que llegue la presión. Hoy, ${seed.virtue.es} no es una idea; es el límite que impide que ${seed.enemy.es} tome mando sobre tu conducta.`,
    },
    action: {
      en: `Daily action: ${seed.practice.en}.`,
      es: `Acción diaria: ${seed.practice.es}.`,
    },
  })
);
