/**
 * Générateur de brouillons d'avis (templates — jamais publiés automatiquement).
 */

export type DraftStyle =
  | "luxe"
  | "naturel"
  | "professionnel"
  | "jeune"
  | "premium"
  | "reunionnais";

export type DraftLength = "court" | "moyen" | "long";

export interface DraftReviewInput {
  productName: string;
  style: DraftStyle;
  length: DraftLength;
  index: number;
}

export interface GeneratedDraft {
  authorName: string;
  title: string;
  body: string;
  rating: number;
}

const FIRST_NAMES = [
  "Margaux", "Diane", "Isabelle", "Camille", "Sophie", "Léa", "Chloé", "Manon",
  "Élodie", "Julie", "Nathalie", "Aurélie", "Céline", "Marine", "Sarah", "Inès",
  "Mélissa", "Vanessa", "Stéphanie", "Claire",
];

const LAST_INITIALS = ["L.", "K.", "R.", "D.", "M.", "B.", "T.", "P.", "G.", "V.", "N.", "S."];

const TITLES: Record<DraftStyle, string[]> = {
  luxe: [
    "Une expérience sensorielle rare",
    "Le luxe au quotidien",
    "Raffinement absolu",
    "Mon rituel précieux",
    "Élégance et efficacité",
  ],
  naturel: [
    "Douceur et authenticité",
    "Comme une caresse",
    "Ma peau respire enfin",
    "Naturellement éclatante",
    "Simplicité qui fonctionne",
  ],
  professionnel: [
    "Résultats visibles rapidement",
    "Qualité professionnelle",
    "Efficacité remarquable",
    "Un indispensable de ma routine",
    "Performance au rendez-vous",
  ],
  jeune: [
    "Trop bien !",
    "Mon nouveau crush beauté",
    "Validé à 100 %",
    "Je suis fan",
    "Ça change tout",
  ],
  premium: [
    "Investissement qui vaut le coup",
    "Haut de gamme assumé",
    "Excellence LN COS",
    "Le détail qui fait la différence",
    "Prestige et résultats",
  ],
  reunionnais: [
    "Créol au top !",
    "Fière de soutenir local",
    "Une pépite réunionnaise",
    "Chaleur et efficacité",
    "Mon coup de cœur 974",
  ],
};

const BODIES: Record<DraftStyle, Record<DraftLength, string[]>> = {
  luxe: {
    court: [
      "Texture soyeuse, parfum délicat. {product} est devenu mon indispensable.",
      "Packaging somptueux, résultat immédiat. Je recommande sans hésiter.",
    ],
    moyen: [
      "Dès la première utilisation, {product} m'a séduite par sa texture fondante et son parfum subtil. Ma peau est plus lumineuse, plus confortable. Un vrai moment de luxe à la maison.",
      "J'ai testé de nombreuses marques, mais {product} se distingue par son élégance et son efficacité. Le packaging est magnifique et le soin tient ses promesses.",
    ],
    long: [
      "En quinze jours avec {product}, mon teint a gagné en éclat et en uniformité. La texture est incomparable — soyeuse, absorbée instantanément, sans film gras. Chaque application devient un petit rituel précieux. C'est exactement ce que j'attends d'une maison de luxe : intention, sensorialité et résultats visibles.",
      "Je cherchais un soin qui allie raffinement et performance. {product} coche toutes les cases : odeur délicate, application agréable, effet durable sur la peau. Mes proches m'ont déjà demandé mon secret. Je ne peux plus m'en passer.",
    ],
  },
  naturel: {
    court: [
      "Peau douce, teint frais. {product} fait exactement ce qu'il promet.",
      "Léger, agréable, efficace. Parfait pour ma routine simple.",
    ],
    moyen: [
      "{product} respecte ma peau sensible tout en lui redonnant de l'éclat. Texture légère, sensation de fraîcheur, résultat naturel au réveil.",
      "J'aime la simplicité de {product} : peu de gestes, un vrai confort. Ma peau paraît reposée et plus harmonieuse.",
    ],
    long: [
      "Avec {product}, j'ai retrouvé une peau apaisée et lumineuse sans surcharge de produits. La formule semble travailler en douceur, jour après jour. C'est le genre de soin qu'on garde longtemps parce qu'il s'intègre naturellement à sa routine.",
      "Ce que j'apprécie chez {product}, c'est l'équilibre entre efficacité et douceur. Pas d'effet masque, juste une peau qui respire mieux et paraît plus saine. Un choix naturel dans tous les sens du terme.",
    ],
  },
  professionnel: {
    court: [
      "Résultat net dès la première semaine avec {product}. Très satisfaite.",
      "Efficacité constante, texture maîtrisée. Je rachète.",
    ],
    moyen: [
      "{product} offre une vraie différence sur la qualité de peau. Application facile, tenue impeccable, résultat mesurable en quelques jours.",
      "En tant que cliente exigeante, je valide {product} : tenue des promesses, régularité des effets, rapport qualité-prix cohérent.",
    ],
    long: [
      "J'utilise {product} depuis un mois dans une routine structurée. Les premiers signes sont apparus rapidement, puis les résultats se sont stabilisés. Texture professionnelle, absorption rapide, fini propre. C'est le type de produit que je recommande à mes proches qui veulent des résultats concrets.",
      "Mon expérience avec {product} est très positive : peau plus uniforme, confort durable, utilisation agréable matin et soir. On sent une vraie expertise derrière la formulation.",
    ],
  },
  jeune: {
    court: [
      "{product} c'est validé ! Ma peau est glowy.",
      "Franchement top, je le mets dans mon panier à chaque fois.",
    ],
    moyen: [
      "J'ai craqué pour {product} et je regrette pas : texture cool, résultat rapide, packaging stylé. Mes copines veulent le même.",
      "{product} est devenu mon must-have. Facile à utiliser, effet visible, parfait avant une sortie ou après une longue journée.",
    ],
    long: [
      "Au début j'étais sceptique, mais {product} m'a vraiment convaincue. En deux semaines ma peau est plus jolie, plus confortable, et j'adore l'expérience d'utilisation. C'est frais, moderne, et ça marche — bref, exactement ce que je cherchais.",
      "Je partage souvent mes découvertes beauté, et {product} fait partie de mes favoris du moment. Bonne absorption, fini clean, et un vrai boost sur le teint. Je le garde dans ma routine sans hésiter.",
    ],
  },
  premium: {
    court: [
      "{product} : qualité premium, résultat premium. Rien à redire.",
      "Investissement rentable. {product} tient ses promesses haut de gamme.",
    ],
    moyen: [
      "{product} incarne bien l'esprit LN COS : soin haut de gamme, sensorialité maîtrisée, efficacité durable. Je le considère comme un essentiel.",
      "Chaque détail compte avec {product} — texture, parfum, packaging, et surtout le résultat sur la peau. Une valeur sûre.",
    ],
    long: [
      "J'ai choisi {product} pour sa réputation et je confirme : c'est un soin premium dans l'expérience comme dans les résultats. Ma peau paraît plus dense, plus lumineuse, plus confortable. C'est le genre de produit qu'on garde des années dans sa salle de bain.",
      "Pour moi, {product} représente l'excellence accessible : formulation soignée, application plaisir, effets progressifs mais réels. Je le recommande aux personnes qui veulent un vrai saut de qualité sans compromis.",
    ],
  },
  reunionnais: {
    court: [
      "Fière de {product}, fière de LN COS ! Résultat au top.",
      "Produit local qui rivalise avec les grandes marques. Bravo.",
    ],
    moyen: [
      "{product} me rappelle la douceur de l'île : texture agréable, parfum envoûtant, peau rayonnante. Heureuse de soutenir une marque réunionnaise.",
      "Entre chaleur tropicale et routine beauté, {product} s'impose comme un allié fidèle. Efficace, authentique, fièrement local.",
    ],
    long: [
      "Vivant à La Réunion, je suis sensible aux marques qui portent notre identité. {product} allie fierté locale et vraie qualité : ma peau est plus belle, plus confortable, et l'expérience d'utilisation est un vrai plaisir. C'est exactement le niveau que j'attends d'une maison LN COS.",
      "J'ai longtemps cherché un soin premium ancré dans notre territoire. {product} répond à cette attente avec élégance : résultats visibles, texture maîtrisée, et cette touche réunionnaise qui fait la différence. Je le recommande à toutes mes proches.",
    ],
  },
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function generateReviewDraft(input: DraftReviewInput): GeneratedDraft {
  const { productName, style, length, index } = input;
  const authorName = `${pick(FIRST_NAMES, index + style.length)} ${pick(LAST_INITIALS, index * 3)}`;
  const title = pick(TITLES[style], index);
  const template = pick(BODIES[style][length], index);
  const body = template.replace(/\{product\}/g, productName);
  const rating = index % 7 === 0 ? 4 : 5;

  return { authorName, title, body, rating };
}

export function generateReviewDrafts(
  productName: string,
  count: number,
  style: DraftStyle,
  length: DraftLength
): GeneratedDraft[] {
  const n = Math.max(1, Math.min(20, count));
  return Array.from({ length: n }, (_, i) =>
    generateReviewDraft({ productName, style, length, index: i })
  );
}

export const DRAFT_STYLE_LABELS: Record<DraftStyle, string> = {
  luxe: "Luxe",
  naturel: "Naturel",
  professionnel: "Professionnel",
  jeune: "Jeune",
  premium: "Premium",
  reunionnais: "Réunionnais",
};

export const DRAFT_LENGTH_LABELS: Record<DraftLength, string> = {
  court: "Court",
  moyen: "Moyen",
  long: "Long",
};
