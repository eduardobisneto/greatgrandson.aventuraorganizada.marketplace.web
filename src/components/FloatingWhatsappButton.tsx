import { MessageCircle } from "lucide-react";

/**
 * Botão flutuante de WhatsApp, fixo no canto inferior direito, presente em
 * todas as telas (ver __root.tsx) — mesmo padrão dos concorrentes. Reusa o
 * mesmo número/mensagem do WhatsappButton por enquanto; o conteúdo/ação
 * definitivos do botão ainda não foram definidos.
 */
export function FloatingWhatsappButton() {
  const numero = "5511963220494";
  const mensagem = encodeURIComponent(
    "Olá! Quero saber mais sobre os pacotes de turismo de aventura para Bonito, Socorro, Brotas e Ubatuba.",
  );

  return (
    <a
      href={`https://wa.me/${numero}?text=${mensagem}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105 hover:bg-[#128C7E] sm:bottom-6 sm:right-6 sm:h-16 sm:w-16"
    >
      <MessageCircle className="h-7 w-7 sm:h-8 sm:w-8" />
    </a>
  );
}
