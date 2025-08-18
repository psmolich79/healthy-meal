export interface PreferenceItem {
  id: string;
  label: string;
  description: string;
  category: "diet" | "cuisine" | "allergy";
  icon: string;
  severity?: "mild" | "moderate" | "severe"; // Only for allergies
  flag?: string; // Only for cuisine
}

export const DIET_PREFERENCES: PreferenceItem[] = [
  {
    id: "vegetarian",
    label: "Wegetariańska",
    description: "Bez mięsa i ryb",
    category: "diet",
    icon: "🥬",
  },
  {
    id: "vegan",
    label: "Wegańska",
    description: "Bez produktów pochodzenia zwierzęcego",
    category: "diet",
    icon: "🌱",
  },
  {
    id: "keto",
    label: "Ketogeniczna",
    description: "Nisko-węglowodanowa, wysokotłuszczowa",
    category: "diet",
    icon: "🥑",
  },
  {
    id: "paleo",
    label: "Paleo",
    description: "Jak nasi przodkowie",
    category: "diet",
    icon: "🥩",
  },
  {
    id: "gluten-free",
    label: "Bezglutenowa",
    description: "Bez glutenu",
    category: "diet",
    icon: "🌾",
  },
  {
    id: "low-carb",
    label: "Nisko-węglowodanowa",
    description: "Ograniczone węglowodany",
    category: "diet",
    icon: "🥒",
  },
  {
    id: "high-protein",
    label: "Wysokobiałkowa",
    description: "Zwiększona zawartość białka",
    category: "diet",
    icon: "💪",
  },
  {
    id: "mediterranean",
    label: "Śródziemnomorska",
    description: "Zdrowe tłuszcze i warzywa",
    category: "diet",
    icon: "🫒",
  },
];

export const CUISINE_PREFERENCES: PreferenceItem[] = [
  {
    id: "polish",
    label: "Polska",
    description: "Tradycyjna kuchnia polska",
    category: "cuisine",
    icon: "🥟",
    flag: "🇵🇱",
  },
  {
    id: "italian",
    label: "Włoska",
    description: "Pizza, pasta, risotto",
    category: "cuisine",
    icon: "🍝",
    flag: "🇮🇹",
  },
  {
    id: "asian",
    label: "Azjatycka",
    description: "Kuchnia azjatycka",
    category: "cuisine",
    icon: "🥢",
    flag: "🌏",
  },
  {
    id: "mexican",
    label: "Meksykańska",
    description: "Ostre i aromatyczne",
    category: "cuisine",
    icon: "🌮",
    flag: "🇲🇽",
  },
  {
    id: "french",
    label: "Francuska",
    description: "Wyrafinowana i elegancka",
    category: "cuisine",
    icon: "🥖",
    flag: "🇫🇷",
  },
  {
    id: "indian",
    label: "Indyjska",
    description: "Bogate przyprawy i curry",
    category: "cuisine",
    icon: "🍛",
    flag: "🇮🇳",
  },
  {
    id: "thai",
    label: "Tajska",
    description: "Równowaga smaków",
    category: "cuisine",
    icon: "🍜",
    flag: "🇹🇭",
  },
  {
    id: "greek",
    label: "Grecka",
    description: "Świeże składniki i oliwa",
    category: "cuisine",
    icon: "🥗",
    flag: "🇬🇷",
  },
  {
    id: "japanese",
    label: "Japońska",
    description: "Sushi, ramen, minimalizm",
    category: "cuisine",
    icon: "🍣",
    flag: "🇯🇵",
  },
  {
    id: "middle-eastern",
    label: "Bliskowschodnia",
    description: "Hummus, falafel, przyprawy",
    category: "cuisine",
    icon: "🧆",
    flag: "🌍",
  },
];

export const ALLERGY_PREFERENCES: PreferenceItem[] = [
  {
    id: "gluten",
    label: "Gluten",
    description: "Pszenica, żyto, jęczmień",
    category: "allergy",
    icon: "🌾",
    severity: "severe",
  },
  {
    id: "lactose",
    label: "Laktoza",
    description: "Produkty mleczne",
    category: "allergy",
    icon: "🥛",
    severity: "moderate",
  },
  {
    id: "nuts",
    label: "Orzechy",
    description: "Wszystkie rodzaje orzechów",
    category: "allergy",
    icon: "🥜",
    severity: "severe",
  },
  {
    id: "shellfish",
    label: "Skorupiaki",
    description: "Krewetki, kraby, homary",
    category: "allergy",
    icon: "🦐",
    severity: "severe",
  },
  {
    id: "eggs",
    label: "Jaja",
    description: "Jaja kurze i inne",
    category: "allergy",
    icon: "🥚",
    severity: "moderate",
  },
  {
    id: "soy",
    label: "Soja",
    description: "Produkty sojowe",
    category: "allergy",
    icon: "🫘",
    severity: "mild",
  },
  {
    id: "fish",
    label: "Ryby",
    description: "Wszystkie rodzaje ryb",
    category: "allergy",
    icon: "🐟",
    severity: "moderate",
  },
  {
    id: "sesame",
    label: "Sezam",
    description: "Nasiona sezamu i tahini",
    category: "allergy",
    icon: "🫴",
    severity: "mild",
  },
];

export const ALL_PREFERENCES = [...DIET_PREFERENCES, ...CUISINE_PREFERENCES, ...ALLERGY_PREFERENCES];

export const getPreferencesByCategory = (category: "diet" | "cuisine" | "allergy") => {
  return ALL_PREFERENCES.filter((pref) => pref.category === category);
};

export const getPreferenceById = (id: string) => {
  return ALL_PREFERENCES.find((pref) => pref.id === id);
};

export const getCategoryLabel = (category: "diet" | "cuisine" | "allergy") => {
  switch (category) {
    case "diet":
      return "Dieta";
    case "cuisine":
      return "Kuchnia";
    case "allergy":
      return "Alergie i ograniczenia";
    default:
      return "Inne";
  }
};

export const getCategoryDescription = (category: "diet" | "cuisine" | "allergy") => {
  switch (category) {
    case "diet":
      return "Wybierz swoje preferencje dietetyczne";
    case "cuisine":
      return "Jakie kuchnie lubisz najbardziej?";
    case "allergy":
      return "Zaznacz składniki, których należy unikać";
    default:
      return "";
  }
};
