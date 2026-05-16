import React from "react";
import { motion } from "framer-motion";
import { Truck, ShieldCheck, CreditCard, Undo2 } from "lucide-react";
import { EASE, fadeUp, stagger } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";

const TrustBar = () => {
  const { t } = useI18n();

  const items = [
    { key: "shipping", Icon: Truck, ...t.trust.shipping },
    { key: "secure", Icon: ShieldCheck, ...t.trust.secure },
    { key: "installments", Icon: CreditCard, ...t.trust.installments },
    { key: "returns", Icon: Undo2, ...t.trust.returns },
  ];

  return (
    <section
      data-testid="trust-bar"
      className="w-[95%] mx-auto mt-8 md:mt-10"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger(0.08, 0.12)}
        className="bg-white rounded-3xl px-5 sm:px-7 md:px-10 py-6 md:py-7 shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-4 md:gap-x-6 md:divide-x md:divide-neutral-200">
          {items.map(({ key, Icon, title, sub }, i) => (
            <motion.div
              key={key}
              data-testid={`trust-item-${key}`}
              variants={fadeUp}
              transition={{ duration: 1.0, ease: EASE, delay: i * 0.08 }}
              className="flex items-center gap-3 md:gap-4 md:px-5 first:md:pl-0 last:md:pr-0"
            >
              <div
                className="shrink-0 w-11 h-11 md:w-12 md:h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: "#FFF1EF" }}
              >
                <Icon className="w-5 h-5 md:w-5.5 md:h-5.5" style={{ color: "#FF574D" }} />
              </div>
              <div className="min-w-0">
                <div
                  data-testid={`trust-title-${key}`}
                  className="text-sm md:text-[15px] font-semibold text-neutral-900 leading-tight tracking-tight"
                >
                  {title}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5 leading-snug truncate">
                  {sub}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default TrustBar;
