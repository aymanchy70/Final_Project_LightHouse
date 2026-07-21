import { Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import useAuth from '../hooks/useAuth';

interface Feature {
  icon: string;
  title: string;
  text: string;
}

interface Stat {
  value: string;
  label: string;
}

const features: Feature[] = [
  { icon: '📖', title: 'Vast Collection',   text: 'Explore thousands of books across every genre, era, and language — all in one place.' },
  { icon: '🔍', title: 'Smart Search',      text: 'Find books by title, author, publisher, or category with lightning-fast results.' },
  { icon: '📚', title: 'Multiple Editions', text: 'Track different editions, covers, and printings of your favourite titles.' },
  { icon: '🌟', title: 'Curated Lists',     text: 'Discover hand-picked reading lists crafted by our editorial team.' },
  { icon: '🔖', title: 'Personal Library',  text: 'Save books, track your reading progress and manage your wishlist.' },
  { icon: '✍️', title: 'Author Profiles',   text: 'Deep-dive into author biographies, their complete works, and timelines.' },
];

const stats: Stat[] = [
  { value: '50K+',  label: 'Books' },
  { value: '10K+',  label: 'Authors' },
  { value: '500+',  label: 'Publishers' },
  { value: '100K+', label: 'Readers' },
];

const BOOK_STACK_COLORS = ['#1a2235', '#1f2d45', '#243355'] as const;

const HomePage = (): JSX.Element => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="page-bg">
      <Navbar />

      {/* ── Hero ──────────────────────────────────── */}
      <section className="hero px-6">
        <div className="max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center py-20">

          {/* Left: copy */}
          <div className="animate-slide-up">
            <div className="hero__badge">
              <span>✦</span>
              {isAuthenticated
                ? `Welcome back, ${user?.email?.split('@')[0] ?? ''}`
                : 'Your digital library'}
            </div>

            <h1 className="hero__title">
              Every great story<br />
              begins with a{' '}
              <span>single page</span>
            </h1>

            <p className="hero__description">
              Bibliotheca is your gateway to an endless world of books — discover, track,
              and fall in love with reading all over again.
            </p>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary !w-auto !px-8">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn-primary !w-auto !px-8">
                    Start for Free
                  </Link>
                  <Link
                    to="/login"
                    className="btn-primary !w-auto !px-8"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(212,168,83,0.4)',
                      color: 'var(--gold-400)',
                    }}
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right: decorative book stack */}
          <div className="hidden lg:flex justify-center items-center animate-fade-in">
            <div className="relative w-72 h-80">
              {BOOK_STACK_COLORS.map((bg, i) => (
                <div
                  key={bg}
                  className="absolute rounded-lg"
                  style={{
                    width:     `${220 - i * 20}px`,
                    height:    `${260 - i * 20}px`,
                    background: bg,
                    border:    '1px solid rgba(212,168,83,0.2)',
                    top:       `${i * 12}px`,
                    left:      `${i * 10 + 20}px`,
                    transform: `rotate(${(i - 1) * 3}deg)`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                    display:   'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex:    3 - i,
                  }}
                >
                  {i === 0 && (
                    <div className="text-center p-6">
                      <p className="text-5xl mb-3">📚</p>
                      <p className="font-display text-cream-50 text-lg font-semibold leading-snug">
                        Your next<br />adventure<br />awaits
                      </p>
                      <div
                        className="mt-4 w-12 h-0.5 mx-auto"
                        style={{ background: 'var(--gold-400)' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────── */}
      <section
        className="py-10 px-6"
        style={{
          borderTop:    '1px solid rgba(212,168,83,0.1)',
          borderBottom: '1px solid rgba(212,168,83,0.1)',
        }}
      >
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="font-display text-3xl font-bold" style={{ color: 'var(--gold-400)' }}>
                {value}
              </p>
              <p className="text-sm mt-1 uppercase tracking-widest" style={{ color: 'rgba(253,250,244,0.45)' }}>
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="hero__badge inline-flex mx-auto mb-4">✦ Features</p>
            <h2 className="font-display text-4xl font-bold" style={{ color: 'var(--cream-50)' }}>
              Everything a reader needs
            </h2>
            <p className="mt-3 text-base" style={{ color: 'rgba(253,250,244,0.5)' }}>
              Built for book lovers, by book lovers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div key={f.title} className="feature-card">
                <div className="feature-card__icon">{f.icon}</div>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────── */}
      {!isAuthenticated && (
        <section className="py-20 px-6">
          <div
            className="max-w-3xl mx-auto rounded-2xl p-12 text-center"
            style={{
              background: 'linear-gradient(135deg, var(--navy-700) 0%, var(--navy-800) 100%)',
              border:     '1px solid rgba(212,168,83,0.25)',
              boxShadow:  'var(--shadow-gold)',
            }}
          >
            <p className="text-4xl mb-4">📖</p>
            <h2 className="font-display text-3xl font-bold mb-3" style={{ color: 'var(--cream-50)' }}>
              Ready to start reading?
            </h2>
            <p className="mb-8" style={{ color: 'rgba(253,250,244,0.55)' }}>
              Create your free account and access the full Bibliotheca collection today.
            </p>
            <Link to="/register" className="btn-primary !w-auto !px-12 inline-block">
              Get Started — It's Free
            </Link>
          </div>
        </section>
      )}

      {/* ── Footer ───────────────────────────────── */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid rgba(212,168,83,0.1)' }}>
        <p className="font-display text-lg mb-1" style={{ color: 'var(--gold-400)' }}>📚 Bibliotheca</p>
        <p className="text-xs" style={{ color: 'rgba(253,250,244,0.3)' }}>
          © {new Date().getFullYear()} Bibliotheca. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
