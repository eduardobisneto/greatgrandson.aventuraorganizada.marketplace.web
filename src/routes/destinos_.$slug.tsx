import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Check, Users } from "lucide-react";

import {
  CarrosselHorizontal,
  cartaoCarrosselClassName,
  ConteudoCartaoOverlay,
} from "@/components/CarrosselHorizontal";
import { WhatsappButton } from "@/components/WhatsappButton";
import { getDestino } from "@/data/destinos";
import { getExperienciasPorDestino } from "@/data/experiencias";

export const Route = createFileRoute("/destinos_/$slug")({
  loader: ({ params }) => {
    const destino = getDestino(params.slug);
    if (!destino) throw notFound();
    return destino;
  },
  component: DestinoRoteiroPage,
});

function DestinoRoteiroPage() {
  const destino = Route.useLoaderData();
  const experiencias = getExperienciasPorDestino(destino.slug);
  const mapsSrc = `https://www.google.com/maps?q=${encodeURIComponent(destino.mapsQuery)}&z=${destino.mapsZoom}&output=embed`;

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={destino.imagem}
            alt={destino.alt}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/50 to-forest-900/30" />
        </div>

        <div className="container-tight relative flex min-h-[40vh] flex-col justify-end gap-4 py-16 text-sand-50">
          <Link
            to="/destinos"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-sand-50/90 transition-colors hover:text-sand-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para destinos
          </Link>
          <h1 className="text-balance text-4xl md:text-5xl">{destino.nome}</h1>
          <p className="text-lg text-forest-100">{destino.tagline}</p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-tight grid gap-12 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4 text-muted-foreground">
            {destino.historia.map((paragrafo, index) => (
              <p key={index}>{paragrafo}</p>
            ))}

            <div className="grid gap-6 pt-4 sm:grid-cols-3">
              {destino.numeros.map((numero) => (
                <div key={numero.label}>
                  <p className="font-display text-3xl text-primary md:text-4xl">
                    {numero.valor}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {numero.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <div className="flex flex-wrap gap-3 text-xs font-medium text-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                <CalendarDays className="h-3.5 w-3.5 text-primary" />
                {destino.duracao}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5">
                <Users className="h-3.5 w-3.5 text-primary" />
                {destino.grupo}
              </span>
            </div>

            <h3 className="mt-6 font-display text-lg">O que está incluso</h3>
            <ul className="mt-3 space-y-2">
              {destino.incluso.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <WhatsappButton variant="solid" />
            </div>
          </aside>
        </div>
      </section>

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Localização
            </span>
            <h2 className="mt-3 text-balance text-3xl md:text-4xl">
              Onde fica {destino.nome}
            </h2>
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-border">
            <iframe
              title={`Mapa de ${destino.nome}`}
              src={mapsSrc}
              className="h-[400px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {experiencias.length > 0 && (
        <section className="section-padding">
          <div className="container-tight">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-sm font-semibold uppercase tracking-wider text-primary">
                Experiências
              </span>
              <h2 className="mt-3 text-balance text-3xl md:text-4xl">
                O que você vive em {destino.nome.split(",")[0]}
              </h2>
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
      )}

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Atrações
            </span>
            <h2 className="mt-3 text-balance text-3xl md:text-4xl">
              Principais pontos do roteiro
            </h2>
          </div>
        </div>

        <div className="mt-12">
          <CarrosselHorizontal>
            {destino.atracoes.map((atracao) => (
              <div key={atracao.nome} className={cartaoCarrosselClassName}>
                <ConteudoCartaoOverlay
                  titulo={atracao.nome}
                  descricao={atracao.descricao}
                  imagem={atracao.imagem}
                  alt={atracao.alt}
                />
              </div>
            ))}
          </CarrosselHorizontal>
        </div>

        {destino.totalAtracoes && (
          <div className="container-tight">
            <p className="mx-auto mt-16 max-w-2xl text-balance text-center font-display text-xl leading-snug text-forest-800 md:text-2xl">
              E olha que isso é só o começo: {destino.nome.split(",")[0]} tem
              mais de {destino.totalAtracoes} atrações — no seu roteiro, a gente
              destaca as principais para o tempo que você tiver.
            </p>
          </div>
        )}
      </section>

      <section className="section-padding bg-forest-900 text-sand-50">
        <div className="container-tight flex flex-col items-center gap-6 text-center">
          <h2 className="text-balance text-3xl md:text-4xl">
            Vamos planejar a sua viagem para {destino.nome}?
          </h2>
          <WhatsappButton variant="solid" />
        </div>
      </section>
    </>
  );
}
