import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, BadgeCheck, Quote } from "lucide-react";
import { EASE, fadeUp, stagger } from "@/lib/animations";
import { useI18n } from "@/lib/i18n";
import { fetchReviews } from "@/lib/api";

const Stars = ({ rating = 5, size = "w-3.5 h-3.5" }) => {
  const r = Math.round(rating);
  return (
    <div className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={size}
          style={{
            color: i <= r ? "#FFB22C" : "#E5E7EB",
            fill: i <= r ? "#FFB22C" : "#E5E7EB",
          }}
        />
      ))}
    </div>
  );
};

const initialOf = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatDate = (iso, lang) => {
  try {
    const d = new Date(iso);
    const locale = lang === "pt" ? "pt-BR" : "en-US";
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
};

const AVATAR_BGS = ["#FFE8E5", "#FFF1D6", "#E5F4FF", "#EAFBE7", "#F3E8FF", "#FFE5F2"];
const AVATAR_FGS = ["#FF574D", "#C26A00", "#1E6FB8", "#1F8A3F", "#7A3FBF", "#C2348A"];

const ReviewCard = ({ review, index = 0 }) => {
  const { t, lang } = useI18n();
  const bg = AVATAR_BGS[index % AVATAR_BGS.length];
  const fg = AVATAR_FGS[index % AVATAR_FGS.length];

  return (
    <motion.article
      data-testid={`review-card-${review.id}`}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 1.1, ease: EASE, delay: (index % 3) * 0.15 }}
      className="bg-white rounded-3xl p-6 md:p-7 flex flex-col gap-4 hover:shadow-[0_20px_60px_rgba(0,0,0,0.06)] transition-shadow relative"
    >
      <Quote className="absolute top-5 right-5 w-7 h-7 text-neutral-100" />

      <div className="flex items-center justify-between">
        <Stars rating={review.rating} size="w-4 h-4" />
        <span className="text-xs text-neutral-400 tabular-nums">
          {formatDate(review.created_at, lang)}
        </span>
      </div>

      <div>
        <h3 className="font-display text-lg md:text-xl font-semibold text-neutral-900 tracking-tight leading-snug">
          {review.headline}
        </h3>
        <p className="mt-2 text-sm text-neutral-600 leading-relaxed line-clamp-4">
          {review.body}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-3 pt-3 border-t border-neutral-100">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm shrink-0"
          style={{ backgroundColor: bg, color: fg }}
        >
          {initialOf(review.customer_name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-neutral-900 truncate">
              {review.customer_name}
            </span>
            {review.verified && (
              <span
                data-testid="review-verified-badge"
                className="inline-flex items-center gap-1 text-[10px] font-semibold rounded-full px-1.5 py-0.5"
                style={{ backgroundColor: "#E8F8EE", color: "#1F8A3F" }}
              >
                <BadgeCheck className="w-3 h-3" />
                {t.reviews.verified}
              </span>
            )}
          </div>
          <p className="text-xs text-neutral-500 truncate mt-0.5">
            {t.reviews.boughtPrefix}{" "}
            <span className="text-neutral-700">{review.product_title}</span>
          </p>
        </div>
      </div>
    </motion.article>
  );
};

const Reviews = () => {
  const { t, lang } = useI18n();
  const [data, setData] = useState({ reviews: [], total: 0, average_rating: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchReviews(lang, 8)
      .then((res) => {
        if (alive) setData(res);
      })
      .catch(() => {
        /* swallow */
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [lang]);

  if (!loading && (!data.reviews || data.reviews.length === 0)) return null;

  return (
    <section
      data-testid="reviews-section"
      className="w-[95%] mx-auto mt-24 md:mt-32"
    >
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger(0.1, 0.18)}
        className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-8 md:mb-12"
      >
        <div>
          <motion.div
            variants={fadeUp}
            className="text-xs tracking-[0.25em] uppercase font-semibold text-neutral-500 mb-3"
          >
            {t.reviews.kicker}
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-display text-4xl md:text-5xl tracking-tight leading-tight font-semibold text-neutral-900"
            data-testid="reviews-title"
          >
            {t.reviews.title}
          </motion.h2>
        </div>

        {!loading && data.total > 0 && (
          <motion.div
            variants={fadeUp}
            data-testid="reviews-summary"
            className="flex items-center gap-4 rounded-3xl bg-white px-5 py-4 shadow-[0_10px_40px_rgba(0,0,0,0.05)]"
          >
            <div className="text-center">
              <div
                data-testid="reviews-average"
                className="font-display text-3xl md:text-4xl font-bold tracking-tight tabular-nums"
                style={{ color: "#FFB22C" }}
              >
                {Number(data.average_rating).toFixed(1)}
              </div>
              <div className="text-[10px] tracking-[0.2em] uppercase font-semibold text-neutral-500 mt-0.5">
                {t.reviews.avgPrefix}
              </div>
            </div>
            <div className="h-12 w-px bg-neutral-200" />
            <div>
              <Stars rating={data.average_rating} size="w-4 h-4" />
              <p
                data-testid="reviews-count"
                className="text-xs text-neutral-500 mt-1"
              >
                {t.reviews.basedOn(data.total)}
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 h-60">
              <div className="h-3 w-24 bg-neutral-100 rounded animate-pulse" />
              <div className="h-5 mt-4 bg-neutral-100 rounded animate-pulse" />
              <div className="h-3 mt-2 bg-neutral-100 rounded animate-pulse" />
              <div className="h-3 mt-2 bg-neutral-100 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div
          data-testid="reviews-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          {data.reviews.slice(0, 6).map((r, i) => (
            <ReviewCard key={r.id} review={r} index={i} />
          ))}
        </div>
      )}
    </section>
  );
};

export default Reviews;
