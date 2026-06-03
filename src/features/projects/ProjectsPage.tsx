import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Briefcase, ExternalLink, Pencil, Trash2, Calendar } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  Button, Badge, SearchInput, Modal, Input, Select, Textarea,
  ConfirmDialog, EmptyState, LoadingSpinner, ProgressBar, Table,
} from '@/components/ui'
import { projectsService, clientsService } from '@/services/firestoreService'
import { formatDate, formatCurrency, statusLabels } from '@/lib/utils'
import type { Project, Client } from '@/types'

const STATUS_OPTIONS = ['planning', 'active', 'on_hold', 'completed', 'cancelled'].map(v => ({ value: v, label: statusLabels[v] }))
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'].map(v => ({ value: v, label: statusLabels[v] }))
const TYPE_OPTIONS = [{ value: 'fixed', label: 'Fixed Price' }, { value: 'hourly', label: 'Hourly' }, { value: 'retainer', label: 'Retainer' }]

type FormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'teamMemberIds'>

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const load = async () => {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([projectsService.getAll(), clientsService.getAll()])
      setProjects(p)
      setClients(c)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const clientOptions = clients.map(c => ({ value: c.id, label: `${c.name} — ${c.company}` }))

  const openCreate = () => {
    setEditing(null)
    reset({ status: 'planning', priority: 'medium', type: 'fixed', progress: 0, budget: 0, spent: 0, tags: [] })
    setModalOpen(true)
  }

  const openEdit = (p: Project) => { setEditing(p); reset(p); setModalOpen(true) }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const clientName = clients.find(c => c.id === data.clientId)?.name || ''
      if (editing) {
        await projectsService.update(editing.id, { ...data, clientName })
      } else {
        await projectsService.create({ ...data, clientName, teamMemberIds: [], tags: [] })
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
      await projectsService.delete(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const filtered = projects.filter(p =>
    (p.title.toLowerCase().includes(search.toLowerCase()) || (p.clientName || '').toLowerCase().includes(search.toLowerCase())) &&
    (!filterStatus || p.status === filterStatus)
  )

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="text-white/40 text-sm mt-0.5">{projects.length} total projects</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>New Project</Button>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search projects…" />
        <select className="input w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={<Briefcase size={32} />} title="No projects found" message="Create your first project to start tracking work." action={<Button icon={<Plus size={15} />} onClick={openCreate} size="sm">New Project</Button>} />
      ) : (
        <div className="card overflow-hidden">
          <Table headers={['Project', 'Client', 'Status', 'Priority', 'Progress', 'Budget', 'Deadline', 'Actions']}>
            {filtered.map(p => (
              <tr key={p.id} className="table-row">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-400/10 flex items-center justify-center shrink-0">
                      <Briefcase size={14} className="text-accent-400" />
                    </div>
                    <Link to={`/projects/${p.id}`} className="font-medium text-white hover:text-brand-400 transition-colors">{p.title}</Link>
                  </div>
                </td>
                <td className="td">
                  {p.clientId ? (
                    <Link to={`/clients/${p.clientId}`} className="text-white/50 hover:text-brand-400 transition-colors text-xs">{p.clientName}</Link>
                  ) : <span className="text-white/30">—</span>}
                </td>
                <td className="td"><Badge status={p.status} /></td>
                <td className="td"><Badge status={p.priority} /></td>
                <td className="td w-32">
                  <div className="flex items-center gap-2">
                    <ProgressBar value={p.progress} className="flex-1" />
                    <span className="text-xs text-white/40 shrink-0">{p.progress}%</span>
                  </div>
                </td>
                <td className="td text-white/60 text-xs">{formatCurrency(p.budget)}</td>
                <td className="td">
                  <span className="text-xs text-white/40 flex items-center gap-1">
                    <Calendar size={11} />{formatDate(p.endDate)}
                  </span>
                </td>
                <td className="td">
                  <div className="flex gap-1">
                    <Link to={`/projects/${p.id}`} className="p-1.5 hover:bg-white/10 rounded text-white/30 hover:text-brand-400 transition-colors"><ExternalLink size={13} /></Link>
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-white/10 rounded text-white/30 hover:text-white transition-colors"><Pencil size={13} /></button>
                    <button onClick={() => setDeleteTarget(p)} className="p-1.5 hover:bg-danger/10 rounded text-white/30 hover:text-danger transition-colors"><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Project' : 'New Project'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Project Title" placeholder="Website Redesign" error={errors.title?.message} {...register('title', { required: 'Required' })} />
          </div>
          <div className="col-span-2">
            <Textarea label="Description" placeholder="Brief project description…" {...register('description')} />
          </div>
          <Select label="Client" options={clientOptions} placeholder="Select client" {...register('clientId')} />
          <Select label="Type" options={TYPE_OPTIONS} {...register('type')} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
          <Select label="Priority" options={PRIORITY_OPTIONS} {...register('priority')} />
          <Input label="Start Date" type="date" {...register('startDate')} />
          <Input label="End Date" type="date" {...register('endDate')} />
          <Input label="Budget ($)" type="number" placeholder="10000" {...register('budget', { valueAsNumber: true })} />
          <Input label="Progress (%)" type="number" min="0" max="100" placeholder="0" {...register('progress', { valueAsNumber: true })} />
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Create Project'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Project" message={`Delete "${deleteTarget?.title}"? This cannot be undone.`} loading={saving} />
    </div>
  )
}
