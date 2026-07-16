import { difficultyConfig } from "@/config/game";
import type { Difficulty, Topic } from "@/types/app";

function seededValue(seed: number, salt: number, max: number) {
  const x = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
  const frac = x - Math.floor(x);
  return Math.max(1, Math.floor(frac * max) + 1);
}

export function makeEquation(topic: Topic, difficulty: Difficulty, round = 1) {
  const { max } = difficultyConfig[difficulty];
  const topicSalt = topic.length;
  const a = seededValue(round, topicSalt, max);
  const b = seededValue(round + 3, topicSalt, Math.min(max, 20));

  if (topic === "subtraction") return { prompt: `${a} - ${Math.min(a, b)}`, answer: a - Math.min(a, b) };
  if (topic === "multiplication") {
    const left = difficulty === "easy" ? ((a - 1) % 10) + 1 : a % 13;
    const right = difficulty === "easy" ? ((b - 1) % 10) + 1 : b % 13;
    return { prompt: `${left} x ${right}`, answer: left * right };
  }
  if (topic === "division") {
    if (difficulty === "easy") {
      const divisor = ((b - 1) % 10) + 1;
      const quotient = ((a - 1) % 10) + 1;
      return { prompt: `${divisor * quotient} / ${divisor}`, answer: quotient };
    }
    return { prompt: `${a * b} / ${b}`, answer: a };
  }
  if (topic === "fractions") {
    const denom = b;
    const n1 = ((a - 1) % 3) + 1;
    const n2 = ((b - 1) % 3) + 1;
    return { prompt: `${n1}/${denom} + ${n2}/${denom}`, answer: `${n1 + n2}/${denom}` };
  }
  if (topic === "geometry") return { prompt: `Square side ${b}. Area?`, answer: b * b };
  if (topic === "logic") return { prompt: `${a}, ${a + b}, ${a + b * 2}, ?`, answer: a + b * 3 };
  if (topic === "timed") {
    const r = (round + a + b) % 3;
    if (r === 0) return { prompt: `${a} + ${b}`, answer: a + b };
    if (r === 1) return { prompt: `${a} - ${Math.min(a, b)}`, answer: a - Math.min(a, b) };
    return { prompt: `${((a - 1) % 10) + 1} x ${((b - 1) % 10) + 1}`, answer: (((a - 1) % 10) + 1) * (((b - 1) % 10) + 1) };
  }
  return { prompt: `${a} + ${b}`, answer: a + b };
}

export function xpForWin(difficulty: Difficulty, streak: number) {
  return Math.round(100 * difficultyConfig[difficulty].multiplier + streak * 8);
}
