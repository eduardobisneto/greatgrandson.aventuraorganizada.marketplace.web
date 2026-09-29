import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Clock, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import {
  getPagamentoPorId,
  onPlanosAtualizados,
  type Pagamento,
} from "@/lib/trip-plan";

const METODO_LABEL: Record<string, string> = {
  pix: "Pix",
  debito: "Cartão de débito",
  credito: "Cartão de crédito",
  boleto: "Boleto bancário",
  outro: "Não informado",
};

const INFORMACOES_LABEL: Record<string, string> = {
  pix: "Chave Pix",
  debito: "Dados do cartão",
  credito: "Dados do cartão",
  boleto: "Linha digitável",
  outro: "Informações do pagamento",
};

export const Route = createFileRoute("/pagamentos_/$pagamentoId")({
  component: () => (
    <RequireAuth>
      <DetalhePagamentoPage />
    </RequireAuth>
  ),
});

function DetalhePagamentoPage() {
  const { pagamentoId } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pagamento, setPagamento] = useState<Pagamento | null>(null);

  useEffect(() => {
    if (!user) return;
    function recalcular() {
      if (user) setPagamento(getPagamentoPorId(user.id, pagamentoId));
    }
    recalcular();
    return onPlanosAtualizados(recalcular);
  }, [user, pagamentoId]);

  if (!pagamento) {
    return (
      <section className="section-padding">
        <div className="container-tight">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-muted-foreground">
              Não encontramos esse pagamento.
            </p>
            <Link
              to="/pagamentos"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para pagamentos
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const pago = pagamento.status === "pago";

  return (
    <>
      <section className="section-padding">
        <div className="container-tight">
          <div className="mx-auto max-w-xl">
            <Link
              to="/pagamentos"
              className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para pagamentos
            </Link>
            <span className="mt-6 block text-sm font-semibold uppercase tracking-wider text-primary">
              Detalhe do pagamento
            </span>
            <h1 className="mt-3 text-balance text-3xl md:text-4xl">
              {pagamento.descricao}
            </h1>
          </div>
        </div>
      </section>

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="mx-auto max-w-xl space-y-6">
            <div className="rounded-2xl border border-border bg-card p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Valor
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">
                    R$ {pagamento.valorReais.toLocaleString("pt-BR")}
                  </p>
                </div>
                <span
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                    pago
                      ? "bg-green-100 text-green-900"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {pago ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Clock className="h-3.5 w-3.5" />
                  )}
                  {pago ? "Pago" : "Aguardando pagamento"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Viagem
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {pagamento.destinoNomes}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Identificador da viagem
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {pagamento.planoId}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {pago ? "Data e hora do pagamento" : "Vencimento"}
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {pago && pagamento.dataPagamento
                      ? new Date(pagamento.dataPagamento).toLocaleString(
                          "pt-BR",
                        )
                      : new Date(pagamento.dataVencimento).toLocaleDateString(
                          "pt-BR",
                        )}
                  </p>
                </div>
                {pago && pagamento.detalhes && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Meio de pagamento
                    </p>
                    <p className="mt-1 text-sm text-foreground">
                      {METODO_LABEL[pagamento.detalhes.metodo] ??
                        pagamento.detalhes.metodo}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {pago && pagamento.detalhes && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {INFORMACOES_LABEL[pagamento.detalhes.metodo] ??
                    "Informações do pagamento"}
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {pagamento.detalhes.dadosMascarados}
                </p>
                {pagamento.detalhes.metodo !== "outro" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Por segurança (LGPD), exibimos apenas dados mascarados —
                    nunca o número completo do cartão ou dados sensíveis.
                  </p>
                )}
                {pagamento.detalhes.metodo === "boleto" && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Pagamentos por boleto dependem de compensação bancária,
                    que pode levar até 3 dias úteis.
                  </p>
                )}

                <div className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2">
                  {pagamento.detalhes.metodo === "credito" &&
                    !!pagamento.detalhes.parcelas &&
                    pagamento.detalhes.parcelas > 1 && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Parcelamento
                        </p>
                        <p className="mt-1 text-sm text-foreground">
                          {pagamento.detalhes.parcelas}x de R${" "}
                          {(
                            pagamento.valorReais / pagamento.detalhes.parcelas
                          ).toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                    )}
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Código de confirmação
                    </p>
                    <p className="mt-1 font-mono text-sm text-foreground">
                      {pagamento.detalhes.codigoConfirmacao}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Código de retorno da operadora
                    </p>
                    <p className="mt-1 font-mono text-sm text-foreground">
                      {pagamento.detalhes.codigoRetorno}
                    </p>
                  </div>
                </div>

                <a
                  href={pagamento.detalhes.notaFiscalUrl}
                  target="_blank"
                  rel="noreferrer"
                  download="nota-fiscal.html"
                  className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold uppercase tracking-wide text-primary transition-colors hover:bg-primary/10"
                >
                  <FileText className="h-4 w-4" />
                  Ver nota fiscal
                </a>
              </div>
            )}

            {!pago && (
              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/planejar-viagem",
                    search: {
                      planoId: pagamento.planoId,
                      step: pagamento.tipo === "sinal" ? "analise" : "pagamento",
                    },
                  })
                }
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Ir para o pagamento
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
