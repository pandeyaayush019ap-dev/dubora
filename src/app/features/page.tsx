import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation';
import { Footer } from '@/components/footer';
import {
  Globe,
  Sliders,
  AudioWaveform,
  Languages,
  Layers,
  Cpu,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function FeaturesPage() {
  const features = [
    {
      title: 'Neural Multilingual Dubbing',
      description: 'Preserves the recognizable voice timbre, cadence, and delivery of original speakers using cutting-edge ElevenLabs and neural speech synthesis.',
      icon: Languages,
      badge: 'Core Engine',
    },
    {
      title: 'Interactive Dialogue Studio',
      description: 'Review original transcript alongside generated translations. Edit dialogue text segment-by-segment with real-time persistent saving.',
      icon: Sliders,
      badge: 'Workspace',
    },
    {
      title: 'Speech Synchronization & Time-Stretching',
      description: 'Intelligent timing alignment algorithm ensures target language dialogue fits accurately into original dialogue gaps and visual lip cadence.',
      icon: AudioWaveform,
      badge: 'FFmpeg Engine',
    },
    {
      title: 'Lossless Visual Remuxing',
      description: 'Stream-copies original video frames (H.264/HEVC/VP9) to guarantee zero visual generational degradation while multiplexing pristine AAC audio.',
      icon: Layers,
      badge: 'Production Grade',
    },
    {
      title: 'Multi-Target Language Fanout',
      description: 'Upload once, generate Spanish, German, French, Hindi, and Japanese versions concurrently with independent job state and error recovery.',
      icon: Globe,
      badge: 'Scale',
    },
    {
      title: 'Private S3 / R2 Object Storage',
      description: 'No permanent public media links. Media is stored securely with short-lived authenticated streaming URLs and Row-Level Security.',
      icon: ShieldCheck,
      badge: 'Security',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-heather-950 text-feather">
      <PublicNavbar />

      <main className="flex-1 py-20 px-6">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-fern-light mb-2 block">
              Capabilities & Architecture
            </span>
            <h1 className="text-4xl font-extrabold text-feather tracking-tight sm:text-5xl">
              Engineered for Real Creative Localization
            </h1>
            <p className="mt-4 text-base text-quartz">
              Dubora bridges the gap between raw AI model APIs and a finished, broadcast-ready video file.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-heather-700/60 bg-heather-900 p-6 shadow-md hover:border-heather-500 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-heather-800 border border-heather-700 text-duskyPink">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded bg-heather-800 text-[10px] font-mono text-eucalyptus border border-heather-700">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-feather mb-2">{item.title}</h3>
                  <p className="text-xs text-quartz leading-relaxed">{item.description}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-20 p-8 rounded-2xl border border-heather-700/80 bg-heather-900 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-feather">Ready to experience the studio?</h3>
              <p className="text-xs text-quartz mt-1">Start your first dubbing project in under 60 seconds.</p>
            </div>
            <Link
              href="/app/projects/new"
              className="flex items-center gap-2 rounded-lg bg-duskyPink px-5 py-2.5 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-all shadow-md"
            >
              <Sparkles className="h-4 w-4" />
              <span>Launch Studio</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
