import {
  COFFEE_SUPPORT_URL,
  SUPPORT_COVENANT_URL,
  SUPPORTER_URL,
} from "./site-links";

type Language = "en" | "es";

const copy = {
  en: {
    eyebrow: "Mission",
    title: "Support Covenant",
    text: "If Covenant has helped you build discipline, clarity, or inner strength, you can support the mission and future development.",
    support: "Support Covenant",
    coffee: "Buy me a coffee",
    supporter: "Become a supporter",
  },
  es: {
    eyebrow: "Misión",
    title: "Apoya Covenant",
    text: "Si Covenant te ha ayudado a construir disciplina, claridad o fortaleza interior, puedes apoyar la misión y el futuro desarrollo.",
    support: "Apoyar Covenant",
    coffee: "Invitar un café",
    supporter: "Convertirme en patrocinador",
  },
};

export default function SupportCovenantSection({
  language,
}: {
  language: Language;
}) {
  const t = copy[language];

  return (
    <section id="mission-support" className="section mission-support-section">
      <div className="mission-support-copy">
        <div className="language-switch" aria-label="Support language">
          <a
            aria-current={language === "en" ? "true" : undefined}
            href="?supportLanguage=en#mission-support"
          >
            EN
          </a>
          <a
            aria-current={language === "es" ? "true" : undefined}
            href="?supportLanguage=es#mission-support"
          >
            ES
          </a>
        </div>

        <p className="eyebrow">{t.eyebrow}</p>
        <h2>{t.title}</h2>
        <p>{t.text}</p>
      </div>

      <div className="mission-support-actions">
        <a
          href={SUPPORT_COVENANT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.support}
        </a>
        <a
          href={COFFEE_SUPPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          {t.coffee}
        </a>
        <a href={SUPPORTER_URL} target="_blank" rel="noopener noreferrer">
          {t.supporter}
        </a>
      </div>
    </section>
  );
}
