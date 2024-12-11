'use client';

import { useRouter } from 'next/navigation';
import { Tabs } from '@/components/ui/tabs';

export function ParticipantsTabs({ children, defaultValue }: { children: React.ReactNode, defaultValue: string }) {
  const router = useRouter();

  return (
    <Tabs 
      defaultValue={defaultValue} 
      onValueChange={(value) => {
        if (value === 'all') {
          router.push('?offset=0');
        } else {
          router.push(`?offset=0&status=${value}`);
        }
      }}
    >
      {children}
    </Tabs>
  );
} 