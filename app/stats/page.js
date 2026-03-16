"use client";

import { useState, useEffect } from "react";
import { Eye, Download, RefreshCw, Clock, ArrowLeft, Lock } from "lucide-react";
import Link from "next/link";

export default function StatisticsDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");

  const fetchStats = async (p = password) => {
    setLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`/api/stats?password=${encodeURIComponent(p)}`);
      if (res.status === 401) {
        setAuthError("Incorrect access password.");
        setIsAuthenticated(false);
        setStats(null);
        return;
      }
      const data = await res.json();
      setStats(data);
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("eid_stats_password", p);
      }
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("eid_stats_password");
      if (saved) {
        setPassword(saved);
        fetchStats(saved);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    fetchStats();
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("eid_stats_password");
    }
    setIsAuthenticated(false);
    setStats(null);
    setPassword("");
  };

  if (loading && !stats && !authError && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-2 animate-pulse">
          <RefreshCw className="w-5 h-5 animate-spin" /> Loading stats...
        </div>
      </div>
    );
  }

  // --- Login Form ---
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white p-6">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800/80 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full filter blur-3xl opacity-40"></div>
          
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4 text-orange-400 border border-orange-500/20">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold">Access Required</h1>
            <p className="text-sm text-neutral-400 mt-1">Enter password to view analytics</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700/60 rounded-xl outline-none focus:border-orange-500/80 transition-shadow text-white placeholder-neutral-500"
                autoFocus
              />
              {authError && (
                <p className="text-red-400 text-xs mt-1 font-medium">{authError}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {loading && <RefreshCw className="w-4 h-4 animate-spin" />}
              {loading ? "Verifying..." : "View Dashboard"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/" className="text-xs text-neutral-500 hover:text-neutral-400 flex items-center justify-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back to Card Generator
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Authenticated Dashboard ---
  return (
    <div className="min-h-screen bg-neutral-950 text-white font-sans p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-start mb-12">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors mb-4 cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to Generator
            </Link>
            <h1 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-orange-400 to-amber-500">
              Analytics Dashboard
            </h1>
            <p className="text-neutral-400 mt-1">
              Tracking card generation and downloads performance
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchStats()}
              className="p-3 bg-neutral-800 hover:bg-neutral-700 active:bg-neutral-600 rounded-xl transition-all border border-neutral-700/50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={handleLogout}
              className="p-3 bg-red-950/30 hover:bg-red-950/50 text-red-400 rounded-xl transition-all border border-red-900/40 flex items-center justify-center gap-2 cursor-pointer text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full filter blur-3xl opacity-50"></div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-500/10 rounded-xl text-orange-400">
                <Eye className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400">Total Page Views</p>
                <h2 className="text-4xl font-black mt-1 text-neutral-200">
                  {stats?.views || 0}
                </h2>
              </div>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-8 relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full filter blur-3xl opacity-50"></div>
            <div className="flex items-center gap-4">
              <div className="p-4 bg-green-500/10 rounded-xl text-green-400">
                <Download className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400">Total Card Downloads</p>
                <h2 className="text-4xl font-black mt-1 text-neutral-200">
                  {stats?.downloads || 0}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-neutral-900 border border-neutral-800/50 rounded-2xl p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-400" /> Recent Activity Log
            </h3>
            <span className="text-xs text-neutral-500">Last 100 actions displayed</span>
          </div>

          {!stats?.actions || stats?.actions.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              No recent activity recorded yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 text-sm">
                    <th className="pb-3 font-medium">Action & Subject</th>
                    <th className="pb-3 font-medium">Timestamp</th>
                    <th className="pb-3 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {stats.actions.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                      <td className="py-4">
                        <div className="flex items-start gap-2">
                          {item.action === "download" ? (
                            <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-orange-400 mt-2"></div>
                          )}
                          <div className="flex flex-col">
                            <span className="capitalize font-medium text-neutral-200">
                              {item.action}
                            </span>
                            {item.name && (
                              <span className="text-xs text-neutral-400 mt-0.5">
                                <span className="text-white font-semibold">{item.name}</span>
                                {item.designation ? ` - ${item.designation}` : ""}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-neutral-400 text-sm">
                        {new Date(item.timestamp).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="py-4 text-right">
                        <span className="px-2 py-1 text-xs rounded-full bg-neutral-800 border border-neutral-800 font-medium text-neutral-400">
                          Success
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
