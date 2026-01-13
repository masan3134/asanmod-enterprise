import React from "react";
import Link from "next/link";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-4">
            🚀 [PROJECT_NAME]
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Built with ASANMOD Enterprise Template v2.0
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Dashboard
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <FeatureCard
            icon="⚡"
            title="Next.js 15"
            description="App Router, Server Components, Streaming"
          />
          <FeatureCard
            icon="🔒"
            title="Type-Safe API"
            description="tRPC + Zod end-to-end type safety"
          />
          <FeatureCard
            icon="🗃️"
            title="Drizzle ORM"
            description="Lightweight, TypeScript-first database"
          />
        </div>

        {/* Quick Start */}
        <div className="bg-slate-800/50 rounded-xl p-8 backdrop-blur">
          <h2 className="text-2xl font-bold text-white mb-4">Quick Start</h2>
          <div className="space-y-2 font-mono text-sm">
            <CodeLine>npm run wizard</CodeLine>
            <CodeLine>npm run dev</CodeLine>
            <CodeLine>npm run verify</CodeLine>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-slate-800/50 rounded-xl p-6 backdrop-blur">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

function CodeLine({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-slate-900 text-green-400 px-4 py-2 rounded">
      $ {children}
    </div>
  );
}
