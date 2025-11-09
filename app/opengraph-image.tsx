import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'MovieAI - AI-Powered Movie Discovery'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #18181b 0%, #0a0a0a 100%)',
          position: 'relative',
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(220, 38, 38, 0.3) 100%)',
          }}
        />
        
        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            padding: '80px',
          }}
        >
          {/* Icon */}
          <div
            style={{
              fontSize: 120,
              marginBottom: 40,
            }}
          >
            🎬
          </div>
          
          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #c084fc 0%, #f87171 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            MovieAI
          </div>
          
          {/* Subtitle */}
          <div
            style={{
              fontSize: 36,
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            AI-Powered Movie Discovery
          </div>
          
          {/* Features */}
          <div
            style={{
              display: 'flex',
              gap: 32,
              marginTop: 48,
              fontSize: 24,
              color: '#71717a',
            }}
          >
            <span>🤖 AI Search</span>
            <span>✨ Smart Recommendations</span>
            <span>🎥 500,000+ Movies</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
