import { Link } from "@tanstack/react-router";

import {
  CarrosselHorizontal,
  cartaoCarrosselClassName,
  ConteudoCartaoOverlay,
} from "@/components/CarrosselHorizontal";
import { experiencias } from "@/data/experiencias";

export function ExperienciasGallery() {
  return (
    <section className="section-padding bg-sand-100">
      <div className="container-tight">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Experiências
          </span>
          <h2 className="mt-3 text-balance text-3xl md:text-4xl">
            Atividades que fazem parte dos nossos roteiros
          </h2>
          <p className="mt-4 text-muted-foreground">
            De experiências tranquilas às mais emocionantes, montamos o pacote
            ideal para o seu grupo.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <CarrosselHorizontal>
          {experiencias.map((exp) => (
            <Link
              key={exp.slug}
              to="/experiencias/$slug"
              params={{ slug: exp.slug }}
              className={cartaoCarrosselClassName}
            >
              <ConteudoCartaoOverlay
                titulo={exp.titulo}
                descricao={exp.descricao}
                imagem={exp.imagem}
                alt={exp.alt}
                icon={exp.icon}
              />
            </Link>
          ))}
        </CarrosselHorizontal>
      </div>
    </section>
  );
}
