import AppShell from '@/components/layout/AppShell';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  
  if (user && !user.publicMetadata?.role) {
    redirect('/onboarding');
  }

  return <AppShell>{children}</AppShell>;
}
