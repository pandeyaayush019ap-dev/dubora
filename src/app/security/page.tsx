import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { ShieldCheck, Lock, KeyRound, UserCheck, FileCheck, Server } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="flex min-h-screen flex-col bg-heather-950 text-feather">
      <PublicNavbar />

      <main className="flex-1 py-20 px-6">
        <div className="mx-auto max-w-5xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono uppercase tracking-widest text-duskyPink mb-2 block">
              Trust & Data Governance
            </span>
            <h1 className="text-4xl font-extrabold text-feather tracking-tight sm:text-5xl">
              Security, Privacy & Voice Rights
            </h1>
            <p className="mt-4 text-base text-quartz">
              How Dubora protects your proprietary video assets, user data, and voice provenance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-fern/20 flex items-center justify-center text-fern-light">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-feather">Private Object Storage By Default</h3>
              <p className="text-xs text-quartz leading-relaxed">
                Raw video uploads, extracted dialogue, intermediate audio, and rendered master exports are saved strictly to private S3/R2 storage buckets. No permanent public URLs are ever created. Media access requires short-lived signed URLs generated on the server.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-duskyPink/20 flex items-center justify-center text-duskyPink">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-feather">Zero Client-Side Secret Exposure</h3>
              <p className="text-xs text-quartz leading-relaxed">
                AI provider API keys (ElevenLabs, OpenAI, Anthropic) and database service-role keys reside exclusively in server environment variables. Browser bundles never receive or execute API keys.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-eucalyptus/20 flex items-center justify-center text-eucalyptus">
                <UserCheck className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-feather">Voice Cloning & Ethical Consent</h3>
              <p className="text-xs text-quartz leading-relaxed">
                Dubora requires users to warrant that they possess ownership or explicit authorization for any human voice processed or cloned. Unauthorized impersonation, deceptive endorsement, and malicious voice fabrication are prohibited under our Terms.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 space-y-3">
              <div className="h-9 w-9 rounded-lg bg-heather-500/20 flex items-center justify-center text-quartz">
                <Server className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-feather">PostgreSQL Row-Level Security</h3>
              <p className="text-xs text-quartz leading-relaxed">
                Every project, transcript segment, export, and usage event is partitioned by workspace. Cross-workspace tenant access is blocked at the database engine level via cryptographically verified user claims.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
