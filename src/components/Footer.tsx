import { Link } from "@tanstack/react-router";
import { Mountain, Instagram, Phone, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-forest-900 text-forest-100 print:hidden">
      <div className="container-tight py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-3">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2 text-sand-50">
              <Mountain className="h-6 w-6 text-forest-300" />
              <span className="font-display text-xl tracking-tight">
                Aventura Organizada
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-forest-300">
              Viagens de turismo de aventura em Bonito, Socorro, Brotas e
              Ubatuba. Cuidamos de toda a logística para você aproveitar cada
              momento.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-lg text-sand-50">Navegação</h3>
            <ul className="space-y-2 text-sm text-forest-300">
              <li>
                <Link to="/" className="transition-colors hover:text-sand-50">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/destinos"
                  className="transition-colors hover:text-sand-50"
                >
                  Destinos
                </Link>
              </li>
              <li>
                <Link
                  to="/experiencias"
                  className="transition-colors hover:text-sand-50"
                >
                  Experiências
                </Link>
              </li>
              <li>
                <Link
                  to="/sobre"
                  className="transition-colors hover:text-sand-50"
                >
                  Sobre nós
                </Link>
              </li>
              <li>
                <Link
                  to="/contato"
                  className="transition-colors hover:text-sand-50"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-display text-lg text-sand-50">Fale conosco</h3>
            <ul className="space-y-3 text-sm text-forest-300">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-forest-300" />
                <a
                  href="https://wa.me/5511963220494"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-sand-50"
                >
                  (11) 96322-0494
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-forest-300" />
                <span>contato@aventuraorganizada.com.br</span>
              </li>
              <li className="flex items-center gap-3">
                <Instagram className="h-4 w-4 text-forest-300" />
                <a
                  href="https://www.instagram.com/aventuraorganizada/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-sand-50"
                >
                  @aventuraorganizada
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 border-t border-forest-800 pt-8 text-center text-xs text-forest-400 sm:flex-row sm:justify-between">
          <p>
            © {new Date().getFullYear()} Aventura Organizada. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-4">
            <Link to="/termos" className="transition-colors hover:text-sand-50">
              Termos de Uso
            </Link>
            <Link
              to="/privacidade"
              className="transition-colors hover:text-sand-50"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
