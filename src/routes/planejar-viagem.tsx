import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CreditCard,
  Download,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Send,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Calendar } from "@/components/Calendar";
import { PagamentoModal } from "@/components/PagamentoModal";
import { RequireAuth } from "@/components/RequireAuth";
import { destinos } from "@/data/destinos";
import {
  experiencias,
  getDestinosPorExperiencia,
  getExperienciasPorDestino,
} from "@/data/experiencias";
import { useAuth } from "@/lib/auth-context";
import {
  adicionarInteracao,
  confirmarPagamentoSinal,
  confirmarRevisaoDoPacote,
  fecharPacote,
  getPlanosDoUsuario,
  noitesEntre,
  onPedirListaDeViagens,
  PRAZO_RESPOSTA_ANALISTA_HORAS,
  responderPergunta,
  responderSugestao,
  salvarPlanoViagem,
  VALOR_SINAL_REAIS,
  type DetalhesPagamentoRealizado,
  type PlanoViagem,
  type SelecaoDestino,
} from "@/lib/trip-plan";

export const Route = createFileRoute("/planejar-viagem")({
  validateSearch: (search: Record<string, unknown>) => ({
    planoId: typeof search["planoId"] === "string" ? search["planoId"] : undefined,
    step: typeof search["step"] === "string" ? search["step"] : undefined,
  }),
  component: () => (
    <RequireAuth>
      <PlanejarViagemPage />
    </RequireAuth>
  ),
});

type Step = "tipo" | "selecao" | "calendario" | "resumo";
type TipoInicial = "destinos" | "experiencias";
type SelecoesMap = Record<string, Set<string>>;
type Modo = "lista" | "detalhe" | "wizard";

const STEP_LABELS: Record<Step, string> = {
  tipo: "1. Por onde começar",
  selecao: "2. Destinos e experiências",
  calendario: "3. Datas e detalhes por destino",
  resumo: "4. Resumo",
};

const STEP_ORDER: Step[] = ["tipo", "selecao", "calendario", "resumo"];

const ADULTOS_PADRAO = 2;
const CRIANCAS_PADRAO = 0;

function PlanejarViagemPage() {
  const { user } = useAuth();
  const search = Route.useSearch();
  const navigate = useNavigate();

  const [modo, setModo] = useState<Modo | null>(null);
  const [planos, setPlanos] = useState<PlanoViagem[]>([]);
  const [planoSelecionado, setPlanoSelecionado] = useState<PlanoViagem | null>(
    null,
  );
  const [stepInicialConsulta, setStepInicialConsulta] = useState<
    string | undefined
  >(undefined);

  const [step, setStep] = useState<Step>("tipo");
  const [maxStepIndexVisitado, setMaxStepIndexVisitado] = useState(0);
  const [tipoInicial, setTipoInicial] = useState<TipoInicial | null>(null);
  const [selecoesMap, setSelecoesMap] = useState<SelecoesMap>({});
  const [destinoAtualIndex, setDestinoAtualIndex] = useState(0);
  const [datasInicio, setDatasInicio] = useState<Record<string, string>>({});
  const [datasFim, setDatasFim] = useState<Record<string, string>>({});

  const [interessesMap, setInteressesMap] = useState<Record<string, string[]>>(
    {},
  );
  const [adultosMap, setAdultosMap] = useState<Record<string, number>>({});
  const [criancasMap, setCriancasMap] = useState<Record<string, number>>({});
  const [idadesCriancasMap, setIdadesCriancasMap] = useState<
    Record<string, number[]>
  >({});
  const [inclusosMap, setInclusosMap] = useState<Record<string, string[]>>({});
  const [contextoDestinoMap, setContextoDestinoMap] = useState<
    Record<string, string>
  >({});

  const [contexto, setContexto] = useState("");

  const destinosSelecionados = Object.keys(selecoesMap);

  useEffect(() => {
    if (!user) return;
    const doUsuario = getPlanosDoUsuario(user.id);
    setPlanos(doUsuario);
    setModo(doUsuario.length > 0 ? "lista" : "wizard");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    return onPedirListaDeViagens(() => {
      setPlanos(getPlanosDoUsuario(user.id));
      setPlanoSelecionado(null);
      setModo("lista");
    });
  }, [user]);

  // Deep link vindo da tela de Pagamentos: abre direto o plano e a etapa
  // relacionada ao pagamento clicado (5 pra sinal, 8 pra fechamento).
  useEffect(() => {
    if (!search.planoId || planos.length === 0) return;
    const plano = planos.find((p) => p.id === search.planoId);
    if (!plano) return;

    setPlanoSelecionado(plano);
    setStepInicialConsulta(search.step);
    setModo("detalhe");
    navigate({
      to: "/planejar-viagem",
      search: { planoId: undefined, step: undefined },
      replace: true,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [planos, search.planoId]);

  function iniciarNovoPlanejamento() {
    setStep("tipo");
    setMaxStepIndexVisitado(0);
    setTipoInicial(null);
    setSelecoesMap({});
    setDestinoAtualIndex(0);
    setDatasInicio({});
    setDatasFim({});
    setInteressesMap({});
    setAdultosMap({});
    setCriancasMap({});
    setIdadesCriancasMap({});
    setInclusosMap({});
    setContextoDestinoMap({});
    setContexto("");
    setModo("wizard");
  }

  function verMeusPlanos() {
    if (!user) return;
    setPlanos(getPlanosDoUsuario(user.id));
    setPlanoSelecionado(null);
    setModo("lista");
  }

  function abrirPlano(plano: PlanoViagem) {
    setPlanoSelecionado(plano);
    setModo("detalhe");
  }

  function irPara(novoStep: Step) {
    setStep(novoStep);
    setMaxStepIndexVisitado((atual) =>
      Math.max(atual, STEP_ORDER.indexOf(novoStep)),
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleDestino(slug: string) {
    setSelecoesMap((atual) => {
      const proximo = { ...atual };
      if (proximo[slug]) {
        delete proximo[slug];
      } else {
        proximo[slug] = new Set();
      }
      return proximo;
    });

    setAdultosMap((atual) => {
      if (slug in atual) {
        const { [slug]: _removido, ...resto } = atual;
        return resto;
      }
      return { ...atual, [slug]: ADULTOS_PADRAO };
    });
    setCriancasMap((atual) => {
      if (slug in atual) {
        const { [slug]: _removido, ...resto } = atual;
        return resto;
      }
      return { ...atual, [slug]: CRIANCAS_PADRAO };
    });
    setIdadesCriancasMap((atual) => {
      if (slug in atual) {
        const { [slug]: _removido, ...resto } = atual;
        return resto;
      }
      return { ...atual, [slug]: [] };
    });
    setInteressesMap((atual) => {
      if (slug in atual) {
        const { [slug]: _removido, ...resto } = atual;
        return resto;
      }
      return { ...atual, [slug]: [] };
    });
    setInclusosMap((atual) => {
      if (slug in atual) {
        const { [slug]: _removido, ...resto } = atual;
        return resto;
      }
      return { ...atual, [slug]: [] };
    });
    setContextoDestinoMap((atual) => {
      if (slug in atual) {
        const { [slug]: _removido, ...resto } = atual;
        return resto;
      }
      return { ...atual, [slug]: "" };
    });
  }

  function toggleExperienciaDoDestino(destinoSlug: string, expSlug: string) {
    setSelecoesMap((atual) => {
      const atualSet = atual[destinoSlug] ?? new Set<string>();
      const novoSet = new Set(atualSet);
      if (novoSet.has(expSlug)) {
        novoSet.delete(expSlug);
      } else {
        novoSet.add(expSlug);
      }

      // No fluxo "já sei o que quero viver", um destino só entra na seleção
      // através de uma experiência — sem isso, ele precisa sumir de novo,
      // senão fica "fantasma" nos próximos passos mesmo sem nada escolhido.
      if (novoSet.size === 0 && tipoInicial === "experiencias") {
        const { [destinoSlug]: _removido, ...resto } = atual;
        return resto;
      }

      return { ...atual, [destinoSlug]: novoSet };
    });
  }

  function selecionarDataDoDestino(slug: string, iso: string) {
    const inicioAtual = datasInicio[slug];
    const fimAtual = datasFim[slug];

    if (!inicioAtual || fimAtual) {
      // Começando uma seleção nova (ou range anterior já fechado): esse
      // clique vira o novo início, limpando o fim.
      setDatasInicio((atual) => ({ ...atual, [slug]: iso }));
      setDatasFim((atual) => {
        const { [slug]: _removido, ...resto } = atual;
        return resto;
      });
      return;
    }

    if (iso <= inicioAtual) {
      // Clicou numa data antes do início (ou no próprio início de novo):
      // essa vira o novo início — uma viagem não pode ter 0 noites.
      setDatasInicio((atual) => ({ ...atual, [slug]: iso }));
      return;
    }

    setDatasFim((atual) => ({ ...atual, [slug]: iso }));
  }

  function toggleInteresseDoDestino(destinoSlug: string, valor: string) {
    setInteressesMap((atual) => {
      const atuais = atual[destinoSlug] ?? [];
      const novos = atuais.includes(valor)
        ? atuais.filter((v) => v !== valor)
        : [...atuais, valor];
      return { ...atual, [destinoSlug]: novos };
    });
  }

  function toggleInclusoDoDestino(destinoSlug: string, valor: string) {
    setInclusosMap((atual) => {
      const atuais = atual[destinoSlug] ?? [];
      const novos = atuais.includes(valor)
        ? atuais.filter((v) => v !== valor)
        : [...atuais, valor];
      return { ...atual, [destinoSlug]: novos };
    });
  }

  function handleEnviar() {
    if (!user) return;

    const selecoes: SelecaoDestino[] = destinosSelecionados.map((slug) => ({
      destinoSlug: slug,
      experienciaSlugs: Array.from(selecoesMap[slug] ?? []),
      dataInicio: datasInicio[slug],
      dataFim: datasFim[slug],
      adultos: adultosMap[slug] ?? ADULTOS_PADRAO,
      criancas: criancasMap[slug] ?? CRIANCAS_PADRAO,
      idadesCriancas: idadesCriancasMap[slug],
      interesses: interessesMap[slug] ?? [],
      inclusos: inclusosMap[slug] ?? [],
      contextoDestino: contextoDestinoMap[slug] || undefined,
    }));

    const criado = salvarPlanoViagem({
      usuarioId: user.id,
      tipoInicial: tipoInicial ?? "destinos",
      selecoes,
      contexto,
    });

    abrirPlano(criado);
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  if (modo === null) {
    return (
      <section className="section-padding">
        <div className="container-tight">
          <p className="text-center text-sm text-muted-foreground">
            Carregando...
          </p>
        </div>
      </section>
    );
  }

  if (modo === "lista") {
    return (
      <ListaPlanosView
        nome={user?.nome.split(" ")[0] ?? ""}
        planos={planos}
        onNovoPlanejamento={iniciarNovoPlanejamento}
        onAbrirPlano={abrirPlano}
      />
    );
  }

  if (modo === "detalhe" && planoSelecionado) {
    return (
      <DetalhePlanoView
        plano={planoSelecionado}
        nomeUsuario={user?.nome.split(" ")[0] ?? ""}
        avatarUrlUsuario={user?.avatarUrl}
        stepInicial={stepInicialConsulta}
        onVoltar={verMeusPlanos}
      />
    );
  }

  return (
    <section className="section-padding">
      <div className="container-tight">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Planejar viagem
          </span>
          <h1 className="mt-3 text-balance text-3xl md:text-4xl">
            Vamos montar a sua aventura, {user?.nome.split(" ")[0]}
          </h1>
        </div>

        <div className="mx-auto mt-8 flex max-w-2xl items-center justify-between gap-1">
          {STEP_ORDER.map((s, index) => (
            <div key={s} className="flex flex-1 items-center gap-1">
              {index <= stepIndex ? (
                <button
                  type="button"
                  onClick={() => irPara(s)}
                  aria-label={`Voltar para ${STEP_LABELS[s]}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-80"
                >
                  {index + 1}
                </button>
              ) : index <= maxStepIndexVisitado ? (
                <button
                  type="button"
                  onClick={() => irPara(s)}
                  aria-label={`Ir para ${STEP_LABELS[s]}`}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-transparent text-xs font-semibold text-primary transition-colors hover:bg-primary/10"
                >
                  {index + 1}
                </button>
              ) : (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-muted-foreground">
                  {index + 1}
                </div>
              )}
              {index < STEP_ORDER.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${index < stepIndex ? "bg-primary" : "bg-secondary"}`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
          {STEP_LABELS[step]}
        </p>

        <div className="mt-12">
          {step === "tipo" && (
            <TipoStep
              onEscolher={(tipo) => {
                setTipoInicial(tipo);
                irPara("selecao");
              }}
            />
          )}

          {step === "selecao" && tipoInicial && (
            <SelecaoStep
              tipoInicial={tipoInicial}
              selecoesMap={selecoesMap}
              onToggleDestino={toggleDestino}
              onToggleExperiencia={toggleExperienciaDoDestino}
              onVoltar={() => irPara("tipo")}
              onAvancar={() => {
                setDestinoAtualIndex(0);
                irPara("calendario");
              }}
            />
          )}

          {step === "calendario" && (
            <CalendarioStep
              destinosSelecionados={destinosSelecionados}
              destinoAtualIndex={destinoAtualIndex}
              onIrParaDestino={setDestinoAtualIndex}
              datasInicio={datasInicio}
              datasFim={datasFim}
              onSelecionarData={selecionarDataDoDestino}
              adultosMap={adultosMap}
              onAdultosChange={(slug, valor) =>
                setAdultosMap((atual) => ({ ...atual, [slug]: valor }))
              }
              criancasMap={criancasMap}
              onCriancasChange={(slug, valor) => {
                setCriancasMap((atual) => ({ ...atual, [slug]: valor }));
                setIdadesCriancasMap((atual) => {
                  const atuais = atual[slug] ?? [];
                  const proximas = Array.from(
                    { length: Math.max(valor, 0) },
                    (_, i) => atuais[i] ?? 0,
                  );
                  return { ...atual, [slug]: proximas };
                });
              }}
              idadesCriancasMap={idadesCriancasMap}
              onIdadeCriancaChange={(slug, indice, idade) =>
                setIdadesCriancasMap((atual) => {
                  const atuais = [...(atual[slug] ?? [])];
                  atuais[indice] = idade;
                  return { ...atual, [slug]: atuais };
                })
              }
              interessesMap={interessesMap}
              onToggleInteresse={toggleInteresseDoDestino}
              inclusosMap={inclusosMap}
              onToggleIncluso={toggleInclusoDoDestino}
              contextoDestinoMap={contextoDestinoMap}
              onContextoDestinoChange={(slug, valor) =>
                setContextoDestinoMap((atual) => ({ ...atual, [slug]: valor }))
              }
              onVoltar={() => irPara("selecao")}
              onAvancar={() => irPara("resumo")}
            />
          )}

          {step === "resumo" && (
            <ResumoStep
              destinosSelecionados={destinosSelecionados}
              selecoesMap={selecoesMap}
              datasInicio={datasInicio}
              datasFim={datasFim}
              adultosMap={adultosMap}
              criancasMap={criancasMap}
              interessesMap={interessesMap}
              inclusosMap={inclusosMap}
              contextoDestinoMap={contextoDestinoMap}
              onVoltar={() => irPara("calendario")}
              onEnviar={handleEnviar}
            />
          )}
        </div>
      </div>
    </section>
  );
}

function TipoStep({ onEscolher }: { onEscolher: (tipo: TipoInicial) => void }) {
  return (
    <div className="mx-auto grid max-w-2xl gap-6 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => onEscolher("destinos")}
        className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center transition-all hover:shadow-md"
      >
        <MapPin className="h-10 w-10 text-primary" />
        <div>
          <h3 className="font-display text-xl">Já sei o destino</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Quero começar escolhendo para onde ir, e depois ver as experiências
            disponíveis em cada lugar.
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onEscolher("experiencias")}
        className="group flex flex-col items-center gap-4 rounded-2xl border border-border bg-card p-8 text-center transition-all hover:shadow-md"
      >
        <Sparkles className="h-10 w-10 text-primary" />
        <div>
          <h3 className="font-display text-xl">Já sei o que quero viver</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Quero começar escolhendo experiências, e depois ver em quais
            destinos elas acontecem.
          </p>
        </div>
      </button>
    </div>
  );
}

function SelecaoStep({
  tipoInicial,
  selecoesMap,
  onToggleDestino,
  onToggleExperiencia,
  onVoltar,
  onAvancar,
}: {
  tipoInicial: TipoInicial;
  selecoesMap: SelecoesMap;
  onToggleDestino: (slug: string) => void;
  onToggleExperiencia: (destinoSlug: string, expSlug: string) => void;
  onVoltar: () => void;
  onAvancar: () => void;
}) {
  const [experienciasEscolhidas, setExperienciasEscolhidas] = useState<
    Set<string>
  >(new Set());

  const destinosEscolhidos = Object.keys(selecoesMap);
  const totalExperiencias = Object.values(selecoesMap).reduce(
    (total, set) => total + set.size,
    0,
  );

  const podeAvancar = destinosEscolhidos.length > 0 && totalExperiencias > 0;

  function toggleExperienciaEscolhida(slug: string) {
    setExperienciasEscolhidas((atual) => {
      const novo = new Set(atual);
      if (novo.has(slug)) {
        novo.delete(slug);
      } else {
        novo.add(slug);
      }
      return novo;
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      {tipoInicial === "destinos" ? (
        <>
          <div>
            <h2 className="text-balance text-2xl md:text-3xl">
              Quais destinos você quer visitar?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pode escolher mais de um — mesmo que sejam em datas diferentes, a
              gente ajusta isso no próximo passo.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {destinos.map((destino) => {
                const selecionado = destino.slug in selecoesMap;
                return (
                  <button
                    key={destino.slug}
                    type="button"
                    onClick={() => onToggleDestino(destino.slug)}
                    className={`relative overflow-hidden rounded-2xl border-2 text-left transition-all ${
                      selecionado
                        ? "border-primary"
                        : "border-transparent hover:border-border"
                    }`}
                  >
                    <img
                      src={destino.imagem}
                      alt={destino.alt}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/10 to-transparent" />
                    {selecionado && (
                      <div className="absolute right-3 top-3 rounded-full bg-primary p-1.5 text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                    <p className="absolute bottom-3 left-4 right-4 font-display text-lg text-sand-50">
                      {destino.nome}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {destinosEscolhidos.map((slug) => {
            const destino = destinos.find((d) => d.slug === slug);
            const disponiveis = getExperienciasPorDestino(slug);
            if (!destino) return null;

            return (
              <div key={slug}>
                <h3 className="font-display text-xl">
                  O que você quer viver em {destino.nome.split(",")[0]}?
                </h3>
                {disponiveis.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {disponiveis.map((exp) => {
                      const marcado = selecoesMap[slug]?.has(exp.slug);
                      return (
                        <button
                          key={exp.slug}
                          type="button"
                          onClick={() => onToggleExperiencia(slug, exp.slug)}
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                            marcado
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:bg-secondary"
                          }`}
                        >
                          {marcado && <Check className="h-3.5 w-3.5" />}
                          {exp.titulo}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Ainda não temos experiências específicas cadastradas para
                    esse destino.
                  </p>
                )}
              </div>
            );
          })}
        </>
      ) : (
        <>
          <div>
            <h2 className="text-balance text-2xl md:text-3xl">
              O que você quer viver?
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Pode escolher mais de uma experiência.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {experiencias.map((exp) => {
                const marcado = experienciasEscolhidas.has(exp.slug);
                return (
                  <button
                    key={exp.slug}
                    type="button"
                    onClick={() => toggleExperienciaEscolhida(exp.slug)}
                    className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                      marcado
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-foreground hover:bg-secondary"
                    }`}
                  >
                    {marcado && <Check className="h-3.5 w-3.5" />}
                    {exp.titulo}
                  </button>
                );
              })}
            </div>
          </div>

          {Array.from(experienciasEscolhidas).map((expSlug) => {
            const exp = experiencias.find((e) => e.slug === expSlug);
            const destinosComExp = getDestinosPorExperiencia(expSlug);
            const destinosUnicos = Array.from(
              new Map(destinosComExp.map((d) => [d.destinoSlug, d])).values(),
            );
            if (!exp) return null;

            return (
              <div key={expSlug}>
                <h3 className="font-display text-xl">
                  Onde você quer viver {exp.titulo.toLowerCase()}?
                </h3>
                {destinosUnicos.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    {destinosUnicos.map((item) => {
                      const marcado =
                        selecoesMap[item.destinoSlug]?.has(expSlug);
                      return (
                        <button
                          key={item.destinoSlug}
                          type="button"
                          onClick={() =>
                            onToggleExperiencia(item.destinoSlug, expSlug)
                          }
                          className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                            marcado
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border text-foreground hover:bg-secondary"
                          }`}
                        >
                          {marcado && <Check className="h-3.5 w-3.5" />}
                          {item.destinoNome}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Ainda não temos um roteiro publicado com essa experiência em
                    destaque.
                  </p>
                )}
              </div>
            );
          })}
        </>
      )}

      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={onVoltar}
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          type="button"
          disabled={!podeAvancar}
          onClick={onAvancar}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          Continuar
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CalendarioStep({
  destinosSelecionados,
  destinoAtualIndex,
  onIrParaDestino,
  datasInicio,
  datasFim,
  onSelecionarData,
  adultosMap,
  onAdultosChange,
  criancasMap,
  onCriancasChange,
  idadesCriancasMap,
  onIdadeCriancaChange,
  interessesMap,
  onToggleInteresse,
  inclusosMap,
  onToggleIncluso,
  contextoDestinoMap,
  onContextoDestinoChange,
  onVoltar,
  onAvancar,
}: {
  destinosSelecionados: string[];
  destinoAtualIndex: number;
  onIrParaDestino: (index: number) => void;
  datasInicio: Record<string, string>;
  datasFim: Record<string, string>;
  onSelecionarData: (slug: string, data: string) => void;
  adultosMap: Record<string, number>;
  onAdultosChange: (slug: string, valor: number) => void;
  criancasMap: Record<string, number>;
  onCriancasChange: (slug: string, valor: number) => void;
  idadesCriancasMap: Record<string, number[]>;
  onIdadeCriancaChange: (slug: string, indice: number, idade: number) => void;
  interessesMap: Record<string, string[]>;
  onToggleInteresse: (slug: string, valor: string) => void;
  inclusosMap: Record<string, string[]>;
  onToggleIncluso: (slug: string, valor: string) => void;
  contextoDestinoMap: Record<string, string>;
  onContextoDestinoChange: (slug: string, valor: string) => void;
  onVoltar: () => void;
  onAvancar: () => void;
}) {
  const slug = destinosSelecionados[destinoAtualIndex];
  const destino = destinos.find((d) => d.slug === slug);
  if (!slug || !destino) return null;

  const inicio = datasInicio[slug];
  const fim = datasFim[slug];
  const noites = noitesEntre(inicio, fim);
  const ehUltimo = destinoAtualIndex === destinosSelecionados.length - 1;

  // Conflitos entre este destino e outros que já têm datas escolhidas.
  const conflitosComOutros = destinosSelecionados
    .filter((s) => s !== slug && datasInicio[s] && datasFim[s])
    .filter((s) => {
      if (!inicio || !fim) return false;
      const oInicio = datasInicio[s]!;
      const oFim = datasFim[s]!;
      return inicio < oFim && oInicio < fim;
    });

  const semFolgaComOutros = destinosSelecionados
    .filter((s) => s !== slug && datasInicio[s] && datasFim[s])
    .filter((s) => {
      if (!inicio || !fim) return false;
      const oInicio = datasInicio[s]!;
      const oFim = datasFim[s]!;
      return fim === oInicio || oFim === inicio;
    });

  const todasAsDatasPreenchidas = destinosSelecionados.every(
    (s) => datasInicio[s] && datasFim[s],
  );

  const podeAvancarDesteDestino =
    !!inicio && !!fim && fim > inicio && conflitosComOutros.length === 0;
  const podeAvancar = ehUltimo
    ? podeAvancarDesteDestino && todasAsDatasPreenchidas
    : podeAvancarDesteDestino;

  function handleVoltar() {
    if (destinoAtualIndex === 0) onVoltar();
    else onIrParaDestino(destinoAtualIndex - 1);
  }

  function handleAvancar() {
    if (ehUltimo) onAvancar();
    else onIrParaDestino(destinoAtualIndex + 1);
  }

  function camposPessoas() {
    const input =
      "mt-1.5 w-full rounded-xl border border-sand-50/30 bg-background/90 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary";
    const numCriancas = criancasMap[slug!] ?? 0;
    const idades = idadesCriancasMap[slug!] ?? [];
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-sand-50">Adultos</label>
            <input
              type="number"
              min={1}
              max={30}
              value={adultosMap[slug!] ?? 2}
              onChange={(e) =>
                onAdultosChange(
                  slug!,
                  Math.min(30, Math.max(1, Number(e.target.value) || 1)),
                )
              }
              className={input}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-sand-50">Crianças</label>
            <input
              type="number"
              min={0}
              max={30}
              value={numCriancas}
              onChange={(e) =>
                onCriancasChange(
                  slug!,
                  Math.min(30, Math.max(0, Number(e.target.value) || 0)),
                )
              }
              className={input}
            />
          </div>
        </div>
        {numCriancas > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: numCriancas }, (_, i) => (
              <div key={i}>
                <label className="text-sm font-medium text-sand-50">
                  Idade da criança {i + 1}
                </label>
                <input
                  type="number"
                  min={0}
                  max={17}
                  value={idades[i] ?? 0}
                  onChange={(e) =>
                    onIdadeCriancaChange(slug!, i, Number(e.target.value))
                  }
                  className={input}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  function camposInteresses() {
    return (
      <div>
        <p className="text-sm font-medium text-sand-50">
          Interesses em {destino!.nome.split(",")[0]}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {destino!.interessesDisponiveis.map((interesse) => {
            const marcado = (interessesMap[slug!] ?? []).includes(interesse);
            return (
              <button
                key={interesse}
                type="button"
                onClick={() => onToggleInteresse(slug!, interesse)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  marcado
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-sand-50/40 text-sand-50 hover:bg-sand-50/10"
                }`}
              >
                {marcado && <Check className="h-3.5 w-3.5" />}
                {interesse}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function camposInclusos() {
    return (
      <div>
        <p className="text-sm font-medium text-sand-50">
          O que gostaria que estivesse incluso em {destino!.nome.split(",")[0]}?
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {destino!.inclusosDisponiveis.map((item) => {
            const marcado = (inclusosMap[slug!] ?? []).includes(item);
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggleIncluso(slug!, item)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                  marcado
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-sand-50/40 text-sand-50 hover:bg-sand-50/10"
                }`}
              >
                {marcado && <Check className="h-3.5 w-3.5" />}
                {item}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  function camposContexto() {
    return (
      <div className="flex flex-col">
        <label className="text-sm font-medium text-sand-50">
          O que vai fazer da sua passagem por {destino!.nome.split(",")[0]}{" "}
          inesquecível? (opcional)
        </label>
        <textarea
          value={contextoDestinoMap[slug!] ?? ""}
          onChange={(e) => onContextoDestinoChange(slug!, e.target.value)}
          placeholder="Conta pra gente suas expectativas — quanto mais detalhes, mais completa fica a proposta que preparamos especialmente pra você."
          rows={3}
          className="mt-1.5 w-full resize-none rounded-xl border border-sand-50/30 bg-background/90 px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
          Destino {destinoAtualIndex + 1} de {destinosSelecionados.length}
        </span>
        <p className="mt-2 text-sm text-muted-foreground">
          Escolha início e fim, quem vai, interesses e o que gostaria que
          estivesse incluso nesse destino.
        </p>
      </div>

      {destinosSelecionados.length > 1 && (
        <div className="flex items-center justify-center gap-1">
          {destinosSelecionados.map((s, i) => {
            const completo = !!datasInicio[s] && !!datasFim[s];
            const ativo = i === destinoAtualIndex;
            return (
              <div key={s} className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onIrParaDestino(i)}
                  aria-label={`Ir para o destino ${i + 1}`}
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    ativo
                      ? "bg-primary text-primary-foreground"
                      : completo
                        ? "border-2 border-primary bg-transparent text-primary hover:bg-primary/10"
                        : "bg-secondary text-muted-foreground hover:bg-secondary/70"
                  }`}
                >
                  {completo && !ativo ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    i + 1
                  )}
                </button>
                {i < destinosSelecionados.length - 1 && (
                  <div
                    className={`h-0.5 w-8 ${i < destinoAtualIndex ? "bg-primary" : "bg-secondary"}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
      {destinosSelecionados.length > 1 && (
        <p className="text-center text-sm font-medium text-muted-foreground">
          {destino.nome}
        </p>
      )}

      <div className="relative overflow-hidden rounded-2xl">
        <img
          src={destino.imagem}
          alt={destino.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/75 to-forest-900/60" />
        <div className="relative p-6">
          <p className="font-display text-xl text-sand-50">{destino.nome}</p>
          <p className="mt-3 text-sm font-semibold uppercase tracking-wider text-sand-50">
            Escolher datas
          </p>
          <p className="mt-1 text-sm text-sand-50/80">
            {!inicio
              ? "Escolha a data de início"
              : !fim
                ? "Agora escolha a data de fim"
                : `${new Date(`${inicio}T00:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${fim}T00:00:00`).toLocaleDateString("pt-BR")} · ${noites} noites`}
          </p>

          {conflitosComOutros.length > 0 && (
            <p className="mt-4 rounded-xl bg-destructive px-4 py-3 text-sm text-destructive-foreground">
              Essas datas cruzam com{" "}
              {conflitosComOutros
                .map((s) => destinos.find((d) => d.slug === s)?.nome ?? s)
                .join(", ")}
              . Ajuste um dos dois períodos — você não pode estar em dois
              lugares ao mesmo tempo.
            </p>
          )}
          {conflitosComOutros.length === 0 && semFolgaComOutros.length > 0 && (
            <p className="mt-4 rounded-xl bg-amber-400 px-4 py-3 text-sm text-amber-950">
              Essas datas encostam direto em{" "}
              {semFolgaComOutros
                .map((s) => destinos.find((d) => d.slug === s)?.nome ?? s)
                .join(", ")}
              , sem folga pro deslocamento. Vale considerar pelo menos 1 dia a
              mais entre os destinos.
            </p>
          )}

          <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_auto]">
            <div className="order-2 flex flex-col gap-6 lg:order-1">
              {camposPessoas()}
              {camposInteresses()}
              {camposInclusos()}
            </div>
            <div className="order-1 flex justify-center lg:order-2">
              <Calendar
                rangeStart={inicio}
                rangeEnd={fim}
                onSelect={(iso) => onSelecionarData(slug, iso)}
              />
            </div>
          </div>

          <div className="mt-6">{camposContexto()}</div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-6">
        <button
          type="button"
          onClick={handleVoltar}
          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </button>
        <button
          type="button"
          disabled={!podeAvancar}
          onClick={handleAvancar}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          {ehUltimo ? "Continuar" : "Próximo destino"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function ResumoStep({
  destinosSelecionados,
  selecoesMap,
  datasInicio,
  datasFim,
  adultosMap,
  criancasMap,
  interessesMap,
  inclusosMap,
  contextoDestinoMap,
  onVoltar,
  onEnviar,
}: {
  destinosSelecionados: string[];
  selecoesMap: SelecoesMap;
  datasInicio: Record<string, string>;
  datasFim: Record<string, string>;
  adultosMap: Record<string, number>;
  criancasMap: Record<string, number>;
  interessesMap: Record<string, string[]>;
  inclusosMap: Record<string, string[]>;
  contextoDestinoMap: Record<string, string>;
  onVoltar: () => void;
  onEnviar: () => void;
}) {
  const experienciaSlugsUnicos = Array.from(
    new Set(
      destinosSelecionados.flatMap((slug) =>
        Array.from(selecoesMap[slug] ?? []),
      ),
    ),
  );
  const experienciasUnicas = experienciaSlugsUnicos
    .map((s) => experiencias.find((e) => e.slug === s))
    .filter((e): e is (typeof experiencias)[number] => !!e);

  const interessesUnicos = Array.from(
    new Set(
      destinosSelecionados.flatMap((slug) => interessesMap[slug] ?? []),
    ),
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h2 className="text-balance text-2xl md:text-3xl">
          Confira o resumo da sua viagem
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Nossa equipe recebe esse plano e monta uma proposta detalhada para
          você.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Destinos
          </p>
          <div className="mt-3 grid gap-6 sm:grid-cols-2">
            {destinosSelecionados.map((slug) => {
              const destino = destinos.find((d) => d.slug === slug);
              const inicio = datasInicio[slug];
              const fim = datasFim[slug];
              const noites = noitesEntre(inicio, fim);
              const adultos = adultosMap[slug] ?? 2;
              const criancas = criancasMap[slug] ?? 0;
              const contextoDestino = contextoDestinoMap[slug];

              return (
                <div
                  key={slug}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    {destino?.imagem ? (
                      <img
                        src={destino.imagem}
                        alt={destino.alt}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-forest-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-display text-2xl text-sand-50">
                        {destino?.nome}
                      </h3>
                      <p className="text-sm text-forest-100">
                        {inicio && fim
                          ? `${new Date(`${inicio}T00:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${fim}T00:00:00`).toLocaleDateString("pt-BR")} · ${noites} noites · ${adultos} adulto(s)${criancas > 0 ? `, ${criancas} criança(s)` : ""}`
                          : "Datas a combinar"}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 p-6">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {contextoDestino ||
                        "Sem comentários adicionais para esse destino."}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {experienciasUnicas.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Experiências
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {experienciasUnicas.map((exp) => (
                <span
                  key={exp.slug}
                  className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
                >
                  <Check className="h-3.5 w-3.5" />
                  {exp.titulo}
                </span>
              ))}
            </div>
          </div>
        )}

        {interessesUnicos.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Interesses
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {interessesUnicos.map((interesse) => (
                <span
                  key={interesse}
                  className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary text-primary-foreground px-4 py-2 text-sm font-medium"
                >
                  <Check className="h-3.5 w-3.5" />
                  {interesse}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-4 border-t border-border pt-6 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={onVoltar}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
          <button
            type="button"
            onClick={onEnviar}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Enviar plano de viagem
            <ArrowRight className="h-4 w-4" />
          </button>
      </div>
    </div>
  );
}

const PLANOS_POR_PAGINA = 5;

function ListaPlanosView({
  nome,
  planos,
  onNovoPlanejamento,
  onAbrirPlano,
}: {
  nome: string;
  planos: PlanoViagem[];
  onNovoPlanejamento: () => void;
  onAbrirPlano: (plano: PlanoViagem) => void;
}) {
  const [pagina, setPagina] = useState(1);
  // Sempre do mais novo pro mais antigo (getPlanosDoUsuario já entrega
  // assim, mas a ordenação fica explícita aqui também).
  const planosOrdenados = [...planos].sort((a, b) =>
    b.criadoEm.localeCompare(a.criadoEm),
  );
  const totalPaginas = Math.max(
    1,
    Math.ceil(planosOrdenados.length / PLANOS_POR_PAGINA),
  );
  const paginaAtual = Math.min(pagina, totalPaginas);
  const planosDaPagina = planosOrdenados.slice(
    (paginaAtual - 1) * PLANOS_POR_PAGINA,
    paginaAtual * PLANOS_POR_PAGINA,
  );

  return (
    <>
      <section className="section-padding">
        <div className="container-tight">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Minhas viagens
              </span>
              <h1 className="mt-3 text-balance text-3xl md:text-4xl">
                Suas viagens, {nome}
              </h1>
            </div>
            <button
              type="button"
              onClick={onNovoPlanejamento}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Novo planejamento de viagem
            </button>
          </div>
        </div>
      </section>

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="mx-auto max-w-2xl space-y-4">
            {planosDaPagina.map((plano) => {
              const nomesDestinos = plano.selecoes
                .map(
                  (s) => destinos.find((d) => d.slug === s.destinoSlug)?.nome,
                )
                .filter(Boolean)
                .join(", ");

              return (
                <button
                  key={plano.id}
                  type="button"
                  onClick={() => onAbrirPlano(plano)}
                  className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary"
                >
                  <div>
                    <p className="font-display text-lg">
                      {nomesDestinos || "Plano de viagem"}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Enviado em{" "}
                      {new Date(plano.criadoEm).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                      plano.pacoteFechado
                        ? "bg-green-100 text-green-900"
                        : plano.pacoteRevisado
                          ? "bg-blue-100 text-blue-900"
                          : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {plano.pacoteFechado
                      ? "Contrato fechado"
                      : plano.pacoteRevisado
                        ? "Aguardando pagamento"
                        : "Em análise"}
                  </span>
                </button>
              );
            })}

            {planosOrdenados.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Você ainda não tem viagens planejadas.
              </p>
            )}

            {totalPaginas > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  disabled={paginaAtual === 1}
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-40"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Mais recentes
                </button>
                <span className="text-sm text-muted-foreground">
                  Página {paginaAtual} de {totalPaginas}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                  disabled={paginaAtual === totalPaginas}
                  className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-40"
                >
                  Mais antigas
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function juntarNomes(nomes: string[]): string {
  if (nomes.length <= 1) return nomes[0] ?? "";
  if (nomes.length === 2) return `${nomes[0]} e ${nomes[1]}`;
  return `${nomes.slice(0, -1).join(", ")} e ${nomes[nomes.length - 1]}`;
}

const AGENTES_VIAGEM = [
  {
    nome: "Ana Beatriz Lima",
    codigo: "AO-1042",
    email: "ana.lima@aventuraorganizada.com.br",
  },
  {
    nome: "Carlos Eduardo Souza",
    codigo: "AO-2078",
    email: "carlos.souza@aventuraorganizada.com.br",
  },
  {
    nome: "Fernanda Ribeiro",
    codigo: "AO-3315",
    email: "fernanda.ribeiro@aventuraorganizada.com.br",
  },
];

/** Agente responsável — derivado do id do plano, pra ser sempre o mesmo agente naquela viagem. */
function agenteDoPlano(planoId: string) {
  let hash = 0;
  for (const c of planoId) hash = (hash * 31 + c.charCodeAt(0)) % 1000000007;
  return AGENTES_VIAGEM[hash % AGENTES_VIAGEM.length]!;
}

type ConsultaStep =
  | "tipo"
  | "selecao"
  | "calendario"
  | "detalhes"
  | "analise"
  | "itinerario"
  | "pacote"
  | "pagamento"
  | "fechado";

const CONSULTA_STEP_ORDER: ConsultaStep[] = [
  "tipo",
  "selecao",
  "calendario",
  "detalhes",
  "analise",
  "itinerario",
  "pacote",
  "pagamento",
  "fechado",
];

const CONSULTA_STEP_LABELS: Record<ConsultaStep, string> = {
  tipo: "1. Por onde começou",
  selecao: "2. Destinos e experiências",
  calendario: "3. Datas e detalhes por destino",
  detalhes: "4. Resumo",
  analise: "5. Análise da nossa equipe",
  itinerario: "6. Programação da viagem",
  pacote: "7. Revisão do pacote",
  pagamento: "8. Pagamento",
  fechado: "9. Contratação fechada",
};

function DetalhePlanoView({
  plano,
  nomeUsuario,
  avatarUrlUsuario,
  stepInicial,
  onVoltar,
}: {
  plano: PlanoViagem;
  nomeUsuario: string;
  avatarUrlUsuario?: string | undefined;
  stepInicial?: string | undefined;
  onVoltar: () => void;
}) {
  const [stepConsulta, setStepConsulta] = useState<ConsultaStep>(
    stepInicial && (CONSULTA_STEP_ORDER as string[]).includes(stepInicial)
      ? (stepInicial as ConsultaStep)
      : "analise",
  );
  const [destinoAtualIndex, setDestinoAtualIndex] = useState(0);
  const [planoAtual, setPlanoAtual] = useState<PlanoViagem>(plano);
  const [mensagem, setMensagem] = useState("");
  const [pagando, setPagando] = useState(false);
  const [modalPagamento, setModalPagamento] = useState<
    "sinal" | "pacote" | null
  >(null);
  const [conteudoImpressao, setConteudoImpressao] = useState<
    "ficha" | "pagamento"
  >("ficha");
  // A etapa 7 só fica acessível pelo indicador de passos depois que o
  // cliente passar pela etapa 6 e clicar em "Revisar e fechar o pacote" —
  // antes disso, mesmo com pacoteRevisavel true, não dá pra pular direto.
  // Se o pacote já foi revisado/fechado em uma sessão anterior, o cliente
  // já passou por ali de verdade, então a etapa continua acessível.
  const [chegouAoPacote, setChegouAoPacote] = useState(
    () => !!plano.pacoteRevisado || !!plano.pacoteFechado,
  );
  const [diaProgramacaoAtual, setDiaProgramacaoAtual] = useState<
    Record<string, number>
  >({});

  const interacoes = planoAtual.interacoes ?? [];
  const pacoteRevisavel = interacoes.some((i) => i.tipo === "pacote_pronto");

  const selecaoAtual = plano.selecoes[destinoAtualIndex];
  const destinoAtualInfo = selecaoAtual
    ? destinos.find((d) => d.slug === selecaoAtual.destinoSlug)
    : undefined;

  const nomesDestinos = plano.selecoes
    .map((s) => destinos.find((d) => d.slug === s.destinoSlug)?.nome)
    .filter((n): n is string => !!n);

  const iniciosValidos = plano.selecoes
    .map((s) => s.dataInicio)
    .filter((d): d is string => !!d);
  const fimValidos = plano.selecoes
    .map((s) => s.dataFim)
    .filter((d): d is string => !!d);
  const inicioGeral =
    iniciosValidos.length > 0
      ? iniciosValidos.reduce((min, d) => (d < min ? d : min))
      : undefined;
  const fimGeral =
    fimValidos.length > 0
      ? fimValidos.reduce((max, d) => (d > max ? d : max))
      : undefined;

  function handleEnviarMensagem() {
    if (!mensagem.trim()) return;
    const atualizado = adicionarInteracao(planoAtual.id, {
      autor: "usuario",
      texto: mensagem.trim(),
      tipo: "mensagem",
    });
    if (atualizado) setPlanoAtual(atualizado);
    setMensagem("");
  }

  function handleResponderSugestao(
    interacaoId: string,
    status: "aceita" | "recusada",
  ) {
    const atualizado = responderSugestao(planoAtual.id, interacaoId, status);
    if (atualizado) setPlanoAtual(atualizado);
  }

  function handleResponderPergunta(interacaoId: string, opcaoId: string) {
    const atualizado = responderPergunta(planoAtual.id, interacaoId, opcaoId);
    if (atualizado) setPlanoAtual(atualizado);
  }

  async function handlePagarSinal(detalhes: DetalhesPagamentoRealizado) {
    setPagando(true);
    // Sem gateway de pagamento de verdade por trás disso ainda — simula o
    // tempo de processamento. Fica na própria etapa 5 depois de pagar — só
    // mostra "Sinal pago" e segue a conversa; as etapas 6 e 7 só liberam
    // juntas quando o analista avisar que a programação está completa.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const atualizado = confirmarPagamentoSinal(planoAtual.id, detalhes);
    setPagando(false);
    setModalPagamento(null);
    if (atualizado) {
      setPlanoAtual(atualizado);
    }
  }

  function handleConfirmarRevisao() {
    const atualizado = confirmarRevisaoDoPacote(planoAtual.id);
    if (atualizado) {
      setPlanoAtual(atualizado);
      setStepConsulta("pagamento");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function handleFecharPacote(detalhes: DetalhesPagamentoRealizado) {
    setPagando(true);
    // Sem gateway de pagamento de verdade por trás disso ainda — simula o
    // tempo de processamento do pagamento final antes de fechar o contrato.
    await new Promise((resolve) => setTimeout(resolve, 1200));
    const atualizado = fecharPacote(planoAtual.id, detalhes);
    setPagando(false);
    setModalPagamento(null);
    if (atualizado) {
      setPlanoAtual(atualizado);
      setStepConsulta("fechado");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function renderItensDoDia(itens: PlanoViagem["itinerario"]) {
    const ordenados = [...itens].sort((a, b) =>
      a.horario.localeCompare(b.horario),
    );
    return (
      <div>
        {ordenados.map((item, index) => {
          const isUltimo = index === ordenados.length - 1;
          return (
            <div key={item.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-primary/30">
                  <img
                    src={item.imagem}
                    alt={item.local}
                    className="h-full w-full object-cover"
                  />
                </div>
                {!isUltimo && (
                  <div className="mt-1 w-0.5 flex-1 bg-border" />
                )}
              </div>
              <div className={isUltimo ? "flex-1" : "flex-1 pb-6"}>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {item.horario}
                  {item.duracao ? ` · ${item.duracao}` : ""}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {item.local}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.descricao}
                </p>
                {item.endereco && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {item.endereco}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  /**
   * Ficha da viagem (etapa 7, e o que sai no PDF da etapa 9): documento
   * formal com os dados da agência, do cliente e da viagem, e uma tabela
   * com todas as atividades — o que de fato vai pro cliente, não só um
   * rascunho de conversa.
   */
  function renderFichaProgramacao() {
    if (planoAtual.itinerario.length === 0) {
      return (
        <p className="text-center text-sm text-muted-foreground">
          Sua programação ainda está sendo montada — volte em instantes.
        </p>
      );
    }

    const totalAdultos = plano.selecoes.reduce((t, s) => t + s.adultos, 0);
    const totalCriancas = plano.selecoes.reduce((t, s) => t + s.criancas, 0);
    const totalNoites = noitesEntre(inicioGeral, fimGeral);

    const selecoesOrdenadas = [...plano.selecoes].sort((a, b) => {
      if (!a.dataInicio || !b.dataInicio) return 0;
      return a.dataInicio.localeCompare(b.dataInicio);
    });
    const multiDestino = selecoesOrdenadas.length > 1;

    function dataAbsoluta(dataInicioDestino: string | undefined, dia: number): string {
      if (!dataInicioDestino) return `Dia ${dia}`;
      const data = new Date(`${dataInicioDestino}T00:00:00`);
      data.setDate(data.getDate() + (dia - 1));
      return data.toLocaleDateString("pt-BR");
    }

    const agente = agenteDoPlano(planoAtual.id);
    const impostos = Math.round(planoAtual.valorPacoteReais * 0.08);

    const resumoPorDestino = selecoesOrdenadas
      .map((selecao) => {
        const itensDestino = planoAtual.itinerario.filter(
          (item) => item.destinoSlug === selecao.destinoSlug,
        );
        const acomodacoes = Array.from(
          new Set(
            itensDestino
              .filter((i) => i.categoria === "acomodacao")
              .map((i) => i.local),
          ),
        );
        const refeicoes = Array.from(
          new Set(
            itensDestino
              .filter((i) => i.categoria === "refeicao")
              .map((i) => i.local),
          ),
        );
        const passeios = Array.from(
          new Set(
            itensDestino
              .filter((i) => i.categoria === "passeio")
              .map((i) => i.local),
          ),
        );
        return {
          selecao,
          nome:
            destinos.find((d) => d.slug === selecao.destinoSlug)?.nome ??
            selecao.destinoSlug,
          acomodacoes,
          refeicoes,
          passeios,
        };
      })
      .filter(
        (r) =>
          r.acomodacoes.length > 0 ||
          r.refeicoes.length > 0 ||
          r.passeios.length > 0,
      );

    return (
      <div className="space-y-8 text-left">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-wrap items-start justify-between gap-6 border-b border-border pb-4">
            <div>
              <p className="font-display text-xl">Aventura Organizada</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Rua dos Viajantes, 245 — São Paulo, SP
              </p>
              <p className="text-xs text-muted-foreground">
                CNPJ 12.345.678/0001-90
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                (11) 96322-0494 · contato@aventuraorganizada.com.br
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-display text-lg text-primary">
                Ficha de viagem
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Gerado em {new Date().toLocaleDateString("pt-BR")} às{" "}
                {new Date().toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Agente: {agente.nome} · Cód. {agente.codigo}
              </p>
              <p className="text-xs text-muted-foreground">{agente.email}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <p className="text-sm">
              <span className="font-semibold text-foreground">Cliente:</span>{" "}
              {nomeUsuario}
            </p>
            <p className="text-sm">
              <span className="font-semibold text-foreground">
                Destino(s):
              </span>{" "}
              {juntarNomes(nomesDestinos)}
            </p>
            <p className="text-sm">
              <span className="font-semibold text-foreground">Chegada:</span>{" "}
              {inicioGeral
                ? new Date(`${inicioGeral}T00:00:00`).toLocaleDateString(
                    "pt-BR",
                  )
                : "—"}
              {"  ·  "}
              <span className="font-semibold text-foreground">Partida:</span>{" "}
              {fimGeral
                ? new Date(`${fimGeral}T00:00:00`).toLocaleDateString(
                    "pt-BR",
                  )
                : "—"}
              {totalNoites ? `  ·  ${totalNoites} noites` : ""}
            </p>
            <p className="text-sm">
              <span className="font-semibold text-foreground">
                Viajantes:
              </span>{" "}
              {totalAdultos} adulto{totalAdultos === 1 ? "" : "s"}
              {totalCriancas > 0
                ? `, ${totalCriancas} criança${totalCriancas === 1 ? "" : "s"}`
                : ""}
            </p>
          </div>
        </div>

        {selecoesOrdenadas.map((selecao) => {
          const itensDoDestino = planoAtual.itinerario
            .filter((item) => item.destinoSlug === selecao.destinoSlug)
            .sort((a, b) =>
              a.dia !== b.dia ? a.dia - b.dia : a.horario.localeCompare(b.horario),
            );
          if (itensDoDestino.length === 0) return null;

          const destinoInfo = destinos.find(
            (d) => d.slug === selecao.destinoSlug,
          );
          const resumoDestino = resumoPorDestino.find(
            (r) => r.selecao.destinoSlug === selecao.destinoSlug,
          );

          return (
            <div key={selecao.destinoSlug}>
              {resumoDestino && (
                <div className="mb-4 rounded-2xl border border-border bg-card p-6">
                  {multiDestino && (
                    <p className="font-display text-lg">{resumoDestino.nome}</p>
                  )}
                  <p className="mt-1 text-sm text-muted-foreground">
                    Hospedagem em{" "}
                    {resumoDestino.acomodacoes.length > 0
                      ? resumoDestino.acomodacoes.join(", ")
                      : "a confirmar"}
                    , com refeições em{" "}
                    {resumoDestino.refeicoes.length > 0
                      ? resumoDestino.refeicoes.join(", ")
                      : "a confirmar"}
                    . Passeios e lazer:{" "}
                    {resumoDestino.passeios.length > 0
                      ? resumoDestino.passeios.join(", ")
                      : "a confirmar"}
                    .
                  </p>
                </div>
              )}

              <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
                {multiDestino
                  ? `Atividades — ${destinoInfo?.nome ?? selecao.destinoSlug}`
                  : "Atividades"}
              </h3>
              <div className="mt-3 divide-y divide-border overflow-hidden rounded-2xl border border-border">
                {itensDoDestino.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-1 p-4 sm:grid-cols-[150px_1fr] sm:gap-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <p>{dataAbsoluta(selecao.dataInicio, item.dia)}</p>
                      <p className="mt-0.5">
                        {item.horario}
                        {item.duracao ? ` · ${item.duracao}` : ""}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.local}
                      </p>
                      {item.endereco && (
                        <p className="text-xs text-muted-foreground">
                          {item.endereco}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.descricao}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-primary">
            Pagamentos
          </h3>
          <div className="mt-3 space-y-1.5 text-sm">
            <p className="flex items-center justify-between">
              <span className="text-muted-foreground">
                Valor total do pacote
              </span>
              <span className="font-semibold text-foreground">
                R$ {planoAtual.valorPacoteReais.toLocaleString("pt-BR")}
              </span>
            </p>
            <p className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Taxas e impostos (já inclusos no valor acima)
              </span>
              <span className="text-muted-foreground">
                R$ {impostos.toLocaleString("pt-BR")}
              </span>
            </p>
            <p className="flex items-center justify-between pt-1.5">
              <span className="text-muted-foreground">
                Sinal pago
                {planoAtual.sinalPagoEm
                  ? ` em ${new Date(planoAtual.sinalPagoEm).toLocaleDateString("pt-BR")}`
                  : ""}
              </span>
              <span className="font-semibold text-primary">
                − R$ {VALOR_SINAL_REAIS.toLocaleString("pt-BR")}
              </span>
            </p>
            <p className="flex items-center justify-between border-t border-border pt-1.5">
              <span className="font-semibold text-foreground">
                {planoAtual.pacoteFechado
                  ? `Saldo pago${
                      planoAtual.pacoteFechadoEm
                        ? ` em ${new Date(
                            planoAtual.pacoteFechadoEm,
                          ).toLocaleDateString("pt-BR")}`
                        : ""
                    }`
                  : "Saldo restante"}
              </span>
              <span className="font-semibold text-foreground">
                R${" "}
                {(
                  planoAtual.valorPacoteReais - VALOR_SINAL_REAIS
                ).toLocaleString("pt-BR")}
              </span>
            </p>
          </div>
        </div>
      </div>
    );
  }

  /**
   * Etapa 6 (interativa): navega um dia de cada vez, igual às etapas do
   * passo a passo. Viagem multi-destino vira um bloco por destino, em
   * ordem cronológica, cada um com sua própria navegação de dias — nunca
   * dias de destinos diferentes misturados só porque compartilham o
   * mesmo número.
   */
  function renderProgramacaoPorDia() {
    if (planoAtual.itinerario.length === 0) {
      return (
        <p className="text-center text-sm text-muted-foreground">
          Sua programação ainda está sendo montada — volte em instantes.
        </p>
      );
    }

    const selecoesOrdenadas = [...plano.selecoes].sort((a, b) => {
      if (!a.dataInicio || !b.dataInicio) return 0;
      return a.dataInicio.localeCompare(b.dataInicio);
    });
    const multiDestino = selecoesOrdenadas.length > 1;

    return (
      <div className="space-y-10">
        {selecoesOrdenadas.map((selecao) => {
          const itensDoDestino = planoAtual.itinerario.filter(
            (item) => item.destinoSlug === selecao.destinoSlug,
          );
          if (itensDoDestino.length === 0) return null;

          const destinoInfo = destinos.find(
            (d) => d.slug === selecao.destinoSlug,
          );
          const dias = Array.from(
            new Set(itensDoDestino.map((item) => item.dia)),
          ).sort((a, b) => a - b);
          const diaSelecionado = diaProgramacaoAtual[selecao.destinoSlug] ?? 1;
          const diaAtivo = dias.includes(diaSelecionado)
            ? diaSelecionado
            : dias[0]!;
          const itensDoDia = itensDoDestino.filter(
            (item) => item.dia === diaAtivo,
          );

          return (
            <div key={selecao.destinoSlug}>
              {multiDestino && (
                <h3 className="text-center font-display text-xl">
                  {destinoInfo?.nome ?? selecao.destinoSlug}
                </h3>
              )}
              <div
                className={`flex items-center justify-center gap-1 ${multiDestino ? "mt-4" : ""}`}
              >
                {dias.map((dia, index) => (
                  <div key={dia} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        setDiaProgramacaoAtual((atual) => ({
                          ...atual,
                          [selecao.destinoSlug]: dia,
                        }))
                      }
                      aria-label={`Ir para o dia ${dia}${destinoInfo ? ` de ${destinoInfo.nome}` : ""}`}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        dia === diaAtivo
                          ? "bg-primary text-primary-foreground"
                          : "border-2 border-primary bg-transparent text-primary hover:bg-primary/10"
                      }`}
                    >
                      {dia}
                    </button>
                    {index < dias.length - 1 && (
                      <div className="h-0.5 w-8 bg-primary" />
                    )}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-sm font-medium text-muted-foreground">
                Dia {diaAtivo}
              </p>

              <div className="mt-4">{renderItensDoDia(itensDoDia)}</div>
            </div>
          );
        })}
      </div>
    );
  }

  function renderPainelDestino() {
    if (!selecaoAtual || !destinoAtualInfo) return null;

    const exps = (selecaoAtual.experienciaSlugs ?? [])
      .map((s) => experiencias.find((e) => e.slug === s))
      .filter((e): e is (typeof experiencias)[number] => !!e);
    const noites = noitesEntre(selecaoAtual.dataInicio, selecaoAtual.dataFim);
    const interesses = selecaoAtual.interesses ?? [];
    const inclusos = selecaoAtual.inclusos ?? [];

    return (
      <div className="space-y-6">
        {plano.selecoes.length > 1 && (
          <div className="flex items-center justify-center gap-1">
            {plano.selecoes.map((s, i) => {
              const ativo = i === destinoAtualIndex;
              return (
                <div key={s.destinoSlug} className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setDestinoAtualIndex(i)}
                    aria-label={`Ir para o destino ${i + 1}`}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                      ativo
                        ? "bg-primary text-primary-foreground"
                        : "border-2 border-primary bg-transparent text-primary hover:bg-primary/10"
                    }`}
                  >
                    {i + 1}
                  </button>
                  {i < plano.selecoes.length - 1 && (
                    <div className="h-0.5 w-8 bg-primary" />
                  )}
                </div>
              );
            })}
          </div>
        )}
        {plano.selecoes.length > 1 && (
          <p className="text-center text-sm font-medium text-muted-foreground">
            {destinoAtualInfo.nome}
          </p>
        )}

        <div className="relative overflow-hidden rounded-2xl">
          {destinoAtualInfo.imagem ? (
            <img
              src={destinoAtualInfo.imagem}
              alt={destinoAtualInfo.alt}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 bg-forest-800" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/75 to-forest-900/60" />
          <div className="relative p-6">
            <p className="font-display text-xl text-sand-50">
              {destinoAtualInfo.nome}
            </p>
            <p className="mt-1 text-sm text-sand-50/80">
              {selecaoAtual.dataInicio && selecaoAtual.dataFim
                ? `${new Date(`${selecaoAtual.dataInicio}T00:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${selecaoAtual.dataFim}T00:00:00`).toLocaleDateString("pt-BR")} · ${noites} noites`
                : "Datas a combinar"}
            </p>

            <div className="mt-6 grid items-start gap-8 lg:grid-cols-[1fr_auto]">
              <div className="order-2 space-y-6 lg:order-1">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-sand-50">
                      Adultos
                    </label>
                    <input
                      type="number"
                      value={selecaoAtual.adultos ?? 2}
                      disabled
                      className="mt-1.5 w-full rounded-xl border border-sand-50/30 bg-background/90 px-4 py-2.5 text-sm outline-none disabled:opacity-90"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-sand-50">
                      Crianças
                    </label>
                    <input
                      type="number"
                      value={selecaoAtual.criancas ?? 0}
                      disabled
                      className="mt-1.5 w-full rounded-xl border border-sand-50/30 bg-background/90 px-4 py-2.5 text-sm outline-none disabled:opacity-90"
                    />
                  </div>
                </div>
                {(selecaoAtual.idadesCriancas ?? []).length > 0 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {(selecaoAtual.idadesCriancas ?? []).map((idade, i) => (
                      <div key={i}>
                        <label className="text-sm font-medium text-sand-50">
                          Idade da criança {i + 1}
                        </label>
                        <input
                          type="number"
                          value={idade}
                          disabled
                          className="mt-1.5 w-full rounded-xl border border-sand-50/30 bg-background/90 px-4 py-2.5 text-sm outline-none disabled:opacity-90"
                        />
                      </div>
                    ))}
                  </div>
                )}
                {exps.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-sand-50">
                      Experiências em {destinoAtualInfo.nome.split(",")[0]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {exps.map((exp) => (
                        <span
                          key={exp.slug}
                          className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
                        >
                          <Check className="h-3.5 w-3.5" />
                          {exp.titulo}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {interesses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-sand-50">
                      Interesses em {destinoAtualInfo.nome.split(",")[0]}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {interesses.map((interesse) => (
                        <span
                          key={interesse}
                          className="rounded-full border border-sand-50/40 bg-sand-50/10 px-3 py-1.5 text-sm text-sand-50"
                        >
                          {interesse}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {inclusos.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-sand-50">
                      O que gostaria que estivesse incluso em{" "}
                      {destinoAtualInfo.nome.split(",")[0]}?
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {inclusos.map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-sand-50/40 bg-sand-50/10 px-3 py-1.5 text-sm text-sand-50"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selecaoAtual.contextoDestino && (
                  <div>
                    <label className="text-sm font-medium text-sand-50">
                      O que vai fazer da passagem por{" "}
                      {destinoAtualInfo.nome.split(",")[0]} inesquecível
                    </label>
                    <textarea
                      rows={2}
                      value={selecaoAtual.contextoDestino}
                      disabled
                      className="mt-1.5 w-full resize-none rounded-xl border border-sand-50/30 bg-background/90 px-4 py-2.5 text-sm text-foreground outline-none disabled:opacity-90"
                    />
                  </div>
                )}
              </div>
              <div className="order-1 flex justify-center lg:order-2">
                <Calendar
                  rangeStart={selecaoAtual.dataInicio}
                  rangeEnd={selecaoAtual.dataFim}
                  onSelect={() => {}}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <section className="section-padding print:hidden">
        <div className="container-tight">
          <div className="mx-auto max-w-2xl">
            <button
              type="button"
              onClick={onVoltar}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para minhas viagens
            </button>

            <div className="mt-6 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Planejar viagem
              </span>
              <h1 className="mt-3 text-balance text-3xl md:text-4xl">
                Viagem de {nomeUsuario} para {juntarNomes(nomesDestinos)}
              </h1>
              <p className="mt-4 text-muted-foreground">
                {inicioGeral && fimGeral
                  ? `${new Date(`${inicioGeral}T00:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${fimGeral}T00:00:00`).toLocaleDateString("pt-BR")}`
                  : "Datas a combinar"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Enviado em{" "}
                {new Date(plano.criadoEm).toLocaleDateString("pt-BR")}.
              </p>
              <p className="mt-2">
                <span
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                    planoAtual.pacoteFechado
                      ? "bg-green-100 text-green-900"
                      : planoAtual.pacoteRevisado
                        ? "bg-blue-100 text-blue-900"
                        : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {planoAtual.pacoteFechado
                    ? "Contrato fechado"
                    : planoAtual.pacoteRevisado
                      ? "Aguardando pagamento"
                      : "Em análise"}
                </span>
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                Previsão de retorno até{" "}
                {new Date(
                  new Date(plano.criadoEm).getTime() +
                    PRAZO_RESPOSTA_ANALISTA_HORAS * 60 * 60 * 1000,
                ).toLocaleDateString("pt-BR")}{" "}
                às{" "}
                {new Date(
                  new Date(plano.criadoEm).getTime() +
                    PRAZO_RESPOSTA_ANALISTA_HORAS * 60 * 60 * 1000,
                ).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="mx-auto max-w-3xl">
            <div className="flex items-center justify-between gap-1 print:hidden">
              {CONSULTA_STEP_ORDER.map((s, index) => {
                const ativo = s === stepConsulta;
                const consultavel =
                  s !== "tipo" &&
                  (s !== "itinerario" ||
                    (planoAtual.sinalPago && pacoteRevisavel)) &&
                  (s !== "pacote" ||
                    (planoAtual.sinalPago &&
                      pacoteRevisavel &&
                      chegouAoPacote)) &&
                  (s !== "pagamento" ||
                    (planoAtual.sinalPago &&
                      pacoteRevisavel &&
                      planoAtual.pacoteRevisado)) &&
                  (s !== "fechado" || planoAtual.pacoteFechado);
                return (
                  <div key={s} className="flex flex-1 items-center gap-1">
                    <button
                      type="button"
                      disabled={!consultavel}
                      onClick={() => {
                        if (consultavel) setStepConsulta(s);
                      }}
                      aria-label={
                        consultavel
                          ? `Ver ${CONSULTA_STEP_LABELS[s]}`
                          : undefined
                      }
                      aria-hidden={!consultavel}
                      tabIndex={consultavel ? 0 : -1}
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        !consultavel
                          ? "cursor-default border-2 border-border bg-transparent text-muted-foreground/40"
                          : ativo
                            ? "bg-primary text-primary-foreground"
                            : "border-2 border-primary bg-transparent text-primary hover:bg-primary/10"
                      }`}
                    >
                      {index + 1}
                    </button>
                    {index < CONSULTA_STEP_ORDER.length - 1 && (
                      <div className="h-0.5 flex-1 bg-primary/40" />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-center text-sm font-medium text-muted-foreground print:hidden">
              {CONSULTA_STEP_LABELS[stepConsulta]}
            </p>

            <div className="mt-10 print:hidden">
              {stepConsulta === "selecao" && (
                <div className="mx-auto max-w-4xl space-y-12">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                      {plano.tipoInicial === "experiencias"
                        ? "Já sei o que quero viver"
                        : "Já sei o destino"}
                    </span>
                    <h2 className="mt-3 text-balance text-2xl md:text-3xl">
                      Destinos escolhidos
                    </h2>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {plano.selecoes.map((selecao) => {
                        const destino = destinos.find(
                          (d) => d.slug === selecao.destinoSlug,
                        );
                        if (!destino) return null;
                        return (
                          <div
                            key={selecao.destinoSlug}
                            className="relative overflow-hidden rounded-2xl border-2 border-primary"
                          >
                            <img
                              src={destino.imagem}
                              alt={destino.alt}
                              className="aspect-[4/3] w-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/80 via-forest-900/10 to-transparent" />
                            <div className="absolute right-3 top-3 rounded-full bg-primary p-1.5 text-primary-foreground">
                              <Check className="h-4 w-4" />
                            </div>
                            <p className="absolute bottom-3 left-4 right-4 font-display text-lg text-sand-50">
                              {destino.nome}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {plano.selecoes.map((selecao) => {
                    const destino = destinos.find(
                      (d) => d.slug === selecao.destinoSlug,
                    );
                    if (!destino) return null;
                    const escolhidas = (selecao.experienciaSlugs ?? [])
                      .map((s) => experiencias.find((e) => e.slug === s))
                      .filter((e): e is (typeof experiencias)[number] => !!e);
                    if (escolhidas.length === 0) return null;

                    return (
                      <div key={selecao.destinoSlug}>
                        <h3 className="font-display text-xl">
                          O que você quer viver em {destino.nome.split(",")[0]}?
                        </h3>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {escolhidas.map((exp) => (
                            <span
                              key={exp.slug}
                              className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                            >
                              <Check className="h-3.5 w-3.5" />
                              {exp.titulo}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {stepConsulta === "calendario" && renderPainelDestino()}

              {stepConsulta === "detalhes" &&
                (() => {
                  const experienciaSlugsUnicos = Array.from(
                    new Set(
                      plano.selecoes.flatMap((s) => s.experienciaSlugs ?? []),
                    ),
                  );
                  const experienciasUnicas = experienciaSlugsUnicos
                    .map((s) => experiencias.find((e) => e.slug === s))
                    .filter((e): e is (typeof experiencias)[number] => !!e);

                  const interessesUnicos = Array.from(
                    new Set(
                      plano.selecoes.flatMap((s) => s.interesses ?? []),
                    ),
                  );

                  return (
                    <div className="mx-auto max-w-3xl space-y-8">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Destinos
                        </p>
                        <div className="mt-3 grid gap-6 sm:grid-cols-2">
                          {plano.selecoes.map((selecao) => {
                            const destino = destinos.find(
                              (d) => d.slug === selecao.destinoSlug,
                            );
                            const noites = noitesEntre(
                              selecao.dataInicio,
                              selecao.dataFim,
                            );

                            return (
                              <div
                                key={selecao.destinoSlug}
                                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                              >
                                <div className="relative aspect-[4/3] overflow-hidden">
                                  {destino?.imagem ? (
                                    <img
                                      src={destino.imagem}
                                      alt={destino.alt}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full bg-forest-800" />
                                  )}
                                  <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 to-transparent" />
                                  <div className="absolute bottom-4 left-4 right-4">
                                    <h3 className="font-display text-2xl text-sand-50">
                                      {destino?.nome}
                                    </h3>
                                    <p className="text-sm text-forest-100">
                                      {selecao.dataInicio && selecao.dataFim
                                        ? `${new Date(`${selecao.dataInicio}T00:00:00`).toLocaleDateString("pt-BR")} a ${new Date(`${selecao.dataFim}T00:00:00`).toLocaleDateString("pt-BR")} · ${noites} noites · ${selecao.adultos ?? 2} adulto(s)${(selecao.criancas ?? 0) > 0 ? `, ${selecao.criancas} criança(s)` : ""}`
                                        : "Datas a combinar"}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex-1 p-6">
                                  <p className="text-sm leading-relaxed text-muted-foreground">
                                    {selecao.contextoDestino ||
                                      "Sem comentários adicionais para esse destino."}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {experienciasUnicas.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Experiências
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {experienciasUnicas.map((exp) => (
                              <span
                                key={exp.slug}
                                className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                              >
                                <Check className="h-3.5 w-3.5" />
                                {exp.titulo}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {interessesUnicos.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Interesses
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {interessesUnicos.map((interesse) => (
                              <span
                                key={interesse}
                                className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                              >
                                <Check className="h-3.5 w-3.5" />
                                {interesse}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

              {stepConsulta === "analise" && (
                <div className="mx-auto max-w-2xl space-y-6">
                  <div className="text-center">
                    <h2 className="font-display text-2xl md:text-3xl">
                      Análise da nossa equipe
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Você pode enviar dúvidas por aqui a qualquer momento.
                    </p>
                  </div>

                  <div>
                    {interacoes.map((interacao, index) => {
                      const isUsuario = interacao.autor === "usuario";
                      const isUltima = index === interacoes.length - 1;
                      return (
                        <div key={interacao.id} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary">
                              {isUsuario && avatarUrlUsuario ? (
                                <img
                                  src={avatarUrlUsuario}
                                  alt={nomeUsuario}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <User
                                  className={`h-4 w-4 ${isUsuario ? "text-primary" : "text-muted-foreground"}`}
                                />
                              )}
                            </div>
                            {!isUltima && (
                              <div className="mt-1 w-0.5 flex-1 bg-border" />
                            )}
                          </div>
                          <div className={isUltima ? "flex-1" : "flex-1 pb-6"}>
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              {interacao.autor === "usuario"
                                ? "Você"
                                : "Analista da Aventura Organizada"}{" "}
                              ·{" "}
                              {new Date(interacao.criadoEm).toLocaleDateString(
                                "pt-BR",
                              )}{" "}
                              às{" "}
                              {new Date(interacao.criadoEm).toLocaleTimeString(
                                "pt-BR",
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                            <p className="mt-1.5 text-sm text-foreground">
                              {interacao.texto}
                            </p>

                            {interacao.tipo === "sugestao" && (
                              <div className="mt-3">
                                {interacao.imagem && (
                                  <img
                                    src={interacao.imagem}
                                    alt={interacao.texto}
                                    className="mb-3 aspect-[4/3] w-full max-w-xs rounded-2xl object-cover"
                                    loading="lazy"
                                  />
                                )}
                                {interacao.opcoes ? (
                                  <div className="flex flex-wrap gap-2">
                                    {interacao.opcoes.map((opcao) => {
                                      const respondida =
                                        !!interacao.respostaEscolhida;
                                      const escolhida =
                                        interacao.respostaEscolhida ===
                                        opcao.label;
                                      return (
                                        <button
                                          key={opcao.id}
                                          type="button"
                                          disabled={respondida}
                                          onClick={() =>
                                            handleResponderPergunta(
                                              interacao.id,
                                              opcao.id,
                                            )
                                          }
                                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors ${
                                            escolhida
                                              ? "bg-primary text-primary-foreground"
                                              : respondida
                                                ? "cursor-default border border-border text-muted-foreground/50"
                                                : "border border-primary text-primary hover:bg-primary/10"
                                          }`}
                                        >
                                          {escolhida && (
                                            <Check className="h-3.5 w-3.5" />
                                          )}
                                          {opcao.label}
                                        </button>
                                      );
                                    })}
                                  </div>
                                ) : interacao.sugestaoStatus === "aceita" ? (
                                  <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                      <Check className="h-3.5 w-3.5" />
                                      Sugestão aceita
                                    </span>
                                    {interacao.itemItinerario && (
                                      <span className="text-xs font-medium text-muted-foreground">
                                        Dia {interacao.itemItinerario.dia} ·{" "}
                                        {interacao.itemItinerario.horario}
                                      </span>
                                    )}
                                  </div>
                                ) : interacao.sugestaoStatus === "recusada" ? (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
                                    <X className="h-3.5 w-3.5" />
                                    Sugestão recusada
                                  </span>
                                ) : (
                                  <div className="flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleResponderSugestao(
                                          interacao.id,
                                          "aceita",
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                      Aceitar
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleResponderSugestao(
                                          interacao.id,
                                          "recusada",
                                        )
                                      }
                                      className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-foreground transition-colors hover:bg-secondary"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                      Recusar
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}

                            {interacao.tipo === "plano_pronto" && (
                              <div className="mt-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                                {planoAtual.sinalPago ? (
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                      <Check className="h-3.5 w-3.5" />
                                      Sinal pago
                                    </span>
                                    <Link
                                      to="/pagamentos/$pagamentoId"
                                      params={{ pagamentoId: `${planoAtual.id}:sinal` }}
                                      className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                                    >
                                      Ver detalhes do pagamento
                                    </Link>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setModalPagamento("sinal")}
                                    disabled={pagando}
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                                  >
                                    {pagando ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Processando pagamento...
                                      </>
                                    ) : (
                                      <>
                                        <CreditCard className="h-4 w-4" />
                                        Pagar sinal (R${" "}
                                        {VALOR_SINAL_REAIS.toLocaleString(
                                          "pt-BR",
                                        )}
                                        )
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            )}

                            {interacao.tipo === "pacote_pronto" && (
                              <div className="mt-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                                {planoAtual.pacoteFechado ? (
                                  <div className="flex flex-wrap items-center gap-3">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                                      <Check className="h-3.5 w-3.5" />
                                      Pacote fechado
                                    </span>
                                    <Link
                                      to="/pagamentos/$pagamentoId"
                                      params={{ pagamentoId: `${planoAtual.id}:pacote` }}
                                      className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                                    >
                                      Ver detalhes do pagamento
                                    </Link>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => setStepConsulta("itinerario")}
                                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                                  >
                                    Ver programação da viagem
                                    <ArrowRight className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-4">
                    <label
                      htmlFor="mensagem-analista"
                      className="text-sm font-medium text-foreground"
                    >
                      Enviar mensagem para o analista
                    </label>
                    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                      <textarea
                        id="mensagem-analista"
                        rows={2}
                        value={mensagem}
                        onChange={(e) => setMensagem(e.target.value)}
                        placeholder="Escreva sua dúvida ou comentário..."
                        className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={handleEnviarMensagem}
                        disabled={!mensagem.trim()}
                        className="inline-flex shrink-0 items-center justify-center gap-2 self-end rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40 sm:self-stretch"
                      >
                        <Send className="h-4 w-4" />
                        Enviar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {stepConsulta === "itinerario" &&
                (() => {
                  if (!planoAtual.sinalPago || !pacoteRevisavel) {
                    return (
                      <div className="mx-auto max-w-2xl space-y-4 text-center">
                        <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
                        <h2 className="font-display text-2xl md:text-3xl">
                          Programação da viagem
                        </h2>
                        <p className="text-sm text-muted-foreground">
                          {!planoAtual.sinalPago
                            ? `Essa etapa libera assim que você confirmar o pagamento do sinal de R$ ${VALOR_SINAL_REAIS} solicitado pelo analista, na etapa 5.`
                            : "Essa etapa libera assim que o analista avisar, na etapa 5, que a programação da viagem está completa."}
                        </p>
                        <button
                          type="button"
                          onClick={() => setStepConsulta("analise")}
                          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Voltar para a análise
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="mx-auto max-w-2xl space-y-8">
                      <div className="text-center">
                        <h2 className="font-display text-2xl md:text-3xl">
                          Programação da viagem
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Navegue pelos dias da viagem. Ainda dá pra ajustar
                          horários e locais na etapa 5.
                        </p>
                      </div>

                      {renderProgramacaoPorDia()}

                      <div className="flex items-center justify-between border-t border-border pt-6">
                        <button
                          type="button"
                          onClick={() => setStepConsulta("analise")}
                          className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Ajustar com o analista
                        </button>
                        {pacoteRevisavel && !planoAtual.pacoteFechado && (
                          <button
                            type="button"
                            onClick={() => {
                              setChegouAoPacote(true);
                              setStepConsulta("pacote");
                            }}
                            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                          >
                            Revisar e fechar o pacote
                            <ArrowRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })()}

              {stepConsulta === "pacote" && (
                <div className="mx-auto max-w-2xl space-y-10">
                  <div className="text-center">
                    <h2 className="font-display text-2xl md:text-3xl">
                      Revisão do pacote completo
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                      O pré-fechamento: toda a viagem, dia a dia, com
                      restaurantes, tipo de refeição, horários e duração
                      prevista de cada atividade. Confira tudo antes de
                      fechar o pacote.
                    </p>
                  </div>

                  {renderFichaProgramacao()}

                  <div className="flex items-center justify-between border-t border-border pt-6">
                    <button
                      type="button"
                      onClick={() => setStepConsulta("analise")}
                      className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Ajustar com o analista
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmarRevisao}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                    >
                      Fechar pacote
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {stepConsulta === "pagamento" && (
                <div className="mx-auto max-w-md space-y-6 text-center">
                  <h2 className="font-display text-2xl md:text-3xl">
                    Pagamento final
                  </h2>
                  {!planoAtual.pacoteRevisado ? (
                    <>
                      <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Essa etapa libera depois que você revisar a ficha
                        completa e confirmar "Fechar pacote" na etapa 7.
                      </p>
                      <button
                        type="button"
                        onClick={() => setStepConsulta("pacote")}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Revisar o pacote
                      </button>
                    </>
                  ) : planoAtual.pacoteFechado ? (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Pagamento já confirmado — sua viagem está garantida!
                      </p>
                      {planoAtual.pacotePagamentoDetalhes && (
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setConteudoImpressao("pagamento");
                              window.print();
                            }}
                            className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary/10"
                          >
                            <Download className="h-4 w-4" />
                            Baixar PDF com detalhes do pagamento
                          </button>
                          <a
                            href={planoAtual.pacotePagamentoDetalhes.notaFiscalUrl}
                            target="_blank"
                            rel="noreferrer"
                            download="nota-fiscal.html"
                            className="inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary/10"
                          >
                            <Download className="h-4 w-4" />
                            Baixar nota fiscal
                          </a>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">
                        Saldo restante do pacote, já descontado o sinal de R${" "}
                        {VALOR_SINAL_REAIS}.
                      </p>
                      <p className="font-display text-3xl">
                        R${" "}
                        {(
                          planoAtual.valorPacoteReais - VALOR_SINAL_REAIS
                        ).toLocaleString("pt-BR")}
                      </p>
                      <button
                        type="button"
                        onClick={() => setModalPagamento("pacote")}
                        disabled={pagando}
                        className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
                      >
                        {pagando ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Processando pagamento...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-4 w-4" />
                            Confirmar pagamento
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}

              {stepConsulta === "fechado" && (
                <div className="mx-auto max-w-md space-y-4 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    <Check className="h-3.5 w-3.5" />
                    Contratação fechada
                  </span>
                  <h2 className="font-display text-2xl md:text-3xl">
                    Viagem confirmada!
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Recebemos o pagamento e sua viagem está garantida. Nossa
                    equipe segue à disposição pra qualquer ajuste até a data
                    da partida.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setConteudoImpressao("ficha");
                      window.print();
                    }}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    <Download className="h-4 w-4" />
                    Baixar PDF da confirmação
                  </button>
                </div>
              )}

            </div>

            {/* Relatório completo pra impressão/PDF — só aparece ao imprimir. */}
            {conteudoImpressao === "ficha" && (
              <div className="hidden print:block">
                <h1 className="font-display text-2xl">Confirmação de viagem</h1>
                <p className="mt-1 text-sm font-semibold">
                  Contratação fechada — programação completa a seguir.
                </p>
                <div className="mt-6">{renderFichaProgramacao()}</div>
              </div>
            )}

            {/* Comprovante de pagamento do pacote pra impressão/PDF. */}
            {conteudoImpressao === "pagamento" &&
              planoAtual.pacotePagamentoDetalhes && (
                <div className="hidden print:block">
                  <h1 className="font-display text-2xl">
                    Comprovante de pagamento
                  </h1>
                  <p className="mt-1 text-sm font-semibold">
                    Aventura Organizada — CNPJ 12.345.678/0001-90
                  </p>
                  <dl className="mt-6 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Viagem</dt>
                    <dd className="font-semibold">
                      {juntarNomes(nomesDestinos)}
                    </dd>
                    <dt className="text-muted-foreground">Referente a</dt>
                    <dd className="font-semibold">
                      Fechamento do pacote — viagem para{" "}
                      {juntarNomes(nomesDestinos)}
                    </dd>
                    <dt className="text-muted-foreground">Valor pago</dt>
                    <dd className="font-semibold">
                      R${" "}
                      {(
                        planoAtual.valorPacoteReais - VALOR_SINAL_REAIS
                      ).toLocaleString("pt-BR")}
                    </dd>
                    <dt className="text-muted-foreground">Data e hora</dt>
                    <dd className="font-semibold">
                      {planoAtual.pacoteFechadoEm
                        ? new Date(planoAtual.pacoteFechadoEm).toLocaleString(
                            "pt-BR",
                          )
                        : "—"}
                    </dd>
                    <dt className="text-muted-foreground">Meio de pagamento</dt>
                    <dd className="font-semibold">
                      {planoAtual.pacotePagamentoDetalhes.metodo}
                    </dd>
                    <dt className="text-muted-foreground">Dados do pagamento</dt>
                    <dd className="font-semibold">
                      {planoAtual.pacotePagamentoDetalhes.dadosMascarados}
                    </dd>
                    <dt className="text-muted-foreground">
                      Código de confirmação
                    </dt>
                    <dd className="font-semibold">
                      {planoAtual.pacotePagamentoDetalhes.codigoConfirmacao}
                    </dd>
                    <dt className="text-muted-foreground">
                      Código de retorno
                    </dt>
                    <dd className="font-semibold">
                      {planoAtual.pacotePagamentoDetalhes.codigoRetorno}
                    </dd>
                  </dl>
                </div>
              )}
          </div>
        </div>
      </section>

      <PagamentoModal
        aberto={modalPagamento !== null}
        titulo={
          modalPagamento === "sinal" ? "Pagamento do sinal" : "Pagamento final"
        }
        valorReais={
          modalPagamento === "sinal"
            ? VALOR_SINAL_REAIS
            : planoAtual.valorPacoteReais - VALOR_SINAL_REAIS
        }
        processando={pagando}
        onConfirmar={
          modalPagamento === "sinal" ? handlePagarSinal : handleFecharPacote
        }
        onFechar={() => {
          if (!pagando) setModalPagamento(null);
        }}
      />
    </>
  );
}
