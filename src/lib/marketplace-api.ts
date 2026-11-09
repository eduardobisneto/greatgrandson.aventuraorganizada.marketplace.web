/**
 * Cliente da marketplace.api (C#/.NET) — a API real por trás do site
 * público. Os tipos abaixo espelham greatgrandson.aventuraorganizada
 * .marketplace.api.domain tal como existem na branch
 * `feature/unifica-catalogo-oferta` (ainda não mergeada em `develop`,
 * mas é o formato pra onde o backend está indo — ver Controllers/*.cs
 * nessa branch).
 *
 * ⚠️ Sem backend real rodando neste ambiente para testar contra — os
 * tipos abaixo foram lidos diretamente do código-fonte C# (domain +
 * Controllers), não adivinhados, mas nunca foram exercitados contra uma
 * instância real da API.
 *
 * Endpoints do catálogo (Destino/Experiencia) não exigem autenticação
 * (ver comentário "Sem [Authorize] de propósito" nos controllers — o
 * Cognito ainda é fake, isso bloquearia 100% das leituras). O
 * OfertaController (catálogo interno de preço/disponibilidade) é de uso
 * exclusivo do backoffice.web/analista e não é consumido aqui.
 */
import { MARKETPLACE_API_URL } from "@/lib/api-config";

export class MarketplaceApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "MarketplaceApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${MARKETPLACE_API_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new MarketplaceApiError(
      "Não foi possível conectar à marketplace.api. Tente novamente em alguns instantes.",
      0,
    );
  }

  if (!response.ok) {
    // A API .NET costuma responder ProblemDetails (JSON com `title`/
    // `detail`) em erros de validação, ou texto puro/stack trace em
    // exceções não tratadas (ex.: a cadeia identity.api -> Cognito fake
    // lançando exceção — ver README da identity.api). Tenta extrair a
    // mensagem mais útil possível, sem travar se o corpo não for o
    // esperado.
    const texto = await response.text().catch(() => "");
    let mensagem = texto;
    try {
      const corpo = JSON.parse(texto) as {
        title?: string;
        detail?: string;
        message?: string;
      };
      mensagem = corpo.detail || corpo.title || corpo.message || texto;
    } catch {
      // corpo não é JSON — usa o texto puro mesmo.
    }
    throw new MarketplaceApiError(
      mensagem || `Erro ${response.status} ao chamar a marketplace.api.`,
      response.status,
    );
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

// ---------------------------------------------------------------------------
// Geografia (Destino.estado.pais)
// ---------------------------------------------------------------------------

export interface PaisDto {
  id: string;
  nome: string;
  codigo: string;
}

export interface EstadoDto {
  id: string;
  nome: string;
  sigla: string;
  paisId: string;
  pais?: PaisDto | null;
}

// ---------------------------------------------------------------------------
// Destino / PontoTuristico / Experiencia
// ---------------------------------------------------------------------------

export interface NumeroDestinoDto {
  valor: string;
  label: string;
}

export interface RestricaoDto {
  id: string;
  nivel: number;
  referenciaId: string;
  descricao: string;
  tipo?: string | null;
}

export interface PontoTuristicoDto {
  id: string;
  destinoId: string;
  nome: string;
  descricao: string;
  imagemUrl: string;
  alt: string;
  administracao?: number | null;
  cobraIngresso?: boolean | null;
  valorIngressoReferencia?: number | null;
}

export interface AtracaoDto {
  id: string;
  pontoTuristicoId: string;
  pontoTuristico?: PontoTuristicoDto | null;
  nome: string;
  descricao: string;
  imagemUrl?: string | null;
  alt?: string | null;
  experiencias: ExperienciaDto[];
}

export interface ExperienciaDto {
  id: string;
  slug: string;
  titulo: string;
  descricao: string;
  imagemUrl?: string | null;
  alt?: string | null;
  iconeNome?: string | null;
  opcoesTitulo: string;
  opcoes: string[];
  beneficios: string[];
  melhorEpoca: string;
  publico: string;
  nivel: string;
  faixaEtaria: string;
  epocaResumo: string;
  seguranca?: string | null;
  /**
   * Só vem populada quando a experiência é carregada via
   * `getBySlug`/`getById`/`getAll` (ExperienciaRepository faz
   * `.Include(atracoes).ThenInclude(pontoTuristico)`) — não quando ela
   * chega embutida dentro de um Destino (ali o repositório não inclui
   * esse nível).
   */
  atracoes?: AtracaoDto[];
}

export interface DestinoDto {
  id: string;
  slug: string;
  nome: string;
  tagline: string;
  descricao: string;
  imagemUrl: string;
  alt: string;
  duracao: string;
  grupo: string;
  estadoId?: string | null;
  estado?: EstadoDto | null;
  mapsQuery: string;
  mapsZoom: number;
  mapsUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  totalAtracoes?: number | null;
  historia: string[];
  incluso: string[];
  numeros: NumeroDestinoDto[];
  pontosTuristicos: PontoTuristicoDto[];
  experiencias: ExperienciaDto[];
  dataCriacao: string;
  dataAlteracao?: string | null;
}

export async function getDestinos(): Promise<DestinoDto[]> {
  return request<DestinoDto[]>("/api/destinos");
}

export async function getDestinoBySlug(slug: string): Promise<DestinoDto> {
  return request<DestinoDto>(`/api/destinos/slug/${encodeURIComponent(slug)}`);
}

export async function getExperiencias(): Promise<ExperienciaDto[]> {
  return request<ExperienciaDto[]>("/api/experiencias");
}

export async function getExperienciaBySlug(
  slug: string,
): Promise<ExperienciaDto> {
  return request<ExperienciaDto>(
    `/api/experiencias/slug/${encodeURIComponent(slug)}`,
  );
}

export async function getAtracoesPorPontoTuristico(
  pontoTuristicoId: string,
): Promise<AtracaoDto[]> {
  return request<AtracaoDto[]>(
    `/api/atracoes/ponto-turistico/${pontoTuristicoId}`,
  );
}

// ---------------------------------------------------------------------------
// Auth (proxy pra identity.api — ver AuthController.cs)
// ---------------------------------------------------------------------------

export enum UsuarioPerfil {
  Cliente = 0,
  Analista = 1,
  Admin = 2,
}

export interface AuthUserDto {
  id: string;
  nome: string;
  email: string;
  perfil: UsuarioPerfil;
  accessToken: string;
  idToken: string;
  refreshToken?: string | null;
  expiresIn: number;
}

export interface SignUpRequestDto {
  nome: string;
  email: string;
  senha: string;
}

export interface SignInRequestDto {
  email: string;
  senha: string;
}

export async function signUp(payload: SignUpRequestDto): Promise<AuthUserDto> {
  return request<AuthUserDto>("/api/auth/sign-up", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function signIn(payload: SignInRequestDto): Promise<AuthUserDto> {
  return request<AuthUserDto>("/api/auth/sign-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------------------------------------------------------------------------
// Planos de viagem (proxy pra viagens.api — ver PlanosViagemController.cs)
// ---------------------------------------------------------------------------

export enum EtapaPlanoViagemDto {
  Recebido = 0,
  EmAnalise = 1,
  DestinosConfirmados = 2,
  ExperienciasDefinidas = 3,
  MobilidadeDefinida = 4,
  HospedagemDefinida = 5,
  AlimentacaoDefinida = 6,
  PropostaMontada = 7,
  PropostaEnviada = 8,
  Aprovada = 9,
  Recusada = 10,
  Fechada = 11,
}

export interface SelecaoDestinoRequestDto {
  destinoId: string;
  experienciaIds: string[];
  data?: string | null;
}

export interface PlanoViagemRequestDto {
  usuarioId: string;
  selecoes: SelecaoDestinoRequestDto[];
  duracaoNoites: number;
  interesses: string[];
  contexto?: string | null;
  adultos: number;
  criancas: number;
  inclusos: string[];
}

export interface PlanoViagemResponseDto extends PlanoViagemRequestDto {
  id: string;
  etapa: EtapaPlanoViagemDto;
  criadoEm: string;
}

export async function criarPlanoViagem(
  payload: PlanoViagemRequestDto,
): Promise<PlanoViagemResponseDto> {
  return request<PlanoViagemResponseDto>("/api/planos-viagem", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getPlanosPorUsuario(
  usuarioId: string,
): Promise<PlanoViagemResponseDto[]> {
  return request<PlanoViagemResponseDto[]>(
    `/api/planos-viagem/usuario/${encodeURIComponent(usuarioId)}`,
  );
}
