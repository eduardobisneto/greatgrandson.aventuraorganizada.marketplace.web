import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { useState, type MouseEvent } from "react";

interface DestinoCardProps {
  slug: string;
  nome: string;
  tagline: string;
  descricao: string;
  imagem: string;
  /** Quando presente (2+ itens), substitui `imagem` e vira um carrossel de fotos dentro do card. */
  imagens?: string[] | undefined;
  alt: string;
  duracao: string;
  grupo: string;
}

export function DestinoCard({
  slug,
  nome,
  tagline,
  descricao,
  imagem,
  imagens,
  alt,
  duracao,
  grupo,
}: DestinoCardProps) {
  const fotos = imagens && imagens.length > 0 ? imagens : [imagem];
  const [indice, setIndice] = useState(0);
  const temCarrossel = fotos.length > 1;

  function navegar(e: MouseEvent, direcao: 1 | -1) {
    e.preventDefault();
    e.stopPropagation();
    setIndice((atual) => (atual + direcao + fotos.length) % fotos.length);
  }

  return (
    <Link
      to="/destinos/$slug"
      params={{ slug }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={fotos[indice]}
          alt={alt}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          width={1024}
          height={768}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 to-transparent" />
        {temCarrossel && (
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
            <button
              type="button"
              aria-label="Foto anterior"
              onClick={(e) => navegar(e, -1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-900/50 text-sand-50 backdrop-blur-sm transition-colors hover:bg-forest-900/70"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Próxima foto"
              onClick={(e) => navegar(e, 1)}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-forest-900/50 text-sand-50 backdrop-blur-sm transition-colors hover:bg-forest-900/70"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="font-display text-2xl text-sand-50">{nome}</h3>
          <p className="text-sm text-forest-100">{tagline}</p>
          {temCarrossel && (
            <div className="mt-2 flex gap-1.5">
              {fotos.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === indice ? "w-4 bg-sand-50" : "w-1 bg-sand-50/50"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted-foreground">
          {descricao}
        </p>

        <div className="mb-6 flex flex-wrap gap-4 text-xs font-medium text-foreground">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
            <CalendarDays className="h-3.5 w-3.5 text-primary" />
            {duracao}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
            <Users className="h-3.5 w-3.5 text-primary" />
            {grupo}
          </span>
        </div>

        <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary transition-colors group-hover:text-primary/80">
          Ver roteiro
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
