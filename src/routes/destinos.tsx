import { createFileRoute } from "@tanstack/react-router";

import { DestinoCard } from "@/components/DestinoCard";
import { getDestinos } from "@/data/destinos";

export const Route = createFileRoute("/destinos")({
  loader: () => getDestinos(),
  component: DestinosPage,
});

function DestinosPage() {
  const destinos = Route.useLoaderData();
  return (
    <>
      <section className="section-padding">
        <div className="container-tight">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Destinos
            </span>
            <h1 className="mt-3 text-balance text-3xl md:text-4xl">
              Para onde vamos na próxima aventura?
            </h1>
            <p className="mt-4 text-muted-foreground">
              Cada destino tem um roteiro montado com mobilidade, estadia e
              experiências gastronômicas e culturais inclusas.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="grid gap-8 md:grid-cols-2">
            {destinos.map((destino) => (
              <DestinoCard key={destino.slug} {...destino} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
