import { GAMES } from "../data";
import type { Game } from "../types";

export async function getGames(): Promise<Game[]> {
  return Promise.resolve([...GAMES]);
}

export async function getGameById(id: string): Promise<Game | null> {
  return Promise.resolve(GAMES.find((g) => g.id === id) ?? null);
}
