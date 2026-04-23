import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  { icon: '⚡', title: 'ATS Score Analysis', desc: 'Get real-time ATS compatibility scores powered by GPT-4. Know exactly where you stand before applying.' },
  { icon: '🎯', title: 'Job Match Engine', desc: 'Paste any job description and instantly see your match percentage, missing skills, and tailored recommendations.' },
  { icon: '✨', title: 'AI Content Enhancer', desc: 'Transform basic descriptions into compelling, professional resume language that stands out.' },
  { icon: '📄', title: '6 Pro Templates', desc: 'Modern, Classic, Minimal, Executive, Creative, and Tech — switch instantly without losing data.' },
  { icon: '🔗', title: 'Public Share Link', desc: 'Generate a unique URL to share your resume publicly. Perfect for LinkedIn or direct applications.' },
  { icon: '📦', title: 'Version History', desc: 'Save snapshots of your resume at any point and restore previous versions with one click.' },
]

const stats = [
  { value: '94%', label: 'ATS Pass Rate' },
  { value: '3x', label: 'More Interviews' },
  { value: '6', label: 'Pro Templates' },
  { value: '∞', label: 'AI Requests' },
]

export default function Home() {
  const { user } = useAuth()

  return (
    <div style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }} className="min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-20 px-6 overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(var(--text-primary) 1px, transparent 1px), linear-gradient(90deg, var(--text-primary) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Glow */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl opacity-10"
          style={{ background: 'var(--accent)' }} />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="badge-accent inline-flex mb-6 animate-fade-up">
            <span>🤖</span> Powered by GPT-4o
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight animate-fade-up delay-100">
            Resumes that<br />
            <span style={{ color: 'var(--accent)' }}>get you hired</span>
          </h1>

          <p className="mt-6 text-lg max-w-xl mx-auto animate-fade-up delay-200"
            style={{ color: 'var(--text-secondary)' }}>
            Build ATS-optimized resumes with real AI analysis, job matching, and professional templates. Stop guessing — start getting callbacks.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8 animate-fade-up delay-300">
            {user ? (
              <Link to="/dashboard" className="btn-primary px-6 py-3 text-sm">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn-primary px-6 py-3 text-sm">
                  Start for free →
                </Link>
                <Link to="/login" className="btn-ghost px-6 py-3 text-sm">
                  Sign in
                </Link>
              </>
            )}
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto animate-fade-up delay-400">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="font-display text-2xl font-bold" style={{ color: 'var(--accent)' }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="section-title">Features</p>
            <h2 className="font-display text-3xl font-bold">Everything you need to land your dream job</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <div key={f.title} className="card p-6 group hover:border-amber-500/30 transition-all duration-300"
                style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="text-2xl mb-3">{f.icon}</div>
                <h3 className="font-display font-semibold text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                  {f.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="card p-10" style={{ border: '1px solid var(--accent-border)', background: 'var(--accent-dim)' }}>
            <h2 className="font-display text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
              Ready to build your resume?
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              Join thousands of job seekers using AI to get more interviews.
            </p>
            <Link to="/register" className="btn-primary px-8 py-3 text-sm">
              Create your resume — free
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          © 2026 CVISION · Built with React + Node.js + OpenAI
        </p>
      </footer>
    </div>
  )
}
