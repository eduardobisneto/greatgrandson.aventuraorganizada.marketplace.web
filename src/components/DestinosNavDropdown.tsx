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
  const [estadoAtivo, setEstadoAtivo] = useState(GRUPOS[0]?.estados[0]?.sigla);
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
   * Lista de estados > cidades de UM país, empilhados — usada só no menu
   * mobile (accordion simples, sem colunas: aqui não faz sentido replicar
   * o cascateamento de 3 colunas do desktop).
   */
  function renderEstados(
    grupoPais: GrupoPais | undefined,
    onClickDestino: () => void,
  ) {
    if (!grupoPais) return null;

    return (
      <div className="space-y-3">
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
    );
  }

  /**
   * Só as cidades de UM estado — terceira coluna do painel desktop.
   * Espelha o mesmo comportamento da coluna de país: passar o mouse (ou
   * clicar) num estado troca o que aparece aqui, sem navegar.
   */
  function renderCidades(
    grupoEstado: GrupoEstado | undefined,
    onClickDestino: () => void,
  ) {
    if (!grupoEstado) return null;
    return (
      <div className="flex flex-col">
        {grupoEstado.destinos.map((destino) => (
          <Link
            key={destino.slug}
            to="/destinos/$slug"
            params={{ slug: destino.slug }}
            onClick={onClickDestino}
            className="rounded px-2 py-1.5 text-sm text-[#009739] transition-colors hover:bg-[#009739]/10"
          >
            {nomeCidade(destino.nome)}
          </Link>
        ))}
      </div>
    );
  }

  function selecionarPais(pais: string) {
    setPaisAtivo(pais);
    setEstadoAtivo(GRUPOS.find((g) => g.pais === pais)?.estados[0]?.sigla);
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
  const grupoEstadoAtivo =
    grupoPaisAtivo?.estados.find((e) => e.sigla === estadoAtivo) ??
    grupoPaisAtivo?.estados[0];

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
        <div className="absolute left-0 top-full mt-2 flex overflow-hidden rounded-xl bg-white/95 shadow-lg backdrop-blur-sm">
          {/* Coluna dos países — hover troca o que aparece na coluna do meio, igual ao menu do concorrente. */}
          <div className="w-32 shrink-0 space-y-0.5 border-r border-border p-3">
            {GRUPOS.map((grupoPais) => (
              <button
                key={grupoPais.pais}
                type="button"
                onMouseEnter={() => selecionarPais(grupoPais.pais)}
                onClick={() => selecionarPais(grupoPais.pais)}
                className={`block w-full rounded px-2 py-1.5 text-left text-sm font-medium transition-colors ${
                  grupoPaisAtivo?.pais === grupoPais.pais
                    ? "bg-[#009739]/10 text-[#009739]"
                    : "text-[#009739]/70 hover:bg-[#009739]/10 hover:text-[#009739]"
                }`}
              >
                {grupoPais.pais}
              </button>
            ))}
          </div>

          {/* Coluna dos estados — mesmo comportamento: hover troca a coluna de cidades. */}
          <div className="w-40 shrink-0 space-y-0.5 border-r border-border p-3">
            {grupoPaisAtivo?.estados.map((grupoEstado) => (
              <button
                key={grupoEstado.sigla}
                type="button"
                onMouseEnter={() => setEstadoAtivo(grupoEstado.sigla)}
                onClick={() => setEstadoAtivo(grupoEstado.sigla)}
                className={`block w-full rounded px-2 py-1.5 text-left text-sm font-medium transition-colors ${
                  grupoEstadoAtivo?.sigla === grupoEstado.sigla
                    ? "bg-[#009739]/10 text-[#009739]"
                    : "text-[#009739]/70 hover:bg-[#009739]/10 hover:text-[#009739]"
                }`}
              >
                {grupoEstado.estado}
              </button>
            ))}
          </div>

          <div className="w-40 p-3">
            {renderCidades(grupoEstadoAtivo, () => setAberto(false))}
          </div>
        </div>
      )}
    </div>
  );
}
