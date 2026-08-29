import { Suspense } from 'react';
import LoginContent from './LoginContent';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-obsidian">
        <div className="animate-pulse text-gold font-serif text-xl">Loading...</div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}