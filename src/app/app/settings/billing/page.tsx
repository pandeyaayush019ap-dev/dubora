'use client';

import React from 'react';
import { CreditCard, Check, ShieldCheck, Zap } from 'lucide-react';

export default function BillingSettingsPage() {
  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto w-full">
      <div className="pb-6 border-b border-heather-800">
        <h1 className="text-2xl font-bold tracking-tight text-feather">Workspace Plan & Billing</h1>
        <p className="text-xs text-quartz/70 mt-1">Manage subscription tiers, payment methods, and minute allocations</p>
      </div>

      <div className="p-6 rounded-xl border border-duskyPink/50 bg-heather-900 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-duskyPink uppercase tracking-wider font-semibold">Active Plan</span>
            <h2 className="text-xl font-bold text-feather mt-1">Creator Tier</h2>
            <p className="text-xs text-quartz/70">120 monthly source video minutes • 11 languages</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-fern/30 text-fern-light text-xs font-semibold border border-fern/50">
            Active
          </span>
        </div>

        <div className="pt-4 border-t border-heather-800 flex items-center justify-between text-xs">
          <span className="text-quartz">Renews automatically on the 1st of next month</span>
          <button
            onClick={() => alert('Stripe billing integration available once STRIPE_SECRET_KEY is configured in production environment.')}
            className="px-3.5 py-1.5 rounded-lg bg-heather-800 hover:bg-heather-700 border border-heather-700 text-feather font-medium transition-colors"
          >
            Manage Subscription
          </button>
        </div>
      </div>

      <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 space-y-3 text-xs text-quartz">
        <h3 className="text-sm font-semibold text-feather flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-fern-light" />
          <span>Payment Security</span>
        </h3>
        <p className="leading-relaxed">
          Card details are processed through encrypted Stripe Elements. No cardholder data ever touches Dubora servers.
        </p>
      </div>
    </div>
  );
}
