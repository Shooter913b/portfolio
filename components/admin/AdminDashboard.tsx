"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  DEV_LOGIN,
  fetchAuthMe,
  logoutAdmin,
  startGitHubLogin,
} from "@/lib/admin/client";
import { AboutEditor } from "./AboutEditor";
import { LogEditor } from "./LogEditor";
import { ProfileEditor } from "./ProfileEditor";
import { ResumeEditor } from "./ResumeEditor";
import { SiteEditor } from "./SiteEditor";
import { SkillsEditor } from "./SkillsEditor";
import { TimelineEditor } from "./TimelineEditor";
import { Button } from "./AdminUi";

const TABS = [
  { id: "site", label: "Site" },
  { id: "profile", label: "Profile" },
  { id: "about", label: "About / Contact" },
  { id: "skills", label: "Skills" },
  { id: "timeline", label: "Timeline" },
  { id: "logs", label: "Logs" },
  { id: "resume", label: "Resume" },
] as const;

type TabId = (typeof TABS)[number]["id"];

const IS_DEV = process.env.NODE_ENV === "development";

export function AdminDashboard() {
  const searchParams = useSearchParams();
  const [login, setLogin] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabId>("site");
  const authError = searchParams.get("error");

  useEffect(() => {
    if (IS_DEV) {
      setLogin(DEV_LOGIN);
      setLoading(false);
      return;
    }

    fetchAuthMe()
      .then((session) => setLogin(session?.login ?? null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="p-8 text-[#8888a0]">Loading admin…</p>;
  }

  if (!login) {
    return (
      <div className="mx-auto max-w-md p-8">
        <h1 className="text-2xl font-semibold text-[#f0f0f5]">Portfolio admin</h1>
        <p className="mt-2 text-sm text-[#8888a0]">
          Sign in with GitHub to edit content. Changes commit to the repo and trigger a
          Netlify rebuild.
        </p>
        {authError && (
          <p className="mt-4 rounded border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-300">
            Auth error: {authError}
          </p>
        )}
        <Button onClick={startGitHubLogin} className="mt-6 px-4 py-2">
          Sign in with GitHub
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-[#111118] px-6 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-[#f0f0f5]">Portfolio admin</h1>
            <p className="text-sm text-[#8888a0]">
              Signed in as {login}
              {IS_DEV && " (local dev — no GitHub auth)"}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-md border border-white/15 px-3 py-2 text-sm text-[#c8c8d8] transition-colors hover:bg-white/5"
            >
              View site
            </Link>
            <Button
              variant="secondary"
              onClick={async () => {
                await logoutAdmin();
                setLogin(null);
              }}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-md px-3 py-1.5 text-sm transition-colors ${
                tab === item.id
                  ? "bg-[#00d4ff] text-[#0a0a0f]"
                  : "border border-white/15 bg-[#111118] text-[#c8c8d8] hover:bg-[#1a1a24]"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {tab === "site" && <SiteEditor />}
        {tab === "profile" && <ProfileEditor />}
        {tab === "about" && <AboutEditor />}
        {tab === "skills" && <SkillsEditor />}
        {tab === "timeline" && <TimelineEditor />}
        {tab === "logs" && <LogEditor />}
        {tab === "resume" && <ResumeEditor />}
      </div>
    </div>
  );
}
