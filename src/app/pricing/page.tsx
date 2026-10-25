import Link from 'next/link';
import { PublicNavbar } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Check, Sparkles, HelpCircle } from 'lucide-react';

export default function PricingPage() {
  const tiers = [
    {
      name: 'Evaluation / Free Trial',
      price: '$0',
      period: 'per month',
      desc: 'Test the end-to-end AI dubbing workflow with rights-cleared short videos.',
      minutes: '15 video minutes',
      features: [
        '15 source video minutes / mo',
        '3 target languages per project',
        'Full dialogue editor & timeline preview',
        'Standard 720p & 1080p exports',
        'Community support',
      ],
      cta: 'Start Free Trial',
      popular: false,
      href: '/app/projects/new',
    },
    {
      name: 'Creator',
      price: '$29',
      period: 'per month',
      desc: 'Designed for individual YouTubers, course creators, and educators.',
      minutes: '120 video minutes',
      features: [
        '120 source video minutes / mo',
        'All 11 verified languages supported',
        'Dialogue editing & segment re-generation',
        'High-bitrate 1080p stream-copy export',
        'Custom voice timbre matching',
        'Standard priority queue',
      ],
      cta: 'Choose Creator',
      popular: true,
      href: '/app/projects/new',
    },
    {
      name: 'Pro Studio',
      price: '$89',
      period: 'per month',
      desc: 'For production agencies and marketing teams with recurring video volume.',
      minutes: '450 video minutes',
      features: [
        '450 source video minutes / mo',
        'Batch multi-language localization',
        'Glossary terminology enforcement',
        'Background ambience isolation control',
        '4K UHD export support',
        'Priority GPU worker processing',
      ],
      cta: 'Choose Pro Studio',
      popular: false,
      href: '/app/projects/new',
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'annual billing',
      desc: 'For high-volume broadcasters, media networks, and enterprises.',
      minutes: 'Custom volume',
      features: [
        'Unlimited source video minutes',
        'Dedicated self-hosted worker infrastructure',
        'Custom voice cloning & consent management',
        'SLA guaranteed rendering turnaround',
        'Single Sign-On (SSO) & audit logs',
      ],
      cta: 'Contact Sales',
      popular: false,
      href: 'mailto:enterprise@dubora.ai',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-heather-950 text-feather">
      <PublicNavbar />

      <main className="flex-1 py-20 px-6">
        <div className="mx-auto max-w-6xl text-center">
          <span className="text-xs font-mono uppercase tracking-widest text-duskyPink mb-2 block">
            Transparent SaaS Economics
          </span>
          <h1 className="text-4xl font-extrabold text-feather tracking-tight sm:text-5xl">
            Predictable Video Localization Pricing
          </h1>
          <p className="mt-4 text-base text-quartz max-w-2xl mx-auto">
            Choose the plan that matches your monthly video minutes. All plans include full access to our dialogue studio, timeline synchronizer, and verified exports.
          </p>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col justify-between rounded-xl p-6 transition-all ${
                  tier.popular
                    ? 'bg-heather-900 border-2 border-duskyPink shadow-xl shadow-duskyPink/15 scale-105 z-10'
                    : 'bg-heather-900/60 border border-heather-700/60 hover:border-heather-600'
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-duskyPink px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-heather-950">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-base font-bold text-feather">{tier.name}</h3>
                  <p className="text-xs text-quartz/70 mt-1 min-h-[32px]">{tier.desc}</p>

                  <div className="mt-4 pb-4 border-b border-heather-700/70">
                    <span className="text-3xl font-extrabold text-feather">{tier.price}</span>
                    <span className="text-xs text-quartz ml-1">/ {tier.period}</span>
                    <p className="text-xs font-mono text-eucalyptus mt-1">{tier.minutes}</p>
                  </div>

                  <ul className="mt-6 space-y-2.5 text-xs text-quartz">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-fern-light shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  <Link
                    href={tier.href}
                    className={`flex items-center justify-center w-full py-2.5 px-4 rounded-lg text-xs font-semibold transition-all ${
                      tier.popular
                        ? 'bg-duskyPink text-heather-950 hover:bg-duskyPink-light shadow-md shadow-duskyPink/25'
                        : 'bg-heather-800 text-feather hover:bg-heather-700 border border-heather-600'
                    }`}
                  >
                    {tier.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 p-6 rounded-xl border border-heather-800 bg-heather-900 max-w-3xl mx-auto text-left text-xs text-quartz flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-duskyPink shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-feather">Honest Quota Accounting</p>
              <p className="mt-1 text-quartz/80 leading-relaxed">
                Source minutes are counted based on the inspected duration of the video. Failed jobs do not consume minutes. Overage minutes can be enabled in workspace settings at direct provider pass-through rates.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
