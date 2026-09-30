import type { Destino } from "@/data/destinos";
import { getExperienciasPorDestino } from "@/data/experiencias";

/**
 * Copy comercial da experiência em destaque de um destino — título e
 * descrição descrevem o PASSEIO (tipo de viagem, local, atividades,
 * atrações, duração), não o destino em si. Usado tanto no carrossel da
 * home (Hero) quanto no topo da página do destino, pra manter a mesma
 * leitura em qualquer lugar que mostre "essa é a viagem em destaque
 * pra cá".
 */

function juntarComE(itens: string[]): string {
  if (itens.length === 0) return "";
  if (itens.length === 1) return itens[0]!;
  return `${itens.slice(0, -1).join(", ")} e ${itens[itens.length - 1]}`;
}

function extrairNoites(duracao: string): number | null {
  const encontrado = duracao.match(/(\d+)\s*noites?/i);
  return encontrado ? Number(encontrado[1]) : null;
}

/** "Viagem em Família para Bonito · 4 noites". */
export function tituloExperiencia(destino: Destino): string {
  const cidade = destino.nome.split(",")[0] ?? destino.nome;
  const noites = extrairNoites(destino.duracao);
  return `Viagem em ${destino.tipoViagem} para ${cidade}${noites ? ` · ${noites} noites` : ""}`;
}

/** Descrição comercial a partir das principais atividades e atrações do destino, em vez do texto genérico. */
export function descricaoExperiencia(destino: Destino): string {
  // getExperienciasPorDestino ainda usa o nome antigo (Experiencia) na
  // camada de dados — o rename pra Atividade em todo o sistema ainda
  // não foi feito. Aqui já tratamos como atividade.
  const atividadesTitulos = getExperienciasPorDestino(destino.slug)
    .slice(0, 3)
    .map((e) => e.titulo.toLowerCase());
  const atracoesNomes = destino.atracoes.slice(0, 3).map((a) => a.nome);

  if (atividadesTitulos.length > 0 && atracoesNomes.length > 0) {
    return `Viva ${juntarComE(atividadesTitulos)} em pontos como ${juntarComE(atracoesNomes)}.`;
  }
  if (atracoesNomes.length > 0) {
    return `Conheça ${juntarComE(atracoesNomes)}.`;
  }
  return destino.descricao;
}
