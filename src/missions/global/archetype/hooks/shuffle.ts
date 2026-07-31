import { ArchetypeStep } from '../archetype-questionnaire.config';

// Deterministic PRNG (mulberry32) — same seed always yields the same sequence,
// so the shuffled step order survives refresh as long as the seed is persisted.
function mulberry32(seed: number): () => number {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleStepsWithSeed(steps: ArchetypeStep[], seed: number): ArchetypeStep[] {
  const rng = mulberry32(seed);
  const result = [...steps];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
