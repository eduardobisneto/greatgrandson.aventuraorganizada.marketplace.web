import { Link, useRouterState } from "@tanstack/react-router";
import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { destinos, type Destino } from "@/data/destinos";

interface GrupoEstado {
  estado: string;
  sigla: string;
  destinos: Destino[];
}

interface GrupoPais {
  pais: string;
  estados: GrupoEstado[];
}

/**
 * Agrupa os destinos por País > Estado, no espírito do menu de destinos
 * dos concorrentes do setor — hoje só temos Brasil, mas a estrutura já
 * comporta outros países quando existirem.
 */
function agruparDestinos(): GrupoPais[] {
  const porPais = new Map<string, Map<string, GrupoEstado>>();

  for (const destino of destinos) {
    if (!porPais.has(destino.pais)) porPais.set(destino.pais, new Map());
    const estados = porPais.get(destino.pais)!;
    if (!estados.has(destino.estado.sigla)) {
      estados.set(destino.estado.sigla, {
        estado: destino.estado.nome,
        sigla: destino.estado.sigla,
        destinos: [],
      });
    }
    estados.get(destino.estado.sigla)!.destinos.push(destino);
  }

  return [...porPais.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pais, estados]) => ({
      pais,
      estados: [...estados.values()]
        .sort((a, b) => a.estado.localeCompare(b.estado))
        .map((grupo) => ({
          ...grupo,
          destinos: [...grupo.destinos].sort((a, b) =>
            a.nome.localeCompare(b.nome),
          ),
        })),
    }));
}

const GRUPOS = agruparDestinos();

function nomeCidade(nomeCompleto: string): string {
  return nomeCompleto.split(",")[0] ?? nomeCompleto;
}

export function DestinosNavDropdown({
  mobile,
  onNavigate,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
}) {
  const [aberto, setAberto] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const ref = useRef<HTMLDivElement>(null);
  const isActive = pathname.startsWith("/destinos");

  useEffect(() => {
    if (mobile) return;
    function handleClickFora(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAberto(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, [mobile]);

  function renderGrupos(onClickDestino: () => void) {
    return GRUPOS.map((grupoPais) => (
      <div key={grupoPais.pais}>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {grupoPais.pais}
        </p>
        <div className="mt-2 space-y-3">
          {grupoPais.estados.map((grupoEstado) => (
            <div key={grupoEstado.sigla}>
              <p className="text-xs font-semibold text-muted-foreground">
                {grupoEstado.estado}
              </p>
              <div className="mt-1 flex flex-col">
                {grupoEstado.destinos.map((destino) => (
                  <Link
                    key={destino.slug}
                    to="/destinos/$slug"
                    params={{ slug: destino.slug }}
                    onClick={onClickDestino}
                    className="rounded px-1.5 py-1 text-sm text-foreground transition-colors hover:bg-secondary hover:text-primary"
                  >
                    {nomeCidade(destino.nome)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    ));
  }

  if (mobile) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="flex w-full items-center justify-between text-base font-medium uppercase tracking-wide text-foreground"
        >
          Destinos
          <ChevronDown
            className={`h-4 w-4 transition-transform ${aberto ? "rotate-180" : ""}`}
          />
        </button>
        {aberto && (
          <div className="mt-3 space-y-4 border-l-2 border-border pl-4">
            {renderGrupos(() => onNavigate?.())}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium uppercase tracking-wide transition-colors ${
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        Destinos
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto && (
        <div className="absolute left-0 top-full mt-2 w-72 space-y-4 rounded-xl border border-border bg-background p-4 shadow-lg">
          {renderGrupos(() => setAberto(false))}
        </div>
      )}
    </div>
  );
}
