/**
 * Cliente de autenticação da marketplace.web.
 *
 * `signUp`/`signIn` chamam a marketplace.api de verdade
 * (POST /api/auth/sign-up e /api/auth/sign-in — ver AuthController.cs),
 * que por trás repassa pra identity.api, que por trás fala com o
 * Cognito — o front nunca fala com identity.api/Cognito diretamente.
 *
 * ⚠️ LIMITAÇÃO CONHECIDA, não é algo pra corrigir por aqui: o Cognito da
 * identity.api ainda é FAKE hoje — `COGNITO_USER_POOL_ID`/
 * `COGNITO_CLIENT_ID` são placeholders (ver a seção "⚠️ Cognito ainda é
 * FAKE" do README da identity.api). Uma chamada real por essa cadeia
 * pode lançar exceção ao tentar falar com a AWS de verdade, até esse
 * User Pool existir. O tratamento abaixo só garante que isso aparece
 * como uma mensagem de erro normal na tela de login/cadastro, em vez de
 * travar a página — ver `signUp`/`signIn`.
 *
 * `signOut`/`getCurrentUser` continuam lendo/escrevendo a sessão em
 * localStorage (contrato inalterado) — não existe endpoint de "sessão
 * atual" na marketplace.api, e o resto do app (guarda de rotas, header
 * etc.) depende dessa leitura local síncrona.
 *
 * `updateProfile` guarda telefone/endereço/avatar só em localStorage,
 * de propósito — a marketplace.api não tem (ainda) nenhum endpoint pra
 * atualizar esses campos de perfil (ver AuthUser/UsuarioResumo em
 * identity.api.domain: só nome/email/perfil/status, sem endereço). Não
 * é um corte de escopo arbitrário: esses dados simplesmente não têm
 * onde viver no backend hoje.
 */
import {
  signIn as signInApi,
  signUp as signUpApi,
  MarketplaceApiError,
} from "@/lib/marketplace-api";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  avatarUrl?: string | undefined;
  telefone?: string | undefined;
  cep?: string | undefined;
  endereco?: string | undefined;
  numero?: string | undefined;
  complemento?: string | undefined;
  bairro?: string | undefined;
  cidade?: string | undefined;
  estado?: string | undefined;
}

export interface EnderecoInput {
  telefone?: string | undefined;
  cep?: string | undefined;
  endereco?: string | undefined;
  numero?: string | undefined;
  complemento?: string | undefined;
  bairro?: string | undefined;
  cidade?: string | undefined;
  estado?: string | undefined;
}

const SESSION_KEY = "ao_auth_session";
/** Só os campos de perfil que a marketplace.api não modela (ver comentário no topo do arquivo) — nunca a conta/senha em si. */
const PROFILE_EXTRAS_KEY = "ao_auth_profile_extras";

type ExtrasDePerfil = EnderecoInput & { avatarUrl?: string | undefined };

function lerExtrasDoPerfil(userId: string): ExtrasDePerfil {
  try {
    const raw = window.localStorage.getItem(PROFILE_EXTRAS_KEY);
    const todos = raw
      ? (JSON.parse(raw) as Record<string, ExtrasDePerfil>)
      : {};
    return todos[userId] ?? {};
  } catch {
    return {};
  }
}

function salvarExtrasDoPerfil(userId: string, extras: ExtrasDePerfil) {
  try {
    const raw = window.localStorage.getItem(PROFILE_EXTRAS_KEY);
    const todos = raw
      ? (JSON.parse(raw) as Record<string, ExtrasDePerfil>)
      : {};
    todos[userId] = extras;
    window.localStorage.setItem(PROFILE_EXTRAS_KEY, JSON.stringify(todos));
  } catch {
    // localStorage indisponível (modo privado, cookies bloqueados etc.) — segue sem persistir os extras.
  }
}

function salvarSessao(user: AuthUser) {
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // idem — sessão só não sobrevive a um refresh, não é fatal.
  }
}

/** Erro da marketplace.api repassado com a mensagem real da API, em vez de travar a tela de login/cadastro. */
function mensagemDeErro(err: unknown, fallback: string): Error {
  if (err instanceof MarketplaceApiError) return new Error(err.message);
  if (err instanceof Error) return err;
  return new Error(fallback);
}

export async function signUp(input: {
  nome: string;
  email: string;
  senha: string;
}): Promise<AuthUser> {
  let resposta;
  try {
    resposta = await signUpApi({
      nome: input.nome.trim(),
      email: input.email.trim().toLowerCase(),
      senha: input.senha,
    });
  } catch (err) {
    throw mensagemDeErro(err, "Não foi possível criar a conta.");
  }

  const user: AuthUser = {
    id: resposta.id,
    nome: resposta.nome,
    email: resposta.email,
    ...lerExtrasDoPerfil(resposta.id),
  };
  salvarSessao(user);
  return user;
}

export async function signIn(input: {
  email: string;
  senha: string;
}): Promise<AuthUser> {
  let resposta;
  try {
    resposta = await signInApi({
      email: input.email.trim().toLowerCase(),
      senha: input.senha,
    });
  } catch (err) {
    throw mensagemDeErro(err, "Não foi possível entrar.");
  }

  const user: AuthUser = {
    id: resposta.id,
    nome: resposta.nome,
    email: resposta.email,
    ...lerExtrasDoPerfil(resposta.id),
  };
  salvarSessao(user);
  return user;
}

export async function signOut(): Promise<void> {
  window.localStorage.removeItem(SESSION_KEY);
}

export async function updateProfile(
  userId: string,
  input: { nome?: string; avatarUrl?: string | undefined } & EnderecoInput,
): Promise<AuthUser> {
  const atual = getCurrentUser();
  if (!atual || atual.id !== userId) {
    throw new Error("Usuário não encontrado.");
  }

  const extrasAtuais = lerExtrasDoPerfil(userId);
  const extras: ExtrasDePerfil = {
    avatarUrl: input.avatarUrl ?? extrasAtuais.avatarUrl,
    telefone: input.telefone ?? extrasAtuais.telefone,
    cep: input.cep ?? extrasAtuais.cep,
    endereco: input.endereco ?? extrasAtuais.endereco,
    numero: input.numero ?? extrasAtuais.numero,
    complemento: input.complemento ?? extrasAtuais.complemento,
    bairro: input.bairro ?? extrasAtuais.bairro,
    cidade: input.cidade ?? extrasAtuais.cidade,
    estado: input.estado ?? extrasAtuais.estado,
  };
  salvarExtrasDoPerfil(userId, extras);

  const user: AuthUser = {
    id: atual.id,
    nome: input.nome?.trim() || atual.nome,
    email: atual.email,
    ...extras,
  };
  salvarSessao(user);
  return user;
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}
