// Onboarding copy in every supported locale. Picking a language in Step 1
// swaps this dictionary live via the LocaleProvider — no reload.
//
// Tone of voice: elite sports-science telemetry. Precise, data-backed,
// clinically confident. No casual validation, no emoji. Each BMI tier reads
// like a lab report: a classification, a status headline, and three
// "biological leverage points" expressed as measured metrics.

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

interface LeveragePoint {
  metric: string; // concise scientific label
  detail: string; // measured mechanism, one clause
}

interface TierCopy {
  name: string; // classification badge
  headline: string; // status statement
  leverage: LeveragePoint[];
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
    title: string; // eyebrow
    label: string; // "BMI" / "IMC" ...
    analysisComplete: string;
    leverageTitle: string;
    enterMetrics: string;
    finishTitle: string;
    finishSubtitle: string;
    tiers: Record<BmiTierKey, TierCopy>;
  };
  success: {
    booting: [string, string, string]; // telemetry boot sequence
    complete: string; // "Calibration Complete"
    initialized: string; // "Protocol Initialized"
    enter: string; // CTA
  };
}

// The per-locale objects below define everything except the success screen
// copy, which is merged in from SUCCESS at the bottom to keep each block lean.
type Base = Omit<Dict, "success">;

const en: Base = {
  step: "Step {n} of {total}",
  back: "Back", continue: "Continue", getStarted: "Get started",
  lang: { title: "Choose your language", subtitle: "You can change this anytime in Settings." },
  metrics: {
    title: "A few details about you",
    subtitle: "We use these to personalize your nutrition.",
    age: "Age", weight: "Weight", height: "Height", years: "years",
  },
  bmi: {
    title: "Composition Analysis",
    label: "BMI",
    analysisComplete: "Physical composition analysis complete.",
    leverageTitle: "Primary Biological Leverage Points",
    enterMetrics: "Enter your weight and height to run the analysis.",
    finishTitle: "You're all set",
    finishSubtitle: "Your plan is ready. Let's eat well.",
    tiers: {
      lean_light: {
        name: "Lean Phenotype",
        headline: "Lean Baseline Established",
        leverage: [
          { metric: "Low Mechanical Load", detail: "Reduced articular stress permits high training volume and rapid motor recovery." },
          { metric: "High Insulin Sensitivity", detail: "Efficient nutrient partitioning primes clean myofibrillar accrual." },
          { metric: "Elevated Metabolic Flexibility", detail: "Rapid substrate switching across lipid and glycolytic energy systems." },
        ],
      },
      optimal_balance: {
        name: "Optimal Balance",
        headline: "Metabolic Baseline Established",
        leverage: [
          { metric: "High Metabolic Plasticity", detail: "Optimal environment for simultaneous lipid oxidation and myofibrillar hypertrophy." },
          { metric: "Stabilized Endocrine Baseline", detail: "Optimal recovery windows and consistent hormone synthesis pathways." },
          { metric: "Peak Aerobic Efficiency", detail: "Optimized stroke volume and cardiovascular capacity." },
        ],
      },
      solid_built: {
        name: "Power Reserve",
        headline: "Strength Reserve Identified",
        leverage: [
          { metric: "High Force Output Potential", detail: "Neuromuscular system pre-adapted to substantial mechanical load." },
          { metric: "Anabolic Surplus Reserve", detail: "Elevated caloric baseline accelerates myofibrillar hypertrophy under load." },
          { metric: "Superior Skeletal Density", detail: "Increased bone mineral density and joint stability for maximal loading." },
        ],
      },
      focus_zone: {
        name: "High Capacity",
        headline: "High-Capacity Profile Detected",
        leverage: [
          { metric: "High Force Output Potential", detail: "Neuromuscular system pre-adapted to substantial mechanical load." },
          { metric: "Anabolic Surplus Reserve", detail: "Elevated caloric baseline accelerates myofibrillar hypertrophy under load." },
          { metric: "Superior Skeletal Density", detail: "Increased bone mineral density and joint stability for maximal loading." },
        ],
      },
    },
  },
};

const lt: Base = {
  step: "{n} žingsnis iš {total}",
  back: "Atgal", continue: "Tęsti", getStarted: "Pradėti",
  lang: { title: "Pasirinkite kalbą", subtitle: "Galėsite pakeisti bet kada nustatymuose." },
  metrics: {
    title: "Šiek tiek apie jus",
    subtitle: "Naudosime tai jūsų mitybai pritaikyti.",
    age: "Amžius", weight: "Svoris", height: "Ūgis", years: "metai",
  },
  bmi: {
    title: "Sudėties analizė",
    label: "KMI",
    analysisComplete: "Kūno sudėties analizė baigta.",
    leverageTitle: "Pagrindiniai biologiniai svertai",
    enterMetrics: "Įveskite svorį ir ūgį analizei atlikti.",
    finishTitle: "Viskas paruošta",
    finishSubtitle: "Jūsų planas paruoštas. Valgykime sveikai.",
    tiers: {
      lean_light: {
        name: "Liesas fenotipas",
        headline: "Liesa bazinė linija nustatyta",
        leverage: [
          { metric: "Maža mechaninė apkrova", detail: "Mažesnė sąnarių apkrova leidžia didelę treniruočių apimtį ir greitą atsigavimą." },
          { metric: "Aukštas jautrumas insulinui", detail: "Efektyvus medžiagų paskirstymas skatina švarų raumenų augimą." },
          { metric: "Padidintas metabolinis lankstumas", detail: "Greitas perėjimas tarp lipidų ir glikolizės energijos sistemų." },
        ],
      },
      optimal_balance: {
        name: "Optimali pusiausvyra",
        headline: "Metabolinė bazinė linija nustatyta",
        leverage: [
          { metric: "Aukštas metabolinis plastiškumas", detail: "Optimali aplinka vienu metu deginti lipidus ir auginti raumenis (hipertrofija)." },
          { metric: "Stabili endokrininė bazė", detail: "Optimalūs atsigavimo langai ir nuoseklus hormonų sintezės kelias." },
          { metric: "Aukščiausias aerobinis efektyvumas", detail: "Optimizuotas širdies smūgio tūris ir kraujagyslių pajėgumas." },
        ],
      },
      solid_built: {
        name: "Jėgos rezervas",
        headline: "Jėgos rezervas identifikuotas",
        leverage: [
          { metric: "Aukštas jėgos potencialas", detail: "Neuroraumeninė sistema pritaikyta didelei mechaninei apkrovai." },
          { metric: "Anabolinis perteklius", detail: "Padidinta kalorijų bazė spartina raumenų hipertrofiją esant apkrovai." },
          { metric: "Didesnis kaulų tankis", detail: "Didesnis kaulų mineralinis tankis ir sąnarių stabilumas didelėms apkrovoms." },
        ],
      },
      focus_zone: {
        name: "Didelis pajėgumas",
        headline: "Aptiktas didelio pajėgumo profilis",
        leverage: [
          { metric: "Aukštas jėgos potencialas", detail: "Neuroraumeninė sistema pritaikyta didelei mechaninei apkrovai." },
          { metric: "Anabolinis perteklius", detail: "Padidinta kalorijų bazė spartina raumenų hipertrofiją esant apkrovai." },
          { metric: "Didesnis kaulų tankis", detail: "Didesnis kaulų mineralinis tankis ir sąnarių stabilumas didelėms apkrovoms." },
        ],
      },
    },
  },
};

const lv: Base = {
  step: "{n}. solis no {total}",
  back: "Atpakaļ", continue: "Turpināt", getStarted: "Sākt",
  lang: { title: "Izvēlieties valodu", subtitle: "To var mainīt jebkurā laikā iestatījumos." },
  metrics: {
    title: "Nedaudz par jums",
    subtitle: "Mēs to izmantojam, lai pielāgotu uzturu.",
    age: "Vecums", weight: "Svars", height: "Augums", years: "gadi",
  },
  bmi: {
    title: "Sastāva analīze",
    label: "ĶMI",
    analysisComplete: "Ķermeņa sastāva analīze pabeigta.",
    leverageTitle: "Galvenie bioloģiskie sviras punkti",
    enterMetrics: "Ievadiet svaru un augumu, lai veiktu analīzi.",
    finishTitle: "Viss gatavs",
    finishSubtitle: "Jūsu plāns ir gatavs. Ēdīsim veselīgi.",
    tiers: {
      lean_light: {
        name: "Liesais fenotips",
        headline: "Liesā bāzlīnija noteikta",
        leverage: [
          { metric: "Zema mehāniskā slodze", detail: "Mazāka locītavu slodze ļauj lielu treniņu apjomu un ātru atjaunošanos." },
          { metric: "Augsta jutība pret insulīnu", detail: "Efektīva uzturvielu sadale veicina tīru muskuļu pieaugumu." },
          { metric: "Paaugstināta metaboliskā elastība", detail: "Ātra pārslēgšanās starp lipīdu un glikolīzes enerģijas sistēmām." },
        ],
      },
      optimal_balance: {
        name: "Optimāls līdzsvars",
        headline: "Metaboliskā bāzlīnija noteikta",
        leverage: [
          { metric: "Augsta metaboliskā plastika", detail: "Optimāla vide vienlaicīgai lipīdu oksidācijai un muskuļu hipertrofijai." },
          { metric: "Stabila endokrīnā bāze", detail: "Optimāli atjaunošanās logi un konsekvents hormonu sintēzes ceļš." },
          { metric: "Augstākā aerobā efektivitāte", detail: "Optimizēts sirds sitiena tilpums un asinsvadu kapacitāte." },
        ],
      },
      solid_built: {
        name: "Spēka rezerve",
        headline: "Spēka rezerve identificēta",
        leverage: [
          { metric: "Augsts spēka potenciāls", detail: "Neiromuskulārā sistēma pielāgota būtiskai mehāniskai slodzei." },
          { metric: "Anaboliskais pārpalikums", detail: "Paaugstināta kaloriju bāze paātrina muskuļu hipertrofiju zem slodzes." },
          { metric: "Augstāks kaulu blīvums", detail: "Lielāks kaulu minerālblīvums un locītavu stabilitāte maksimālām slodzēm." },
        ],
      },
      focus_zone: {
        name: "Augsta kapacitāte",
        headline: "Konstatēts augstas kapacitātes profils",
        leverage: [
          { metric: "Augsts spēka potenciāls", detail: "Neiromuskulārā sistēma pielāgota būtiskai mehāniskai slodzei." },
          { metric: "Anaboliskais pārpalikums", detail: "Paaugstināta kaloriju bāze paātrina muskuļu hipertrofiju zem slodzes." },
          { metric: "Augstāks kaulu blīvums", detail: "Lielāks kaulu minerālblīvums un locītavu stabilitāte maksimālām slodzēm." },
        ],
      },
    },
  },
};

const pl: Base = {
  step: "Krok {n} z {total}",
  back: "Wstecz", continue: "Dalej", getStarted: "Zaczynamy",
  lang: { title: "Wybierz język", subtitle: "Możesz to zmienić w dowolnym momencie w Ustawieniach." },
  metrics: {
    title: "Kilka informacji o Tobie",
    subtitle: "Używamy ich do personalizacji odżywiania.",
    age: "Wiek", weight: "Waga", height: "Wzrost", years: "lat",
  },
  bmi: {
    title: "Analiza składu",
    label: "BMI",
    analysisComplete: "Analiza składu ciała zakończona.",
    leverageTitle: "Główne dźwignie biologiczne",
    enterMetrics: "Podaj wagę i wzrost, aby wykonać analizę.",
    finishTitle: "Wszystko gotowe",
    finishSubtitle: "Twój plan jest gotowy. Jedzmy zdrowo.",
    tiers: {
      lean_light: {
        name: "Fenotyp szczupły",
        headline: "Ustalono linię bazową masy szczupłej",
        leverage: [
          { metric: "Niskie obciążenie mechaniczne", detail: "Mniejsze obciążenie stawów umożliwia dużą objętość treningu i szybką regenerację." },
          { metric: "Wysoka wrażliwość na insulinę", detail: "Efektywna dystrybucja składników sprzyja czystemu przyrostowi mięśni." },
          { metric: "Podwyższona elastyczność metaboliczna", detail: "Szybkie przełączanie między układami lipidowym i glikolitycznym." },
        ],
      },
      optimal_balance: {
        name: "Optymalna równowaga",
        headline: "Ustalono metaboliczną linię bazową",
        leverage: [
          { metric: "Wysoka plastyczność metaboliczna", detail: "Optymalne środowisko do jednoczesnej oksydacji lipidów i hipertrofii mięśni." },
          { metric: "Stabilna baza endokrynna", detail: "Optymalne okna regeneracji i spójne szlaki syntezy hormonów." },
          { metric: "Szczytowa wydolność tlenowa", detail: "Zoptymalizowana objętość wyrzutowa i wydolność sercowo-naczyniowa." },
        ],
      },
      solid_built: {
        name: "Rezerwa siły",
        headline: "Zidentyfikowano rezerwę siły",
        leverage: [
          { metric: "Wysoki potencjał siły", detail: "Układ nerwowo-mięśniowy przystosowany do znacznego obciążenia." },
          { metric: "Nadwyżka anaboliczna", detail: "Podwyższona baza kaloryczna przyspiesza hipertrofię pod obciążeniem." },
          { metric: "Wyższa gęstość kości", detail: "Większa gęstość mineralna kości i stabilność stawów przy maks. obciążeniu." },
        ],
      },
      focus_zone: {
        name: "Wysoka pojemność",
        headline: "Wykryto profil wysokiej pojemności",
        leverage: [
          { metric: "Wysoki potencjał siły", detail: "Układ nerwowo-mięśniowy przystosowany do znacznego obciążenia." },
          { metric: "Nadwyżka anaboliczna", detail: "Podwyższona baza kaloryczna przyspiesza hipertrofię pod obciążeniem." },
          { metric: "Wyższa gęstość kości", detail: "Większa gęstość mineralna kości i stabilność stawów przy maks. obciążeniu." },
        ],
      },
    },
  },
};

const de: Base = {
  step: "Schritt {n} von {total}",
  back: "Zurück", continue: "Weiter", getStarted: "Loslegen",
  lang: { title: "Wähle deine Sprache", subtitle: "Du kannst dies jederzeit in den Einstellungen ändern." },
  metrics: {
    title: "Ein paar Angaben zu dir",
    subtitle: "Damit personalisieren wir deine Ernährung.",
    age: "Alter", weight: "Gewicht", height: "Größe", years: "Jahre",
  },
  bmi: {
    title: "Zusammensetzungs-Analyse",
    label: "BMI",
    analysisComplete: "Analyse der Körperzusammensetzung abgeschlossen.",
    leverageTitle: "Primäre biologische Hebelpunkte",
    enterMetrics: "Gib Gewicht und Größe ein, um die Analyse zu starten.",
    finishTitle: "Alles bereit",
    finishSubtitle: "Dein Plan ist fertig. Lass uns gut essen.",
    tiers: {
      lean_light: {
        name: "Schlanker Phänotyp",
        headline: "Schlanke Basislinie etabliert",
        leverage: [
          { metric: "Geringe mechanische Last", detail: "Reduzierte Gelenkbelastung ermöglicht hohes Trainingsvolumen und schnelle Regeneration." },
          { metric: "Hohe Insulinsensitivität", detail: "Effiziente Nährstoffverteilung fördert sauberen Muskelaufbau." },
          { metric: "Erhöhte metabolische Flexibilität", detail: "Schnelles Umschalten zwischen Lipid- und glykolytischen Energiesystemen." },
        ],
      },
      optimal_balance: {
        name: "Optimale Balance",
        headline: "Metabolische Basislinie etabliert",
        leverage: [
          { metric: "Hohe metabolische Plastizität", detail: "Optimales Umfeld für gleichzeitige Lipidoxidation und Muskelhypertrophie." },
          { metric: "Stabile endokrine Basis", detail: "Optimale Erholungsfenster und konsistente Hormonsynthese." },
          { metric: "Maximale aerobe Effizienz", detail: "Optimiertes Schlagvolumen und kardiovaskuläre Kapazität." },
        ],
      },
      solid_built: {
        name: "Kraftreserve",
        headline: "Kraftreserve identifiziert",
        leverage: [
          { metric: "Hohes Kraftpotenzial", detail: "Neuromuskuläres System auf erhebliche mechanische Last vorbereitet." },
          { metric: "Anaboler Überschuss", detail: "Erhöhte Kalorienbasis beschleunigt Muskelhypertrophie unter Last." },
          { metric: "Höhere Knochendichte", detail: "Höhere Knochenmineraldichte und Gelenkstabilität für maximale Belastung." },
        ],
      },
      focus_zone: {
        name: "Hohe Kapazität",
        headline: "Hochkapazitäts-Profil erkannt",
        leverage: [
          { metric: "Hohes Kraftpotenzial", detail: "Neuromuskuläres System auf erhebliche mechanische Last vorbereitet." },
          { metric: "Anaboler Überschuss", detail: "Erhöhte Kalorienbasis beschleunigt Muskelhypertrophie unter Last." },
          { metric: "Höhere Knochendichte", detail: "Höhere Knochenmineraldichte und Gelenkstabilität für maximale Belastung." },
        ],
      },
    },
  },
};

const es: Base = {
  step: "Paso {n} de {total}",
  back: "Atrás", continue: "Continuar", getStarted: "Empezar",
  lang: { title: "Elige tu idioma", subtitle: "Puedes cambiarlo cuando quieras en Ajustes." },
  metrics: {
    title: "Unos datos sobre ti",
    subtitle: "Los usamos para personalizar tu nutrición.",
    age: "Edad", weight: "Peso", height: "Altura", years: "años",
  },
  bmi: {
    title: "Análisis de composición",
    label: "IMC",
    analysisComplete: "Análisis de composición corporal completado.",
    leverageTitle: "Puntos de apalancamiento biológico",
    enterMetrics: "Introduce tu peso y altura para ejecutar el análisis.",
    finishTitle: "Todo listo",
    finishSubtitle: "Tu plan está listo. Comamos bien.",
    tiers: {
      lean_light: {
        name: "Fenotipo magro",
        headline: "Línea base magra establecida",
        leverage: [
          { metric: "Baja carga mecánica", detail: "Menor estrés articular permite alto volumen de entrenamiento y recuperación rápida." },
          { metric: "Alta sensibilidad a la insulina", detail: "Partición eficiente de nutrientes para una ganancia muscular limpia." },
          { metric: "Flexibilidad metabólica elevada", detail: "Cambio rápido entre sistemas energéticos lipídico y glucolítico." },
        ],
      },
      optimal_balance: {
        name: "Equilibrio óptimo",
        headline: "Línea base metabólica establecida",
        leverage: [
          { metric: "Alta plasticidad metabólica", detail: "Entorno óptimo para oxidación lipídica e hipertrofia muscular simultáneas." },
          { metric: "Base endocrina estabilizada", detail: "Ventanas de recuperación óptimas y síntesis hormonal consistente." },
          { metric: "Máxima eficiencia aeróbica", detail: "Volumen sistólico y capacidad cardiovascular optimizados." },
        ],
      },
      solid_built: {
        name: "Reserva de fuerza",
        headline: "Reserva de fuerza identificada",
        leverage: [
          { metric: "Alto potencial de fuerza", detail: "Sistema neuromuscular preadaptado a carga mecánica considerable." },
          { metric: "Superávit anabólico", detail: "Base calórica elevada acelera la hipertrofia muscular bajo carga." },
          { metric: "Mayor densidad ósea", detail: "Mayor densidad mineral ósea y estabilidad articular para cargas máximas." },
        ],
      },
      focus_zone: {
        name: "Alta capacidad",
        headline: "Perfil de alta capacidad detectado",
        leverage: [
          { metric: "Alto potencial de fuerza", detail: "Sistema neuromuscular preadaptado a carga mecánica considerable." },
          { metric: "Superávit anabólico", detail: "Base calórica elevada acelera la hipertrofia muscular bajo carga." },
          { metric: "Mayor densidad ósea", detail: "Mayor densidad mineral ósea y estabilidad articular para cargas máximas." },
        ],
      },
    },
  },
};

const fr: Base = {
  step: "Étape {n} sur {total}",
  back: "Retour", continue: "Continuer", getStarted: "Commencer",
  lang: { title: "Choisissez votre langue", subtitle: "Vous pourrez la changer à tout moment dans les Réglages." },
  metrics: {
    title: "Quelques détails sur vous",
    subtitle: "Nous les utilisons pour personnaliser votre nutrition.",
    age: "Âge", weight: "Poids", height: "Taille", years: "ans",
  },
  bmi: {
    title: "Analyse de composition",
    label: "IMC",
    analysisComplete: "Analyse de composition corporelle terminée.",
    leverageTitle: "Points de levier biologiques",
    enterMetrics: "Saisissez votre poids et taille pour lancer l'analyse.",
    finishTitle: "Tout est prêt",
    finishSubtitle: "Votre plan est prêt. Mangeons bien.",
    tiers: {
      lean_light: {
        name: "Phénotype sec",
        headline: "Ligne de base sèche établie",
        leverage: [
          { metric: "Faible charge mécanique", detail: "Stress articulaire réduit permettant un volume élevé et une récupération rapide." },
          { metric: "Sensibilité élevée à l'insuline", detail: "Répartition efficace des nutriments pour un gain musculaire net." },
          { metric: "Flexibilité métabolique élevée", detail: "Bascule rapide entre systèmes énergétiques lipidique et glycolytique." },
        ],
      },
      optimal_balance: {
        name: "Équilibre optimal",
        headline: "Ligne de base métabolique établie",
        leverage: [
          { metric: "Haute plasticité métabolique", detail: "Environnement optimal pour l'oxydation lipidique et l'hypertrophie simultanées." },
          { metric: "Base endocrinienne stabilisée", detail: "Fenêtres de récupération optimales et synthèse hormonale constante." },
          { metric: "Efficacité aérobie maximale", detail: "Volume d'éjection systolique et capacité cardiovasculaire optimisés." },
        ],
      },
      solid_built: {
        name: "Réserve de force",
        headline: "Réserve de force identifiée",
        leverage: [
          { metric: "Fort potentiel de force", detail: "Système neuromusculaire préadapté à une charge mécanique importante." },
          { metric: "Surplus anabolique", detail: "Base calorique élevée accélérant l'hypertrophie sous charge." },
          { metric: "Densité osseuse supérieure", detail: "Densité minérale osseuse et stabilité articulaire accrues pour charges maximales." },
        ],
      },
      focus_zone: {
        name: "Haute capacité",
        headline: "Profil haute capacité détecté",
        leverage: [
          { metric: "Fort potentiel de force", detail: "Système neuromusculaire préadapté à une charge mécanique importante." },
          { metric: "Surplus anabolique", detail: "Base calorique élevée accélérant l'hypertrophie sous charge." },
          { metric: "Densité osseuse supérieure", detail: "Densité minérale osseuse et stabilité articulaire accrues pour charges maximales." },
        ],
      },
    },
  },
};

const ru: Base = {
  step: "Шаг {n} из {total}",
  back: "Назад", continue: "Продолжить", getStarted: "Начать",
  lang: { title: "Выберите язык", subtitle: "Это можно изменить в любой момент в настройках." },
  metrics: {
    title: "Немного о вас",
    subtitle: "Мы используем это для персонализации питания.",
    age: "Возраст", weight: "Вес", height: "Рост", years: "лет",
  },
  bmi: {
    title: "Анализ состава",
    label: "ИМТ",
    analysisComplete: "Анализ состава тела завершён.",
    leverageTitle: "Ключевые биологические точки опоры",
    enterMetrics: "Введите вес и рост, чтобы запустить анализ.",
    finishTitle: "Всё готово",
    finishSubtitle: "Ваш план готов. Питаемся правильно.",
    tiers: {
      lean_light: {
        name: "Сухой фенотип",
        headline: "Сухая базовая линия установлена",
        leverage: [
          { metric: "Низкая механическая нагрузка", detail: "Сниженная нагрузка на суставы допускает большой объём тренинга и быстрое восстановление." },
          { metric: "Высокая чувствительность к инсулину", detail: "Эффективное распределение нутриентов для чистого роста мышц." },
          { metric: "Повышенная метаболическая гибкость", detail: "Быстрое переключение между липидной и гликолитической системами." },
        ],
      },
      optimal_balance: {
        name: "Оптимальный баланс",
        headline: "Метаболическая базовая линия установлена",
        leverage: [
          { metric: "Высокая метаболическая пластичность", detail: "Оптимальная среда для одновременного окисления жиров и гипертрофии." },
          { metric: "Стабильная эндокринная база", detail: "Оптимальные окна восстановления и стабильный синтез гормонов." },
          { metric: "Пиковая аэробная эффективность", detail: "Оптимизированный ударный объём и сердечно-сосудистая ёмкость." },
        ],
      },
      solid_built: {
        name: "Силовой резерв",
        headline: "Силовой резерв определён",
        leverage: [
          { metric: "Высокий силовой потенциал", detail: "Нервно-мышечная система преадаптирована к значительной нагрузке." },
          { metric: "Анаболический профицит", detail: "Повышенная калорийная база ускоряет гипертрофию под нагрузкой." },
          { metric: "Высокая плотность костей", detail: "Повышенная минеральная плотность костей и стабильность суставов." },
        ],
      },
      focus_zone: {
        name: "Высокая ёмкость",
        headline: "Обнаружен профиль высокой ёмкости",
        leverage: [
          { metric: "Высокий силовой потенциал", detail: "Нервно-мышечная система преадаптирована к значительной нагрузке." },
          { metric: "Анаболический профицит", detail: "Повышенная калорийная база ускоряет гипертрофию под нагрузкой." },
          { metric: "Высокая плотность костей", detail: "Повышенная минеральная плотность костей и стабильность суставов." },
        ],
      },
    },
  },
};

// Success-screen telemetry copy, merged into each dictionary below.
const SUCCESS: Record<LocaleCode, Dict["success"]> = {
  en: { booting: ["Analyzing biometrics", "Syncing taste matrix", "Calibrating macro targets"], complete: "Calibration Complete", initialized: "Protocol Initialized", enter: "Enter Dashboard" },
  lt: { booting: ["Analizuojami biometriniai duomenys", "Sinchronizuojama skonio matrica", "Kalibruojami makro tikslai"], complete: "Kalibravimas baigtas", initialized: "Protokolas paleistas", enter: "Atverti skydelį" },
  lv: { booting: ["Analizē biometriskos datus", "Sinhronizē garšas matricu", "Kalibrē makro mērķus"], complete: "Kalibrēšana pabeigta", initialized: "Protokols inicializēts", enter: "Atvērt paneli" },
  pl: { booting: ["Analiza danych biometrycznych", "Synchronizacja matrycy smaku", "Kalibracja celów makro"], complete: "Kalibracja zakończona", initialized: "Protokół zainicjowany", enter: "Otwórz panel" },
  de: { booting: ["Biometrie wird analysiert", "Geschmacksmatrix wird synchronisiert", "Makroziele werden kalibriert"], complete: "Kalibrierung abgeschlossen", initialized: "Protokoll initialisiert", enter: "Dashboard öffnen" },
  es: { booting: ["Analizando biometría", "Sincronizando matriz de sabor", "Calibrando objetivos macro"], complete: "Calibración completada", initialized: "Protocolo inicializado", enter: "Entrar al panel" },
  fr: { booting: ["Analyse de la biométrie", "Synchronisation de la matrice gustative", "Calibrage des objectifs macro"], complete: "Calibrage terminé", initialized: "Protocole initialisé", enter: "Ouvrir le tableau de bord" },
  ru: { booting: ["Анализ биометрии", "Синхронизация матрицы вкуса", "Калибровка макро-целей"], complete: "Калибровка завершена", initialized: "Протокол инициализирован", enter: "Открыть панель" },
};

const BASES: Record<LocaleCode, Base> = { en, lt, lv, pl, de, es, fr, ru };

export const DICTIONARIES = Object.fromEntries(
  (Object.keys(BASES) as LocaleCode[]).map((code) => [
    code,
    { ...BASES[code], success: SUCCESS[code] },
  ]),
) as Record<LocaleCode, Dict>;

/** Interpolate {placeholders} in a string. */
export function t(str: string, vars: Record<string, string | number> = {}): string {
  return str.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
