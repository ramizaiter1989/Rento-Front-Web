import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const WATCH_PAGE_URL = 'https://rento-lb.com/watch';
const VIDEO_URL = 'https://rento-lb.com/hero.mp4';
const THUMBNAIL_URL = 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1280&q=80';

const videoSchema = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  '@id': `${WATCH_PAGE_URL}#video`,
  name: 'Rento LB – Rent a Car in Lebanon',
  description: 'Premium car rental in Lebanon. Compare and book from agencies and private owners.',
  thumbnailUrl: THUMBNAIL_URL,
  uploadDate: '2024-01-01T00:00:00Z',
  contentUrl: VIDEO_URL,
  embedUrl: WATCH_PAGE_URL,
  publisher: {
    '@id': 'https://rento-lb.com/#organization',
  },
};

export function WatchPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }}
      />
      <div className="absolute top-4 left-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate('/')}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="sr-only">Rento LB – Rent a Car in Lebanon</h1>
        <video
          className="w-full max-w-4xl rounded-lg shadow-2xl"
          controls
          autoPlay
          playsInline
          poster={THUMBNAIL_URL}
          src="/hero.mp4"
        >
          <source src="/hero.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <p className="mt-4 text-white/80 text-sm text-center max-w-lg">
          Premium car rental in Lebanon. Compare and book from trusted agencies and private owners.
        </p>
      </div>
    </div>
  );
}
