import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Sparkles, Copy, Check, Loader2 } from "lucide-react";
import { EASE, fadeUp, stagger } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";
import { subscribeNewsletter } from "@/lib/api";

const HERO_IMG =
  "https://images.unsplash.com/photo-1758525223709-2dc38e53f55d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2Mzl8MHwxfHNlYXJjaHwzfHx5b3V0aGZ1bCUyMGxpZmVzdHlsZSUyMHNob3BwaW5nJTIwcGFzdGVsfGVufDB8fHx8MTc3ODkwNTk2Mnww&ixlib=rb-4.1.0&q=85";

const Newsletter = () => {
  const { t, lang } = useI18n();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null); // { coupon_code, already_subscribed }
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const value = email.trim();
    if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError(t.newsletter.errorInvalid);
      return;
    }
    setLoading(true);
    try {
      const data = await subscribeNewsletter(value, lang);
      setSuccess({
        coupon: data.coupon_code,
        already: data.already_subscribed,
      });
    } catch (err) {
      const status = err?.response?.status;
      if (status === 400) {
        setError(t.newsletter.errorInvalid);
      } else {
        setError(t.newsletter.errorGeneric);
      }
    } finally {
      setLoading(false);
    }
  };

  const onCopy = async () => {
    if (!success?.coupon) return;
    try {
      await navigator.clipboard.writeText(success.coupon);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      id="newsletter"
      data-testid="newsletter-section"
      className="w-[95%] mx-auto mt-24 md:mt-32"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger(0.1, 0.18)}
        className="relative overflow-hidden rounded-3xl"
      >
        {/* Background image with very soft Ken-Burns */}
        <motion.img
          src={HERO_IMG}
          alt=""
          aria-hidden
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0 }}
          whileInView={{ scale: 1.0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2.4, ease: EASE }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,87,77,0.92) 0%, rgba(255,124,90,0.85) 50%, rgba(255,87,77,0.78) 100%)",
          }}
        />
        {/* Soft noise overlay */}
        <div
          className="absolute inset-0 opacity-[0.08] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "3px 3px",
          }}
        />

        <div className="relative grid md:grid-cols-2 gap-10 items-center px-7 sm:px-12 md:px-16 py-14 md:py-20">
          <motion.div variants={fadeUp}>
            <span className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase font-semibold text-white/85 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-3 py-1 mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              {t.newsletter.kicker}
            </span>
            <h2
              data-testid="newsletter-title"
              className="font-display text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.05] font-semibold text-white"
            >
              {t.newsletter.title}
            </h2>
            <p className="mt-5 text-base md:text-lg text-white/85 max-w-md">
              {t.newsletter.subtitle}
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <AnimatePresence mode="wait">
              {success ? (
                <motion.div
                  key="success"
                  data-testid="newsletter-success"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 1.0, ease: EASE }}
                  className="bg-white rounded-3xl p-7 md:p-9 shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#FFF1EF" }}
                    >
                      <Check className="w-5 h-5" style={{ color: "#FF574D" }} />
                    </div>
                    <h3 className="font-display text-2xl font-semibold tracking-tight text-neutral-900">
                      {success.already
                        ? t.newsletter.alreadyTitle
                        : t.newsletter.successTitle}
                    </h3>
                  </div>
                  <p className="text-sm text-neutral-600">
                    {success.already
                      ? t.newsletter.alreadyBody
                      : t.newsletter.successBody}
                  </p>
                  <div
                    className="mt-4 flex items-center justify-between gap-3 rounded-2xl p-3 pl-5"
                    style={{ backgroundColor: "#FFF7F6", border: "1px dashed #FFB3AD" }}
                  >
                    <code
                      data-testid="newsletter-coupon-code"
                      className="font-mono text-lg md:text-xl font-bold tracking-wider"
                      style={{ color: "#FF574D" }}
                    >
                      {success.coupon}
                    </code>
                    <button
                      data-testid="newsletter-copy-coupon"
                      onClick={onCopy}
                      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold text-white transition-colors"
                      style={{ backgroundColor: copied ? "#0A0A0A" : "#FF574D" }}
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          {t.newsletter.copied}
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          {t.newsletter.copy}
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  data-testid="newsletter-form"
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 1.0, ease: EASE }}
                  className="bg-white rounded-3xl p-7 md:p-9 shadow-[0_30px_80px_rgba(0,0,0,0.18)]"
                >
                  <label
                    htmlFor="newsletter-email"
                    className="text-xs tracking-[0.2em] uppercase font-semibold text-neutral-500"
                  >
                    Email
                  </label>
                  <div className="mt-2 relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    <input
                      id="newsletter-email"
                      data-testid="newsletter-email-input"
                      type="email"
                      autoComplete="email"
                      placeholder={t.newsletter.placeholder}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-12 pl-11 pr-4 rounded-full bg-neutral-100 text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 transition-all"
                      style={{ "--tw-ring-color": "#FF574D" }}
                      disabled={loading}
                    />
                  </div>
                  {error && (
                    <p
                      data-testid="newsletter-error"
                      className="mt-2 text-xs text-red-600"
                    >
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    data-testid="newsletter-submit"
                    disabled={loading}
                    className="mt-4 inline-flex items-center justify-center gap-2 w-full h-12 rounded-full text-sm font-semibold text-white transition-all hover:translate-y-[-1px] disabled:opacity-60 disabled:translate-y-0"
                    style={{ backgroundColor: "#FF574D" }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {t.newsletter.sending}
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        {t.newsletter.cta}
                      </>
                    )}
                  </button>
                  <p className="mt-4 text-[11px] text-neutral-500 leading-relaxed">
                    {t.newsletter.privacy}
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default Newsletter;
