import {
  AlertTriangle,
  Barcode,
  Check,
  Copy,
  CreditCard,
  Landmark,
  Loader2,
  QrCode,
  Wallet,
  X,
} from "lucide-react";
import { useState, type FormEvent } from "react";

import {
  gerarCodigoConfirmacao,
  gerarNotaFiscalUrl,
  type DetalhesPagamentoRealizado,
} from "@/lib/trip-plan";

type MetodoPagamento = "pix" | "debito" | "credito" | "boleto";

const METODOS: { id: MetodoPagamento; label: string; icon: typeof Wallet }[] = [
  { id: "pix", label: "Pix", icon: QrCode },
  { id: "debito", label: "Débito", icon: Wallet },
  { id: "credito", label: "Crédito", icon: CreditCard },
  { id: "boleto", label: "Boleto", icon: Barcode },
];

function formatarNumeroCartao(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 16);
  return digitos.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function formatarValidade(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 4);
  if (digitos.length <= 2) return digitos;
  return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
}

function formatarCvv(valor: string): string {
  return valor.replace(/\D/g, "").slice(0, 4);
}

function mascararNome(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  return partes
    .map((parte, i) =>
      i === 0 ? parte : `${parte[0] ?? ""}${"*".repeat(Math.max(parte.length - 1, 1))}`,
    )
    .join(" ");
}

const METODO_LABEL: Record<MetodoPagamento, string> = {
  pix: "Pix",
  debito: "Cartão de débito",
  credito: "Cartão de crédito",
  boleto: "Boleto bancário",
};

interface PagamentoModalProps {
  aberto: boolean;
  titulo: string;
  valorReais: number;
  processando: boolean;
  onConfirmar: (detalhes: DetalhesPagamentoRealizado) => void;
  onFechar: () => void;
}

export function PagamentoModal({
  aberto,
  titulo,
  valorReais,
  processando,
  onConfirmar,
  onFechar,
}: PagamentoModalProps) {
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");
  const [numeroCartao, setNumeroCartao] = useState("");
  const [nomeCartao, setNomeCartao] = useState("");
  const [validadeCartao, setValidadeCartao] = useState("");
  const [cvv, setCvv] = useState("");
  const [parcelas, setParcelas] = useState(1);
  const [pixCopiado, setPixCopiado] = useState(false);
  const [boletoCopiado, setBoletoCopiado] = useState(false);

  if (!aberto) return null;

  const cartaoValido =
    numeroCartao.replace(/\s/g, "").length === 16 &&
    nomeCartao.trim().length > 1 &&
    /^\d{2}\/\d{2}$/.test(validadeCartao) &&
    cvv.length >= 3;

  const podeConfirmar =
    metodo === "pix" || metodo === "boleto" || cartaoValido;

  const codigoPix =
    "00020126580014BR.GOV.BCB.PIX0136aventura-organizada@pix.com.br5204000053039865406" +
    valorReais.toFixed(2).replace(".", "") +
    "5802BR5913AVENTURA ORG6009SAO PAULO62070503***6304ABCD";

  const linhaBoleto = "23793.39001 60000.000001 00000.123456 7 89870000" +
    String(Math.round(valorReais * 100)).padStart(8, "0");

  async function copiar(texto: string, setCopiado: (v: boolean) => void) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // Clipboard pode não estar disponível (ex: contexto não seguro) — sem problema, é só uma conveniência.
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!podeConfirmar || processando) return;

    const codigoConfirmacao = gerarCodigoConfirmacao();
    const codigoRetorno = `00-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    let dadosMascarados: string;
    if (metodo === "pix") {
      dadosMascarados = "Pagamento via Pix (chave aventura-organizada@pix.com.br)";
    } else if (metodo === "boleto") {
      dadosMascarados = `Boleto terminado em ${linhaBoleto.slice(-4)}`;
    } else {
      const ultimosDigitos = numeroCartao.replace(/\D/g, "").slice(-4);
      dadosMascarados = `Cartão •••• •••• •••• ${ultimosDigitos} — titular ${mascararNome(nomeCartao)}`;
    }

    const notaFiscalUrl = gerarNotaFiscalUrl({
      titulo,
      valorReais,
      metodoLabel: METODO_LABEL[metodo],
      codigoConfirmacao,
    });

    onConfirmar({
      metodo,
      dadosMascarados,
      codigoConfirmacao,
      codigoRetorno,
      notaFiscalUrl,
      parcelas: metodo === "credito" ? parcelas : undefined,
    });
  }

  const valorParcela = valorReais / parcelas;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-forest-900/70 p-4"
      onClick={onFechar}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl">{titulo}</h2>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              R$ {valorReais.toLocaleString("pt-BR")}
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {METODOS.map((m) => {
            const Icon = m.icon;
            const ativo = metodo === m.id;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetodo(m.id)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-semibold uppercase tracking-wide transition-colors ${
                  ativo
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/40"
                }`}
              >
                <Icon className="h-5 w-5" />
                {m.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {metodo === "pix" && (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-40 w-40 items-center justify-center rounded-xl border-2 border-dashed border-border bg-secondary/40">
                <QrCode className="h-20 w-20 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code com o app do seu banco ou copie o código
                abaixo.
              </p>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
                <p className="flex-1 truncate text-left text-xs text-muted-foreground">
                  {codigoPix}
                </p>
                <button
                  type="button"
                  onClick={() => copiar(codigoPix, setPixCopiado)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {pixCopiado ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {pixCopiado ? "Copiado" : "Copiar"}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                A confirmação via Pix é automática, geralmente em poucos
                segundos.
              </p>
            </div>
          )}

          {(metodo === "debito" || metodo === "credito") && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="numero-cartao"
                  className="text-sm font-medium text-foreground"
                >
                  Número do cartão
                </label>
                <input
                  id="numero-cartao"
                  type="text"
                  inputMode="numeric"
                  value={numeroCartao}
                  onChange={(e) =>
                    setNumeroCartao(formatarNumeroCartao(e.target.value))
                  }
                  placeholder="0000 0000 0000 0000"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div>
                <label
                  htmlFor="nome-cartao"
                  className="text-sm font-medium text-foreground"
                >
                  Nome impresso no cartão
                </label>
                <input
                  id="nome-cartao"
                  type="text"
                  value={nomeCartao}
                  onChange={(e) => setNomeCartao(e.target.value)}
                  placeholder="Como está no cartão"
                  className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="validade-cartao"
                    className="text-sm font-medium text-foreground"
                  >
                    Validade
                  </label>
                  <input
                    id="validade-cartao"
                    type="text"
                    inputMode="numeric"
                    value={validadeCartao}
                    onChange={(e) =>
                      setValidadeCartao(formatarValidade(e.target.value))
                    }
                    placeholder="MM/AA"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="cvv-cartao"
                    className="text-sm font-medium text-foreground"
                  >
                    CVV
                  </label>
                  <input
                    id="cvv-cartao"
                    type="text"
                    inputMode="numeric"
                    value={cvv}
                    onChange={(e) => setCvv(formatarCvv(e.target.value))}
                    placeholder="123"
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  />
                </div>
              </div>

              {metodo === "credito" && (
                <div>
                  <label
                    htmlFor="parcelas"
                    className="text-sm font-medium text-foreground"
                  >
                    Parcelas
                  </label>
                  <select
                    id="parcelas"
                    value={parcelas}
                    onChange={(e) => setParcelas(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-primary"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}x de R${" "}
                        {(valorReais / n).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}{" "}
                        sem juros
                      </option>
                    ))}
                  </select>
                  {parcelas > 1 && (
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Total em {parcelas}x: R${" "}
                      {(valorParcela * parcelas).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {metodo === "boleto" && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                <p className="text-sm text-amber-900">
                  O pagamento por boleto depende de processamento bancário e
                  pode levar até 3 dias úteis pra ser compensado — a
                  confirmação não é imediata.
                </p>
              </div>
              <div>
                <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Landmark className="h-4 w-4 text-primary" />
                  Linha digitável
                </p>
                <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-secondary/40 px-3 py-2.5">
                  <p className="flex-1 truncate text-xs text-muted-foreground">
                    {linhaBoleto}
                  </p>
                  <button
                    type="button"
                    onClick={() => copiar(linhaBoleto, setBoletoCopiado)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {boletoCopiado ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {boletoCopiado ? "Copiado" : "Copiar"}
                  </button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Vencimento em 3 dias úteis. Nesta simulação, consideramos o
                pagamento confirmado ao gerar o boleto.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={!podeConfirmar || processando}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {processando ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processando pagamento...
              </>
            ) : metodo === "boleto" ? (
              <>
                <Barcode className="h-4 w-4" />
                Gerar boleto
              </>
            ) : metodo === "pix" ? (
              <>
                <QrCode className="h-4 w-4" />
                Confirmar pagamento via Pix
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Pagar com cartão
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
