// ─── AFFILIATE BOOK RECOMMENDATIONS ───
// Amazon affiliate links mapped to mythology categories
// Replace YOUR_AFFILIATE_TAG with your actual Amazon Associates tag

const TAG = 'codexmyth-20'; // Replace with your Amazon Associates tag

// Books mapped by mythology keyword
const BOOK_MAP = [
  { match: ['Greek'], title: 'Mythos by Stephen Fry', asin: '1452178917' },
  { match: ['Greek'], title: 'The Greek Myths by Robert Graves', asin: '0143106716' },
  { match: ['Norse'], title: 'Norse Mythology by Neil Gaiman', asin: '039360909X' },
  { match: ['Norse', 'Scandinavian'], title: 'The Prose Edda by Snorri Sturluson', asin: '0140447555' },
  { match: ['Japanese'], title: 'The Book of Yokai by Michael Dylan Foster', asin: '0520271025' },
  { match: ['Japanese'], title: 'Kwaidan by Lafcadio Hearn', asin: '0486219011' },
  { match: ['Egyptian'], title: 'The Egyptian Book of the Dead', asin: '0142180858' },
  { match: ['Hindu', 'Buddhist'], title: 'The Mahabharata (abridged)', asin: '0143039679' },
  { match: ['Hindu'], title: 'Indian Mythology by Devdutt Pattanaik', asin: '0143104608' },
  { match: ['Celtic', 'Irish', 'Scottish'], title: 'Celtic Myths and Legends by Peter Berresford Ellis', asin: '0786711248' },
  { match: ['Slavic', 'Russian', 'Romanian'], title: 'Slavic Myths (Thames & Hudson)', asin: '0500025053' },
  { match: ['Aztec', 'Maya', 'Mesoamerican'], title: 'Aztec and Maya Myths by Karl Taube', asin: '0292781318' },
  { match: ['Chinese'], title: 'Chinese Mythology A to Z', asin: '1604134364' },
  { match: ['Korean'], title: 'Korean Mythology by Jieun Kiaer', asin: '0500025096' },
  { match: ['Filipino'], title: 'The Mythology Class by Arnold Arre', asin: 'B08VCH9LXG' },
  { match: ['Persian'], title: 'Shahnameh: The Persian Book of Kings', asin: '0143108328' },
  { match: ['Mesopotamian', 'Babylonian'], title: 'Myths from Mesopotamia (Oxford)', asin: '0199538360' },
  { match: ['Māori', 'Polynesian', 'Melanesian'], title: 'Polynesian Mythology by George Grey', asin: '1528706552' },
  { match: ['African', 'Akan', 'Ewe'], title: 'African Mythology A to Z', asin: '1604134151' },
  { match: ['Native American', 'Algonquin', 'Inuit', 'Tlingit'], title: 'American Indian Myths and Legends', asin: '0394740181' },
  { match: ['Arabian'], title: 'The Arabian Nights (Penguin Classics)', asin: '0140449868' },
  { match: ['Finnish'], title: 'The Kalevala (Oxford World Classics)', asin: '0199535523' },
  { match: ['Central American', 'Brazilian', 'Latin American', 'Mapuche'], title: 'Latin American Folktales', asin: '0375714391' },
];

// General mythology books as fallback
const GENERAL_BOOKS = [
  { title: 'The Penguin Book of Myths and Legends', asin: '0141026340' },
  { title: 'Monsters: A Bestiary by Christopher Dell', asin: '1620401581' },
  { title: 'Mythical Monsters by Charles Gould', asin: '1596056797' },
];

export function getBookLinks(mythology) {
  if (!mythology) return getRandomGeneral();

  const matched = BOOK_MAP.filter(b =>
    b.match.some(m => mythology.toLowerCase().includes(m.toLowerCase()))
  );

  if (matched.length > 0) {
    // Return up to 2 relevant books
    const picks = matched.slice(0, 2);
    return picks.map(b => ({
      title: b.title,
      url: `https://www.amazon.com/dp/${b.asin}?tag=${TAG}`,
    }));
  }

  return getRandomGeneral();
}

function getRandomGeneral() {
  const pick = GENERAL_BOOKS[Math.floor(Math.random() * GENERAL_BOOKS.length)];
  return [{
    title: pick.title,
    url: `https://www.amazon.com/dp/${pick.asin}?tag=${TAG}`,
  }];
}
