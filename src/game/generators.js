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
// Each returns: { q: string, ans: number, hint: string, cat: string }

export const generators = [
  // Addition
  () => {
    const type = rnd(0, 1);
    const [a, b] = type === 0
      ? [rnd(35, 99),  rnd(35, 99)]
      : [rnd(100, 499), rnd(50, 299)];
    return { q: `${a} + ${b}`, ans: a + b, hint: 'Find the sum', cat: 'Addition' };
  },

  // Subtraction
  () => {
    const type = rnd(0, 1);
    const [a, b] = type === 0
      ? [rnd(150, 499), rnd(50, 140)]
      : [rnd(400, 999), rnd(100, 350)];
    const safe = Math.max(a, b);
    const diff = Math.min(a, b);
    return { q: `${safe} − ${diff}`, ans: safe - diff, hint: 'Find the difference', cat: 'Subtraction' };
  },

  // Multiplication
  () => {
    const type = rnd(0, 1);
    const [a, b] = type === 0
      ? [rnd(6, 9),   rnd(12, 50)]
      : [rnd(11, 19), rnd(11, 19)];
    return { q: `${a} × ${b}`, ans: a * b, hint: 'Find the product', cat: 'Multiplication' };
  },

  // Division
  () => {
    const ans = rnd(12, 80), div = rnd(3, 9);
    return { q: `${ans * div} ÷ ${div}`, ans, hint: 'Find the quotient', cat: 'Division' };
  },

  // Squares
  () => {
    const n = rnd(11, 25);
    return { q: `${n}²  =  ?`, ans: n * n, hint: `What is ${n} squared?`, cat: 'Squares' };
  },

  // Square roots
  () => {
    const n = rnd(11, 25);
    return { q: `√${n * n}  =  ?`, ans: n, hint: 'Find the square root', cat: 'Square Roots' };
  },

  // Cubes
  () => {
    const n = rnd(3, 10);
    return { q: `${n}³  =  ?`, ans: n ** 3, hint: `What is ${n} cubed?`, cat: 'Cubes' };
  },

  // Cube roots
  () => {
    const n = rnd(3, 10);
    return { q: `∛${n ** 3}  =  ?`, ans: n, hint: 'Find the cube root', cat: 'Cube Roots' };
  },

  // HCF
  () => {
    const g = rnd(4, 18);
    const [p, q] = pick([[2,3],[2,5],[3,5],[2,7],[3,7],[4,5],[3,4],[5,7]]);
    return {
      q:    `HCF of ${p * g} and ${q * g}`,
      ans:  gcd(p * g, q * g),
      hint: 'Highest Common Factor',
      cat:  'HCF',
    };
  },

  // LCM
  () => {
    const [a, b] = pick([[3,4],[4,6],[6,8],[4,5],[5,6],[6,9],[8,12],[6,10],[4,9],[5,8],[6,7],[8,9],[9,12],[10,12],[4,15],[6,14],[8,10],[5,12]]);
    return { q: `LCM of ${a} and ${b}`, ans: lcm(a, b), hint: 'Lowest Common Multiple', cat: 'LCM' };
  },

  // Prime factors (largest)
  () => {
    const primes = [11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
    const small  = [2, 3, 5, 7];
    const n = pick(primes) * pick(small);
    return {
      q:    `Largest prime factor of ${n}`,
      ans:  Math.max(...primeFactors(n)),
      hint: 'Break into prime factors first',
      cat:  'Prime Factors',
    };
  },

  // Percentages
  () => {
    const [p, n] = pick([
      [10,150],[10,240],[10,350],[15,60],[15,80],[15,120],[20,65],[20,85],[20,125],
      [25,60],[25,80],[25,120],[25,160],[30,70],[30,90],[50,86],[50,144],[75,80],[75,120],
    ]);
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
 * @returns {{ q, ans, hint, cat }}
 */
export function pickProblem(prevCat) {
  let gen, prob, tries = 0;
  do {
    gen  = pick(generators);
    prob = gen();
    tries++;
  } while (prob.cat === prevCat && tries < 8);
  return prob;
}

// ── Seeded question generation (for multiplayer sync) ─────────────────────

/**
 * Mulberry32 — fast, high-quality 32-bit seeded PRNG.
 * Returns a function that produces [0, 1) floats from the given seed.
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
 * Pre-generate a fixed sequence of questions from a seed.
 * All clients using the same seed will get the exact same questions in order.
 * @param {number} seed
 * @param {number} count
 * @returns {Array<{ q, ans, hint, cat }>}
 */
export function generateSeededQuestions(seed, count = 300) {
  const rng = mulberry32(seed);
  const saved = Math.random;
  Math.random = rng;
  const questions = [];
  let prevCat = '';
  for (let i = 0; i < count; i++) {
    const prob = pickProblem(prevCat);
    questions.push(prob);
    prevCat = prob.cat;
  }
  Math.random = saved;
  return questions;
}
