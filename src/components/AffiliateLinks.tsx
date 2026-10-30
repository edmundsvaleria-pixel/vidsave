// src/components/AffiliateLinks.tsx
import { AFFILIATE_PRODUCTS } from "@/config/affiliates";

export default function AffiliateLinks() {
  return (
    <div className="mt-8 border border-[#d4af37]/20 bg-[#d4af37]/[0.03] p-5 text-left">
      <p className="mb-3 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#f5f3ef]/40">
        Recommended Tools
      </p>
      <div className="flex flex-col gap-2">
        {AFFILIATE_PRODUCTS.map((product) => (
          <a
            key={product.name}
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between border border-transparent px-3 py-2 transition-colors hover:border-[#d4af37]/30 hover:bg-[#d4af37]/5"
          >
            <div>
              <p className="text-[12px] font-medium text-[#f5f3ef]/80 group-hover:text-[#f5f3ef]">
                {product.name}
              </p>
              <p className="text-[10px] text-[#f5f3ef]/40">
                {product.description}
              </p>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#d4af37]/60 group-hover:text-[#d4af37]">
              {product.cta} →
            </span>
          </a>
        ))}
      </div>
      <p className="mt-3 text-[9px] leading-relaxed text-[#f5f3ef]/30">
        We may earn a commission when you purchase through these links. This
        supports VidSave and helps keep it free.
      </p>
    </div>
  );
}