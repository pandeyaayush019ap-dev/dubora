import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation';
import { Footer } from '@/components/footer';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Globe,
  Sliders,
  ShieldCheck,
  Video,
  FileAudio,
  Cpu,
  Layers,
  Clock,
  Play,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-heather-950 text-feather">
      <PublicNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 border-b border-heather-800">
          {/* Subtle atmospheric ambient gradients using Heather and Dusky Pink */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-heather-500/20 via-duskyPink/15 to-fern/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="mx-auto max-w-6xl px-6 text-center">
            {/* Status pill badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-heather-600/70 bg-heather-900/90 px-3.5 py-1 text-xs text-quartz mb-6 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-fern-light animate-pulse" />
              <span>Production AI Dubbing SaaS MVP</span>
              <span className="text-heather-500">•</span>
              <span className="text-duskyPink font-medium">ElevenLabs & Modular STT</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl text-feather max-w-4xl mx-auto leading-[1.08]">
              Your voice. Every language.{' '}
              <span className="bg-gradient-to-r from-duskyPink via-quartz to-eucalyptus bg-clip-text text-transparent">
                One workflow.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-quartz leading-relaxed">
              Localize your videos with AI-powered dubbing, natural multilingual speech, and synchronized exports — all in one creative workspace.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app/projects/new"
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl bg-duskyPink px-6 py-3.5 text-sm font-semibold text-heather-950 hover:bg-duskyPink-light shadow-xl shadow-duskyPink/25 hover:shadow-duskyPink/40 transition-all group"
              >
                <Sparkles className="h-4 w-4" />
                <span>Start your first dub</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="#workflow"
                className="flex items-center justify-center gap-2 w-full sm:w-auto rounded-xl border border-heather-700 bg-heather-900/80 px-6 py-3.5 text-sm font-medium text-feather hover:bg-heather-800 transition-colors"
              >
                <span>Explore the workflow</span>
              </Link>
            </div>

            {/* Studio interface preview hero composition */}
            <div className="mt-16 relative rounded-2xl border border-heather-700/80 bg-heather-900/90 p-3 shadow-2xl shadow-heather-950/80">
              <div className="rounded-xl overflow-hidden border border-heather-800 bg-heather-950">
                {/* Window header */}
                <div className="h-10 bg-heather-900 px-4 flex items-center justify-between border-b border-heather-800 text-xs text-quartz">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full bg-heather-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-heather-700" />
                    <div className="h-2.5 w-2.5 rounded-full bg-heather-700" />
                    <span className="ml-2 font-mono text-[11px] text-quartz/70">dubora-studio // tech_keynote_localization.mp4</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-fern/30 text-fern-light text-[10px] font-mono">Spanish (es) • Synced</span>
                    <span className="px-2 py-0.5 rounded bg-heather-800 text-quartz text-[10px] font-mono">1080p60</span>
                  </div>
                </div>

                {/* Studio Grid Mock Preview */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 text-left">
                  {/* Left: Video Player */}
                  <div className="md:col-span-7 bg-heather-900 rounded-lg border border-heather-800 p-3 flex flex-col justify-between">
                    <div className="relative aspect-video rounded-md bg-black/80 flex items-center justify-center overflow-hidden border border-heather-800">
                      <div className="absolute inset-0 bg-gradient-to-t from-heather-950/80 via-transparent to-transparent flex items-end p-4">
                        <p className="text-xs text-feather bg-heather-900/90 px-3 py-1.5 rounded-md border border-heather-700">
                          <span className="text-duskyPink font-semibold">ES:</span> "Hoy anunciamos la próxima generación de inteligencia artificial."
                        </p>
                      </div>
                      <div className="h-12 w-12 rounded-full bg-duskyPink/90 flex items-center justify-center text-heather-950 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                        <Play className="h-5 w-5 fill-current ml-0.5" />
                      </div>
                    </div>
                    {/* Fake timeline preview */}
                    <div className="mt-3 pt-3 border-t border-heather-800 flex items-center justify-between text-[11px] text-quartz font-mono">
                      <span>00:14.2 / 01:45.0</span>
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-fern-light" />
                        <span>Speech timing aligned</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Dialogue Segments */}
                  <div className="md:col-span-5 bg-heather-900 rounded-lg border border-heather-800 p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-heather-800">
                      <span className="font-semibold text-feather">Synchronized Dialogue</span>
                      <span className="text-eucalyptus text-[11px]">Segment 1 of 6</span>
                    </div>

                    <div className="p-2.5 rounded-md bg-heather-850 border border-heather-700 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-quartz/70">
                        <span>Original (EN)</span>
                        <span>0.0s – 4.2s</span>
                      </div>
                      <p className="text-xs text-quartz">"Today we are announcing the next generation of artificial intelligence."</p>
                    </div>

                    <div className="p-2.5 rounded-md bg-duskyPink/10 border border-duskyPink/40 space-y-1.5">
                      <div className="flex justify-between text-[10px] font-mono text-duskyPink">
                        <span>Target Dub (ES)</span>
                        <span className="text-fern-light">Saved & Synced</span>
                      </div>
                      <p className="text-xs text-feather font-medium">"Hoy anunciamos la próxima generación de inteligencia artificial."</p>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-[11px]">
                      <span className="text-quartz/70">Voice: Professional Orator</span>
                      <span className="text-duskyPink hover:underline cursor-pointer">Edit translation</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFLOW SECTION */}
        <section id="workflow" className="py-24 border-b border-heather-800 bg-heather-900/50">
          <div className="mx-auto max-w-6xl px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-mono uppercase tracking-widest text-duskyPink mb-2">The Production Pipeline</h2>
              <p className="text-3xl font-bold text-feather tracking-tight">End-to-End Multilingual Dubbing in 6 Real Stages</p>
              <p className="mt-3 text-sm text-quartz">
                Every step executes through verified media processing and AI provider adapters.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  step: '01',
                  title: 'Upload & Inspect',
                  desc: 'Upload high-res MP4, MOV, or WebM. FFprobe probes video codecs, frame rates, and audio streams into secure private storage.',
                  icon: Video,
                },
                {
                  step: '02',
                  title: 'Transcribe Dialogue',
                  desc: 'Extract dialogue audio track with FFmpeg. Capture word-level timestamps and speaker diarization via neural speech recognition.',
                  icon: FileAudio,
                },
                {
                  step: '03',
                  title: 'Contextual Translation',
                  desc: 'Dialogue translated with full scene awareness, cultural nuance, and syllable constraints to preserve original delivery pacing.',
                  icon: Globe,
                },
                {
                  step: '04',
                  title: 'Neural Speech Synthesis',
                  desc: 'Generate expressive, natural speech in the target language matching the speaker tone and emotional pitch.',
                  icon: Volume2,
                },
                {
                  step: '05',
                  title: 'Audio Synchronization',
                  desc: 'Automatic segment timing alignment and quality-safe time stretching to align dubbed dialogue seamlessly with the visuals.',
                  icon: Sliders,
                },
                {
                  step: '06',
                  title: 'FFmpeg Remux & Export',
                  desc: 'Stream-copy original video visuals, multiplex new audio track, and output verified, downloadable broadcast-ready MP4s.',
                  icon: Layers,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="relative rounded-xl border border-heather-700/60 bg-heather-900 p-6 shadow-md hover:border-heather-500 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-heather-800 border border-heather-700 text-duskyPink">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-quartz/50">{item.step}</span>
                    </div>
                    <h3 className="text-base font-semibold text-feather mb-2">{item.title}</h3>
                    <p className="text-xs text-quartz leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CORE PILLARS & ARCHITECTURE */}
        <section className="py-24 border-b border-heather-800">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest text-fern-light mb-2 block">Built for Creators & Studios</span>
                <h2 className="text-3xl font-bold text-feather tracking-tight mb-4">
                  Modular AI Architecture Without Vendor Lock-in
                </h2>
                <p className="text-sm text-quartz leading-relaxed mb-6">
                  Dubora is built with strict boundary adapters. Use ElevenLabs Dubbing API for effortless all-in-one dubbing, or connect modular Whisper STT, Claude/GPT dialogue localization, and neural voice synthesis when fine-grained word edits are required.
                </p>

                <div className="space-y-3">
                  {[
                    'Preserves original speaker voice identity when authorized',
                    'Maintains background ambience and music tracks',
                    'Side-by-side interactive translation editor with instant save',
                    'Independent multi-language target generation per video',
                    'Private signed URLs and Row-Level Security authorization',
                  ].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-xs text-feather">
                      <CheckCircle2 className="h-4 w-4 text-fern-light shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8">
                  <Link
                    href="/app"
                    className="inline-flex items-center gap-2 rounded-lg bg-heather-800 hover:bg-heather-700 border border-heather-600 px-4 py-2.5 text-xs font-semibold text-feather transition-colors"
                  >
                    <span>Open Localization Studio</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="rounded-xl border border-heather-700/80 bg-heather-900 p-6 shadow-xl space-y-4">
                <h4 className="text-xs font-mono uppercase tracking-wider text-quartz">Active Engineering Standards</h4>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-heather-950 border border-heather-800 flex items-start gap-3">
                    <ShieldCheck className="h-4 w-4 text-fern-light shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-feather">Zero Simulated Operations</p>
                      <p className="text-quartz/70 text-[11px] mt-0.5">
                        When provider credentials are not present, Dubora honestly reports missing requirements instead of faking AI progress.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-heather-950 border border-heather-800 flex items-start gap-3">
                    <Cpu className="h-4 w-4 text-duskyPink shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-feather">Local & Cloud FFmpeg Engine</p>
                      <p className="text-quartz/70 text-[11px] mt-0.5">
                        Native media decoding, audio extraction, and video remuxing run on verified binaries.
                      </p>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-heather-950 border border-heather-800 flex items-start gap-3">
                    <Clock className="h-4 w-4 text-eucalyptus shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-feather">Reliable State Machine</p>
                      <p className="text-quartz/70 text-[11px] mt-0.5">
                        Durable job queue tracks every transition: Analyzing, Transcribing, Generating, Remuxing, Completed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM CTA */}
        <section className="py-20 text-center">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="text-3xl font-extrabold text-feather tracking-tight sm:text-4xl">
              Ready to localize your video content?
            </h2>
            <p className="mt-4 text-sm text-quartz max-w-xl mx-auto">
              Create your first project in seconds. Upload your video, choose target languages, and manage dialogue in our studio editor.
            </p>
            <div className="mt-8 flex justify-center">
              <Link
                href="/app/projects/new"
                className="flex items-center gap-2 rounded-xl bg-duskyPink px-6 py-3.5 text-sm font-semibold text-heather-950 hover:bg-duskyPink-light shadow-xl shadow-duskyPink/25 transition-all"
              >
                <Sparkles className="h-4 w-4" />
                <span>Create New Project Now</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
