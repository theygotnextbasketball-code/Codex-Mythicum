// ─── ALGORITHMIC CREATURE GENERATOR ───
// Procedurally combines traits from large pools to create unique hybrid creatures

const PARTS = {
  prefixes: ["Shadow", "Storm", "Crystal", "Bone", "Ember", "Frost", "Void", "Iron", "Blood", "Star", "Dream", "Thorn", "Ash", "Mist", "Soul", "Dusk", "Silk", "Venom", "Stone", "Moon", "Sun", "Thunder", "Obsidian", "Jade", "Coral", "Amber", "Crimson", "Azure", "Golden", "Silver", "Phantom", "Ancient", "Hollow", "Pyroclast", "Abyssal"],
  roots: ["wyrm", "drake", "maw", "fang", "claw", "wing", "horn", "tail", "scale", "spine", "eye", "tooth", "tusk", "fin", "talon", "beak", "tongue", "coil", "tendril", "bloom", "root", "bark", "shell", "veil", "shade", "song", "weaver", "stalker", "dancer", "caller", "walker", "crawler", "serpent", "raptor", "behemoth"],
  bodyBases: ["serpentine dragon", "great wolf", "colossal bird of prey", "massive arachnid", "primordial eel", "bull-like titan", "enormous feline predator", "humanoid colossus", "giant crustacean", "winged lizard", "amphibious leviathan", "spectral stag", "insectoid swarm-mind", "floating jellyfish entity", "armored tortoise-beast"],
  features: [
    "multiple heads that argue among themselves",
    "bioluminescent markings that pulse with its heartbeat",
    "a crown of living antlers that bloom with impossible flowers",
    "eyes that reflect a different reality than the one around it",
    "scales that shift between solid and transparent",
    "a mane of living flames that never burn out",
    "crystalline growths along its spine that resonate with sound",
    "shadow tendrils that extend independently of its body",
    "feathers made of woven moonlight",
    "skin that continuously sheds and regenerates in new patterns",
    "a tail tipped with a cluster of watching eyes",
    "antennae that taste the emotions of nearby creatures",
    "an exoskeleton of fused bone and metal ore",
    "wings composed of layered, paper-thin stone",
    "a second, spectral form visible only in peripheral vision",
    "frost that forms in the air around its breath",
    "bark-like plating that sprouts moss and small fungi",
    "a membrane of iridescent energy between its limbs",
  ],
  abilities: [
    "It can compress itself into impossibly small spaces.",
    "Its roar induces vivid hallucinations of the listener's worst memory.",
    "It leaves no footprints, no matter the terrain.",
    "Time moves differently in its immediate presence — minutes can feel like hours.",
    "It can perfectly mimic any sound it has heard, even human speech.",
    "It feeds on ambient heat, leaving frozen wastelands in its wake.",
    "It secretes a substance that erases memory on contact.",
    "It communicates through patterns of color across its body.",
    "It can phase partially into solid matter, embedding itself in stone or wood.",
    "It is invisible during rainfall.",
    "Wounds it inflicts cannot heal by natural means.",
    "It instinctively knows the structural weaknesses of any constructed thing.",
    "It can detach and reattach its own limbs at will.",
    "It generates a low-frequency hum that shatters glass and weakens mortar.",
    "It absorbs kinetic energy from impacts, growing stronger when struck.",
  ],
  habitats: ["volcanic caverns deep beneath mountain ranges", "the boundary between dense forest and open tundra", "coral palaces in abyssal ocean trenches", "ruins of civilizations that predate recorded history", "the perpetual storm-wall at the edge of known maps", "mirror-still lakes surrounded by dead trees", "vast underground fungal forests", "the rooftops and bell towers of abandoned cities", "salt flats that stretch to every horizon", "mangrove labyrinths at river mouths", "floating islands in the upper atmosphere", "glacier crevasses", "the spaces between walls in very old buildings"],
  dangers: ["Catastrophic", "Extreme", "High", "Moderate", "Low", "Variable", "Unknown"],
  mythOrigins: ["an unnamed pre-Sumerian tablet fragment", "oral traditions of deep-jungle peoples", "a single illuminated manuscript in a sealed Vatican archive", "Polynesian navigational chants", "cave paintings in the Ural Mountains", "a Tibetan monastery's forbidden library", "Basque shepherd folklore passed down for millennia", "fragmentary Etruscan bronze inscriptions", "Aboriginal Australian songlines", "Berber star-navigation myths", "Ainu oral history from Hokkaido", "a lost chapter of the Ethiopian Kebra Nagast"],
};

function seededRandom(seed) {
  let s = seed;
  return function () {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

export function generateAlgoCreature(seed) {
  const rng = seededRandom(seed);
  const prefix = pick(PARTS.prefixes, rng);
  const root = pick(PARTS.roots, rng);
  const name = `${prefix}${root.charAt(0).toUpperCase() + root.slice(1)}`;
  const base = pick(PARTS.bodyBases, rng);
  const feat1 = pick(PARTS.features, rng);
  let feat2 = pick(PARTS.features, rng);
  while (feat2 === feat1) feat2 = pick(PARTS.features, rng);
  const ability = pick(PARTS.abilities, rng);
  const habitat = pick(PARTS.habitats, rng);
  const danger = pick(PARTS.dangers, rng);
  const origin = pick(PARTS.mythOrigins, rng);

  return {
    name,
    mythology: "Procedurally Generated",
    aka: `The ${prefix} ${root.charAt(0).toUpperCase() + root.slice(1)}`,
    type: "Algorithmic Hybrid",
    habitat: habitat.charAt(0).toUpperCase() + habitat.slice(1),
    traits: [prefix, base.split(" ").pop(), "Unique"],
    danger,
    description: `A ${base} with ${feat1} and ${feat2}. First documented in ${origin}, this creature inhabits ${habitat}. ${ability} Locals who claim to have survived encounters describe a presence that lingers in the mind long after the creature itself has vanished.`,
    source: "algorithm",
  };
}
