import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import {
  ArrowLeft,
  Calendar,
  ListChecks,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";

import {
  CarrosselHorizontal,
  cartaoCarrosselClassName,
  ConteudoCartaoOverlay,
} from "@/components/CarrosselHorizontal";
import { WhatsappButton } from "@/components/WhatsappButton";
import { getExperiencia, getDestinosPorExperiencia } from "@/data/experiencias";

export const Route = createFileRoute("/experiencias_/$slug")({
  loader: ({ params }) => {
    const experiencia = getExperiencia(params.slug);
    if (!experiencia) throw notFound();
    return {
      destinos: getDestinosPorExperiencia(params.slug),
    };
  },
  component: ExperienciaPage,
});

function ExperienciaPage() {
  const { slug } = Route.useParams();
  const { destinos } = Route.useLoaderData();
  const experiencia = getExperiencia(slug)!;
  const Icon = experiencia.icon;

  return (
    <>
      <section className="relative overflow-hidden">
        {experiencia.imagem ? (
          <div className="absolute inset-0">
            <img
              src={experiencia.imagem}
              alt={experiencia.alt}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/50 to-forest-900/30" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-forest-800" />
        )}

        <div className="container-tight relative flex min-h-[35vh] flex-col justify-end gap-4 py-16 text-sand-50">
          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-sand-50/90 transition-colors hover:text-sand-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a home
          </Link>
          {Icon && <Icon className="h-10 w-10 text-forest-300" />}
          <h1 className="text-balance text-4xl md:text-5xl">
            {experiencia.titulo}
          </h1>
          <p className="max-w-xl text-lg text-forest-100">
            {experiencia.descricao}
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-tight grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-balance text-3xl md:text-4xl">
              O que esperar de {experiencia.titulo.toLowerCase()}
            </h2>

            <div className="mt-6">
              <h3 className="flex items-center gap-2 font-display text-lg">
                <Users className="h-5 w-5 text-primary" />
                Para quem é indicada
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {experiencia.contexto.publico}
              </p>
              <p className="mt-2 text-xs text-muted-foreground/80">
                Essa é uma referência geral, não uma norma oficial — a idade
                mínima e as regras de segurança variam por operador e são sempre
                confirmadas antes da viagem.
              </p>
            </div>

            <div className="mt-6">
              <h3 className="flex items-center gap-2 font-display text-lg">
                <Sparkles className="h-5 w-5 text-primary" />
                Benefícios
              </h3>
              <ul className="mt-3 space-y-2">
                {experiencia.contexto.beneficios.map((beneficio) => (
                  <li
                    key={beneficio}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {beneficio}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="flex items-center gap-2 font-display text-lg">
                <Calendar className="h-5 w-5 text-primary" />
                Melhor época
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {experiencia.contexto.melhorEpoca}
              </p>
            </div>

            {experiencia.contexto.seguranca && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-display text-lg">
                  <Shield className="h-5 w-5 text-primary" />
                  Segurança e normas
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {experiencia.contexto.seguranca}
                </p>
              </div>
            )}
          </div>

          <aside className="h-fit rounded-2xl border border-border bg-card p-6">
            <h3 className="flex items-center gap-2 font-display text-lg">
              <ListChecks className="h-5 w-5 text-primary" />
              {experiencia.contexto.opcoesTitulo}
            </h3>
            <ul className="mt-4 space-y-3">
              {experiencia.contexto.opcoes.map((opcao) => (
                <li
                  key={opcao}
                  className="rounded-xl bg-secondary px-4 py-3 text-sm text-foreground"
                >
                  {opcao}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Onde viver essa experiência
            </span>
            <h2 className="mt-3 text-balance text-3xl md:text-4xl">
              Destinos com {experiencia.titulo.toLowerCase()}
            </h2>
          </div>

          {destinos.length > 0 ? (
            <div className="mt-12">
              <CarrosselHorizontal>
                {destinos.map((item) => (
                  <Link
                    key={`${item.destinoSlug}-${item.atracaoNome}`}
                    to="/destinos/$slug"
                    params={{ slug: item.destinoSlug }}
                    className={cartaoCarrosselClassName}
                  >
                    <ConteudoCartaoOverlay
                      titulo={item.atracaoNome}
                      subtitulo={item.destinoNome}
                      descricao={item.descricao}
                      imagem={item.imagem}
                      alt={item.alt}
                    />
                  </Link>
                ))}
              </CarrosselHorizontal>
            </div>
          ) : (
            <p className="mx-auto mt-8 max-w-xl text-balance text-center text-muted-foreground">
              Ainda não temos um roteiro publicado com {experiencia.titulo} como
              destaque — fale com a gente pelo WhatsApp que a gente ajuda a
              encaixar essa experiência na sua viagem.
            </p>
          )}
        </div>
      </section>

      <section className="section-padding bg-forest-900 text-sand-50">
        <div className="container-tight flex flex-col items-center gap-6 text-center">
          <h2 className="text-balance text-3xl md:text-4xl">
            Vamos incluir {experiencia.titulo.toLowerCase()} na sua viagem?
          </h2>
          <WhatsappButton variant="solid" />
        </div>
      </section>
    </>
  );
}
