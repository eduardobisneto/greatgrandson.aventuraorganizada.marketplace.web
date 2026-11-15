import { createFileRoute } from "@tanstack/react-router";

import { AtracoesGallery } from "@/components/AtracoesGallery";
import { Hero } from "@/components/Hero";
import { OrganizacaoSection } from "@/components/OrganizacaoSection";
import { ExperienciasGallery } from "@/components/ExperienciasGallery";
import { WhatsappButton } from "@/components/WhatsappButton";
import { getDestinos } from "@/data/destinos";
import { getExperiencias } from "@/data/experiencias";

export const Route = createFileRoute("/")({
  // Cai pra listas vazias se a marketplace.api estiver fora do ar — a home
  // ainda renderiza (hero, seções estáticas) em vez da tela de erro
  // genérica. Mesmo padrão do __root.tsx pro menu.
  loader: async () => {
    const [destinos, experiencias] = await Promise.all([
      getDestinos().catch(() => []),
      getExperiencias().catch(() => []),
    ]);
    return { destinos, experiencias };
  },
  component: HomePage,
});

function HomePage() {
  const { destinos, experiencias } = Route.useLoaderData();
  return (
    <>
      <Hero destinos={destinos} />
      <OrganizacaoSection />
      <ExperienciasGallery experiencias={experiencias} />
      <AtracoesGallery destinos={destinos} />
      <section className="section-padding bg-forest-900 text-sand-50">
        <div className="container-tight flex flex-col items-center gap-6 text-center">
          <h2 className="text-balance text-3xl md:text-4xl">
            Pronto para viver essa aventura?
          </h2>
          <p className="max-w-xl text-forest-100">
            Fale com a gente pelo WhatsApp e monte o roteiro ideal para o seu
            grupo em qualquer um dos nossos destinos.
          </p>
          <WhatsappButton variant="solid" />
        </div>
      </section>
    </>
  );
}
