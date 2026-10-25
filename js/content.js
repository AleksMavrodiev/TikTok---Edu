// Built-in content. Lessons play like short videos: a sequence of slides,
// each shown for a few seconds (optionally narrated). Puzzles are
// interactive minigames mixed into the feed.

export const TOPICS = [
  { id: 'history', name: 'History', icon: '🏛️', colors: ['#7c2d12', '#ea580c'] },
  { id: 'science', name: 'Science', icon: '🔬', colors: ['#064e3b', '#10b981'] },
  { id: 'space', name: 'Space', icon: '🪐', colors: ['#1e1b4b', '#6366f1'] },
  { id: 'math', name: 'Math', icon: '➗', colors: ['#4c1d95', '#a855f7'] },
  { id: 'nature', name: 'Nature', icon: '🌿', colors: ['#14532d', '#84cc16'] },
  { id: 'tech', name: 'Tech', icon: '💻', colors: ['#0c4a6e', '#06b6d4'] },
];

export const LESSONS = [
  {
    id: 'l-cleopatra', topic: 'history', creator: 'timetraveler',
    title: 'Cleopatra and the Moon landing',
    slides: [
      ['🔺', 'The Great Pyramid of Giza was finished around 2560 BC.'],
      ['👑', 'Cleopatra died in 30 BC — about 2,500 years later.'],
      ['🚀', 'Apollo 11 landed on the Moon in 1969 AD.'],
      ['🤯', 'So Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid!'],
    ],
    more: 'Ancient Egyptian civilisation lasted roughly 3,000 years. By Cleopatra’s time the pyramids were already ancient monuments that Greek and Roman tourists visited.',
    source: 'Encyclopaedia Britannica — Pyramids of Giza; Cleopatra',
  },
  {
    id: 'l-oxford', topic: 'history', creator: 'timetraveler',
    title: 'Older than the Aztecs',
    slides: [
      ['🎓', 'Teaching at Oxford existed by 1096.'],
      ['🌋', 'The Aztec city of Tenochtitlan was founded around 1325.'],
      ['📚', 'Oxford University is more than 200 years older than the Aztec capital.'],
    ],
    more: 'Oxford grew rapidly after 1167, when Henry II banned English students from attending the University of Paris. Tenochtitlan became one of the largest cities in the world before the Spanish conquest in 1521.',
    source: 'University of Oxford — History; Britannica — Tenochtitlan',
  },
  {
    id: 'l-emu', topic: 'history', creator: 'oddhistory',
    title: 'The Great Emu War',
    slides: [
      ['🇦🇺', 'In 1932, farmers in Western Australia faced ~20,000 emus eating their crops.'],
      ['🪖', 'The government sent soldiers with machine guns.'],
      ['🐦', 'The emus scattered into small groups and were very hard to hit.'],
      ['🏳️', 'After weeks of effort, the operation was withdrawn. Many say the emus won.'],
    ],
    more: 'Major G.P.W. Meredith reportedly compared the emus to tanks for their ability to absorb damage. Later, a bounty system proved more effective.',
    source: 'National Museum of Australia',
  },
  {
    id: 'l-zanzibar', topic: 'history', creator: 'oddhistory',
    title: 'The shortest war in history',
    slides: [
      ['⚓', 'On 27 August 1896, Britain and the Sultanate of Zanzibar went to war.'],
      ['⏱️', 'It lasted roughly 38 to 45 minutes.'],
      ['🏆', 'It is widely considered the shortest war ever recorded.'],
    ],
    more: 'The conflict began after the death of a pro-British sultan, when Khalid bin Barghash took power without British approval. British ships bombarded the palace until a ceasefire.',
    source: 'Guinness World Records; Britannica',
  },
  {
    id: 'l-rosetta', topic: 'history', creator: 'timetraveler',
    title: 'How we learned to read hieroglyphs',
    slides: [
      ['🪨', 'In 1799, soldiers in Egypt found a stone slab near the town of Rashid (Rosetta).'],
      ['📜', 'It carried the same decree in three scripts: hieroglyphic, Demotic and Ancient Greek.'],
      ['🔑', 'Scholars could read Greek — so it became a key to the other two.'],
      ['💡', 'In 1822, Jean-François Champollion announced he had cracked hieroglyphs.'],
    ],
    more: 'The decree was issued in 196 BC on behalf of King Ptolemy V. The stone has been in the British Museum since 1802.',
    source: 'The British Museum',
  },
  {
    id: 'l-gutenberg', topic: 'history', creator: 'timetraveler',
    title: 'The machine that changed knowledge',
    slides: [
      ['✍️', 'Before the 1400s, books in Europe were mostly copied by hand.'],
      ['🖨️', 'Around 1440, Johannes Gutenberg developed a movable-type printing press.'],
      ['📖', 'His famous Bible was printed in the mid-1450s.'],
      ['🌍', 'Within 50 years, millions of books had been printed across Europe.'],
    ],
    more: 'Movable type had been invented earlier in China and Korea. Gutenberg’s combination of metal type, oil-based ink and a screw press made mass production practical in Europe.',
    source: 'Britannica — Printing press',
  },
  {
    id: 'l-octopus', topic: 'nature', creator: 'deepblue',
    title: 'Three hearts, blue blood',
    slides: [
      ['🐙', 'An octopus has three hearts.'],
      ['❤️', 'Two pump blood through the gills, one pumps it around the body.'],
      ['💙', 'Its blood is blue, thanks to a copper-based protein called hemocyanin.'],
      ['🧠', 'And most of its neurons are in its arms, not its brain!'],
    ],
    more: 'Hemocyanin carries oxygen more efficiently than hemoglobin in cold, low-oxygen water. The heart that serves the body actually stops beating while the octopus swims.',
    source: 'Smithsonian Ocean',
  },
  {
    id: 'l-banana', topic: 'nature', creator: 'plantnerd',
    title: 'Bananas are berries. Strawberries aren’t.',
    slides: [
      ['🍓', 'Botanically, a berry develops from a single flower with one ovary.'],
      ['🍌', 'By that definition, bananas, grapes and even tomatoes are berries.'],
      ['❌', 'Strawberries are not — they form from a flower with many ovaries.'],
      ['🌱', 'Those "seeds" on a strawberry? Each one is actually a tiny fruit.'],
    ],
    more: 'Strawberries are called "accessory fruits" because the fleshy part comes from the flower’s receptacle, not the ovary.',
    source: 'Britannica — Berry',
  },
  {
    id: 'l-tardigrade', topic: 'nature', creator: 'microworld',
    title: 'The toughest animal alive',
    slides: [
      ['🐻', 'Tardigrades ("water bears") are about half a millimetre long.'],
      ['🧊', 'They can dry out and enter a state called a tun, almost stopping their metabolism.'],
      ['🛰️', 'In 2007, tardigrades were exposed to open space — and some survived.'],
    ],
    more: 'The FOTON-M3 mission exposed tardigrades to vacuum and cosmic radiation. Some even survived unfiltered solar UV radiation and went on to reproduce.',
    source: 'Jönsson et al., Current Biology (2008)',
  },
  {
    id: 'l-honey', topic: 'science', creator: 'labcoat',
    title: 'Why honey (almost) never spoils',
    slides: [
      ['🍯', 'Honey has very little water, so microbes struggle to grow in it.'],
      ['🧪', 'It is also acidic, and bee enzymes produce small amounts of hydrogen peroxide.'],
      ['🏺', 'Sealed honey can stay edible for an extremely long time.'],
    ],
    more: 'Honey is hygroscopic: it pulls water out of bacteria by osmosis. If it absorbs moisture from the air, though, it can ferment — so keep the lid on.',
    source: 'Smithsonian Magazine — The Science Behind Honey’s Eternal Shelf Life',
  },
  {
    id: 'l-atoms', topic: 'science', creator: 'labcoat',
    title: 'You are mostly empty space',
    slides: [
      ['⚛️', 'Almost all of an atom’s mass is in its tiny nucleus.'],
      ['🏟️', 'If a nucleus were a marble, the atom would be the size of a stadium.'],
      ['🤚', 'So why can’t you walk through walls? Electric forces between electrons push back.'],
    ],
    more: 'The nucleus is roughly 100,000 times smaller than the atom itself. The "solid" feel of matter comes from electromagnetic repulsion and the Pauli exclusion principle.',
    source: 'CERN — The structure of the atom',
  },
  {
    id: 'l-bug', topic: 'tech', creator: 'bitsandbytes',
    title: 'The first computer "bug"',
    slides: [
      ['🦋', 'In 1947, engineers found a moth stuck in the Harvard Mark II computer.'],
      ['📒', 'They taped it into the logbook: "First actual case of bug being found."'],
      ['👩‍💻', 'Grace Hopper, who worked on the machine, loved telling this story.'],
      ['😉', 'Engineers already said "bug" for faults — the joke was that this one was literal.'],
    ],
    more: 'The logbook page, moth included, is held by the Smithsonian’s National Museum of American History.',
    source: 'Smithsonian National Museum of American History',
  },
  {
    id: 'l-www', topic: 'tech', creator: 'bitsandbytes',
    title: 'The web was invented for physicists',
    slides: [
      ['🧑‍🔬', 'In 1989, Tim Berners-Lee proposed an information system at CERN.'],
      ['🔗', 'It linked documents together with hypertext.'],
      ['🌐', 'The first website went online in 1991.'],
      ['🎁', 'In 1993, CERN put the web’s software in the public domain — free for everyone.'],
    ],
    more: 'The internet (the network) existed before the web (the pages and links). The web made the internet easy for everyone to use.',
    source: 'CERN — The birth of the Web',
  },
  {
    id: 'l-light', topic: 'space', creator: 'stargazer',
    title: 'You see the Sun’s past',
    slides: [
      ['☀️', 'Light from the Sun takes about 8 minutes and 20 seconds to reach Earth.'],
      ['👀', 'So you always see the Sun as it was 8 minutes ago.'],
      ['✨', 'Light from other stars can be hundreds or thousands of years old.'],
    ],
    more: 'Earth is about 150 million km from the Sun and light travels at about 300,000 km per second. Looking far into space means looking back in time.',
    source: 'NASA',
  },
  {
    id: 'l-venus', topic: 'space', creator: 'stargazer',
    title: 'A day longer than a year',
    slides: [
      ['🪐', 'Venus spins very slowly: one rotation takes 243 Earth days.'],
      ['🔄', 'But it orbits the Sun in just 225 Earth days.'],
      ['📅', 'So a Venus "day" (one spin) is longer than its year!'],
      ['🙃', 'Bonus: Venus spins backwards compared to most planets.'],
    ],
    more: 'Because of its backward spin, a solar day on Venus (sunrise to sunrise) is about 117 Earth days.',
    source: 'NASA — Venus facts',
  },
  {
    id: 'l-neutron', topic: 'space', creator: 'stargazer',
    title: 'The heaviest teaspoon',
    slides: [
      ['💥', 'When a massive star explodes, its core can collapse into a neutron star.'],
      ['🏙️', 'A neutron star packs more mass than the Sun into a ball about the size of a city.'],
      ['🥄', 'A teaspoon of it would weigh around a billion tonnes on Earth.'],
    ],
    more: 'Neutron stars are typically about 20 km across. Some spin hundreds of times per second and are detected as pulsars.',
    source: 'NASA — Neutron stars',
  },
  {
    id: 'l-birthday', topic: 'math', creator: 'mathmagic',
    title: 'The birthday paradox',
    slides: [
      ['🎂', 'How many people do you need in a room for a 50% chance two share a birthday?'],
      ['🤔', 'Most people guess around 180.'],
      ['2️⃣3️⃣', 'The answer is just 23!'],
      ['🔢', 'With 23 people there are 253 possible pairs — lots of chances for a match.'],
    ],
    more: 'With 70 people, the probability rises above 99.9%. The trick is counting pairs, not people: 23 × 22 ÷ 2 = 253.',
    source: 'Wolfram MathWorld — Birthday Problem',
  },
  {
    id: 'l-montyhall', topic: 'math', creator: 'mathmagic',
    title: 'Should you switch doors?',
    slides: [
      ['🚪🚪🚪', 'A car is behind one of three doors. You pick one.'],
      ['🐐', 'The host, who knows where the car is, opens another door to show a goat.'],
      ['🔀', 'Should you switch? Yes! Switching wins 2 out of 3 times.'],
      ['💭', 'Your first pick was right only 1/3 of the time — switching wins the other 2/3.'],
    ],
    more: 'This is the Monty Hall problem. When it was published in Parade magazine in 1990, thousands of readers — including mathematicians — wrote in to say the answer was wrong. It wasn’t.',
    source: 'Wolfram MathWorld — Monty Hall Problem',
  },
  {
    id: 'l-point9', topic: 'math', creator: 'mathmagic',
    title: 'Is 0.999… equal to 1?',
    slides: [
      ['❓', 'What is 0.999… with nines going on forever?'],
      ['➗', '1/3 = 0.333…  Multiply both sides by 3.'],
      ['✅', '3/3 = 0.999… — and 3/3 is 1.'],
      ['🧮', 'So 0.999… is exactly 1. Same number, two ways to write it.'],
    ],
    more: 'There is no number between 0.999… and 1, and in the real numbers two different numbers always have another number between them.',
    source: 'Standard real analysis',
  },
  {
    id: 'l-fibonacci', topic: 'math', creator: 'mathmagic',
    title: 'The rabbit sequence',
    slides: [
      ['🐇', '1, 1, 2, 3, 5, 8, 13… each number is the sum of the two before it.'],
      ['📐', 'Divide each by the one before: 8/5 = 1.6, 13/8 = 1.625, 21/13 ≈ 1.615…'],
      ['✨', 'The ratio approaches the golden ratio, φ ≈ 1.618.'],
      ['🌻', 'Sunflower seed spirals often come in Fibonacci numbers, like 34 and 55.'],
    ],
    more: 'Leonardo of Pisa (Fibonacci) introduced the sequence to Europe in 1202 with a puzzle about breeding rabbits. It was known earlier to Indian mathematicians.',
    source: 'Britannica — Fibonacci sequence',
  },
];

// Puzzle types: quiz, scramble, timeline, sequence, memory, slider.
export const PUZZLES = [
  {
    id: 'p-timeline-1', type: 'timeline', topic: 'history',
    title: 'Put these in order — oldest first',
    events: [
      ['Great Pyramid of Giza completed', 'c. 2560 BC', -2560],
      ['Traditional founding of Rome', '753 BC', -753],
      ['Fall of the Western Roman Empire', '476 AD', 476],
      ['Magna Carta sealed', '1215', 1215],
    ],
  },
  {
    id: 'p-timeline-2', type: 'timeline', topic: 'history',
    title: 'Which came first?',
    events: [
      ['Gutenberg’s printing press', 'c. 1440', 1440],
      ['Columbus reaches the Americas', '1492', 1492],
      ['US Declaration of Independence', '1776', 1776],
      ['French Revolution begins', '1789', 1789],
    ],
  },
  {
    id: 'p-timeline-3', type: 'timeline', topic: 'tech',
    title: 'Modern milestones — oldest first',
    events: [
      ['First powered airplane flight', '1903', 1903],
      ['Apollo 11 Moon landing', '1969', 1969],
      ['First website goes online', '1991', 1991],
      ['First iPhone released', '2007', 2007],
    ],
  },
  {
    id: 'p-quiz-1', type: 'quiz', topic: 'history',
    title: 'Who painted the ceiling of the Sistine Chapel?',
    options: ['Leonardo da Vinci', 'Michelangelo', 'Raphael', 'Donatello'],
    answer: 1,
    explain: 'Michelangelo painted it between 1508 and 1512, mostly standing on scaffolding — not lying on his back as legend says.',
  },
  {
    id: 'p-quiz-2', type: 'quiz', topic: 'science',
    title: 'How many bones are in the adult human body?',
    options: ['106', '206', '306', '412'],
    answer: 1,
    explain: 'Adults have 206 bones. Babies are born with around 270 — many fuse together as we grow.',
  },
  {
    id: 'p-quiz-3', type: 'quiz', topic: 'history',
    title: 'Which civilisation built Machu Picchu?',
    options: ['Maya', 'Aztec', 'Inca', 'Olmec'],
    answer: 2,
    explain: 'The Inca built Machu Picchu in the 15th century, high in the Andes of Peru.',
  },
  {
    id: 'p-quiz-4', type: 'quiz', topic: 'space',
    title: 'Which is the hottest planet in our solar system?',
    options: ['Mercury', 'Venus', 'Mars', 'Jupiter'],
    answer: 1,
    explain: 'Venus! Its thick CO₂ atmosphere traps heat, making it hotter than Mercury even though Mercury is closer to the Sun.',
  },
  {
    id: 'p-quiz-5', type: 'quiz', topic: 'math',
    title: 'The Monty Hall problem: if you switch doors, your chance of winning is…',
    options: ['1/3', '1/2', '2/3', '1'],
    answer: 2,
    explain: 'Switching wins 2/3 of the time, because your first pick was only right 1/3 of the time.',
  },
  {
    id: 'p-scramble-1', type: 'scramble', topic: 'science',
    title: 'Unscramble the word', word: 'GRAVITY',
    hint: 'The force that keeps the Moon in orbit',
  },
  {
    id: 'p-scramble-2', type: 'scramble', topic: 'history',
    title: 'Unscramble the word', word: 'PHARAOH',
    hint: 'A ruler of ancient Egypt',
  },
  {
    id: 'p-scramble-3', type: 'scramble', topic: 'nature',
    title: 'Unscramble the word', word: 'FOSSIL',
    hint: 'Preserved remains of ancient life',
  },
  {
    id: 'p-scramble-4', type: 'scramble', topic: 'space',
    title: 'Unscramble the word', word: 'ECLIPSE',
    hint: 'When the Moon blocks the Sun',
  },
  {
    id: 'p-sequence-1', type: 'sequence', topic: 'math',
    title: 'What comes next?', numbers: [1, 1, 2, 3, 5, 8],
    options: [11, 12, 13, 16], answer: 13,
    explain: 'Fibonacci: each number is the sum of the previous two (5 + 8 = 13).',
  },
  {
    id: 'p-sequence-2', type: 'sequence', topic: 'math',
    title: 'What comes next?', numbers: [2, 3, 5, 7, 11],
    options: [12, 13, 14, 15], answer: 13,
    explain: 'These are the prime numbers — numbers divisible only by 1 and themselves.',
  },
  {
    id: 'p-sequence-3', type: 'sequence', topic: 'math',
    title: 'What comes next?', numbers: [1, 4, 9, 16, 25],
    options: [30, 34, 36, 49], answer: 36,
    explain: 'Square numbers: 1², 2², 3², 4², 5², so next is 6² = 36.',
  },
  {
    id: 'p-memory-1', type: 'memory', topic: 'science',
    title: 'Match each symbol to its element',
    pairs: [['H', 'Hydrogen'], ['O', 'Oxygen'], ['Fe', 'Iron'], ['Au', 'Gold']],
  },
  {
    id: 'p-memory-2', type: 'memory', topic: 'tech',
    title: 'Match the inventor to the invention',
    pairs: [['Gutenberg', 'Printing press'], ['Wright brothers', 'Airplane'], ['Berners-Lee', 'World Wide Web'], ['Bell', 'Telephone']],
  },
  {
    id: 'p-slider-1', type: 'slider', topic: 'math',
    title: 'Slide the tiles into order 1–8',
  },
];
