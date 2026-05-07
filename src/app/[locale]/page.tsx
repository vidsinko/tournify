import Link from "next/link";
import { Trophy, Zap, Users, BarChart3, Calendar, ArrowRight } from "lucide-react";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <header className="px-6 h-14 flex items-center justify-between border-b border-gray-100 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 bg-brand-600 rounded-lg flex items-center justify-center">
            <Trophy className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">Tournify</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/${locale}/auth/login`} className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
            Sign in
          </Link>
          <Link href={`/${locale}/dashboard`} className="text-sm bg-brand-600 hover:bg-brand-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors">
            Get started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center gap-2 bg-live-50 border border-live-200 text-live-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live-500 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-live-500" />
            </span>
            2 tournaments live right now
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight mb-4">
            Run your tournament<br />
            <span className="text-brand-600">from your pocket.</span>
          </h1>

          <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
            Score entry, standings, live updates, QR sharing — built for tournament day.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
            <Link
              href={`/${locale}/dashboard`}
              className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/${locale}/t/spring-cup-2025`}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              View Live Demo
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {[
              { icon: Zap, label: "Live Scores", desc: "Enter results instantly", color: "bg-live-50 text-live-600" },
              { icon: BarChart3, label: "Standings", desc: "Auto-calculated", color: "bg-brand-50 text-brand-600" },
              { icon: Users, label: "Teams", desc: "Manage rosters", color: "bg-purple-50 text-purple-600" },
              { icon: Calendar, label: "Schedule", desc: "Smart scheduling", color: "bg-amber-50 text-amber-600" },
            ].map(({ icon: Icon, label, desc, color }) => (
              <div key={label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <div className={`h-8 w-8 rounded-lg ${color} flex items-center justify-center mb-2`}>
                  <Icon className="h-4 w-4" />
                </div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="text-center py-6 text-xs text-gray-400 border-t border-gray-100">
        © 2025 Tournify — Built for sports organizers
      </footer>
    </div>
  );
}
