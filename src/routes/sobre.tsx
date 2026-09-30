import { createFileRoute } from "@tanstack/react-router";

import { PageHeroBanner } from "@/components/PageHeroBanner";
import { WhatsappButton } from "@/components/WhatsappButton";
import transporteImg from "@/assets/transporte.jpeg";
import hospedagemImg from "@/assets/hospedagem.jpeg";
import gastronomiaImg from "@/assets/download.jpeg";
import culturaImg from "@/assets/destino-bonito.jpeg";

export const Route = createFileRoute("/sobre")({
  component: SobrePage,
});

function SobrePage() {
  return (
    <>
      <PageHeroBanner
        seed="sobre"
        eyebrow="Sobre nós"
        titulo="Organizamos aventuras desde a saída de casa até a volta"
        descricao="A Aventura Organizada nasceu para tirar do papel viagens de turismo de aventura sem a dor de cabeça de planejar cada detalhe sozinho. Cuidamos da mobilidade, da estadia, das experiências gastronômicas e das experiências culturais e de entretenimento, para que você só precise aproveitar a viagem."
      />

      <section className="section-padding bg-sand-100">
        <div className="container-tight grid gap-8 md:grid-cols-2 md:items-center">
          <img
            src={transporteImg}
            alt="Van de turismo pronta para levar o grupo até o destino"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <div>
            <h2 className="text-balance text-2xl md:text-3xl">
              Mobilidade pensada para grupos, amigos e família
            </h2>
            <p className="mt-4 text-muted-foreground">
              Trabalhamos com mobilidade exclusiva, motoristas experientes e
              paradas estratégicas para que o trajeto seja tão bom quanto o
              destino — seja para o grupo da empresa, a turma de amigos ou a
              família toda.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-tight grid gap-8 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-balance text-2xl md:text-3xl">
              Experiências de estadia perto das atrações
            </h2>
            <p className="mt-4 text-muted-foreground">
              Selecionamos pousadas com conforto, café da manhã regional e
              localização estratégica para reduzir o deslocamento entre os
              passeios.
            </p>
          </div>
          <img
            src={hospedagemImg}
            alt="Pousada aconchegante em meio à natureza"
            className="order-1 aspect-[4/3] w-full rounded-2xl object-cover md:order-2"
            loading="lazy"
          />
        </div>
      </section>

      <section className="section-padding bg-sand-100">
        <div className="container-tight grid gap-8 md:grid-cols-2 md:items-center">
          <img
            src={gastronomiaImg}
            alt="Foto ilustrativa de experiência gastronômica regional"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
            loading="lazy"
          />
          <div>
            <h2 className="text-balance text-2xl md:text-3xl">
              Experiências gastronômicas
            </h2>
            <p className="mt-4 text-muted-foreground">
              Do café da manhã reforçado aos jantares com pratos típicos de cada
              região, incluímos paradas gastronômicas que fazem parte da
              experiência — não só refeições no meio do caminho.
            </p>
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-tight grid gap-8 md:grid-cols-2 md:items-center">
          <div className="order-2 md:order-1">
            <h2 className="text-balance text-2xl md:text-3xl">
              Experiências culturais
            </h2>
            <p className="mt-4 text-muted-foreground">
              Visitas a mercados locais, artesanato regional e contato com a
              cultura de cada destino, para conhecer não só a paisagem, mas
              também a história e as pessoas de cada lugar.
            </p>
          </div>
          <img
            src={culturaImg}
            alt="Foto ilustrativa de experiência cultural regional"
            className="order-1 aspect-[4/3] w-full rounded-2xl object-cover md:order-2"
            loading="lazy"
          />
        </div>
      </section>

      <section className="section-padding">
        <div className="container-tight">
          <p className="mx-auto max-w-3xl text-balance text-center font-display text-2xl leading-snug text-forest-800 md:text-3xl">
            Aventura, sabor e cultura — cada viagem é uma história completa, não
            só um destino no mapa.
          </p>
        </div>
      </section>

      <section className="section-padding bg-forest-900 text-sand-50">
        <div className="container-tight flex flex-col items-center gap-6 text-center">
          <h2 className="text-balance text-3xl md:text-4xl">
            Vamos planejar a sua próxima viagem?
          </h2>
          <WhatsappButton variant="solid" />
        </div>
      </section>
    </>
  );
}
