import React, { useState } from 'react';
import { User, LogIn, ArrowRight, Target, Zap, Activity } from 'lucide-react';
import { signInWithGoogle } from '../firebase';

interface IntroPageProps {
  onLoginClick: () => void; // We can ignore this and do it here, or pass success?
  onTryWithoutSignup?: () => void;
}

export default function IntroPage({ onLoginClick, onTryWithoutSignup }: IntroPageProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      // App.tsx uses onAuthStateChanged so it will automatically navigate away
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized. Please add it to your Firebase Console under Authentication > Settings > Authorized domains.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Google Sign-In is not enabled. Please enable it in your Firebase Console under Authentication > Sign-in method.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError(null);
      } else if (err.code === 'auth/popup-blocked') {
        setError("Authentication popup was blocked by your browser. Please click the 'Open in new tab' button (the square with an arrow icon at the top right of the preview) to sign in, or allow popups for this site.");
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    
    <div className="min-h-screen text-[#1a1a1a] font-departure relative flex flex-col bg-[#EFEBE6] overflow-x-hidden">
      
      {/* Navigation / Logo */}
      <nav className="w-full p-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#1a1a1a] flex items-center justify-center bg-[#D3C5B5]">
            <span className="text-[#1a1a1a] text-xl uppercase">U</span>
          </div>
          <span className="text-2xl tracking-tight text-[#1a1a1a] uppercase">U_FOCUS</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-12 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 pb-20">
        
        {/* Hero & Auth Section */}
        <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-lg w-full">
          <h1 className="text-5xl md:text-7xl tracking-normal leading-[1.05] mb-6 uppercase">
            Master your <br/> attention.
          </h1>
          <p className="text-lg md:text-xl text-[#1a1a1a]/80 leading-relaxed mb-12 uppercase">
            The all-in-one focus workspace designed for deep work.
          </p>
          
          {/* Auth Box */}
          <div className="w-full bg-[#D3C5B5] border-2 border-[#1a1a1a] p-8 text-left relative">
            
            {/* Paperclip accent */}
            <div className="absolute -top-12 right-12 z-20">
              <svg width="40" height="80" viewBox="0 0 40 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 70C12 70 6 64 6 56V20C6 14.5 10.5 10 16 10C21.5 10 26 14.5 26 20V56C26 59.3 23.3 62 20 62C16.7 62 14 59.3 14 56V24" stroke="#1a1a1a" strokeWidth="4" strokeLinecap="square"/>
              </svg>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border-2 border-red-500 text-red-700 text-sm text-center uppercase">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-[#1a1a1a] text-[#EFEBE6] text-base px-6 py-4 border-2 border-[#1a1a1a] hover:bg-[#2a2a2a] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed uppercase"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#EFEBE6]/30 border-t-[#EFEBE6] rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                <span>Continue with Google</span>
              </button>
              
              <button
                onClick={onTryWithoutSignup}
                className="w-full bg-transparent hover:bg-[#1a1a1a]/5 border-2 border-[#1a1a1a] text-[#1a1a1a] text-base px-6 py-4 transition-all flex items-center justify-center gap-3 cursor-pointer uppercase"
              >
                <User className="w-5 h-5 text-[#1a1a1a]" />
                <span>Continue as Guest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards Section */}
        <div className="flex flex-col gap-4 w-full max-w-md lg:mt-0 mt-8 pb-12 lg:pb-0">
          <div className="bg-[#EFEBE6] border-2 border-[#1a1a1a] p-6 flex flex-col gap-3 relative shadow-[4px_4px_0_0_#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-[#1a1a1a] bg-[#D3C5B5]">
                <Target className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <h3 className="text-lg text-[#1a1a1a] uppercase">Objective</h3>
            </div>
            <p className="text-[#1a1a1a]/80 text-sm leading-relaxed text-left uppercase">
              To help you reclaim your time and rebuild your attention span in an increasingly distracted digital world.
            </p>
          </div>
          
          <div className="bg-[#EFEBE6] border-2 border-[#1a1a1a] p-6 flex flex-col gap-3 relative shadow-[4px_4px_0_0_#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-[#1a1a1a] bg-[#D3C5B5]">
                <Zap className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <h3 className="text-lg text-[#1a1a1a] uppercase">Features</h3>
            </div>
            <p className="text-[#1a1a1a]/80 text-sm leading-relaxed text-left uppercase">
              Deep focus timer, integrated daily habit tracking, ambient soundscapes, and gamified experience points to keep you motivated.
            </p>
          </div>

          <div className="bg-[#EFEBE6] border-2 border-[#1a1a1a] p-6 flex flex-col gap-3 relative shadow-[4px_4px_0_0_#1a1a1a]">
            <div className="flex items-center gap-3">
              <div className="p-2 border-2 border-[#1a1a1a] bg-[#D3C5B5]">
                <Activity className="w-5 h-5 text-[#1a1a1a]" />
              </div>
              <h3 className="text-lg text-[#1a1a1a] uppercase">Usage</h3>
            </div>
            <p className="text-[#1a1a1a]/80 text-sm leading-relaxed text-left uppercase">
              Set a goal for your session, turn on focus mode, block out distractions, and track your daily streak as you build consistency.
            </p>
          </div>
        </div>

      </main>
    </div>

  );
}
