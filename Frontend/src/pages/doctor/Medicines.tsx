import MainLayout from "@/components/layout/MainLayout";
import { API_BASE_URL } from "@/url";
import { Search, Pill } from "lucide-react";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 24;
const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="h-4 bg-gray-100 rounded-full w-3/4 mb-3" />
    <div className="h-3 bg-gray-100 rounded-full w-1/3" />
  </div>
);

const MedicinesPage = () => {
  const [search, setSearch] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("All");
  const [generics, setGenerics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);
  const navigate = useNavigate();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Core fetch — called with an explicit query string
  const fetchGenerics = useCallback(async (q: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/medicines/generics?q=${encodeURIComponent(q)}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch medicines");
      setGenerics(await res.json());
      setHasSearched(true);
    } catch (err) {
      setError(typeof err === "string" ? err : "Failed to load medicines");
    } finally {
      setLoading(false);
    }
  }, []);

  // When a letter is clicked, immediately fetch that letter's results
  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
    setSearch("");
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    fetchGenerics(letter === "All" ? "" : letter);
  };

  // When the search input changes, debounce the fetch
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setSelectedLetter("All");
    setPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.length === 0) {
      // cleared — show empty state again
      setGenerics([]);
      setHasSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchGenerics(value);
    }, 350);
  };

  // Clean up debounce on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current); }, []);

  // Reset page when results change
  useEffect(() => { setPage(1); }, [generics]);

  const totalPages = Math.max(1, Math.ceil(generics.length / PAGE_SIZE));
  const paginated = generics.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <MainLayout userType="doctor">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center flex-shrink-0">
            <Pill className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Medicines Directory</h1>
            <p className="text-sm text-gray-400">
              {hasSearched && !loading
                ? `${generics.length} generic${generics.length !== 1 ? "s" : ""} found`
                : "Search by name or browse by letter"}
            </p>
          </div>
        </div>

        {/* Search + alphabet filter */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
          {/* Search */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search generic name…"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-200 focus:border-sky-400 bg-white"
            />
          </div>

          {/* A–Z filter */}
          <div className="flex flex-wrap gap-1">
            {ALPHABET.map(letter => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedLetter === letter && !search
                    ? "bg-sky-500 text-white shadow-sm"
                    : "bg-gray-50 text-gray-500 border border-gray-100 hover:border-sky-300 hover:text-sky-600"
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
            {error}
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
          ) : !hasSearched ? (
            <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7 text-sky-300" />
              </div>
              <p className="text-gray-500 font-medium">Start searching</p>
              <p className="text-gray-400 text-sm mt-1">Type a medicine name or click a letter above</p>
            </div>
          ) : paginated.length === 0 ? (
            <div className="col-span-3 text-center py-16 bg-white rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Pill className="w-7 h-7 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No generics found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different search or letter</p>
            </div>
          ) : (
            paginated.map(generic => (
              <div
                key={generic.id}
                onClick={() => navigate(`/doctor/medicines/${generic.genericName}`, { state: { generic } })}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 cursor-pointer hover:border-sky-200 hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center flex-shrink-0 group-hover:bg-sky-500 transition-colors">
                    <Pill className="w-4 h-4 text-sky-500 group-hover:text-white transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-sky-600 transition-colors truncate">
                      {generic.genericName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {generic.medicines.length} brand{generic.medicines.length !== 1 ? "s" : ""} available
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && hasSearched && totalPages > 1 && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">
              Showing {Math.min((page - 1) * PAGE_SIZE + 1, generics.length)}–{Math.min(page * PAGE_SIZE, generics.length)} of {generics.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-500 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                return start + i;
              }).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    p === page
                      ? "bg-sky-500 text-white border-sky-500"
                      : "border-gray-200 text-gray-500 hover:border-sky-300 hover:text-sky-600"
                  }`}
                >{p}</button>
              ))}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-500 hover:border-sky-300 hover:text-sky-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MedicinesPage;
