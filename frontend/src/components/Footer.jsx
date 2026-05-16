import React from "react";
import { Instagram, Twitter, Youtube, Mail } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { useI18n } from "@/lib/i18n";

const Footer = ({ dataSource }) => {
  const { t, lang } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer
      data-testid="site-footer"
      className="mt-32 md:mt-40 w-[95%] mx-auto rounded-3xl bg-neutral-900 text-neutral-100 px-8 md:px-14 py-14 md:py-20"
    >
      <Reveal>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span
                className="w-9 h-9 rounded-2xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: "#FF574D" }}
              >
                V
              </span>
              <span className="font-display text-2xl font-semibold">
                vision<span style={{ color: "#FF574D" }}>.</span>
              </span>
            </div>
            <p className="font-display text-3xl md:text-5xl leading-tight tracking-tight max-w-2xl">
              {t.footer.tag}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm">
            {dataSource === "shopify" ? (
              <span
                data-testid="footer-source-shopify"
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-emerald-500/15 text-emerald-300 border border-emerald-400/30"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                {t.badges.live}
              </span>
            ) : (
              <span
                data-testid="footer-source-demo"
                className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-white/10 text-neutral-200 border border-white/20"
              >
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                {t.badges.demo}
              </span>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-14">
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-4">
              {t.footer.sections.shop}
            </div>
            <ul className="space-y-2 text-sm text-neutral-200">
              <li>Tech</li>
              <li>Moda</li>
              <li>Decoração</li>
              <li>Ferramentas</li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-4">
              {t.footer.sections.help}
            </div>
            <ul className="space-y-2 text-sm text-neutral-200">
              <li>FAQ</li>
              <li>{lang === "pt" ? "Trocas e devoluções" : "Returns"}</li>
              <li>{lang === "pt" ? "Rastreio" : "Tracking"}</li>
              <li>{lang === "pt" ? "Contato" : "Contact"}</li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-4">
              {t.footer.sections.company}
            </div>
            <ul className="space-y-2 text-sm text-neutral-200">
              <li>{lang === "pt" ? "Sobre" : "About"}</li>
              <li>Press</li>
              <li>{lang === "pt" ? "Privacidade" : "Privacy"}</li>
              <li>{lang === "pt" ? "Termos" : "Terms"}</li>
            </ul>
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.25em] text-neutral-400 mb-4">
              Social
            </div>
            <div className="flex items-center gap-3 text-neutral-300">
              <a aria-label="Instagram" className="hover:text-white transition-colors" href="#">
                <Instagram className="w-5 h-5" />
              </a>
              <a aria-label="Twitter" className="hover:text-white transition-colors" href="#">
                <Twitter className="w-5 h-5" />
              </a>
              <a aria-label="Youtube" className="hover:text-white transition-colors" href="#">
                <Youtube className="w-5 h-5" />
              </a>
              <a aria-label="Email" className="hover:text-white transition-colors" href="#">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.25}>
        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-neutral-400">
          <span data-testid="footer-copyright">
            © {year} vision. {t.footer.rights}
          </span>
          <span>Made with care · Shopify ready</span>
        </div>
      </Reveal>
    </footer>
  );
};

export default Footer;
