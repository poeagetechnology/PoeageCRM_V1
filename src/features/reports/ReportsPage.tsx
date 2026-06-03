import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts'
import { Download, TrendingUp, Users, Briefcase, DollarSign } from 'lucide-react'
import { Button, LoadingSpinner, StatCard } from '@/components/ui'
import { clientsService, projectsService, tasksService, employeesService } from '@/services/firestoreService'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#3b82f6', '#10b981', '#a78bfa', '#f59e0b', '#ef4444', '#06b6d4']

const monthlyRevenue = [
  { month: 'Oct', revenue: 63000, target: 60000 },
  { month: 'Nov', revenue: 58000, target: 62000 },
  { month: 'Dec', revenue: 71000, target: 65000 },
  { month: 'Jan', revenue: 67000, target: 68000 },
  { month: 'Feb', revenue: 74000, target: 70000 },
  { month: 'Mar', revenue: 81000, target: 75000 },
]

const deptData = [
  { dept: 'Engineering', headcount: 14, utilization: 87 },
  { dept: 'Design', headcount: 5, utilization: 72 },
  { dept: 'Marketing', headcount: 4, utilization: 65 },
  { dept: 'Finance', headcount: 3, utilization: 80 },
  { dept: 'HR', headcount: 2, utilization: 55 },
  { dept: 'Ops', headcount: 3, utilization: 91 },
]

const taskTrend = [
  { week: 'W1', created: 18, completed: 14 },
  { week: 'W2', created: 22, completed: 19 },
  { week: 'W3', created: 15, completed: 21 },
  { week: 'W4', created: 28, completed: 24 },
  { week: 'W5', created: 20, completed: 26 },
  { week: 'W6', created: 17, completed: 18 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-800 border border-white/10 rounded-lg p-3 shadow-xl text-xs">
      <p className="text-white/60 mb-1.5">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}
          {p.name === 'utilization' ? '%' : ''}
        </p>
      ))}
    </div>
  )
}

export function ReportsPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ clients: 0, projects: 0, tasks: 0, employees: 0, totalBudget: 0 })
  const [projectStatusData, setProjectStatusData] = useState<{ name: string; value: number }[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [clients, projects, tasks, employees] = await Promise.all([
          clientsService.getAll(),
          projectsService.getAll(),
          tasksService.getAll(),
          employeesService.getAll(),
        ])
        const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0)
        setStats({ clients: clients.length, projects: projects.length, tasks: tasks.length, employees: employees.length, totalBudget })

        const statusCounts = projects.reduce((acc, p) => {
          acc[p.status] = (acc[p.status] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        setProjectStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name, value })))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="text-white/40 text-sm mt-0.5">Business intelligence & analytics</p>
        </div>
        <Button variant="secondary" icon={<Download size={15} />}>Export PDF</Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Clients" value={stats.clients} icon={<Users size={18} />} color="text-brand-400" />
        <StatCard title="Active Projects" value={stats.projects} icon={<Briefcase size={18} />} color="text-accent-400" />
        <StatCard title="Total Budget" value={formatCurrency(stats.totalBudget)} icon={<DollarSign size={18} />} color="text-success" />
        <StatCard title="Team Size" value={stats.employees} icon={<Users size={18} />} color="text-warning" />
      </div>

      {/* Revenue Chart */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-white">Revenue vs Target</h2>
            <p className="text-xs text-white/30 mt-0.5">Last 6 months performance</p>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-400" />Revenue</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-white/20" />Target</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={monthlyRevenue} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#gRev)" />
            <Line type="monotone" dataKey="target" name="Target" stroke="rgba(255,255,255,0.2)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project Status */}
        <div className="card p-5">
          <h2 className="font-semibold text-white mb-1">Project Status</h2>
          <p className="text-xs text-white/30 mb-4">Distribution by status</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={projectStatusData.length ? projectStatusData : [{ name: 'No data', value: 1 }]}
                cx="50%" cy="50%" innerRadius={38} outerRadius={62} paddingAngle={3} dataKey="value">
                {(projectStatusData.length ? projectStatusData : [{ name: 'No data', value: 1 }]).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-soft)', color: 'var(--text)', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {projectStatusData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-white/50 capitalize">
                  <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {d.name.replace('_', ' ')}
                </span>
                <span className="font-medium text-white/70">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Task Trends */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="font-semibold text-white mb-1">Task Velocity</h2>
          <p className="text-xs text-white/30 mb-4">Created vs Completed per week</p>
          <ResponsiveContainer width="100%" height={190}>
            <BarChart data={taskTrend} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="created" name="Created" fill="rgba(59,130,246,0.6)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="rgba(16,185,129,0.6)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Utilization */}
      <div className="card p-6">
        <h2 className="font-semibold text-white mb-1">Team Utilization by Department</h2>
        <p className="text-xs text-white/30 mb-5">Percentage of capacity used</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={deptData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
            <YAxis dataKey="dept" type="category" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} width={70} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="utilization" name="utilization" radius={[0, 4, 4, 0]}>
              {deptData.map((d, i) => (
                <Cell key={i} fill={d.utilization >= 85 ? '#10b981' : d.utilization >= 70 ? '#3b82f6' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center gap-6 mt-4 text-xs text-white/40">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-success" />≥85% optimal</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-brand-400" />70–84% good</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-warning" />&lt;70% low</span>
        </div>
      </div>
    </div>
  )
}
