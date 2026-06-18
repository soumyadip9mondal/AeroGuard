'use client';

import { useState } from 'react';
import TopBar from '@/components/layout/TopBar';
import { User, Building2, Link2, CreditCard, CheckCircle2, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile' | 'org' | 'integrations' | 'billing'>('profile');

  return (
    <div className="min-h-screen bg-base">
      <TopBar title="Settings" />
      <div className="page-enter p-6 space-y-5">
        <div className="flex gap-1 border-b border-border-subtle">
          {([['profile', 'Profile', User], ['org', 'Organization', Building2], ['integrations', 'Integrations', Link2], ['billing', 'Billing', CreditCard]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} className={`flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium border-b-2 transition-colors ${tab === key ? 'border-accent text-text-primary' : 'border-transparent text-text-tertiary hover:text-text-secondary'}`}>
              <Icon className="h-3.5 w-3.5" />{label}
            </button>
          ))}
        </div>

        {tab === 'profile' && (
          <div className="max-w-[560px] space-y-5">
            <div className="flex items-center gap-4 rounded-lg border border-border-subtle bg-surface p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-elevated text-[18px] font-medium text-text-secondary">JR</div>
              <div><div className="text-[15px] font-medium text-text-primary">J. Rivera</div><div className="text-[13px] text-text-tertiary">MRO Inspection Engineer</div></div>
            </div>
            {[{ label: 'Full Name', value: 'Juan Rivera' }, { label: 'Email', value: 'j.rivera@aeroguard.com' }, { label: 'Role', value: 'MRO Engineer' }, { label: 'Employee ID', value: 'EMP-4821', mono: true }].map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.04em] text-text-tertiary">{f.label}</label>
                <input readOnly value={f.value} className={`w-full rounded-md border border-border-subtle bg-elevated px-3.5 py-2.5 text-[14px] text-text-primary outline-none ${f.mono ? 'font-mono' : ''}`} />
              </div>
            ))}
            <button className="rounded-md bg-accent px-4 py-2.5 text-[13px] font-medium text-white hover:bg-accent-hover transition-colors">Save Changes</button>
          </div>
        )}

        {tab === 'org' && (
          <div className="max-w-[560px] space-y-5">
            <div className="rounded-lg border border-border-subtle bg-surface p-5">
              <div className="flex items-center justify-between mb-4">
                <div><div className="text-[15px] font-medium text-text-primary">AeroGuard Aviation</div><div className="text-[13px] text-text-tertiary">MRO Organization</div></div>
                <span className="rounded-full bg-accent-subtle px-3 py-1 text-[11px] font-medium text-accent">Enterprise</span>
              </div>
              <div className="grid gap-3 text-[13px] sm:grid-cols-2">
                <div><span className="text-text-tertiary">Members:</span> <span className="text-text-primary">24</span></div>
                <div><span className="text-text-tertiary">Aircraft:</span> <span className="text-text-primary">12</span></div>
                <div><span className="text-text-tertiary">Inspections (YTD):</span> <span className="text-text-primary">1,247</span></div>
                <div><span className="text-text-tertiary">Storage Used:</span> <span className="text-text-primary">847 GB / 2 TB</span></div>
              </div>
            </div>
          </div>
        )}

        {tab === 'integrations' && (
          <div className="max-w-[640px] space-y-3">
            {[
              { name: 'CMMS Integration', desc: 'Sync work orders with your maintenance management system', connected: true, system: 'SAP PM' },
              { name: 'ERP System', desc: 'Connect procurement and inventory with your ERP', connected: true, system: 'Oracle EBS' },
              { name: 'Cloud Storage', desc: 'Store inspection videos and reports in your cloud', connected: false, system: 'Not configured' },
              { name: 'SSO / SAML', desc: 'Single sign-on via your identity provider', connected: true, system: 'Okta' },
            ].map((i) => (
              <div key={i.name} className="flex items-center justify-between rounded-lg border border-border-subtle bg-surface p-4">
                <div className="flex items-center gap-3">
                  {i.connected ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-text-tertiary" />}
                  <div>
                    <div className="text-[14px] font-medium text-text-primary">{i.name}</div>
                    <div className="text-[12px] text-text-tertiary">{i.desc}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[12px] font-mono text-text-secondary">{i.system}</div>
                  <button className={`mt-1 rounded px-2.5 py-1 text-[11px] font-medium transition-colors ${i.connected ? 'text-text-tertiary hover:text-text-primary' : 'bg-accent text-white hover:bg-accent-hover'}`}>
                    {i.connected ? 'Configure' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'billing' && (
          <div className="max-w-[560px] space-y-5">
            <div className="rounded-lg border border-accent/30 bg-accent-subtle p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[18px] font-medium text-text-primary">Enterprise Plan</span>
                <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-medium text-white">Active</span>
              </div>
              <div className="grid gap-2 text-[13px] sm:grid-cols-2">
                <div><span className="text-text-tertiary">Monthly Cost:</span> <span className="text-text-primary">$4,800/mo</span></div>
                <div><span className="text-text-tertiary">Next Billing:</span> <span className="text-text-primary">July 1, 2025</span></div>
                <div><span className="text-text-tertiary">Inspections:</span> <span className="text-text-primary">Unlimited</span></div>
                <div><span className="text-text-tertiary">Storage:</span> <span className="text-text-primary">2 TB included</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
