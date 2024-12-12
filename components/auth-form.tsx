import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm({
  action,
  children,
  defaultUsername = '',
}: {
  action: (formData: FormData) => void;
  children: React.ReactNode;
  defaultUsername?: string;
}) {
  return (
    <form action={action} className="flex flex-col space-y-4 px-4 sm:px-16">
      <div>
        <label htmlFor="username" className="block text-sm text-gray-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={defaultUsername}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm text-gray-700">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
        />
      </div>
      {children}
    </form>
  );
}
