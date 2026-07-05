'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Wrench, ShieldCheck, User, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/config/constants';

const roles = [
  { id: 'MRO Engineer', icon: Wrench, description: 'Perform inspections and maintenance' },
  { id: 'Quality Inspector', icon: ShieldCheck, description: 'Verify compliance and approve work' },
  { id: 'Fleet Manager', icon: User, description: 'Oversee operations and analytics' },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isLoaded || !user) return null;

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setIsLoading(true);

    try {
      const res = await fetch('/api/user/role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole })
      });

      if (!res.ok) throw new Error('Failed to update role');
      
      await user.reload();
      router.push('/app/dashboard');
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eaf6ff] flex flex-col items-center justify-center p-4">
      <div className="absolute top-6 right-6">
        <button
          onClick={() => signOut({ redirectUrl: '/' })}
          className="flex items-center gap-2 text-[#6B7280] hover:text-red-500 transition-colors bg-white px-4 py-2 rounded-full shadow-sm border border-black/5"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-[#0951B8]/10 text-center">
        <h1 className="text-2xl font-bold text-[#0951B8] mb-2">Welcome to {APP_NAME}</h1>
        <p className="text-[#6B7280] mb-8 text-sm">Before we begin, please select your primary role to customize your experience.</p>
        
        <div className="flex flex-col gap-3 mb-8">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className={cn(
                  "flex items-center text-left p-4 rounded-xl border-2 transition-all duration-200",
                  isSelected 
                    ? "border-[#0951B8] bg-[#F4F9FF] shadow-sm" 
                    : "border-transparent bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg mr-4",
                  isSelected ? "bg-[#0951B8] text-white" : "bg-white text-[#6B7280] border border-black/5"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className={cn("font-semibold", isSelected ? "text-[#1E3A8A]" : "text-gray-900")}>{role.id}</div>
                  <div className={cn("text-xs mt-0.5", isSelected ? "text-[#1E3A8A]/70" : "text-gray-500")}>{role.description}</div>
                </div>
              </button>
            );
          })}
        </div>
        
        <Button 
          onClick={handleSubmit} 
          disabled={!selectedRole || isLoading}
          className={cn(
            "w-full py-6 text-[15px] font-medium rounded-xl transition-all shadow-lg",
            selectedRole 
              ? "bg-[#0951B8] hover:bg-[#1E3A8A] text-white hover:shadow-xl" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          )}
        >
          {isLoading ? 'Saving Role...' : 'Continue to Dashboard'}
        </Button>
      </div>
    </div>
  );
}
