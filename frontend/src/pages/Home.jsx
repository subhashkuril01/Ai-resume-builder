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
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-amber-500/[0.07] blur-[150px] rounded-full -z-10" />
        <div className="absolute top-[10%] right-[5%] w-[500px] h-[500px] bg-indigo-500/[0.03] blur-[120px] rounded-full -z-10" />

        {/* Grid Background */}
        <div className="absolute inset-0 z-[-5] opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '48px 48px' }} />

        <div className="relative max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.03] border border-border mb-10 animate-fade-up">
            <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-text-secondary/80">Next-Gen Career OS • v4.2 Alpha</span>
          </div>

          <h1 className="font-display text-7xl md:text-9xl font-bold leading-[0.85] tracking-tighter mb-10 animate-fade-up delay-100 text-text-primary">
            Design for the <br />
            <span className="text-amber-500">Outcome.</span>
          </h1>

          <p className="mt-10 text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed animate-fade-up delay-200 font-medium">
            Stop sending resumes into the void. Build ATS-architected, AI-augmented artifacts that secure interviews in the top 1%.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-16 animate-fade-up delay-300">
            {user ? (
              <Link to="/dashboard" className="btn-primary h-16 px-12 text-xs glow-orange-strong">
                Go to Workspace →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary h-16 px-12 text-xs glow-orange-strong">
                  Start Building Free
                </Link>
                <Link to="/login" className="h-16 px-12 flex items-center justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary/80 hover:text-text-primary transition-all border border-border/50 rounded-2xl hover:bg-white/[0.02]">
                  Member Login
                </Link>
              </>
            )}
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mt-32 max-w-4xl mx-auto animate-fade-up delay-400">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center group">
                <p className="font-display text-5xl font-bold text-text-primary mb-2 tracking-tighter group-hover:text-amber-500 transition-colors">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* Features Section */}
      <section className="pt-10 pb-40 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-12">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500 mb-6">Capabilities</p>
              <h2 className="font-display text-5xl md:text-7xl font-bold text-text-primary tracking-tight leading-[1.05]">
                Smarter tools for <br /> superior results.
              </h2>
            </div>
            <p className="text-text-secondary/80 text-lg max-w-sm leading-relaxed font-medium">
              We've automated the science of recruitment so you can focus on mastering your craft.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={f.title} className="card p-10 group hover:border-amber-500/40 bg-white/[0.015] relative overflow-hidden flex flex-col justify-between h-full">
                <div>
                  <div className="text-3xl mb-10 bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center border border-border/50 group-hover:scale-110 transition-transform">
                    {f.icon}
                  </div>
                  <h3 className="font-display font-bold text-2xl text-text-primary mb-4 group-hover:text-amber-500 transition-colors">
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
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="card p-20 md:p-32 text-center bg-gradient-to-br from-bg-secondary to-bg-primary border-border/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-amber-500/[0.04] pointer-events-none" />
            <h2 className="font-display text-5xl md:text-8xl font-bold text-text-primary tracking-tighter mb-10 relative z-10 leading-[0.9]">
              Ready to double <br className="hidden md:block" /> your reach?
            </h2>
            <p className="text-text-secondary/80 text-xl mb-14 max-w-2xl mx-auto relative z-10 font-medium leading-relaxed">
              Join 50,000+ top-tier professionals who have accelerated their career trajectories with CVISION.
            </p>
            <Link to="/register" className="btn-primary h-16 px-16 text-xs glow-orange-strong relative z-10 mx-auto inline-flex items-center">
              Deploy Your First Resume
            </Link>
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="py-24 px-6 border-t border-border bg-secondary">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center gap-2">
              <span className="font-display font-black text-2xl text-text-primary tracking-tighter">CVISION</span>
            </div>
            <p className="text-sm text-text-muted leading-relaxed font-medium">
              Architecting the future of professional identity with advanced neural networks and design excellence.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Platform</p>
              <ul className="space-y-2">
                {['Dashboard', 'AI Analyzer', 'Job Match', 'Templates'].map(i => <li key={i}><a href="#" className="text-xs text-text-muted hover:text-text-primary transition-colors">{i}</a></li>)}
              </ul>
            </div>
            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Company</p>
              <ul className="space-y-2">
                {['About', 'Security', 'Privacy', 'Terms'].map(i => <li key={i}><a href="#" className="text-xs text-text-muted hover:text-text-primary transition-colors">{i}</a></li>)}
              </ul>
            </div>
          </div>
          <div className="md:col-span-1 space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-primary">Connect</p>
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="w-10 h-10 rounded-xl bg-white/[0.03] border border-border/50 hover:border-amber-500/20 transition-all cursor-pointer" />)}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pt-12 border-t border-white/[0.03]">
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/30">
            © 2026 CVISION TECHNOLOGY SYSTEMS • ALL RIGHTS RESERVED
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted/30">
            ENCRYPTED WITH AES-256
          </p>
        </div>
      </footer>
    </div>
  )
}
