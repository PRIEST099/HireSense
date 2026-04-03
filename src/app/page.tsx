import Link from "next/link";
import {
  Brain,
  Upload,
  BarChart3,
  FileText,
  Users,
  Shield,
  Download,
  Sparkles,
  ArrowRight,
  CheckCircle,
  Briefcase,
  Zap,
  Target,
  ChevronRight,
} from "lucide-react";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Brain className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">HireSense AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">How It Works</a>
            <a href="#ai-transparency" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">AI Transparency</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link href="/register" className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float" />
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float animation-delay-200" />
      <div className="absolute bottom-10 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float animation-delay-400" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 mb-8">
            <Sparkles className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">AI-Powered Talent Screening</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            Hire smarter with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              AI-driven
            </span>{" "}
            insights
          </h1>

          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Screen, score, and shortlist candidates in minutes — not days.
            HireSense AI analyzes applicants against your requirements and delivers
            ranked results with full explanations, keeping you in control of every hiring decision.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-8 py-4 rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 text-lg"
            >
              Start Screening Free
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 font-medium px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors text-lg"
            >
              See How It Works
            </a>
          </div>

          <div className="flex items-center justify-center gap-6 mt-12 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> Screen up to 50 candidates</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-green-500" /> AI explanations included</span>
          </div>
        </div>

        {/* Hero mockup */}
        <div className="mt-20 max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-gray-400">hiresense.ai/jobs/screening-results</span>
            </div>
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Senior Software Engineer</h3>
                  <p className="text-sm text-gray-500">Apex Consulting Group &middot; 8 candidates screened</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">Completed</span>
              </div>

              {/* Mock results */}
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Emmanuel N.", score: 94, rec: "Strong Match", color: "green" },
                  { rank: 2, name: "Amina U.", score: 91, rec: "Strong Match", color: "green" },
                  { rank: 3, name: "Patrick N.", score: 87, rec: "Good Match", color: "blue" },
                  { rank: 4, name: "Grace I.", score: 82, rec: "Good Match", color: "blue" },
                ].map((r) => (
                  <div key={r.rank} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm font-bold text-gray-400 w-8">#{r.rank}</span>
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">
                      {r.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900 flex-1">{r.name}</span>
                    <div className="w-32 hidden sm:block">
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full animate-score-fill ${r.color === "green" ? "bg-green-500" : "bg-blue-500"}`}
                          style={{ width: `${r.score}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${r.color === "green" ? "text-green-600" : "text-blue-600"}`}>{r.score}</span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${r.color === "green" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                      {r.rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  const companies = ["TechCorp Africa", "Kigali Ventures", "DataFirst", "CloudScale", "InnoHub"];
  return (
    <section className="py-12 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-medium text-gray-400 uppercase tracking-wider mb-8">
          Trusted by recruiting teams at
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {companies.map((name) => (
            <span key={name} className="text-xl font-bold text-gray-300 hover:text-gray-400 transition-colors">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      icon: Briefcase,
      title: "Create a Job",
      description: "Define the role, required skills, experience level, and how you want candidates weighted. Set up takes under 2 minutes.",
      color: "blue",
    },
    {
      step: "02",
      icon: Upload,
      title: "Add Candidates",
      description: "Upload resumes as PDFs, import from CSV/Excel, or enter structured profiles directly. Our AI parses any format.",
      color: "purple",
    },
    {
      step: "03",
      icon: BarChart3,
      title: "AI Screens & Ranks",
      description: "HireSense scores each candidate on skills, experience, education, and culture fit, then ranks them with full explanations.",
      color: "green",
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Three steps to your shortlist
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From job posting to AI-ranked shortlist in minutes. No complex setup, no training required.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.step} className="relative">
              {i < 2 && (
                <div className="hidden md:block absolute top-16 left-full w-full">
                  <div className="flex items-center justify-center">
                    <ChevronRight className="h-6 w-6 text-gray-300 -ml-16" />
                  </div>
                </div>
              )}
              <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all h-full">
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl mb-6 ${
                  s.color === "blue" ? "bg-blue-100" : s.color === "purple" ? "bg-purple-100" : "bg-green-100"
                }`}>
                  <s.icon className={`h-7 w-7 ${
                    s.color === "blue" ? "text-blue-600" : s.color === "purple" ? "text-purple-600" : "text-green-600"
                  }`} />
                </div>
                <div className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">Step {s.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
                <p className="text-gray-600 leading-relaxed">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Scoring",
      description: "Each candidate is scored 0-100 across multiple dimensions using advanced AI models with anti-hallucination safeguards.",
      color: "blue",
    },
    {
      icon: FileText,
      title: "Smart Resume Parsing",
      description: "Upload PDFs and our AI extracts structured profiles automatically. No more manual data entry from resumes.",
      color: "purple",
    },
    {
      icon: Sparkles,
      title: "Explainable Results",
      description: "Every score comes with strengths, gaps, and reasoning. Know exactly why a candidate was ranked where they are.",
      color: "amber",
    },
    {
      icon: Shield,
      title: "Human-in-the-Loop",
      description: "AI recommends, you decide. Shortlist, reject, or mark for interview with one click. Full control stays with you.",
      color: "green",
    },
    {
      icon: Upload,
      title: "Flexible Import",
      description: "CSV, Excel, PDF resumes, or manual entry. Import candidates however you already have them — we handle the rest.",
      color: "rose",
    },
    {
      icon: Download,
      title: "Export & Share",
      description: "Export ranked results to CSV for your team or ATS. Share screening insights across your hiring pipeline.",
      color: "cyan",
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string }> = {
    blue: { bg: "bg-blue-100", icon: "text-blue-600" },
    purple: { bg: "bg-purple-100", icon: "text-purple-600" },
    amber: { bg: "bg-amber-100", icon: "text-amber-600" },
    green: { bg: "bg-green-100", icon: "text-green-600" },
    rose: { bg: "bg-rose-100", icon: "text-rose-600" },
    cyan: { bg: "bg-cyan-100", icon: "text-cyan-600" },
  };

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Everything you need to screen smarter
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Built for recruiters who want AI-powered efficiency without losing the human touch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f) => {
            const colors = colorMap[f.color];
            return (
              <div key={f.title} className="group p-6 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all">
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} mb-5`}>
                  <f.icon className={`h-6 w-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AITransparency() {
  const scores = [
    { label: "Skills Match", score: 92, color: "bg-blue-500" },
    { label: "Experience", score: 88, color: "bg-purple-500" },
    { label: "Education", score: 75, color: "bg-green-500" },
    { label: "Culture Fit", score: 85, color: "bg-amber-500" },
  ];

  return (
    <section id="ai-transparency" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
              Transparent AI you can trust
            </h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              No black boxes. Every candidate score breaks down into clear dimensions
              with specific strengths, gaps, and reasoning you can verify and act on.
            </p>

            <div className="space-y-4">
              {[
                { icon: Target, text: "Weighted scoring customized to your priorities" },
                { icon: Zap, text: "Anti-hallucination prompts ensure factual assessments" },
                { icon: Users, text: "Comparative ranking across your entire candidate pool" },
                { icon: Shield, text: "Confidence scores show how certain the AI is" },
              ].map((item) => (
                <div key={item.text} className="flex items-start gap-3">
                  <div className="bg-blue-100 p-1.5 rounded-lg mt-0.5">
                    <item.icon className="h-4 w-4 text-blue-600" />
                  </div>
                  <span className="text-gray-700">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score breakdown mockup */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                A
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Amina Uwimana</h4>
                <p className="text-sm text-gray-500">Senior Software Engineer &middot; 7 years</p>
              </div>
              <div className="ml-auto text-center">
                <p className="text-3xl font-bold text-green-600">91</p>
                <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-0.5 rounded-full">Strong Match</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {scores.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-600">{s.label}</span>
                    <span className="text-sm font-bold text-gray-900">{s.score}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${s.color} animate-score-fill`} style={{ width: `${s.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Strengths</p>
                <div className="flex flex-wrap gap-1.5">
                  {["Expert TypeScript", "Team leadership", "AWS Certified"].map((s) => (
                    <span key={s} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gaps</p>
                <div className="flex flex-wrap gap-1.5">
                  {["No GraphQL experience", "Limited Kubernetes"].map((g) => (
                    <span key={g} className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full font-medium">{g}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 bg-blue-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-blue-700 mb-1">AI Reasoning</p>
              <p className="text-sm text-blue-800 leading-relaxed">
                Strong full-stack profile with expert-level TypeScript and Node.js matching all core requirements.
                Team leadership and consulting experience align well with the client-facing nature of this role.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border border-white rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-white rounded-full" />
        <div className="absolute top-1/2 left-1/2 w-80 h-80 border border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6">
          Ready to transform your hiring?
        </h2>
        <p className="text-lg text-blue-100 max-w-2xl mx-auto mb-10">
          Join recruiting teams who screen candidates 10x faster with AI-powered insights.
          Start for free — no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg"
          >
            Get Started Free
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-8 py-4 rounded-xl hover:bg-white/10 transition-colors text-lg"
          >
            Sign in to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-white">HireSense AI</span>
            </div>
            <p className="text-sm leading-relaxed max-w-sm">
              AI-powered talent screening that augments your hiring decisions.
              Screen smarter, hire faster, stay in control.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#ai-transparency" className="hover:text-white transition-colors">AI Transparency</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} HireSense AI. Built for the Umurava AI Hackathon.</p>
          <p className="text-sm">Powered by Gemini + Claude AI</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-grain">
      <Navbar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Features />
      <AITransparency />
      <CTA />
      <Footer />
    </div>
  );
}
