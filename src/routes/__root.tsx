import type { QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { FloatingWhatsappButton } from "@/components/FloatingWhatsappButton";
import { AuthProvider } from "@/lib/auth-context";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
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
  },
);

function RootComponent() {
  return (
    <RootDocument>
      <AuthProvider>
        <Header />
        <Outlet />
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
