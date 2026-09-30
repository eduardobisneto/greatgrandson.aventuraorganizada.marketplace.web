import { createFileRoute, Link } from "@tanstack/react-router";

import {
  CarrosselHorizontal,
  cartaoCarrosselClassName,
  ConteudoCartaoOverlay,
} from "@/components/CarrosselHorizontal";
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
        <CarrosselHorizontal>
          {experiencias.map((experiencia) => (
            <Link
              key={experiencia.slug}
              to="/experiencias/$slug"
              params={{ slug: experiencia.slug }}
              className={cartaoCarrosselClassName}
            >
              <ConteudoCartaoOverlay
                titulo={experiencia.titulo}
                descricao={experiencia.descricao}
                imagem={experiencia.imagem}
                alt={experiencia.alt}
                icon={experiencia.icon}
              />
            </Link>
          ))}
        </CarrosselHorizontal>
      </section>
    </>
  );
}
