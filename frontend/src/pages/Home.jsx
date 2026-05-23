import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: '⚡', title: 'ATS Intelligence', desc: 'Real-time scoring powered by GPT-4o. Know exactly why you might get filtered before you even apply.' },
  { icon: '🎯', title: 'Contextual Matching', desc: 'Our engine maps your skills against specific job descriptions to reveal critical gaps.' },
  { icon: '✨', title: 'Semantic Enhancer', desc: 'Transform dry bullet points into high-impact professional narratives that command attention.' },
  { icon: '📄', title: 'Architectural Layouts', desc: '30+ designer templates engineered for readability and high-conversion recruitment flows.' },
  { icon: '🔗', title: 'Live Artifacts', desc: 'Deploy your resume to a unique URL. Control access, track views, and update instantly.' },
  { icon: '📦', title: 'Neural Backups', desc: 'Automatic versioning of every change. Restore any previous iteration with zero data loss.' },
]

const stats = [
  { value: '98%', label: 'ATS Success' },
  { value: '2.4x', label: 'More Responses' },
  { value: '30+', label: 'Templates' },
  { value: 'GPT-4o', label: 'Engine' },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-primary text-text-primary selection:bg-amber-500/30 selection:text-amber-500">
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-6 overflow-hidden">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-amber-500/[0.07] blur-[150px] rounded-full -z-10" />
        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-indigo-500/[0.03] blur-[120px] rounded-full -z-10" />

        {/* Grid Background */}
        <div
          className="absolute inset-0 z-[-5] opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-6xl mx-auto text-center">
          
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-border mb-6 animate-fade-up">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary/80">
              Powered by Gemini AI
            </span>
          </div>

          <h1 className="font-display text-7xl md:text-9xl font-bold leading-[0.85] tracking-tighter mb-6 animate-fade-up delay-100 text-text-primary">
            Design for the <br />
            <span className="text-amber-500">Outcome.</span>
          </h1>

          <p className="mt-6 text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed animate-fade-up delay-200 font-medium">
            Stop sending resumes into the void. Build ATS-architected,
            AI-augmented artifacts that secure interviews in the top 1%.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-fade-up delay-300">
            {user ? (
              <Link
                to="/dashboard"
                className="btn-primary h-16 px-12 text-xs glow-orange-strong"
              >
                Go to Workspace →
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="btn-primary h-16 px-12 text-xs glow-orange-strong"
                >
                  Start Building Free
                </Link>

                <Link
                  to="/login"
                  className="h-16 px-12 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary/80 hover:text-text-primary transition-all border border-border/50 rounded-2xl hover:bg-white/[0.02]"
                >
                  Member Login
                </Link>
              </>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto animate-fade-up delay-400">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center group">
                <p className="font-display text-5xl font-bold text-text-primary mb-2 tracking-tighter group-hover:text-amber-500 transition-colors">
                  {value}
                </p>

                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-6 pb-12 px-6 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row items-end justify-between mb-14 gap-8">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-4">
                Capabilities
              </p>

              <h2 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight leading-[1.05]">
                Smarter tools for <br /> superior results.
              </h2>
            </div>

            <p className="text-text-secondary/80 text-lg max-w-sm leading-relaxed font-medium">
              We've automated the science of recruitment so you can focus on mastering your craft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="card p-8 group hover:border-amber-500/40 bg-white/[0.015] relative overflow-hidden flex flex-col justify-between h-full"
              >
                <div>
                  <div className="text-3xl mb-6 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>

                  <h3 className="font-display font-bold text-2xl text-text-primary mb-3 group-hover:text-amber-500 transition-colors">
                    {f.title}
                  </h3>

                  <p className="text-base text-text-secondary/80 leading-relaxed group-hover:text-text-secondary transition-colors">
                    {f.desc}
                  </p>
                </div>

                <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-10 pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="card p-12 md:p-20 text-center bg-gradient-to-br from-bg-secondary to-bg-primary border-border/50 relative overflow-hidden">
            
            <div className="absolute inset-0 bg-amber-500/[0.04] pointer-events-none" />

            <h2 className="font-display text-5xl md:text-8xl font-bold text-text-primary tracking-tighter mb-6 relative z-10 leading-[0.9]">
              Ready to double <br className="hidden md:block" /> your reach?
            </h2>

            <p className="text-text-secondary/80 text-xl mb-8 max-w-2xl mx-auto relative z-10 font-medium leading-relaxed">
              Join 50,000+ top-tier professionals who have accelerated their career trajectories with CVISION.
            </p>

            <Link
              to="/register"
              className="btn-primary h-16 px-16 text-xs glow-orange-strong relative z-10 mx-auto inline-flex items-center"
            >
              Deploy Your First Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-8 px-6 border-t border-border bg-secondary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span className="font-display font-black text-xl text-text-primary tracking-tighter">
              CVISION
            </span>
            <span className="hidden md:block w-1 h-1 rounded-full bg-border"></span>
            <p className="text-xs font-semibold text-amber-500/80">
              Designed & Developed by Subhash
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 text-[10px] font-bold uppercase tracking-widest text-text-muted/50 text-center">
            <p>© 2026 CVISION TECHNOLOGY SYSTEMS</p>
            <span className="hidden md:block w-1 h-1 rounded-full bg-border"></span>
            <p>ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </footer>
    </div>
  )
}