import Link from 'next/link';
import { AudioWaveform, Shield, Lock, FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-heather-700/60 bg-heather-900 py-12 text-sm text-quartz">
      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-heather-500 to-duskyPink text-feather">
              <AudioWaveform className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-feather tracking-wider">DUBORA</span>
          </div>
          <p className="text-xs text-quartz/80 leading-relaxed">
            Production-grade multilingual video localization platform. Seamlessly dub dialogue, align audio timelines, and export broadcast-ready video.
          </p>
          <div className="flex items-center gap-2 pt-2 text-[11px] text-eucalyptus">
            <Shield className="h-3.5 w-3.5 text-fern-light" />
            <span>Private Object Storage & Verified Pipelines</span>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-feather text-xs uppercase tracking-wider mb-3">Product</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/features" className="hover:text-feather transition-colors">Multilingual Pipeline</Link></li>
            <li><Link href="/features" className="hover:text-feather transition-colors">Dialogue Studio Editor</Link></li>
            <li><Link href="/pricing" className="hover:text-feather transition-colors">Pricing & Plans</Link></li>
            <li><Link href="/app/settings/api" className="hover:text-feather transition-colors">API & Integrations</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-feather text-xs uppercase tracking-wider mb-3">Architecture</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/security" className="hover:text-feather transition-colors">Security & Rights</Link></li>
            <li><Link href="/security" className="hover:text-feather transition-colors">FFmpeg Media Engine</Link></li>
            <li><Link href="/security" className="hover:text-feather transition-colors">ElevenLabs & Modular STT</Link></li>
            <li><Link href="/security" className="hover:text-feather transition-colors">Data Privacy</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-feather text-xs uppercase tracking-wider mb-3">Legal & Trust</h4>
          <ul className="space-y-2 text-xs">
            <li><Link href="/legal/privacy" className="hover:text-feather transition-colors">Privacy Policy</Link></li>
            <li><Link href="/legal/terms" className="hover:text-feather transition-colors">Terms of Service</Link></li>
            <li><Link href="/legal/terms" className="hover:text-feather transition-colors">Voice Consent Policy</Link></li>
            <li className="text-[11px] text-quartz/60 pt-2">© {new Date().getFullYear()} Dubora AI, Inc.</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
