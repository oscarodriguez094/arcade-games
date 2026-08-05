import { CATS } from "../data";

export async function getCategories(): Promise<string[]> {
  return Promise.resolve([...CATS]);
}
