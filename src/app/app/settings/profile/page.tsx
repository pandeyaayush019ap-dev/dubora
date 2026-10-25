'use client';

import React, { useState } from 'react';
import { User, Mail, Globe, Save } from 'lucide-react';

export default function ProfileSettingsPage() {
  const [name, setName] = useState('Dubora Creator');
  const [email, setEmail] = useState('creator@dubora.ai');
  const [lang, setLang] = useState('en');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-8 space-y-8 max-w-3xl mx-auto w-full">
      <div className="pb-6 border-b border-heather-800">
        <h1 className="text-2xl font-bold tracking-tight text-feather">Profile & Preferences</h1>
        <p className="text-xs text-quartz/70 mt-1">Manage personal account details and default studio preferences</p>
      </div>

      <form onSubmit={handleSave} className="p-6 rounded-xl border border-heather-700/60 bg-heather-900 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-feather mb-1.5">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-heather-700 bg-heather-950 px-3.5 py-2 text-xs text-feather focus:border-duskyPink focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-feather mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            disabled
            className="w-full rounded-lg border border-heather-800 bg-heather-950 px-3.5 py-2 text-xs text-quartz/60 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-feather mb-1.5">Preferred Studio Interface Language</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="w-full rounded-lg border border-heather-700 bg-heather-950 px-3 py-2 text-xs text-feather focus:border-duskyPink focus:outline-none"
          >
            <option value="en">English (US)</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="hi">हिन्दी</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        <div className="pt-4 border-t border-heather-800 flex items-center justify-between">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-duskyPink px-4 py-2 text-xs font-semibold text-heather-950 hover:bg-duskyPink-light transition-all shadow-md shadow-duskyPink/20"
          >
            <Save className="h-3.5 w-3.5" />
            <span>Save Preferences</span>
          </button>
          {saved && <span className="text-xs text-fern-light">Saved successfully!</span>}
        </div>
      </form>
    </div>
  );
}
