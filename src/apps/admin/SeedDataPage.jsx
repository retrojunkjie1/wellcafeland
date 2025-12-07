// src/apps/admin/SeedDataPage.jsx
// Admin page for seeding sample Real Help data

import React, { useState } from "react";
import { Database, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { seedAllRealHelpData } from "@/utils/seedRealHelpData";
import PageHeader from "@/components/navigation/PageHeader";

const SeedDataPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const handleSeed = async () => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const seedResults = await seedAllRealHelpData();
      setResults(seedResults);
    } catch (err) {
      console.error("Seed error:", err);
      setError(err.message || "Failed to seed data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-white">
      <PageHeader
        title="Seed Real Help Data"
        subtitle="Populate sample resources for testing"
        showBack={true}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          {/* Info Card */}
          <div className="rounded-xl border border-blue-400/30 bg-blue-400/10 p-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-400/20 flex items-center justify-center">
                <Database className="h-5 w-5 text-blue-300" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-white mb-2">About This Tool</h2>
                <p className="text-sm text-white/70 mb-3">
                  This tool seeds sample data for the Real Help workspace, including:
                </p>
                <ul className="text-sm text-white/70 space-y-1 list-disc list-inside">
                  <li>Housing providers (sober living, transitional, emergency)</li>
                  <li>Grants and funding resources</li>
                  <li>Support programs (treatment, outpatient, government assistance)</li>
                  <li>Recovery circles (peer support communities)</li>
                </ul>
                <p className="text-sm text-white/60 mt-3">
                  <strong>Note:</strong> This will only seed data if collections are empty. Existing data will not be overwritten.
                </p>
              </div>
            </div>
          </div>

          {/* Seed Button */}
          <div className="rounded-xl border border-white/10 bg-white/5 p-6">
            <button
              onClick={handleSeed}
              disabled={loading}
              className="w-full px-6 py-3 rounded-lg bg-wcGold text-slate-950 font-medium hover:bg-wcGold/90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Seeding Data...</span>
                </>
              ) : (
                <>
                  <Database className="h-5 w-5" />
                  <span>Seed Real Help Data</span>
                </>
              )}
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-red-300 mb-1">Seed Failed</h3>
                  <p className="text-sm text-red-200/80">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="rounded-xl border border-green-400/30 bg-green-400/10 p-6">
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-green-300 mb-1">Seed Complete</h3>
                  <p className="text-sm text-green-200/80">Sample data has been added to the database.</p>
                </div>
              </div>

              <div className="space-y-3">
                {Object.entries(results).map(([key, result]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <span className="text-sm font-medium text-white capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm text-white/60">
                      {result.skipped ? (
                        <span className="text-yellow-300">Already seeded</span>
                      ) : result.ok ? (
                        <span className="text-green-300">✓ {result.count || 0} added</span>
                      ) : (
                        <span className="text-red-300">✗ Failed</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Steps */}
          {results && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-semibold text-white mb-3">Next Steps</h3>
              <ul className="text-sm text-white/70 space-y-2">
                <li>• Visit the <a href="/workspace/real-help" className="text-wcGold hover:underline">Real Help Workspace</a> to see the seeded data</li>
                <li>• Test search functionality with queries like "sober living California"</li>
                <li>• Try filtering by region and category</li>
                <li>• Test saving favorites and viewing details</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SeedDataPage;

