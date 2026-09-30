import { createFileRoute } from "@tanstack/react-router";

import { AtracoesGallery } from "@/components/AtracoesGallery";
import { Hero } from "@/components/Hero";
import { OrganizacaoSection } from "@/components/OrganizacaoSection";
import { ExperienciasGallery } from "@/components/ExperienciasGallery";
import { WhatsappButton } from "@/components/WhatsappButton";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <>
      <Hero />
      <OrganizacaoSection />
      <ExperienciasGallery />
      <AtracoesGallery />
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
