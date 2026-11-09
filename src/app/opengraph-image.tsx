// src/app/opengraph-image.tsx
import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'SwiftSave — Premium Video Downloader';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#0A0A0C',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#3B82F6', marginRight: '16px' }} />
          <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFFFFF' }}>
            SwiftSave
          </span>
        </div>

        {/* Main Headline */}
        <div
          style={{
            fontSize: '84px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            lineHeight: 1.1,
            letterSpacing: '-2px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <span>Download videos</span>
          <span style={{ color: '#3B82F6' }}>from anywhere.</span>
        </div>

        {/* Subheadline */}
        <div
          style={{
            fontSize: '28px',
            color: '#A1A1AA',
            marginTop: '40px',
            maxWidth: '700px',
            lineHeight: 1.4,
          }}
        >
          Save public videos from TikTok, Instagram, YouTube, and X in original quality.
        </div>

        {/* Footer URL */}
        <div
          style={{
            position: 'absolute',
            bottom: '80px',
            left: '80px',
            fontSize: '24px',
            color: '#A1A1AA',
            fontWeight: '500',
          }}
        >
          swiftsave.online
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}