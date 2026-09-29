import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight, MapPin } from "lucide-react";

import { destinos } from "@/data/destinos";

const AUTO_PLAY_MS = 6000;

export function Hero() {
  const [index, setIndex] = useState(0);
  const destino = destinos[index] ?? destinos[0]!;

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((current) => (current + 1) % destinos.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(id);
  }, []);

  function goTo(next: number) {
    setIndex(((next % destinos.length) + destinos.length) % destinos.length);
  }

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        {destinos.map((d, i) => (
          <img
            key={d.slug}
            src={d.imagem}
            alt={d.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-in-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            width={1920}
            height={1088}
            fetchPriority={i === 0 ? "high" : undefined}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-forest-900/70 via-forest-900/40 to-forest-900/10" />
      </div>

      <div className="container-tight relative flex min-h-[80vh] flex-col justify-center py-20 md:min-h-[85vh]">
        <div className="mx-8 max-w-2xl space-y-6 text-sand-50 sm:mx-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-forest-800/60 px-4 py-2 text-sm font-medium uppercase tracking-wide backdrop-blur-sm">
            <MapPin className="h-4 w-4 text-forest-300" />
            <span>{destino.nome}</span>
          </div>

          <h1 className="text-balance text-4xl leading-[1.1] md:text-6xl lg:text-7xl">
            Sua aventura organizada do início ao fim
          </h1>

          <p className="max-w-xl text-balance text-lg leading-relaxed text-forest-100 md:text-xl">
            {destino.descricao}
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link
              to="/destinos/$slug"
              params={{ slug: destino.slug }}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-all hover:bg-primary/90"
            >
              Conhecer {destino.nome.split(",")[0]}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/planejar-viagem"
              search={{ planoId: undefined, step: undefined }}
              className="inline-flex items-center gap-2 rounded-full border border-sand-50/30 bg-sand-50/10 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-sand-50 backdrop-blur-sm transition-all hover:bg-sand-50/20"
            >
              Planejar minha viagem
            </Link>
          </div>

          <Link
            to="/destinos"
            className="inline-flex items-center gap-2 text-sm font-medium uppercase tracking-wide text-sand-50/90 underline-offset-4 transition-colors hover:text-sand-50 hover:underline"
          >
            Ver todos os destinos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Destino anterior"
        className="absolute left-2 top-1/2 inline-flex -translate-y-1/2 rounded-full bg-sand-50/10 p-1.5 text-sand-50 backdrop-blur-sm transition-colors hover:bg-sand-50/20 sm:left-4 sm:p-2 lg:left-8"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Próximo destino"
        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-full bg-sand-50/10 p-1.5 text-sand-50 backdrop-blur-sm transition-colors hover:bg-sand-50/20 sm:right-4 sm:p-2 lg:right-8"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {destinos.map((d, i) => (
          <button
            key={d.slug}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Ver ${d.nome}`}
            aria-current={i === index}
            className={`h-2 rounded-full transition-all ${
              i === index ? "w-6 bg-sand-50" : "w-2 bg-sand-50/40"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
