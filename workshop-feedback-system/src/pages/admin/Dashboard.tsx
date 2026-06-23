import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  BarChart, Calendar, CheckCircle, Clock, Copy, Edit, 
  Search, Filter 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { workshopService } from '../../services/workshopService';
import { mockSubmissions } from '../../data/mockSubmissions';
import type { Workshop } from '../../types/workshop';
import { exportToCsv } from '../../utils/exportCsv';
import { formatDate } from '../../utils/date';
import { Button } from '../../components/shared/Button';

const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'inactive'>('all');
  const [workshops, setWorkshops] = useState<Workshop[]>([]);

  React.useEffect(() => {
    workshopService.getAllWorkshops().then(data => {
      setWorkshops(data);
    });
  }, []);

  // Derived stats
  const totalSubmissions = mockSubmissions.length;
  const pendingCerts = mockSubmissions.filter(s => s.certificateStatus === 'pending').length;
  const sentCerts = mockSubmissions.filter(s => s.certificateStatus === 'sent').length;

  // Filtered workshops
  const filteredWorkshops = useMemo(() => {
    return workshops.filter(w => {
      const matchesSearch = w.workshopName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            w.collegeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesStatus;
    }).sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  }, [workshops, searchTerm, statusFilter]);

  const handleCopyLink = (formLink: string) => {
    const url = `${window.location.origin}/form/${formLink}`;
    navigator.clipboard.writeText(url);
    toast.success('Form link copied to clipboard!');
  };

  const handleExport = () => {
    const exportData = filteredWorkshops.map(w => ({
      'Workshop Name': w.workshopName,
      'College': w.collegeName,
      'Status': w.status,
      'Date': formatDate(w.dateTime),
      'Submissions': mockSubmissions.filter(s => s.workshopId === w.id).length
    }));
    exportToCsv('workshops_export.csv', exportData);
    toast.success('Export downloaded successfully!');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Dashboard</h2>
          <p className="text-slate-500">Overview of your workshops and feedback</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            Export CSV
          </Button>
          <Link to="/admin/create">
            <Button>Create Workshop</Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Workshops" value={workshops.length} icon={Calendar} color="bg-blue-50 text-blue-600" />
        <StatCard title="Total Submissions" value={totalSubmissions} icon={BarChart} color="bg-indigo-50 text-indigo-600" />
        <StatCard title="Pending Certificates" value={pendingCerts} icon={Clock} color="bg-amber-50 text-amber-600" />
        <StatCard title="Certificates Sent" value={sentCerts} icon={CheckCircle} color="bg-emerald-50 text-emerald-600" />
      </div>

      {/* Filters and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
          <div className="relative w-full sm:w-72">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text"
              placeholder="Search workshops..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-5 h-5 text-slate-400" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="border border-slate-200 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                <th className="px-6 py-4 font-medium">Workshop</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Submissions</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorkshops.map((workshop, idx) => {
                const subCount = mockSubmissions.filter(s => s.workshopId === workshop.id).length;
                return (
                  <motion.tr 
                    key={workshop.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{workshop.workshopName}</div>
                      <div className="text-sm text-slate-500">{workshop.collegeName}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">
                      {formatDate(workshop.dateTime, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        workshop.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        workshop.status === 'draft' ? 'bg-slate-100 text-slate-800' :
                        'bg-rose-100 text-rose-800'
                      }`}>
                        {workshop.status === 'active' && <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                        {workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {subCount}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {workshop.id && (
                          <button 
                            onClick={() => handleCopyLink(workshop.id)}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Copy Form Link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        )}
                        <Link to={`/admin/forms/${workshop.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Analytics">
                            <BarChart className="w-4 h-4" />
                          </button>
                        </Link>
                        <Link to={`/admin/create?edit=${workshop.id}`}>
                          <button className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Edit Workshop">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {filteredWorkshops.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No workshops found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4"
  >
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
    </div>
  </motion.div>
);

export default Dashboard;
