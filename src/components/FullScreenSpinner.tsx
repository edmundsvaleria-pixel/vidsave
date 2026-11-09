// src/components/FullScreenSpinner.tsx
export default function FullScreenSpinner() {
  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 backdrop-blur-md">
      <svg 
        width="40" 
        height="40" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="#3B82F6" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        className="animate-spin mb-4"
      >
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
      </svg>
      <p className="text-white font-medium text-sm animate-pulse">Processing...</p>
    </div>
  );
}