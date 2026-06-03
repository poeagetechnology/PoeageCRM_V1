import { useEffect, useState } from 'react'
import { Plus, UserCog, Mail, Phone, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  Button, Badge, SearchInput, Modal, Input, Select, Avatar,
  ConfirmDialog, EmptyState, LoadingSpinner, Table,
} from '@/components/ui'
import { employeesService } from '@/services/firestoreService'
import { formatDate, formatCurrency, statusLabels } from '@/lib/utils'
import type { Employee } from '@/types'

const DEPT_OPTIONS = ['engineering', 'design', 'marketing', 'finance', 'hr', 'operations', 'sales'].map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }))
const EMP_TYPE_OPTIONS = ['full_time', 'part_time', 'contractor', 'intern'].map(v => ({ value: v, label: statusLabels[v] }))
const STATUS_OPTIONS = ['active', 'inactive', 'on_leave'].map(v => ({ value: v, label: statusLabels[v] || v }))

type FormData = Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'skills'>

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Employee | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'table' | 'cards'>('cards')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>()

  const load = async () => {
    setLoading(true)
    try {
      setEmployees(await employeesService.getAll())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const openCreate = () => {
    setEditing(null)
    reset({ status: 'active', employmentType: 'full_time', department: 'engineering' })
    setModalOpen(true)
  }
  const openEdit = (e: Employee) => { setEditing(e); reset(e); setModalOpen(true) }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      if (editing) {
        await employeesService.update(editing.id, data)
      } else {
        await employeesService.create({ ...data, skills: [] })
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
      await employeesService.delete(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const filtered = employees.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase()) ||
      e.role.toLowerCase().includes(search.toLowerCase())
    const matchDept = !filterDept || e.department === filterDept
    const matchStatus = !filterStatus || e.status === filterStatus
    return matchSearch && matchDept && matchStatus
  })

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Employees</h1>
          <p className="text-white/40 text-sm mt-0.5">{employees.length} team members</p>
        </div>
        <div className="flex gap-2">
          <div className="flex items-center bg-surface-800 border border-white/10 rounded-lg p-0.5">
            <button onClick={() => setView('cards')} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === 'cards' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'}`}>Cards</button>
            <button onClick={() => setView('table')} className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${view === 'table' ? 'bg-brand-500 text-white' : 'text-white/40 hover:text-white'}`}>Table</button>
          </div>
          <Button icon={<Plus size={15} />} onClick={openCreate}>Add Employee</Button>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search employees…" />
        <select className="input w-40" value={filterDept} onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          {DEPT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select className="input w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={<UserCog size={32} />} title="No employees found" message="Add your team members to get started." action={<Button icon={<Plus size={15} />} onClick={openCreate} size="sm">Add Employee</Button>} />
      ) : view === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(e => (
            <div key={e.id} className="card p-5 flex flex-col gap-4 hover:border-white/10 transition-all">
              <div className="flex items-center gap-3">
                <Avatar name={e.name} url={e.avatarUrl} size="lg" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white truncate">{e.name}</div>
                  <div className="text-xs text-white/40 truncate">{e.role}</div>
                </div>
                <Badge status={e.status} />
              </div>
              <div className="flex flex-col gap-1.5 text-xs text-white/40">
                <span className="flex items-center gap-1.5"><Mail size={11} />{e.email}</span>
                {e.phone && <span className="flex items-center gap-1.5"><Phone size={11} />{e.phone}</span>}
              </div>
              <div className="flex items-center justify-between">
                <span className="badge bg-white/5 text-white/40 capitalize">{e.department}</span>
                <span className="text-xs text-white/30">{statusLabels[e.employmentType] || e.employmentType}</span>
              </div>
              {e.monthlySalary && (
                <div className="pt-3 border-t border-white/5 text-xs text-white/30">
                  Salary: <span className="text-white/60 font-medium">{formatCurrency(e.monthlySalary)}/mo</span>
                </div>
              )}
              <div className="flex gap-1 pt-1">
                <button onClick={() => openEdit(e)} className="flex-1 btn-secondary text-xs justify-center py-1.5"><Pencil size={11} /> Edit</button>
                <button onClick={() => setDeleteTarget(e)} className="p-1.5 hover:bg-danger/10 rounded-lg text-white/30 hover:text-danger transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <Table headers={['Employee', 'Role', 'Department', 'Type', 'Status', 'Salary', 'Joined', 'Actions']}>
            {filtered.map(e => (
              <tr key={e.id} className="table-row">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <Avatar name={e.name} url={e.avatarUrl} size="sm" />
                    <div>
                      <div className="font-medium text-white text-sm">{e.name}</div>
                      <div className="text-xs text-white/30">{e.email}</div>
                    </div>
                  </div>
                </td>
                <td className="td text-white/60">{e.role}</td>
                <td className="td text-white/50 capitalize">{e.department}</td>
                <td className="td"><span className="text-xs text-white/40">{statusLabels[e.employmentType]}</span></td>
                <td className="td"><Badge status={e.status} /></td>
                <td className="td text-white/50 text-xs">{e.monthlySalary ? formatCurrency(e.monthlySalary) + '/mo' : '—'}</td>
                <td className="td text-white/40 text-xs">{formatDate(e.joinDate)}</td>
                <td className="td">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(e)} className="p-1.5 hover:bg-white/10 rounded text-white/30 hover:text-white transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => setDeleteTarget(e)} className="p-1.5 hover:bg-danger/10 rounded text-white/30 hover:text-danger transition-colors"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Employee' : 'Add Employee'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <Input label="Full Name" placeholder="Jane Smith" error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="Email" type="email" placeholder="jane@company.com" error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Phone" placeholder="+1 555 0100" {...register('phone')} />
          <Input label="Role / Title" placeholder="Senior Developer" {...register('role')} />
          <Select label="Department" options={DEPT_OPTIONS} {...register('department')} />
          <Select label="Employment Type" options={EMP_TYPE_OPTIONS} {...register('employmentType')} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />
          <Input label="Join Date" type="date" {...register('joinDate')} />
          <Input label="Monthly Salary ($)" type="number" placeholder="5000" {...register('monthlySalary', { valueAsNumber: true })} />
          <Input label="Hourly Rate ($)" type="number" placeholder="50" {...register('hourlyRate', { valueAsNumber: true })} />
          <div className="col-span-2 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Add Employee'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Remove Employee" message={`Remove "${deleteTarget?.name}" from the team?`} loading={saving} />
    </div>
  )
}
