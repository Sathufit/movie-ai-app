import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#111111',
          borderRadius: '40px',
        }}
      >
        {/* Red card */}
        <div
          style={{
            width: '120px',
            height: '120px',
            background: '#e50914',
            borderRadius: '26px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Play button */}
          <div
            style={{
              width: 0,
              height: 0,
              borderTop: '28px solid transparent',
              borderBottom: '28px solid transparent',
              borderLeft: '46px solid white',
              marginLeft: '8px',
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
