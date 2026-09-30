import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { CSSProperties, ComponentType, ReactNode, SVGProps } from "react";

// useLayoutEffect mede e aplica o breakout antes do navegador pintar a
// tela (evita um "pulo" visível do carrossel estreito pro full-bleed);
// no SSR isso vira useEffect pra não disparar o aviso do React sobre
// useLayoutEffect não fazer nada no servidor.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Carrossel horizontal full-bleed — scroll nativo (swipe/wheel/trackpad)
 * com snap, mais setas de navegação (mesmo comportamento do Hero).
 *
 * Full-bleed de verdade, mesmo aninhado: o componente mede a distância
 * real até a borda esquerda da viewport (`getBoundingClientRect().left`)
 * e cancela com margin negativa, esticando a largura pra
 * `document.documentElement.clientWidth`. Isso faz as setas caírem nas
 * extremidades da tela não importa quantos `container-tight`/`max-w-*`
 * estreitos estejam por cima na árvore — quem usa não precisa mais
 * lembrar de renderizar isso fora de um container estreito (esse cuidado
 * já causou o mesmo bug reaparecer em telas diferentes n vezes). Nunca
 * usa `w-screen`/`100vw` pra isso: 100vw inclui a largura da barra de
 * rolagem vertical do navegador, o que criava overflow horizontal na
 * página inteira (barra de rolagem indevida no rodapé) — `clientWidth`
 * já exclui a barra, e `rect.left` já é relativo à viewport de verdade,
 * então o cálculo funciona mesmo dentro de containers assimétricos.
 *
 * O wrapper nunca encolhe pra virar uma ilha centralizada no meio da
 * tela, mesmo com um único card. (Uma versão anterior usava `w-fit` pra
 * "colar" as setas nos cards quando havia poucos — mas isso fazia o
 * carrossel inteiro encolher e centralizar no meio da section em vez de
 * ocupar a extensão da tela, o problema oposto. A combinação certa é
 * largura cheia + gutter pequeno e fixo, não encolher o container.)
 *
 * `scroll-px-*` (espelhando o `px-*`) evita um efeito colateral do
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
 *
 * `justify-center-safe` (`justify-content: safe center`) centraliza os
 * cards quando eles não preenchem a largura toda (poucos cards, trilho
 * full-bleed) — sem isso ficavam encostados à esquerda, com um vão vazio
 * grande à direita. O "safe" é o que faz isso funcionar também quando os
 * cards SÃO muitos (overflow): nesse caso o navegador ignora o
 * centralizar e volta pro alinhamento normal à esquerda, senão o
 * primeiro card ficaria cortado ao abrir a página (overflow simétrico
 * de um flex centralizado tira conteúdo dos dois lados, não só da
 * direita).
 */
export function CarrosselHorizontal({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trilhaRef = useRef<HTMLDivElement>(null);
  const [podeVoltar, setPodeVoltar] = useState(false);
  const [podeAvancar, setPodeAvancar] = useState(false);
  const [breakoutStyle, setBreakoutStyle] = useState<CSSProperties>({});

  useIsomorphicLayoutEffect(() => {
    // Mede a partir do PAI, não do próprio wrapper: depois que a margin
    // negativa é aplicada, o wrapper passa a começar em x=0 (efeito
    // esperado). Medir o próprio wrapper de novo nessas remedições
    // seguintes leria essa posição já corrigida e zeraria a margin de
    // volta — um loop que se autocancela. O pai nunca é estilizado por
    // esse componente, então sua posição continua confiável sempre.
    function atualizarBreakout() {
      const pai = wrapperRef.current?.parentElement;
      if (!pai) return;
      const rect = pai.getBoundingClientRect();
      setBreakoutStyle({
        marginLeft: -rect.left,
        width: document.documentElement.clientWidth,
      });
    }

    atualizarBreakout();
    window.addEventListener("resize", atualizarBreakout);
    const observer = new ResizeObserver(atualizarBreakout);
    if (wrapperRef.current?.parentElement) {
      observer.observe(wrapperRef.current.parentElement);
    }
    return () => {
      window.removeEventListener("resize", atualizarBreakout);
      observer.disconnect();
    };
  }, []);

  // Sem conteúdo suficiente pra rolar (poucos cards, ou já na ponta), a
  // seta correspondente fica desabilitada em vez de não fazer nada —
  // sinaliza que não tem mais pra onde ir, em vez de parecer quebrada.
  useEffect(() => {
    const trilha = trilhaRef.current;
    if (!trilha) return;

    function atualizarEstado() {
      const el = trilhaRef.current;
      if (!el) return;
      setPodeVoltar(el.scrollLeft > 4);
      setPodeAvancar(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }

    atualizarEstado();
    trilha.addEventListener("scroll", atualizarEstado, { passive: true });
    const observer = new ResizeObserver(atualizarEstado);
    observer.observe(trilha);
    return () => {
      trilha.removeEventListener("scroll", atualizarEstado);
      observer.disconnect();
    };
  }, []);

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
    <div ref={wrapperRef} className="relative w-full" style={breakoutStyle}>
      <div
        ref={trilhaRef}
        className="flex w-full snap-x snap-mandatory justify-center-safe gap-4 overflow-x-auto px-12 pb-2 scroll-px-12 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-16 sm:scroll-px-16 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>

      <button
        type="button"
        onClick={() => rolar(-1)}
        disabled={!podeVoltar}
        aria-label="Ver anterior"
        className="absolute left-2 top-1/2 inline-flex -translate-y-1/2 rounded-full border border-border bg-background p-1.5 text-foreground shadow-md transition-colors hover:bg-secondary disabled:cursor-default disabled:opacity-40 disabled:hover:bg-background sm:left-4 sm:p-2"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        onClick={() => rolar(1)}
        disabled={!podeAvancar}
        aria-label="Ver próximo"
        className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 rounded-full border border-border bg-background p-1.5 text-foreground shadow-md transition-colors hover:bg-secondary disabled:cursor-default disabled:opacity-40 disabled:hover:bg-background sm:right-4 sm:p-2"
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
