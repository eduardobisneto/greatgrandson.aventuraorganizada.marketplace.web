import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { RequireAuth } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth-context";
import {
  getPagamentosDoUsuario,
  onPlanosAtualizados,
  type Pagamento,
} from "@/lib/trip-plan";

export const Route = createFileRoute("/pagamentos")({
  component: () => (
    <RequireAuth>
      <PagamentosPage />
    </RequireAuth>
  ),
});

function PagamentosPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);

  useEffect(() => {
    if (!user) return;
    function recalcular() {
      if (user) setPagamentos(getPagamentosDoUsuario(user.id));
    }
    recalcular();
    return onPlanosAtualizados(recalcular);
  }, [user]);

  function abrirPagamento(pagamento: Pagamento) {
    navigate({
      to: "/pagamentos/$pagamentoId",
      params: { pagamentoId: pagamento.id },
    });
  }

  return (
    <>
      <section className="section-padding">
        <div className="container-tight">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Minha conta
          </span>
          <h1 className="mt-3 text-balance text-3xl md:text-4xl">
            Pagamentos
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sinais e pagamentos de pacote das suas viagens.
          </p>
        </div>
      </section>

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="mx-auto max-w-2xl space-y-4">
            {pagamentos.length === 0 && (
              <p className="text-center text-sm text-muted-foreground">
                Nenhum pagamento por aqui ainda.
              </p>
            )}

            {pagamentos.map((pagamento) => (
              <button
                key={pagamento.id}
                type="button"
                onClick={() => abrirPagamento(pagamento)}
                className="flex w-full items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5 text-left transition-colors hover:border-primary"
              >
                <div>
                  <p className="font-display text-lg">
                    {pagamento.descricao}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    R$ {pagamento.valorReais.toLocaleString("pt-BR")} ·
                    Vencimento em{" "}
                    {new Date(pagamento.dataVencimento).toLocaleDateString(
                      "pt-BR",
                    )}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
                    pagamento.status === "pago"
                      ? "bg-green-100 text-green-900"
                      : "bg-amber-100 text-amber-900"
                  }`}
                >
                  {pagamento.status === "pago" ? "Pago" : "Aguardando pagamento"}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
