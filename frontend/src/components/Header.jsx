import React from "react";
import { ShoppingBag, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useI18n } from "@/lib/i18n";

// Importe a logo — ajuste o caminho conforme sua estrutura de pastas:
// Ex: import visionLogo from "@/assets/vision-logo-site-2.png";
// ou coloque em /public e use src="/vision-logo-site-2.png"
import visionLogo from "@/assets/vision-logo-site-transparente.png";

const Header = ({ onJumpCategories, onJumpProducts, onJumpTop }) => {
  const { totalQuantity, setOpen } = useCart();
  const { t, lang, setLang } = useI18n();

  return (
    <header
      data-testid="site-header"
      className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/70 border-b border-black/5"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-10 h-32 flex items-center justify-between">

        {/* ── Logo ── */}
        <button
          data-testid="brand-logo"
          onClick={onJumpTop}
          className="flex items-center group focus:outline-none"
          aria-label="Vision Loja Virtual — ir ao topo"
        >
          <img
            src={visionLogo}
            alt="Vision Loja Virtual"
            /*
             * A logo tem fundo branco puro, então ela se integra naturalmente
             * ao header translúcido (bg-white/70).
             * h-10 = 40 px → caberá confortavelmente dentro do header de 64 px.
             * w-auto mantém a proporção original.
             * group-hover: leve escala para dar feedback de clique.
             */
            className="h-20 md:h-32 w-auto object-contain transition-transform duration-200 group-hover:scale-[1.03]"
            style={{ mixBlendMode: "multiply" }} 
            draggable={false}
          />
        </button>

        {/* ── Navegação ── */}
        <nav className="hidden md:flex items-center gap-8 text-sm text-neutral-700">
          <button
            data-testid="nav-home"
            onClick={onJumpTop}
            className="hover:text-neutral-900 transition-colors"
          >
            {t.nav.home}
          </button>
          <button
            data-testid="nav-categories"
            onClick={onJumpCategories}
            className="hover:text-neutral-900 transition-colors"
          >
            {t.nav.categories}
          </button>
          <button
            data-testid="nav-products"
            onClick={onJumpProducts}
            className="hover:text-neutral-900 transition-colors"
          >
            {t.nav.products}
          </button>
        </nav>

        {/* ── Ações direita ── */}
        <div className="flex items-center gap-2">
          <button
            data-testid="lang-toggle"
            onClick={() => setLang(lang === "pt" ? "en" : "pt")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs uppercase tracking-wider font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
            aria-label="Toggle language"
          >
            <Languages className="w-3.5 h-3.5" />
            {lang === "pt" ? "PT / EN" : "EN / PT"}
          </button>

          <Button
            data-testid="open-cart-button"
            onClick={() => setOpen(true)}
            variant="ghost"
            size="sm"
            className="relative rounded-full hover:bg-neutral-100"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalQuantity > 0 && (
              <span
                data-testid="cart-badge"
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ backgroundColor: "#FF574D" }}
              >
                {totalQuantity}
              </span>
            )}
            <span className="sr-only">{t.nav.cart}</span>
          </Button>
        </div>

      </div>
    </header>
  );
};

export default Header;
