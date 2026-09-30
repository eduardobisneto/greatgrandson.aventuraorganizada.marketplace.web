import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Mail, Phone } from "lucide-react";

import { PageHeroBanner } from "@/components/PageHeroBanner";
import { WhatsappButton } from "@/components/WhatsappButton";

export const Route = createFileRoute("/contato")({
  component: ContatoPage,
});

const canais = [
  {
    icon: Phone,
    titulo: "Telefone",
    valor: "(11) 96322-0494",
    href: "https://wa.me/5511963220494",
  },
  {
    icon: Mail,
    titulo: "E-mail",
    valor: "contato@aventuraorganizada.com.br",
    href: undefined,
  },
  {
    icon: Instagram,
    titulo: "Instagram",
    valor: "@aventuraorganizada",
    href: "https://www.instagram.com/aventuraorganizada/",
  },
];

function ContatoPage() {
  return (
    <>
      <PageHeroBanner
        seed="contato"
        eyebrow="Contato"
        titulo="Vamos planejar a sua aventura"
        descricao="Fale com a gente pelo WhatsApp e monte um roteiro sob medida para o seu grupo em qualquer um dos nossos destinos."
      >
        <div className="mt-2">
          <WhatsappButton variant="solid" />
        </div>
      </PageHeroBanner>

      <section className="section-padding bg-sand-100">
        <div className="container-tight">
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
            {canais.map((canal) => (
              <div
                key={canal.titulo}
                className="rounded-2xl border border-border bg-background p-6 text-center"
              >
                <div className="mx-auto mb-4 inline-flex rounded-xl bg-secondary p-3">
                  <canal.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg">{canal.titulo}</h3>
                {canal.href ? (
                  <a
                    href={canal.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm text-primary transition-colors hover:text-primary/80"
                  >
                    {canal.valor}
                  </a>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {canal.valor}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
