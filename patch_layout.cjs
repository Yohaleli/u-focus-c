const fs = require('fs');
let content = fs.readFileSync('src/components/IntroPage.tsx', 'utf8');

const mainReplacement = `
      <main className="relative z-10 w-full h-full min-h-screen flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 pt-32">
        
        {/* Hero & Auth Section */}
        <div className="flex flex-col items-center text-center max-w-lg w-full mb-12 lg:mb-0">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-normal leading-[1.05] mb-6 ">
            Master your <br/> attention.
          </h1>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-12 font-medium">
            The all-in-one focus workspace designed for deep work.
          </p>
          
          {/* Auth Box */}
          <div className="w-full bg-[#22201e] border border-white/10 rounded-2xl p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-white text-sm text-center">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white text-black font-bold text-base px-6 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
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
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-base px-6 py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <User className="w-5 h-5 text-white/80" />
                <span>Continue as Guest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Info Cards Section - Absolute on Desktop */}
        <div className="flex flex-col gap-4 w-full max-w-[320px] 2xl:max-w-md mt-12 lg:mt-0 lg:absolute lg:bottom-12 lg:right-12 xl:bottom-16 xl:right-16 z-20">
          <div className="bg-[#22201e] border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Target className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">Objective</h3>
            </div>
            <p className="text-white/70 text-xs leading-relaxed text-left">
              To help you reclaim your time and rebuild your attention span in an increasingly distracted digital world.
            </p>
          </div>
          
          <div className="bg-[#22201e] border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">Features</h3>
            </div>
            <p className="text-white/70 text-xs leading-relaxed text-left">
              Deep focus timer, integrated daily habit tracking, ambient soundscapes, and gamified experience points to keep you motivated.
            </p>
          </div>

          <div className="bg-[#22201e] border border-white/10 rounded-2xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded-lg">
                <Activity className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-base font-bold text-white">Usage</h3>
            </div>
            <p className="text-white/70 text-xs leading-relaxed text-left">
              Set a goal for your session, turn on focus mode, block out distractions, and track your daily streak as you build consistency.
            </p>
          </div>
        </div>
      </main>
`;

const newContent = content.replace(/<main className="relative z-10 w-full max-w-6xl mx-auto p-6 md:p-12 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20">[\s\S]*<\/main>/, mainReplacement);

fs.writeFileSync('src/components/IntroPage.tsx', newContent);
console.log("Layout patched with absolute cards");
