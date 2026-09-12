import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import {
  Building2,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  Search,
  ArrowUpRight,
  Sparkles,
  GitBranch,
  Layers,
  ChevronRight,
  Filter
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

interface DepartmentSummary {
  total_faculty: number;
  total_publications: number;
  verified_publications: number;
  pending_review: number;
  flagged_records: number;
  total_citations: number;
  avg_citations_per_faculty: number;
  avg_publications_per_faculty: number;
  verification_rate: number;
  q1_q2_share: number;
}

interface PublicationTrend {
  year: number;
  publications: number;
  citations: number;
}

interface FacultyLeaderboardEntry {
  id: string;
  name: string;
  designation: string;
  email: string;
  publication_count: number;
  verified_count: number;
  citations: number;
  verification_rate: number;
  topics: string[];
  is_current_user?: boolean;
}

interface ResearchDomain {
  name: string;
  count: number;
  percentage: number;
}

interface PartnerDepartment {
  department: string;
  collaborations: number;
}

interface CollaborationInsights {
  internal_coauthorships: number;
  cross_department_links: number;
  top_partner_departments: PartnerDepartment[];
}

interface DepartmentIntelligenceData {
  department: string;
  all_departments: string[];
  summary: DepartmentSummary;
  publication_trends: PublicationTrend[];
  faculty_leaderboard: FacultyLeaderboardEntry[];
  research_domains: ResearchDomain[];
  collaboration_insights: CollaborationInsights;
  verification_breakdown: Record<string, number>;
  risk_breakdown: Record<string, number>;
}

interface DepartmentComparison {
  department: string;
  faculty_count: number;
  publication_count: number;
  verified_count: number;
  total_citations: number;
  avg_pubs_per_faculty: number;
  avg_citations_per_faculty: number;
  verification_rate: number;
  top_domain: string;
}

export default function Analytics() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState<string>('CSE');
  const [deptData, setDeptData] = useState<DepartmentIntelligenceData | null>(null);
  const [comparisons, setComparisons] = useState<DepartmentComparison[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'domains' | 'comparisons'>('overview');

  const isAdmin = ['super_admin', 'admin', 'research_admin', 'dept_admin'].includes(user?.role || '');

  const fetchData = useCallback(async (targetDepartment?: string) => {
    setLoading(true);
    try {
      const deptToQuery = targetDepartment || selectedDept;
      const [intelRes, compRes] = await Promise.all([
        api.get<DepartmentIntelligenceData>(`/api/v1/analytics/department-intelligence?department=${encodeURIComponent(deptToQuery)}`),
        api.get<DepartmentComparison[]>('/api/v1/analytics/department-comparisons')
      ]);

      setDeptData(intelRes.data);
      if (intelRes.data.department) {
        setSelectedDept(intelRes.data.department);
      }
      setComparisons(compRes.data || []);
    } catch (err) {
      console.error('Failed to load department intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDept]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDepartmentChange = (dept: string) => {
    setSelectedDept(dept);
    fetchData(dept);
  };

  const filteredFaculty = deptData?.faculty_leaderboard.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-gray-800/80 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-indigo-500 rounded-xl text-white shadow-md shadow-indigo-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                Department Analytics & Intelligence
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time research performance, publication trajectories, domain clusters, and cross-departmental benchmarking.
              </p>
            </div>
          </div>
        </div>

        {/* Action Bar / Department Selector */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1 shadow-sm">
              <span className="text-xs font-semibold px-2.5 text-gray-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> DEPT:
              </span>
              <div className="flex gap-1 overflow-x-auto">
                {(deptData?.all_departments || ['CSE', 'ACSE', 'EEE', 'MECH', 'Unknown']).map((dept) => (
                  <button
                    key={dept}
                    onClick={() => handleDepartmentChange(dept)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      selectedDept.toUpperCase() === dept.toUpperCase()
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">
                Department: {deptData?.department || 'Assigned Department'}
              </span>
            </div>
          )}

          <button
            onClick={() => fetchData()}
            disabled={loading}
            className="p-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm disabled:opacity-50"
            title="Refresh Intelligence Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800">
        {[
          { key: 'overview', label: 'Department Overview', icon: Layers },
          { key: 'leaderboard', label: 'Faculty Performance Roster', icon: Users },
          { key: 'domains', label: 'Research Specializations', icon: BookOpen },
          { key: 'comparisons', label: 'Institutional Comparisons', icon: GitBranch },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                isActive
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-t-lg'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Total Faculty */}
        <div className="glass-card p-5 bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Faculty Strength</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : deptData?.summary.total_faculty || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
            <span>In {deptData?.department || selectedDept}</span>
          </div>
        </div>

        {/* Total Publications */}
        <div className="glass-card p-5 bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Publications</span>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : deptData?.summary.total_publications || 0}
          </div>
          <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {deptData?.summary.verified_publications || 0} verified records
          </div>
        </div>

        {/* Citation Impact */}
        <div className="glass-card p-5 bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Citations</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-xl">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : deptData?.summary.total_citations || 0}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Avg {deptData?.summary.avg_citations_per_faculty || 0} / faculty
          </div>
        </div>

        {/* Verification Rate */}
        <div className="glass-card p-5 bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verification Rate</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : `${deptData?.summary.verification_rate || 0}%`}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Integrity confidence index
          </div>
        </div>

        {/* Productivity (Avg Pubs/Faculty) */}
        <div className="glass-card p-5 bg-white/70 dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700/60 rounded-2xl shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Productivity</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-gray-900 dark:text-white">
            {loading ? '...' : deptData?.summary.avg_publications_per_faculty || 0}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">
            Pubs / faculty member
          </div>
        </div>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Main Visual Trajectory Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trajectory Bar Chart */}
            <div className="lg:col-span-2 glass-card p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500" />
                    {deptData?.department} Research Publication Trajectory
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Yearly verified publications output and citation growth.
                  </p>
                </div>
                <div className="px-3 py-1 text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  {deptData?.publication_trends.length || 0} active years
                </div>
              </div>

              <div className="h-[280px] w-full">
                {deptData && deptData.publication_trends.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deptData.publication_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="year" stroke="#9CA3AF" fontSize={12} tickLine={false} />
                      <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          borderColor: '#374151',
                          borderRadius: '0.75rem',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                      <Bar dataKey="publications" name="Publications" fill="#4F46E5" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="citations" name="Citations" fill="#F59E0B" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-gray-400">
                    No publication trend data available for this department.
                  </div>
                )}
              </div>
            </div>

            {/* Quality & Integrity Mix */}
            <div className="glass-card p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Verification & Evidence Status
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                  Multi-agent provenance and attribution distribution.
                </p>

                <div className="space-y-3.5">
                  {/* Verified */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" /> Verified
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">
                        {deptData?.verification_breakdown.verified || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${((deptData?.verification_breakdown.verified || 0) / Math.max(deptData?.summary.total_publications || 1, 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Partially Verified */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-blue-500" /> Partially Verified
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">
                        {deptData?.verification_breakdown.partially_verified || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${((deptData?.verification_breakdown.partially_verified || 0) / Math.max(deptData?.summary.total_publications || 1, 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Needs Review */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-amber-500" /> Review Queue
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">
                        {deptData?.verification_breakdown.needs_review || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${((deptData?.verification_breakdown.needs_review || 0) / Math.max(deptData?.summary.total_publications || 1, 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>

                  {/* Unverified / Discovered */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-gray-400" /> Raw Discovered
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-bold">
                        {deptData?.verification_breakdown.unverified || 0}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gray-400 h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${((deptData?.verification_breakdown.unverified || 0) / Math.max(deptData?.summary.total_publications || 1, 1)) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-3.5 bg-gray-50 dark:bg-gray-900/40 border border-gray-200/60 dark:border-gray-700/60 rounded-xl flex items-center justify-between">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                  Total Managed Records
                </span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {deptData?.summary.total_publications} Works
                </span>
              </div>
            </div>
          </div>

          {/* Department Top Roster & Collaboration Highlights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Researchers Preview */}
            <div className="lg:col-span-2 glass-card p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    Top Research Faculty in {deptData?.department}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Ranked by verified publications and citation contributions.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  View Full Roster <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700/60">
                {deptData?.faculty_leaderboard.slice(0, 4).map((fac, idx) => (
                  <div
                    key={fac.id}
                    onClick={() => navigate(`/faculty/${fac.id}`)}
                    className="py-3.5 flex items-center justify-between hover:bg-gray-50/70 dark:hover:bg-gray-750 p-2 rounded-xl transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                        idx === 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                        idx === 1 ? 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                        idx === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        #{idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                          {fac.name}
                          {fac.is_current_user && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {fac.designation}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                          {fac.publication_count} pubs
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          {fac.verified_count} verified
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collaboration & Cross-Department Links */}
            <div className="glass-card p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                  <GitBranch className="w-4 h-4 text-purple-500" />
                  Collaboration Interlocks
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Intra-departmental & inter-departmental co-authorship.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-800/40 rounded-xl text-center">
                    <div className="text-xl font-black text-purple-700 dark:text-purple-300">
                      {deptData?.collaboration_insights.internal_coauthorships || 0}
                    </div>
                    <div className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-tight">
                      Internal Links
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-800/40 rounded-xl text-center">
                    <div className="text-xl font-black text-blue-700 dark:text-blue-300">
                      {deptData?.collaboration_insights.cross_department_links || 0}
                    </div>
                    <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-tight">
                      Cross-Dept Ties
                    </div>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Top Partner Departments:
                </div>
                <div className="space-y-2">
                  {deptData?.collaboration_insights.top_partner_departments.length ? (
                    deptData.collaboration_insights.top_partner_departments.map(p => (
                      <div
                        key={p.department}
                        className="flex items-center justify-between text-xs p-2 bg-gray-50 dark:bg-gray-900/40 rounded-lg border border-gray-200/50 dark:border-gray-800"
                      >
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{p.department}</span>
                        <span className="font-bold text-indigo-600 dark:text-indigo-400">{p.collaborations} co-authored</span>
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-gray-400 italic">No cross-department linkages found.</div>
                  )}
                </div>
              </div>

              <button
                onClick={() => navigate('/collaborations')}
                className="mt-4 w-full py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Open Collaboration Graph <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Full Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="glass-card p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Faculty Research Performance Roster — {deptData?.department}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                All {filteredFaculty.length} registered faculty ranked by publication productivity and verification integrity.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search faculty or domain..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4">Rank & Faculty</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Total Output</th>
                  <th className="py-3 px-4">Verified Works</th>
                  <th className="py-3 px-4">Total Citations</th>
                  <th className="py-3 px-4">Integrity Index</th>
                  <th className="py-3 px-4">Top Domains</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {filteredFaculty.map((fac, idx) => (
                  <tr
                    key={fac.id}
                    className={`hover:bg-gray-50/80 dark:hover:bg-gray-750 transition ${
                      fac.is_current_user ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-gray-400 text-xs">#{idx + 1}</span>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                            {fac.name}
                            {fac.is_current_user && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 rounded font-semibold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">{fac.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300 font-medium">
                      {fac.designation}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      {fac.publication_count}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {fac.verified_count}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                      {fac.citations}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full"
                            style={{ width: `${fac.verification_rate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {fac.verification_rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {fac.topics.map(t => (
                          <span
                            key={t}
                            className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-md text-[10px] font-medium"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/faculty/${fac.id}`)}
                        className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 font-semibold rounded-lg transition"
                      >
                        Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Research Specializations */}
      {activeTab === 'domains' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="glass-card p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                Department Research Domain Distribution
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Core specializations derived from faculty research profiles and publication keywords.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              {deptData?.research_domains.map(d => (
                <div key={d.name} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-200">{d.name}</span>
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                      {d.count} researchers ({d.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${d.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Emerging Interdisciplinary Opportunities
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                High-potential collaboration and grant tracks tailored to {deptData?.department}.
              </p>

              <div className="space-y-3">
                <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/40 rounded-xl">
                  <div className="text-xs font-bold text-indigo-900 dark:text-indigo-300">
                    Cross-Disciplinary AI & System Engineering
                  </div>
                  <div className="text-xs text-indigo-700 dark:text-indigo-400 mt-1">
                    Aligns with CSE machine learning specializations and EEE/MECH automation domains.
                  </div>
                </div>

                <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-800/40 rounded-xl">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    High-Impact Scopus / WoS Q1 Publication Drive
                  </div>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    {deptData?.summary.q1_q2_share}% of current works are Q1/Q2 indexed. Target: 65% across departmental cohorts.
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate('/opportunities')}
              className="mt-6 w-full py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
            >
              Browse Tailored Grants & Calls <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Institutional Comparisons */}
      {activeTab === 'comparisons' && (
        <div className="glass-card p-6 bg-white/80 dark:bg-gray-800/80 border border-gray-200/80 dark:border-gray-700/70 rounded-2xl shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <GitBranch className="w-5 h-5 text-indigo-600" />
              Institutional Cross-Departmental Benchmarking Matrix
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Comprehensive comparison of research output, citations, productivity, and top specializations across all departments.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-gray-900/60 text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Faculty Count</th>
                  <th className="py-3 px-4">Publication Output</th>
                  <th className="py-3 px-4">Verified Works</th>
                  <th className="py-3 px-4">Total Citations</th>
                  <th className="py-3 px-4">Productivity (Pubs/Fac)</th>
                  <th className="py-3 px-4">Verification Rate</th>
                  <th className="py-3 px-4">Primary Research Domain</th>
                  <th className="py-3 px-4 text-right">Drill-Down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {comparisons.map((c) => (
                  <tr
                    key={c.department}
                    className={`hover:bg-gray-50/80 dark:hover:bg-gray-750 transition ${
                      c.department.toUpperCase() === selectedDept.toUpperCase()
                        ? 'bg-indigo-50/40 dark:bg-indigo-950/20 font-semibold'
                        : ''
                    }`}
                  >
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-indigo-500" />
                      {c.department}
                    </td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">
                      {c.faculty_count}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white">
                      {c.publication_count}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      {c.verified_count}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-amber-600 dark:text-amber-400">
                      {c.total_citations}
                    </td>
                    <td className="py-3.5 px-4 text-purple-600 dark:text-purple-400 font-bold">
                      {c.avg_pubs_per_faculty}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 rounded font-semibold text-[11px]">
                        {c.verification_rate}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-300 font-medium">
                      {c.top_domain}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDepartmentChange(c.department)}
                        className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
