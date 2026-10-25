import { PublicNavbar } from '@/components/navigation';
import { Footer } from '@/components/footer';

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-heather-950 text-feather">
      <PublicNavbar />
      <main className="flex-1 py-16 px-6">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold text-feather mb-2">Terms of Service</h1>
          <p className="text-xs font-mono text-quartz/70 mb-8">Last Updated: October 2026 • Marked for Legal Review</p>

          <section className="space-y-4 text-xs text-quartz leading-relaxed">
            <h2 className="text-base font-semibold text-feather mt-6">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Dubora platform, you agree to be bound by these Terms of Service and all applicable copyright, publicity rights, and media regulations.
            </p>

            <h2 className="text-base font-semibold text-feather mt-6">2. Voice Consent & Rights Warranty</h2>
            <p>
              You warrant that you own or possess explicit written licenses and consent from all individuals whose voices or likenesses are uploaded, synthesized, or cloned through Dubora. You agree not to use the platform for fraud, deepfakes, or unauthorized synthetic voice replication.
            </p>

            <h2 className="text-base font-semibold text-feather mt-6">3. Usage Limits & Fair Billing</h2>
            <p>
              Video processing minutes are billed based on media duration inspected during ingestion. Excessive automated abuse or denial-of-service attempts will result in immediate suspension.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
