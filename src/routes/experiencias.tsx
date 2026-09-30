import { createFileRoute } from "@tanstack/react-router";

import { ExperienciaCard } from "@/components/ExperienciaCard";
import { PageHeroBanner } from "@/components/PageHeroBanner";
import { experiencias } from "@/data/experiencias";

export const Route = createFileRoute("/experiencias")({
  component: ExperienciasPage,
});

function ExperienciasPage() {
  return (
    <>
      <PageHeroBanner
        seed="experiencias"
        eyebrow="Experiências"
        titulo="Atividades que fazem parte dos nossos roteiros"
        descricao="De experiências tranquilas às mais emocionantes, montamos o pacote ideal para o seu grupo."
      />

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="grid gap-8 md:grid-cols-2">
            {experiencias.map((experiencia) => (
              <ExperienciaCard
                key={experiencia.slug}
                slug={experiencia.slug}
                titulo={experiencia.titulo}
                descricao={experiencia.descricao}
                imagem={experiencia.imagem}
                alt={experiencia.alt}
                icon={experiencia.icon}
                nivel={experiencia.contexto.nivel}
                faixaEtaria={experiencia.contexto.faixaEtaria}
                epocaResumo={experiencia.contexto.epocaResumo}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
