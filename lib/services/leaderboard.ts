import { seededScores } from "../data";
import type { ScoreRow } from "../types";

export async function getLeaderboard(gameId: string, count = 12): Promise<ScoreRow[]> {
  return Promise.resolve(seededScores(gameId.length * 23 + 7, count));
}
