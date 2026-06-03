import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts'
import {
  Users, Briefcase, CheckSquare, DollarSign, TrendingUp,
  Clock, AlertCircle, ArrowRight, UserCog,
} from 'lucide-react'
import { StatCard, Badge, Avatar, ProgressBar, LoadingSpinner } from '@/components/ui'
import { clientsService, projectsService, tasksService, employeesService } from '@/services/firestoreService'
import { formatCurrency, formatDate, statusColors } from '@/lib/utils'
import type { Project, Task } from '@/types'

const revenueData = [
  { month: 'Jul', revenue: 42000, expenses: 28000 },
  { month: 'Aug', revenue: 55000, expenses: 31000 },
  { month: 'Sep', revenue: 47000, expenses: 29000 },
  { month: 'Oct', revenue: 63000, expenses: 35000 },
  { month: 'Nov', revenue: 58000, expenses: 32000 },
  { month: 'Dec', revenue: 71000, expenses: 38000 },
]

const taskStatusData = [
  { name: 'Done', value: 48, color: '#10b981' },
  { name: 'In Progress', value: 27, color: '#3b82f6' },
  { name: 'Review', value: 12, color: '#a78bfa' },
  { name: 'To Do', value: 21, color: '#ffffff20' },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-800 border border-white/10 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-white/60 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

export function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ clients: 0, projects: 0, tasks: 0, employees: 0 })
  const [recentProjects, setRecentProjects] = useState<Project[]>([])
  const [urgentTasks, setUrgentTasks] = useState<Task[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [clients, projects, tasks, employees] = await Promise.all([
          clientsService.getAll(),
          projectsService.getAll(),
          tasksService.getAll(),
          employeesService.getAll(),
        ])
        setStats({ clients: clients.length, projects: projects.length, tasks: tasks.length, employees: employees.length })
        setRecentProjects(projects.slice(0, 5))
        setUrgentTasks(tasks.filter(t => t.priority === 'critical' || t.priority === 'high').slice(0, 5))
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-white/40 text-sm mt-0.5">Welcome back — here's what's happening</p>
        </div>
        <div className="text-sm text-white/30">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Clients" value={stats.clients} icon={<Users size={18} />} color="text-brand-400" trend={12} />
        <StatCard title="Projects" value={stats.projects} icon={<Briefcase size={18} />} color="text-accent-400" trend={5} />
        <StatCard title="Open Tasks" value={stats.tasks} icon={<CheckSquare size={18} />} color="text-success" trend={-3} />
        <StatCard title="Team Members" value={stats.employees} icon={<UserCog size={18} />} color="text-warning" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-white">Revenue vs Expenses</h2>
              <p className="text-xs text-white/30 mt-0.5">Last 6 months</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-white/40"><span className="w-2 h-2 rounded-full bg-brand-400" />Revenue</span>
              <span className="flex items-center gap-1.5 text-white/40"><span className="w-2 h-2 rounded-full bg-danger/60" />Expenses</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="exp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#rev)" />
              <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2} fill="url(#exp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Task Breakdown */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-1">Task Breakdown</h2>
          <p className="text-xs text-white/30 mb-4">By status</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                {taskStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-soft)', color: 'var(--text)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 mt-2">
            {taskStatusData.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-white/50">
                  <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="font-medium text-white/70">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Projects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Projects</h2>
            <Link to="/projects" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No projects yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentProjects.map(p => (
                <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                    <Briefcase size={14} className="text-brand-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/80 truncate group-hover:text-white">{p.title}</div>
                    <ProgressBar value={p.progress} className="mt-1.5" />
                  </div>
                  <div className="shrink-0"><Badge status={p.status} /></div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Urgent Tasks */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Priority Tasks</h2>
            <Link to="/tasks" className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 transition-colors">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {urgentTasks.length === 0 ? (
            <p className="text-white/30 text-sm text-center py-8">No urgent tasks</p>
          ) : (
            <div className="flex flex-col gap-3">
              {urgentTasks.map(t => (
                <div key={t.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors">
                  <div className="mt-0.5">
                    <AlertCircle size={15} className={t.priority === 'critical' ? 'text-danger' : 'text-warning'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white/80 truncate">{t.title}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {t.assigneeName && <span className="text-xs text-white/30">{t.assigneeName}</span>}
                      {t.dueDate && (
                        <span className="text-xs text-white/20 flex items-center gap-1">
                          <Clock size={10} />{formatDate(t.dueDate)}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge status={t.priority} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
