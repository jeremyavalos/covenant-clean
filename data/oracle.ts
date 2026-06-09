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
  warning: LocalizedText;
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

export const DAILY_COUNSELS: DailyCounsel[] = [
  {
    id: "law-01",
    number: 1,
    title: {
      en: "Govern the Impulse",
      es: "Gobierna el Impulso",
    },
    statement: {
      en: "Govern the impulse before it governs you.",
      es: "Gobierna el impulso antes de que te gobierne.",
    },
    explanation: {
      en: "Power begins when reaction ends. The person who cannot delay emotion becomes readable, and what is readable can be moved by any hand with enough patience.",
      es: "El poder empieza cuando termina la reacción. Quien no puede retrasar una emoción se vuelve legible, y lo legible puede ser movido por cualquier mano con paciencia suficiente.",
    },
    action: {
      en: "Daily action: Wait ten seconds before answering anything that provokes you.",
      es: "Acción diaria: Espera diez segundos antes de responder a algo que te provoque.",
    },
    warning: {
      en: "Warning: Silence is discipline, not fear.",
      es: "Advertencia: El silencio es disciplina, no miedo.",
    },
  },
  {
    id: "law-02",
    number: 2,
    title: {
      en: "Make Desire Wait Outside",
      es: "Deja el Deseo Afuera",
    },
    statement: {
      en: "Never let appetite sit at the council table.",
      es: "Nunca sientes al apetito en la mesa del consejo.",
    },
    explanation: {
      en: "Desire speaks as urgency because it fears examination. A disciplined life lets desire knock, but does not give it authority over direction.",
      es: "El deseo habla como urgencia porque teme ser examinado. Una vida disciplinada deja que el deseo toque la puerta, pero no le entrega autoridad sobre la dirección.",
    },
    action: {
      en: "Daily action: Delay one craving until after your first duty is complete.",
      es: "Acción diaria: Retrasa un deseo hasta completar tu primer deber.",
    },
    warning: {
      en: "Warning: Denial without purpose becomes bitterness.",
      es: "Advertencia: Negarte sin propósito se convierte en amargura.",
    },
  },
  {
    id: "law-03",
    number: 3,
    title: {
      en: "Let Silence Collect Interest",
      es: "Deja que el Silencio Acumule Interés",
    },
    statement: {
      en: "Speak less while pressure reveals more.",
      es: "Habla menos mientras la presión revela más.",
    },
    explanation: {
      en: "Most people confess their position by filling empty space. Silence gives others room to reveal motive, fear, hunger, and weakness.",
      es: "La mayoría confiesa su posición al llenar el espacio vacío. El silencio da lugar para que otros revelen motivo, miedo, hambre y debilidad.",
    },
    action: {
      en: "Daily action: Ask one clear question, then let the answer finish without interruption.",
      es: "Acción diaria: Haz una pregunta clara y deja que la respuesta termine sin interrupción.",
    },
    warning: {
      en: "Warning: Silence used to punish becomes manipulation.",
      es: "Advertencia: El silencio usado para castigar se vuelve manipulación.",
    },
  },
  {
    id: "law-04",
    number: 4,
    title: {
      en: "Protect the Unshown Work",
      es: "Protege la Obra no Mostrada",
    },
    statement: {
      en: "Do not expose what has not yet earned form.",
      es: "No expongas lo que aún no ha ganado forma.",
    },
    explanation: {
      en: "Premature display invites judgment before strength has bones. Keep the root hidden until the fruit can carry its own weight.",
      es: "La exhibición prematura invita juicio antes de que la fuerza tenga huesos. Mantén la raíz oculta hasta que el fruto soporte su propio peso.",
    },
    action: {
      en: "Daily action: Keep one plan private and advance it by one concrete step.",
      es: "Acción diaria: Mantén un plan en privado y avánzalo con un paso concreto.",
    },
    warning: {
      en: "Warning: Privacy must serve construction, not cowardice.",
      es: "Advertencia: La privacidad debe servir a la construcción, no a la cobardía.",
    },
  },
  {
    id: "law-05",
    number: 5,
    title: {
      en: "Read the Incentive",
      es: "Lee el Incentivo",
    },
    statement: {
      en: "Trust actions more than speeches.",
      es: "Confía más en las acciones que en los discursos.",
    },
    explanation: {
      en: "Words decorate intention; incentives expose it. Watch what someone gains by moving you, praising you, rushing you, or making you doubt your own sight.",
      es: "Las palabras decoran la intención; los incentivos la exponen. Observa qué gana alguien al moverte, elogiarte, apresurarte o hacerte dudar de tu vista.",
    },
    action: {
      en: "Daily action: Before agreeing, name what the other side receives.",
      es: "Acción diaria: Antes de aceptar, nombra qué recibe la otra parte.",
    },
    warning: {
      en: "Warning: Suspicion without evidence corrodes judgment.",
      es: "Advertencia: La sospecha sin evidencia corroe el juicio.",
    },
  },
  {
    id: "law-06",
    number: 6,
    title: {
      en: "Choose the Field",
      es: "Elige el Campo",
    },
    statement: {
      en: "Never fight where impatience placed you.",
      es: "Nunca luches donde te colocó la impaciencia.",
    },
    explanation: {
      en: "A bad field turns strength into waste. Strategic restraint means refusing battles whose timing, audience, or terms were chosen by your agitation.",
      es: "Un mal campo convierte la fuerza en desperdicio. La restricción estratégica rechaza batallas cuyo tiempo, público o términos fueron elegidos por tu agitación.",
    },
    action: {
      en: "Daily action: Decline one poorly timed argument.",
      es: "Acción diaria: Rechaza una discusión mal ubicada.",
    },
    warning: {
      en: "Warning: Avoidance wears strategy's clothing easily.",
      es: "Advertencia: La evasión se viste fácilmente de estrategia.",
    },
  },
  {
    id: "law-07",
    number: 7,
    title: {
      en: "Spend No Strength on Display",
      es: "No Gastes Fuerza en Exhibición",
    },
    statement: {
      en: "Let proof arrive before performance.",
      es: "Deja que la prueba llegue antes que la actuación.",
    },
    explanation: {
      en: "The hunger to be seen often steals the energy required to become undeniable. Quiet completion creates a reputation that does not need decoration.",
      es: "El hambre de ser visto suele robar la energía necesaria para volverse innegable. La finalización silenciosa crea una reputación que no necesita adorno.",
    },
    action: {
      en: "Daily action: Finish one task without announcing it.",
      es: "Acción diaria: Termina una tarea sin anunciarla.",
    },
    warning: {
      en: "Warning: Hidden work still needs honest accountability.",
      es: "Advertencia: El trabajo oculto aún necesita rendición de cuentas honesta.",
    },
  },
  {
    id: "law-08",
    number: 8,
    title: {
      en: "Guard the First Hour",
      es: "Guarda la Primera Hora",
    },
    statement: {
      en: "The first hour sets the ruler of the day.",
      es: "La primera hora establece el gobernante del día.",
    },
    explanation: {
      en: "If noise owns your morning, discipline spends the rest of the day negotiating for scraps. Command early, before appetite gathers its advisors.",
      es: "Si el ruido posee tu mañana, la disciplina pasa el resto del día negociando sobras. Manda temprano, antes de que el apetito reúna consejeros.",
    },
    action: {
      en: "Daily action: Complete one disciplined act before checking feeds or messages.",
      es: "Acción diaria: Completa un acto disciplinado antes de revisar redes o mensajes.",
    },
    warning: {
      en: "Warning: Ritual without attention becomes theater.",
      es: "Advertencia: El ritual sin atención se vuelve teatro.",
    },
  },
  {
    id: "law-09",
    number: 9,
    title: {
      en: "Control the Door",
      es: "Controla la Puerta",
    },
    statement: {
      en: "Not everything that knocks deserves entry.",
      es: "No todo lo que toca merece entrada.",
    },
    explanation: {
      en: "Access is power. What you allow near your attention can shape your mood, pace, appetite, and eventually your identity.",
      es: "El acceso es poder. Lo que permites cerca de tu atención puede formar tu ánimo, ritmo, apetito y finalmente tu identidad.",
    },
    action: {
      en: "Daily action: Remove one weakening input from your day.",
      es: "Acción diaria: Quita una entrada debilitante de tu día.",
    },
    warning: {
      en: "Warning: Boundaries without warmth can become vanity.",
      es: "Advertencia: Los límites sin calidez pueden volverse vanidad.",
    },
  },
  {
    id: "law-10",
    number: 10,
    title: {
      en: "Make Anger Pay a Toll",
      es: "Haz que la Ira Pague Peaje",
    },
    statement: {
      en: "Anger may enter only after it has been examined.",
      es: "La ira solo puede entrar después de ser examinada.",
    },
    explanation: {
      en: "Anger contains information, but unfiltered anger sells your position cheaply. The disciplined person extracts the signal and refuses the spectacle.",
      es: "La ira contiene información, pero sin filtro vende tu posición barata. La persona disciplinada extrae la señal y rechaza el espectáculo.",
    },
    action: {
      en: "Daily action: Write the angry response, wait, then send only what serves the objective.",
      es: "Acción diaria: Escribe la respuesta airada, espera y envía solo lo que sirve al objetivo.",
    },
    warning: {
      en: "Warning: Repressed anger leaks through contempt.",
      es: "Advertencia: La ira reprimida se filtra como desprecio.",
    },
  },
  {
    id: "law-11",
    number: 11,
    title: {
      en: "Keep Reputation Expensive",
      es: "Mantén Costosa tu Reputación",
    },
    statement: {
      en: "Let your standard cost you enough to be believed.",
      es: "Haz que tu estándar te cueste lo suficiente para ser creído.",
    },
    explanation: {
      en: "Reputation is not built by claims but by repeated refusals. People trust the person who has paid for a standard when no applause was available.",
      es: "La reputación no se construye con afirmaciones sino con rechazos repetidos. Se confía en quien ha pagado por un estándar cuando no había aplauso.",
    },
    action: {
      en: "Daily action: Refuse one convenient compromise.",
      es: "Acción diaria: Rechaza una concesión conveniente.",
    },
    warning: {
      en: "Warning: A standard can become pride if it stops serving truth.",
      es: "Advertencia: Un estándar puede volverse orgullo si deja de servir a la verdad.",
    },
  },
  {
    id: "law-12",
    number: 12,
    title: {
      en: "Delay the Visible Strike",
      es: "Retrasa el Golpe Visible",
    },
    statement: {
      en: "Move after the pattern is clear.",
      es: "Muévete cuando el patrón esté claro.",
    },
    explanation: {
      en: "Action before observation is usually vanity with motion. Patience lets repeated behavior separate accident from design.",
      es: "La acción antes de observar suele ser vanidad en movimiento. La paciencia deja que la conducta repetida separe accidente de diseño.",
    },
    action: {
      en: "Daily action: Observe one recurring problem before correcting it.",
      es: "Acción diaria: Observa un problema recurrente antes de corregirlo.",
    },
    warning: {
      en: "Warning: Waiting too long can become permission.",
      es: "Advertencia: Esperar demasiado puede convertirse en permiso.",
    },
  },
  {
    id: "law-13",
    number: 13,
    title: {
      en: "Use Absence as a Boundary",
      es: "Usa la Ausencia como Límite",
    },
    statement: {
      en: "Sometimes the cleanest answer is distance.",
      es: "A veces la respuesta más limpia es distancia.",
    },
    explanation: {
      en: "Presence is a gift, not an obligation. Withdrawal, used carefully, can protect dignity without feeding drama.",
      es: "La presencia es un regalo, no una obligación. Retirarte, usado con cuidado, puede proteger la dignidad sin alimentar drama.",
    },
    action: {
      en: "Daily action: Step away from one exchange that rewards your worst self.",
      es: "Acción diaria: Aléjate de un intercambio que premia tu peor versión.",
    },
    warning: {
      en: "Warning: Distance should clarify, not secretly punish.",
      es: "Advertencia: La distancia debe aclarar, no castigar en secreto.",
    },
  },
  {
    id: "law-14",
    number: 14,
    title: {
      en: "Let Others Reveal Their Price",
      es: "Deja que Otros Revelen su Precio",
    },
    statement: {
      en: "Do not guess what loyalty costs; watch what breaks it.",
      es: "No adivines cuánto cuesta la lealtad; observa qué la rompe.",
    },
    explanation: {
      en: "People often declare values above their discipline. Pressure reveals the real exchange rate of attention, comfort, status, and fear.",
      es: "La gente suele declarar valores por encima de su disciplina. La presión revela el tipo de cambio real de atención, comodidad, estatus y miedo.",
    },
    action: {
      en: "Daily action: Notice what someone repeatedly chooses when no one forces them.",
      es: "Acción diaria: Observa qué elige alguien repetidamente cuando nadie lo obliga.",
    },
    warning: {
      en: "Warning: Do not test people cruelly to prove a theory.",
      es: "Advertencia: No pruebes cruelmente a otros para confirmar una teoría.",
    },
  },
  {
    id: "law-15",
    number: 15,
    title: {
      en: "Refuse the Borrowed Panic",
      es: "Rechaza el Pánico Prestado",
    },
    statement: {
      en: "Do not inherit urgency that is not yours.",
      es: "No heredes urgencias que no son tuyas.",
    },
    explanation: {
      en: "Urgency is contagious because it bypasses thought. The disciplined person distinguishes real fire from another person's poor preparation.",
      es: "La urgencia contagia porque evita el pensamiento. La persona disciplinada distingue el fuego real de la mala preparación de otro.",
    },
    action: {
      en: "Daily action: Before rushing, ask what actually changes if you wait five minutes.",
      es: "Acción diaria: Antes de correr, pregunta qué cambia realmente si esperas cinco minutos.",
    },
    warning: {
      en: "Warning: Calm must not become indifference.",
      es: "Advertencia: La calma no debe volverse indiferencia.",
    },
  },
  {
    id: "law-16",
    number: 16,
    title: {
      en: "Separate Signal from Theater",
      es: "Separa Señal de Teatro",
    },
    statement: {
      en: "Do not answer volume; answer meaning.",
      es: "No respondas al volumen; responde al significado.",
    },
    explanation: {
      en: "Drama inflates weak claims so they appear large. Strategy reduces noise until the real demand, threat, or fear is visible.",
      es: "El drama infla reclamos débiles para que parezcan grandes. La estrategia reduce el ruido hasta que la demanda, amenaza o miedo real sea visible.",
    },
    action: {
      en: "Daily action: Restate one loud problem in one plain sentence.",
      es: "Acción diaria: Reformula un problema ruidoso en una frase sencilla.",
    },
    warning: {
      en: "Warning: Reducing drama does not mean dismissing pain.",
      es: "Advertencia: Reducir drama no significa descartar dolor.",
    },
  },
  {
    id: "law-17",
    number: 17,
    title: {
      en: "Make the Body Obey First",
      es: "Haz que el Cuerpo Obedezca Primero",
    },
    statement: {
      en: "Command the posture before commanding the room.",
      es: "Ordena la postura antes de ordenar la sala.",
    },
    explanation: {
      en: "A scattered body leaks authority. Breath, posture, and pace teach the nervous system who is in command before words arrive.",
      es: "Un cuerpo disperso filtra autoridad. Respiración, postura y ritmo enseñan al sistema nervioso quién manda antes de que lleguen las palabras.",
    },
    action: {
      en: "Daily action: Stand upright, slow your breath, and walk deliberately into one difficult moment.",
      es: "Acción diaria: Enderézate, baja la respiración y entra deliberadamente a un momento difícil.",
    },
    warning: {
      en: "Warning: Composure without humility becomes cold performance.",
      es: "Advertencia: La compostura sin humildad se vuelve actuación fría.",
    },
  },
  {
    id: "law-18",
    number: 18,
    title: {
      en: "Let Scarcity Clarify",
      es: "Deja que la Escasez Aclare",
    },
    statement: {
      en: "When everything cannot be kept, truth appears.",
      es: "Cuando no todo puede conservarse, aparece la verdad.",
    },
    explanation: {
      en: "Abundance can hide weak priorities. Scarcity forces rank, and rank reveals what you actually serve.",
      es: "La abundancia puede ocultar prioridades débiles. La escasez obliga a ordenar, y ese orden revela a qué sirves realmente.",
    },
    action: {
      en: "Daily action: Choose the one task that would make the day honorable if nothing else were done.",
      es: "Acción diaria: Elige la tarea que haría honorable el día aunque nada más se complete.",
    },
    warning: {
      en: "Warning: Scarcity is a teacher, not an identity.",
      es: "Advertencia: La escasez es maestra, no identidad.",
    },
  },
  {
    id: "law-19",
    number: 19,
    title: {
      en: "Keep Victory Clean",
      es: "Mantén Limpia la Victoria",
    },
    statement: {
      en: "Win without poisoning the ground you stand on.",
      es: "Vence sin envenenar el suelo donde estás parado.",
    },
    explanation: {
      en: "A dirty victory creates future resistance. Power lasts longer when it does not require humiliation to feel complete.",
      es: "Una victoria sucia crea resistencia futura. El poder dura más cuando no necesita humillación para sentirse completo.",
    },
    action: {
      en: "Daily action: Correct or win one matter without insulting anyone's dignity.",
      es: "Acción diaria: Corrige o gana un asunto sin insultar la dignidad de nadie.",
    },
    warning: {
      en: "Warning: Mercy must not become weakness toward repeated harm.",
      es: "Advertencia: La misericordia no debe volverse debilidad ante daño repetido.",
    },
  },
  {
    id: "law-20",
    number: 20,
    title: {
      en: "Lose Without Selling the Throne",
      es: "Pierde Sin Vender el Trono",
    },
    statement: {
      en: "Defeat may take the result; do not let it take command.",
      es: "La derrota puede tomar el resultado; no dejes que tome el mando.",
    },
    explanation: {
      en: "Loss reveals whether identity was built on outcome or authority. The disciplined person studies defeat without kneeling to it.",
      es: "La pérdida revela si la identidad fue construida sobre resultado o autoridad. La persona disciplinada estudia la derrota sin arrodillarse ante ella.",
    },
    action: {
      en: "Daily action: Name one lesson from a loss without insulting yourself.",
      es: "Acción diaria: Nombra una lección de una pérdida sin insultarte.",
    },
    warning: {
      en: "Warning: Dignity is not denial of consequence.",
      es: "Advertencia: La dignidad no es negar la consecuencia.",
    },
  },
  {
    id: "law-21",
    number: 21,
    title: {
      en: "Study the Room's Weather",
      es: "Estudia el Clima de la Sala",
    },
    statement: {
      en: "Before acting, read the emotional climate.",
      es: "Antes de actuar, lee el clima emocional.",
    },
    explanation: {
      en: "Timing is not only the clock; it is the atmosphere. The same truth can open a door or close it depending on when it enters.",
      es: "El momento no es solo el reloj; es la atmósfera. La misma verdad puede abrir o cerrar una puerta según cuándo entra.",
    },
    action: {
      en: "Daily action: Before speaking a hard truth, identify the room's fear, hunger, and pace.",
      es: "Acción diaria: Antes de decir una verdad dura, identifica el miedo, hambre y ritmo de la sala.",
    },
    warning: {
      en: "Warning: Reading the room should not make you a servant of it.",
      es: "Advertencia: Leer la sala no debe hacerte siervo de ella.",
    },
  },
  {
    id: "law-22",
    number: 22,
    title: {
      en: "Make Gratitude Strategic",
      es: "Haz Estratégica la Gratitud",
    },
    statement: {
      en: "Honor what strengthens the mission.",
      es: "Honra lo que fortalece la misión.",
    },
    explanation: {
      en: "Gratitude is not softness; it is accurate memory. What you honor is more likely to remain visible and more likely to be protected.",
      es: "La gratitud no es blandura; es memoria exacta. Lo que honras permanece más visible y es más probable que sea protegido.",
    },
    action: {
      en: "Daily action: Thank one person or system that quietly supports your discipline.",
      es: "Acción diaria: Agradece a una persona o sistema que sostiene silenciosamente tu disciplina.",
    },
    warning: {
      en: "Warning: Gratitude must not excuse dependency.",
      es: "Advertencia: La gratitud no debe excusar dependencia.",
    },
  },
  {
    id: "law-23",
    number: 23,
    title: {
      en: "Hide the Root, Show the Fruit",
      es: "Oculta la Raíz, Muestra el Fruto",
    },
    statement: {
      en: "Protect the source of your strength.",
      es: "Protege la fuente de tu fuerza.",
    },
    explanation: {
      en: "Not every method belongs to public view. Some sources lose power when exposed to opinion, imitation, and negotiation.",
      es: "No todo método pertenece a la vista pública. Algunas fuentes pierden poder al exponerse a opinión, imitación y negociación.",
    },
    action: {
      en: "Daily action: Keep one stabilizing ritual private and complete it fully.",
      es: "Acción diaria: Mantén privado un ritual estabilizador y complétalo por completo.",
    },
    warning: {
      en: "Warning: Secrecy that protects corruption is not wisdom.",
      es: "Advertencia: El secreto que protege corrupción no es sabiduría.",
    },
  },
  {
    id: "law-24",
    number: 24,
    title: {
      en: "Do Not Confuse Access with Trust",
      es: "No Confundas Acceso con Confianza",
    },
    statement: {
      en: "Nearness is not proof of loyalty.",
      es: "La cercanía no prueba lealtad.",
    },
    explanation: {
      en: "Access can be accidental, inherited, or convenient. Trust must be built by consistency under pressure, not by proximity alone.",
      es: "El acceso puede ser accidental, heredado o conveniente. La confianza se construye por constancia bajo presión, no por proximidad.",
    },
    action: {
      en: "Daily action: Give one person or habit the access they have earned, not the access they request.",
      es: "Acción diaria: Da a una persona o hábito el acceso que ha ganado, no el que pide.",
    },
    warning: {
      en: "Warning: Guardedness can become loneliness if it never matures.",
      es: "Advertencia: Estar en guardia puede volverse soledad si nunca madura.",
    },
  },
  {
    id: "law-25",
    number: 25,
    title: {
      en: "Let Repetition Become Rank",
      es: "Deja que la Repetición Sea Rango",
    },
    statement: {
      en: "What you repeat earns authority.",
      es: "Lo que repites gana autoridad.",
    },
    explanation: {
      en: "A single act is a gesture; repeated action becomes rank in the inner order. Habits are coronations performed slowly.",
      es: "Un acto aislado es un gesto; la acción repetida se vuelve rango en el orden interior. Los hábitos son coronaciones realizadas lentamente.",
    },
    action: {
      en: "Daily action: Repeat your core habit at the same level even if no emotion supports it.",
      es: "Acción diaria: Repite tu hábito central al mismo nivel aunque ninguna emoción lo apoye.",
    },
    warning: {
      en: "Warning: Repetition without review can enthrone the wrong thing.",
      es: "Advertencia: Repetir sin revisar puede entronar lo equivocado.",
    },
  },
  {
    id: "law-26",
    number: 26,
    title: {
      en: "Refuse the Second Wound",
      es: "Rechaza la Segunda Herida",
    },
    statement: {
      en: "Do not keep injuring yourself with the memory.",
      es: "No sigas hiriéndote con el recuerdo.",
    },
    explanation: {
      en: "The first wound may be real; the second is often rehearsal. Power returns when memory becomes instruction instead of a courtroom.",
      es: "La primera herida puede ser real; la segunda suele ser ensayo. El poder vuelve cuando la memoria se vuelve instrucción en vez de tribunal.",
    },
    action: {
      en: "Daily action: Convert one painful memory into one boundary or lesson.",
      es: "Acción diaria: Convierte un recuerdo doloroso en un límite o lección.",
    },
    warning: {
      en: "Warning: Healing is not pretending the injury was acceptable.",
      es: "Advertencia: Sanar no es fingir que la herida fue aceptable.",
    },
  },
  {
    id: "law-27",
    number: 27,
    title: {
      en: "Keep Counsel Above Complaint",
      es: "Pon Consejo Sobre Queja",
    },
    statement: {
      en: "Complaint without counsel weakens the throne.",
      es: "La queja sin consejo debilita el trono.",
    },
    explanation: {
      en: "Complaint can expose pain, but if it never becomes instruction it trains helplessness. Counsel asks what the pain now demands.",
      es: "La queja puede exponer dolor, pero si nunca se vuelve instrucción entrena impotencia. El consejo pregunta qué exige ahora el dolor.",
    },
    action: {
      en: "Daily action: For one complaint, write the instruction hidden inside it.",
      es: "Acción diaria: Para una queja, escribe la instrucción escondida dentro de ella.",
    },
    warning: {
      en: "Warning: Counsel without compassion becomes cruelty.",
      es: "Advertencia: El consejo sin compasión se vuelve crueldad.",
    },
  },
  {
    id: "law-28",
    number: 28,
    title: {
      en: "Let the Face Serve the Mission",
      es: "Haz que el Rostro Sirva a la Misión",
    },
    statement: {
      en: "Do not let every feeling report itself.",
      es: "No dejes que todo sentimiento se reporte.",
    },
    explanation: {
      en: "The face can become a leak in the wall. Composure keeps strategy from being sold by a momentary expression.",
      es: "El rostro puede volverse una fuga en el muro. La compostura evita que una expresión momentánea venda la estrategia.",
    },
    action: {
      en: "Daily action: Breathe once before your face answers disappointment.",
      es: "Acción diaria: Respira una vez antes de que tu rostro responda a la decepción.",
    },
    warning: {
      en: "Warning: A controlled face must not become a dishonest heart.",
      es: "Advertencia: Un rostro controlado no debe volverse corazón deshonesto.",
    },
  },
  {
    id: "law-29",
    number: 29,
    title: {
      en: "Do the Unseen Maintenance",
      es: "Haz el Mantenimiento Invisible",
    },
    statement: {
      en: "Power decays first in neglected systems.",
      es: "El poder se deteriora primero en sistemas descuidados.",
    },
    explanation: {
      en: "Collapse rarely begins with spectacle. It begins with small ignored repairs, weak routines, and tolerated disorder.",
      es: "El derrumbe rara vez empieza con espectáculo. Empieza con reparaciones pequeñas ignoradas, rutinas débiles y desorden tolerado.",
    },
    action: {
      en: "Daily action: Repair one small system before it becomes urgent.",
      es: "Acción diaria: Repara un sistema pequeño antes de que se vuelva urgente.",
    },
    warning: {
      en: "Warning: Maintenance can become avoidance of decisive action.",
      es: "Advertencia: El mantenimiento puede volverse evasión de la acción decisiva.",
    },
  },
  {
    id: "law-30",
    number: 30,
    title: {
      en: "Never Negotiate with Collapse",
      es: "Nunca Negocies con el Derrumbe",
    },
    statement: {
      en: "When the inner structure falls, rebuild the first stone.",
      es: "Cuando cae la estructura interior, reconstruye la primera piedra.",
    },
    explanation: {
      en: "Collapse wants philosophy because philosophy delays obedience. The first useful response is usually small, physical, and immediate.",
      es: "El derrumbe quiere filosofía porque la filosofía retrasa la obediencia. La primera respuesta útil suele ser pequeña, física e inmediata.",
    },
    action: {
      en: "Daily action: When you feel yourself spiraling, stand up and complete one visible order.",
      es: "Acción diaria: Cuando sientas que caes en espiral, levántate y completa un orden visible.",
    },
    warning: {
      en: "Warning: Action helps, but chronic collapse may need outside help.",
      es: "Advertencia: La acción ayuda, pero el derrumbe crónico puede necesitar ayuda externa.",
    },
  },
  {
    id: "law-31",
    number: 31,
    title: {
      en: "Measure Before Judgment",
      es: "Mide Antes del Juicio",
    },
    statement: {
      en: "Do not let assumption wear the robe of truth.",
      es: "No dejes que la suposición vista la túnica de la verdad.",
    },
    explanation: {
      en: "Judgment feels powerful because it closes uncertainty. Measurement is stronger because it can survive contact with reality.",
      es: "El juicio se siente poderoso porque cierra la incertidumbre. La medida es más fuerte porque sobrevive al contacto con la realidad.",
    },
    action: {
      en: "Daily action: Verify one fact before forming a conclusion.",
      es: "Acción diaria: Verifica un hecho antes de formar una conclusión.",
    },
    warning: {
      en: "Warning: Endless measuring can hide fear of choosing.",
      es: "Advertencia: Medir sin fin puede ocultar miedo a elegir.",
    },
  },
  {
    id: "law-32",
    number: 32,
    title: {
      en: "Turn Envy into Study",
      es: "Convierte Envidia en Estudio",
    },
    statement: {
      en: "What you envy may reveal what you refuse to train.",
      es: "Lo que envidias puede revelar lo que te niegas a entrenar.",
    },
    explanation: {
      en: "Envy wastes attention by worshiping distance. Study closes distance by asking what skill, sacrifice, or patience created the result.",
      es: "La envidia desperdicia atención adorando distancia. El estudio cierra distancia preguntando qué habilidad, sacrificio o paciencia creó el resultado.",
    },
    action: {
      en: "Daily action: Name one skill behind something you envy and practice its first form.",
      es: "Acción diaria: Nombra una habilidad detrás de algo que envidias y practica su primera forma.",
    },
    warning: {
      en: "Warning: Study should not become imitation without identity.",
      es: "Advertencia: El estudio no debe volverse imitación sin identidad.",
    },
  },
  {
    id: "law-33",
    number: 33,
    title: {
      en: "Make Rest Serve Command",
      es: "Haz que el Descanso Sirva al Mando",
    },
    statement: {
      en: "Rest to return sharper, not to disappear.",
      es: "Descansa para volver más preciso, no para desaparecer.",
    },
    explanation: {
      en: "Rest is strategic when it restores command. Escape is different: it asks for relief while secretly abandoning the post.",
      es: "El descanso es estratégico cuando restaura el mando. El escape es distinto: pide alivio mientras abandona el puesto en secreto.",
    },
    action: {
      en: "Daily action: Take one deliberate rest with a clear return point.",
      es: "Acción diaria: Toma un descanso deliberado con un punto claro de regreso.",
    },
    warning: {
      en: "Warning: Exhaustion can disguise itself as discipline.",
      es: "Advertencia: El agotamiento puede disfrazarse de disciplina.",
    },
  },
  {
    id: "law-34",
    number: 34,
    title: {
      en: "Let Loyalty Require Truth",
      es: "Haz que la Lealtad Exija Verdad",
    },
    statement: {
      en: "Do not protect a bond by feeding its blindness.",
      es: "No protejas un vínculo alimentando su ceguera.",
    },
    explanation: {
      en: "Loyalty that refuses truth becomes a comfortable prison. Real allegiance strengthens what is worthy and confronts what is decaying.",
      es: "La lealtad que rechaza verdad se vuelve prisión cómoda. La alianza real fortalece lo digno y confronta lo que se deteriora.",
    },
    action: {
      en: "Daily action: Tell one necessary truth without insult or performance.",
      es: "Acción diaria: Di una verdad necesaria sin insulto ni actuación.",
    },
    warning: {
      en: "Warning: Truth without timing can become self-indulgence.",
      es: "Advertencia: La verdad sin tiempo correcto puede volverse indulgencia propia.",
    },
  },
  {
    id: "law-35",
    number: 35,
    title: {
      en: "Leave Before You Are Owned",
      es: "Sal Antes de Ser Poseído",
    },
    statement: {
      en: "Exit weakening patterns while exit is still cheap.",
      es: "Sal de patrones debilitantes mientras salir aún es barato.",
    },
    explanation: {
      en: "Chains are easiest to break when they are still called preferences. Delay gives them history, appetite, and a convincing voice.",
      es: "Las cadenas son más fáciles de romper cuando aún se llaman preferencias. La demora les da historia, apetito y una voz convincente.",
    },
    action: {
      en: "Daily action: End one small permission that you know grows expensive later.",
      es: "Acción diaria: Termina un permiso pequeño que sabes que luego se vuelve caro.",
    },
    warning: {
      en: "Warning: Leaving everything quickly is not freedom; it is instability.",
      es: "Advertencia: Dejar todo rápido no es libertad; es inestabilidad.",
    },
  },
  {
    id: "law-36",
    number: 36,
    title: {
      en: "Give No Throne to Urgency",
      es: "No Des Trono a la Urgencia",
    },
    statement: {
      en: "Urgent is not always sovereign.",
      es: "Lo urgente no siempre es soberano.",
    },
    explanation: {
      en: "Urgency often arrives wearing a crown it did not earn. The disciplined mind separates immediate pressure from actual importance.",
      es: "La urgencia suele llegar con una corona que no ganó. La mente disciplinada separa presión inmediata de importancia real.",
    },
    action: {
      en: "Daily action: Sort one demand into urgent, important, both, or neither.",
      es: "Acción diaria: Ordena una demanda como urgente, importante, ambas o ninguna.",
    },
    warning: {
      en: "Warning: Dismissing urgency can become negligence.",
      es: "Advertencia: Descartar urgencia puede volverse negligencia.",
    },
  },
  {
    id: "law-37",
    number: 37,
    title: {
      en: "Keep the Standard Alone",
      es: "Mantén el Estándar a Solas",
    },
    statement: {
      en: "Character is what remains when the audience leaves.",
      es: "El carácter es lo que queda cuando se va el público.",
    },
    explanation: {
      en: "The hidden standard is the true one. If discipline depends on witnesses, it belongs to the crowd, not to you.",
      es: "El estándar oculto es el verdadero. Si la disciplina depende de testigos, pertenece a la multitud, no a ti.",
    },
    action: {
      en: "Daily action: Do one correct thing that no one will notice.",
      es: "Acción diaria: Haz una cosa correcta que nadie notará.",
    },
    warning: {
      en: "Warning: Invisible virtue must not become secret superiority.",
      es: "Advertencia: La virtud invisible no debe volverse superioridad secreta.",
    },
  },
  {
    id: "law-38",
    number: 38,
    title: {
      en: "Use Pain as Intelligence",
      es: "Usa el Dolor como Inteligencia",
    },
    statement: {
      en: "Pain is a messenger; do not make it king.",
      es: "El dolor es mensajero; no lo hagas rey.",
    },
    explanation: {
      en: "Pain can show where structure failed, where desire ruled, or where a boundary was absent. It informs command but must not command alone.",
      es: "El dolor puede mostrar dónde falló la estructura, dónde gobernó el deseo o dónde faltó un límite. Informa al mando, pero no debe mandar solo.",
    },
    action: {
      en: "Daily action: Ask what your discomfort is trying to protect, expose, or demand.",
      es: "Acción diaria: Pregunta qué intenta proteger, exponer o exigir tu incomodidad.",
    },
    warning: {
      en: "Warning: Not every pain is noble; some pain is a signal to stop.",
      es: "Advertencia: No todo dolor es noble; algunos dolores son señal de detenerse.",
    },
  },
  {
    id: "law-39",
    number: 39,
    title: {
      en: "Let the Ledger Stay Honest",
      es: "Deja Honesto el Registro",
    },
    statement: {
      en: "Track reality without decorating it.",
      es: "Registra la realidad sin adornarla.",
    },
    explanation: {
      en: "False accounting protects the ego and bankrupts the future. A clean ledger lets discipline know where to begin.",
      es: "La contabilidad falsa protege el ego y arruina el futuro. Un registro limpio le muestra a la disciplina dónde empezar.",
    },
    action: {
      en: "Daily action: Record one missed or completed duty exactly as it happened.",
      es: "Acción diaria: Registra un deber fallado o completado exactamente como ocurrió.",
    },
    warning: {
      en: "Warning: Honesty should correct you, not crush you.",
      es: "Advertencia: La honestidad debe corregirte, no aplastarte.",
    },
  },
  {
    id: "law-40",
    number: 40,
    title: {
      en: "Refuse Cheap Certainty",
      es: "Rechaza la Certeza Barata",
    },
    statement: {
      en: "Do not buy confidence with missing facts.",
      es: "No compres confianza con hechos ausentes.",
    },
    explanation: {
      en: "Cheap certainty feels powerful because it ends the search. Strategic certainty waits for enough evidence to move without fantasy.",
      es: "La certeza barata se siente poderosa porque termina la búsqueda. La certeza estratégica espera evidencia suficiente para moverse sin fantasía.",
    },
    action: {
      en: "Daily action: Say 'I do not know yet' where your pride wants a conclusion.",
      es: "Acción diaria: Di 'aún no lo sé' donde tu orgullo quiere una conclusión.",
    },
    warning: {
      en: "Warning: Humility before facts should not become permanent hesitation.",
      es: "Advertencia: La humildad ante los hechos no debe volverse duda permanente.",
    },
  },
  {
    id: "law-41",
    number: 41,
    title: {
      en: "Make Your Pace Difficult to Own",
      es: "Haz tu Ritmo Difícil de Poseer",
    },
    statement: {
      en: "Do not let another person's tempo become your master.",
      es: "No dejes que el tempo de otra persona sea tu amo.",
    },
    explanation: {
      en: "Whoever controls your pace often controls your thinking. A sovereign rhythm gives you room to see, choose, and refuse.",
      es: "Quien controla tu ritmo suele controlar tu pensamiento. Un ritmo soberano te da espacio para ver, elegir y rechazar.",
    },
    action: {
      en: "Daily action: Slow one decision down until you can hear your own judgment.",
      es: "Acción diaria: Desacelera una decisión hasta escuchar tu propio juicio.",
    },
    warning: {
      en: "Warning: Independence of pace is not contempt for others.",
      es: "Advertencia: Independencia de ritmo no es desprecio por otros.",
    },
  },
  {
    id: "law-42",
    number: 42,
    title: {
      en: "Turn Applause into Fuel, Not Food",
      es: "Convierte el Aplauso en Combustible, no Alimento",
    },
    statement: {
      en: "Receive praise without becoming hungry for it.",
      es: "Recibe elogio sin volverte hambriento de él.",
    },
    explanation: {
      en: "Applause can encourage the mission or replace it. The moment praise becomes food, discipline begins serving the audience.",
      es: "El aplauso puede alentar la misión o reemplazarla. Cuando el elogio se vuelve alimento, la disciplina empieza a servir al público.",
    },
    action: {
      en: "Daily action: After receiving praise, return to one unglamorous duty.",
      es: "Acción diaria: Después de recibir elogio, vuelve a un deber sin gloria.",
    },
    warning: {
      en: "Warning: Rejecting all praise can hide fear of being seen.",
      es: "Advertencia: Rechazar todo elogio puede ocultar miedo a ser visto.",
    },
  },
  {
    id: "law-43",
    number: 43,
    title: {
      en: "Make the Easy Thing Earn Entry",
      es: "Haz que lo Fácil Gane Entrada",
    },
    statement: {
      en: "Convenience must pass inspection.",
      es: "La comodidad debe pasar inspección.",
    },
    explanation: {
      en: "The easiest path often asks for a hidden payment: attention, dignity, health, or future freedom. Inspect the price before entering.",
      es: "El camino más fácil suele pedir un pago oculto: atención, dignidad, salud o libertad futura. Revisa el precio antes de entrar.",
    },
    action: {
      en: "Daily action: Before choosing the easy option, name what it costs.",
      es: "Acción diaria: Antes de elegir la opción fácil, nombra lo que cuesta.",
    },
    warning: {
      en: "Warning: Difficulty alone does not make a path wise.",
      es: "Advertencia: La dificultad por sí sola no vuelve sabio un camino.",
    },
  },
  {
    id: "law-44",
    number: 44,
    title: {
      en: "Do Not Feed Every Fire",
      es: "No Alimentes Cada Fuego",
    },
    statement: {
      en: "Some conflicts survive only because you keep warming them.",
      es: "Algunos conflictos sobreviven solo porque sigues calentándolos.",
    },
    explanation: {
      en: "Attention is oxygen. A disciplined person knows which fires require water, which require distance, and which require no audience.",
      es: "La atención es oxígeno. Una persona disciplinada sabe qué fuegos requieren agua, cuáles distancia y cuáles ningún público.",
    },
    action: {
      en: "Daily action: Let one provocation pass without commentary.",
      es: "Acción diaria: Deja pasar una provocación sin comentario.",
    },
    warning: {
      en: "Warning: Ignored injustice can grow teeth.",
      es: "Advertencia: La injusticia ignorada puede desarrollar dientes.",
    },
  },
  {
    id: "law-45",
    number: 45,
    title: {
      en: "Close the Day with Authority",
      es: "Cierra el Día con Autoridad",
    },
    statement: {
      en: "Do not let the day dissolve without judgment.",
      es: "No dejes que el día se disuelva sin juicio.",
    },
    explanation: {
      en: "An unexamined day becomes fog. Closing the day with authority turns scattered action into instruction for tomorrow.",
      es: "Un día sin examinar se vuelve niebla. Cerrar el día con autoridad convierte acción dispersa en instrucción para mañana.",
    },
    action: {
      en: "Daily action: Name what you obeyed, what you avoided, and what must be corrected.",
      es: "Acción diaria: Nombra qué obedeciste, qué evitaste y qué debe corregirse.",
    },
    warning: {
      en: "Warning: Review must not become nightly self-punishment.",
      es: "Advertencia: La revisión no debe volverse castigo nocturno.",
    },
  },
  {
    id: "law-46",
    number: 46,
    title: {
      en: "Return Without Ceremony",
      es: "Regresa Sin Ceremonia",
    },
    statement: {
      en: "When you fall, restart before shame organizes a parade.",
      es: "Cuando caigas, reinicia antes de que la vergüenza organice un desfile.",
    },
    explanation: {
      en: "Shame loves ceremony because ceremony delays return. The disciplined person does not dramatize the fall; they restore command.",
      es: "La vergüenza ama la ceremonia porque la ceremonia retrasa el regreso. La persona disciplinada no dramatiza la caída; restaura el mando.",
    },
    action: {
      en: "Daily action: Correct one lapse immediately with the next small obedience.",
      es: "Acción diaria: Corrige una caída inmediatamente con la siguiente obediencia pequeña.",
    },
    warning: {
      en: "Warning: Quick return is not permission to repeat the wound.",
      es: "Advertencia: Regresar rápido no es permiso para repetir la herida.",
    },
  },
  {
    id: "law-47",
    number: 47,
    title: {
      en: "Aim Influence at the Self First",
      es: "Dirige la Influencia Primero al Yo",
    },
    statement: {
      en: "Influence without self-rule becomes contamination.",
      es: "La influencia sin gobierno propio se vuelve contaminación.",
    },
    explanation: {
      en: "The first territory of power is the self. If you cannot influence your own habits, influencing others becomes hunger in ceremonial clothing.",
      es: "El primer territorio del poder es el yo. Si no puedes influir en tus propios hábitos, influir en otros se vuelve hambre con ropa ceremonial.",
    },
    action: {
      en: "Daily action: Persuade yourself into one disciplined action before advising anyone else.",
      es: "Acción diaria: Persuádete a una acción disciplinada antes de aconsejar a alguien más.",
    },
    warning: {
      en: "Warning: Self-rule should make you clearer, not self-obsessed.",
      es: "Advertencia: El gobierno propio debe hacerte más claro, no obsesionado contigo.",
    },
  },
  {
    id: "law-48",
    number: 48,
    title: {
      en: "Hold Power as Stewardship",
      es: "Sostén el Poder como Custodia",
    },
    statement: {
      en: "Power is safest when it remembers what it serves.",
      es: "El poder es más seguro cuando recuerda a qué sirve.",
    },
    explanation: {
      en: "Power without purpose becomes appetite with better tools. Covenant power serves order, clarity, restraint, and the future self that must live with today's choices.",
      es: "El poder sin propósito se vuelve apetito con mejores herramientas. El poder Covenant sirve al orden, claridad, dominio y al yo futuro que vivirá con las decisiones de hoy.",
    },
    action: {
      en: "Daily action: Before using authority, name the responsibility it must protect.",
      es: "Acción diaria: Antes de usar autoridad, nombra la responsabilidad que debe proteger.",
    },
    warning: {
      en: "Warning: Stewardship without courage becomes polite surrender.",
      es: "Advertencia: La custodia sin coraje se vuelve rendición educada.",
    },
  },
];
