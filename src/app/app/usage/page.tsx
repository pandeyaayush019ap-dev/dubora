'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BarChart3, Clock, DollarSign, Shield, ArrowUpRight, HelpCircle } from 'lucide-react';
import { UsageEvent, Workspace } from '@/types';

export default function UsagePage() {
  const [usageData, setUsageData] = useState<{
    totalMinutes: number;
    totalCost: number;
    events: UsageEvent[];
  }>({ totalMinutes: 0, totalCost: 0, events: [] });
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/usage')
      .then((res) => res.json())
      .then((data) => {
        if (data.usage) setUsageData(data.usage);
        if (data.workspace) setWorkspace(data.workspace);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const limitMinutes = workspace?.monthlySourceMinutesLimit || 120;
  const percentUsed = Math.min(100, (usageData.totalMinutes / limitMinutes) * 100);

  return (
    <div className="p-8 space-y-8 max-w-6xl mx-auto w-full">
      <div className="pb-6 border-b border-heather-800">
        <h1 className="text-2xl font-bold tracking-tight text-feather">Usage & Quotas</h1>
        <p className="text-xs text-quartz/70 mt-1">Real-time accounting of video processing minutes and provider events</p>
      </div>

      {/* Quota Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 md:col-span-2 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-feather">Monthly Processing Quota</span>
            <span className="font-mono text-quartz">
              {usageData.totalMinutes.toFixed(1)} / {limitMinutes} mins ({percentUsed.toFixed(0)}%)
            </span>
          </div>

          <div className="h-3 w-full bg-heather-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-fern to-duskyPink transition-all duration-500"
              style={{ width: `${percentUsed}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-quartz/70 pt-2">
            <span>Billing cycle resets on the 1st of each month</span>
            <Link href="/app/settings/billing" className="text-duskyPink hover:underline flex items-center gap-1 font-medium">
              <span>Upgrade Plan</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-mono text-quartz/70 uppercase">Estimated AI Provider Cost</span>
            <p className="text-3xl font-extrabold text-feather mt-2">${usageData.totalCost.toFixed(2)}</p>
            <p className="text-xs text-quartz/60 mt-1">Calculated from actual completed audio/video minutes</p>
          </div>
          <span className="text-[10px] text-eucalyptus font-mono pt-4 border-t border-heather-800">
            No double billing on failed jobs
          </span>
        </div>
      </div>

      {/* Usage Events Ledger */}
      <div className="rounded-xl border border-heather-700/60 bg-heather-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-heather-800 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-feather uppercase tracking-wider">Usage Event Ledger</h3>
          <span className="text-xs text-quartz/60 font-mono">{usageData.events.length} events recorded</span>
        </div>

        {usageData.events.length === 0 ? (
          <div className="p-8 text-center text-xs text-quartz/60">
            No usage events recorded yet. Processing video jobs generates immutable ledger entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-heather-950 text-quartz/70 font-mono text-[10px] uppercase border-b border-heather-800">
                <tr>
                  <th className="py-2.5 px-4">Event Type</th>
                  <th className="py-2.5 px-4">Provider</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Cost</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-heather-800 text-quartz">
                {usageData.events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-heather-850/50">
                    <td className="py-2.5 px-4 font-medium text-feather capitalize">
                      {ev.eventType.replace('_', ' ')}
                    </td>
                    <td className="py-2.5 px-4 font-mono">{ev.provider}</td>
                    <td className="py-2.5 px-4 font-mono">
                      {ev.quantity} {ev.unit}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-fern-light">
                      ${(ev.actualCost || ev.estimatedCost || 0).toFixed(3)}
                    </td>
                    <td className="py-2.5 px-4 text-quartz/60 text-[11px]">
                      {new Date(ev.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
