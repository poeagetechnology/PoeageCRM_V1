import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Building2, Mail, Phone, ExternalLink, Pencil, Trash2, Users } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  Button, Badge, SearchInput, Modal, Input, Select, Textarea,
  ConfirmDialog, EmptyState, LoadingSpinner, Table,
} from '@/components/ui'
import { clientsService } from '@/services/firestoreService'
import { formatDate, statusLabels } from '@/lib/utils'
import type { Client, ClientStatus, OnboardingStage } from '@/types'

const STATUS_OPTIONS = ['active', 'prospect', 'inactive', 'churned'].map(v => ({ value: v, label: statusLabels[v] }))
const STAGE_OPTIONS = ['lead', 'proposal', 'negotiation', 'onboarded', 'completed'].map(v => ({ value: v, label: statusLabels[v] }))
const INDUSTRY_OPTIONS = ['Technology', 'Healthcare', 'Finance', 'Retail', 'Education', 'Manufacturing', 'Media', 'Other'].map(v => ({ value: v, label: v }))

type FormData = Omit<Client, 'id' | 'createdAt' | 'updatedAt'>

export function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const load = async () => {
    setLoading(true)
    try {
      const data = await clientsService.getAll()
      setClients(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); reset({ status: 'prospect', onboardingStage: 'lead' }); setModalOpen(true) }
  const openEdit = (c: Client) => { setEditing(c); reset(c); setModalOpen(true) }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const payload = {
        ...data,
        status: data.status || 'prospect',
        onboardingStage: data.onboardingStage || 'lead',
      }

      if (editing) {
        await clientsService.update(editing.id, payload)
      } else {
        await clientsService.create(payload)
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
      await clientsService.delete(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !filterStatus || c.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clients</h1>
          <p className="text-white/40 text-sm mt-0.5">{clients.length} total clients</p>
        </div>
        <Button icon={<Plus size={15} />} onClick={openCreate}>New Client</Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search clients…" />
        <select className="input w-40" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={<Users size={32} />} title="No clients found" message="Add your first client to get started." action={<Button icon={<Plus size={15} />} onClick={openCreate} size="sm">Add Client</Button>} />
      ) : (
        <div className="card overflow-hidden">
          <Table headers={['Client', 'Industry', 'Status', 'Stage', 'Contact', 'Added', 'Actions']}>
            {filtered.map(c => (
              <tr key={c.id} className="table-row">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center shrink-0">
                      <Building2 size={14} className="text-brand-400" />
                    </div>
                    <div>
                      <Link to={`/clients/${c.id}`} className="font-medium text-white hover:text-brand-400 transition-colors">{c.name}</Link>
                      <div className="text-xs text-white/30">{c.company}</div>
                    </div>
                  </div>
                </td>
                <td className="td text-white/50">{c.industry}</td>
                <td className="td"><Badge status={c.status} /></td>
                <td className="td"><Badge status={c.onboardingStage} /></td>
                <td className="td">
                  <div className="flex flex-col gap-0.5">
                    <a href={`mailto:${c.email}`} className="text-xs text-white/50 hover:text-brand-400 flex items-center gap-1 transition-colors">
                      <Mail size={11} />{c.email}
                    </a>
                    {c.phone && <span className="text-xs text-white/30 flex items-center gap-1"><Phone size={11} />{c.phone}</span>}
                  </div>
                </td>
                <td className="td text-white/40 text-xs">{formatDate(c.createdAt)}</td>
                <td className="td">
                  <div className="flex items-center gap-1">
                    <Link to={`/clients/${c.id}`} className="p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-brand-400 transition-colors" title="View">
                      <ExternalLink size={13} />
                    </Link>
                    <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-white/10 rounded-lg text-white/30 hover:text-white transition-colors" title="Edit">
                      <Pencil size={13} />
                    </button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1.5 hover:bg-danger/10 rounded-lg text-white/30 hover:text-danger transition-colors" title="Delete">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Client' : 'New Client'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="John Doe" error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="Company" placeholder="Acme Corp" error={errors.company?.message} {...register('company', { required: 'Required' })} />
          <Input label="Email" type="email" placeholder="john@acme.com" error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Phone" placeholder="+1 555 0100" {...register('phone')} />
          <Select label="Industry" options={INDUSTRY_OPTIONS} placeholder="Select industry" {...register('industry')} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
          <Select label="Onboarding Stage" options={STAGE_OPTIONS} {...register('onboardingStage')} />
          <Input label="Address" placeholder="123 Main St, City" {...register('address')} />
          <div className="col-span-2">
            <Textarea label="Notes" placeholder="Any additional notes about this client…" {...register('notes')} />
          </div>
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Create Client'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Client"
        message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        loading={saving}
      />
    </div>
  )
}
