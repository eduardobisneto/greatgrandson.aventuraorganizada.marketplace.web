import type { ComponentType, ReactNode, SVGProps } from "react";

/**
 * Carrossel horizontal full-bleed — quebra o container-tight e ocupa
 * toda a largura da viewport, com scroll nativo (swipe/wheel/trackpad) e
 * snap. Sem JS de carrossel: os cards têm largura fluida por breakpoint,
 * o navegador cuida do resto — responsivo por natureza, sem lógica de
 * paginação pra manter.
 */
export function CarrosselHorizontal({ children }: { children: ReactNode }) {
  return (
    <div className="relative left-1/2 right-1/2 w-screen -mx-[50vw]">
      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] lg:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
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
  descricao,
  imagem,
  alt,
  icon: Icon,
}: {
  titulo: string;
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
        <h3 className="font-display text-xl">{titulo}</h3>
        <p className="mt-1 text-sm text-forest-100">{descricao}</p>
      </div>
    </>
  );
}
