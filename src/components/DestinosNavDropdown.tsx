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
  transparente,
}: {
  mobile?: boolean;
  onNavigate?: () => void;
  /** Header flutuando sobre um hero — texto claro, mesmo quando não ativo (variante desktop apenas). */
  transparente?: boolean;
}) {
  const [aberto, setAberto] = useState(false);
  const [paisAtivo, setPaisAtivo] = useState(GRUPOS[0]?.pais);
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

  /**
   * Lista de estados > cidades de UM país — usada tanto empilhada (mobile,
   * um bloco por país) quanto na coluna da direita do painel desktop
   * (só do país ativo, ao estilo "duas colunas" do concorrente).
   */
  function renderEstados(
    grupoPais: GrupoPais | undefined,
    onClickDestino: () => void,
    variante: "claro" | "escuro" = "claro",
  ) {
    if (!grupoPais) return null;
    const corEstado =
      variante === "escuro" ? "text-white/90" : "text-muted-foreground";
    const corCidade =
      variante === "escuro"
        ? "text-white hover:bg-white/25 hover:text-white"
        : "text-foreground hover:bg-secondary hover:text-primary";

    return (
      <div className="space-y-3">
        {grupoPais.estados.map((grupoEstado) => (
          <div key={grupoEstado.sigla}>
            <p className={`text-xs font-semibold ${corEstado}`}>
              {grupoEstado.estado}
            </p>
            <div className="mt-1 flex flex-col">
              {grupoEstado.destinos.map((destino) => (
                <Link
                  key={destino.slug}
                  to="/destinos/$slug"
                  params={{ slug: destino.slug }}
                  onClick={onClickDestino}
                  className={`rounded px-1.5 py-1 text-sm transition-colors ${corCidade}`}
                >
                  {nomeCidade(destino.nome)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
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
            {GRUPOS.map((grupoPais) => (
              <div key={grupoPais.pais}>
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  {grupoPais.pais}
                </p>
                <div className="mt-2">
                  {renderEstados(grupoPais, () => onNavigate?.())}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  const grupoPaisAtivo = GRUPOS.find((g) => g.pais === paisAtivo) ?? GRUPOS[0];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className={`flex items-center gap-1 text-sm font-medium uppercase tracking-wide transition-colors ${
          transparente
            ? isActive
              ? "text-sand-50"
              : "text-sand-50/80 hover:text-sand-50"
            : isActive
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
        <div className="absolute left-0 top-full mt-2 flex w-[30rem] overflow-hidden rounded-xl bg-[#009739]/95 shadow-lg backdrop-blur-sm">
          {/* Coluna dos países — hover troca o que aparece na coluna da direita, igual ao menu do concorrente. */}
          <div className="w-36 shrink-0 space-y-0.5 border-r border-white/15 p-3">
            {GRUPOS.map((grupoPais) => (
              <button
                key={grupoPais.pais}
                type="button"
                onMouseEnter={() => setPaisAtivo(grupoPais.pais)}
                onClick={() => setPaisAtivo(grupoPais.pais)}
                className={`block w-full rounded px-2 py-1.5 text-left text-sm font-medium transition-colors ${
                  grupoPaisAtivo?.pais === grupoPais.pais
                    ? "bg-white/25 text-white"
                    : "text-white/80 hover:bg-white/25 hover:text-white"
                }`}
              >
                {grupoPais.pais}
              </button>
            ))}
          </div>

          <div className="flex-1 p-4">
            {renderEstados(grupoPaisAtivo, () => setAberto(false), "escuro")}
          </div>
        </div>
      )}
    </div>
  );
}
