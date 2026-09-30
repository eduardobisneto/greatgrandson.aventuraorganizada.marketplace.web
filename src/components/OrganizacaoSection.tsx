import {
  BedDouble,
  Compass,
  Plane,
  Ticket,
  UtensilsCrossed,
} from "lucide-react";

const itens = [
  {
    icon: Plane,
    titulo: "Mobilidade (Aéreo e terrestre)",
    descricao:
      "Voos e transporte terrestre organizados de ponta a ponta, com motoristas experientes e paradas estratégicas até o destino.",
  },
  {
    icon: BedDouble,
    titulo: "Estadia",
    descricao:
      "Pousadas selecionadas próximas às atrações, com conforto, café da manhã regional e ambiente integrado à natureza.",
  },
  {
    icon: UtensilsCrossed,
    titulo: "Gastronomia",
    descricao:
      "Refeições planejadas para manter a energia da aventura: café da manhã, almoço e jantar com opções especiais.",
  },
  {
    icon: Ticket,
    titulo: "Cultura e Entretenimento",
    descricao:
      "Ingressos com reserva antecipada para eventos, passeios culturais e programação de entretenimento. Sem filas, sem estresse.",
  },
  {
    icon: Compass,
    titulo: "Atrações e Atividades",
    descricao:
      "Acesso às principais atrações do destino e suas atividades: flutuação, cachoeiras, grutas, trilhas e muito mais.",
  },
];

export function OrganizacaoSection() {
  return (
    <section className="section-padding">
      <div className="container-tight">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Tudo incluso
          </span>
          <h2 className="mt-3 text-balance text-3xl md:text-4xl">
            A gente cuida da logística. Você curte a aventura.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Nossos pacotes são pensados para que você não precise se preocupar
            com nada.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {itens.map((item) => (
            <div
              key={item.titulo}
              className="rounded-2xl border border-border bg-background p-6 transition-all hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-secondary p-3">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-display text-xl">{item.titulo}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.descricao}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
