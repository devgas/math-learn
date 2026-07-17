import { difficultyConfig } from "@/config/game";
import type { Difficulty, Topic } from "@/types/app";

type Equation = {
  prompt: string;
  answer: string | number;
};

function seededUnit(seed: number, salt: number) {
  const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

function rangeValue(seed: number, salt: number, min: number, max: number) {
  return Math.floor(seededUnit(seed, salt) * (max - min + 1)) + min;
}

function gcd(a: number, b: number): number {
  return b === 0 ? Math.abs(a) : gcd(b, a % b);
}

function simplifyFraction(numerator: number, denominator: number) {
  const divisor = gcd(numerator, denominator);
  const simplifiedNumerator = numerator / divisor;
  const simplifiedDenominator = denominator / divisor;
  return simplifiedDenominator === 1 ? String(simplifiedNumerator) : `${simplifiedNumerator}/${simplifiedDenominator}`;
}

function additionEquation(difficulty: Difficulty, round: number, salt: number): Equation {
  if (difficulty === "easy") {
    const a = rangeValue(round, salt, 1, 10);
    const b = rangeValue(round + 3, salt, 1, 10);
    return { prompt: `${a} + ${b}`, answer: a + b };
  }

  if (difficulty === "medium") {
    const a = rangeValue(round, salt, 10, 80);
    const b = rangeValue(round + 3, salt, 10, 80);
    return { prompt: `${a} + ${b}`, answer: a + b };
  }

  const a = rangeValue(round, salt, 100, 500);
  const b = rangeValue(round + 3, salt, 100, 500);
  return { prompt: `${a} + ${b}`, answer: a + b };
}

function subtractionEquation(difficulty: Difficulty, round: number, salt: number): Equation {
  const ranges = {
    easy: { min: 1, max: 20, deltaMax: 10 },
    medium: { min: 20, max: 150, deltaMax: 80 },
    hard: { min: 150, max: 700, deltaMax: 350 }
  } satisfies Record<Difficulty, { min: number; max: number; deltaMax: number }>;
  const range = ranges[difficulty];
  const a = rangeValue(round, salt, range.min, range.max);
  const b = rangeValue(round + 3, salt, 1, Math.min(range.deltaMax, a));
  return { prompt: `${a} - ${b}`, answer: a - b };
}

function multiplicationEquation(difficulty: Difficulty, round: number, salt: number): Equation {
  const ranges = {
    easy: { left: [2, 5], right: [2, 10] },
    medium: { left: [6, 12], right: [3, 12] },
    hard: { left: [11, 25], right: [6, 25] }
  } satisfies Record<Difficulty, { left: [number, number]; right: [number, number] }>;
  const range = ranges[difficulty];
  const left = rangeValue(round, salt, range.left[0], range.left[1]);
  const right = rangeValue(round + 3, salt, range.right[0], range.right[1]);
  return { prompt: `${left} x ${right}`, answer: left * right };
}

function divisionEquation(difficulty: Difficulty, round: number, salt: number): Equation {
  const ranges = {
    easy: { divisor: [2, 5], quotient: [2, 10] },
    medium: { divisor: [3, 12], quotient: [4, 20] },
    hard: { divisor: [6, 25], quotient: [10, 40] }
  } satisfies Record<Difficulty, { divisor: [number, number]; quotient: [number, number] }>;
  const range = ranges[difficulty];
  const divisor = rangeValue(round + 3, salt, range.divisor[0], range.divisor[1]);
  const quotient = rangeValue(round, salt, range.quotient[0], range.quotient[1]);
  return { prompt: `${divisor * quotient} / ${divisor}`, answer: quotient };
}

function fractionsEquation(difficulty: Difficulty, round: number, salt: number): Equation {
  if (difficulty === "easy") {
    const denominator = rangeValue(round, salt, 2, 8);
    const n1 = rangeValue(round + 1, salt, 1, Math.max(1, denominator - 2));
    const n2 = rangeValue(round + 2, salt, 1, Math.max(1, denominator - n1 - 1));
    return { prompt: `${n1}/${denominator} + ${n2}/${denominator}`, answer: simplifyFraction(n1 + n2, denominator) };
  }

  if (difficulty === "medium") {
    const denominator = rangeValue(round, salt, 4, 12);
    const n1 = rangeValue(round + 1, salt, 1, denominator - 1);
    const n2 = rangeValue(round + 2, salt, 1, denominator - 1);
    return { prompt: `${n1}/${denominator} + ${n2}/${denominator}`, answer: simplifyFraction(n1 + n2, denominator) };
  }

  const d1 = rangeValue(round, salt, 3, 10);
  const d2 = rangeValue(round + 3, salt, 4, 12);
  const n1 = rangeValue(round + 1, salt, 1, d1 - 1);
  const n2 = rangeValue(round + 2, salt, 1, d2 - 1);
  return { prompt: `${n1}/${d1} + ${n2}/${d2}`, answer: simplifyFraction(n1 * d2 + n2 * d1, d1 * d2) };
}

function geometryEquation(difficulty: Difficulty, round: number, salt: number): Equation {
  if (difficulty === "easy") {
    const side = rangeValue(round, salt, 2, 10);
    return { prompt: `Square side ${side}. Area?`, answer: side * side };
  }

  if (difficulty === "medium") {
    const width = rangeValue(round, salt, 3, 15);
    const height = rangeValue(round + 3, salt, 3, 15);
    return { prompt: `Rectangle ${width} x ${height}. Area?`, answer: width * height };
  }

  const width = rangeValue(round, salt, 8, 30);
  const height = rangeValue(round + 3, salt, 8, 30);
  return { prompt: `Rectangle ${width} x ${height}. Perimeter?`, answer: 2 * (width + height) };
}

function logicEquation(difficulty: Difficulty, round: number, salt: number): Equation {
  if (difficulty === "easy") {
    const start = rangeValue(round, salt, 1, 20);
    const step = rangeValue(round + 3, salt, 2, 8);
    return { prompt: `${start}, ${start + step}, ${start + step * 2}, ?`, answer: start + step * 3 };
  }

  if (difficulty === "medium") {
    const start = rangeValue(round, salt, 2, 20);
    const firstStep = rangeValue(round + 3, salt, 2, 6);
    return { prompt: `${start}, ${start + firstStep}, ${start + firstStep * 2 + 1}, ?`, answer: start + firstStep * 3 + 3 };
  }

  const start = rangeValue(round, salt, 2, 9);
  const factor = rangeValue(round + 3, salt, 2, 4);
  return { prompt: `${start}, ${start * factor}, ${start * factor * factor}, ?`, answer: start * factor * factor * factor };
}

function timedEquation(difficulty: Difficulty, round: number, salt: number): Equation {
  const pools = {
    easy: ["addition", "subtraction"] as Topic[],
    medium: ["addition", "subtraction", "multiplication", "division"] as Topic[],
    hard: ["multiplication", "division", "fractions", "logic"] as Topic[]
  } satisfies Record<Difficulty, Topic[]>;
  const pool = pools[difficulty];
  const topic = pool[rangeValue(round, salt, 0, pool.length - 1)];
  return makeEquation(topic, difficulty, round);
}

export function makeEquation(topic: Topic, difficulty: Difficulty, round = 1, missionSeed = 0) {
  const topicSalt = topic.length + missionSeed * 17;
  if (topic === "addition") return additionEquation(difficulty, round, topicSalt);
  if (topic === "subtraction") return subtractionEquation(difficulty, round, topicSalt);
  if (topic === "multiplication") return multiplicationEquation(difficulty, round, topicSalt);
  if (topic === "division") return divisionEquation(difficulty, round, topicSalt);
  if (topic === "fractions") return fractionsEquation(difficulty, round, topicSalt);
  if (topic === "geometry") return geometryEquation(difficulty, round, topicSalt);
  if (topic === "logic") return logicEquation(difficulty, round, topicSalt);
  if (topic === "timed") return timedEquation(difficulty, round, topicSalt);
  return additionEquation(difficulty, round, topicSalt);
}

export function xpForWin(difficulty: Difficulty, streak: number) {
  return Math.round(100 * difficultyConfig[difficulty].multiplier + streak * 8);
}
