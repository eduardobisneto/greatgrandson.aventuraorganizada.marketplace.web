import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  LogOut,
  Menu,
  Receipt,
  User,
  UserCircle,
  X,
  Mountain,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DestinosNavDropdown } from "@/components/DestinosNavDropdown";
import { useAuth } from "@/lib/auth-context";
import {
  getPlanosDoUsuario,
  onPlanosAtualizados,
  pedirListaDeViagens,
} from "@/lib/trip-plan";

const navLinks = [
  { to: "/experiencias", label: "Experiências" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

/**
 * Rotas cuja primeira seção é um banner full-bleed com imagem (Hero da
 * home, topo da página do destino, topo da página da experiência, e o
 * PageHeroBanner das páginas institucionais) — só nelas o header flutua
 * transparente sobre a imagem, igual ao menu do concorrente. Nas demais
 * páginas (sem imagem no topo) ele continua sólido, senão o texto claro
 * ficaria ilegível sobre um fundo claro.
 */
function ehRotaComHeroNoTopo(pathname: string): boolean {
  return (
    pathname === "/" ||
    pathname === "/experiencias" ||
    pathname === "/sobre" ||
    pathname === "/contato" ||
    /^\/destinos\/[^/]+$/.test(pathname) ||
    /^\/experiencias\/[^/]+$/.test(pathname)
  );
}

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [perfilOpen, setPerfilOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const perfilRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { user, ready, signOut } = useAuth();
  const navigate = useNavigate();

  const [temViagens, setTemViagens] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const transparente =
    ehRotaComHeroNoTopo(pathname) && !scrolled && !mobileOpen;
  const corTexto = transparente ? "text-sand-50" : "text-foreground";
  const corTextoMuted = transparente
    ? "text-sand-50/80 hover:text-sand-50"
    : "text-muted-foreground hover:text-foreground";

  useEffect(() => {
    function recalcular() {
      setTemViagens(!!user && getPlanosDoUsuario(user.id).length > 0);
    }
    recalcular();
    return onPlanosAtualizados(recalcular);
  }, [user]);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (perfilRef.current && !perfilRef.current.contains(e.target as Node)) {
        setPerfilOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickFora);
    return () => document.removeEventListener("mousedown", handleClickFora);
  }, []);

  const rotuloBotaoViagem = temViagens ? "Minhas viagens" : "Planejar viagem";

  async function handleSignOut() {
    setPerfilOpen(false);
    await signOut();
    navigate({ to: "/" });
  }

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors print:hidden ${
        transparente
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border/50 bg-background/95 backdrop-blur"
      }`}
    >
      <div className="container-tight flex h-16 items-center justify-between">
        <Link to="/" className={`flex items-center gap-2 ${corTexto}`}>
          <Mountain
            className={`h-6 w-6 ${transparente ? "text-sand-50" : "text-primary"}`}
          />
          <span className="font-display text-xl tracking-tight">
            Aventura Organizada
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            to="/"
            className={`text-sm font-medium uppercase tracking-wide transition-colors ${
              pathname === "/" ? corTexto : corTextoMuted
            }`}
          >
            Home
          </Link>

          <DestinosNavDropdown transparente={transparente} />

          {navLinks.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`text-sm font-medium uppercase tracking-wide transition-colors ${
                  isActive ? corTexto : corTextoMuted
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            to="/planejar-viagem"
            search={{ planoId: undefined, step: undefined }}
            onClick={() => {
              if (temViagens) pedirListaDeViagens();
            }}
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2 text-sm font-semibold uppercase tracking-wide text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {rotuloBotaoViagem}
          </Link>

          {ready && (
            <>
              {user ? (
                <div ref={perfilRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setPerfilOpen((atual) => !atual)}
                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${corTexto}`}
                  >
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.nome}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                    ) : (
                      <User
                        className={`h-4 w-4 ${transparente ? "text-sand-50" : "text-primary"}`}
                      />
                    )}
                    {user.nome.split(" ")[0]}
                    <ChevronDown className={`h-3.5 w-3.5 ${corTextoMuted}`} />
                  </button>

                  {perfilOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-border bg-background py-1.5 shadow-lg">
                      <Link
                        to="/perfil"
                        onClick={() => setPerfilOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        <UserCircle className="h-4 w-4 text-primary" />
                        Editar perfil
                      </Link>
                      <Link
                        to="/pagamentos"
                        onClick={() => setPerfilOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        <Receipt className="h-4 w-4 text-primary" />
                        Pagamentos
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-foreground transition-colors hover:bg-secondary"
                      >
                        <LogOut className="h-4 w-4 text-primary" />
                        Sair
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  search={{ redirect: undefined }}
                  className={`text-sm font-medium uppercase tracking-wide transition-colors ${corTextoMuted}`}
                >
                  Entrar
                </Link>
              )}
            </>
          )}
        </nav>

        <button
          type="button"
          className={`inline-flex items-center justify-center rounded-md p-2 md:hidden ${corTexto}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
        >
          {mobileOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border/50 bg-background md:hidden">
          <div className="container-tight flex flex-col gap-4 py-6">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="text-base font-medium uppercase tracking-wide text-foreground"
            >
              Home
            </Link>
            <DestinosNavDropdown
              mobile
              onNavigate={() => setMobileOpen(false)}
            />
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium uppercase tracking-wide text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/planejar-viagem"
              search={{ planoId: undefined, step: undefined }}
              onClick={() => {
                setMobileOpen(false);
                if (temViagens) pedirListaDeViagens();
              }}
              className="mt-2 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground"
            >
              {rotuloBotaoViagem}
            </Link>

            {ready && (
              <>
                {user ? (
                  <>
                    <Link
                      to="/perfil"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center gap-2 text-base font-medium uppercase tracking-wide text-foreground"
                    >
                      <UserCircle className="h-4 w-4" />
                      Editar perfil
                    </Link>
                    <Link
                      to="/pagamentos"
                      onClick={() => setMobileOpen(false)}
                      className="inline-flex items-center gap-2 text-base font-medium uppercase tracking-wide text-foreground"
                    >
                      <Receipt className="h-4 w-4" />
                      Pagamentos
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        handleSignOut();
                      }}
                      className="inline-flex items-center gap-2 text-base font-medium uppercase tracking-wide text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair ({user.nome.split(" ")[0]})
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    search={{ redirect: undefined }}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium uppercase tracking-wide text-foreground"
                  >
                    Entrar
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
