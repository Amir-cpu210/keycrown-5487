import { ArrowDown, ArrowRight, BookOpen, ChevronRight, Crown, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { useReducedMotion, motion } from "framer-motion";
import { demoText, tiers, tierNotes } from "./content";
import { TypingEngine } from "./engine";
import { DailyBanner, Eyebrow, features, tierIcons } from "./shared";
import { useCrown } from "./store";
export default function Home() {
  const osReduce = useReducedMotion(),
    reduced = useCrown((s) => s.settings.reduced) || osReduce;
  return (
    <>
      <section className="hero">
        <div className="hero-background" />
        <motion.div
          className="hero-copy"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <Eyebrow>
            <Crown size={14} /> THE TYPING ACADEMY
          </Eyebrow>
          <h1>
            Type with purpose.
            <br />
            <em>Earn your crown.</em>
          </h1>
          <p>
            From your first keystroke to your fastest run. Build speed,
            <br className="desktop-break" /> sharpen accuracy, and make every word count.
          </p>
          <div className="hero-actions">
            <Link className="btn primary" to="/practice">
              Start typing <ArrowRight size={17} />
            </Link>
            <Link className="btn secondary" to="/lessons">
              <BookOpen size={17} /> Explore lessons
            </Link>
          </div>
          <div className="hero-meta">
            <ShieldCheck size={14} /> Free to practice <i /> No account needed
          </div>
        </motion.div>
        <div className="hero-demo shell" id="live-demo">
          <TypingEngine text={demoText} kind="demo" label="Live demo" seconds={30} demo />
          <div className="demo-caption">
            <span>
              <i /> INTERACTIVE PREVIEW
            </span>
            <a href="#roadmap">
              Discover the academy <ArrowDown size={13} />
            </a>
          </div>
        </div>
      </section>
      <section className="roadmap-band" id="roadmap">
        <div className="shell">
          <div className="section-intro">
            <Eyebrow>THE PATH TO MASTERY</Eyebrow>
            <h2>Big gains, one key at a time.</h2>
            <p>
              Six stages take you from the home row to the Crown Test. Start at the beginning or
              take a placement test to find your level.
            </p>
          </div>
          <div className="roadmap-grid">
            {tiers.map((t, i) => {
              const Icon = tierIcons[i];
              return (
                <Link className="road-card surface" to={`/lessons#tier-${i}`} key={t}>
                  <span className="feature-icon">
                    <Icon size={19} />
                  </span>
                  <span className="micro">LEVEL 0{i + 1}</span>
                  <h3>{t}</h3>
                  <p>{tierNotes[i]}</p>
                  <ChevronRight className="road-arrow" size={16} />
                </Link>
              );
            })}
          </div>
          <div className="center">
            <Link className="btn secondary" to="/lessons">
              See the lesson roadmap <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      <section className="shell feature-section">
        <div className="section-intro">
          <Eyebrow>MAKE PRACTICE STICK</Eyebrow>
          <h2>Find your rhythm.</h2>
        </div>
        <div className="feature-grid">
          {features.map(({ icon: Icon, name, detail, to }) => (
            <Link className="surface feature-card" to={to} key={name}>
              <span className="feature-icon">
                <Icon size={20} />
              </span>
              <h3>{name}</h3>
              <p>{detail}</p>
              <ArrowRight size={18} />
            </Link>
          ))}
        </div>
        <DailyBanner />
      </section>
      <section className="closing">
        <div className="shell">
          <div className="feature-icon gold-icon">
            <Crown size={23} />
          </div>
          <h2>Your next personal best starts here.</h2>
          <Link className="btn primary" to="/practice">
            Start typing <ArrowRight size={17} />
          </Link>
        </div>
      </section>
    </>
  );
}
