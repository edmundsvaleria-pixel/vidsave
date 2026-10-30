// src/config/affiliates.ts
export type AffiliateProduct = {
  name: string;
  description: string;
  url: string;
  cta: string;
};

export const AFFILIATE_PRODUCTS: AffiliateProduct[] = [
  {
    name: "CapCut",
    description: "Edit your downloaded videos like a pro.",
    url: process.env.NEXT_PUBLIC_AFFILIATE_CAPCUT || "https://www.capcut.com/",
    cta: "Try CapCut Free",
  },
  {
    name: "Descript",
    description: "Edit audio and video by editing text.",
    url: process.env.NEXT_PUBLIC_AFFILIATE_DESCRIPT || "https://www.descript.com/",
    cta: "Try Descript",
  },
  {
    name: "NordVPN",
    description: "Access region-locked content safely.",
    url: process.env.NEXT_PUBLIC_AFFILIATE_NORDVPN || "https://nordvpn.com/",
    cta: "Get NordVPN",
  },
];