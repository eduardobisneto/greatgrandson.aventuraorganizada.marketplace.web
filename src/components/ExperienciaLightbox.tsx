import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Gauge,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { Experiencia } from "@/data/experiencias";

/**
 * Lightbox pra ver uma experiência sem sair da página do destino — abrir
 * "Trilhas" ou "Flutuação" a partir do roteiro de um destino não deve
 * mandar o cliente pra página genérica da experiência (que fala da
 * atividade em geral, não desse destino específico). Em vez disso, abre
 * por cima da própria página, com as setas navegando só entre as
 * experiências DESSE destino — um carrossel de um card só, onde o card é
 * o próprio conteúdo do lightbox.
 */
export function ExperienciaLightbox({
  experiencias,
  indiceInicial,
  onClose,
}: {
  experiencias: Experiencia[];
  indiceInicial: number;
  onClose: () => void;
}) {
  const [indice, setIndice] = useState(indiceInicial);
  const experiencia = experiencias[indice];

  useEffect(() => {
    const overflowOriginal = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") navegar(-1);
      if (e.key === "ArrowRight") navegar(1);
    }
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = overflowOriginal;
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function navegar(direcao: 1 | -1) {
    setIndice(
      (atual) => (atual + direcao + experiencias.length) % experiencias.length,
    );
  }

  if (!experiencia) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-950/80 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={experiencia.titulo}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="absolute right-4 top-4 inline-flex rounded-full bg-sand-50/10 p-2 text-sand-50 backdrop-blur-sm transition-colors hover:bg-sand-50/20"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative w-full max-w-3xl overflow-hidden rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] sm:aspect-[16/9]">
          {experiencia.imagem ? (
            <img
              src={experiencia.imagem}
              alt={experiencia.alt ?? experiencia.titulo}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-forest-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/95 via-forest-900/50 to-forest-900/10" />

          <div className="absolute bottom-0 left-0 right-0 p-6 text-sand-50 sm:p-8">
            <h2 className="font-display text-2xl sm:text-3xl">
              {experiencia.titulo}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-forest-100 sm:text-base">
              {experiencia.descricao}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-50/15 px-3 py-1.5 backdrop-blur-sm">
                <Gauge className="h-3.5 w-3.5" />
                {experiencia.contexto.nivel}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-50/15 px-3 py-1.5 backdrop-blur-sm">
                <Users className="h-3.5 w-3.5" />
                {experiencia.contexto.faixaEtaria}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-50/15 px-3 py-1.5 backdrop-blur-sm">
                <CalendarDays className="h-3.5 w-3.5" />
                {experiencia.contexto.epocaResumo}
              </span>
            </div>
          </div>
        </div>

        {experiencias.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => navegar(-1)}
              aria-label="Experiência anterior"
              className="absolute left-2 top-1/2 inline-flex -translate-y-1/2 rounded-full border border-sand-50/30 bg-forest-900/40 p-2 text-sand-50 backdrop-blur-sm transition-colors hover:bg-forest-900/60 sm:left-4"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => navegar(1)}
              aria-label="Próxima experiência"
              className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-full border border-sand-50/30 bg-forest-900/40 p-2 text-sand-50 backdrop-blur-sm transition-colors hover:bg-forest-900/60 sm:right-4"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
