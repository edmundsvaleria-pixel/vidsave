// src/components/PlatformIcons.tsx
type P = { size?: number; className?: string };

const TikTok = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);
const Instagram = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);
const YouTube = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="m10 9 5 3-5 3V9z" fill="currentColor" stroke="none" />
  </svg>
);
const Facebook = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
const X = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
const Audiomack = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <path d="M12 2v20M17 5v14M7 5v14M22 10v4M2 10v4" />
  </svg>
);
const Spotify = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <circle cx="12" cy="12" r="10" />
    <path d="M8 11.5a9 9 0 0 1 8 0M9 15a7 7 0 0 1 6 0M7 8a11 11 0 0 1 10 0" />
  </svg>
);

const platforms = [
  { name: "TikTok", Icon: TikTok },
  { name: "Instagram", Icon: Instagram },
  { name: "YouTube", Icon: YouTube },
  { name: "Facebook", Icon: Facebook },
  { name: "X", Icon: X },
  { name: "Audiomack", Icon: Audiomack },
  { name: "Spotify", Icon: Spotify },
];

export default function PlatformIcons() {
  return (
    <>
      {platforms.map(({ name, Icon }) => (
        <div
          key={name}
          className="group flex flex-col items-start gap-3 rounded-xl border border-[#27272A] bg-[#0A0A0A] p-4 transition-colors hover:border-[#3B82F6]/50"
        >
          <Icon size={18} className="text-[#3B82F6]" />
          <span className="text-[11px] font-medium tracking-[0.1em] text-[#A1A1AA] group-hover:text-white">
            {name}
          </span>
        </div>
      ))}
    </>
  );
}