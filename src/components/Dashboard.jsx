import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Upload,
  BarChart3,
  AlertTriangle,
  Calendar,
  Target,
  Lightbulb,
  User,
  Settings,
  LogOut,
  Bell,
  Search,
  TrendingUp,
  TrendingDown,
  BookOpen,
  ChevronRight,
  FileText,
  Plus,
  Loader2,
  CheckCircle2,
  Zap,
  Clock,
  ArrowUpRight,
  Sparkles,
  SearchCode,
  Mail,
  ChevronDown,
  ArrowRight,
  Download,
  Trash2
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend
} from 'recharts';
import { auth } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { analyzeDocument, fetchAnalysisHistory, downloadInsightsReport, deleteAnalysis } from '../services/VisionService';

// --- Types & Initial Data ---

// USER REQUEST: Start with no local input (empty state)
const INITIAL_RECORDS = [];

const COLORS = ['#6A89A7', '#88BDF2', '#384959', '#FBBF24', '#F87171', '#10B981'];

// --- Helper Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick, darkMode }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
      ? (darkMode ? 'bg-ll-blue text-white shadow-lg shadow-ll-blue/20' : 'bg-ll-dark text-white shadow-lg shadow-ll-dark/20')
      : (darkMode ? 'text-slate-400 hover:bg-slate-700 hover:text-white' : 'text-gray-500 hover:bg-slate-100 hover:text-ll-dark')
      }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
    <span className="font-semibold text-sm whitespace-nowrap overflow-hidden">{label}</span>
  </button>
);

const Card = ({ children, className = "" }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 ${className}`}
  >
    {children}
  </motion.div>
);

const EmptyState = ({ onUploadClick, title = "No Data Found", description = "Please upload your marksheet to trigger the Hybrid Intelligence analysis engine. Your insights will appear here live." }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-5 duration-700">
    <div className="w-24 h-24 bg-ll-pale-blue/20 rounded-full flex items-center justify-center text-ll-blue mb-6 border-4 border-white shadow-xl">
      <FileText className="w-10 h-10" />
    </div>
    <h3 className="text-2xl font-semibold mb-2">{title}</h3>
    <p className="text-slate-500 max-w-sm font-medium mb-8 leading-relaxed">{description}</p>
    <button
      onClick={onUploadClick}
      className="flex items-center gap-2 px-8 py-4 bg-ll-dark hover:bg-ll-blue text-white rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg group"
    >
      <Upload className="w-5 h-5" /> Upload File
    </button>
  </div>
);

// --- Main Views ---

const HistoryView = ({ records, onUploadClick, onDeleteRecord, darkMode }) => {
  if (records.length === 0) return <EmptyState onUploadClick={onUploadClick} title="No Records" description="You haven't uploaded any marksheets yet. Start by uploading your first one!" />;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Academic History</h2>
        <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage all your analyzed marksheets and records</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {records.map((rec, i) => (
          <Card key={i} className={`p-0 overflow-hidden border ${darkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100'} hover:shadow-md transition-all`}>
            <div className="flex flex-col sm:flex-row items-stretch">
              <div className={`p-8 flex items-center justify-center ${darkMode ? 'bg-slate-900/50' : 'bg-ll-pale-blue/10'} border-r ${darkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-slate-800 text-ll-blue' : 'bg-white text-ll-dark'} shadow-sm`}>
                  <FileText className="w-8 h-8" />
                </div>
              </div>
              <div className="p-8 flex-grow flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{rec.semester}</h4>
                    <span className="px-3 py-1 bg-ll-blue/10 text-ll-blue text-[10px] font-black uppercase rounded-full">{rec.date}</span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{rec.institution}</p>
                </div>
                
                <div className="flex items-center gap-10">
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Score</p>
                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-ll-blue'}`}>{rec.sgpa}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Subjects</p>
                    <p className={`text-2xl font-black ${darkMode ? 'text-white' : 'text-slate-700'}`}>{rec.subjects.length}</p>
                  </div>
                  <div className="flex gap-3 ml-4">
                    <button 
                      onClick={() => downloadInsightsReport(rec)}
                      className={`p-3 rounded-xl ${darkMode ? 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-50 hover:bg-slate-100 text-slate-500'} transition-all`}
                      title="Download PDF"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => {
                        if (window.confirm('Delete this record permanently from Firebase?')) {
                          onDeleteRecord(rec.id);
                        }
                      }}
                      className="p-3 bg-red-50 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                      title="Delete Record"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
        
        <div 
          onClick={onUploadClick}
          className={`p-12 border-4 border-dashed rounded-[3rem] flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${darkMode ? 'border-slate-800 hover:bg-slate-800/30' : 'border-slate-100 hover:bg-ll-pale-blue/5 hover:border-ll-blue'} group`}
        >
          <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-300'} group-hover:scale-110 group-hover:bg-ll-blue group-hover:text-white`}>
            <Plus className="w-8 h-8" />
          </div>
          <span className={`text-sm font-bold tracking-widest uppercase ${darkMode ? 'text-slate-500' : 'text-gray-400'} group-hover:text-ll-blue`}>Upload New Record</span>
        </div>
      </div>
    </div>
  );
};

const OverviewView = ({ records, user, onUploadClick, onDeleteRecord }) => {
  if (records.length === 0) return <EmptyState onUploadClick={onUploadClick} title="No Data Uploaded" description="You don't have any past data. Please upload your marksheet to get started." />;

  const latestRec = records[records.length - 1];
  const prevRec = records.length > 1 ? records[records.length - 2] : null;

  const subjects = latestRec.subjects || [];
  if (subjects.length === 0) return <EmptyState onUploadClick={onUploadClick} title="No Subjects Found" description="The AI could not extract subjects from your document. Try uploading a clearer image." />;

  const avgMarks = Math.round(subjects.reduce((a, b) => a + (Number(b.marks) || 0), 0) / subjects.length);
  const strongest = [...subjects].sort((a, b) => b.marks - a.marks)[0];
  const weakSubjects = subjects.filter(s => s.performance === 'Weak' || s.marks < 50);
  const weakest = [...weakSubjects].sort((a, b) => a.marks - b.marks)[0] || [...subjects].sort((a, b) => a.marks - b.marks)[0];
  const improvement = prevRec ? ((latestRec.sgpa - prevRec.sgpa) / prevRec.sgpa * 100).toFixed(1) : 0.0;

  const nextSgpa = Math.min(10, latestRec.sgpa + (prevRec ? (latestRec.sgpa - prevRec.sgpa) : 0.1)).toFixed(2);

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-ll-pale-blue rounded-2xl text-ll-dark">
              <BarChart3 className="w-6 h-6" />
            </div>
            {prevRec && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${parseFloat(improvement) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {parseFloat(improvement) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {improvement}%
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Latest Average</p>
          <p className="text-2xl font-bold">{avgMarks}%</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Strongest Point</p>
          <p className="text-2xl font-bold truncate">{strongest.name}</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-1 rounded-full">{weakSubjects.length} Weak Areas</span>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Weakest Subject</p>
          <p className="text-2xl font-bold truncate">{weakest.name}</p>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Predicted Next SGPA</p>
          <p className="text-2xl font-bold">{nextSgpa}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 hover:shadow-xl transition-all duration-300">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h3 className="text-xl font-bold text-slate-800">Performance Velocity</h3>
              <p className="text-xs font-medium text-slate-400 mt-1">Academic momentum tracking across semesters</p>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={records}>
                <defs>
                  <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6A89A7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6A89A7" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="semester"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                  dy={10}
                />
                <YAxis
                  domain={[0, 10]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'bold' }}
                />
                <Tooltip
                  contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px -5px rgba(0,0,0,0.1)', padding: '15px' }}
                  itemStyle={{ fontWeight: 'black', fontSize: '14px', color: '#384959' }}
                  labelStyle={{ fontWeight: 'black', marginBottom: '5px' }}
                />
                <Area
                  type="monotone"
                  dataKey="sgpa"
                  name="SGPA Score"
                  stroke="#6A89A7"
                  strokeWidth={5}
                  fillOpacity={1}
                  fill="url(#colorSgpa)"
                  dot={{ r: 7, fill: '#6A89A7', strokeWidth: 4, stroke: '#fff' }}
                  activeDot={{ r: 10, strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="flex flex-col hover:shadow-2xl transition-all duration-500">
          <h3 className="text-2xl font-display font-black mb-6 italic">History</h3>
          <div className="flex-grow space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            {records.map((rec, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group/item relative overflow-hidden">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-ll-dark shadow-sm">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold truncate max-w-[100px]">{rec.semester}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">{rec.institution}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-black text-ll-blue">{rec.sgpa}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{rec.subjects.length} Subjs</p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this analysis? This will remove it from Firebase permanently.')) {
                        onDeleteRecord(rec.id);
                      }
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            <div onClick={onUploadClick} className="flex items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-3xl hover:border-ll-blue hover:bg-ll-pale-blue/5 transition-all cursor-pointer group">
              <Plus className="w-6 h-6 text-slate-300 group-hover:text-ll-blue group-hover:scale-110 transition-all" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-display font-black flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-500" /> Improvement Areas
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-left border-b border-slate-50">
                <tr>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2">Subject Name</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 text-center">Marks</th>
                  <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {latestRec.subjects.filter(s => s.marks < 65).length > 0 ? (
                  latestRec.subjects.filter(s => s.marks < 65).map((s, i) => (
                    <tr key={i} className="group hover:bg-slate-50 transition-colors">
                      <td className="py-4 font-bold text-sm px-2">{s.name}</td>
                      <td className="py-4 text-center px-2">
                        <span className={`text-sm font-black ${s.marks < 50 ? 'text-red-500' : 'text-amber-500'}`}>{s.marks}%</span>
                      </td>
                      <td className="py-4 text-center px-2">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${s.marks < 50 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                          {s.marks < 50 ? 'Critical' : 'Attention'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-gray-400 font-bold italic">No weak subjects detected.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-ll-blue opacity-10">
            <Calendar className="w-32 h-32" />
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-ll-light-blue" /> Study Roadmap
            </h3>
            <div className="space-y-4 flex-grow">
              {weakest.marks < 60 ? (
                <div className="p-5 bg-white/5 rounded-2xl border-l-4 border-red-500">
                  <p className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-1 italic">Focus Required</p>
                  <p className="text-sm font-bold">{weakest.name} Mastery</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Scores indicate high priority revision needed.</p>
                </div>
              ) : (
                <div className="p-5 bg-white/5 rounded-2xl border-l-4 border-emerald-500">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Elite Performance</p>
                  <p className="text-sm font-bold">Advanced Certifications</p>
                  <p className="text-xs text-slate-400 mt-2 font-medium">Maintain streak with peer-mentoring sessions.</p>
                </div>
              )}
            </div>
            <button className="mt-8 py-4 bg-ll-blue hover:bg-ll-light-blue text-white rounded-2xl font-black transition-all text-xs tracking-widest uppercase">
              Full Schedule View
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
};

const AnalysisView = ({ records, onUploadClick }) => {
  if (records.length === 0) return <EmptyState onUploadClick={onUploadClick} title="Analysis Blocked" description="Upload a marksheet to see grade distribution and subject breakdowns." />;

  const latestRec = records[records.length - 1];
  const allSubjects = records.flatMap(r => r.subjects.map(s => ({ ...s, semester: r.semester })));
  const gradeCount = allSubjects.reduce((acc, s) => {
    acc[s.grade] = (acc[s.grade] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(gradeCount).map(([name, value]) => ({ name, value }));

  // Radar Data: Subject scores normalized to 100
  const radarData = latestRec.subjects.map(s => ({
    subject: s.name.length > 10 ? s.name.substring(0, 10) + '...' : s.name,
    A: s.marks,
    fullMark: 100,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3 text-slate-800">
            <TrendingUp className="w-5 h-5 text-ll-blue" />
            Subject Mastery Profile
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#f1f5f9" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'medium' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Proficiency"
                  dataKey="A"
                  stroke="#384959"
                  strokeWidth={2}
                  fill="#6A89A7"
                  fillOpacity={0.4}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-center font-bold text-gray-400 uppercase tracking-widest mt-4">Multi-Dimensional Performance Analysis</p>
        </Card>

        <Card className="hover:shadow-xl transition-shadow duration-300">
          <h3 className="text-lg font-bold mb-8 flex items-center gap-3 text-slate-800">
            <BookOpen className="w-5 h-5 text-ll-blue" />
            Grade Distribution
          </h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="text-lg font-bold mb-8 text-slate-800">Subject Breakdown (Normalized)</h3>
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={latestRec.subjects}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'medium' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 'medium' }} />
                <Tooltip
                  cursor={{ fill: 'rgba(106, 137, 167, 0.05)' }}
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="marks" radius={[8, 8, 0, 0]} barSize={40}>
                  {latestRec.subjects.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.marks < 50 ? '#F87171' : entry.marks > 85 ? '#10B981' : '#6A89A7'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

const WeeklySchedule = ({ weakest, subjects, freeTime }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const otherSubject = subjects.find(s => s.name !== weakest.name) || { name: 'Core Review' };

  const schedule = {
    [`Morning (${freeTime.morning})`]: [
      { day: 'Mon', task: weakest.name, type: 'Deep Focus' },
      { day: 'Tue', task: 'Core Concepts', type: 'Review' },
      { day: 'Wed', task: weakest.name, type: 'Deep Focus' },
      { day: 'Thu', task: otherSubject.name, type: 'Application' },
      { day: 'Fri', task: weakest.name, type: 'Test Prep' },
      { day: 'Sat', task: 'Mock Exam', type: 'Simulation' },
      { day: 'Sun', task: 'Reflection', type: 'Planning' },
    ],
    [`Afternoon (${freeTime.afternoon})`]: [
      { day: 'Mon', task: otherSubject.name, type: 'Practice' },
      { day: 'Tue', task: weakest.name, type: 'Problem Solving' },
      { day: 'Wed', task: 'Lab/Practical', type: 'Tech' },
      { day: 'Thu', task: weakest.name, type: 'Group Study' },
      { day: 'Fri', task: 'General Studies', type: 'Reading' },
      { day: 'Sat', task: 'Skill Lab', type: 'Creative' },
      { day: 'Sun', task: 'Rest', type: 'Recovery' },
    ],
    [`Evening (${freeTime.evening})`]: [
      { day: 'Mon', task: 'Flashcards', type: 'Active Recall' },
      { day: 'Tue', task: 'Note Review', type: 'Revision' },
      { day: 'Wed', task: 'Quiz Session', type: 'Evaluation' },
      { day: 'Thu', task: 'Flashcards', type: 'Active Recall' },
      { day: 'Fri', task: 'Weekly Recap', type: 'Summary' },
      { day: 'Sat', task: 'Light Review', type: 'Maintenance' },
      { day: 'Sun', task: 'Mindfulness', type: 'Relax' },
    ]
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-1 space-y-4">
          {Object.keys(schedule).map((slot, idx) => (
            <div key={idx} className="h-32 flex flex-col justify-center px-6 bg-slate-900 text-white rounded-[2rem] shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-ll-pale-blue mb-1">{slot.split(' ')[0]}</p>
              <p className="font-display font-black text-sm">{slot.split(' ').slice(1).join(' ')}</p>
            </div>
          ))}
        </div>
        <div className="md:col-span-3 overflow-x-auto pb-4 custom-scrollbar">
          <div className="flex gap-4 min-w-[800px]">
            {days.map((day, idx) => (
              <div key={idx} className="flex-1 space-y-4">
                <div className="py-3 text-center border-b-2 border-slate-100 mb-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{day.substr(0, 3)}</p>
                </div>
                {Object.values(schedule).map((slots, sIdx) => (
                  <div key={sIdx} className={`h-32 p-4 rounded-[2rem] border border-slate-100 flex flex-col justify-between transition-all hover:shadow-lg group ${slots[idx].task === weakest.name ? 'bg-ll-pale-blue/10 border-ll-blue' : 'bg-white'}`}>
                    <div>
                      <p className={`text-[10px] font-black uppercase tracking-tight mb-1 ${slots[idx].task === weakest.name ? 'text-ll-blue' : 'text-gray-400'}`}>{slots[idx].type}</p>
                      <p className="text-xs font-black truncate leading-tight group-hover:text-ll-blue transition-colors">{slots[idx].task}</p>
                    </div>
                    {slots[idx].task === weakest.name && <Sparkles className="w-3 h-3 text-ll-blue animate-pulse self-end" />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StudyPlanView = ({ records, onUploadClick, darkMode }) => {
  const [showSchedule, setShowSchedule] = React.useState(false);
  const [scheduleConfigured, setScheduleConfigured] = React.useState(false);
  const [freeTime, setFreeTime] = React.useState({
    morning: '8:00 AM - 10:00 AM',
    afternoon: '2:00 PM - 4:00 PM',
    evening: '6:00 PM - 8:00 PM'
  });

  if (records.length === 0) return <EmptyState onUploadClick={onUploadClick} title="Roadmap Locked" description="Your personalized learning map is generated based on your performance trends." />;

  const latestRec = records[records.length - 1];
  const subjects = [...(latestRec.subjects || [])].sort((a, b) => a.marks - b.marks);
  const weakest = subjects[0] || { name: 'Core Foundations', marks: 0 };
  const consistent = subjects.length > 1 ? subjects[subjects.length - 1] : { name: 'General Studies', marks: 80 };

  const morningOptions = ['6:00 AM - 8:00 AM', '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', 'No Time Available'];
  const afternoonOptions = ['12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM', 'No Time Available'];
  const eveningOptions = ['6:00 PM - 8:00 PM', '8:00 PM - 10:00 PM', '10:00 PM - 12:00 AM', 'No Time Available'];

  const roadmapSteps = [
    { title: "Foundation Review", desc: `Intensive focus on ${weakest.name}. Goal: Reach 75% accuracy.`, status: 'active', icon: Target },
    { title: "Consolidation Phase", desc: "Balance strong subjects with moderate areas to maintain current SGPA.", status: 'upcoming', icon: LayoutDashboard },
    { title: "Advanced Application", desc: `Leverage your strength in ${consistent.name} for research or side projects.`, status: 'upcoming', icon: Sparkles },
    { title: "Semester Finals", desc: "Predicted target: " + (latestRec.sgpa + 0.3).toFixed(2) + " SGPA.", status: 'upcoming', icon: Zap }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="text-center space-y-3">
        <h2 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Personalized Plan</h2>
        <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-medium`}>Step-by-step path to Academic Excellence</p>
      </div>

      <div className="flex justify-center gap-4 mt-8">
        <button
          onClick={() => setShowSchedule(false)}
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${!showSchedule ? (darkMode ? 'bg-ll-blue text-white shadow-xl shadow-ll-blue/30' : 'bg-ll-dark text-white shadow-xl') : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-gray-400')}`}
        >
          Master Roadmap
        </button>
        <button
          onClick={() => setShowSchedule(true)}
          className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${showSchedule ? (darkMode ? 'bg-ll-blue text-white shadow-xl shadow-ll-blue/30' : 'bg-ll-dark text-white shadow-xl') : (darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-gray-400')}`}
        >
          Weekly Schedule
        </button>
      </div>

      {!showSchedule ? (
        <div className="relative">
          <div className={`absolute left-1/2 top-0 bottom-0 w-1 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'} -translate-x-1/2 hidden md:block`}></div>
          <div className="space-y-16">
            {roadmapSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <h4 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-ll-dark'}`}>{step.title}</h4>
                  <p className={`${darkMode ? 'text-slate-400' : 'text-slate-500'} font-medium leading-relaxed max-w-sm ${i % 2 === 0 ? 'ml-auto' : 'mr-auto'} md:ml-0 md:mr-0`}>{step.desc}</p>
                </div>
                <div className={`z-10 w-14 h-14 rounded-2xl flex items-center justify-center border-4 ${darkMode ? 'border-slate-800 shadow-ll-dark/20' : 'border-white shadow-lg'} transition-transform hover:scale-110 ${step.status === 'active' ? (darkMode ? 'bg-ll-blue text-white ring-8 ring-ll-blue/20' : 'bg-ll-dark text-white ring-8 ring-ll-pale-blue/30') : (darkMode ? 'bg-slate-800 text-slate-500' : 'bg-white text-slate-300')}`}>
                  <step.icon className="w-5 h-5" />
                </div>
                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : !scheduleConfigured ? (
        <Card className={`p-10 max-w-2xl mx-auto border-none shadow-2xl relative overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-white'}`}>
          <div className={`absolute top-0 left-0 w-2 h-full bg-ll-blue`}></div>
          <div className="space-y-8">
            <div className="space-y-2">
              <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Availability Setup</h3>
              <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tell us when you are free to study, and our AI will optimize your week.</p>
            </div>

            <div className="space-y-6">
              <div className="space-y-4">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400`}>Morning Session</label>
                <div className="relative group">
                  <select
                    value={freeTime.morning}
                    onChange={(e) => setFreeTime({ ...freeTime, morning: e.target.value })}
                    className={`w-full appearance-none pl-6 pr-12 py-4 rounded-[1.5rem] border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-ll-dark'} font-bold transition-all focus:ring-4 focus:ring-ll-blue/10 outline-none cursor-pointer`}
                  >
                    {morningOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-ll-blue pointer-events-none" />
                </div>
              </div>

              <div className="space-y-4">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400`}>Afternoon Session</label>
                <div className="relative group">
                  <select
                    value={freeTime.afternoon}
                    onChange={(e) => setFreeTime({ ...freeTime, afternoon: e.target.value })}
                    className={`w-full appearance-none pl-6 pr-12 py-4 rounded-[1.5rem] border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-ll-dark'} font-bold transition-all focus:ring-4 focus:ring-ll-blue/10 outline-none cursor-pointer`}
                  >
                    {afternoonOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-ll-blue pointer-events-none" />
                </div>
              </div>

              <div className="space-y-4">
                <label className={`text-[10px] font-black uppercase tracking-widest text-slate-400`}>Evening Session</label>
                <div className="relative group">
                  <select
                    value={freeTime.evening}
                    onChange={(e) => setFreeTime({ ...freeTime, evening: e.target.value })}
                    className={`w-full appearance-none pl-6 pr-12 py-4 rounded-[1.5rem] border ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-ll-dark'} font-bold transition-all focus:ring-4 focus:ring-ll-blue/10 outline-none cursor-pointer`}
                  >
                    {eveningOptions.map(opt => <option key={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-ll-blue pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              onClick={() => setScheduleConfigured(true)}
              className="w-full py-5 bg-ll-blue hover:bg-ll-dark text-white rounded-[1.5rem] font-bold shadow-xl shadow-ll-blue/20 transition-all flex items-center justify-center gap-3 group"
            >
              Generate My Schedule <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Card>
      ) : (
        <WeeklySchedule weakest={weakest} subjects={subjects} freeTime={freeTime} />
      )}

      {(!showSchedule || (showSchedule && !scheduleConfigured)) && (
        <Card className={`p-10 border-none relative overflow-hidden ${darkMode ? 'bg-slate-800' : 'bg-ll-dark text-white'}`}>
          <div className="absolute top-0 right-0 p-10 opacity-10">
            <Zap className={`w-32 h-32 ${darkMode ? 'text-ll-blue' : 'text-white'}`} />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className={`p-6 ${darkMode ? 'bg-slate-900' : 'bg-white/10'} rounded-2xl`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-ll-pale-blue mb-4">Urgent Mission</p>
              <p className={`text-2xl font-bold text-white`}>Boost {weakest.name}</p>
              <p className="text-sm font-medium text-slate-400 mt-2">Allocating 15 hours of focused study this week.</p>
            </div>
            <div className="flex-grow">
              <p className={`text-lg font-medium italic mb-6 text-slate-300`}>"Success is the sum of small efforts, repeated day in and day out."</p>
              <button
                onClick={() => setShowSchedule(true)}
                className="px-8 py-4 bg-ll-blue hover:bg-ll-light-blue text-white rounded-xl font-bold transition-all text-xs tracking-widest uppercase shadow-xl shadow-ll-blue/30"
              >
                Get Weekly Schedule
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

const PredictionView = ({ records, onUploadClick }) => {
  if (records.length === 0) return <EmptyState onUploadClick={onUploadClick} title="Predictions Unavailable" description="Need historical data to forecast your future GPA and graduation results." />;

  const latestRec = records[records.length - 1] || { sgpa: 0, semester: 'N/A' };
  const prevRec = records.length > 1 ? records[records.length - 2] : null;
  const trend = prevRec ? ((latestRec.sgpa - prevRec.sgpa) / prevRec.sgpa * 100).toFixed(1) : "0.0";

  const nextSgpa = Math.min(10, latestRec.sgpa + (prevRec ? (latestRec.sgpa - prevRec.sgpa) : 0.2)).toFixed(2);

  // Predict final CGPA based on current average + slight trend factor
  const currentAvg = records.reduce((a, b) => a + b.sgpa, 0) / records.length;
  const growthFactor = parseFloat(trend) > 0 ? 0.25 : 0;
  const finalCgpa = Math.min(10, currentAvg + growthFactor).toFixed(2);

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-br from-[#384959] to-[#1A252F] text-white border-none p-12 overflow-hidden relative shadow-2xl min-h-[500px] flex items-center">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-ll-blue/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
          <div className="space-y-8">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-bold tracking-tight leading-none"
            >
              Academic <br /> <span className="text-ll-pale-blue">Forecasting</span>
            </motion.h2>
            <p className="text-slate-300 text-lg leading-relaxed font-medium max-w-md">
              "Based on your historical velocity and subject proficiency, our engine projects a graduation score of <span className="text-white font-bold underline decoration-ll-blue decoration-2">{finalCgpa} CGPA</span>."
            </p>
            <div className="flex gap-6">
              <div className="px-10 py-6 bg-white/10 rounded-[2.5rem] border border-white/5 flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Base</span>
                <span className="text-4xl font-bold text-ll-pale-blue">{latestRec.sgpa}</span>
              </div>
              <div className="px-10 py-6 bg-ll-blue/30 rounded-[2.5rem] border border-ll-blue/40 flex flex-col items-center shadow-xl shadow-ll-blue/20">
                <span className="text-[10px] font-black text-ll-pale-blue uppercase tracking-widest mb-1">Target next</span>
                <span className="text-4xl font-black text-white">{nextSgpa}</span>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl rounded-[3rem] p-12 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-3 h-3 rounded-full ${parseFloat(trend) >= 0 ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-red-500 shadow-red-500/50'} shadow-lg`}></div>
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Trend Analysis: {parseFloat(trend) >= 0 ? 'Positive' : 'Action Required'}</h4>
            </div>
            <p className="text-base font-bold text-slate-300 leading-relaxed">
              You are currently following a <span className={parseFloat(trend) >= 0 ? 'text-emerald-400' : 'text-red-400'}>{trend}% {parseFloat(trend) >= 0 ? 'improvement' : 'delta'}</span> trajectory.
              {parseFloat(trend) >= 0
                ? " Maintain this momentum to exceed your predicted graduation target."
                : " Review the study roadmap to reverse the current decline in core subjects."}
            </p>
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence Score</p>
                  <p className="text-2xl font-black text-white">88%</p>
                </div>
                <div className="text-right">
                  <Zap className="w-8 h-8 text-amber-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const SettingsView = ({ user, darkMode, setDarkMode, emailEnabled, setEmailEnabled }) => {
  const [reports, setReports] = useState(true);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <div className="flex flex-col gap-1">
        <h2 className={`text-3xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>Settings</h2>
        <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>Manage your LearnLens account and preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Profile Section */}
        <Card className={`hover:shadow-lg transition-all duration-300 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
          <div className="flex items-center gap-6 p-2">
            <div className={`w-20 h-20 rounded-3xl bg-ll-pale-blue flex items-center justify-center ${darkMode ? 'text-slate-900' : 'text-ll-dark'} text-3xl font-bold border-4 border-white shadow-xl`}>
              {user?.displayName?.charAt(0) || user?.email?.charAt(0)}
            </div>
            <div>
              <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.displayName || 'Scholar'}</h4>
              <p className={`text-[10px] font-semibold text-gray-400 uppercase tracking-widest mt-1`}>{user?.email}</p>
              <div className="flex gap-4 mt-3">
                <button className="px-4 py-1.5 bg-ll-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-ll-blue transition-all">Edit Profile</button>
                <button className={`px-4 py-1.5 ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'} rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all`}>Verify Account</button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Preferences */}
          <Card className={`hover:shadow-lg transition-all duration-300 md:col-span-2 ${darkMode ? 'bg-slate-800 border-slate-700' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>App Preferences</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className={`flex items-center justify-between px-4 py-3 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Email Alerts</span>
                <button
                  onClick={() => setEmailEnabled(!emailEnabled)}
                  className={`w-10 h-6 rounded-full relative transition-all duration-300 ${emailEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${emailEnabled ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div className={`flex items-center justify-between px-4 py-3 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Weekly Reports</span>
                <button
                  onClick={() => setReports(!reports)}
                  className={`w-10 h-6 rounded-full relative transition-all duration-300 ${reports ? 'bg-ll-blue' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${reports ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>

              <div className={`flex items-center justify-between px-4 py-3 ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-100'} rounded-2xl border`}>
                <span className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Dark Mode</span>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-10 h-6 rounded-full relative transition-all duration-300 ${darkMode ? 'bg-ll-blue' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${darkMode ? 'right-1' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
            {emailEnabled && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3"
              >
                <div className="p-2 bg-emerald-500 rounded-full">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs font-semibold text-emerald-600">Smart Notifications enabled for: <span className="underline font-bold">{user?.email}</span></p>
              </motion.div>
            )}
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className={`border-red-100 ${darkMode ? 'bg-red-900/10 border-red-900/30' : 'bg-red-50/10'}`}>
          <h4 className="font-bold text-red-600 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </h4>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'} max-w-sm`}>Deleting your account will permanently remove all your academic history and AI-generated insights.</p>
            <button className="px-6 py-3 bg-red-100 text-red-600 hover:bg-red-200 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all">Delete Data</button>
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Dashboard Root ---

const Dashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState(0);
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const fileInputRef = useRef(null);
  const abortControllerRef = useRef(null);
  const stepTimerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.isNewUser) {
      setShowWelcome(true);
      // Automatically hide after 8 seconds
      const timer = setTimeout(() => setShowWelcome(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Load analysis history from Firestore
        try {
          const history = await fetchAnalysisHistory(currentUser.uid);
          if (history.length > 0) {
            setRecords(prev => {
              const existingIds = new Set(prev.map(r => r.id));
              const newRecords = history.filter(r => !existingIds.has(r.id));
              return [...prev, ...newRecords];
            });
            console.log(`📚 Loaded ${history.length} records from history`);
          }
        } catch (err) {
          console.error('Failed to load history:', err);
        }
      } else {
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try { await signOut(auth); navigate('/login'); }
    catch (e) { console.error(e); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsExtracting(true);
    setExtractionStep(0);

    // Create abort controller for cancellation
    abortControllerRef.current = new AbortController();

    // Animate progress steps while waiting
    stepTimerRef.current = setInterval(() => {
      setExtractionStep(prev => (prev < 3 ? prev + 1 : prev));
    }, 1500);

    try {
      const liveData = await analyzeDocument(file, abortControllerRef.current.signal, user?.uid);
      clearInterval(stepTimerRef.current);
      setExtractionStep(4); // Done
      console.log("📊 Received analysis data:", JSON.stringify(liveData, null, 2));

      // Ensure the record has any missing required fields from internal logic
      const finalizedRecord = {
        ...liveData,
        id: liveData.id || `rec_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        date: liveData.date || new Date().toISOString().split('T')[0],
        semester: liveData.semester || 'Semester Analysis',
        course: liveData.course || 'Academic Course',
        institution: liveData.institution || 'LearnLens AI',
        sgpa: liveData.sgpa || 0,
        subjects: (liveData.subjects || []).map(s => ({
          name: s.name || 'Unknown Subject',
          marks: Number(s.marks) || 0,
          grade: s.grade || 'N/A',
          credits: s.credits || 4,
          performance: s.performance || (Number(s.marks) < 50 ? 'Weak' : Number(s.marks) < 75 ? 'Average' : 'Strong')
        }))
      };

      console.log("✅ Finalized record:", JSON.stringify(finalizedRecord, null, 2));
      setRecords(prev => [...prev, finalizedRecord]);
      setIsExtracting(false);
      setShowUploadModal(false);
      setActiveTab('Dashboard');

    } catch (error) {
      clearInterval(stepTimerRef.current);
      if (error.name === 'AbortError') {
        console.log('Analysis cancelled by user.');
      } else {
        console.error('Gemini Extraction Error:', error);
        alert(`Live AI Analysis Failed: ${error.message || 'Check file clarity and API key.'}`);
      }
      setIsExtracting(false);
      setExtractionStep(0);
    }
  };

  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    clearInterval(stepTimerRef.current);
    setIsExtracting(false);
    setExtractionStep(0);
    setShowUploadModal(false);
  };

  const handleDeleteRecord = async (recordId) => {
    try {
      // Find the record to get its Firestore ID
      const recordToDelete = records.find(r => r.id === recordId);
      
      // For fresh uploads, Firestore ID is in history_id. 
      // For history loads, it's in id.
      const docId = recordToDelete?.history_id || recordToDelete?.id;

      if (!docId) {
        console.warn("Could not find document ID for deletion");
        return;
      }

      await deleteAnalysis(docId);
      setRecords(prev => prev.filter(r => r.id !== recordId));
      console.log(`✅ Successfully deleted record: ${docId}`);
    } catch (err) {
      console.error('Failed to delete record:', err);
      alert('Failed to delete record. Please try again.');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <OverviewView records={records} user={user} onUploadClick={() => setShowUploadModal(true)} onDeleteRecord={handleDeleteRecord} />;
      case 'History': return <HistoryView records={records} onUploadClick={() => setShowUploadModal(true)} onDeleteRecord={handleDeleteRecord} darkMode={darkMode} />;
      case 'Performance Analysis': return <AnalysisView records={records} onUploadClick={() => setShowUploadModal(true)} />;
      case 'Study Plan': return <StudyPlanView records={records} onUploadClick={() => setShowUploadModal(true)} darkMode={darkMode} />;
      case 'Predictions': return <PredictionView records={records} onUploadClick={() => setShowUploadModal(true)} darkMode={darkMode} />;
      case 'Settings': return <SettingsView user={user} darkMode={darkMode} setDarkMode={setDarkMode} emailEnabled={emailEnabled} setEmailEnabled={setEmailEnabled} />;
      default: return <OverviewView records={records} user={user} onUploadClick={() => setShowUploadModal(true)} onDeleteRecord={handleDeleteRecord} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-ll-dark'} flex font-sans overflow-x-hidden selection:bg-ll-pale-blue transition-colors duration-500`}>
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-r border-slate-100'} transition-all duration-300 z-50 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-full flex flex-col p-4 overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-3 mb-10 px-2 pt-2">
            <motion.div whileHover={{ scale: 1.1 }} className="bg-ll-dark p-2 rounded-xl cursor-pointer shadow-lg shadow-ll-dark/20">
              <BookOpen className="text-white w-6 h-6" />
            </motion.div>
            {isSidebarOpen && <span className={`font-bold text-xl tracking-tight ${darkMode ? 'text-white' : 'text-slate-800'}`}>LearnLens</span>}
          </div>

          <nav className="flex-grow space-y-2">
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} darkMode={darkMode} />
            <SidebarItem icon={Upload} label="Upload Marksheets" active={activeTab === 'Upload Marks'} onClick={() => setShowUploadModal(true)} darkMode={darkMode} />
            <SidebarItem icon={Clock} label="History" active={activeTab === 'History'} onClick={() => setActiveTab('History')} darkMode={darkMode} />
            <SidebarItem icon={BarChart3} label="Visual Analytics" active={activeTab === 'Performance Analysis'} onClick={() => setActiveTab('Performance Analysis')} darkMode={darkMode} />
            <SidebarItem icon={Zap} label="Future Predictions" active={activeTab === 'Predictions'} onClick={() => setActiveTab('Predictions')} darkMode={darkMode} />
            <SidebarItem icon={Calendar} label="Personalized Plan" active={activeTab === 'Study Plan'} onClick={() => setActiveTab('Study Plan')} darkMode={darkMode} />

            <div className="pt-6 pb-2 px-4"><div className={`h-px ${darkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div></div>

            <SidebarItem icon={User} label="My Profile" active={activeTab === 'Profile'} onClick={() => setActiveTab('Profile')} darkMode={darkMode} />
            <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} darkMode={darkMode} />
          </nav>

          <button onClick={handleLogout} className="mt-auto flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-bold text-sm">
            <LogOut className="w-5 h-5" />
            {isSidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-grow transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <header className={`sticky top-0 ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-100'} backdrop-blur-md border-b z-40 px-8 py-5 flex items-center justify-between`}>
          <div className="flex flex-col">
            <h1 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-ll-dark'} tracking-tight`}>{activeTab}</h1>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest leading-none mt-1">Gemini AI Intelligence</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative hidden lg:flex items-center">
              <Search className="absolute left-4 text-gray-400 w-4 h-4" />
              <input type="text" placeholder="Search my records..." className={`pl-11 pr-4 py-2.5 ${darkMode ? 'bg-slate-800 text-white placeholder-slate-500' : 'bg-slate-100 placeholder-slate-400'} rounded-3xl text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:ring-4 focus:ring-ll-pale-blue/30 transition-all w-64`} />
            </div>

            <div className="flex items-center gap-4">
              <button className={`p-2.5 ${darkMode ? 'text-slate-400 bg-slate-800 border-slate-700 hover:text-white' : 'text-gray-400 bg-white border-slate-100 hover:text-ll-dark'} relative transition-all border rounded-2xl shadow-sm`}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-white"></span>
              </button>
              <div className="group relative">
                <div className="w-12 h-12 rounded-[1.2rem] bg-ll-pale-blue border-2 border-white shadow-md flex items-center justify-center text-ll-dark font-bold uppercase cursor-pointer hover:scale-105 transition-all">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || 'L'}
                </div>
                <div className={`absolute top-full right-0 mt-4 w-64 ${darkMode ? 'bg-slate-800 border-slate-700 shadow-ll-dark/40' : 'bg-white border-slate-100 shadow-2xl'} rounded-[2rem] border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 z-50 overflow-hidden`}>
                  <div className={`p-8 ${darkMode ? 'bg-slate-900/50' : 'bg-ll-pale-blue/10'}`}>
                    <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-ll-dark'} truncate`}>{user?.displayName || 'Lakshith'}</p>
                    <p className="text-[10px] font-semibold text-gray-400 truncate mt-1 uppercase tracking-widest leading-none">{user?.email}</p>
                  </div>
                  <div className={`p-4 border-t ${darkMode ? 'border-slate-700' : 'border-slate-50'}`}>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-4 text-xs font-bold text-red-500 hover:bg-red-50 rounded-2xl transition-colors uppercase tracking-widest">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
          {activeTab === 'Dashboard' && records.length > 0 && (
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-2">
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-4xl font-bold ${darkMode ? 'text-white' : 'text-ll-dark'} tracking-tight`}
                >
                  Hello, {user?.displayName?.split(' ')?.[0] || 'Scholar'}
                </motion.h2>
                <div className={`flex flex-col sm:flex-row items-center gap-3 px-4 py-2 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100/50 border-slate-200/60'} rounded-xl border w-fit`}>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-ll-blue" />
                    <p className={`text-xs font-semibold ${darkMode ? 'text-slate-300' : 'text-slate-600'} tracking-tight leading-none uppercase`}>System Status: <span className="text-emerald-500 font-bold">Hybrid Intel Ready</span></p>
                  </div>
                  <div className={`hidden sm:block w-px h-3 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                  <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Multi-Layer Scan Enabled</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={async () => {
                    const latestRec = records[records.length - 1];
                    if (!latestRec || !latestRec.subjects?.length) return;
                    setIsDownloading(true);
                    try {
                      await downloadInsightsReport(latestRec);
                    } catch (err) {
                      alert('Report download failed: ' + err.message);
                    }
                    setIsDownloading(false);
                  }}
                  disabled={isDownloading || records.length === 0}
                  className="flex items-center gap-3 px-8 py-5 bg-white hover:bg-ll-pale-blue border-2 border-ll-dark/10 text-ll-dark rounded-[2rem] font-black transition-all shadow-lg hover:-translate-y-2 group disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isDownloading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                  )}
                  {isDownloading ? 'Generating...' : 'Download Report'}
                </button>
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center gap-3 px-10 py-5 bg-ll-dark hover:bg-ll-blue text-white rounded-[2rem] font-black transition-all shadow-2xl hover:-translate-y-2 group"
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  Upload New Marksheet
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* --- MODALS --- */}

        {showUploadModal && (
          <div className="fixed inset-0 bg-ll-dark/70 backdrop-blur-xl z-[100] flex items-center justify-center p-6 transition-all duration-500 overflow-y-auto">
            <Card className="max-w-2xl w-full relative overflow-hidden p-0 border-none shadow-2xl my-auto">
              <div className="p-12">
                <div className="flex justify-between items-center mb-12">
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">Gemini Vision OCR</h3>
                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-[0.3em]">Processing with Flash 1.5</p>
                  </div>
                  <button onClick={() => setShowUploadModal(false)} className="p-3 hover:bg-slate-100 rounded-3xl transition-all">
                    <Plus className="w-8 h-8 rotate-45 text-slate-300" />
                  </button>
                </div>

                {!isExtracting ? (
                  <>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="group flex flex-col items-center justify-center p-20 border-4 border-dashed border-slate-100 rounded-[4rem] hover:bg-ll-pale-blue/5 hover:border-ll-blue transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="w-24 h-24 bg-ll-pale-blue/30 rounded-[2.5rem] flex items-center justify-center text-ll-blue mb-10 group-hover:scale-110">
                        <FileText className="w-12 h-12" />
                      </div>
                      <span className="text-2xl font-black text-ll-dark text-center tracking-tight">Select Marksheet PDF / Image</span>
                      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,image/*" onChange={handleFileUpload} />
                    </div>
                  </>
                ) : (
                  <div className="py-16 flex flex-col items-center">
                    <div className="relative mb-12">
                      <div className="w-32 h-32 rounded-full border-[6px] border-slate-100"></div>
                      <div className="absolute inset-0 w-32 h-32 rounded-full border-[6px] border-ll-blue border-t-transparent animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="w-8 h-8 text-ll-blue animate-pulse" />
                      </div>
                    </div>

                    <div className="w-full max-w-sm space-y-4 mb-8">
                      {[
                        { label: 'Uploading document', icon: Upload },
                        { label: 'Reading marksheet', icon: FileText },
                        { label: 'AI analyzing subjects', icon: Sparkles },
                        { label: 'Building your dashboard', icon: BarChart3 }
                      ].map((step, i) => (
                        <div key={i} className={`flex items-center gap-4 px-5 py-3 rounded-2xl transition-all duration-500 ${extractionStep > i
                          ? 'bg-emerald-50 border border-emerald-200'
                          : extractionStep === i
                            ? 'bg-ll-pale-blue/20 border border-ll-blue/30 scale-[1.02]'
                            : 'bg-slate-50 border border-slate-100 opacity-40'
                          }`}>
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-500 ${extractionStep > i
                            ? 'bg-emerald-500 text-white'
                            : extractionStep === i
                              ? 'bg-ll-blue text-white animate-pulse'
                              : 'bg-slate-200 text-slate-400'
                            }`}>
                            {extractionStep > i
                              ? <CheckCircle2 className="w-4 h-4" />
                              : extractionStep === i
                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                : <step.icon className="w-4 h-4" />
                            }
                          </div>
                          <span className={`text-sm font-bold transition-colors duration-300 ${extractionStep > i ? 'text-emerald-700' : extractionStep === i ? 'text-ll-dark' : 'text-slate-400'
                            }`}>{step.label}</span>
                          {extractionStep > i && <span className="ml-auto text-[10px] font-black text-emerald-500 uppercase">Done</span>}
                        </div>
                      ))}
                    </div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center mb-6">
                      Powered by Gemini Flash AI
                    </p>

                    <button
                      onClick={handleCancelUpload}
                      className="px-8 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all border border-red-200 hover:border-red-300"
                    >
                      Cancel Analysis
                    </button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Welcome Notification Simulation */}
        <AnimatePresence>
          {showWelcome && (
            <motion.div
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className="fixed bottom-10 right-10 z-[100] max-w-md"
            >
              <div className={`p-6 rounded-[2.5rem] shadow-2xl border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'} overflow-hidden relative group`}>
                <div className="absolute top-0 left-0 w-2 h-full bg-ll-blue"></div>

                <div className="flex items-start gap-5">
                  <div className="w-14 h-14 bg-ll-pale-blue rounded-2xl flex items-center justify-center text-ll-dark shrink-0 shadow-lg">
                    <Mail className="w-7 h-7" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black uppercase tracking-widest text-ll-blue">Inbound Message</span>
                      <button onClick={() => setShowWelcome(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                        <Plus className="w-4 h-4 rotate-45" />
                      </button>
                    </div>
                    <h4 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'} leading-tight`}>Welcome to LearnLens!</h4>
                    <p className={`text-sm font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'} leading-relaxed`}>
                      We've just sent a welcome briefing to <span className="text-ll-blue font-bold">{user?.email || 'your inbox'}</span>. Check it out for your first steps!
                    </p>
                    <div className="pt-2">
                      <button className="px-5 py-2 bg-ll-dark text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-ll-blue transition-all">Open Briefing</button>
                    </div>
                  </div>
                </div>

                {/* Subtle Progress Bar */}
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: 8, ease: "linear" }}
                  className="absolute bottom-0 left-0 h-1 bg-ll-blue opacity-30"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;
