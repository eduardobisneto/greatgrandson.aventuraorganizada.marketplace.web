import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useRef } from "react";
import type { ComponentType, ReactNode, SVGProps } from "react";

/**
 * Carrossel horizontal full-bleed — scroll nativo (swipe/wheel/trackpad)
 * com snap, mais setas de navegação (mesmo comportamento do Hero). É
 * renderizado full-width de propósito: quem usa deve colocar esse
 * componente FORA do `container-tight`, direto como filho da `<section>`
 * — nunca dentro do container, e nunca com `w-screen`/`100vw`: 100vw
 * inclui a largura da barra de rolagem vertical do navegador, o que
 * criava overflow horizontal na página inteira (barra de rolagem
 * indevida no rodapé). Usando `100%` (da própria section, que já é
 * full-width) esse problema não existe.
 *
 * O wrapper usa `w-fit` (limitado a `max-w-full`), não `w-full`: com
 * poucos cards (que não preenchem a largura disponível), isso encolhe o
 * carrossel até o conteúdo de verdade, então as setas ficam coladas nas
 * extremidades dos cards visíveis, em vez de flutuarem longe deles num
 * espaço vazio. Com cards suficientes pra encher o espaço, o `max-w-full`
 * garante que ele ainda ocupa toda a largura disponível, mantendo o
 * scroll interno normalmente.
 *
 * `scroll-px-*` (espelhando o `px-*`) evita outro efeito colateral do
 * scroll-snap: sem isso, o navegador alinha o scroll inicial direto no
 * primeiro card, "comendo" o respiro do padding — invisível quando o card
 * é uma imagem que já vai até a borda, mas expõe a seta por cima do
 * conteúdo em cards com texto perto da borda (ex: lista de viagens).
 *
 * O gutter (`px-12 sm:px-16`) é um valor fixo, não escalando com a
 * largura da tela: existia uma versão anterior que alinhava com a borda
 * do `container-tight` (crescendo em telas largas), mas isso deixava um
 * vão enorme entre a seta e o primeiro card em monitores largos. O valor
 * fixo é só o suficiente pra seta não ficar em cima do card (ela mede
 * ~40px em telas pequenas, ~52px a partir do `sm`, incluindo o
 * `left-2`/`left-4`) — nada além disso.
 */
export function CarrosselHorizontal({ children }: { children: ReactNode }) {
  const trilhaRef = useRef<HTMLDivElement>(null);

  function rolar(direcao: 1 | -1) {
    const trilha = trilhaRef.current;
    if (!trilha) return;
    const primeiroCard = trilha.firstElementChild as HTMLElement | null;
    const distancia = primeiroCard
      ? primeiroCard.getBoundingClientRect().width + 16 // gap-4 = 16px
      : trilha.clientWidth * 0.9;
    trilha.scrollBy({ left: distancia * direcao, behavior: "smooth" });
  }

  return (
    <div className="relative mx-auto w-fit max-w-full">
      <div
        ref={trilhaRef}
        className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto px-12 pb-2 scroll-px-12 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-16 sm:scroll-px-16 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => rolar(-1)}
        aria-label="Ver anterior"
        className="absolute left-2 top-1/2 inline-flex -translate-y-1/2 rounded-full border border-border bg-background p-1.5 text-foreground shadow-md transition-colors hover:bg-secondary sm:left-4 sm:p-2"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => rolar(1)}
        aria-label="Ver próximo"
        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-full border border-border bg-background p-1.5 text-foreground shadow-md transition-colors hover:bg-secondary sm:right-4 sm:p-2"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}

/** Largura/formato/snap compartilhados por todo card usado dentro de um CarrosselHorizontal. */
export const cartaoCarrosselClassName =
  "group relative aspect-[4/3] w-72 shrink-0 snap-start overflow-hidden rounded-2xl sm:w-80 md:w-96";

/**
 * Conteúdo visual do card — imagem (ou fallback sólido com ícone) com
 * gradiente e título/descrição sobrepostos embaixo, no mesmo espírito do
 * Hero. Não inclui o wrapper (Link ou div) de propósito, pra quem chama
 * decidir se o card navega pra algum lugar ou não.
 */
export function ConteudoCartaoOverlay({
  titulo,
  /** Ex: nome do destino, quando o card representa algo dentro de um lugar (uma atração, por exemplo). */
  subtitulo,
  descricao,
  imagem,
  alt,
  icon: Icon,
}: {
  titulo: string;
  subtitulo?: string | undefined;
  descricao: string;
  imagem?: string | undefined;
  alt?: string | undefined;
  icon?: ComponentType<SVGProps<SVGSVGElement>> | undefined;
}) {
  return (
    <>
      {imagem ? (
        <img
          src={imagem}
          alt={alt ?? titulo}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-forest-800" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-forest-900/85 via-forest-900/30 to-transparent" />
      {Icon && !imagem && (
        <Icon className="absolute right-4 top-4 h-8 w-8 text-forest-500" />
      )}
      <div className="absolute bottom-0 left-0 right-0 p-5 text-sand-50">
        {subtitulo && (
          <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-forest-300">
            <MapPin className="h-3 w-3 shrink-0" />
            {subtitulo}
          </p>
        )}
        <h3 className="font-display text-xl">{titulo}</h3>
        <p className="mt-1 text-sm text-forest-100">{descricao}</p>
      </div>
    </>
  );
}
