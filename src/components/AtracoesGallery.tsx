import { Link } from "@tanstack/react-router";

import {
  CarrosselHorizontal,
  cartaoCarrosselClassName,
  ConteudoCartaoOverlay,
} from "@/components/CarrosselHorizontal";
import { destinos } from "@/data/destinos";

/** Uma atração em destaque por destino — um recorte pra home, não o catálogo completo (esse fica na página do destino). */
const principaisAtracoes = destinos
  .filter((destino) => destino.atracoes.length > 0)
  .map((destino) => ({ destino, atracao: destino.atracoes[0]! }));

export function AtracoesGallery() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Atrações
          </span>
          <h2 className="mt-3 text-balance text-3xl md:text-4xl">
            Principais atrações dos nossos destinos
          </h2>
          <p className="mt-4 text-muted-foreground">
            Um recorte do que você pode viver em cada lugar — no seu roteiro, a
            gente destaca as principais para o tempo que você tiver.
          </p>
        </div>
      </div>

      <div className="mt-12">
        <CarrosselHorizontal>
          {principaisAtracoes.map(({ destino, atracao }) => (
            <Link
              key={`${destino.slug}-${atracao.nome}`}
              to="/destinos/$slug"
              params={{ slug: destino.slug }}
              className={cartaoCarrosselClassName}
            >
              <ConteudoCartaoOverlay
                titulo={atracao.nome}
                subtitulo={destino.nome}
                descricao={atracao.descricao}
                imagem={atracao.imagem}
                alt={atracao.alt}
              />
            </Link>
          ))}
        </CarrosselHorizontal>
      </div>
    </section>
  );
}
