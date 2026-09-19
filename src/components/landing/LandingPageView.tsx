import React, { useState } from 'react';
import {
  CheckCircle2,
  Calendar,
  BarChart3,
  Clock,
  ArrowRight,
  Shield,
  Zap,
  Target,
  Sparkles,
  ChevronDown,
  Layers,
  Star,
  Users,
  Smile,
  Compass,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWork } from '../../context/WorkContext';

interface LandingPageViewProps {
  onGetStarted: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({ onGetStarted }) => {
  const { user } = useAuth();
  const { setActiveTab } = useWork();

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleGoToDashboard = () => {
    if (user) {
      setActiveTab('dashboard');
    } else {
      onGetStarted();
    }
  };

  const features = [
    {
      icon: Target,
      title: 'Daily Focus & Rule of 3',
      description: 'Zero in on your 3 high-leverage daily goals with interactive micro-celebration animations and progress streaks.',
    },
    {
      icon: Calendar,
      title: 'Dynamic Weekly Planner',
      description: 'Plan out Monday through Sunday seamlessly with day-by-day task lists, completion tracking, and quick-add actions.',
    },
    {
      icon: BarChart3,
      title: 'Productivity Analytics',
      description: 'Gain clear visibility into completion rates, priority trends, and category distribution with interactive visual charts.',
    },
    {
      icon: Clock,
      title: 'Built-in Task Stopwatch',
      description: 'Accurately measure actual working time against estimates and automatically update task statuses while you execute.',
    },
    {
      icon: Layers,
      title: 'Smart Categories & Tags',
      description: 'Categorize your workload into Work, Study, Personal, Development, Meetings, Projects, and Health with custom color palettes.',
    },
    {
      icon: Zap,
      title: 'Instant Cloud Sync & Offline PWA',
      description: 'Works offline seamlessly with local cache and synchronizes in real time with Firestore as soon as you reconnect.',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Capture & Prioritize',
      desc: 'Add tasks with due dates, time estimates, priority levels, and custom categories in seconds.',
    },
    {
      step: '02',
      title: 'Plan & Execute',
      desc: 'Structure your day into Morning, Afternoon, and Evening blocks, and focus on your top 3 daily objectives.',
    },
    {
      step: '03',
      title: 'Analyze & Achieve',
      desc: 'Track completed milestones, review weekly productivity trends, and continuously optimize your work routine.',
    },
  ];

  const testimonials = [
    {
      quote: 'Daily Work Manager transformed how I structure my consulting hours. The Rule of 3 widget keeps me focused on what truly moves the needle.',
      name: 'Sarah Jenkins',
      role: 'Product Strategist',
      rating: 5,
    },
    {
      quote: 'The weekly planner and stopwatch combination gave our software team 25% better time estimation on sprint deliverable tasks.',
      name: 'Marcus Chen',
      role: 'Engineering Lead',
      rating: 5,
    },
    {
      quote: 'Clean, lightning fast, and works offline without losing anything. Best daily productivity tool I have used in years.',
      name: 'Elena Rostova',
      role: 'Creative Director',
      rating: 5,
    },
  ];

  const faqs = [
    {
      question: 'How does Daily Work Manager differ from basic to-do lists?',
      answer:
        'Daily Work Manager integrates structured time-blocking (Morning, Afternoon, Evening), a weekly planner, actual vs. estimated time tracking via an active stopwatch, and the proven Rule of 3 daily goal framework.',
    },
    {
      question: 'Does the application work offline?',
      answer:
        'Yes! Daily Work Manager utilizes persistent local caching and can be installed directly as a Progressive Web App (PWA) on desktop or mobile devices.',
    },
    {
      question: 'Can I create custom categories for my projects?',
      answer:
        'Absolutely. You can choose from standard categories like Work, Study, Personal, and Health, or create unlimited custom categories with personalized color palettes.',
    },
    {
      question: 'Is my data synchronized across devices?',
      answer:
        'Yes. With real-time Firestore synchronization, your tasks, timers, daily reports, and weekly planner stay in sync across all logged-in devices.',
    },
  ];

  return (
    <div id="landing-page" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white">
      {/* 1. Navigation Header */}
      <nav className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm shadow-indigo-500/30">
            W
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white font-['Outfit'] block leading-tight">
              Daily Work Manager
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Plan Better • Work Smarter • Achieve More
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGoToDashboard}
            className="px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            {user ? 'Open Workspace' : 'Sign In'}
          </button>
          <button
            id="landing-nav-get-started-btn"
            onClick={onGetStarted}
            className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm shadow-indigo-500/25 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 px-6 text-center max-w-5xl mx-auto overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Plan Better • Work Smarter • Achieve More</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight leading-[1.1] mb-6">
          Take Control of Your Day
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Organize your tasks, plan your schedule, track your productivity, and accomplish more every day.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="landing-hero-cta"
            onClick={onGetStarted}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            id="landing-hero-secondary-cta"
            onClick={handleGoToDashboard}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-sm font-bold shadow-xs transition-colors"
          >
            View Dashboard
          </button>
        </div>

        {/* Hero Interactive App Mockup Preview */}
        <div className="mt-14 p-2 rounded-3xl bg-slate-200/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs font-mono text-slate-400 ml-2">app.dailyworkmanager.com</span>
              </div>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-full">
                Live Preview
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Rule of 3 Focus</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  1. Launch Product Sprint v2
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-2">
                  ✓ Completed with Confetti
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Weekly Planner</span>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  Monday – Sunday Grid
                </p>
                <span className="text-[10px] text-indigo-600 font-semibold block mt-2">
                  85% Completed
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Task Stopwatch</span>
                <p className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 mt-1">
                  01:42:15 Active
                </p>
                <span className="text-[10px] text-slate-400 block mt-2">
                  Synced to Client Report
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Engineered for Modern Productivity
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Everything you need to organize your workday, eliminate deadline stress, and maintain high performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800 transition-all group"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] mb-2">
                  {f.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-20 px-6 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              How It Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              Three simple steps to build an invincible daily routine and hit your deadlines.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative">
                <span className="text-3xl font-black text-indigo-600/30 dark:text-indigo-400/30 font-['Outfit'] block mb-2">
                  {s.step}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-['Outfit'] mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Productivity & Analytics Spotlight */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 text-xs font-bold mb-3 border border-indigo-200 dark:border-indigo-800/60">
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Measurable Productivity</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight mb-4">
              Real Data to Improve Your Output
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Track completion rates, overdue backlogs, and time spent across Work, Development, Study, and Meetings. See exactly where your hours go and optimize your schedule every week.
            </p>
            <ul className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Productivity trend curves comparing daily output over time</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Actual vs. estimated duration ratio tracking</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Automated Daily & Weekly Report summaries ready for export</span>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                This Week's Completion Rate
              </span>
              <span className="text-xs font-bold text-indigo-600">88.5%</span>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full w-[88.5%]" />
            </div>
            <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Done</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">24</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Pending</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">3</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Time</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">18.5h</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials Section */}
      <section className="py-20 px-6 bg-slate-100/70 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
              Loved by Productive Professionals
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              See what creators, developers, and team leaders achieve with Daily Work Manager.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(t.rating)].map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic mb-4">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-900 dark:text-white font-['Outfit']">
                    {t.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section className="py-20 px-6 max-w-4xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-['Outfit'] tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Got questions? We've got answers.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(i)}
                className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-['Outfit']"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === i ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Call To Action (CTA) Section */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <div className="p-8 sm:p-12 rounded-3xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/25 relative overflow-hidden">
          <div className="relative z-10 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] tracking-tight mb-3">
              Start Planning Smarter Today
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100 mb-6 leading-relaxed">
              Join thousands of professionals who organize their daily work, hit high-leverage milestones, and build lasting productivity habits.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all active:scale-[0.98]"
              >
                Get Started Free
              </button>
              <button
                onClick={handleGoToDashboard}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs border border-indigo-400/40 transition-colors"
              >
                Open Workspace
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Requirement 28: Professional Footer */}
      <footer id="main-footer" className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                W
              </div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white font-['Outfit']">
                Daily Work Manager
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Plan Better • Work Smarter • Achieve More
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
            <button onClick={() => setActiveTab('dashboard')} className="hover:text-indigo-600 transition-colors">
              Dashboard
            </button>
            <button onClick={() => setActiveTab('today')} className="hover:text-indigo-600 transition-colors">
              Today's Tasks
            </button>
            <button onClick={() => setActiveTab('work')} className="hover:text-indigo-600 transition-colors">
              Tasks
            </button>
            <button onClick={() => setActiveTab('calendar')} className="hover:text-indigo-600 transition-colors">
              Calendar
            </button>
            <button onClick={() => setActiveTab('planner')} className="hover:text-indigo-600 transition-colors">
              Weekly Planner
            </button>
            <button onClick={() => setActiveTab('analytics')} className="hover:text-indigo-600 transition-colors">
              Analytics
            </button>
            <button onClick={() => setActiveTab('settings')} className="hover:text-indigo-600 transition-colors">
              Settings
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-slate-400">Privacy Policy</span>
            <span className="text-slate-400">Terms of Service</span>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400">
          © {new Date().getFullYear()} Daily Work Manager. All rights reserved.
        </div>
      </footer>
    </div>
  );
};
