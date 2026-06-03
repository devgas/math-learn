import { difficultyConfig } from "@/config/game";
import type { Difficulty, Topic } from "@/types/app";

function seededValue(seed: number, salt: number, max: number) {
  const value = Math.sin(seed * 97 + salt * 31) * 10000;
  return Math.max(1, Math.floor((value - Math.floor(value)) * max));
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
  if (topic === "fractions") return { prompt: `1/${b} + 1/${b}`, answer: `2/${b}` };
  if (topic === "geometry") return { prompt: `Square side ${b}. Area?`, answer: b * b };
  if (topic === "logic") return { prompt: `${a}, ${a + b}, ${a + b * 2}, ?`, answer: a + b * 3 };
  return { prompt: `${a} + ${b}`, answer: a + b };
}

export function xpForWin(difficulty: Difficulty, streak: number) {
  return Math.round(100 * difficultyConfig[difficulty].multiplier + streak * 8);
}
