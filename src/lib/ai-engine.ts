// LittleBites AI Engine — an on-device expert system for baby food safety & suggestions.
// Pure functions (no DB imports) so APIs and (later) client code can share them.

export type Verdict = "safe" | "caution" | "avoid" | "info";
export type PrefStatus = "liked" | "disliked" | "unsure" | null;

export interface Assessable {
  kind: "food" | "recipe" | "staple";
  key: string; // food:<slug> | recipe:<slug> | staple:<key> | custom:<name>
  name: string;
  slug?: string;
  emoji: string;
  groups: string[];
  ageMin: number;
  ageText: string;
  isAllergen: boolean;
  allergenName: string;
  allergensText: string;
  chokingRisk: string;
  isIronRich: boolean;
  isFirstFood: boolean;
  description: string;
  prep69: string;
  prep912: string;
  prep12: string;
  nutrition: string;
  href: string;
  country?: string;
  cuisine?: string;
  isAdapted?: boolean;
  adaptedNote?: string;
}

// Family meat policy: beef & pork are NEVER suggested in recipes, combos, or picks.
export const EXCLUDED_MEAT_KEYS = new Set(["food:beef", "food:pork"]);

export function isExcluded(item: { key: string }): boolean {
  return EXCLUDED_MEAT_KEYS.has(item.key);
}

export interface TriedEntry {
  key: string;
  name: string;
  emoji: string;
  groups: string[];
  isAllergen: boolean;
  allergenName: string;
  isIronRich: boolean;
  status: PrefStatus;
  exposures: number;
  logCount: number;
  hasReaction: boolean;
  symptoms: string;
  textures: string[];
  notes: string;
  firstTried: string | null;
  lastTried: string | null;
  loved: boolean;
  favorite: boolean;
  kind: "food" | "recipe" | "custom";
  slug?: string;
  href: string;
}

export interface AllergenState {
  name: string;
  emoji: string;
  status: string;
  exposures: number;
}

export interface BabyCtx {
  name: string;
  ageMonths: number | null;
}

export interface AiLink {
  label: string;
  href: string;
}

export interface AiAnswer {
  verdict: Verdict;
  title: string;
  summary: string;
  bullets: string[];
  prep?: string;
  texture?: string;
  allergenNote?: string | null;
  triedNote?: string | null;
  doctorBox: "none" | "mild" | "urgent";
  suggestions: string[];
  links: AiLink[];
  followUps: string[];
  matchedKey?: string | null;
}

export interface Pick {
  key: string;
  kind: string;
  name: string;
  emoji: string;
  reason: string;
  href: string;
  ageText: string;
  country?: string;
  cuisine?: string;
}

export const COUNTRY_FLAGS: Record<string, string> = {
  India: "🇮🇳",
  Italy: "🇮🇹",
  France: "🇫🇷",
  Spain: "🇪🇸",
  Greece: "🇬🇷",
  "United Kingdom": "🇬🇧",
  Germany: "🇩🇪",
  Sweden: "🇸🇪",
  "United States": "🇺🇸",
  Mexico: "🇲🇽",
  Brazil: "🇧🇷",
  Peru: "🇵🇪",
  Argentina: "🇦🇷",
  Morocco: "🇲🇦",
  Egypt: "🇪🇬",
  Nigeria: "🇳🇬",
  Ethiopia: "🇪🇹",
  "Türkiye": "🇹🇷",
  Lebanon: "🇱🇧",
  Israel: "🇮🇱",
  China: "🇨🇳",
  Japan: "🇯🇵",
  "South Korea": "🇰🇷",
  Thailand: "🇹🇭",
  Vietnam: "🇻🇳",
  Indonesia: "🇮🇩",
  Philippines: "🇵🇭",
};

// keyword -> country for cuisine questions ("italian food?", "mexican recipes?")
export const CUISINE_KEYWORDS: { match: RegExp; country: string }[] = [
  { match: /\bitalian\b|\bitaly\b|\bpasta\b|\brisotto\b/, country: "Italy" },
  { match: /\bfrench\b|\bfrance\b|\bratatouille\b/, country: "France" },
  { match: /\bspanish\b|\bspain\b|\bpaella\b|\btortilla\b/, country: "Spain" },
  { match: /\bgreek\b|\bgreece\b|\bavgolemono\b|\bfakes\b/, country: "Greece" },
  { match: /\bbritish\b|\buk\b|\bengland\b|\bshepherd.?s pie\b/, country: "United Kingdom" },
  { match: /\bgerman\b|\bgermany\b|\bfrikadellen\b/, country: "Germany" },
  { match: /\bswedish\b|\bsweden\b|\bkottbullar\b/, country: "Sweden" },
  { match: /\bamerican\b|\busa\b|\bunited states\b/, country: "United States" },
  { match: /\bmexican\b|\bmexico\b|\bquesadilla\b|\btaco\b|\bburrito\b/, country: "Mexico" },
  { match: /\bbrazilian\b|\bbrazil\b|\bfeijao\b|\bfeijoada\b/, country: "Brazil" },
  { match: /\bperuvian\b|\bperu\b/, country: "Peru" },
  { match: /\bargentin\b|\bempanada\b/, country: "Argentina" },
  { match: /\bmoroccan\b|\bmorocco\b|\btagine\b|\bcouscous\b/, country: "Morocco" },
  { match: /\begyptian\b|\begypt\b|\bkoshari\b|\bkushari\b/, country: "Egypt" },
  { match: /\bnigerian\b|\bnigeria\b|\bjollof\b|\bmoi moi\b/, country: "Nigeria" },
  { match: /\bethiopian\b|\bethiopia\b|\bmisir\b|\binjera\b/, country: "Ethiopia" },
  { match: /\bturkish\b|\bturkiye\b|\bturkey\b.*\bfood\b|\bmercimek\b|\bkebab\b|\bshish\b/, country: "Türkiye" },
  { match: /\blebanese\b|\blebanon\b|\bmujadara\b|\bhummus\b/, country: "Lebanon" },
  { match: /\bisraeli\b|\bisrael\b|\bshakshuka\b/, country: "Israel" },
  { match: /\bchinese\b|\bchina\b|\bcongee\b|\bwonton\b|\bdim sum\b/, country: "China" },
  { match: /\bjapanese\b|\bjapan\b|\bokayu\b|\btsukune\b|\bmiso\b|\bsushi\b/, country: "Japan" },
  { match: /\bkorean\b|\bkorea\b|\bdakjuk\b|\bbibimbap\b|\bkimbap\b/, country: "South Korea" },
  { match: /\bthai\b|\bthailand\b|\btom kha\b|\btom yum\b|\bpad thai\b/, country: "Thailand" },
  { match: /\bvietnamese\b|\bvietnam\b|\bpho\b/, country: "Vietnam" },
  { match: /\bindonesian\b|\bindonesia\b|\bbubur\b|\brendang\b|\bnasi\b/, country: "Indonesia" },
  { match: /\bfilipino\b|\bphilippines\b|\barroz caldo\b|\blugaw\b|\badobo\b/, country: "Philippines" },
];

export const DISCLAIMER =
  "LittleBites AI gives general food information, not medical advice. For rashes, swelling, breathing trouble, vomiting, or any worrying symptom, contact your pediatrician or emergency services right away.";

export const GROUPS = [
  "Fruits",
  "Vegetables",
  "Grains",
  "Millets",
  "Legumes",
  "Dairy",
  "Eggs",
  "Meat",
  "Fish/Seafood",
  "Nuts & Seeds",
  "Spices & Fats",
  "Common Allergens",
  "Indian",
] as const;

export const INDIAN_FOOD_SLUGS = new Set([
  "ragi",
  "toor-dal",
  "moong-dal",
  "paneer",
  "ghee",
  "jaggery",
  "rice",
  "lentils",
]);

const FISH_SLUGS = new Set(["salmon", "white-fish-cod", "sardines", "tuna", "shrimp"]);

export function norm(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s/-]/g, "").replace(/\s+/g, " ");
}

// ---------------- group mapping ----------------
export function groupsForFood(food: {
  slug: string;
  category: string;
  isAllergen: boolean;
}): string[] {
  const g = new Set<string>();
  const c = food.category;
  if (c === "Fruits") g.add("Fruits");
  else if (c === "Vegetables") g.add("Vegetables");
  else if (c === "Grains") g.add("Grains");
  else if (c === "Millets") g.add("Millets");
  else if (c === "Beans & Legumes") g.add("Legumes");
  else if (c === "Dairy & Eggs") g.add(food.slug === "egg" ? "Eggs" : "Dairy");
  else if (c === "Proteins") {
    if (FISH_SLUGS.has(food.slug)) g.add("Fish/Seafood");
    else if (food.slug === "tofu") g.add("Legumes");
    else g.add("Meat");
  } else if (c === "Nuts & Seeds") g.add("Nuts & Seeds");
  else if (c === "Flavor & Fats") {
    if (food.slug === "butter") g.add("Dairy");
    else g.add("Spices & Fats");
  }
  if (food.isAllergen) g.add("Common Allergens");
  if (INDIAN_FOOD_SLUGS.has(food.slug)) g.add("Indian");
  if (g.size === 0) g.add("Spices & Fats");
  return [...g];
}

export function groupsForRecipe(recipe: { foodGroup: string; allergens: string; country?: string }): string[] {
  const g = new Set<string>(recipe.country && recipe.country !== "India" ? [] : ["Indian"]);
  const map: Record<string, string> = {
    Fruits: "Fruits",
    Vegetables: "Vegetables",
    Grains: "Grains",
    Millets: "Millets",
    Legumes: "Legumes",
    Dairy: "Dairy",
    Eggs: "Eggs",
    Meat: "Meat",
    "Fish/Seafood": "Fish/Seafood",
  };
  g.add(map[recipe.foodGroup] ?? "Spices & Fats");
  if (recipe.allergens && recipe.allergens.trim() && !/^none/i.test(recipe.allergens.trim()))
    g.add("Common Allergens");
  return [...g];
}

// ---------------- staples knowledge (foods not in DB) ----------------
interface Staple {
  key: string;
  names: string[];
  emoji: string;
  ageMin: number;
  ageText: string;
  allergens: string;
  choking: string;
  blurb: string;
  prep: string;
  avoidReason?: string;
  cautionNote?: string;
}

const STAPLES: Staple[] = [
  { key: "honey", names: ["honey"], emoji: "🍯", ageMin: 12, ageText: "12 months+", allergens: "", choking: "High (botulism risk)", blurb: "Honey can contain botulism spores that babies under 12 months cannot fight — this includes honey in baked goods, breads, and cough syrups.", prep: "No honey in any form before the first birthday. After 12 months, small amounts in foods and warm drinks are fine.", avoidReason: "Risk of infant botulism, which can be life-threatening. Waiting until 12 months is non-negotiable." },
  { key: "salt", names: ["salt"], emoji: "🧂", ageMin: 12, ageText: "12 months+ (tiny amounts)", allergens: "", choking: "Low", blurb: "Babies under 12 months need virtually no added salt — their kidneys can't handle much, and salty foods displace nutritious ones.", prep: "Cook baby's portion without salt; season the family pot afterwards. After 12 months, keep total salt low and avoid salty snacks, chips, and processed foods.", avoidReason: "Added salt before 12 months strains tiny kidneys. Flavor with herbs, spices, lemon, and garlic instead.", cautionNote: "Even after 12 months, keep added salt minimal — under 2g/day for 1–3 year olds." },
  { key: "sugar", names: ["sugar", "jaggery powder"], emoji: "🍬", ageMin: 12, ageText: "12 months+", allergens: "", choking: "Low", blurb: "Added sugar (white sugar, jaggery, brown sugar) offers no nutrition and shapes sweet preferences. Fruit is the ideal sweetener under 12 months.", prep: "Sweeten porridge and yogurt with mashed banana, mango, or dates (12m+). After 12 months, keep sweets occasional and portions small.", avoidReason: "No added sugar is recommended before 12 months. Jaggery counts as added sugar too." },
  { key: "juice", names: ["juice", "fruit juice", "orange juice", "apple juice"], emoji: "🧃", ageMin: 12, ageText: "12 months+ (limited)", allergens: "", choking: "Low", blurb: "Juice is essentially sugar water without fiber — whole fruit is always better. No juice is needed at all before 12 months.", prep: "Offer whole fruit and water instead. After 12 months, limit 100% juice to 4oz/day max, served in a cup with meals.", avoidReason: "Juice displaces milk and nutritious foods and harms emerging teeth." },
  { key: "tea", names: ["tea", "chai", "coffee", "filter coffee", "kaapi"], emoji: "🍵", ageMin: 24, ageText: "Avoid under 2 years", allergens: "Dairy (if milk added)", choking: "Low", blurb: "Tea and coffee block iron absorption and contain caffeine — both harmful for babies and toddlers.", prep: "Offer water and milk instead. Even milky chai is not suitable for under-2s.", avoidReason: "Caffeine affects sleep and behavior, and tannins block iron absorption — a double hit for growing babies." },
  { key: "water", names: ["water"], emoji: "💧", ageMin: 6, ageText: "6 months+ (small sips)", allergens: "", choking: "Low", blurb: "Small sips of water with meals from 6 months help with constipation and cup skills. Breastmilk/formula remains the main drink until 12 months.", prep: "Offer 2–4oz/day in an open or straw cup with meals. Use safe boiled-cooled water where needed.", avoidReason: "Water before 6 months can fill the tiny tummy and displace milk feeds." },
  { key: "popcorn", names: ["popcorn"], emoji: "🍿", ageMin: 48, ageText: "4 years+", allergens: "", choking: "High", blurb: "Popcorn is a top choking hazard — light, irregular kernels are easily inhaled.", prep: "No popcorn before age 4, even puffed 'baby' styles can be risky. Try roasted makhana (fox nuts) in ghee as an Indian alternative for toddlers — still supervise closely.", avoidReason: "Shape and texture make popcorn one of the most dangerous choking hazards for under-4s." },
  { key: "whole-nuts", names: ["whole nuts", "peanuts", "almonds", "cashews", "walnuts", "pistachios", "pista", "badam", "hazelnuts"], emoji: "🥜", ageMin: 48, ageText: "4 years+ (whole); nut butters from 6 months", allergens: "Peanut / Tree Nuts", choking: "High", blurb: "Whole nuts are exactly airway-sized and a leading choking hazard — but nut butters (thinned) are encouraged from 6 months for allergy prevention.", prep: "Serve peanuts/almonds/cashews ONLY as thinned butters or finely ground powder stirred into porridge until age 4+. Never whole, never by the spoonful.", avoidReason: "Whole nuts can completely block a small airway. The safe form (thinned butter) has the same allergy-prevention benefit." },
  { key: "chocolate", names: ["chocolate", "chocolates", "cocoa", "bournvita", "horlicks"], emoji: "🍫", ageMin: 12, ageText: "12 months+ (tiny tastes)", allergens: "Dairy (usually)", choking: "Low", blurb: "Chocolate means added sugar plus a little caffeine — fine as a rare taste after 12 months, not an everyday food.", prep: "Keep to tiny tastes after the first birthday. Malted drink powders are high in sugar — skip them for babies.", cautionNote: "Even after 12 months, keep chocolate rare and minimal — it displaces nutritious foods." },
  { key: "ice-cream", names: ["ice cream", "icecream", "kulfi"], emoji: "🍨", ageMin: 12, ageText: "12 months+ (occasional)", allergens: "Dairy", choking: "Low", blurb: "High in sugar with little nutrition — an occasional treat after 12 months, not a dairy serving.", prep: "Offer frozen fruit (mango, banana nice-cream) instead for babies — same joy, real nutrition.", cautionNote: "Kulfi and ice cream are fine for rare celebrations after 12 months; frozen fruit is the everyday alternative." },
  { key: "biscuits", names: ["biscuits", "cookies", "rusk", "marie", "parle", "crackers"], emoji: "🍪", ageMin: 12, ageText: "12 months+ (low-sugar only)", allergens: "Wheat, Dairy (usually)", choking: "Low", blurb: "Most biscuits are sugar + refined flour + palm oil — including 'babyốn' marketed rusk. Teething biscuits marketed for babies are the exception.", prep: "Skip commercial biscuits under 12 months. After, choose the lowest-sugar option and keep portions small.", avoidReason: "High sugar and salt with virtually no nutrition; they also teach a preference for ultra-processed snacks." },
  { key: "chips", names: ["chips", "crisps", "crispy snacks", "kurkure", "lays"], emoji: "🥔", ageMin: 24, ageText: "Avoid under 2 years", allergens: "", choking: "Moderate", blurb: "Salty, crunchy, and easy to inhale — chips are unsuitable for babies and best avoided for young toddlers.", prep: "Offer soft homemade alternatives: baked sweet potato wedges, banana chips (thin, supervised, 12m+), or roasted makhana.", avoidReason: "Too salty for little kidneys, sharp when crunched, and a choking risk." },
  { key: "soda", names: ["soda", "cola", "soft drink", "cold drink", "fizzy"], emoji: "🥤", ageMin: 60, ageText: "Avoid under 5 years", allergens: "", choking: "Low", blurb: "Soda is sugar + caffeine + acid — harmful for teeth, bones, and appetite. Never suitable for babies.", prep: "Water, milk, coconut water (small amounts), and fresh fruit are the only drinks babies need.", avoidReason: "No safe amount for babies — sugar, caffeine, and acidity with zero nutrition." },
  { key: "okra", names: ["okra", "bhindi", "bhendi", "vendakkai"], emoji: "🫛", ageMin: 6, ageText: "6 months+", allergens: "", choking: "Low", blurb: "Soft-cooked okra is safe and nutritious — the sliminess actually makes it easy to swallow. A great iron-and-folate vegetable.", prep: "Steam or simmer whole/small okra until very soft; chop finely or mash. Light sauté in oil with turmeric for older babies.", },
  { key: "bottle-gourd", names: ["bottle gourd", "lauki", "dudhi", "sorakkai", "calabash"], emoji: "🥒", ageMin: 6, ageText: "6 months+", allergens: "", choking: "Low", blurb: "Mild, hydrating, and easy to digest — bottle gourd practically melts when cooked. A staple baby vegetable across India.", prep: "Peel, deseed, and cook until very soft; mash into dal, khichdi, or kootu. Taste raw bitterness first — discard bitter gourd (toxic).", cautionNote: "Always taste a tiny raw piece: extremely bitter bottle gourd is toxic and must be discarded." },
  { key: "drumstick", names: ["drumstick", "moringa", "murungakkai", "sahjan"], emoji: "🥢", ageMin: 8, ageText: "8 months+", allergens: "", choking: "Moderate", blurb: "Drumstick flesh is nutritious but fibrous — babies suck the pulp and spit the fiber. Moringa leaves (keerai) are a nutritional superstar.", prep: "Cook drumstick pieces very soft in sambar; let baby gnaw and suck under close supervision, discarding fibers. Better: cook moringa leaves into dal.", cautionNote: "Fibrous strands must be spat out, not swallowed — supervise closely and remove pieces once the pulp is gone." },
  { key: "coconut-water", names: ["coconut water", "tender coconut", "elaneer", "nariyal pani"], emoji: "🥥", ageMin: 6, ageText: "6 months+ (small sips)", allergens: "Coconut", choking: "Low", blurb: "Fresh coconut water is hydrating and fine in small amounts — but it is not a milk replacement and shouldn't displace feeds.", prep: "Offer a few spoonfuls with meals on hot days. The soft malai (flesh) can be scraped and served from 8+ months.", cautionNote: "Keep to small servings — too much can cause loose stools and displace milk." },
  { key: "buttermilk", names: ["buttermilk", "neer mor", "chaas", "moru"], emoji: "🥛", ageMin: 12, ageText: "12 months+ as a drink", allergens: "Dairy", choking: "Low", blurb: "Thin salted buttermilk is a drink, and drinks other than milk/water wait until 12 months. Plain curd in foods is fine from 6 months.", prep: "Under 12 months, serve nutrition as curd/yogurt in meals instead. After 12 months, offer plain unsalted neer mor.", avoidReason: "As a drink it displaces milk feeds; curd in food form gives the same probiotics safely from 6 months." },
  { key: "turmeric", names: ["turmeric", "haldi", "manjal"], emoji: "🫚", ageMin: 6, ageText: "6 months+ (tiny pinches)", allergens: "", choking: "Low", blurb: "A pinch of turmeric in dal and vegetables is perfectly safe and adds gentle anti-inflammatory compounds.", prep: "Use tiny pinches in cooking — a little color and flavor, never medicinal doses. Pair with black pepper + fat for absorption.", },
  { key: "cumin", names: ["cumin", "jeera", "jeeragam"], emoji: "🌱", ageMin: 6, ageText: "6 months+", allergens: "", choking: "Low", blurb: "Cumin (whole or ground) in tadka is one of the best first spices — aromatic, digestion-friendly, and mild.", prep: "Temper whole cumin in ghee for dals, or add ground cumin directly to porridge, khichdi, and vegetables.", },
  { key: "mustard-seeds", names: ["mustard seeds", "rai", "kadugu"], emoji: "🫘", ageMin: 6, ageText: "6 months+ (in tadka)", allergens: "", choking: "Low", blurb: "Mustard seeds popped in oil for tadka are safe — the tiny seeds pass harmlessly. They add authentic South Indian flavor.", prep: "Splutter in hot oil until they pop, then add other tadka ingredients. Strain out if you prefer for young babies.", },
  { key: "curry-leaves", names: ["curry leaves", "curry leaf", "kadi patta", "karuveppilai"], emoji: "🌿", ageMin: 6, ageText: "6 months+ (flavor only)", allergens: "", choking: "Low", blurb: "Tempering with curry leaves adds aroma and trace nutrients — just remove the leaves before serving to babies.", prep: "Add a leaf or two to hot oil for dals and poriyal; fish them out before serving. Crispy fried leaves (finely crushed) are ok for toddlers.", },
  { key: "hing", names: ["hing", "asafoetida", "perungayam"], emoji: "🧄", ageMin: 6, ageText: "6 months+ (tiny pinch)", allergens: "", choking: "Low", blurb: "A tiny pinch of hing in dal traditionally reduces gas — safe in normal cooking amounts.", prep: "Add a tiny pinch to hot ghee for dals, sambar, and rasam. A little goes a long way.", },
  { key: "cardamom", names: ["cardamom", "elaichi", "elachi"], emoji: "🫛", ageMin: 6, ageText: "6 months+", allergens: "", choking: "Low", blurb: "Fragrant and gentle — cardamom makes porridge, kheer-style foods, and fruit delicious without sugar.", prep: "Use a tiny pinch of ground cardamom in ragi porridge, mango yogurt, and banana mash.", },
  { key: "milk-feeds", names: ["breastmilk", "breast milk", "formula", "breastfeed"], emoji: "🍼", ageMin: 0, ageText: "Birth+", allergens: "", choking: "Low", blurb: "Breastmilk or formula remains baby's main nutrition until 12 months — solids complement, never replace, milk feeds in year one.", prep: "Until ~8–9 months, offer milk before solids. From 9+ months, offer solids first, then milk. Aim to wean bottles by 12–18 months.", },
];

// aliases: query term -> "food:<slug>" | "recipe:<slug>" | "staple:<key>"
const ALIASES: Record<string, string> = {
  curd: "food:yogurt",
  dahi: "food:yogurt",
  yoghurt: "food:yogurt",
  curds: "food:yogurt",
  nachni: "food:ragi",
  mandua: "food:ragi",
  arhar: "food:toor-dal",
  "split pigeon": "food:toor-dal",
  "green moong": "food:moong-dal",
  mung: "food:moong-dal",
  moong: "food:moong-dal",
  dal: "food:moong-dal",
  dhal: "food:moong-dal",
  paruppu: "food:toor-dal",
  "egg curry": "recipe:baby-egg-curry",
  "chicken curry": "recipe:mild-baby-chicken-curry",
  "curd rice": "recipe:curd-rice",
  thayir: "recipe:curd-rice",
  chana: "food:chickpeas",
  "chick pea": "food:chickpeas",
  kabuli: "food:chickpeas",
  rajma: "food:black-beans",
  "kidney beans": "food:black-beans",
  masoor: "food:lentils",
  "red lentil": "food:lentils",
  urad: "food:lentils",
  "black gram": "food:lentils",
  idli: "recipe:soft-plain-idli",
  idly: "recipe:soft-plain-idli",
  dosa: "recipe:plain-soft-dosa",
  dosai: "recipe:plain-soft-dosa",
  sambar: "recipe:mild-baby-sambar",
  sambhar: "recipe:mild-baby-sambar",
  rasam: "recipe:baby-tomato-rasam",
  charu: "recipe:baby-tomato-rasam",
  khichdi: "recipe:vegetable-khichdi",
  kichdi: "recipe:vegetable-khichdi",
  pongal: "recipe:ven-pongal",
  kanji: "recipe:soft-rice-kanji",
  congee: "recipe:soft-rice-kanji",
  pesarattu: "recipe:pesarattu",
  avial: "recipe:coconut-avial",
  kootu: "recipe:vegetable-kootu",
  koot: "recipe:vegetable-kootu",
  poriyal: "recipe:carrot-beans-poriyal",
  erissery: "recipe:pumpkin-erissery",
  keerai: "recipe:keerai-masiyal",
  masiyal: "recipe:keerai-masiyal",
  bhurji: "recipe:soft-egg-bhurji",
  paniyaram: "recipe:banana-paniyaram",
  appam: "recipe:banana-paniyaram",
  roti: "recipe:jowar-roti-dal",
  chapati: "recipe:jowar-roti-dal",
  chapathi: "recipe:jowar-roti-dal",
  phulka: "recipe:jowar-roti-dal",
  jowar: "recipe:jowar-roti-dal",
  bajra: "recipe:bajra-khichdi",
  "foxtail millet": "recipe:foxtail-millet-khichdi",
  korra: "recipe:foxtail-millet-khichdi",
  thinai: "recipe:foxtail-millet-khichdi",
  poha: "food:rice",
  aval: "food:rice",
  bhel: "food:rice",
  wheat: "food:bread",
  atta: "food:bread",
  maida: "food:pasta",
  rava: "food:pasta",
  sooji: "food:pasta",
  semolina: "food:pasta",
  oats: "food:oatmeal",
  mutton: "food:lamb",
  goat: "food:lamb",
  prawns: "food:shrimp",
  prawn: "food:shrimp",
  jhinga: "food:shrimp",
  fish: "food:salmon",
  meen: "food:salmon",
  egg: "food:egg",
  mutta: "food:egg",
  anda: "food:egg",
  chicken: "food:chicken",
  kozhi: "food:chicken",
  milk: "food:whole-milk-drink",
  paal: "food:whole-milk-drink",
  doodh: "food:whole-milk-drink",
  banana: "food:banana",
  vazhapazham: "food:banana",
  mango: "food:mango",
  maampazham: "food:mango",
  papaya: "food:mango",
  coconut: "food:coconut",
  thengai: "food:coconut",
  potato: "food:sweet-potato",
  aloo: "food:sweet-potato",
  urulai: "food:sweet-potato",
  tomato: "food:tomato",
  thakkali: "food:tomato",
  onion: "food:garlic",
  garlic: "food:garlic",
  poondu: "food:garlic",
  ginger: "food:garlic",
  inji: "food:garlic",
  spinach: "food:spinach",
  palak: "food:spinach",
  carrot: "food:carrot",
  beans: "food:green-beans",
  peas: "food:peas",
  pattani: "food:peas",
  corn: "food:corn",
  makka: "food:corn",
  honey: "staple:honey",
  salt: "staple:salt",
  sugar: "staple:sugar",
  juice: "staple:juice",
  chai: "staple:tea",
  coffee: "staple:tea",
  kaapi: "staple:tea",
  popcorn: "staple:popcorn",
  chocolate: "staple:chocolate",
  bournvita: "staple:chocolate",
  horlicks: "staple:chocolate",
  biscuits: "staple:biscuits",
  rusk: "staple:biscuits",
  marie: "staple:biscuits",
  chips: "staple:chips",
  kurkure: "staple:chips",
  cola: "staple:soda",
  soda: "staple:soda",
  bhindi: "staple:okra",
  okra: "staple:okra",
  lauki: "staple:bottle-gourd",
  dudhi: "staple:bottle-gourd",
  drumstick: "staple:drumstick",
  murungai: "staple:drumstick",
  "coconut water": "staple:coconut-water",
  elaneer: "staple:coconut-water",
  chaas: "staple:buttermilk",
  "neer mor": "staple:buttermilk",
  moru: "staple:buttermilk",
  haldi: "staple:turmeric",
  turmeric: "staple:turmeric",
  // ---- global dishes ----
  risotto: "recipe:italy-pea-pumpkin-risotto",
  ratatouille: "recipe:france-ratatouille-mash",
  blanquette: "recipe:france-chicken-blanquette",
  tortilla: "recipe:spain-tortilla-patatas",
  paella: "recipe:spain-chicken-paella-rice",
  fakes: "recipe:greece-fakes-lentil-soup",
  avgolemono: "recipe:greece-chicken-avgolemono",
  "shepherds pie": "recipe:uk-turkey-shepherds-pie",
  "shepherd pie": "recipe:uk-turkey-shepherds-pie",
  quesadilla: "recipe:mexico-chicken-quesadilla",
  "salmon cakes": "recipe:usa-salmon-cakes",
  "salmon patties": "recipe:usa-salmon-cakes",
  meatballs: "recipe:usa-turkey-meatballs",
  feijao: "recipe:brazil-feijao-rice",
  "black bean stew": "recipe:brazil-feijao-rice",
  "quinoa stew": "recipe:peru-chicken-quinoa-stew",
  empanada: "recipe:argentina-chicken-empanada",
  tagine: "recipe:morocco-chicken-tagine",
  couscous: "recipe:morocco-veggie-couscous",
  koshari: "recipe:egypt-koshari-bowl",
  kushari: "recipe:egypt-koshari-bowl",
  jollof: "recipe:nigeria-jollof-rice",
  "moi moi": "recipe:nigeria-moi-moi",
  "moin moin": "recipe:nigeria-moi-moi",
  misir: "recipe:ethiopia-misir-wot",
  mercimek: "recipe:turkey-mercimek-soup",
  "lentil soup": "recipe:turkey-mercimek-soup",
  shish: "recipe:turkey-chicken-shish",
  kebab: "recipe:turkey-chicken-shish",
  kebob: "recipe:turkey-chicken-shish",
  mujadara: "recipe:lebanon-mujadara",
  shakshuka: "recipe:israel-mild-shakshuka",
  shakshouka: "recipe:israel-mild-shakshuka",
  okayu: "recipe:japan-salmon-okayu",
  tsukune: "recipe:japan-chicken-tsukune",
  dakjuk: "recipe:korea-dakjuk-porridge",
  juk: "recipe:korea-dakjuk-porridge",
  "egg custard": "recipe:china-steamed-egg",
  chawanmushi: "recipe:china-steamed-egg",
  "tom kha": "recipe:thailand-coconut-chicken-soup",
  "coconut soup": "recipe:thailand-coconut-chicken-soup",
  pho: "recipe:vietnam-chicken-pho",
  "bubur ayam": "recipe:indonesia-bubur-ayam",
  bubur: "recipe:indonesia-bubur-ayam",
  "arroz caldo": "recipe:philippines-arroz-caldo",
  lugaw: "recipe:philippines-arroz-caldo",
  frikadellen: "recipe:germany-chicken-frikadellen",
  kottbullar: "recipe:sweden-turkey-kottbullar",
  "swedish meatballs": "recipe:sweden-turkey-kottbullar",
  injera: "recipe:ethiopia-misir-wot",
  hummus: "recipe:lebanon-hummus-pita",
  pita: "recipe:lebanon-hummus-pita",
  jeera: "staple:cumin",
  cumin: "staple:cumin",
  rai: "staple:mustard-seeds",
  kadugu: "staple:mustard-seeds",
  hing: "staple:hing",
  elaichi: "staple:cardamom",
  cardamom: "staple:cardamom",
  badam: "staple:whole-nuts",
  pista: "staple:whole-nuts",
  peanuts: "staple:whole-nuts",
  almonds: "staple:whole-nuts",
  cashews: "staple:whole-nuts",
  walnuts: "staple:whole-nuts",
  "peanut butter": "food:peanut-butter",
  "almond butter": "food:almond-butter",
  water: "staple:water",
  breastmilk: "staple:milk-feeds",
  formula: "staple:milk-feeds",
};

export function stapleToAssessable(s: Staple): Assessable {
  return {
    kind: "staple",
    key: `staple:${s.key}`,
    name: s.names[0].replace(/^\w/, (c) => c.toUpperCase()),
    emoji: s.emoji,
    groups: ["Spices & Fats"],
    ageMin: s.ageMin,
    ageText: s.ageText,
    isAllergen: s.allergens.length > 0,
    allergenName: "",
    allergensText: s.allergens,
    chokingRisk: s.choking,
    isIronRich: false,
    isFirstFood: false,
    description: s.blurb,
    prep69: s.prep,
    prep912: s.prep,
    prep12: s.prep,
    nutrition: s.blurb,
    href: "/guides/starting-solids-101",
  };
}

function esc(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function findMatch(
  question: string,
  catalog: Assessable[]
): Assessable | null {
  const q = norm(question);
  // combined candidate pool: catalog names (+parenthetical-stripped), aliases, staples — longest term wins
  const cands: { term: string; item: Assessable }[] = [];
  const push = (term: string, item: Assessable) => {
    if (term.length >= 3) cands.push({ term, item });
  };
  for (const c of catalog) {
    const n = norm(c.name);
    push(n, c);
    const stripped = norm(n.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim());
    if (stripped && stripped !== n) push(stripped, c);
  }
  for (const [term, ref] of Object.entries(ALIASES)) {
    const found = catalog.find((c) => c.key === ref);
    if (found) push(term, found);
    else {
      const st = STAPLES.find((s) => `staple:${s.key}` === ref);
      if (st) push(term, stapleToAssessable(st));
    }
  }
  for (const s of STAPLES) for (const nm of s.names) push(nm, stapleToAssessable(s));
  cands.sort((a, b) => b.term.length - a.term.length);
  for (const { term, item } of cands) {
    if (new RegExp(`\\b${esc(term)}\\b`).test(q)) return item;
  }
  // fallback: distinctive long single words from catalog names
  const sorted = [...catalog].sort((a, b) => b.name.length - a.name.length);
  for (const item of sorted) {
    for (const w of norm(item.name).split(" ")) {
      if (w.length >= 6 && new RegExp(`\\b${esc(w)}\\b`).test(q)) return item;
    }
  }
  return null;
}

export function textureForAge(item: Assessable, age: number | null): string {
  if (age === null) return item.prep69;
  if (age < 9) return item.prep69;
  if (age < 12) return item.prep912;
  return item.prep12;
}

// ---------------- assessment ----------------
export interface Assessment {
  verdict: Verdict;
  reasons: string[];
  prep: string;
  texture: string;
  allergenNote: string | null;
  triedNote: string | null;
}

export function assess(
  item: Assessable,
  baby: BabyCtx,
  tried: TriedEntry | null,
  allergenStates: AllergenState[]
): Assessment {
  const reasons: string[] = [];
  const age = baby.ageMonths;
  let verdict: Verdict = "safe";
  let allergenNote: string | null = null;
  let triedNote: string | null = null;
  const prep = item.kind === "staple" ? item.prep69 : textureForAge(item, age);
  const texture = item.kind === "staple" ? item.prep69 : textureForAge(item, age);

  const staple = item.kind === "staple" ? STAPLES.find((s) => `staple:${s.key}` === item.key) : undefined;

  // baby not started solids
  if (age !== null && age < 6) {
    return {
      verdict: "avoid",
      reasons: [
        `${baby.name} is under 6 months, so no solids, tastes, or sips yet (other than breastmilk/formula).`,
        "Wait for all readiness signs: sitting upright, good head control, reaching for food, and fading tongue-thrust.",
        "Early allergen introduction (4–6 months) applies only to high-risk babies on pediatrician advice — ask your doctor.",
      ],
      prep: "Keep offering breastmilk or formula on demand. Use this time to take an infant CPR/choking class!",
      texture: "Milk only for now.",
      allergenNote: null,
      triedNote: null,
    };
  }

  // age gate
  if (age !== null && age < item.ageMin) {
    if (staple?.avoidReason) reasons.push(staple.avoidReason);
    else reasons.push(`Recommended from ${item.ageText} — ${baby.name} isn't there yet.`);
    if (item.key === "food:honey" || staple?.key === "honey")
      reasons.push("Honey (even baked into foods) can cause infant botulism before 12 months. This rule has no exceptions.");
    if (item.key === "food:whole-milk-drink")
      reasons.push("Cow's milk as a DRINK waits until 12 months — but yogurt, cheese, and milk cooked into foods are encouraged from 6 months.");
    return { verdict: "avoid", reasons, prep, texture, allergenNote, triedNote };
  }

  // tried before?
  if (tried) {
    if (tried.hasReaction) {
      const serious = /breath|swell|wheez|vomit|hive|anaphy|rash/i.test(tried.symptoms);
      triedNote = `${baby.name} tried ${tried.name} ${tried.exposures}x${tried.symptoms ? ` — noted symptoms: ${tried.symptoms}` : " with a reaction logged"}.`;
      reasons.push(
        serious
          ? `A reaction was recorded. Do NOT re-offer until your pediatrician (ideally an allergist) advises — bring your logged notes.`
          : `A mild concern was logged. Pause this food and check with your pediatrician before offering it again.`
      );
      return { verdict: serious ? "avoid" : "caution", reasons, prep, texture, allergenNote, triedNote };
    }
    if (tried.status === "disliked") {
      triedNote = `${baby.name} has tried ${tried.name} ${tried.exposures}x and wasn't a fan yet.`;
      reasons.push("Safe to offer again — it takes most babies 10–20 exposures to accept a new food.");
      reasons.push("Tip: wait a few days, then serve a tiny portion alongside a favorite food, with zero pressure.");
      verdict = "safe";
    } else if (tried.status === "unsure") {
      triedNote = `${baby.name} has tried ${tried.name} ${tried.exposures}x — verdict still out.`;
      reasons.push("Safe to keep offering. Try a different texture or pairing (e.g., with a liked food) next time.");
      verdict = "safe";
    } else {
      triedNote = `${baby.name} has tried ${tried.name} ${tried.exposures}x and likes it! 🎉`;
      reasons.push("A proven winner — keep it in rotation and try pairing it with one new food for variety.");
      verdict = "safe";
    }
  }

  // allergen logic
  const allergenNames = item.isAllergen
    ? item.allergenName || item.allergensText
    : item.allergensText && !/^none/i.test(item.allergensText)
      ? item.allergensText
      : "";
  if (allergenNames && !tried) {
    const primary = item.allergenName || allergenNames.split(",")[0].trim();
    const state = allergenStates.find(
      (a) => a.name.toLowerCase() === primary.toLowerCase() || allergenNames.toLowerCase().includes(a.name.toLowerCase())
    );
    const introduced = state && (state.status === "Introduced" || state.status === "Trying");
    if (!introduced) {
      verdict = "caution";
      allergenNote = `Contains ${allergenNames} — a top-9 allergen ${baby.name} hasn't been introduced to yet.`;
      reasons.push("First-time allergen: serve a tiny amount in the MORNING when baby is healthy, then watch for 2 hours.");
      reasons.push("Start with ¼ tsp mixed into a familiar food; if no reaction in 10 minutes, serve a small normal portion.");
      reasons.push("Keep serving 2–3x per week afterwards to maintain tolerance — track it in the Diary.");
    } else {
      allergenNote = `Contains ${allergenNames} (${state?.status}, ${state?.exposures} exposures logged). Keep serving 2–3x weekly.`;
    }
  } else if (allergenNames && tried) {
    allergenNote = `Contains ${allergenNames}.`;
  }

  // choking logic
  const ch = item.chokingRisk.toLowerCase();
  if (item.key.startsWith("staple:whole-nuts") || item.key.startsWith("staple:popcorn")) {
    // handled by age gate (48mo); if here, age is 4+
    reasons.push("Age-appropriate now — still supervise every bite.");
  } else if (ch.startsWith("high")) {
    if (verdict === "safe") verdict = "caution";
    reasons.push(`High choking risk in its raw/whole form — preparation below makes it safe. Always supervise upright eating.`);
  } else if (ch.startsWith("moderate")) {
    if (verdict === "safe") verdict = "caution";
    reasons.push("Needs specific cutting (lengthwise, not coins) — follow the prep steps exactly.");
  }

  // staple caution notes
  if (staple?.cautionNote && verdict === "safe") {
    verdict = "caution";
    reasons.push(staple.cautionNote);
  }

  // positive nudges
  if (verdict === "safe" && !tried) {
    if (item.isFirstFood) reasons.push("⭐ An excellent first food — gentle, nutritious, and easy to prepare.");
    if (item.isIronRich) reasons.push("💪 Iron-rich pick! Pair with a vitamin C food (tomato, orange, mango) to triple iron absorption.");
    if (item.groups.includes("Indian")) reasons.push("🇮🇳 Great Indian choice — familiar family flavors help babies accept meals faster.");
  }
  if (age === null) reasons.push("Tip: add " + baby.name + "'s birthdate in the Kids tab for age-precise guidance.");
  if (reasons.length === 0) {
    reasons.push(`Age-appropriate from ${item.ageText} — good to go.`);
    if (item.nutrition) {
      const n = item.nutrition.length > 150 ? item.nutrition.slice(0, 150).trimEnd() + "…" : item.nutrition;
      reasons.push(n);
    }
  }

  return { verdict, reasons, prep, texture, allergenNote, triedNote };
}

// ---------------- scoring for suggestions ----------------
function scoreUntried(
  item: Assessable,
  baby: BabyCtx,
  tried: TriedEntry[]
): number {
  let s = 0;
  if (item.isFirstFood) s += 5;
  if (item.isIronRich) s += 4;
  if (item.isAllergen) s += 3; // early introduction matters
  const likedGroups = new Set(tried.filter((t) => t.status === "liked").flatMap((t) => t.groups));
  for (const g of item.groups) if (likedGroups.has(g)) s += 1;
  // prefer items near baby's age (not far-future foods)
  if (baby.ageMonths !== null) {
    const gap = Math.max(0, item.ageMin - baby.ageMonths);
    s -= gap * 2;
    if (item.ageMin <= baby.ageMonths) s += 2;
  }
  // deprioritize staples that are "avoid-style" treats
  if (item.kind === "staple") s -= 6;
  return s;
}

export function toPick(item: Assessable, reason: string): Pick {
  return {
    key: item.key,
    kind: item.kind,
    name: item.name,
    emoji: item.emoji,
    reason,
    href: item.href,
    ageText: item.ageText,
    country: item.country,
    cuisine: item.cuisine,
  };
}

export interface SuggestionBuckets {
  tryNext: Pick[];
  newIndian: Pick[];
  worldCuisines: { country: string; cuisine: string; flag: string; picks: Pick[] }[];
  similarToLiked: Pick[];
  unexplored: { group: string; picks: Pick[] }[];
  ironRich: Pick[];
  allergensPending: { allergen: string; emoji: string; howTo: string; href: string }[];
  recipeIdeas: { recipe: Pick; coverage: string; missing: string[] }[];
  combos: { title: string; detail: string; href?: string }[];
}

const ALLERGEN_VEHICLES: Record<string, { emoji: string; howTo: string; href: string }> = {
  Peanut: { emoji: "🥜", howTo: "2 tsp peanut butter thinned with water, stirred into oatmeal", href: "/foods/peanut-butter" },
  Egg: { emoji: "🥚", howTo: "Hard-boiled egg mashed with avocado", href: "/foods/egg" },
  Dairy: { emoji: "🧀", howTo: "Plain whole-milk yogurt or curd rice", href: "/foods/yogurt" },
  Wheat: { emoji: "🍞", howTo: "Very soft pasta or toast strip", href: "/foods/pasta" },
  Soy: { emoji: "🫘", howTo: "Soft baked tofu strips", href: "/foods/tofu" },
  Fish: { emoji: "🐟", howTo: "Baked salmon, flaked (check bones)", href: "/foods/salmon" },
  Shellfish: { emoji: "🍤", howTo: "Shrimp minced very fine into congee", href: "/foods/shrimp" },
  Sesame: { emoji: "🥣", howTo: "Tahini thinned with water into oatmeal", href: "/foods/tahini" },
  "Tree Nuts": { emoji: "🌰", howTo: "Almond/cashew butter thinned until drippy", href: "/foods/almond-butter" },
};

export function buildSuggestions(
  baby: BabyCtx,
  tried: TriedEntry[],
  catalog: Assessable[],
  allergenStates: AllergenState[],
  recipes: Assessable[]
): SuggestionBuckets {
  const triedKeys = new Set(tried.map((t) => t.key));
  const triedNames = new Set(tried.map((t) => norm(t.name)));
  const ageOk = (a: Assessable) => baby.ageMonths === null || a.ageMin <= (baby.ageMonths ?? 99);
  const untried = catalog.filter(
    (c) => !triedKeys.has(c.key) && !triedNames.has(norm(c.name)) && !isExcluded(c)
  );

  const tryNext = untried
    .filter(ageOk)
    .map((c) => ({ c, s: scoreUntried(c, baby, tried) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map(({ c }) =>
      toPick(
        c,
        c.isFirstFood
          ? "Perfect first food"
          : c.isIronRich
            ? "Iron-rich + age-perfect"
            : c.isAllergen
              ? "Introduce this allergen early"
              : `Age-appropriate from ${c.ageText}`
      )
    );

  const newIndian = untried
    .filter((c) => ageOk(c) && c.groups.includes("Indian"))
    .sort((a, b) => (b.isFirstFood ? 1 : 0) - (a.isFirstFood ? 1 : 0) || a.ageMin - b.ageMin)
    .slice(0, 6)
    .map((c) => toPick(c, c.isFirstFood ? "First food ⭐" : `From ${c.ageText}`));

  const liked = tried.filter((t) => t.status === "liked");
  const likedGroups = new Set(liked.flatMap((t) => t.groups));
  const similarToLiked = untried
    .filter((c) => ageOk(c) && c.kind !== "staple" && c.groups.some((g) => likedGroups.has(g)))
    .map((c) => ({ c, s: scoreUntried(c, baby, tried) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 6)
    .map(({ c }) => {
      const shared = c.groups.find((g) => likedGroups.has(g));
      return toPick(c, `More ${shared} — a liked category`);
    });

  // unexplored groups (food groups only)
  const foodGroups = GROUPS.filter((g) => g !== "Common Allergens" && g !== "Indian");
  const triedGroups = new Set(tried.flatMap((t) => t.groups));
  const unexplored: SuggestionBuckets["unexplored"] = [];
  for (const g of foodGroups) {
    if (triedGroups.has(g)) continue;
    const picks = untried
      .filter((c) => ageOk(c) && c.kind !== "staple" && c.groups.includes(g))
      .map((c) => ({ c, s: scoreUntried(c, baby, tried) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map(({ c }) => toPick(c, `Easy first ${g.toLowerCase()}`));
    if (picks.length > 0) unexplored.push({ group: g, picks });
  }

  const ironRich = untried
    .filter((c) => ageOk(c) && c.isIronRich && c.kind !== "staple")
    .sort((a, b) => a.ageMin - b.ageMin)
    .slice(0, 6)
    .map((c) => toPick(c, "Iron-rich 💪"));

  const allergensPending = allergenStates
    .filter((a) => a.status !== "Introduced")
    .map((a) => ({
      allergen: a.name,
      emoji: ALLERGEN_VEHICLES[a.name]?.emoji ?? "⚠️",
      howTo: ALLERGEN_VEHICLES[a.name]?.howTo ?? "See allergen guide",
      href: ALLERGEN_VEHICLES[a.name]?.href ?? "/guides/introducing-allergens",
    }));

  // recipe ideas from tried ingredients: need base slug coverage — approximate via tried names vs recipe handled server-side;
  // here: recipes whose name-words overlap tried ingredients get boosted (server passes coverage separately if available)
  const recipeIdeas: SuggestionBuckets["recipeIdeas"] = [];

  const combos = buildCombos(tried);

  // world cuisines: best age-appropriate untried recipe per country (skip countries fully tried)
  const worldCuisines: SuggestionBuckets["worldCuisines"] = [];
  const countries = [...new Set(untried.filter((c) => c.kind === "recipe" && c.country).map((c) => c.country as string))];
  for (const country of countries) {
    if (country === "India") continue; // covered by newIndian
    const picks = untried
      .filter((c) => c.kind === "recipe" && c.country === country && ageOk(c))
      .map((c) => ({ c, s: scoreUntried(c, baby, tried) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, 2)
      .map(({ c }) => toPick(c, c.isFirstFood ? "First food ⭐" : `From ${c.ageText}`));
    if (picks.length > 0) {
      const cuisine = untried.find((c) => c.country === country)?.cuisine ?? country;
      worldCuisines.push({ country, cuisine, flag: COUNTRY_FLAGS[country] ?? "🌍", picks });
    }
  }
  // prioritize cuisines with first foods / lowest age
  worldCuisines.sort((a, b) => {
    const aMin = Math.min(...untried.filter((c) => c.country === a.country).map((c) => c.ageMin));
    const bMin = Math.min(...untried.filter((c) => c.country === b.country).map((c) => c.ageMin));
    return aMin - bMin;
  });

  return { tryNext, newIndian, worldCuisines, similarToLiked, unexplored, ironRich, allergensPending, recipeIdeas, combos };
}

export function buildCombos(tried: TriedEntry[]): SuggestionBuckets["combos"] {
  const has = (sub: string) => tried.some((t) => norm(t.name).includes(sub) || t.key.includes(sub));
  const combos: SuggestionBuckets["combos"] = [];
  const push = (title: string, detail: string, href?: string) => {
    if (combos.length < 6) combos.push({ title, detail, href });
  };
  if (has("rice") && (has("dal") || norm("lentils") && has("lentil") || has("toor") || has("moong"))) {
    // dal-rice already covered below more specifically
  }
  if ((has("rice")) && (has("toor") || has("moong") || has("lentil"))) {
    push("Dal-Rice Mash 🍚", "Mash soft rice with dal + ghee — India's classic complete-protein baby meal.", "/recipes/toor-dal-mash");
  }
  if (has("rice") && (has("yogurt") || has("curd"))) {
    push("Curd Rice 🍚", "Fold mashed rice through curd with a cumin-ghee tadka. Cooling + probiotic.", "/recipes/curd-rice");
  }
  if ((has("yogurt") || has("curd")) && (has("mango") || has("banana") || has("strawberr"))) {
    push("Fruit Yogurt Bowl 🥭", "Swirl mashed fruit into curd with cardamom — dessert-level nutrition.", "/recipes/mango-yogurt");
  }
  if (has("egg") && (has("tomato") || has("spinach"))) {
    push("Veggie Egg Bhurji 🍳", "Soft-scramble egg with minced tomato/spinach + turmeric.", "/recipes/soft-egg-bhurji");
  }
  if (has("chicken") && has("rice")) {
    push("Chicken Rice Mash 🍗", "Shred slow-cooked chicken into rice with its gravy + a veggie.", "/recipes/mild-baby-chicken-curry");
  }
  if (has("paneer") && has("spinach")) {
    push("Palak Paneer (mild) 🧀", "You have both stars — simmer paneer into spinach puree.", "/recipes/mild-palak-paneer");
  }
  if (has("ragi") && has("banana")) {
    push("Ragi Banana Porridge 🥣", "Stir mashed banana into ragi koozh — calcium + iron + potassium.", "/recipes/ragi-porridge");
  }
  if ((has("moong") || has("lentil") || has("toor")) && has("tomato")) {
    push("Dal-Tomato Soup 🍲", "Tomato's vitamin C triples dal's iron absorption. Simmer together soft.", "/recipes/moong-dal-soup");
  }
  if (has("oatmeal") && (has("peanut") || has("almond") || has("cashew"))) {
    push("Nut-Butter Oatmeal 🥣", "Stir thinned nut butter + fruit into iron-fortified oatmeal.", "/foods/oatmeal");
  }
  if (has("sweet potato") && (has("lentil") || has("moong"))) {
    push("Sweet Potato Dal Mash 🍠", "Mash roasted sweet potato into dal — vitamin A + iron in one bowl.", "/recipes/vegetable-khichdi");
  }
  if (has("avocado") && has("egg")) {
    push("Egg-Avocado Mash 🥑", "Mash hard-boiled egg with avocado + lemon — choline meets healthy fats.", "/foods/egg");
  }
  if (has("salmon") && has("rice")) {
    push("Salmon Rice Cakes 🐟", "Flake salmon into rice with egg, pan-fry soft patties.", "/foods/salmon");
  }
  if (has("pasta") && (has("tomato") || has("cheese") || has("yogurt"))) {
    push("Creamy Tomato Pasta 🍝", "Toss very soft pasta through mashed tomato + mascarpone or yogurt.", "/recipes/italy-tomato-mascarpone-pasta");
  }
  if (has("chickpeas") && has("tahini")) {
    push("Creamy Hummus 🫘", "Blend chickpeas silky with tahini + olive oil; spread thin on soft pita.", "/recipes/lebanon-hummus-pita");
  }
  if ((has("turkey") || has("chicken")) && (has("zucchini") || has("carrot"))) {
    push("Juicy Veggie Meatballs 🧆", "Mix minced poultry with grated veg + egg; bake soft mini balls.", "/recipes/usa-turkey-meatballs");
  }
  if (has("rice") && has("chicken") && (has("carrot") || has("peas"))) {
    push("Golden Chicken Rice 🥘", "Simmer rice with chicken, sweet veg + turmeric paella-style.", "/recipes/spain-chicken-paella-rice");
  }
  if (has("lentils") && (has("rice") || has("carrot"))) {
    push("Lentil Soup Night 🍲", "Simmer red lentils with carrot into silky mercimek-style soup.", "/recipes/turkey-mercimek-soup");
  }
  return combos;
}

// ---------------- dashboard ----------------
export interface Dashboard {
  totalCatalog: number;
  triedCount: number;
  liked: TriedEntry[];
  disliked: TriedEntry[];
  unsure: TriedEntry[];
  favorites: TriedEntry[];
  multiTry: TriedEntry[];
  reactions: TriedEntry[];
  notTriedCount: number;
  notTriedTop: Pick[];
  groups: { group: string; tried: number; total: number; liked: number }[];
}

export function buildDashboard(
  tried: TriedEntry[],
  catalog: Assessable[],
  baby: BabyCtx
): Dashboard {
  const triedKeys = new Set(tried.map((t) => t.key));
  const liked = tried.filter((t) => t.status === "liked");
  const disliked = tried.filter((t) => t.status === "disliked");
  const unsure = tried.filter((t) => t.status === "unsure" || t.status === null);
  const favorites = tried.filter((t) => t.favorite);
  const multiTry = tried.filter((t) => t.exposures >= 3).sort((a, b) => b.exposures - a.exposures);
  const reactions = tried.filter((t) => t.hasReaction);
  const notTried = catalog.filter((c) => c.kind !== "staple" && !triedKeys.has(c.key) && !isExcluded(c));
  const notTriedTop = notTried
    .filter((c) => baby.ageMonths === null || c.ageMin <= (baby.ageMonths ?? 99) + 2)
    .map((c) => ({ c, s: scoreUntried(c, baby, tried) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 8)
    .map(({ c }) => toPick(c, c.ageMin <= (baby.ageMonths ?? 99) ? "Ready to try" : `From ${c.ageText}`));

  const groups = GROUPS.map((g) => {
    const total = catalog.filter((c) => c.kind !== "staple" && c.groups.includes(g)).length;
    const t = tried.filter((x) => x.groups.includes(g));
    return { group: g, tried: t.length, total, liked: t.filter((x) => x.status === "liked").length };
  });

  return {
    totalCatalog: catalog.filter((c) => c.kind !== "staple").length,
    triedCount: tried.length,
    liked,
    disliked,
    unsure,
    favorites,
    multiTry,
    reactions,
    notTriedCount: notTried.length,
    notTriedTop,
    groups,
  };
}

// ---------------- insights / patterns ----------------
export function buildInsights(
  baby: BabyCtx,
  tried: TriedEntry[],
  catalog: Assessable[],
  allergenStates: AllergenState[]
): string[] {
  const out: string[] = [];
  if (tried.length === 0) {
    return [
      `No foods logged for ${baby.name} yet — log the first taste in the Diary to unlock personalized patterns here! 🌱`,
      "Great first foods: iron-fortified oatmeal, banana, avocado, sweet potato, moong dal soup, and ragi porridge.",
    ];
  }
  const liked = tried.filter((t) => t.status === "liked");
  const inGroup = (g: string) => tried.filter((t) => t.groups.includes(g));
  const likedIn = (g: string) => liked.filter((t) => t.groups.includes(g));

  // sweet fruits preference
  const fruits = inGroup("Fruits");
  const likedFruits = likedIn("Fruits");
  if (fruits.length >= 3 && likedFruits.length / fruits.length >= 0.6) {
    const untried = catalog.find(
      (c) => c.kind === "food" && c.groups.includes("Fruits") && !tried.some((t) => t.key === c.key) && (baby.ageMonths === null || c.ageMin <= baby.ageMonths)
    );
    out.push(
      `🍓 ${baby.name} seems to prefer sweet fruits (${likedFruits.length}/${fruits.length} liked!) — keep the momentum with ${untried ? untried.name.toLowerCase() + " next" : "new colors of fruit"}.`
    );
  }
  // veg vs iron gap
  const veg = inGroup("Vegetables").length;
  const ironTried = tried.filter((t) => t.isIronRich).length;
  if (veg >= 4 && ironTried < 2) {
    out.push(`🥬 ${baby.name} has tried ${veg} vegetables but only ${ironTried} iron-rich food${ironTried === 1 ? "" : "s"} — iron is the #1 priority nutrient after 6 months. Try lentils, egg, or soft shredded turkey next.`);
  } else if (ironTried >= 3) {
    out.push(`💪 Excellent iron coverage — ${ironTried} iron-rich foods tried! Keep pairing them with vitamin C foods (tomato, mango, orange).`);
  }
  // allergen gap
  const pending = allergenStates.filter((a) => a.status !== "Introduced");
  if (pending.length >= 7) {
    out.push(`🥜 No allergens introduced yet — early introduction (around 6 months) can greatly reduce allergy risk. Peanut and egg are great ones to start with.`);
  } else if (pending.length > 0 && pending.length <= 3) {
    out.push(`🛡️ Almost there — just ${pending.map((p) => p.name).join(", ")} left to introduce. Remember to re-serve each allergen 2–3x weekly.`);
  } else if (pending.length === 0) {
    out.push(`🎉 All 9 allergens introduced! Keep each in rotation 2–3x per week to maintain tolerance.`);
  }
  // indian coverage
  const indian = inGroup("Indian");
  if (indian.length === 0) {
    out.push(`🇮🇳 No Indian foods tried yet — idli, dal-rice, and ragi porridge are gentle, perfect starters from the Recipes tab.`);
  } else if (indian.length >= 5) {
    out.push(`🇮🇳 Wonderful — ${indian.length} Indian foods in the mix! Family flavors help babies accept meals faster.`);
  }
  // unexplored major groups
  for (const g of ["Fish/Seafood", "Meat", "Eggs", "Nuts & Seeds", "Legumes"]) {
    if (inGroup(g).length === 0) {
      const pick = catalog.find(
        (c) => c.kind !== "staple" && c.groups.includes(g) && !tried.some((t) => t.key === c.key) && (baby.ageMonths === null || c.ageMin <= baby.ageMonths)
      );
      if (pick) {
        out.push(`🐟 No ${g.toLowerCase()} tried yet — ${pick.name} (${pick.ageText}) would be a great first.`);
        break;
      }
    }
  }
  // retry reminders
  const disliked = tried.filter((t) => t.status === "disliked" && t.exposures < 3 && !t.hasReaction);
  if (disliked.length > 0) {
    out.push(`🔁 ${disliked[0].name} was refused after ${disliked[0].exposures} tr${disliked[0].exposures === 1 ? "y" : "ies"} — totally normal! Wait a few days and offer a tiny portion alongside a favorite.`);
  }
  // reactions
  const reactions = tried.filter((t) => t.hasReaction);
  if (reactions.length > 0) {
    out.push(`⚠️ ${reactions.map((r) => r.name).join(", ")} caused a concern — avoid re-offering until your pediatrician advises.`);
  }
  // variety pace
  if (tried.length >= 10) {
    out.push(`💯 ${tried.length} foods tried — fantastic variety! Every new taste, spice, and texture builds a more adventurous eater.`);
  }
  // texture note
  const textures = new Set(tried.flatMap((t) => t.textures.map((x) => x.toLowerCase())));
  if (tried.length >= 5 && textures.size <= 1) {
    out.push(`🥄 Log the textures you serve (puree, mashed, finger food) — progressing textures on time prevents later pickiness.`);
  }
  return out.slice(0, 8);
}

// ---------------- Q&A ----------------
const EMERGENCY_RE = /chok|cant breathe|can't breathe|not breathing|turning blue|blue lips|unconscious|limp|swelling|swollen|anaphy|wheez|throat clos|emergency/i;
const REACTION_RE = /rash|hive|vomit|puke|diarrhea|diarrhoea|blood in|mucus|eczema|reaction|allergic|swell|itch|tummy ache|stomach/i;

export interface QaContext {
  baby: BabyCtx;
  tried: TriedEntry[];
  catalog: Assessable[];
  allergenStates: AllergenState[];
  suggestions: SuggestionBuckets;
}

export function answerQuestion(question: string, ctx: QaContext, lastKey?: string | null): AiAnswer {
  const q = norm(question);
  const { baby, tried, catalog, allergenStates, suggestions } = ctx;
  const ageStr = baby.ageMonths === null ? "age not set" : `${baby.ageMonths} months old`;

  const base = {
    doctorBox: "none" as const,
    suggestions: [] as string[],
    links: [] as AiLink[],
    followUps: [] as string[],
  };

  // 0) emergency
  if (EMERGENCY_RE.test(question)) {
    return {
      ...base,
      verdict: "caution",
      title: "🚨 This needs immediate medical attention",
      summary: `If ${baby.name} is choking, struggling to breathe, has facial swelling, widespread hives, repeated vomiting, or has gone limp — call your local emergency number NOW. If you are trained, begin infant choking first aid (5 back blows + 5 chest thrusts, alternating) while help is on the way.`,
      bullets: [
        "Choking is SILENT — gagging is loud. Silence + panic + blue lips = emergency.",
        "Don't sweep the mouth blindly with fingers — you can push objects deeper.",
        "Even if the object clears, get checked by a doctor the same day.",
        "Afterwards, log exactly what happened in the Diary so you can discuss it with your pediatrician.",
      ],
      doctorBox: "urgent",
      links: [{ label: "Gagging vs Choking guide", href: "/guides/gagging-vs-choking" }],
      followUps: ["What are the top choking hazards?", "How do I cut grapes safely?"],
    };
  }

  // 1) reaction / symptom question
  if (REACTION_RE.test(question) && !/which|what food/i.test(question)) {
    return {
      ...base,
      verdict: "caution",
      title: "🤒 About reactions & symptoms",
      summary: `I can't diagnose ${baby.name} — but here's how to think about it: contact redness right around the mouth from acidic foods (tomato, berries, citrus) that fades within an hour is usually just irritation. Hives elsewhere, vomiting, diarrhea, swelling, or breathing changes are concerning.`,
      bullets: [
        "STOP the suspected food and note exactly what was eaten, how much, and when symptoms started.",
        "Take a photo of any rash — it helps the doctor enormously.",
        "Mild (few hives, one vomit): call your pediatrician the same day.",
        "Serious (breathing trouble, face/lip swelling, widespread hives, repeated vomiting, limpness): emergency services immediately.",
        "Log the symptoms in the Diary → Tracker so nothing is forgotten.",
      ],
      doctorBox: "mild",
      links: [
        { label: "Introducing allergens guide", href: "/guides/introducing-allergens" },
        { label: "Open Food Tracker", href: "/diary?tab=tracker" },
      ],
      followUps: ["Which allergens are left to introduce?", "What should we avoid right now?"],
    };
  }

  // 2) specific food?
  let matched: Assessable | null = findMatch(question, catalog);
  if (!matched && lastKey && /\b(it|that|this|prepare|cook|serve|texture|give)\b/i.test(question)) {
    matched = catalog.find((c) => c.key === lastKey) ?? null;
  }
  if (matched) {
    const triedEntry = tried.find((t) => t.key === matched!.key) ?? tried.find((t) => norm(t.name) === norm(matched!.name)) ?? null;
    const a = assess(matched, baby, triedEntry, allergenStates);
    const verdictWord = a.verdict === "safe" ? "✅ Yes" : a.verdict === "caution" ? "⚠️ With care" : a.verdict === "avoid" ? "❌ Not yet" : "ℹ️ Info";
    const bullets = [...a.reasons];
    if (matched.kind === "recipe") {
      if (matched.country && matched.country !== "India")
        bullets.unshift(`${COUNTRY_FLAGS[matched.country] ?? "🌍"} From ${matched.country} (${matched.cuisine ?? "world"} cuisine) — adapted to be baby-safe.`);
      if (matched.isAdapted && matched.adaptedNote) bullets.push(`🔄 ${matched.adaptedNote}`);
    }
    const links: AiLink[] = [];
    if (matched.kind !== "staple") links.push({ label: `Open ${matched.name} guide`, href: matched.href });
    if (matched.isAllergen || (matched.allergensText && !/^none/i.test(matched.allergensText)))
      links.push({ label: "Allergen introduction guide", href: "/guides/introducing-allergens" });
    if (matched.chokingRisk.toLowerCase().startsWith("high") || matched.chokingRisk.toLowerCase().startsWith("moderate"))
      links.push({ label: "Choking hazards guide", href: "/guides/choking-hazards-guide" });
    return {
      ...base,
      verdict: a.verdict,
      title: `${verdictWord} — ${matched.name} ${matched.emoji}`,
      summary: matched.description,
      bullets,
      prep: a.prep,
      texture: baby.ageMonths !== null && baby.ageMonths >= 6 ? `Texture for ${ageStr}: ${a.texture}` : a.texture,
      allergenNote: a.allergenNote,
      triedNote: a.triedNote,
      doctorBox: triedEntry?.hasReaction ? "mild" : "none",
      suggestions: [],
      links,
      followUps: [
        "What should we try next?",
        `What Indian foods go well with ${matched.name.toLowerCase()}?`,
        "What should we avoid right now?",
      ],
      matchedKey: matched.key,
    };
  }

  // 3) avoid list
  if (/\bavoid|unsafe|danger|shouldn|should not|can't eat|cannot eat|not allowed|never give\b/.test(q)) {
    const age = baby.ageMonths ?? 8;
    const items: string[] = [];
    if (age < 12) items.push("🍯 Honey in ANY form (botulism risk) — including baked goods");
    if (age < 48) items.push("🥜 Whole nuts, 🍿 popcorn — top choking hazards (thinned nut butters ARE encouraged)");
    items.push("🍇 Whole grapes & cherry tomatoes — always quarter lengthwise");
    if (age < 12) items.push("🥛 Cow's milk AS A DRINK (yogurt/cheese/cooked milk are fine from 6 months)");
    if (age < 12) items.push("🧂 Added salt & 🍬 added sugar/jaggery — flavor with spices, herbs, fruit instead");
    items.push("🧃 Juice, 🍵 tea/coffee, 🥤 soda — never needed for babies");
    items.push("🐟 High-mercury fish (shark, swordfish, king mackerel); raw/undercooked egg, meat & fish");
    items.push("🥛 Unpasteurized (raw) milk, cheese & juices");
    const reacted = tried.filter((t) => t.hasReaction);
    if (reacted.length > 0) items.push(`⚠️ Personal avoids: ${reacted.map((r) => r.name).join(", ")} caused concerns — confirm with your pediatrician`);
    return {
      ...base,
      verdict: "info",
      title: `🚫 Foods to avoid for ${baby.name} (${ageStr})`,
      summary: "Personalized avoid-list based on current safety guidelines and your logged history:",
      bullets: items,
      doctorBox: "none",
      links: [
        { label: "Choking hazards guide", href: "/guides/choking-hazards-guide" },
        { label: "Starting solids 101", href: "/guides/starting-solids-101" },
      ],
      followUps: ["Can my baby eat honey?", "What should we try next?", "Which allergens are left?"],
    };
  }

  // 4) allergens status
  if (/allergen|allergy|peanut|toleran/.test(q)) {
    const pending = allergenStates.filter((a) => a.status !== "Introduced");
    const done = allergenStates.filter((a) => a.status === "Introduced");
    const bullets = [
      done.length > 0 ? `✅ Introduced: ${done.map((a) => a.name).join(", ")} — keep serving each 2–3x weekly.` : "No allergens marked Introduced yet.",
      ...pending.slice(0, 4).map((a) => {
        const v = ALLERGEN_VEHICLES[a.name];
        return `⬜ ${a.name} (${a.status}) — try: ${v?.howTo ?? "see guide"}.`;
      }),
      "Introduce new allergens in the morning when baby is healthy; start tiny, watch 2 hours.",
    ];
    return {
      ...base,
      verdict: "info",
      title: `🛡️ Allergen plan for ${baby.name}`,
      summary: `Early, regular allergen exposure can dramatically cut allergy risk. Status: ${done.length}/9 introduced.`,
      bullets,
      doctorBox: "none",
      links: [
        { label: "Full allergen guide", href: "/guides/introducing-allergens" },
        { label: "Open allergen tracker", href: "/diary?tab=allergens" },
      ],
      followUps: ["Can my baby eat peanut butter?", "Can my baby eat egg?", "What should we try next?"],
    };
  }

  // 5) iron
  if (/iron/.test(q)) {
    return {
      ...base,
      verdict: "info",
      title: "💪 Iron plan — the #1 priority nutrient",
      summary: `Babies need ~11mg iron/day from 7–12 months. Best absorbed: heme iron (meat, fish, egg yolk). Plant iron triples in absorption with vitamin C in the same meal.`,
      bullets: [
        ...suggestions.ironRich.slice(0, 4).map((p) => `${p.emoji} ${p.name} (${p.ageText}) — ${p.reason}`),
        "Power pairings: dal + tomato, oatmeal + strawberries, turkey + broccoli, egg + mango.",
        "Avoid >16oz cow's milk/day after 12 months — excess milk is the top cause of toddler iron deficiency.",
      ],
      doctorBox: "none",
      links: [
        { label: "Iron for babies guide", href: "/guides/iron-for-babies" },
        ...suggestions.ironRich.slice(0, 2).map((p) => ({ label: p.name, href: p.href })),
      ],
      followUps: ["What should we try next?", "What Indian iron-rich foods next?"],
    };
  }

  // 6) indian foods
  if (/indian|idli|dosa|sambar|rasam|dal |dhal|paneer|ragi|khichdi|pongal|curry|tamil|kerala|karnataka|andhra/.test(q)) {
    const picks = suggestions.newIndian.slice(0, 5);
    return {
      ...base,
      verdict: "info",
      title: `🇮🇳 Indian foods to try next for ${baby.name}`,
      summary: tried.length === 0
        ? "Beautiful choice — Indian staples like dal, rice, and ragi make ideal first foods."
        : `Based on ${tried.length} logged foods, here are the best next Indian additions:`,
      bullets: [
        ...picks.map((p) => `${p.emoji} ${p.name} (${p.ageText}) — ${p.reason}`),
        "Rules of thumb: no added salt under 12 months, no chili heat yet, cook dals extra-soft, soak roti in dal.",
      ],
      doctorBox: "none",
      links: [
        { label: "Browse all Indian recipes", href: "/recipes" },
        ...picks.slice(0, 2).map((p) => ({ label: p.name, href: p.href })),
      ],
      followUps: ["Can my baby eat idli?", "Can my baby eat sambar?", "What should we try next?"],
    };
  }

  // 6b) world cuisine questions ("italian food?", "japanese recipes?", "mexican?")
  const cuisineHit = CUISINE_KEYWORDS.find((c) => c.match.test(q));
  if (cuisineHit && !matched) {
    const country = cuisineHit.country;
    const flag = COUNTRY_FLAGS[country] ?? "🌍";
    const group = suggestions.worldCuisines.find((w) => w.country === country);
    const countryRecipes = catalog.filter((c) => c.kind === "recipe" && c.country === country);
    const ageOkList = countryRecipes.filter(
      (c) => baby.ageMonths === null || c.ageMin <= baby.ageMonths
    );
    const triedInCountry = tried.filter((t) => {
      const c = catalog.find((x) => x.key === t.key);
      return c?.country === country;
    });
    const picks = (group?.picks ?? []).slice(0, 4);
    return {
      ...base,
      verdict: "info",
      title: `${flag} ${country} foods for ${baby.name}`,
      summary:
        picks.length === 0
          ? ageOkList.length === 0
            ? `${country} recipes in the library start a little later — here is what is coming up for ${baby.name} (${ageStr}):`
            : `${baby.name} has tried everything from ${country} in the library — bravo! Here is a recap:`
          : `Age-perfect ${country} picks for ${baby.name} (${ageStr}) — all baby-adapted, no added salt, no chili heat:`,
      bullets:
        picks.length === 0
          ? countryRecipes
              .slice(0, 4)
              .map((c) => `${c.emoji} ${c.name} (${c.ageText})`)
          : [
              ...picks.map((p) => `${p.emoji} ${p.name} (${p.ageText}) — ${p.reason}`),
              triedInCountry.length > 0
                ? `Already tried from ${country}: ${triedInCountry.map((t) => t.name).join(", ")}.`
                : `First taste of ${country} — start with the lowest-age recipe above.`,
            ],
      doctorBox: "none",
      links: [
        { label: `Browse ${country} recipes`, href: `/recipes?country=${encodeURIComponent(country)}` },
        ...picks.slice(0, 2).map((p) => ({ label: p.name, href: p.href })),
      ],
      followUps: ["What should we try next?", "What Indian foods next?", "What should we avoid?"],
    };
  }

  // 6c) explore-the-world questions
  if (/\bworld\b|\bglobal\b|\bcuisine\b|\bcuisines\b|\bcountries\b|\bdifferent cultures\b|\btravel\b.*\bfood\b/.test(q)) {
    const groups = suggestions.worldCuisines.slice(0, 5);
    return {
      ...base,
      verdict: "info",
      title: `🌍 Take ${baby.name} on a world food tour`,
      summary: `One age-perfect pick from each unexplored cuisine — new flavors build adventurous eaters:`,
      bullets: [
        ...groups.map(
          (g) => `${g.flag} ${g.country}: ${g.picks.map((p) => `${p.name} (${p.ageText})`).join(", ")}`
        ),
        "All recipes are baby-adapted: no added salt, no chili heat, safe textures by age.",
      ],
      doctorBox: "none",
      links: [
        { label: "Explore all recipes by country", href: "/recipes" },
        ...groups.slice(0, 2).flatMap((g) => g.picks.slice(0, 1).map((p) => ({ label: p.name, href: p.href }))),
      ],
      followUps: ["Italian foods?", "Japanese foods?", "What Indian foods next?"],
    };
  }

  // 7) recipes / meal ideas
  if (/recipe|recipes|make|cook|meal idea|meal plan|combine|combination|dinner|lunch|breakfast idea/.test(q)) {
    const combos = suggestions.combos.slice(0, 4);
    return {
      ...base,
      verdict: "info",
      title: `🍛 Meal ideas from foods ${baby.name} already enjoys`,
      summary: tried.length === 0
        ? "Log a few foods first and I'll build combos from them! Meanwhile, start here:"
        : `Built from ${baby.name}'s ${tried.length} tried foods — familiar ingredients, new combinations:`,
      bullets: [
        ...combos.map((c) => `${c.title}: ${c.detail}`),
        ...suggestions.newIndian.slice(0, 2).map((p) => `🆕 New to try: ${p.emoji} ${p.name} (${p.ageText})`),
      ],
      doctorBox: "none",
      links: [
        { label: "Browse Indian recipes", href: "/recipes" },
        ...combos.filter((c) => c.href).slice(0, 2).map((c) => ({ label: c.title, href: c.href as string })),
      ],
      followUps: ["What Indian foods next?", "What should we try next?", "Iron-rich ideas?"],
    };
  }

  // 8) what next / general suggest
  if (/next|try|introduc|suggest|start|new food|first food|variety|should (she|he|my baby|we) (eat|try)/.test(q) || q.length < 30) {
    const picks = suggestions.tryNext.slice(0, 5);
    return {
      ...base,
      verdict: "info",
      title: `🌟 What ${baby.name} should try next`,
      summary: tried.length === 0
        ? `Starting fresh! These gentle first foods are perfect for ${ageStr}:`
        : `Personalized from ${baby.name}'s ${tried.length} tried foods, age (${ageStr}), and preferences:`,
      bullets: [
        ...picks.map((p) => `${p.emoji} ${p.name} (${p.ageText}) — ${p.reason}`),
        tried.length > 0 ? "I avoided repeats and prioritized new categories + iron + pending allergens." : "Introduce one new food at a time; allergens in the morning with a 2-hour watch.",
      ],
      doctorBox: "none",
      links: picks.slice(0, 3).map((p) => ({ label: p.name, href: p.href })),
      followUps: ["What Indian foods next?", "What should we avoid?", "Iron-rich ideas?"],
    };
  }

  // 9) readiness / starting solids
  if (/ready|readiness|when.*start|starting solids|6 month|4 month|signs/.test(q)) {
    return {
      ...base,
      verdict: "info",
      title: "🌱 Is baby ready for solids?",
      summary: "Most babies are ready around 6 months — but developmental signs matter more than the calendar. All four are needed:",
      bullets: [
        "Sits upright with minimal support + steady head control",
        "Brings hands/toys accurately to mouth",
        "Shows interest — watches you eat, reaches, opens mouth",
        "Tongue-thrust reflex fading (not pushing everything out)",
      ],
      doctorBox: "none",
      links: [{ label: "Starting Solids 101 guide", href: "/guides/starting-solids-101" }],
      followUps: ["What should we try next?", "What should we avoid?", "Can my baby eat banana?"],
    };
  }

  // 10) gagging / choking info
  if (/gag|chok|puke|spit/.test(q)) {
    return {
      ...base,
      verdict: "info",
      title: "🛟 Gagging vs choking — know the difference",
      summary: "Gagging is LOUD and safe (coughing, sputtering, red face) — baby is learning. Choking is SILENT (no sound, blue lips, panic) — that's the emergency.",
      bullets: [
        "Gagging: stay calm, don't fish food out, let baby work it forward. Say 'you've got it!'",
        "Choking: call emergency services + 5 back blows / 5 chest thrusts, alternating.",
        "Prevention: upright seating, quarter round foods lengthwise, cook hard foods soft, supervise 100%.",
      ],
      doctorBox: "none",
      links: [{ label: "Full gagging vs choking guide", href: "/guides/gagging-vs-choking" }],
      followUps: ["What are the top choking hazards?", "How do I cut grapes safely?"],
    };
  }

  // 11) constipation / digestion
  if (/constipat|poop|stool|gas|gassy|colic|diarrhea|loose motion/.test(q)) {
    return {
      ...base,
      verdict: "info",
      title: "💩 Digestion helpers",
      summary: "For constipation: fiber + fluids + movement help most. For gassiness: moong dal beats toor dal, and new foods need a few days of adjustment.",
      bullets: [
        "Helper foods: pears, peas, oatmeal, prunes (as puree), lentils — plus sips of water with meals (6m+).",
        "Ease up temporarily on: excess rice cereal, bananas, and too much dairy.",
        "Bicycle legs + tummy massage + warm bath often get things moving.",
        "See the pediatrician for: blood/mucus in stool, severe pain, vomiting with constipation, or no improvement in a few days.",
      ],
      doctorBox: "mild",
      links: [{ label: "Starting Solids 101", href: "/guides/starting-solids-101" }],
      followUps: ["Can my baby eat pear?", "What should we try next?"],
    };
  }

  // fallback: overview
  const picks = suggestions.tryNext.slice(0, 3);
  return {
    ...base,
    verdict: "info",
    title: `👋 Here's ${baby.name}'s snapshot (${ageStr})`,
    summary: `I look at ${baby.name}'s age, ${tried.length} tried foods, preferences, reactions, and allergen progress to answer food questions. Try asking:`,
    bullets: [
      '"Can my baby eat mango?" — safety + prep + texture for any food',
      '"What Indian foods next?" — personalized Indian picks',
      '"What should we avoid?" — age-based avoid list',
      ...picks.map((p) => `Top pick: ${p.emoji} ${p.name} — ${p.reason}`),
    ],
    doctorBox: "none",
    links: picks.map((p) => ({ label: p.name, href: p.href })),
    followUps: ["What should we try next?", "What Indian foods next?", "What should we avoid right now?"],
  };
}
