'use client';

import { useRouter } from 'next/navigation';
import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';
import { login, type LoginActionState } from '../(dashboard)/actions';

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);

  const [state, formAction] = useActionState<LoginActionState, FormData>(login, {
    status: 'idle',
  });

  useEffect(() => {
    if (!state) return;
    
    if (state.status === 'failed') {
      toast.error('Invalid credentials!');
    } else if (state.status === 'invalid_data') {
      toast.error('Failed validating your submission!');
    } else if (state.status === 'success') {
      setIsSuccessful(true);
      router.push('/'); // Redirect to dashboard after successful login
    }
  }, [state?.status, router]);

  const handleSubmit = (formData: FormData) => {
    setUsername(formData.get('username') as string);
    formAction(formData);
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">התחבר</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            התחבר עם שם משתמש וסיסמה
          </p>
        </div>
        <AuthForm action={handleSubmit} defaultUsername={username}>
          <SubmitButton isSuccessful={isSuccessful}>התחבר</SubmitButton>
        </AuthForm>
      </div>
    </div>
  );
}
