'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AudioWaveform, Lock, Mail, User, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('Alex Rivera');
  const [email, setEmail] = useState('alex@creator.io');
  const [password, setPassword] = useState('securePass123!');
  const [useCase, setUseCase] = useState('youtube');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push('/app');
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-heather-950 px-6 py-12 text-feather">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-heather-500 to-duskyPink text-feather shadow-lg">
              <AudioWaveform className="h-5 w-5" />
            </div>
            <span className="font-extrabold tracking-wider text-xl text-feather">DUBORA</span>
          </Link>
          <h2 className="text-2xl font-bold tracking-tight text-feather">Create your localization studio</h2>
          <p className="text-xs text-quartz/70 mt-1">Get 15 free video evaluation minutes</p>
        </div>

        <div className="rounded-2xl border border-heather-700/80 bg-heather-900 p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-quartz mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-quartz/50" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg border border-heather-700 bg-heather-950 pl-10 pr-3 py-2 text-xs text-feather focus:border-duskyPink focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-quartz mb-1.5">Work email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-quartz/50" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg border border-heather-700 bg-heather-950 pl-10 pr-3 py-2 text-xs text-feather focus:border-duskyPink focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-quartz mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-quartz/50" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-heather-700 bg-heather-950 pl-10 pr-3 py-2 text-xs text-feather focus:border-duskyPink focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-quartz mb-1.5">Primary use case</label>
              <select
                value={useCase}
                onChange={(e) => setUseCase(e.target.value)}
                className="w-full rounded-lg border border-heather-700 bg-heather-950 px-3 py-2 text-xs text-feather focus:border-duskyPink focus:outline-none"
              >
                <option value="youtube">YouTube Creator & Influencer</option>
                <option value="education">Online Education & Courses</option>
                <option value="marketing">Brand Marketing & Ads</option>
                <option value="agency">Localization Agency & Studio</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-duskyPink py-2.5 px-4 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-all shadow-md shadow-duskyPink/20 disabled:opacity-50"
            >
              {isLoading ? (
                <span>Creating Studio...</span>
              ) : (
                <>
                  <span>Start Free Trial</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-heather-800 text-center text-xs text-quartz">
            <span>Already have an account? </span>
            <Link href="/auth/sign-in" className="text-duskyPink hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
