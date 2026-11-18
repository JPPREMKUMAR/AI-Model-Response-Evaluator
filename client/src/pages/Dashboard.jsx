
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  LayoutDashboard,
  Plus,
  ClipboardList,
  Settings,
  Search,
  Trash2,
  Eye,
  Trophy,
  Clock,
  CheckCircle,
  BarChart3,
  LogOut,
  Menu,
  X,
  Filter,
  UserCircle,
} from "lucide-react";

import API from "../api/axios";
import Analytics from "../components/Analytics";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Fetch evaluations
  const fetchEvaluations = async () => {
    try {
      setLoading(true);

      const response = await API.get("/evaluations");

      setEvaluations(response.data.evaluations || []);
      setError("");
    } catch (err) {
      console.error("Failed to fetch evaluations:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load evaluations. Please check your backend server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvaluations();
  }, []);

  // Logout
  const handleLogout = () => {
    const confirmed = window.confirm(
      "Are you sure you want to logout?"
    );

    if (!confirmed) return;

    logout();
    navigate("/login", { replace: true });
  };

  // Delete evaluation
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this evaluation?"
    );

    if (!confirmed) return;

    try {
      await API.delete(`/evaluations/${id}`);

      setEvaluations((prev) =>
        prev.filter((evaluation) => evaluation._id !== id)
      );
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete evaluation.");
    }
  };

  // Available models
  const availableModels = [
    ...new Set(
      evaluations.flatMap(
        (evaluation) =>
          evaluation.responses?.map((response) => response.model) || []
      )
    ),
  ].filter(Boolean);

  // Search, filter, and sort evaluations
  const filteredEvaluations = evaluations
    .filter((evaluation) => {
      const query = searchQuery.toLowerCase();

      const matchesSearch =
        evaluation.prompt?.toLowerCase().includes(query) ||
        evaluation.responses?.some((response) =>
          response.model?.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "all" ||
        evaluation.status === statusFilter;

      const matchesModel =
        modelFilter === "all" ||
        evaluation.winner === modelFilter;

      return matchesSearch && matchesStatus && matchesModel;
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

  // Reset filters
  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setModelFilter("all");
    setSortOrder("newest");
  };

  // Get winner
  const getWinner = (evaluation) => {
    return evaluation.winner || "Not evaluated";
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Sidebar
  const Sidebar = () => (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-gray-800 bg-gray-950 transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0`}
    >
      <div className="flex h-full flex-col">

        {/* Logo */}
        <div className="flex items-center justify-between border-b border-gray-800 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Brain className="h-6 w-6 text-white" />
            </div>

            <div>
              <h1 className="text-lg font-bold text-white">
                AI Evaluator
              </h1>

              <p className="text-xs text-gray-500">
                Model Response Analysis
              </p>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-400 lg:hidden"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          <button
            onClick={() => {
              navigate("/");
              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-indigo-600 px-4 py-3 text-left text-white"
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>

          <button
            onClick={() => {
              navigate("/new-evaluation");
              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            <Plus size={20} />
            New Evaluation
          </button>

          <button
            onClick={() => {
              navigate("/");
              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            <ClipboardList size={20} />
            Evaluation History
          </button>

          <button
            onClick={() => {
              navigate("/");
              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            <BarChart3 size={20} />
            Analytics
          </button>

          <button
            onClick={() => {
              navigate("/");
              setSidebarOpen(false);
            }}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-gray-400 transition hover:bg-gray-800 hover:text-white"
          >
            <Settings size={20} />
            Settings
          </button>
        </nav>

        {/* User Profile & Logout */}
        <div className="mt-auto border-t border-gray-800 p-4">

          <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-900 p-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600/20">
              <UserCircle size={24} className="text-indigo-400" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user?.name || "User"}
              </p>

              <p className="truncate text-xs text-gray-400">
                {user?.email || ""}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );

  // Header
  const Header = () => (
    <header className="flex items-center justify-between border-b border-gray-800 bg-gray-950 px-6 py-4 lg:px-10">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-400 lg:hidden"
        >
          <Menu size={24} />
        </button>

        <div>
          <h2 className="text-xl font-semibold text-white">
            Dashboard
          </h2>

          <p className="text-sm text-gray-500">
            Overview of your AI model evaluations
          </p>
        </div>
      </div>

      <button
        onClick={() => navigate("/new-evaluation")}
        className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        <Plus size={18} />
        <span className="hidden sm:inline">New Evaluation</span>
      </button>
    </header>
  );

  // Welcome
  const Welcome = () => (
    <section className="rounded-2xl border border-gray-800 bg-gradient-to-r from-indigo-950 via-gray-900 to-gray-950 p-6 md:p-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-white md:text-3xl">
            Welcome, {user?.name || "User"} 👋
          </h2>

          <p className="mt-2 max-w-2xl text-gray-400">
            Compare AI model responses, evaluate performance,
            and discover which model delivers the best results.
          </p>
        </div>

        <button
          onClick={() => navigate("/new-evaluation")}
          className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700"
        >
          <Plus size={20} />
          Create Evaluation
        </button>
      </div>
    </section>
  );

  // Recent Evaluations
  const RecentEvaluations = () => (
    <section className="rounded-2xl border border-gray-800 bg-gray-900">
      <div className="border-b border-gray-800 p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Evaluation History
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Manage and filter your AI model comparisons
              </p>
            </div>

            <span className="rounded-full bg-gray-800 px-3 py-1 text-sm text-gray-400">
              {filteredEvaluations.length} results
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search prompts or models..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-gray-700 bg-gray-950 py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-indigo-500"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

            {/* Status */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Status
              </label>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="all">All statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Winner */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Winning Model
              </label>

              <select
                value={modelFilter}
                onChange={(e) => setModelFilter(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="all">All models</option>

                {availableModels.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-500">
                Sort by date
              </label>

              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full rounded-xl border border-gray-700 bg-gray-950 px-3 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>

            {/* Reset */}
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-700 px-3 py-2.5 text-sm text-gray-400 transition hover:border-indigo-500 hover:text-white"
              >
                <Filter size={16} />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-700 border-t-indigo-500" />

          <p className="mt-4 text-gray-400">
            Loading evaluations...
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-400">{error}</p>

          <button
            onClick={fetchEvaluations}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm text-white"
          >
            Retry
          </button>
        </div>
      ) : filteredEvaluations.length === 0 ? (
        <div className="p-12 text-center">
          <ClipboardList
            size={48}
            className="mx-auto text-gray-700"
          />

          <h3 className="mt-4 text-lg font-medium text-white">
            No evaluations found
          </h3>

          <p className="mt-2 text-sm text-gray-500">
            Try changing your search or filters.
          </p>

          <button
            onClick={clearFilters}
            className="mt-4 rounded-lg border border-gray-700 px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="divide-y divide-gray-800">
          {filteredEvaluations.map((evaluation) => (
            <div
              key={evaluation._id}
              className="flex flex-col gap-4 p-6 transition hover:bg-gray-950/50 md:flex-row md:items-center md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-white">
                  {evaluation.prompt}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(evaluation.createdAt)}
                  </span>

                  <span>
                    {evaluation.responses?.length || 0} Models
                  </span>

                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 ${
                      evaluation.status === "completed"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-yellow-500/10 text-yellow-400"
                    }`}
                  >
                    {evaluation.status === "completed" ? (
                      <CheckCircle size={12} />
                    ) : (
                      <Clock size={12} />
                    )}

                    {evaluation.status || "pending"}
                  </span>
                </div>

                {evaluation.status === "completed" && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-indigo-400">
                    <Trophy size={15} />

                    <span>
                      Winner: {getWinner(evaluation)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate(`/evaluation/${evaluation._id}`)
                  }
                  className="flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-300 transition hover:border-indigo-500 hover:text-white"
                >
                  <Eye size={16} />
                  View
                </button>

                <button
                  onClick={() => handleDelete(evaluation._id)}
                  className="rounded-lg border border-gray-700 p-2 text-gray-500 transition hover:border-red-500 hover:text-red-400"
                  title="Delete evaluation"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Sidebar />

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-72">
        <Header />

        <div className="space-y-8 p-6 lg:p-10">
          <Welcome />

          {/* Analytics */}
          <Analytics evaluations={evaluations} />

          {/* Evaluation History */}
          <RecentEvaluations />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
