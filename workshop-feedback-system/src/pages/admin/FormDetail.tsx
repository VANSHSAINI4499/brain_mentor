import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  ArrowLeft, Download, Users, Star, Activity, Award, Search, ChevronLeft, ChevronRight, FileText, Mail, MessageCircle
} from 'lucide-react';
import { workshopService } from '../../services/workshopService';
import { submissionService } from '../../services/submissionService';
import type { Workshop } from '../../types/workshop';
import type { Submission } from '../../services/submissionService';
import { exportToCsv } from '../../utils/exportCsv';
import { formatDate, formatDateTime, safeDate } from '../../utils/date';
import { Button } from '../../components/shared/Button';
import { Loader } from '../../components/shared/Loader';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const FormDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [indexError, setIndexError] = useState(false);

  React.useEffect(() => {
    if (id) {
      Promise.all([
        workshopService.getWorkshopById(id),
        submissionService.getSubmissionsByWorkshop(id).catch(error => {
          console.error("Firestore Query Error:", error);
          if (error.message && error.message.includes('index')) {
            setIndexError(true);
          }
          return [];
        })
      ]).then(([workshopData, submissionsData]) => {
        setWorkshop(workshopData);
        setSubmissions(submissionsData);
        setLoading(false);
      }).catch(error => {
        console.error("Firestore Query Error:", error);
        setLoading(false);
      });
    }
  }, [id]);
  const itemsPerPage = 5;

  if (loading) {
    return <Loader fullScreen text="Loading analytics..." />;
  }

  if (indexError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-amber-600 bg-amber-50 rounded-xl border border-amber-200 m-6">
        <h2 className="text-xl font-bold mb-2">Indexing in Progress</h2>
        <p>Analytics data is still indexing. Please try again in a few minutes.</p>
        <Link to="/admin/dashboard" className="mt-4 text-indigo-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  if (!workshop) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Workshop Not Found</h2>
        <Link to="/admin/dashboard" className="text-indigo-600 hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  // Derived Analytics
  const totalResponses = submissions.length;
  const avgRating = totalResponses 
    ? (submissions.reduce((acc, curr) => acc + (curr.rating || 5), 0) / totalResponses).toFixed(1)
    : '0.0';
  const certsGenerated = submissions.filter(s => s.certificateStatus === 'sent').length;
  const completionRate = '100%'; // Assuming all fetched submissions are complete for now

  // Ratings Distribution
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => ({
    rating: `${rating} Stars`,
    count: submissions.filter(s => s.rating === rating).length
  }));

  // Course Distribution
  const courseDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    submissions.forEach(s => {
      counts[s.course] = (counts[s.course] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [submissions]);

  // Submissions Trend (mocking day-by-day based on the submittedAt timestamp)
  const submissionTrend = useMemo(() => {
    const trend: Record<string, number> = {};
    submissions.forEach(s => {
      const date = formatDate(safeDate(s.submittedAt), { month: 'short', day: 'numeric' });
      trend[date] = (trend[date] || 0) + 1;
    });
    return Object.entries(trend).map(([date, count]) => ({ date, count }));
  }, [submissions]);

  // Pagination & Filtering
  const filteredSubmissions = submissions.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalPages = Math.ceil(filteredSubmissions.length / itemsPerPage);
  const paginatedSubmissions = filteredSubmissions.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  const handleExport = () => {
    const exportData = submissions.map(s => ({
      Name: s.name,
      Email: s.email,
      Phone: s.phone,
      Course: s.course,
      Rating: s.rating,
      Feedback: s.feedback,
      'Certificate Status': s.certificateStatus,
      'Submitted At': formatDateTime(safeDate(s.submittedAt))
    }));
    exportToCsv(`${workshop.workshopName.replace(/\s+/g, '_')}_feedback.csv`, exportData);
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link to="/admin/dashboard" className="flex items-center text-sm text-slate-500 hover:text-indigo-600 mb-2 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
          <h2 className="text-2xl font-bold text-slate-800">{workshop.workshopName}</h2>
          <p className="text-slate-500">{workshop.collegeName}</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export Data
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Responses" value={totalResponses} icon={Users} color="bg-blue-50 text-blue-600" />
        <StatCard title="Average Rating" value={`${avgRating} / 5`} icon={Star} color="bg-amber-50 text-amber-500" />
        <StatCard title="Completion Rate" value={completionRate} icon={Activity} color="bg-indigo-50 text-indigo-600" />
        <StatCard title="Certs Generated" value={certsGenerated} icon={Award} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Ratings Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ratingCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="rating" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Course Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Course Distribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={courseDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {courseDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {courseDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center text-sm text-slate-600">
                <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                {entry.name} ({entry.value})
              </div>
            ))}
          </div>
        </motion.div>

        {/* Submission Trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Submission Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Feedback Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-lg font-bold text-slate-800">Recent Submissions</h3>
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {paginatedSubmissions.length > 0 ? paginatedSubmissions.map((sub, idx) => (
            <motion.div 
              key={sub.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="p-6 hover:bg-slate-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
                <div>
                  <h4 className="font-bold text-slate-900">{sub.name}</h4>
                  <div className="text-sm text-slate-500 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <span>{sub.email}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{sub.course}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${(sub.rating || 5) > i ? 'text-amber-400 fill-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge icon={FileText} status={sub.certificateStatus} title="Certificate" />
                    <StatusBadge icon={Mail} status={sub.emailStatus} title="Email" />
                    <StatusBadge icon={MessageCircle} status={sub.whatsappStatus} title="WhatsApp" />
                  </div>
                </div>
              </div>
              <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                "{sub.feedback}"
              </p>
            </motion.div>
          )) : (
            <div className="p-8 text-center text-slate-500">No submissions found matching your search.</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between bg-slate-50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredSubmissions.length)}</span> of <span className="font-medium">{filteredSubmissions.length}</span> entries
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </div>
);

export default FormDetail;

// Helper component for status badges
const StatusBadge = ({ icon: Icon, status, title }: { icon: any, status?: string, title: string }) => {
  let color = "text-slate-400 bg-slate-100";
  if (status === 'sent') color = "text-emerald-600 bg-emerald-100";
  if (status === 'processing') color = "text-amber-600 bg-amber-100";
  if (status === 'failed') color = "text-rose-600 bg-rose-100";

  return (
    <div title={`${title}: ${status || 'pending'}`} className={`p-1.5 rounded-full ${color} flex items-center justify-center`}>
      <Icon className="w-3.5 h-3.5" />
    </div>
  );
};

