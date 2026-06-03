import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, Plus, Pencil, Trash2, Filter } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  Button, Badge, SearchInput, Modal, Input, Select, Textarea,
  ConfirmDialog, EmptyState, LoadingSpinner, ProgressBar, Table,
} from '@/components/ui'
import { tasksService, projectsService } from '@/services/firestoreService'
import { formatDate, statusLabels } from '@/lib/utils'
import type { Task, Project } from '@/types'

const STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'done'].map(v => ({ value: v, label: statusLabels[v] }))
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'].map(v => ({ value: v, label: statusLabels[v] }))
const TYPE_OPTIONS = ['development', 'design', 'content', 'qa', 'meeting', 'other'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))

type TaskForm = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>

const KANBAN_COLS: { key: Task['status']; label: string; accent: string }[] = [
  { key: 'todo', label: 'To Do', accent: 'border-white/10' },
  { key: 'in_progress', label: 'In Progress', accent: 'border-brand-500/30' },
  { key: 'review', label: 'Review', accent: 'border-accent-400/30' },
  { key: 'done', label: 'Done', accent: 'border-success/30' },
]

export function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPriority, setFilterPriority] = useState('')
  const [view, setView] = useState<'table' | 'kanban'>('kanban')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset } = useForm<TaskForm>()

  const load = async () => {
    setLoading(true)
    try {
      const [t, p] = await Promise.all([tasksService.getAll(), projectsService.getAll()])
      setTasks(t)
      setProjects(p)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const projectOptions = projects.map(p => ({ value: p.id, label: p.title }))

  const openCreate = (status?: Task['status']) => {
    setEditing(null)
    reset({ status: status || 'todo', priority: 'medium', type: 'development', estimatedHours: 0, spentHours: 0 })
    setModalOpen(true)
  }

  const openEdit = (t: Task) => { setEditing(t); reset(t); setModalOpen(true) }

  const onSubmit = async (data: TaskForm) => {
    setSaving(true)
    try {
      const projectName = projects.find(p => p.id === data.projectId)?.title || ''
      if (editing) {
        await tasksService.update(editing.id, { ...data, projectName })
      } else {
        await tasksService.create({ ...data, projectName })
      }
      setModalOpen(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setSaving(true)
    try {
      await tasksService.delete(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || (t.assigneeName || '').toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || t.status === filterStatus
    const matchPriority = !filterPriority || t.priority === filterPriority
    return matchSearch && matchStatus && matchPriority
  })

  const byStatus = (status: Task['status']) => filtered.filter(t => t.status === status)

  if (loading) return <LoadingSpinner />

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="text-white/40 text-sm mt-0.5">{tasks.length} total tasks</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-800 border border-white/10 rounded-lg p-0.5">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === 'kanban' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'}`}>Kanban</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === 'table' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'}`}>Table</button>
          </div>
          <Button icon={<Plus size={15} />} onClick={() => openCreate()}>New Task</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search tasks…" />
        <select className="input w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="input w-36" value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<CheckSquare size={32} />} title="No tasks found" message="Create tasks to track your team's work." action={<Button icon={<Plus size={15} />} onClick={() => openCreate()} size="sm">New Task</Button>} />
      ) : view === 'kanban' ? (
        <div className="grid grid-cols-4 gap-4">
          {KANBAN_COLS.map(col => (
            <div key={col.key} className={`flex flex-col gap-2 p-3 bg-white/[0.02] rounded-xl border ${col.accent} min-h-32`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{col.label}</span>
                <span className="text-xs bg-white/10 text-white/40 rounded-full px-2 py-0.5">{byStatus(col.key).length}</span>
              </div>
              {byStatus(col.key).map(t => (
                <div key={t.id} className="card p-3 hover:border-white/10 transition-all group">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-sm font-medium text-white/80 line-clamp-2 flex-1">{t.title}</span>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEdit(t)} className="p-1 hover:bg-white/10 rounded text-white/30 hover:text-white"><Pencil size={11} /></button>
                      <button onClick={() => setDeleteTarget(t)} className="p-1 hover:bg-danger/10 rounded text-white/30 hover:text-danger"><Trash2 size={11} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge status={t.priority} />
                    {t.projectName && (
                      <span className="text-xs text-white/20 truncate">{t.projectName}</span>
                    )}
                  </div>
                  {t.assigneeName && <p className="text-xs text-white/30 mt-1.5">{t.assigneeName}</p>}
                  {t.dueDate && <p className="text-xs text-white/20 mt-0.5">{formatDate(t.dueDate)}</p>}
                  {t.estimatedHours > 0 && (
                    <ProgressBar value={(t.spentHours / t.estimatedHours) * 100} className="mt-2" />
                  )}
                </div>
              ))}
              <button onClick={() => openCreate(col.key)} className="w-full p-2 rounded-lg border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 text-xs transition-colors">
                + Add task
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <Table headers={['Task', 'Project', 'Status', 'Priority', 'Assignee', 'Due', 'Hours', 'Actions']}>
            {filtered.map(t => (
              <tr key={t.id} className="table-row">
                <td className="td font-medium text-white max-w-xs truncate">{t.title}</td>
                <td className="td">
                  {t.projectId ? <Link to={`/projects/${t.projectId}`} className="text-xs text-brand-400 hover:text-brand-300">{t.projectName}</Link> : <span className="text-white/30">—</span>}
                </td>
                <td className="td"><Badge status={t.status} /></td>
                <td className="td"><Badge status={t.priority} /></td>
                <td className="td text-white/50 text-xs">{t.assigneeName || '—'}</td>
                <td className="td text-white/40 text-xs">{formatDate(t.dueDate)}</td>
                <td className="td text-xs text-white/50">{t.spentHours}h / {t.estimatedHours}h</td>
                <td className="td">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(t)} className="p-1.5 hover:bg-white/10 rounded text-white/30 hover:text-white transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => setDeleteTarget(t)} className="p-1.5 hover:bg-danger/10 rounded text-white/30 hover:text-danger transition-colors"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Task' : 'New Task'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Task Title" placeholder="Implement feature X" {...register('title', { required: true })} />
          </div>
          <div className="col-span-2">
            <Textarea label="Description" {...register('description')} />
          </div>
          <Select label="Project" options={projectOptions} placeholder="Select project" {...register('projectId')} />
          <Input label="Assignee" placeholder="Team member name" {...register('assigneeName')} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
          <Select label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
          <Select label="Type" options={TYPE_OPTIONS} {...register('type')} />
          <Input label="Due Date" type="date" {...register('dueDate')} />
          <Input label="Estimated Hours" type="number" min="0" {...register('estimatedHours', { valueAsNumber: true })} />
          <Input label="Spent Hours" type="number" min="0" {...register('spentHours', { valueAsNumber: true })} />
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Create Task'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Task" message={`Delete "${deleteTarget?.title}"?`} loading={saving} />
    </div>
  )
}
