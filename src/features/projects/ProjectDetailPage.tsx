import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Briefcase, Calendar, DollarSign, Users, Plus, Pencil, Trash2 } from 'lucide-react'
import { projectsService, tasksService, clientsService } from '@/services/firestoreService'
import { Button, Badge, LoadingSpinner, ProgressBar, Table, Modal, Input, Select, Textarea, ConfirmDialog } from '@/components/ui'
import { formatDate, formatCurrency, statusLabels } from '@/lib/utils'
import type { Project, Task } from '@/types'
import { useForm } from 'react-hook-form'

const TASK_STATUS_OPTIONS = ['todo', 'in_progress', 'review', 'done'].map(v => ({ value: v, label: statusLabels[v] }))
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'].map(v => ({ value: v, label: statusLabels[v] }))
const TASK_TYPE_OPTIONS = ['development', 'design', 'content', 'qa', 'meeting', 'other'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))

type TaskForm = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'projectId' | 'projectName'>

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [taskModal, setTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [deleteTask, setDeleteTask] = useState<Task | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'tasks' | 'overview' | 'kanban'>('overview')

  const { register, handleSubmit, reset } = useForm<TaskForm>()

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [p, t] = await Promise.all([
        projectsService.getById(id),
        tasksService.getAll([tasksService.where('projectId', '==', id)]),
      ])
      setProject(p)
      setTasks(t)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const openTaskModal = (task?: Task) => {
    setEditingTask(task || null)
    reset(task ? task : { status: 'todo', priority: 'medium', type: 'development', estimatedHours: 0, spentHours: 0 })
    setTaskModal(true)
  }

  const onTaskSubmit = async (data: TaskForm) => {
    if (!id || !project) return
    setSaving(true)
    try {
      if (editingTask) {
        await tasksService.update(editingTask.id, data)
      } else {
        await tasksService.create({ ...data, projectId: id, projectName: project.title })
      }
      setTaskModal(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async () => {
    if (!deleteTask) return
    setSaving(true)
    try {
      await tasksService.delete(deleteTask.id)
      setDeleteTask(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!project) return <div className="text-white/40 text-center py-20">Project not found</div>

  const byStatus = (status: Task['status']) => tasks.filter(t => t.status === status)
  const statusCols: { key: Task['status']; label: string; color: string }[] = [
    { key: 'todo', label: 'To Do', color: 'border-white/10' },
    { key: 'in_progress', label: 'In Progress', color: 'border-brand-500/30' },
    { key: 'review', label: 'Review', color: 'border-accent-400/30' },
    { key: 'done', label: 'Done', color: 'border-success/30' },
  ]

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div>
        <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-accent-400/10 flex items-center justify-center border border-accent-400/20">
              <Briefcase size={24} className="text-accent-400" />
            </div>
            <div>
              <h1 className="page-title">{project.title}</h1>
              <p className="text-white/40 text-sm">{project.clientName || 'No client assigned'}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={project.priority} />
            <Badge status={project.status} />
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Budget', value: formatCurrency(project.budget), icon: <DollarSign size={15} /> },
          { label: 'Spent', value: formatCurrency(project.spent), icon: <DollarSign size={15} /> },
          { label: 'Start Date', value: formatDate(project.startDate), icon: <Calendar size={15} /> },
          { label: 'Deadline', value: formatDate(project.endDate), icon: <Calendar size={15} /> },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <div className="flex items-center gap-2 text-white/30 text-xs mb-1">{s.icon}{s.label}</div>
            <div className="font-semibold text-white">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Overall Progress</span>
          <span className="text-sm font-bold text-white">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-white/30">
          <span>{tasks.filter(t => t.status === 'done').length} of {tasks.length} tasks completed</span>
          <span>{tasks.filter(t => t.status === 'in_progress').length} in progress</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {(['overview', 'tasks', 'kanban'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-white border-brand-500' : 'text-white/40 border-transparent hover:text-white/70'}`}>
            {tab}
          </button>
        ))}
        <div className="ml-auto pb-1">
          <Button size="sm" icon={<Plus size={13} />} onClick={() => openTaskModal()}>Add Task</Button>
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-3">Description</h3>
          <p className="text-white/50 text-sm">{project.description || 'No description provided.'}</p>
          <div className="mt-4 grid grid-cols-3 gap-4">
            {statusCols.map(col => (
              <div key={col.key} className="text-center p-3 bg-white/5 rounded-lg">
                <div className="text-xl font-bold text-white">{byStatus(col.key).length}</div>
                <div className="text-xs text-white/40 mt-0.5">{col.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="card overflow-hidden">
          {tasks.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">No tasks yet. Add the first one!</div>
          ) : (
            <Table headers={['Task', 'Status', 'Priority', 'Type', 'Assignee', 'Due Date', 'Hours', 'Actions']}>
              {tasks.map(t => (
                <tr key={t.id} className="table-row">
                  <td className="td font-medium text-white max-w-xs truncate">{t.title}</td>
                  <td className="td"><Badge status={t.status} /></td>
                  <td className="td"><Badge status={t.priority} /></td>
                  <td className="td text-white/50 text-xs capitalize">{t.type}</td>
                  <td className="td text-white/50 text-xs">{t.assigneeName || '—'}</td>
                  <td className="td text-white/40 text-xs">{formatDate(t.dueDate)}</td>
                  <td className="td text-xs text-white/50">{t.spentHours}h / {t.estimatedHours}h</td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button onClick={() => openTaskModal(t)} className="p-1.5 hover:bg-white/10 rounded text-white/30 hover:text-white transition-colors"><Pencil size={12} /></button>
                      <button onClick={() => setDeleteTask(t)} className="p-1.5 hover:bg-danger/10 rounded text-white/30 hover:text-danger transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {activeTab === 'kanban' && (
        <div className="grid grid-cols-4 gap-4">
          {statusCols.map(col => (
            <div key={col.key} className={`flex flex-col gap-2 p-3 bg-white/[0.02] rounded-xl border ${col.color}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">{col.label}</span>
                <span className="text-xs bg-white/10 text-white/40 rounded-full px-2 py-0.5">{byStatus(col.key).length}</span>
              </div>
              {byStatus(col.key).map(task => (
                <div key={task.id} className="card p-3 hover:border-white/10 transition-all cursor-pointer" onClick={() => openTaskModal(task)}>
                  <div className="text-sm font-medium text-white/80 mb-2 line-clamp-2">{task.title}</div>
                  <div className="flex items-center justify-between">
                    <Badge status={task.priority} />
                    {task.dueDate && <span className="text-xs text-white/30">{formatDate(task.dueDate)}</span>}
                  </div>
                  {task.estimatedHours > 0 && (
                    <div className="mt-2">
                      <ProgressBar value={(task.spentHours / task.estimatedHours) * 100} />
                    </div>
                  )}
                </div>
              ))}
              <button onClick={() => openTaskModal()} className="w-full p-2 rounded-lg border border-dashed border-white/10 text-white/20 hover:text-white/40 hover:border-white/20 text-xs transition-colors">
                + Add task
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Task Modal */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title={editingTask ? 'Edit Task' : 'New Task'} size="lg">
        <form onSubmit={handleSubmit(onTaskSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Task Title" placeholder="Implement login page" {...register('title', { required: true })} />
          </div>
          <div className="col-span-2">
            <Textarea label="Description" placeholder="Task details…" {...register('description')} />
          </div>
          <Select label="Status" options={TASK_STATUS_OPTIONS} {...register('status')} />
          <Select label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
          <Select label="Type" options={TASK_TYPE_OPTIONS} {...register('type')} />
          <Input label="Assignee" placeholder="Team member name" {...register('assigneeName')} />
          <Input label="Start Date" type="date" {...register('startDate')} />
          <Input label="Due Date" type="date" {...register('dueDate')} />
          <Input label="Estimated Hours" type="number" min="0" {...register('estimatedHours', { valueAsNumber: true })} />
          <Input label="Spent Hours" type="number" min="0" {...register('spentHours', { valueAsNumber: true })} />
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setTaskModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingTask ? 'Save' : 'Create Task'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTask} onClose={() => setDeleteTask(null)} onConfirm={handleDeleteTask}
        title="Delete Task" message={`Delete task "${deleteTask?.title}"?`} loading={saving} />
    </div>
  )
}
