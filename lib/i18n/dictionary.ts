// Onboarding copy in every supported locale. Picking a language in Step 1
// swaps this dictionary live via the LocaleProvider — no reload.
//
// Tone of voice: warm, scientific, motivating. BMI tiers NEVER use blunt
// words ("skinny", "fat", "obese"). Each tier has a supportive name, a
// motivational message, and 2–3 "Biological Advantages" that reframe the
// result as a strength.

export const LOCALES = [
  { code: "en", flag: "🇬🇧", native: "English" },
  { code: "lt", flag: "🇱🇹", native: "Lietuvių" },
  { code: "lv", flag: "🇱🇻", native: "Latviešu" },
  { code: "pl", flag: "🇵🇱", native: "Polski" },
  { code: "de", flag: "🇩🇪", native: "Deutsch" },
  { code: "es", flag: "🇪🇸", native: "Español" },
  { code: "fr", flag: "🇫🇷", native: "Français" },
  { code: "ru", flag: "🇷🇺", native: "Русский" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

// Canonical tier keys — also persisted to profiles.bmi_status.
export type BmiTierKey = "lean_light" | "optimal_balance" | "solid_built" | "focus_zone";

interface TierCopy {
  name: string;
  message: string;
  advantages: string[];
}

export interface Dict {
  step: string; // "Step {n} of {total}"
  back: string;
  continue: string;
  getStarted: string;
  lang: { title: string; subtitle: string };
  metrics: {
    title: string;
    subtitle: string;
    age: string;
    weight: string;
    height: string;
    years: string;
  };
  bmi: {
    title: string;
    subtitle: string;
    label: string;
    advantagesTitle: string;
    enterMetrics: string;
    finishTitle: string;
    finishSubtitle: string;
    tiers: Record<BmiTierKey, TierCopy>;
  };
}

const en: Dict = {
  step: "Step {n} of {total}",
  back: "Back", continue: "Continue", getStarted: "Get started",
  lang: { title: "Choose your language", subtitle: "You can change this anytime in Settings." },
  metrics: {
    title: "A few details about you",
    subtitle: "We use these to personalize your nutrition.",
    age: "Age", weight: "Weight", height: "Height", years: "years",
  },
  bmi: {
    title: "Your body composition",
    subtitle: "Calculated live from your height and weight.",
    label: "BMI",
    advantagesTitle: "Your biological advantages",
    enterMetrics: "Enter your weight and height to see your result.",
    finishTitle: "You're all set",
    finishSubtitle: "Your plan is ready. Let's eat well.",
    tiers: {
      lean_light: {
        name: "Lean & Light",
        message: "A great base to build clean strength and steady energy. Let's add nourishing fuel.",
        advantages: [
          "Higher baseline agility with lower joint stress during cardio",
          "Ideal canvas for clean, aesthetic muscle definition",
          "High metabolic flexibility",
        ],
      },
      optimal_balance: {
        name: "Optimal Balance",
        message: "Beautifully balanced — a healthy foundation to build lasting habits on.",
        advantages: [
          "Prime metabolic base to lose fat and gain muscle at once",
          "Balanced recovery rates and stable hormone production",
          "Excellent cardiovascular efficiency",
        ],
      },
      solid_built: {
        name: "Solid & Built",
        message: "A strong starting point. We'll focus on recomposition and optimizing your energy.",
        advantages: [
          "Massive strength potential — already adapted to carrying load",
          "High caloric baseline fuels rapid muscle building (hypertrophy)",
          "Greater bone density and joint stability for heavy lifting",
        ],
      },
      focus_zone: {
        name: "Focus Zone",
        message: "Every sustainable step counts. We'll look after your metabolic health, together.",
        advantages: [
          "Massive strength potential — already adapted to carrying load",
          "High caloric baseline fuels rapid muscle building (hypertrophy)",
          "Greater bone density and joint stability for heavy lifting",
        ],
      },
    },
  },
};

const lt: Dict = {
  step: "{n} žingsnis iš {total}",
  back: "Atgal", continue: "Tęsti", getStarted: "Pradėti",
  lang: { title: "Pasirinkite kalbą", subtitle: "Galėsite pakeisti bet kada nustatymuose." },
  metrics: {
    title: "Šiek tiek apie jus",
    subtitle: "Naudosime tai jūsų mitybai pritaikyti.",
    age: "Amžius", weight: "Svoris", height: "Ūgis", years: "metai",
  },
  bmi: {
    title: "Jūsų kūno sudėjimas",
    subtitle: "Apskaičiuojama iš ūgio ir svorio.",
    label: "KMI",
    advantagesTitle: "Jūsų biologiniai pliusai",
    enterMetrics: "Įveskite svorį ir ūgį, kad pamatytumėte rezultatą.",
    finishTitle: "Viskas paruošta",
    finishSubtitle: "Jūsų planas paruoštas. Valgykime sveikai.",
    tiers: {
      lean_light: {
        name: "Lengvas ir tvirtas",
        message: "Puikus pagrindas švariai jėgai ir tolygiai energijai. Pridėkime maistingo kuro.",
        advantages: [
          "Didesnis judrumas ir mažesnė sąnarių apkrova darant kardio",
          "Ideali bazė švariam, estetiškam raumenų reljefui",
          "Aukštas metabolinis lankstumas",
        ],
      },
      optimal_balance: {
        name: "Optimali pusiausvyra",
        message: "Puikiai subalansuota — sveikas pagrindas ilgalaikiams įpročiams.",
        advantages: [
          "Puiki metabolinė bazė vienu metu deginti riebalus ir auginti raumenis",
          "Subalansuotas atsigavimas ir stabili hormonų gamyba",
          "Puikus širdies ir kraujagyslių efektyvumas",
        ],
      },
      solid_built: {
        name: "Tvirtas ir stiprus",
        message: "Stiprus startas. Sutelksime dėmesį į kūno kompoziciją ir energijos optimizavimą.",
        advantages: [
          "Didžiulis jėgos potencialas — kūnas jau pripratęs nešti svorį",
          "Aukšta kalorijų bazė skatina spartų raumenų augimą (hipertrofiją)",
          "Didesnis kaulų tankis ir sąnarių stabilumas sunkiems pratimams",
        ],
      },
      focus_zone: {
        name: "Dėmesio zona",
        message: "Kiekvienas tvarus žingsnis svarbus. Kartu rūpinsimės metaboline sveikata.",
        advantages: [
          "Didžiulis jėgos potencialas — kūnas jau pripratęs nešti svorį",
          "Aukšta kalorijų bazė skatina spartų raumenų augimą (hipertrofiją)",
          "Didesnis kaulų tankis ir sąnarių stabilumas sunkiems pratimams",
        ],
      },
    },
  },
};

const lv: Dict = {
  step: "{n}. solis no {total}",
  back: "Atpakaļ", continue: "Turpināt", getStarted: "Sākt",
  lang: { title: "Izvēlieties valodu", subtitle: "To var mainīt jebkurā laikā iestatījumos." },
  metrics: {
    title: "Nedaudz par jums",
    subtitle: "Mēs to izmantojam, lai pielāgotu uzturu.",
    age: "Vecums", weight: "Svars", height: "Augums", years: "gadi",
  },
  bmi: {
    title: "Jūsu ķermeņa uzbūve",
    subtitle: "Aprēķināts no auguma un svara.",
    label: "ĶMI",
    advantagesTitle: "Jūsu bioloģiskās priekšrocības",
    enterMetrics: "Ievadiet svaru un augumu, lai redzētu rezultātu.",
    finishTitle: "Viss gatavs",
    finishSubtitle: "Jūsu plāns ir gatavs. Ēdīsim veselīgi.",
    tiers: {
      lean_light: {
        name: "Viegls un spēcīgs",
        message: "Lieliska bāze tīram spēkam un stabilai enerģijai. Pievienosim barojošu degvielu.",
        advantages: [
          "Augstāka veiklība un mazāka locītavu slodze kardio laikā",
          "Ideāla bāze tīrai, estētiskai muskuļu definīcijai",
          "Augsta metaboliskā elastība",
        ],
      },
      optimal_balance: {
        name: "Optimāls līdzsvars",
        message: "Skaisti līdzsvarots — vesels pamats ilgtspējīgiem ieradumiem.",
        advantages: [
          "Lieliska metaboliskā bāze vienlaikus zaudēt taukus un augt muskuļus",
          "Līdzsvarota atjaunošanās un stabila hormonu ražošana",
          "Lieliska sirds un asinsvadu efektivitāte",
        ],
      },
      solid_built: {
        name: "Stingrs un spēcīgs",
        message: "Spēcīgs sākums. Koncentrēsimies uz ķermeņa kompozīciju un enerģiju.",
        advantages: [
          "Milzīgs spēka potenciāls — ķermenis jau pielāgots slodzes nešanai",
          "Augsta kaloriju bāze veicina strauju muskuļu augšanu (hipertrofiju)",
          "Lielāks kaulu blīvums un locītavu stabilitāte smagiem vingrinājumiem",
        ],
      },
      focus_zone: {
        name: "Fokusa zona",
        message: "Katrs ilgtspējīgs solis ir svarīgs. Kopā rūpēsimies par metabolisko veselību.",
        advantages: [
          "Milzīgs spēka potenciāls — ķermenis jau pielāgots slodzes nešanai",
          "Augsta kaloriju bāze veicina strauju muskuļu augšanu (hipertrofiju)",
          "Lielāks kaulu blīvums un locītavu stabilitāte smagiem vingrinājumiem",
        ],
      },
    },
  },
};

const pl: Dict = {
  step: "Krok {n} z {total}",
  back: "Wstecz", continue: "Dalej", getStarted: "Zaczynamy",
  lang: { title: "Wybierz język", subtitle: "Możesz to zmienić w dowolnym momencie w Ustawieniach." },
  metrics: {
    title: "Kilka informacji o Tobie",
    subtitle: "Używamy ich do personalizacji odżywiania.",
    age: "Wiek", weight: "Waga", height: "Wzrost", years: "lat",
  },
  bmi: {
    title: "Twoja budowa ciała",
    subtitle: "Obliczana na żywo z wzrostu i wagi.",
    label: "BMI",
    advantagesTitle: "Twoje przewagi biologiczne",
    enterMetrics: "Podaj wagę i wzrost, aby zobaczyć wynik.",
    finishTitle: "Wszystko gotowe",
    finishSubtitle: "Twój plan jest gotowy. Jedzmy zdrowo.",
    tiers: {
      lean_light: {
        name: "Lekki i silny",
        message: "Świetna baza do budowania czystej siły i stabilnej energii. Dodajmy odżywczego paliwa.",
        advantages: [
          "Większa zwinność i mniejsze obciążenie stawów podczas cardio",
          "Idealna baza dla czystej, estetycznej definicji mięśni",
          "Wysoka elastyczność metaboliczna",
        ],
      },
      optimal_balance: {
        name: "Optymalna równowaga",
        message: "Pięknie zrównoważone — zdrowy fundament trwałych nawyków.",
        advantages: [
          "Doskonała baza metaboliczna do jednoczesnej redukcji i budowy mięśni",
          "Zrównoważona regeneracja i stabilna produkcja hormonów",
          "Świetna wydolność sercowo-naczyniowa",
        ],
      },
      solid_built: {
        name: "Mocny i zbudowany",
        message: "Silny początek. Skupimy się na rekompozycji i optymalizacji energii.",
        advantages: [
          "Ogromny potencjał siły — ciało już przystosowane do dźwigania",
          "Wysoka baza kaloryczna napędza szybki wzrost mięśni (hipertrofię)",
          "Większa gęstość kości i stabilność stawów przy ciężkich treningach",
        ],
      },
      focus_zone: {
        name: "Strefa skupienia",
        message: "Każdy zrównoważony krok się liczy. Zadbamy o zdrowie metaboliczne razem.",
        advantages: [
          "Ogromny potencjał siły — ciało już przystosowane do dźwigania",
          "Wysoka baza kaloryczna napędza szybki wzrost mięśni (hipertrofię)",
          "Większa gęstość kości i stabilność stawów przy ciężkich treningach",
        ],
      },
    },
  },
};

const de: Dict = {
  step: "Schritt {n} von {total}",
  back: "Zurück", continue: "Weiter", getStarted: "Loslegen",
  lang: { title: "Wähle deine Sprache", subtitle: "Du kannst dies jederzeit in den Einstellungen ändern." },
  metrics: {
    title: "Ein paar Angaben zu dir",
    subtitle: "Damit personalisieren wir deine Ernährung.",
    age: "Alter", weight: "Gewicht", height: "Größe", years: "Jahre",
  },
  bmi: {
    title: "Deine Körperzusammensetzung",
    subtitle: "Live aus Größe und Gewicht berechnet.",
    label: "BMI",
    advantagesTitle: "Deine biologischen Vorteile",
    enterMetrics: "Gib Gewicht und Größe ein, um dein Ergebnis zu sehen.",
    finishTitle: "Alles bereit",
    finishSubtitle: "Dein Plan ist fertig. Lass uns gut essen.",
    tiers: {
      lean_light: {
        name: "Leicht & Stark",
        message: "Eine super Basis für saubere Kraft und stabile Energie. Geben wir nahrhaften Treibstoff dazu.",
        advantages: [
          "Höhere Agilität bei geringerer Gelenkbelastung beim Cardio",
          "Ideale Basis für saubere, ästhetische Muskeldefinition",
          "Hohe metabolische Flexibilität",
        ],
      },
      optimal_balance: {
        name: "Optimale Balance",
        message: "Wunderbar ausgewogen — ein gesundes Fundament für dauerhafte Gewohnheiten.",
        advantages: [
          "Top-Stoffwechselbasis, um Fett zu verlieren und Muskeln aufzubauen",
          "Ausgewogene Erholung und stabile Hormonproduktion",
          "Hervorragende kardiovaskuläre Effizienz",
        ],
      },
      solid_built: {
        name: "Solide & Kräftig",
        message: "Starker Ausgangspunkt. Wir fokussieren auf Rekomposition und deine Energie.",
        advantages: [
          "Enormes Kraftpotenzial — bereits an das Tragen von Last angepasst",
          "Hohe Kalorienbasis treibt schnellen Muskelaufbau (Hypertrophie)",
          "Höhere Knochendichte und Gelenkstabilität für schweres Training",
        ],
      },
      focus_zone: {
        name: "Fokus-Zone",
        message: "Jeder nachhaltige Schritt zählt. Wir kümmern uns gemeinsam um deine Stoffwechselgesundheit.",
        advantages: [
          "Enormes Kraftpotenzial — bereits an das Tragen von Last angepasst",
          "Hohe Kalorienbasis treibt schnellen Muskelaufbau (Hypertrophie)",
          "Höhere Knochendichte und Gelenkstabilität für schweres Training",
        ],
      },
    },
  },
};

const es: Dict = {
  step: "Paso {n} de {total}",
  back: "Atrás", continue: "Continuar", getStarted: "Empezar",
  lang: { title: "Elige tu idioma", subtitle: "Puedes cambiarlo cuando quieras en Ajustes." },
  metrics: {
    title: "Unos datos sobre ti",
    subtitle: "Los usamos para personalizar tu nutrición.",
    age: "Edad", weight: "Peso", height: "Altura", years: "años",
  },
  bmi: {
    title: "Tu composición corporal",
    subtitle: "Calculada en vivo desde tu altura y peso.",
    label: "IMC",
    advantagesTitle: "Tus ventajas biológicas",
    enterMetrics: "Introduce tu peso y altura para ver tu resultado.",
    finishTitle: "Todo listo",
    finishSubtitle: "Tu plan está listo. Comamos bien.",
    tiers: {
      lean_light: {
        name: "Ligero y Fuerte",
        message: "Una gran base para construir fuerza limpia y energía estable. Añadamos combustible nutritivo.",
        advantages: [
          "Mayor agilidad y menor estrés articular durante el cardio",
          "Base ideal para una definición muscular limpia y estética",
          "Alta flexibilidad metabólica",
        ],
      },
      optimal_balance: {
        name: "Equilibrio Óptimo",
        message: "Bellamente equilibrado: una base sana para hábitos duraderos.",
        advantages: [
          "Base metabólica ideal para perder grasa y ganar músculo a la vez",
          "Recuperación equilibrada y producción hormonal estable",
          "Excelente eficiencia cardiovascular",
        ],
      },
      solid_built: {
        name: "Sólido y Fuerte",
        message: "Un gran punto de partida. Nos centraremos en la recomposición y tu energía.",
        advantages: [
          "Enorme potencial de fuerza — ya adaptado a soportar carga",
          "Alta base calórica que impulsa el crecimiento muscular (hipertrofia)",
          "Mayor densidad ósea y estabilidad articular para levantar peso",
        ],
      },
      focus_zone: {
        name: "Zona de Enfoque",
        message: "Cada paso sostenible cuenta. Cuidaremos tu salud metabólica, juntos.",
        advantages: [
          "Enorme potencial de fuerza — ya adaptado a soportar carga",
          "Alta base calórica que impulsa el crecimiento muscular (hipertrofia)",
          "Mayor densidad ósea y estabilidad articular para levantar peso",
        ],
      },
    },
  },
};

const fr: Dict = {
  step: "Étape {n} sur {total}",
  back: "Retour", continue: "Continuer", getStarted: "Commencer",
  lang: { title: "Choisissez votre langue", subtitle: "Vous pourrez la changer à tout moment dans les Réglages." },
  metrics: {
    title: "Quelques détails sur vous",
    subtitle: "Nous les utilisons pour personnaliser votre nutrition.",
    age: "Âge", weight: "Poids", height: "Taille", years: "ans",
  },
  bmi: {
    title: "Votre composition corporelle",
    subtitle: "Calculée en direct selon votre taille et poids.",
    label: "IMC",
    advantagesTitle: "Vos avantages biologiques",
    enterMetrics: "Saisissez votre poids et taille pour voir votre résultat.",
    finishTitle: "Tout est prêt",
    finishSubtitle: "Votre plan est prêt. Mangeons bien.",
    tiers: {
      lean_light: {
        name: "Léger & Fort",
        message: "Une super base pour bâtir une force saine et une énergie stable. Ajoutons du carburant nourrissant.",
        advantages: [
          "Plus d'agilité et moins de stress articulaire pendant le cardio",
          "Base idéale pour une définition musculaire nette et esthétique",
          "Grande flexibilité métabolique",
        ],
      },
      optimal_balance: {
        name: "Équilibre Optimal",
        message: "Joliment équilibré — une base saine pour des habitudes durables.",
        advantages: [
          "Base métabolique idéale pour perdre du gras et gagner du muscle",
          "Récupération équilibrée et production hormonale stable",
          "Excellente efficacité cardiovasculaire",
        ],
      },
      solid_built: {
        name: "Solide & Bâti",
        message: "Un excellent point de départ. Concentrons-nous sur la recomposition et l'énergie.",
        advantages: [
          "Énorme potentiel de force — déjà adapté à porter des charges",
          "Base calorique élevée favorisant une prise de muscle rapide (hypertrophie)",
          "Densité osseuse et stabilité articulaire accrues pour les charges lourdes",
        ],
      },
      focus_zone: {
        name: "Zone de Focus",
        message: "Chaque pas durable compte. Prenons soin de votre santé métabolique, ensemble.",
        advantages: [
          "Énorme potentiel de force — déjà adapté à porter des charges",
          "Base calorique élevée favorisant une prise de muscle rapide (hypertrophie)",
          "Densité osseuse et stabilité articulaire accrues pour les charges lourdes",
        ],
      },
    },
  },
};

const ru: Dict = {
  step: "Шаг {n} из {total}",
  back: "Назад", continue: "Продолжить", getStarted: "Начать",
  lang: { title: "Выберите язык", subtitle: "Это можно изменить в любой момент в настройках." },
  metrics: {
    title: "Немного о вас",
    subtitle: "Мы используем это для персонализации питания.",
    age: "Возраст", weight: "Вес", height: "Рост", years: "лет",
  },
  bmi: {
    title: "Ваш состав тела",
    subtitle: "Рассчитывается вживую по росту и весу.",
    label: "ИМТ",
    advantagesTitle: "Ваши биологические преимущества",
    enterMetrics: "Введите вес и рост, чтобы увидеть результат.",
    finishTitle: "Всё готово",
    finishSubtitle: "Ваш план готов. Питаемся правильно.",
    tiers: {
      lean_light: {
        name: "Лёгкий и сильный",
        message: "Отличная база для чистой силы и стабильной энергии. Добавим питательного топлива.",
        advantages: [
          "Выше ловкость и меньше нагрузка на суставы во время кардио",
          "Идеальная база для чистого, эстетичного рельефа мышц",
          "Высокая метаболическая гибкость",
        ],
      },
      optimal_balance: {
        name: "Оптимальный баланс",
        message: "Прекрасно сбалансировано — здоровая основа для устойчивых привычек.",
        advantages: [
          "Идеальная метаболическая база, чтобы терять жир и растить мышцы",
          "Сбалансированное восстановление и стабильный гормональный фон",
          "Отличная эффективность сердечно-сосудистой системы",
        ],
      },
      solid_built: {
        name: "Крепкий и сильный",
        message: "Сильная отправная точка. Сфокусируемся на рекомпозиции и энергии.",
        advantages: [
          "Огромный силовой потенциал — тело уже привыкло нести нагрузку",
          "Высокая калорийная база ускоряет рост мышц (гипертрофию)",
          "Выше плотность костей и стабильность суставов для тяжёлых нагрузок",
        ],
      },
      focus_zone: {
        name: "Зона фокуса",
        message: "Каждый устойчивый шаг важен. Позаботимся о метаболическом здоровье вместе.",
        advantages: [
          "Огромный силовой потенциал — тело уже привыкло нести нагрузку",
          "Высокая калорийная база ускоряет рост мышц (гипертрофию)",
          "Выше плотность костей и стабильность суставов для тяжёлых нагрузок",
        ],
      },
    },
  },
};

export const DICTIONARIES: Record<LocaleCode, Dict> = {
  en, lt, lv, pl, de, es, fr, ru,
};

/** Interpolate {placeholders} in a string. */
export function t(str: string, vars: Record<string, string | number> = {}): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
