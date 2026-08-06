"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GameCard } from "@/components/game-card";
import { getGames, getCategories } from "@/lib/services";
import type { Game } from "@/lib/types";

export default function BibliotecaPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [cats, setCats] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("TODOS");

  useEffect(() => {
    getGames().then(setGames);
    getCategories().then(setCats);
  }, []);

  const filtered = useMemo(
    () =>
      games.filter(
        (g) =>
          (cat === "TODOS" || g.cat === cat) &&
          g.title.toLowerCase().includes(q.toLowerCase())
      ),
    [games, q, cat]
  );

  return (
    <div className="fade-in">
      <section className="av-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className="sub">
          INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
        </div>
      </section>

      <div className="av-filters">
        <div className="av-search">
          <span className="ico">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar un juego por nombre…"
          />
        </div>
        <div className="av-chips">
          {cats.map((c) => (
            <button
              key={c}
              className={"chip" + (cat === c ? " active" : "")}
              onClick={() => setCat(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="av-grid">
        {filtered.map((g) => (
          <GameCard
            key={g.id}
            game={g}
            onSelect={(game) => router.push(`/game/${game.id}`)}
          />
        ))}
        {filtered.length === 0 && games.length > 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              textAlign: "center",
              padding: 80,
              color: "var(--ink-faint)",
            }}
          >
            <div
              className="pixel"
              style={{ fontSize: 14, color: "var(--magenta)", marginBottom: 12 }}
            >
              NO HAY RESULTADOS
            </div>
            <div>Intenta otra búsqueda o categoría.</div>
          </div>
        )}
      </div>
    </div>
  );
}
