// ── Utility helpers ───────────────────────────────────────────────────────
export const rnd  = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
export const pick = arr   => arr[Math.floor(Math.random() * arr.length)];

export function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
export function lcm(a, b) { return (a * b) / gcd(a, b); }

export function primeFactors(n) {
  const f = new Set(); let d = 2;
  while (d * d <= n) { while (n % d === 0) { f.add(d); n /= d; } d++; }
  if (n > 1) f.add(n);
  return [...f];
}

// ── Problem generators ────────────────────────────────────────────────────
// Each receives a tier (0–3) and returns: { q, ans, hint, cat }
// Tier increases every 5 correct answers: tier = min(floor(solved/5), 3)

export const generators = [

  // Addition
  (tier) => {
    const ranges = [
      [[10, 50],   [10, 50]],    // tier 0
      [[35, 150],  [35, 150]],   // tier 1
      [[100, 499], [50, 299]],   // tier 2
      [[300, 999], [200, 699]],  // tier 3
    ];
    const [[aLo, aHi], [bLo, bHi]] = ranges[tier];
    const a = rnd(aLo, aHi), b = rnd(bLo, bHi);
    return { q: `${a} + ${b}`, ans: a + b, hint: 'Find the sum', cat: 'Addition' };
  },

  // Subtraction
  (tier) => {
    const ranges = [
      [[30, 100],  [10, 25]],     // tier 0
      [[100, 300], [30, 90]],     // tier 1
      [[150, 499], [50, 140]],    // tier 2
      [[400, 999], [100, 350]],   // tier 3
    ];
    const [[aLo, aHi], [bLo, bHi]] = ranges[tier];
    const a = rnd(aLo, aHi), b = rnd(bLo, bHi);
    return { q: `${a} − ${b}`, ans: a - b, hint: 'Find the difference', cat: 'Subtraction' };
  },

  // Multiplication
  (tier) => {
    const ranges = [
      [[2, 5],   [2, 9]],    // tier 0: times tables
      [[6, 9],   [6, 15]],   // tier 1
      [[6, 12],  [12, 30]],  // tier 2
      [[11, 19], [11, 19]],  // tier 3
    ];
    const [[aLo, aHi], [bLo, bHi]] = ranges[tier];
    const a = rnd(aLo, aHi), b = rnd(bLo, bHi);
    return { q: `${a} × ${b}`, ans: a * b, hint: 'Find the product', cat: 'Multiplication' };
  },

  // Division
  (tier) => {
    const params = [
      [2, 9,  2, 5],   // tier 0: ans 2–9, divisor 2–5
      [6, 30, 2, 7],   // tier 1
      [12, 60, 3, 9],  // tier 2
      [20, 99, 4, 12], // tier 3
    ];
    const [ansLo, ansHi, divLo, divHi] = params[tier];
    const ans = rnd(ansLo, ansHi), div = rnd(divLo, divHi);
    return { q: `${ans * div} ÷ ${div}`, ans, hint: 'Find the quotient', cat: 'Division' };
  },

  // Squares
  (tier) => {
    const ranges = [[2, 9], [9, 15], [13, 20], [18, 25]];
    const [lo, hi] = ranges[tier];
    const n = rnd(lo, hi);
    return { q: `${n}²  =  ?`, ans: n * n, hint: `What is ${n} squared?`, cat: 'Squares' };
  },

  // Square roots
  (tier) => {
    const ranges = [[2, 9], [9, 15], [13, 20], [18, 25]];
    const [lo, hi] = ranges[tier];
    const n = rnd(lo, hi);
    return { q: `√${n * n}  =  ?`, ans: n, hint: 'Find the square root', cat: 'Square Roots' };
  },

  // Cubes
  (tier) => {
    const ranges = [[2, 5], [3, 7], [5, 9], [7, 12]];
    const [lo, hi] = ranges[tier];
    const n = rnd(lo, hi);
    return { q: `${n}³  =  ?`, ans: n ** 3, hint: `What is ${n} cubed?`, cat: 'Cubes' };
  },

  // Cube roots
  (tier) => {
    const ranges = [[2, 5], [3, 7], [5, 9], [7, 12]];
    const [lo, hi] = ranges[tier];
    const n = rnd(lo, hi);
    return { q: `∛${n ** 3}  =  ?`, ans: n, hint: 'Find the cube root', cat: 'Cube Roots' };
  },

  // HCF
  (tier) => {
    const configs = [
      { gRange: [2, 6],  pairs: [[2,3],[2,5],[3,4],[2,7]] },
      { gRange: [3, 10], pairs: [[2,3],[2,5],[3,5],[2,7],[3,4]] },
      { gRange: [4, 15], pairs: [[2,3],[2,5],[3,5],[2,7],[3,7],[4,5]] },
      { gRange: [6, 25], pairs: [[2,3],[2,5],[3,5],[2,7],[3,7],[4,5],[3,4],[5,7]] },
    ];
    const { gRange, pairs } = configs[tier];
    const g = rnd(gRange[0], gRange[1]);
    const [p, q] = pick(pairs);
    return {
      q:    `HCF of ${p * g} and ${q * g}`,
      ans:  gcd(p * g, q * g),
      hint: 'Highest Common Factor',
      cat:  'HCF',
    };
  },

  // LCM
  (tier) => {
    const sets = [
      [[2,3],[2,4],[3,4],[2,6],[4,6]],
      [[3,4],[4,6],[6,8],[4,5],[5,6]],
      [[6,9],[8,12],[6,10],[4,9],[5,8],[6,7]],
      [[8,9],[9,12],[10,12],[4,15],[6,14],[8,10],[5,12]],
    ];
    const [a, b] = pick(sets[tier]);
    return { q: `LCM of ${a} and ${b}`, ans: lcm(a, b), hint: 'Lowest Common Multiple', cat: 'LCM' };
  },

  // Prime factors (largest)
  (tier) => {
    const configs = [
      { primes: [2, 3, 5, 7],         smalls: [2, 3] },
      { primes: [7, 11, 13],           smalls: [2, 3, 5] },
      { primes: [11, 13, 17, 19],      smalls: [2, 3, 5, 7] },
      { primes: [17, 19, 23, 29, 31],  smalls: [2, 3, 5, 7] },
    ];
    const { primes, smalls } = configs[tier];
    const n = pick(primes) * pick(smalls);
    return {
      q:    `Largest prime factor of ${n}`,
      ans:  Math.max(...primeFactors(n)),
      hint: 'Break into prime factors first',
      cat:  'Prime Factors',
    };
  },

  // Percentages
  (tier) => {
    const sets = [
      [[10,20],[10,40],[10,60],[25,20],[25,40],[50,20],[50,40]],
      [[10,150],[15,60],[15,80],[20,65],[25,60],[25,80],[50,86]],
      [[10,240],[15,120],[20,85],[20,125],[25,120],[25,160],[30,70]],
      [[15,160],[20,145],[25,180],[30,90],[30,120],[35,80],[40,75],[75,80]],
    ];
    const [p, n] = pick(sets[tier]);
    return {
      q:    `${p}% of ${n}  =  ?`,
      ans:  Math.round(p * n / 100),
      hint: 'Find the percentage value',
      cat:  'Percentages',
    };
  },
];

/**
 * Pick a random problem, avoiding the same category twice in a row.
 * @param {string} prevCat
 * @param {number} solved  — number of correct answers so far (drives difficulty)
 * @returns {{ q, ans, hint, cat }}
 */
export function pickProblem(prevCat, solved = 0) {
  const tier = Math.min(Math.floor(solved / 5), 3);
  let gen, prob, tries = 0;
  do {
    gen  = pick(generators);
    prob = gen(tier);
    tries++;
  } while (prob.cat === prevCat && tries < 8);
  return prob;
}

// ── Seeded question generation (for multiplayer sync) ─────────────────────

/**
 * Mulberry32 — fast, high-quality 32-bit seeded PRNG.
 */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pre-generate a fixed sequence of questions from a seed (multiplayer).
 */
export function generateSeededQuestions(seed, count = 300) {
  const rng = mulberry32(seed);
  const saved = Math.random;
  Math.random = rng;
  const questions = [];
  let prevCat = '';
  for (let i = 0; i < count; i++) {
    const prob = pickProblem(prevCat, i);  // difficulty scales through the session
    questions.push(prob);
    prevCat = prob.cat;
  }
  Math.random = saved;
  return questions;
}
