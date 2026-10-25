import { PublicNavbar } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-heather-950 text-feather">
      <PublicNavbar />
      <main className="flex-1 py-16 px-6">
        <div className="mx-auto max-w-3xl prose prose-invert prose-stone">
          <h1 className="text-3xl font-bold text-feather mb-2">Privacy Policy</h1>
          <p className="text-xs font-mono text-quartz/70 mb-8">Last Updated: October 2026 • Marked for Legal Review</p>

          <section className="space-y-4 text-xs text-quartz leading-relaxed">
            <h2 className="text-base font-semibold text-feather mt-6">1. Information We Collect</h2>
            <p>
              Dubora collects account credentials, workspace project metadata, uploaded media files (video and audio), generated transcripts, translated dialogue, and usage statistics necessary to operate the video localization SaaS platform.
            </p>

            <h2 className="text-base font-semibold text-feather mt-6">2. Processing of Media & Voice Data</h2>
            <p>
              Uploaded video and audio are processed through our media processing engine (FFmpeg) and third-party AI providers (such as ElevenLabs and OpenAI) strictly to fulfill transcription, translation, and speech generation requested by you.
            </p>

            <h2 className="text-base font-semibold text-feather mt-6">3. Storage & Retention</h2>
            <p>
              Media assets are retained in private object storage until deleted by the user or workspace administrator. Users may permanently purge projects and associated media at any time.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
