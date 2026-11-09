import type { ReactNode } from "react";

import type { Destino } from "@/data/destinos";

/**
 * Escolhe uma foto de destino pra ilustrar o banner de topo de páginas
 * institucionais (Experiências, Sobre, Contato) que não têm imagem
 * própria. Não usa Math.random() direto no render: o app é renderizado
 * no servidor e depois hidratado no cliente, e cada um sortearia um
 * valor diferente, causando mismatch de hidratação (o React reclama, e
 * a imagem "pisca" trocando logo após carregar). Em vez disso, a escolha
 * é determinística a partir de um `seed` (ex: o nome da página) — dá uma
 * imagem diferente por página, estável entre servidor e cliente.
 */
function imagemPorSeed(
  seed: string,
  destinos: Destino[],
): { imagem: string; alt: string } | null {
  if (destinos.length === 0) return null;
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) % 100000;
  const destino = destinos[hash % destinos.length]!;
  return { imagem: destino.imagem, alt: destino.alt };
}

/**
 * Banner full-bleed de topo, mesmo padrão visual das páginas de destino e
 * de experiência: imagem com gradiente, conteúdo colado embaixo. `-mt-16`
 * cancela o padding-top compensatório do header fixed (ver __root.tsx),
 * então fica atrás do header transparente — ver ehRotaComHeroNoTopo em
 * Header.tsx, que precisa saber quais rotas usam este componente.
 */
export function PageHeroBanner({
  seed,
  destinos,
  eyebrow,
  titulo,
  descricao,
  children,
}: {
  seed: string;
  /** Pra escolher a foto de fundo (ver imagemPorSeed) — a rota que usa este componente carrega via getDestinos() no loader. */
  destinos: Destino[];
  eyebrow: string;
  titulo: string;
  descricao?: string;
  children?: ReactNode;
}) {
  const fundo = imagemPorSeed(seed, destinos);

  return (
    <section className="relative -mt-16 overflow-hidden">
      <div className="absolute inset-0">
        {fundo ? (
          <img
            src={fundo.imagem}
            alt={fundo.alt}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-forest-800" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 via-forest-900/60 to-forest-900/30" />
      </div>

      <div className="container-tight relative flex min-h-[35vh] flex-col justify-end gap-4 py-16 text-sand-50">
        <span className="text-sm font-semibold uppercase tracking-wider text-forest-300">
          {eyebrow}
        </span>
        <h1 className="text-balance text-3xl md:text-4xl">{titulo}</h1>
        {descricao && (
          <p className="max-w-xl text-lg text-forest-100">{descricao}</p>
        )}
        {children}
      </div>
    </section>
  );
}
