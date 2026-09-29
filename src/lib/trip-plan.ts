/**
 * Modelo e persistência (mockada) do plano de viagem montado pelo cliente
 * final no fluxo de "Planejar viagem".
 *
 * Hoje isso só grava no localStorage do navegador. Quando a
 * `cadastro.api` existir, o envio do resumo deve virar uma chamada real
 * pra ela (POST do plano), pra o analista da Aventura Organizada
 * conseguir ver e detalhar a proposta.
 */

import { destinos } from "@/data/destinos";
import hospedagemImg from "@/assets/hospedagem.jpeg";
import transporteImg from "@/assets/transporte.jpeg";

export interface SelecaoDestino {
  destinoSlug: string;
  experienciaSlugs: string[];
  dataInicio?: string | undefined;
  dataFim?: string | undefined;
  interesses: string[];
  adultos: number;
  criancas: number;
  /** Idade de cada criança, na mesma ordem — usada depois pra coletar nome/documento por criança. */
  idadesCriancas?: number[] | undefined;
  inclusos: string[];
  contextoDestino?: string | undefined;
}

export type CategoriaSugestao =
  | "voo"
  | "transfer"
  | "acomodacao"
  | "refeicao"
  | "passeio"
  | "geral";

/** Uma opção de resposta pra uma pergunta de múltipla escolha do analista. */
export interface OpcaoResposta {
  id: string;
  label: string;
}

export interface Interacao {
  id: string;
  autor: "usuario" | "analista";
  texto: string;
  criadoEm: string;
  tipo?: "mensagem" | "sugestao" | "plano_pronto" | "pacote_pronto";
  sugestaoStatus?: "pendente" | "aceita" | "recusada";
  /** Categoria da sugestão (voo, transfer, acomodação...) — ajuda a agrupar/filtrar no backoffice. */
  categoria?: CategoriaSugestao | undefined;
  /** Foto do que está sendo sugerido (hotel, passeio, etc.), enviada junto pelo analista. */
  imagem?: string | undefined;
  /** Item que entra na programação (etapa 6) quando essa sugestão for aceita. */
  itemItinerario?: Omit<ItemItinerario, "id"> | undefined;
  /** Itens que entram junto, sem precisar de sugestão própria (ex: café da manhã dos dias seguintes, já incluso no mesmo hotel aceito antes). */
  itensAutomaticos?: Omit<ItemItinerario, "id">[] | undefined;
  /**
   * Building block comum pras perguntas de múltipla escolha do analista
   * (companhia aérea, tipo de transfer, preferência de prato...) — quando
   * presente, essa interação é uma pergunta com opções de resposta, não
   * uma sugestão concreta pra aceitar/recusar. Ver `responderPergunta`.
   */
  opcoes?: OpcaoResposta[] | undefined;
  /** Label da opção escolhida pelo cliente, depois de responder a pergunta. */
  respostaEscolhida?: string | undefined;
}

export interface ItemItinerario {
  id: string;
  /** Dia da viagem, 1-based. */
  dia: number;
  horario: string;
  local: string;
  descricao: string;
  imagem: string;
  /** Duração aproximada da atividade (ex: "1h30"). */
  duracao?: string | undefined;
  /** Endereço/localização do local — já vem enriquecido a partir da etapa 6, pra versão final (etapa 7) ter o máximo de detalhe. */
  endereco?: string | undefined;
  /**
   * Destino a que esse item pertence — a viagem pode ter vários destinos
   * (multi-destino), cada um com sua própria contagem de dias 1, 2, 3...
   * Usado pra separar a programação por destino nas etapas 6 e 7, em vez
   * de misturar dias de destinos diferentes que compartilham o mesmo
   * número.
   */
  destinoSlug?: string | undefined;
  /** Categoria de origem do item (herdada da sugestão que o gerou) — usada pra montar o resumo da etapa 7 (acomodações, refeições, passeios...). */
  categoria?: CategoriaSugestao | undefined;
}

/**
 * Sugestão (ou pergunta) ainda não revelada ao cliente — fica na fila até
 * a anterior ser respondida. Quando `opcoes` está presente, é uma
 * pergunta de múltipla escolha (sem `itemItinerario` próprio); senão, é
 * uma sugestão concreta pra aceitar/recusar. O `texto` de uma sugestão
 * pode conter o token `{{resposta}}`, substituído pela última opção
 * escolhida numa pergunta anterior (ex: a companhia aérea preferida).
 */
export interface SugestaoTemplate {
  texto: string;
  categoria: CategoriaSugestao;
  imagem?: string;
  itemItinerario?: Omit<ItemItinerario, "id">;
  itensAutomaticos?: Omit<ItemItinerario, "id">[];
  opcoes?: OpcaoResposta[];
}

/**
 * Registro do que aconteceu num pagamento de verdade (sinal ou saldo do
 * pacote) — gerado pelo `PagamentoModal` na hora da confirmação, com os
 * dados que uma tela de detalhe de pagamento precisa mostrar: meio usado,
 * dado mascarado (LGPD — nunca o número completo do cartão), código de
 * confirmação e retorno da operadora, e o link da nota fiscal.
 */
export interface DetalhesPagamentoRealizado {
  /** "outro" só aparece em pagamentos antigos, confirmados antes de o app passar a registrar o meio de pagamento. */
  metodo: "pix" | "debito" | "credito" | "boleto" | "outro";
  dadosMascarados: string;
  codigoConfirmacao: string;
  codigoRetorno: string;
  notaFiscalUrl: string;
  /** Só existe pra crédito parcelado — a tela de detalhe do pagamento mostra esse campo a mais só nesse caso. */
  parcelas?: number | undefined;
}

export function gerarCodigoConfirmacao(): string {
  return `AUTH${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

/**
 * Mock de nota fiscal — sem backend de verdade, gera uma paginazinha HTML
 * como data URI (o navegador abre/baixa normalmente) já com os dados do
 * pagamento, em vez de um link morto.
 */
export function gerarNotaFiscalUrl(params: {
  titulo: string;
  valorReais: number;
  metodoLabel: string;
  codigoConfirmacao: string;
}): string {
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Nota fiscal — Aventura Organizada</title>
<style>body{font-family:system-ui,sans-serif;max-width:480px;margin:40px auto;color:#1c2b1c;padding:0 20px}
h1{font-size:1.15rem;margin-bottom:0.25rem}
.sub{color:#6b7a6b;font-size:0.85rem;margin-bottom:1.5rem}
dl{display:grid;grid-template-columns:auto 1fr;gap:8px 16px;font-size:0.9rem}
dt{color:#6b7a6b}dd{margin:0;font-weight:600}</style>
</head><body>
<h1>Aventura Organizada</h1>
<p class="sub">Nota fiscal de serviço — CNPJ 12.345.678/0001-90</p>
<dl>
<dt>Referente a</dt><dd>${params.titulo}</dd>
<dt>Valor</dt><dd>R$ ${params.valorReais.toLocaleString("pt-BR")}</dd>
<dt>Meio de pagamento</dt><dd>${params.metodoLabel}</dd>
<dt>Código de confirmação</dt><dd>${params.codigoConfirmacao}</dd>
<dt>Emitida em</dt><dd>${new Date().toLocaleString("pt-BR")}</dd>
</dl>
</body></html>`;
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

/**
 * Alguns planos foram pagos antes de o app passar a registrar o meio de
 * pagamento (sinalPagamentoDetalhes/pacotePagamentoDetalhes) — sem isso a
 * tela de detalhe do pagamento ficava incompleta mesmo pra um pagamento já
 * confirmado. Preenche um registro honesto (metodo "outro", sem fingir um
 * cartão ou Pix que não existiu) só pra esses casos legados.
 */
function detalhesLegados(
  descricao: string,
  valorReais: number,
): DetalhesPagamentoRealizado {
  const codigoConfirmacao = gerarCodigoConfirmacao();
  return {
    metodo: "outro",
    dadosMascarados:
      "Pagamento confirmado antes do registro detalhado do meio de pagamento nesta versão do sistema.",
    codigoConfirmacao,
    codigoRetorno: `00-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    notaFiscalUrl: gerarNotaFiscalUrl({
      titulo: descricao,
      valorReais,
      metodoLabel: "Não informado",
      codigoConfirmacao,
    }),
  };
}

export interface PlanoViagem {
  id: string;
  criadoEm: string;
  usuarioId: string;
  tipoInicial: "destinos" | "experiencias";
  selecoes: SelecaoDestino[];
  contexto: string;
  interacoes: Interacao[];
  /** Sugestões do analista ainda não reveladas — cada uma só aparece depois que a anterior é respondida. */
  filaSugestoes: SugestaoTemplate[];
  /** Sinal de R$200 pago pelo cliente pra acompanhar a montagem da programação (etapa 6) em tempo real. */
  sinalPago: boolean;
  /** Data/hora em que o sinal foi confirmado — usada na ficha da viagem (etapa 7/9). */
  sinalPagoEm?: string | undefined;
  /** Meio de pagamento, dados mascarados e códigos de confirmação do sinal — usado na tela de detalhe do pagamento. */
  sinalPagamentoDetalhes?: DetalhesPagamentoRealizado | undefined;
  /** Programação dia a dia, sendo montada conforme as sugestões vão sendo aceitas. */
  itinerario: ItemItinerario[];
  /** Cliente revisou a ficha completa na etapa 7 e confirmou que está tudo certo — só depois disso a etapa 8 (pagamento final) libera. */
  pacoteRevisado?: boolean | undefined;
  /** Preço total mockado do pacote, calculado na criação do plano. */
  valorPacoteReais: number;
  /** Contrato fechado depois do pagamento final (etapa 8 → 9). */
  pacoteFechado: boolean;
  /** Data/hora em que o pagamento final foi confirmado — usada na ficha da viagem (etapa 7/9). */
  pacoteFechadoEm?: string | undefined;
  /** Meio de pagamento, dados mascarados e códigos de confirmação do saldo final — usado na tela de detalhe do pagamento. */
  pacotePagamentoDetalhes?: DetalhesPagamentoRealizado | undefined;
}

export const VALOR_SINAL_REAIS = 200;

/**
 * Prazo prometido pro analista dar o primeiro retorno sobre o plano
 * enviado — hoje fixo aqui, mas pensado como um parâmetro que o
 * backoffice vai poder configurar (por agência, por época do ano, por
 * carga de trabalho da equipe etc.), não um número espalhado pelo código.
 */
export const PRAZO_RESPOSTA_ANALISTA_HORAS = 24;

// v2: campos de data/pessoas/interesses/inclusos migraram de nível global
// pra dentro de cada SelecaoDestino. Muda a versão da chave sempre que o
// formato dos dados salvos mudar, pra planos salvos com o formato antigo
// não quebrarem a leitura — eles simplesmente ficam invisíveis (não
// deletados) na chave anterior.
const PLANOS_KEY = "ao_planos_viagem_v2";

function readPlanos(): PlanoViagem[] {
  try {
    const raw = window.localStorage.getItem(PLANOS_KEY);
    return raw ? (JSON.parse(raw) as PlanoViagem[]) : [];
  } catch {
    return [];
  }
}

export function getPlanosDoUsuario(usuarioId: string): PlanoViagem[] {
  return readPlanos()
    .filter((plano) => plano.usuarioId === usuarioId)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));
}

// localStorage não é reativo — nada re-renderiza sozinho quando outro
// componente grava um plano novo (ex: o Header precisa saber se o
// usuário já tem viagens, mas o wizard que salva o plano fica em outra
// parte da árvore de componentes). Esse evento avisa quem estiver
// escutando pra recalcular.
const PLANOS_ATUALIZADOS_EVENT = "ao:planos-atualizados";

export function onPlanosAtualizados(callback: () => void): () => void {
  window.addEventListener(PLANOS_ATUALIZADOS_EVENT, callback);
  return () => window.removeEventListener(PLANOS_ATUALIZADOS_EVENT, callback);
}

// O Header tem um link "Minhas viagens" pra /planejar-viagem, mas a página
// guarda internamente se está mostrando a lista, o wizard ou o detalhe de
// um plano. Clicar no link quando já se está nessa rota não dispara
// navegação (mesma URL), então a página não teria como saber que precisa
// voltar pra lista. Esse evento avisa quem estiver escutando pra fazer isso.
const IR_PARA_LISTA_EVENT = "ao:ir-para-lista-de-viagens";

export function pedirListaDeViagens(): void {
  window.dispatchEvent(new Event(IR_PARA_LISTA_EVENT));
}

export function onPedirListaDeViagens(callback: () => void): () => void {
  window.addEventListener(IR_PARA_LISTA_EVENT, callback);
  return () => window.removeEventListener(IR_PARA_LISTA_EVENT, callback);
}

function horasDepois(base: string, horas: number): string {
  return new Date(new Date(base).getTime() + horas * 60 * 60 * 1000).toISOString();
}

function calcularValorPacote(selecoes: SelecaoDestino[]): number {
  let total = 0;
  for (const s of selecoes) {
    const noites = noitesEntre(s.dataInicio, s.dataFim) ?? 1;
    total += noites * (s.adultos * 350 + s.criancas * 200);
  }
  return Math.max(total, 500);
}

const HORARIO_CAFE = "08:00";

const RESTAURANTES_ALMOCO = [
  "Restaurante Sabor da Terra",
  "Cantina do Vale",
  "Empório Regional",
];
const RESTAURANTES_JANTAR = [
  "Recanto do Chef",
  "Casa da Vovó",
  "Point Gastronômico",
];
const PRATOS_SUGERIDOS = ["Massa", "Carne", "Frango", "Salada"];
const HOTEIS = [
  "Pousada Recanto Verde",
  "Hotel Fazenda Águas Claras",
  "Pousada Vista da Serra",
];
const RUAS_RESTAURANTES = [
  "Rua das Palmeiras",
  "Avenida Central",
  "Rua do Comércio",
];
const COMPANHIAS_AEREAS = ["LATAM", "GOL", "Azul"];
const AEROPORTOS: Record<string, string> = {
  bonito: "Aeroporto Internacional de Campo Grande (CGR)",
  socorro: "Aeroporto Internacional de Viracopos, Campinas (VCP)",
  brotas: "Aeroporto Estadual de Araraquara (AQA)",
  ubatuba: "Aeroporto de São José dos Campos (SJK)",
};
const CONTATOS_TRANSFER = [
  "Carlos Mendes (motorista) · (67) 99123-4567",
  "Fernanda Lima (guia local) · (67) 99876-5432",
  "Roberto Alves (motorista) · (67) 99456-7890",
];
const VEICULOS_TRANSFER = ["Van executiva", "Sedan confortável", "Micro-ônibus"];

function gerarNumeroVoo(destinoSlug: string, indice: number): string {
  let hash = 0;
  for (const char of destinoSlug) hash = (hash * 31 + char.charCodeAt(0)) % 9000;
  return `${1000 + ((hash + indice * 137) % 9000)}`;
}

/**
 * Monta a fila completa de sugestões do analista pra um plano, dia a dia,
 * a partir dos destinos/datas escolhidos: hospedagem (com café da manhã já
 * incluso) no dia 1, depois manhã/almoço/tarde todo dia, e jantar/vida
 * noturna nos dias intermediários. Em produção quem decide essas sugestões
 * é o analista, no backoffice — isso aqui simula um roteiro plausível
 * enquanto esse backoffice não existe (ver `AtualizacaoBackoffice`).
 */
function gerarFilaDeSugestoes(selecoes: SelecaoDestino[]): SugestaoTemplate[] {
  const fila: SugestaoTemplate[] = [];

  // Viagem multi-destino: cada destino é tratado como um "pacote" próprio,
  // em ordem cronológica (primeiro o destino com data de início mais
  // cedo) — as sugestões de um destino só terminam pra depois começarem
  // as do próximo.
  const selecoesOrdenadas = [...selecoes].sort((a, b) => {
    if (!a.dataInicio || !b.dataInicio) return 0;
    return a.dataInicio.localeCompare(b.dataInicio);
  });

  for (const [indiceSelecao, selecao] of selecoesOrdenadas.entries()) {
    const destino = destinos.find((d) => d.slug === selecao.destinoSlug);
    if (!destino || !selecao.dataInicio || !selecao.dataFim) continue;

    const inicioFila = fila.length;
    const nomeCurto = destino.nome.split(",")[0] ?? destino.nome;
    const noites = noitesEntre(selecao.dataInicio, selecao.dataFim) ?? 1;
    const atracoes = destino.atracoes;
    const hotel = HOTEIS[indiceSelecao % HOTEIS.length]!;
    const enderecoHotel = `${hotel} — Zona Rural, ${destino.nome}`;
    const enderecoCentro = `Centro, ${destino.nome}`;
    let indiceAtracao = 0;
    const proximaAtracao = () => {
      if (atracoes.length === 0) return null;
      const atracao = atracoes[indiceAtracao % atracoes.length]!;
      indiceAtracao += 1;
      return atracao;
    };
    const cafeDaManha = (dia: number): Omit<ItemItinerario, "id"> => ({
      dia,
      horario: HORARIO_CAFE,
      local: `Café da manhã no ${hotel}`,
      descricao: "Incluso na hospedagem.",
      imagem: hospedagemImg,
      duracao: "30 min",
      endereco: enderecoHotel,
    });

    // O prato preferido é perguntado uma vez só (ver pergunta logo
    // abaixo) e reaproveitado em todas as refeições via {{resposta}}.
    const almoco = (dia: number): Omit<ItemItinerario, "id"> => {
      const restaurante =
        RESTAURANTES_ALMOCO[dia % RESTAURANTES_ALMOCO.length]!;
      const rua = RUAS_RESTAURANTES[dia % RUAS_RESTAURANTES.length]!;
      return {
        dia,
        horario: "12:30",
        local: restaurante,
        descricao: "Prato sugerido: {{resposta}}. Avise se preferir outra opção.",
        imagem: destino.imagem,
        duracao: "1h",
        endereco: `${rua}, ${100 + dia * 10} — Centro, ${destino.nome}`,
      };
    };

    const jantar = (dia: number): Omit<ItemItinerario, "id"> => {
      const restaurante =
        RESTAURANTES_JANTAR[dia % RESTAURANTES_JANTAR.length]!;
      const rua = RUAS_RESTAURANTES[(dia + 1) % RUAS_RESTAURANTES.length]!;
      return {
        dia,
        horario: "19:30",
        local: restaurante,
        descricao: "Prato sugerido: {{resposta}}. Avise se preferir outra opção.",
        imagem: destino.imagem,
        duracao: "1h30",
        endereco: `${rua}, ${200 + dia * 10} — Centro, ${destino.nome}`,
      };
    };

    // Dia 1 — voo de ida (pergunta a companhia aérea antes de sugerir),
    // transfer de chegada (pergunta o tipo antes de sugerir), hospedagem
    // (com café da manhã incluso), manhã, almoço e tarde.
    const aeroporto = AEROPORTOS[destino.slug] ?? `Aeroporto de ${nomeCurto}`;
    fila.push({
      texto: `Pra chegar em ${nomeCurto}, você tem preferência de companhia aérea?`,
      categoria: "voo",
      opcoes: COMPANHIAS_AEREAS.map((c) => ({ id: c.toLowerCase(), label: c })),
    });
    const numeroVooIda = gerarNumeroVoo(destino.slug, indiceSelecao);
    const contatoTransfer =
      CONTATOS_TRANSFER[indiceSelecao % CONTATOS_TRANSFER.length]!;
    const veiculoTransfer =
      VEICULOS_TRANSFER[indiceSelecao % VEICULOS_TRANSFER.length]!;
    fila.push({
      texto: `Encontramos um ótimo voo com a {{resposta}} até o ${aeroporto}, chegando por volta das 06:00. Podemos reservar?`,
      categoria: "voo",
      itemItinerario: {
        dia: 1,
        horario: "06:00",
        local: `Voo até ${nomeCurto}`,
        descricao: `Voo {{resposta}} nº ${numeroVooIda}, chegada prevista no ${aeroporto}, com conexão conforme disponibilidade.`,
        imagem: transporteImg,
        duracao: "cerca de 2h",
        endereco: aeroporto,
      },
    });

    fila.push({
      texto: "Do aeroporto até a hospedagem, você prefere transfer privativo ou compartilhado?",
      categoria: "transfer",
      opcoes: [
        { id: "privativo", label: "Privativo" },
        { id: "compartilhado", label: "Compartilhado" },
      ],
    });
    fila.push({
      texto: `Reservamos o transfer {{resposta}} do ${aeroporto} até o ${hotel}. Podemos confirmar?`,
      categoria: "transfer",
      itemItinerario: {
        dia: 1,
        horario: "07:00",
        local: "Transfer de chegada",
        descricao: `Transfer {{resposta}} do ${aeroporto} até o ${hotel}. Veículo: ${veiculoTransfer}. Contato: ${contatoTransfer}.`,
        imagem: transporteImg,
        duracao: "cerca de 1h",
        endereco: `Saindo do ${aeroporto}`,
      },
    });

    fila.push({
      texto: `Encontramos uma ótima opção de hospedagem no ${hotel}, em ${nomeCurto}, com café da manhã incluso servido a partir das ${HORARIO_CAFE}. Podemos reservar?`,
      categoria: "acomodacao",
      imagem: hospedagemImg,
      itemItinerario: cafeDaManha(1),
    });

    const manha1 = proximaAtracao();
    fila.push({
      texto: manha1
        ? `Ele aprovou? Ótimo — pra começar o dia 1, que tal ${manha1.nome}? ${manha1.descricao}`
        : `Manhã livre para aproveitar ${nomeCurto} no dia 1.`,
      categoria: "passeio",
      imagem: manha1?.imagem ?? destino.imagem,
      itemItinerario: {
        dia: 1,
        horario: "09:30",
        local: manha1?.nome ?? nomeCurto,
        descricao: manha1
          ? `${manha1.descricao} Saída do ${hotel} · Transporte: ${veiculoTransfer}.`
          : `Manhã livre em ${nomeCurto}.`,
        imagem: manha1?.imagem ?? destino.imagem,
        duracao: "cerca de 2h",
        endereco: manha1
          ? `Acesso pela zona rural de ${nomeCurto} — ${destino.nome}`
          : enderecoCentro,
      },
    });

    fila.push({
      texto: "Pra acertar nas reservas dos restaurantes, qual tipo de prato vocês preferem?",
      categoria: "refeicao",
      opcoes: PRATOS_SUGERIDOS.map((p) => ({ id: p.toLowerCase(), label: p })),
    });

    fila.push({
      texto: "Reservamos o almoço num restaurante local bem avaliado, pertinho do roteiro da manhã.",
      categoria: "refeicao",
      itemItinerario: almoco(1),
    });

    fila.push({
      texto: `À tarde, sugerimos uma volta pelo centro de ${nomeCurto} — ótimo pra conhecer o comércio local.`,
      categoria: "passeio",
      itemItinerario: {
        dia: 1,
        horario: "15:30",
        local: `Centro de ${nomeCurto}`,
        descricao: "Tempo livre para lojinhas, cafés e artesanato local.",
        imagem: destino.imagem,
        duracao: "cerca de 1h30",
        endereco: enderecoCentro,
      },
    });

    // Dias intermediários — café da manhã já vem preenchido (mesmo hotel),
    // manhã, almoço, tarde, jantar e vida noturna.
    for (let dia = 2; dia <= noites; dia++) {
      const manha = proximaAtracao();
      fila.push({
        texto: manha
          ? `Bom dia! Pro dia ${dia}, sugerimos ${manha.nome} pela manhã. ${manha.descricao}`
          : `Mais uma manhã livre em ${nomeCurto} no dia ${dia}.`,
        categoria: "passeio",
        imagem: manha?.imagem ?? destino.imagem,
        itemItinerario: {
          dia,
          horario: "09:30",
          local: manha?.nome ?? nomeCurto,
          descricao: manha
            ? `${manha.descricao} Saída do ${hotel} · Transporte: ${veiculoTransfer}.`
            : `Manhã livre em ${nomeCurto}.`,
          imagem: manha?.imagem ?? destino.imagem,
          duracao: "cerca de 2h",
          endereco: manha
            ? `Acesso pela zona rural de ${nomeCurto} — ${destino.nome}`
            : enderecoCentro,
        },
        // O café da manhã não precisa de sugestão própria — é o mesmo
        // hotel já aceito no dia 1, então já vem preenchido automaticamente.
        itensAutomaticos: [cafeDaManha(dia)],
      });

      fila.push({
        texto: "Na volta, sugerimos o almoço num restaurante bem pertinho de onde vocês vão estar.",
        categoria: "refeicao",
        itemItinerario: almoco(dia),
      });

      const tarde = proximaAtracao();
      fila.push({
        texto: tarde
          ? `À tarde do dia ${dia}, que tal ${tarde.nome}? ${tarde.descricao}`
          : `Tarde livre em ${nomeCurto} no dia ${dia}.`,
        categoria: "passeio",
        imagem: tarde?.imagem ?? destino.imagem,
        itemItinerario: {
          dia,
          horario: "15:00",
          local: tarde?.nome ?? nomeCurto,
          descricao: tarde
            ? `${tarde.descricao} Saída do ${hotel} · Transporte: ${veiculoTransfer}.`
            : `Tarde livre em ${nomeCurto}.`,
          imagem: tarde?.imagem ?? destino.imagem,
          duracao: "cerca de 2h",
          endereco: tarde
            ? `Acesso pela zona rural de ${nomeCurto} — ${destino.nome}`
            : enderecoCentro,
        },
      });

      fila.push({
        texto: "Pra fechar o dia, reservamos um jantar num restaurante bem avaliado por quem visita a região.",
        categoria: "refeicao",
        itemItinerario: jantar(dia),
      });

      fila.push({
        texto: "E pra fechar a noite, um bar com música ao vivo bem perto do hotel — topam?",
        categoria: "geral",
        itemItinerario: {
          dia,
          horario: "21:30",
          local: "Bar com música ao vivo",
          descricao: "Programação noturna opcional, perto da hospedagem.",
          imagem: destino.imagem,
          duracao: "cerca de 2h",
          endereco: `Rua da Praça, s/n — Centro, ${destino.nome}`,
        },
      });
    }

    // Dia de saída — check-out e transfer de volta, incluído automaticamente
    // junto com a última sugestão aceita (não precisa de sugestão própria).
    const ultima = fila[fila.length - 1];
    if (ultima) {
      ultima.itensAutomaticos = [
        ...(ultima.itensAutomaticos ?? []),
        {
          dia: noites + 1,
          horario: "10:00",
          local: `Transfer de saída de ${nomeCurto}`,
          descricao: `Check-out e traslado de volta ao ${aeroporto}. Veículo: ${veiculoTransfer}. Contato: ${contatoTransfer}.`,
          imagem: transporteImg,
          duracao: "1h",
          endereco: `Saindo do ${hotel} — ${destino.nome}`,
        },
      ];
    }

    // Marca todos os itens desse destino de uma vez, em vez de repetir
    // `destinoSlug` em cada objeto literal lá em cima.
    for (let i = inicioFila; i < fila.length; i++) {
      const sug = fila[i]!;
      if (sug.itemItinerario) {
        sug.itemItinerario = { ...sug.itemItinerario, destinoSlug: destino.slug };
      }
      if (sug.itensAutomaticos) {
        sug.itensAutomaticos = sug.itensAutomaticos.map((item) => ({
          ...item,
          destinoSlug: destino.slug,
        }));
      }
    }
  }

  return fila;
}

export function salvarPlanoViagem(
  plano: Omit<
    PlanoViagem,
    | "id"
    | "criadoEm"
    | "interacoes"
    | "filaSugestoes"
    | "sinalPago"
    | "itinerario"
    | "valorPacoteReais"
    | "pacoteFechado"
  >,
): PlanoViagem {
  const agora = new Date().toISOString();
  const fila = gerarFilaDeSugestoes(plano.selecoes);

  // A etapa 5 abre com uma conversa comercial de verdade — nenhuma
  // sugestão aparece ainda. O analista dá boas-vindas, revisa o plano,
  // EXPLICA o sinal (o que é e por que existe) e só pede a confirmação
  // depois que o cliente topa. Só depois do pagamento (ver
  // `confirmarPagamentoSinal`) é que a primeira sugestão (a hospedagem) é
  // revelada pra fila `filaSugestoes` inteira.
  const interacoes: Interacao[] = [
    {
      id: crypto.randomUUID(),
      autor: "usuario",
      texto: "Plano enviado para análise.",
      criadoEm: agora,
      tipo: "mensagem",
    },
    {
      id: crypto.randomUUID(),
      autor: "analista",
      texto: `Bem-vindo(a) à Aventura Organizada! Ficamos muito felizes que você tenha confiado a nós a organização da sua viagem e da diversão da sua família. Nosso time já está analisando tudo com carinho e volta com os próximos passos em até ${PRAZO_RESPOSTA_ANALISTA_HORAS} horas.`,
      criadoEm: horasDepois(agora, 3),
      tipo: "mensagem",
    },
    {
      id: crypto.randomUUID(),
      autor: "analista",
      texto:
        "Já revisamos os destinos, datas e experiências que você escolheu — temos ótimas opções de hospedagem e passeios preparadas especialmente pra vocês.",
      criadoEm: horasDepois(agora, 5),
      tipo: "mensagem",
    },
    {
      id: crypto.randomUUID(),
      autor: "analista",
      texto:
        "Antes de te mostrar as opções, preciso te explicar uma coisa: pra reservar cada etapa da viagem, cobramos um sinal de R$200. Esse valor garante o reconhecimento do nosso trabalho de pesquisa e montagem da viagem, e é 100% descontado do valor final caso você feche a viagem com a gente. Faz sentido pra você?",
      criadoEm: horasDepois(agora, 6),
      tipo: "mensagem",
    },
    {
      id: crypto.randomUUID(),
      autor: "usuario",
      texto: "Faz sentido sim! Pode seguir.",
      criadoEm: horasDepois(agora, 6.5),
      tipo: "mensagem",
    },
    {
      id: crypto.randomUUID(),
      autor: "analista",
      criadoEm: horasDepois(agora, 7),
      tipo: "plano_pronto",
      texto:
        "Perfeito! Então é só confirmar o pagamento do sinal que eu já sigo com as próximas sugestões e você acompanha a programação da viagem em tempo real.",
    },
  ];

  const registro: PlanoViagem = {
    ...plano,
    id: crypto.randomUUID(),
    criadoEm: agora,
    sinalPago: false,
    itinerario: [],
    filaSugestoes: fila,
    valorPacoteReais: calcularValorPacote(plano.selecoes),
    pacoteFechado: false,
    interacoes,
  };

  const planos = readPlanos();
  window.localStorage.setItem(
    PLANOS_KEY,
    JSON.stringify([...planos, registro]),
  );
  window.dispatchEvent(new Event(PLANOS_ATUALIZADOS_EVENT));

  return registro;
}

export function adicionarInteracao(
  planoId: string,
  interacao: Omit<Interacao, "id" | "criadoEm">,
): PlanoViagem | null {
  const planos = readPlanos();
  const index = planos.findIndex((p) => p.id === planoId);
  if (index === -1) return null;

  const atual = planos[index]!;
  const novaInteracao: Interacao = {
    ...interacao,
    id: crypto.randomUUID(),
    criadoEm: new Date().toISOString(),
  };

  const atualizado: PlanoViagem = {
    ...atual,
    interacoes: [...(atual.interacoes ?? []), novaInteracao],
  };

  planos[index] = atualizado;
  window.localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
  window.dispatchEvent(new Event(PLANOS_ATUALIZADOS_EVENT));

  return atualizado;
}

/**
 * Substitui o token `{{resposta}}` no texto de uma sugestão pela última
 * opção que o cliente escolheu numa pergunta anterior (ex: a companhia
 * aérea) — é assim que uma pergunta de múltipla escolha "alimenta" a
 * sugestão concreta que vem logo depois dela na fila.
 */
function comRespostaAnterior(texto: string, interacoes: Interacao[]): string {
  if (!texto.includes("{{resposta}}")) return texto;
  const ultimaResposta = [...interacoes]
    .reverse()
    .find((i) => i.respostaEscolhida)?.respostaEscolhida;
  return texto.replace("{{resposta}}", ultimaResposta ?? "a opção escolhida");
}

/**
 * Revela a próxima sugestão (ou pergunta) da fila como uma nova interação
 * pendente, ou, se a fila estiver vazia, avisa que a programação está
 * completa ("pacote_pronto") — a menos que isso já tenha sido avisado
 * antes.
 */
function revelarProximaSugestao(
  interacoes: Interacao[],
  filaSugestoes: SugestaoTemplate[],
): { interacoes: Interacao[]; filaSugestoes: SugestaoTemplate[] } {
  const [proximaSugestao, ...restoDaFila] = filaSugestoes;

  if (proximaSugestao) {
    const ehPergunta = !!proximaSugestao.opcoes;
    // O token {{resposta}} pode aparecer tanto no texto do chat quanto na
    // descrição do item que vai pra programação (ex: "Prato sugerido:
    // {{resposta}}") — os dois precisam da substituição, senão o token
    // literal vazaria pra etapa 6/7.
    const itemItinerario = proximaSugestao.itemItinerario
      ? {
          ...proximaSugestao.itemItinerario,
          descricao: comRespostaAnterior(
            proximaSugestao.itemItinerario.descricao,
            interacoes,
          ),
        }
      : undefined;
    return {
      interacoes: [
        ...interacoes,
        {
          id: crypto.randomUUID(),
          autor: "analista",
          criadoEm: new Date().toISOString(),
          tipo: "sugestao",
          texto: comRespostaAnterior(proximaSugestao.texto, interacoes),
          categoria: proximaSugestao.categoria,
          imagem: proximaSugestao.imagem,
          itemItinerario,
          itensAutomaticos: proximaSugestao.itensAutomaticos,
          opcoes: proximaSugestao.opcoes,
          ...(ehPergunta ? {} : { sugestaoStatus: "pendente" as const }),
        },
      ],
      filaSugestoes: restoDaFila,
    };
  }

  if (interacoes.some((i) => i.tipo === "pacote_pronto")) {
    return { interacoes, filaSugestoes };
  }

  return {
    interacoes: [
      ...interacoes,
      {
        id: crypto.randomUUID(),
        autor: "analista",
        criadoEm: new Date().toISOString(),
        tipo: "pacote_pronto",
        texto:
          "Sua viagem está com a programação completa! Vamos revisar tudo e fechar o pacote?",
      },
    ],
    filaSugestoes,
  };
}

export function responderSugestao(
  planoId: string,
  interacaoId: string,
  status: "aceita" | "recusada",
): PlanoViagem | null {
  const planos = readPlanos();
  const index = planos.findIndex((p) => p.id === planoId);
  if (index === -1) return null;

  const atual = planos[index]!;
  const interacaoRespondida = (atual.interacoes ?? []).find(
    (i) => i.id === interacaoId,
  );

  let interacoes = (atual.interacoes ?? []).map((i) =>
    i.id === interacaoId ? { ...i, sugestaoStatus: status } : i,
  );
  let itinerario = atual.itinerario;

  if (status === "aceita" && interacaoRespondida) {
    const novosItens = [
      ...(interacaoRespondida.itemItinerario
        ? [interacaoRespondida.itemItinerario]
        : []),
      ...(interacaoRespondida.itensAutomaticos ?? []),
    ];
    if (novosItens.length > 0) {
      itinerario = [
        ...itinerario,
        ...novosItens.map((item) => ({
          ...item,
          id: crypto.randomUUID(),
          categoria: item.categoria ?? interacaoRespondida.categoria,
        })),
      ];
    }
  }

  // Quem aceita ou recusa é o cliente — isso precisa aparecer no escopo
  // dele na conversa (autor "usuario"), não só como um selo dentro da
  // mensagem do analista.
  interacoes = [
    ...interacoes,
    {
      id: crypto.randomUUID(),
      autor: "usuario",
      criadoEm: new Date().toISOString(),
      tipo: "mensagem",
      texto:
        status === "aceita"
          ? "Aceito! Pode reservar."
          : "Não, obrigado. Vamos deixar essa de fora.",
    },
  ];

  const revelado = revelarProximaSugestao(interacoes, atual.filaSugestoes ?? []);
  interacoes = revelado.interacoes;
  const filaSugestoes = revelado.filaSugestoes;

  const atualizado: PlanoViagem = {
    ...atual,
    interacoes,
    itinerario,
    filaSugestoes,
  };

  planos[index] = atualizado;
  window.localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
  window.dispatchEvent(new Event(PLANOS_ATUALIZADOS_EVENT));

  return atualizado;
}

/**
 * Cliente responde uma pergunta de múltipla escolha do analista (ex:
 * companhia aérea, tipo de transfer, preferência de prato) — building
 * block comum reaproveitado por qualquer categoria de sugestão, em vez
 * de aceitar/recusar. A escolha fica registrada na própria pergunta e
 * também aparece como mensagem da cliente na conversa; a próxima
 * sugestão da fila é revelada normalmente, já com o texto adaptado à
 * resposta (ver `comRespostaAnterior`).
 */
export function responderPergunta(
  planoId: string,
  interacaoId: string,
  opcaoId: string,
): PlanoViagem | null {
  const planos = readPlanos();
  const index = planos.findIndex((p) => p.id === planoId);
  if (index === -1) return null;

  const atual = planos[index]!;
  const pergunta = (atual.interacoes ?? []).find((i) => i.id === interacaoId);
  const opcaoEscolhida = pergunta?.opcoes?.find((o) => o.id === opcaoId);
  const label = opcaoEscolhida?.label ?? opcaoId;

  let interacoes = (atual.interacoes ?? []).map((i) =>
    i.id === interacaoId ? { ...i, respostaEscolhida: label } : i,
  );

  // A resposta é dada pela cliente — aparece no escopo dela na conversa,
  // igual ao aceite de uma sugestão comum.
  interacoes = [
    ...interacoes,
    {
      id: crypto.randomUUID(),
      autor: "usuario",
      criadoEm: new Date().toISOString(),
      tipo: "mensagem",
      texto: `Respondi: ${label}`,
    },
  ];

  const revelado = revelarProximaSugestao(interacoes, atual.filaSugestoes ?? []);
  interacoes = revelado.interacoes;
  const filaSugestoes = revelado.filaSugestoes;

  const atualizado: PlanoViagem = { ...atual, interacoes, filaSugestoes };
  planos[index] = atualizado;
  window.localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
  window.dispatchEvent(new Event(PLANOS_ATUALIZADOS_EVENT));

  return atualizado;
}

/**
 * Contrato do que chega do backoffice (onde o analista trabalha) sobre um
 * plano — hoje aplicado localmente pela própria etapa 5/6 (ver
 * `confirmarPagamentoSinal` e o seed em `salvarPlanoViagem`), mas pensado
 * pra ser exatamente o payload que um webhook real vai entregar quando
 * essa integração existir.
 *
 * Arquitetura pretendida: o analista aceita/envia uma sugestão no
 * backoffice → a API do backoffice chama um endpoint desta aplicação (ou
 * da marketplace.api) com esse payload → o servidor persiste no plano
 * (banco compartilhado, não mais localStorage) → o servidor publica a
 * atualização num canal por `planoId` (SSE ou WebSocket) que o navegador
 * do cliente está escutando enquanto a etapa 5 estiver aberta → a tela
 * reage em tempo real, sem precisar de refresh.
 *
 * A peça que falta pra isso funcionar de verdade é justamente esse
 * "transporte" servidor → navegador específico do cliente, porque hoje o
 * estado de cada plano vive só no localStorage do próprio navegador. Essa
 * função é o ponto único de entrada pensado pra já isolar essa fronteira:
 * é a única coisa que um handler de webhook (ou, por enquanto, a
 * simulação local) precisa chamar.
 */
export type AtualizacaoBackoffice =
  | {
      tipo: "sugestao";
      planoId: string;
      texto: string;
      categoria?: CategoriaSugestao;
      imagem?: string;
      itemItinerario?: Omit<ItemItinerario, "id">;
      itensAutomaticos?: Omit<ItemItinerario, "id">[];
    }
  | { tipo: "mensagem"; planoId: string; texto: string }
  | { tipo: "plano_pronto"; planoId: string; texto?: string }
  | { tipo: "pacote_pronto"; planoId: string; texto?: string }
  | {
      tipo: "itinerario_pronto";
      planoId: string;
      itens: Omit<ItemItinerario, "id">[];
    };

export function aplicarAtualizacaoDoBackoffice(
  atualizacao: AtualizacaoBackoffice,
): PlanoViagem | null {
  const planos = readPlanos();
  const index = planos.findIndex((p) => p.id === atualizacao.planoId);
  if (index === -1) return null;

  const atual = planos[index]!;
  let atualizado: PlanoViagem;

  if (atualizacao.tipo === "itinerario_pronto") {
    atualizado = {
      ...atual,
      itinerario: atualizacao.itens.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    };
  } else {
    const novaInteracao: Interacao = {
      id: crypto.randomUUID(),
      autor: "analista",
      criadoEm: new Date().toISOString(),
      texto:
        atualizacao.tipo === "plano_pronto"
          ? (atualizacao.texto ??
            "Perfeito! Então é só confirmar o pagamento do sinal que eu já sigo com as próximas sugestões e você acompanha a programação da viagem em tempo real.")
          : atualizacao.tipo === "pacote_pronto"
            ? (atualizacao.texto ??
              "Sua viagem está com a programação completa! Vamos revisar tudo e fechar o pacote?")
            : atualizacao.texto,
      tipo: atualizacao.tipo,
      ...(atualizacao.tipo === "sugestao"
        ? {
            sugestaoStatus: "pendente" as const,
            categoria: atualizacao.categoria,
            imagem: atualizacao.imagem,
            itemItinerario: atualizacao.itemItinerario,
            itensAutomaticos: atualizacao.itensAutomaticos,
          }
        : {}),
    };
    atualizado = {
      ...atual,
      interacoes: [...(atual.interacoes ?? []), novaInteracao],
    };
  }

  planos[index] = atualizado;
  window.localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
  window.dispatchEvent(new Event(PLANOS_ATUALIZADOS_EVENT));

  return atualizado;
}

/**
 * Cliente confirma o pagamento do sinal de R$200 — pago pra remunerar o
 * trabalho do analista até aqui caso a viagem não seja fechada, e
 * descontado do pacote se for. Libera a etapa 6 (programação dia a dia) e
 * destrava a etapa 5: nenhuma sugestão aparece antes disso — é só depois
 * do pagamento que o analista revela a primeira (a hospedagem).
 */
export function confirmarPagamentoSinal(
  planoId: string,
  detalhes: DetalhesPagamentoRealizado,
): PlanoViagem | null {
  const planos = readPlanos();
  const index = planos.findIndex((p) => p.id === planoId);
  if (index === -1) return null;

  const atual = planos[index]!;
  // Quem paga é o cliente — o pagamento entra no escopo dele na conversa
  // (autor "usuario"), antes de revelar a primeira sugestão da fila (a
  // hospedagem), que até aqui ainda não tinha aparecido pro cliente.
  const comConfirmacaoDoCliente = [
    ...(atual.interacoes ?? []),
    {
      id: crypto.randomUUID(),
      autor: "usuario" as const,
      criadoEm: new Date().toISOString(),
      tipo: "mensagem" as const,
      texto: `Sinal de R$${VALOR_SINAL_REAIS} pago!`,
    },
  ];
  const revelado = revelarProximaSugestao(
    comConfirmacaoDoCliente,
    atual.filaSugestoes ?? [],
  );

  const atualizado: PlanoViagem = {
    ...atual,
    sinalPago: true,
    sinalPagoEm: new Date().toISOString(),
    sinalPagamentoDetalhes: detalhes,
    interacoes: revelado.interacoes,
    filaSugestoes: revelado.filaSugestoes,
  };
  planos[index] = atualizado;
  window.localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
  window.dispatchEvent(new Event(PLANOS_ATUALIZADOS_EVENT));

  return atualizado;
}

/**
 * Cliente revisou a ficha completa na etapa 7 e confirmou "Fechar pacote"
 * — só a partir daqui a etapa 8 (pagamento final) libera. Sem isso, dava
 * pra pular direto pra etapa 8 pelo indicador de etapas sem nunca ter
 * revisado a programação.
 */
export function confirmarRevisaoDoPacote(planoId: string): PlanoViagem | null {
  const planos = readPlanos();
  const index = planos.findIndex((p) => p.id === planoId);
  if (index === -1) return null;

  const atual = planos[index]!;
  const atualizado: PlanoViagem = { ...atual, pacoteRevisado: true };
  planos[index] = atualizado;
  window.localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
  window.dispatchEvent(new Event(PLANOS_ATUALIZADOS_EVENT));

  return atualizado;
}

/**
 * Cliente confirma o pagamento final (etapa 8) e fecha o pacote completo —
 * o valor do sinal já pago é descontado do total. Libera a etapa 9.
 */
export function fecharPacote(
  planoId: string,
  detalhes: DetalhesPagamentoRealizado,
): PlanoViagem | null {
  const planos = readPlanos();
  const index = planos.findIndex((p) => p.id === planoId);
  if (index === -1) return null;

  const atual = planos[index]!;
  const valorFinal = atual.valorPacoteReais - VALOR_SINAL_REAIS;
  // Espelha o evento gerado no pagamento do sinal — o cliente vê no
  // histórico o valor pago e o analista confirma o fechamento, em vez do
  // pagamento simplesmente "sumir" sem deixar rastro na conversa.
  const interacoes = [
    ...(atual.interacoes ?? []),
    {
      id: crypto.randomUUID(),
      autor: "usuario" as const,
      criadoEm: new Date().toISOString(),
      tipo: "mensagem" as const,
      texto: `Pagamento final de R$${valorFinal.toLocaleString("pt-BR")} pago! Pacote fechado.`,
    },
    {
      id: crypto.randomUUID(),
      autor: "analista" as const,
      criadoEm: new Date().toISOString(),
      tipo: "mensagem" as const,
      texto:
        "Recebemos o pagamento e sua viagem está garantida! Foi um prazer organizar tudo pra vocês — qualquer ajuste, é só chamar por aqui até a data da partida.",
    },
  ];
  const atualizado: PlanoViagem = {
    ...atual,
    pacoteFechado: true,
    pacoteFechadoEm: new Date().toISOString(),
    pacotePagamentoDetalhes: detalhes,
    interacoes,
  };
  planos[index] = atualizado;
  window.localStorage.setItem(PLANOS_KEY, JSON.stringify(planos));
  window.dispatchEvent(new Event(PLANOS_ATUALIZADOS_EVENT));

  return atualizado;
}

export interface Pagamento {
  id: string;
  planoId: string;
  /** Identificador da viagem (destinos), pra localizar a que pagamento se refere sem abrir a viagem. */
  destinoNomes: string;
  tipo: "sinal" | "pacote";
  descricao: string;
  valorReais: number;
  status: "pendente" | "pago";
  dataVencimento: string;
  /** Data/hora em que foi efetivamente pago — só existe quando `status === "pago"`. */
  dataPagamento?: string | undefined;
  /** Meio, dados mascarados e códigos de confirmação — só existe quando `status === "pago"`. */
  detalhes?: DetalhesPagamentoRealizado | undefined;
}

/**
 * Lista os pagamentos (sinal e/ou fechamento do pacote) de todos os planos
 * do usuário, derivados do próprio histórico de interações — só existe um
 * pagamento de sinal depois que o analista pede ("plano_pronto"), e só
 * existe um pagamento de pacote depois que a programação está completa
 * ("pacote_pronto").
 */
function nomesDosDestinos(plano: PlanoViagem): string {
  return plano.selecoes
    .map((s) => destinos.find((d) => d.slug === s.destinoSlug)?.nome)
    .filter((n): n is string => !!n)
    .join(", ");
}

export function getPagamentosDoUsuario(usuarioId: string): Pagamento[] {
  // Alguns planos foram pagos antes de o app registrar o meio de
  // pagamento — preenche esses casos legados com um registro honesto
  // (metodo "outro") antes de montar a lista, pra a tela de detalhe nunca
  // ficar incompleta pra um pagamento já confirmado.
  let precisaPersistir = false;
  const todosPlanos = readPlanos().map((plano) => {
    if (plano.usuarioId !== usuarioId) return plano;
    let atualizado = plano;
    const descricaoDestino = nomesDosDestinos(plano) || "viagem";
    if (plano.sinalPago && !plano.sinalPagamentoDetalhes) {
      atualizado = {
        ...atualizado,
        sinalPagamentoDetalhes: detalhesLegados(
          `Sinal — viagem para ${descricaoDestino}`,
          VALOR_SINAL_REAIS,
        ),
      };
      precisaPersistir = true;
    }
    if (plano.pacoteFechado && !plano.pacotePagamentoDetalhes) {
      atualizado = {
        ...atualizado,
        pacotePagamentoDetalhes: detalhesLegados(
          `Fechamento do pacote — viagem para ${descricaoDestino}`,
          plano.valorPacoteReais - VALOR_SINAL_REAIS,
        ),
      };
      precisaPersistir = true;
    }
    return atualizado;
  });
  if (precisaPersistir) {
    window.localStorage.setItem(PLANOS_KEY, JSON.stringify(todosPlanos));
  }

  const pagamentos: Pagamento[] = [];

  const planosDoUsuario = todosPlanos
    .filter((plano) => plano.usuarioId === usuarioId)
    .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm));

  for (const plano of planosDoUsuario) {
    const descricaoDestino = nomesDosDestinos(plano) || "viagem";

    const pedidoSinal = plano.interacoes?.find(
      (i) => i.tipo === "plano_pronto",
    );
    if (pedidoSinal) {
      pagamentos.push({
        id: `${plano.id}:sinal`,
        planoId: plano.id,
        destinoNomes: descricaoDestino,
        tipo: "sinal",
        descricao: `Sinal — viagem para ${descricaoDestino}`,
        valorReais: VALOR_SINAL_REAIS,
        status: plano.sinalPago ? "pago" : "pendente",
        dataVencimento: horasDepois(pedidoSinal.criadoEm, 48),
        dataPagamento: plano.sinalPagoEm,
        detalhes: plano.sinalPagamentoDetalhes,
      });
    }

    const pedidoPacote = plano.interacoes?.find(
      (i) => i.tipo === "pacote_pronto",
    );
    if (pedidoPacote) {
      pagamentos.push({
        id: `${plano.id}:pacote`,
        planoId: plano.id,
        destinoNomes: descricaoDestino,
        tipo: "pacote",
        descricao: `Fechamento do pacote — viagem para ${descricaoDestino}`,
        valorReais: plano.valorPacoteReais - VALOR_SINAL_REAIS,
        status: plano.pacoteFechado ? "pago" : "pendente",
        dataVencimento: horasDepois(pedidoPacote.criadoEm, 72),
        dataPagamento: plano.pacoteFechadoEm,
        detalhes: plano.pacotePagamentoDetalhes,
      });
    }
  }

  return pagamentos.sort((a, b) =>
    a.dataVencimento.localeCompare(b.dataVencimento),
  );
}

/** Busca um pagamento específico do usuário pelo id (`${planoId}:sinal` ou `${planoId}:pacote`) — usado na tela de detalhe do pagamento. */
export function getPagamentoPorId(
  usuarioId: string,
  pagamentoId: string,
): Pagamento | null {
  return (
    getPagamentosDoUsuario(usuarioId).find((p) => p.id === pagamentoId) ??
    null
  );
}

export function noitesEntre(
  dataInicio?: string,
  dataFim?: string,
): number | null {
  if (!dataInicio || !dataFim) return null;
  const inicio = new Date(`${dataInicio}T00:00:00`);
  const fim = new Date(`${dataFim}T00:00:00`);
  const diffMs = fim.getTime() - inicio.getTime();
  const noites = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return noites > 0 ? noites : null;
}

export const INTERESSES_DISPONIVEIS = [
  "Aventura",
  "Praia",
  "Natureza",
  "Cultura",
  "Gastronomia",
] as const;

export const INCLUSOS_DISPONIVEIS = [
  "Experiência Aérea",
  "Experiências de Estadia",
  "Mobilidade",
  "Experiências Culturais e de Entretenimento",
  "Lazer",
  "Passeios Turísticos",
  "Transfer Exclusivo",
] as const;
