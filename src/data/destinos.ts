/**
 * Camada de dados de Destino — busca da marketplace.api de verdade (ver
 * src/lib/marketplace-api.ts). Antes disto era um array estático
 * mockado; o catálogo inteiro agora vem do backend.
 *
 * Duas coisas que a marketplace.api ainda não modela, e por isso
 * continuam curadas localmente (ver `METADADOS_CURADOS` abaixo):
 * `tipoViagem` (usado só pra copy comercial, ex. "Viagem em Família
 * para Bonito") e `interessesDisponiveis`/`inclusosDisponiveis`
 * (usados pra filtrar as opções do formulário de planejar viagem). Não
 * existe campo equivalente em Destino.cs hoje — quando existir, isso
 * sai de aqui.
 *
 * Imagens: `Destino.imagemUrl`/`PontoTuristico.imagemUrl` existem no
 * domínio mas não há pipeline de upload/CDN no backend ainda (campo
 * vazio/nulo na prática). Pra não regredir visualmente o site hoje,
 * qualquer imagem vazia cai pro bundle local já existente (mesmas fotos
 * de antes), indexado por slug — e passa a usar a imagem real
 * automaticamente no dia em que o backend passar a preencher esse
 * campo, sem precisar tocar aqui.
 */
import {
  getDestinoBySlug,
  getDestinos as fetchDestinos,
  type DestinoDto,
} from "@/lib/marketplace-api";
import { type Experiencia, mapExperiencia } from "@/data/experiencias";

import destinoBonitoImg from "@/assets/destino-bonito.jpeg";
import destinoSocorroImg from "@/assets/destino-socorro.jpeg";
import destinoBrotasImg from "@/assets/download.jpeg";
import destinoUbatubaImg from "@/assets/destino-ubatuba.jpeg";
import flutuacaoImg from "@/assets/flutuacao.jpeg";
import cachoeiraImg from "@/assets/cachoeira.jpeg";
import standUpPaddleImg from "@/assets/stand-up-paddle.jpeg";
import trilhaSetePraiasImg from "@/assets/trilha-sete-praias.jpeg";
import projetoTamarImg from "@/assets/projeto-tamar.jpeg";
import surfItamambucaImg from "@/assets/surf-itamambuca.jpeg";
import trilhasImg from "@/assets/trilhas.jpeg";

export interface Atracao {
  nome: string;
  descricao: string;
  imagem: string;
  alt: string;
}

export interface NumeroDestino {
  valor: string;
  label: string;
}

export interface Estado {
  nome: string;
  sigla: string;
}

export type TipoViagem = "Família" | "Grupo" | "Individual";

export interface Destino {
  id: string;
  slug: string;
  nome: string;
  pais: string;
  estado: Estado;
  tipoViagem: TipoViagem;
  tagline: string;
  descricao: string;
  imagem: string;
  imagens?: string[] | undefined;
  alt: string;
  duracao: string;
  grupo: string;
  incluso: string[];
  interessesDisponiveis: string[];
  inclusosDisponiveis: string[];
  mapsQuery: string;
  mapsZoom: number;
  atracoes: Atracao[];
  totalAtracoes?: number | undefined;
  historia: string[];
  numeros: NumeroDestino[];
  /** Experiências em destaque do destino (já populadas pela API — ver Destino.experiencias em marketplace.api). */
  experiencias: Experiencia[];
}

/**
 * Fallback de imagem por slug de destino, reaproveitando o mesmo bundle
 * de fotos que o mock usava — ver comentário no topo do arquivo.
 */
const IMAGEM_FALLBACK_POR_SLUG: Record<string, string> = {
  bonito: destinoBonitoImg,
  socorro: destinoSocorroImg,
  brotas: destinoBrotasImg,
  ubatuba: destinoUbatubaImg,
  petar: trilhasImg,
  "cataratas-do-iguacu": cachoeiraImg,
  "sao-pedro": flutuacaoImg,
  cunha: trilhasImg,
  olimpia: flutuacaoImg,
  "cabo-frio": surfItamambucaImg,
  paraty: projetoTamarImg,
};

/** Fallback genérico pra um destino fora da lista curada acima (destino novo, cadastrado só no backend). */
const IMAGEM_FALLBACK_GENERICA = destinoBonitoImg;

/**
 * Metadados comerciais que a marketplace.api ainda não modela (ver
 * comentário no topo do arquivo). `undefined` nos campos de um slug não
 * listado aqui cai no fallback genérico.
 */
const METADADOS_CURADOS: Record<
  string,
  {
    tipoViagem: TipoViagem;
    interessesDisponiveis: string[];
    inclusosDisponiveis: string[];
    imagens?: string[];
  }
> = {
  bonito: {
    tipoViagem: "Família",
    interessesDisponiveis: ["Aventura", "Natureza", "Gastronomia"],
    inclusosDisponiveis: [
      "Experiência Aérea",
      "Experiências de Estadia",
      "Mobilidade",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [destinoBonitoImg, flutuacaoImg],
  },
  socorro: {
    tipoViagem: "Grupo",
    interessesDisponiveis: ["Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [destinoSocorroImg, cachoeiraImg],
  },
  brotas: {
    tipoViagem: "Grupo",
    interessesDisponiveis: ["Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [destinoBrotasImg, standUpPaddleImg, cachoeiraImg],
  },
  ubatuba: {
    tipoViagem: "Família",
    interessesDisponiveis: ["Praia", "Natureza", "Aventura"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Experiências Culturais e de Entretenimento",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [destinoUbatubaImg, trilhaSetePraiasImg, surfItamambucaImg],
  },
  petar: {
    tipoViagem: "Grupo",
    interessesDisponiveis: ["Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [trilhasImg, cachoeiraImg],
  },
  "cataratas-do-iguacu": {
    tipoViagem: "Família",
    interessesDisponiveis: ["Aventura", "Natureza", "Cultura"],
    inclusosDisponiveis: [
      "Experiência Aérea",
      "Experiências de Estadia",
      "Mobilidade",
      "Experiências Culturais e de Entretenimento",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [cachoeiraImg, trilhasImg],
  },
  "sao-pedro": {
    tipoViagem: "Individual",
    interessesDisponiveis: ["Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [flutuacaoImg, destinoSocorroImg],
  },
  cunha: {
    tipoViagem: "Individual",
    interessesDisponiveis: ["Aventura", "Natureza", "Cultura", "Gastronomia"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Experiências Culturais e de Entretenimento",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [trilhasImg, cachoeiraImg],
  },
  olimpia: {
    tipoViagem: "Família",
    interessesDisponiveis: ["Natureza", "Gastronomia"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
  },
  "cabo-frio": {
    tipoViagem: "Família",
    interessesDisponiveis: ["Praia", "Aventura", "Natureza"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Lazer",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [
      surfItamambucaImg,
      trilhaSetePraiasImg,
      projetoTamarImg,
      destinoUbatubaImg,
    ],
  },
  paraty: {
    tipoViagem: "Individual",
    interessesDisponiveis: ["Cultura", "Natureza", "Aventura"],
    inclusosDisponiveis: [
      "Experiências de Estadia",
      "Mobilidade",
      "Experiências Culturais e de Entretenimento",
      "Passeios Turísticos",
      "Transfer Exclusivo",
    ],
    imagens: [projetoTamarImg, trilhaSetePraiasImg, cachoeiraImg, trilhasImg],
  },
};

const METADADOS_PADRAO: {
  tipoViagem: TipoViagem;
  interessesDisponiveis: string[];
  inclusosDisponiveis: string[];
  imagens?: string[];
} = {
  tipoViagem: "Família",
  interessesDisponiveis: [],
  inclusosDisponiveis: [],
};

function mapAtracao(pontoTuristico: {
  nome: string;
  descricao: string;
  imagemUrl?: string | null;
  alt?: string | null;
}): Atracao {
  return {
    nome: pontoTuristico.nome,
    descricao: pontoTuristico.descricao,
    imagem: pontoTuristico.imagemUrl || IMAGEM_FALLBACK_GENERICA,
    alt: pontoTuristico.alt || pontoTuristico.nome,
  };
}

function mapDestino(dto: DestinoDto): Destino {
  const metadados = METADADOS_CURADOS[dto.slug] ?? METADADOS_PADRAO;
  const imagemFallback =
    IMAGEM_FALLBACK_POR_SLUG[dto.slug] ?? IMAGEM_FALLBACK_GENERICA;

  return {
    id: dto.id,
    slug: dto.slug,
    nome: dto.nome,
    pais: dto.estado?.pais?.nome ?? "Brasil",
    estado: {
      nome: dto.estado?.nome ?? "",
      sigla: dto.estado?.sigla ?? "",
    },
    tipoViagem: metadados.tipoViagem,
    tagline: dto.tagline,
    descricao: dto.descricao,
    imagem: dto.imagemUrl || imagemFallback,
    imagens: metadados.imagens,
    alt: dto.alt || dto.nome,
    duracao: dto.duracao,
    grupo: dto.grupo,
    incluso: dto.incluso,
    interessesDisponiveis: metadados.interessesDisponiveis,
    inclusosDisponiveis: metadados.inclusosDisponiveis,
    mapsQuery: dto.mapsQuery,
    mapsZoom: dto.mapsZoom,
    atracoes: dto.pontosTuristicos.map(mapAtracao),
    totalAtracoes: dto.totalAtracoes ?? undefined,
    historia: dto.historia,
    numeros: dto.numeros,
    experiencias: dto.experiencias.map((e) =>
      mapExperiencia(e, { imagemFallback }),
    ),
  };
}

let cachePromise: Promise<Destino[]> | null = null;

/** Busca todos os destinos da marketplace.api — cacheada em memória pelo tempo de vida do processo/aba. */
export function getDestinos(): Promise<Destino[]> {
  if (!cachePromise) {
    cachePromise = fetchDestinos().then((dtos) => dtos.map(mapDestino));
    // Se a busca falhar, não deixa a falha presa no cache — a próxima
    // chamada tenta de novo (ex.: backend ainda subindo).
    cachePromise.catch(() => {
      cachePromise = null;
    });
  }
  return cachePromise;
}

/** Busca um destino específico direto pelo slug (GET /api/destinos/slug/{slug}) — não depende do cache de getDestinos(). */
export async function getDestino(slug: string): Promise<Destino | undefined> {
  try {
    const dto = await getDestinoBySlug(slug);
    return mapDestino(dto);
  } catch {
    return undefined;
  }
}
