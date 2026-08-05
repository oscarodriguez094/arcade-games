import type { UserScoreEntry } from "../types";

export async function getUserScores(): Promise<UserScoreEntry[]> {
  try {
    return JSON.parse(localStorage.getItem("av_scores") || "[]");
  } catch {
    return [];
  }
}

export async function saveUserScore(
  entry: Omit<UserScoreEntry, "at">
): Promise<void> {
  try {
    const all: UserScoreEntry[] = JSON.parse(
      localStorage.getItem("av_scores") || "[]"
    );
    all.push({ ...entry, at: Date.now() });
    localStorage.setItem("av_scores", JSON.stringify(all));
  } catch {
    // localStorage not available
  }
}
