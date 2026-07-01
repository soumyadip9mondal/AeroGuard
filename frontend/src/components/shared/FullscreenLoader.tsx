'use client';

import dynamic from 'next/dynamic';

const DotLottieReact = dynamic(
  () => import('@lottiefiles/dotlottie-react').then((mod) => mod.DotLottieReact),
  { ssr: false }
);

export default function FullscreenLoader() {
  return (
    <div className="absolute inset-0 z-50 bg-base/80 backdrop-blur-md transition-all duration-300 animate-in fade-in flex items-center justify-center">
      <div className="w-80 h-80 sm:w-[500px] sm:h-[500px]">
        <DotLottieReact
          src="/video/Telegram%20Message%20Transp%20Bkg.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}
