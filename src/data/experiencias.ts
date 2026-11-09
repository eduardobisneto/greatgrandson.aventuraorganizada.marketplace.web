import type { ComponentType, SVGProps } from "react";
import {
  Anchor,
  ArrowDownToLine,
  Binoculars,
  Cable,
  Car,
  Flashlight,
  Gauge,
  MountainSnow,
  PawPrint,
  Sailboat,
  Target,
  TreePine,
  Trees,
  Waves,
} from "lucide-react";

import flutuacaoImg from "@/assets/flutuacao.jpeg";
import trilhasImg from "@/assets/trilhas.jpeg";
import cachoeiraImg from "@/assets/cachoeira.jpeg";
import standUpPaddleImg from "@/assets/stand-up-paddle.jpeg";
import destinoUbatubaImg from "@/assets/destino-ubatuba.jpeg";
import surfItamambucaImg from "@/assets/surf-itamambuca.jpeg";
import raftingImg from "@/assets/download.jpeg";

import {
  getExperienciaBySlug,
  getExperiencias as fetchExperiencias,
  type ExperienciaDto,
} from "@/lib/marketplace-api";
import type { Destino } from "@/data/destinos";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export interface ContextoExperiencia {
  opcoesTitulo: string;
  opcoes: string[];
  beneficios: string[];
  melhorEpoca: string;
  publico: string;
  nivel: string;
  faixaEtaria: string;
  epocaResumo: string;
  seguranca?: string | undefined;
}

export interface Experiencia {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  imagem?: string | undefined;
  alt?: string | undefined;
  icon?: IconComponent | undefined;
  contexto: ContextoExperiencia;
}

/**
 * Fallback de imagem/ícone por slug — a marketplace.api carrega
 * `imagemUrl`/`iconeNome`, mas ainda não existe pipeline de upload de
 * imagem (ver comentário em data/destinos.ts), então quando `imagemUrl`
 * vem vazio a gente cai pro mesmo bundle local que o mock usava. Os
 * slugs com ícone (em vez de foto) espelham exatamente a curadoria
 * visual original.
 */
const IMAGEM_FALLBACK_POR_SLUG: Record<string, string> = {
  flutuacao: flutuacaoImg,
  trilhas: trilhasImg,
  cachoeiras: cachoeiraImg,
  "stand-up-paddle": standUpPaddleImg,
  praias: destinoUbatubaImg,
  "aulas-de-surf": surfItamambucaImg,
  rafting: raftingImg,
};

const ICONE_POR_SLUG: Record<string, IconComponent> = {
  tirolesa: Cable,
  arvorismo: TreePine,
  caiaque: Sailboat,
  escalada: MountainSnow,
  grutas: Flashlight,
  rapel: ArrowDownToLine,
  cavalgada: PawPrint,
  quadriciclo: Gauge,
  paintball: Target,
  parques: Trees,
  safaris: Binoculars,
  "parques-aquaticos": Waves,
  "passeio-de-barco": Anchor,
  buggy: Car,
};

export function mapExperiencia(
  dto: ExperienciaDto,
  opts?: { imagemFallback?: string | undefined },
): Experiencia {
  const imagem =
    dto.imagemUrl || IMAGEM_FALLBACK_POR_SLUG[dto.slug] || opts?.imagemFallback;
  return {
    id: dto.id,
    slug: dto.slug,
    titulo: dto.titulo,
    descricao: dto.descricao,
    imagem,
    alt: dto.alt || dto.titulo,
    icon: imagem ? undefined : ICONE_POR_SLUG[dto.slug],
    contexto: {
      opcoesTitulo: dto.opcoesTitulo,
      opcoes: dto.opcoes,
      beneficios: dto.beneficios,
      melhorEpoca: dto.melhorEpoca,
      publico: dto.publico,
      nivel: dto.nivel,
      faixaEtaria: dto.faixaEtaria,
      epocaResumo: dto.epocaResumo,
      seguranca: dto.seguranca ?? undefined,
    },
  };
}

let cachePromise: Promise<Experiencia[]> | null = null;

/** Busca todas as experiências da marketplace.api — cacheada em memória pelo tempo de vida do processo/aba. */
export function getExperiencias(): Promise<Experiencia[]> {
  if (!cachePromise) {
    cachePromise = fetchExperiencias().then((dtos) =>
      dtos.map((d) => mapExperiencia(d)),
    );
    cachePromise.catch(() => {
      cachePromise = null;
    });
  }
  return cachePromise;
}

export async function getExperiencia(
  slug: string,
): Promise<Experiencia | undefined> {
  try {
    const dto = await getExperienciaBySlug(slug);
    return mapExperiencia(dto);
  } catch {
    return undefined;
  }
}

export interface DestinoComExperiencia {
  destinoSlug: string;
  destinoNome: string;
  atracaoNome: string;
  descricao: string;
  imagem: string;
  alt: string;
}

/**
 * Pra cada Atracao (entidade específica dentro de um PontoTuristico — ver
 * marketplace.api.domain/Atracao.cs) marcada com essa experiência,
 * devolve o destino e o nome da atração — usado na página da experiência
 * ("Onde viver essa experiência"). Precisa de uma chamada própria
 * (`getExperienciaBySlug`, que inclui `atracoes.pontoTuristico`) porque
 * esse nível de detalhe não vem junto quando a experiência chega
 * embutida em Destino.experiencias.
 *
 * `pontoTuristico.destino` não é populado pelo repositório nesse ponto —
 * só `destinoId` — por isso recebe a lista de destinos já carregada
 * (`destinos`, de getDestinos()) pra resolver nome/slug/imagem.
 */
export async function getDestinosPorExperiencia(
  slug: string,
  destinos: Destino[],
): Promise<DestinoComExperiencia[]> {
  const experiencia = await getExperienciaBySlug(slug).catch(() => null);
  if (!experiencia?.atracoes) return [];

  const destinosPorId = new Map(destinos.map((d) => [d.id, d]));
  const resultado: DestinoComExperiencia[] = [];

  for (const atracao of experiencia.atracoes) {
    const pontoTuristico = atracao.pontoTuristico;
    if (!pontoTuristico) continue;
    const destino = destinosPorId.get(pontoTuristico.destinoId);
    if (!destino) continue;

    resultado.push({
      destinoSlug: destino.slug,
      destinoNome: destino.nome,
      atracaoNome: atracao.nome,
      descricao: atracao.descricao,
      imagem: atracao.imagemUrl || destino.imagem,
      alt: atracao.alt || atracao.nome,
    });
  }

  return resultado;
}

/**
 * Versão mais simples da busca acima, baseada só em `Destino.experiencias`
 * (já embutido na listagem de destinos) — usada onde só o `destinoSlug`
 * importa, sem precisar do nome da atração específica (ver uso no wizard
 * de planejar viagem).
 */
export function getDestinosQueOferecem(
  slug: string,
  destinos: Destino[],
): Destino[] {
  return destinos.filter((d) => d.experiencias.some((e) => e.slug === slug));
}
