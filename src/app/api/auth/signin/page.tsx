'use client'
import React from 'react'
import { getCsrfToken } from 'next-auth/react';
import { LoginForm } from './login-form';

const Page = () => {
  const [csrfToken, setCsrfToken] = React.useState<string | null>(null);

  React.useEffect(() => {
    void (async () => {
      try {
        const token = await getCsrfToken();
        setCsrfToken(token);
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    })();
  }, []);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">  
        <LoginForm csrfToken={csrfToken ?? ""} />
      </div>
    </div>
  )
}

export default Page