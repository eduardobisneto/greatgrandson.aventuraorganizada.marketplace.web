import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ErrorComponentProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { FloatingWhatsappButton } from "@/components/FloatingWhatsappButton";
import { AuthProvider } from "@/lib/auth-context";
import { getDestinos, type Destino } from "@/data/destinos";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    // Carregado uma vez pra toda a árvore de rotas — o Header (sempre
    // visível) precisa da lista de destinos pro menu "Destinos" (ver
    // DestinosNavDropdown). Se a marketplace.api estiver fora do ar, cai
    // pra lista vazia em vez de quebrar a navegação do site inteiro.
    loader: async (): Promise<{ destinos: Destino[] }> => {
      try {
        return { destinos: await getDestinos() };
      } catch {
        return { destinos: [] };
      }
    },
    head: () => ({
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        {
          title: "Aventura Organizada — Turismo de aventura pelo Brasil",
        },
        {
          name: "description",
          content:
            "Pacotes completos de turismo de aventura em Bonito (MS), Socorro, Brotas e Ubatuba (SP): mobilidade, estadia e experiências gastronômicas e culturais organizadas de ponta a ponta.",
        },
      ],
      links: [
        { rel: "stylesheet", href: appCss },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
      ],
    }),
    component: RootComponent,
    // Pego aqui como fallback pra qualquer rota filha que não define o seu
    // próprio errorComponent — sem isso, um loader que lança (ex: API fora
    // do ar) derruba a página inteira na tela genérica "Something went
    // wrong!" do TanStack Router, sem header/footer. Header/Footer deste
    // componente raiz continuam renderizando normalmente ao redor; só o
    // conteúdo da rota que falhou é trocado por esta mensagem.
    errorComponent: RotaComErro,
  },
);

function RotaComErro({ error, reset }: ErrorComponentProps) {
  return (
    <div className="section-padding">
      <div className="container-tight flex flex-col items-center gap-4 text-center">
        <h1 className="text-balance text-2xl md:text-3xl">
          Não conseguimos carregar esta página
        </h1>
        <p className="max-w-md text-muted-foreground">
          Pode ser uma instabilidade passageira na nossa API. Tente de novo em
          alguns instantes.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-full bg-forest-800 px-6 py-2.5 text-sm font-semibold text-sand-50 transition-colors hover:bg-forest-700"
        >
          Tentar de novo
        </button>
        {import.meta.env.DEV && (
          <pre className="mt-4 max-w-full overflow-auto rounded-lg bg-secondary p-4 text-left text-xs text-muted-foreground">
            {error instanceof Error ? error.message : String(error)}
          </pre>
        )}
      </div>
    </div>
  );
}

function RootComponent() {
  const { destinos } = Route.useLoaderData();
  return (
    <RootDocument>
      <AuthProvider>
        <Header destinos={destinos} />
        {/*
          O header agora é fixed (flutua sobre o hero nas páginas que têm
          um banner full-bleed no topo — ver ehRotaComHeroNoTopo em
          Header.tsx), então saiu do fluxo normal. Esse padding-top
          compensa a altura dele (h-16) pra todo o resto do site não ficar
          escondido atrás dele; as 3 seções de hero cancelam esse espaço
          com -mt-16, pra ficarem coladas no topo de verdade, atrás do
          header transparente.
        */}
        <main className="pt-16">
          <Outlet />
        </main>
        <Footer />
        <CookieConsent />
        <FloatingWhatsappButton />
      </AuthProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
