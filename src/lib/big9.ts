export interface Big9Info {
  name: string;
  emoji: string;
  blurb: string;
  howToServe: string;
  foods: string[];
}

export const BIG9: Big9Info[] = [
  {
    name: "Peanut",
    emoji: "🥜",
    blurb: "Early introduction (~6 mo) may cut peanut allergy risk by 81%.",
    howToServe: "2 tsp peanut butter thinned with water until drippy, stirred into oatmeal. Never whole nuts or globs.",
    foods: ["peanut-butter"],
  },
  {
    name: "Egg",
    emoji: "🥚",
    blurb: "Serve yolk + white together, fully cooked. A choline powerhouse.",
    howToServe: "Hard-boiled egg mashed with avocado, or soft scramble strips. No runny yolks for babies.",
    foods: ["egg"],
  },
  {
    name: "Dairy",
    emoji: "🧀",
    blurb: "Yogurt and cheese from 6 mo; milk as a drink only from 12 mo.",
    howToServe: "Plain whole-milk yogurt, melted low-sodium cheese, ricotta on toast.",
    foods: ["yogurt", "cheese", "butter", "whole-milk-drink"],
  },
  {
    name: "Wheat",
    emoji: "🍞",
    blurb: "Soft pasta, toast strips, and infant cereal all count as exposure.",
    howToServe: "Very soft pasta, lightly toasted bread strips, wheat-based cereals.",
    foods: ["pasta", "bread"],
  },
  {
    name: "Soy",
    emoji: "🫘",
    blurb: "Tofu and edamame are gentle, protein-rich ways to expose.",
    howToServe: "Soft baked tofu strips, smashed edamame, soy yogurt.",
    foods: ["tofu", "edamame"],
  },
  {
    name: "Fish",
    emoji: "🐟",
    blurb: "Salmon and sardines add brain-building DHA with every exposure.",
    howToServe: "Baked salmon flaked (check bones), mashed sardines on toast.",
    foods: ["salmon", "white-fish-cod", "sardines", "tuna"],
  },
  {
    name: "Shellfish",
    emoji: "🍤",
    blurb: "Shrimp must be minced finely — whole shrimp are too rubbery.",
    howToServe: "Cooked shrimp minced very fine into congee or mashed potato.",
    foods: ["shrimp"],
  },
  {
    name: "Sesame",
    emoji: "🥣",
    blurb: "The allergen hiding in hummus. Tahini thinned is the easiest vehicle.",
    howToServe: "Tahini thinned with water/lemon stirred into oatmeal; thin hummus.",
    foods: ["tahini", "hummus"],
  },
  {
    name: "Tree Nuts",
    emoji: "🌰",
    blurb: "Rotate almond, cashew & walnut butters — each nut is a distinct exposure.",
    howToServe: "Nut butters thinned until drippy or spread paper-thin on toast.",
    foods: ["almond-butter", "cashew-butter"],
  },
];

export const REACTIONS = ["Loved", "Liked", "Neutral", "Disliked", "Refused", "Rash / Concern"] as const;

export const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"] as const;

export const CATEGORIES = [
  { name: "Fruits", emoji: "🍎" },
  { name: "Vegetables", emoji: "🥦" },
  { name: "Grains", emoji: "🍚" },
  { name: "Millets", emoji: "🌾" },
  { name: "Proteins", emoji: "🍗" },
  { name: "Dairy & Eggs", emoji: "🥚" },
  { name: "Beans & Legumes", emoji: "🫘" },
  { name: "Nuts & Seeds", emoji: "🥜" },
  { name: "Flavor & Fats", emoji: "🫒" },
] as const;
