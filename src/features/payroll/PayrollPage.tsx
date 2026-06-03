import { useEffect, useState } from 'react'
import { Plus, CreditCard, Download, Pencil, Trash2, Calculator } from 'lucide-react'
import { useForm } from 'react-hook-form'
import {
  Button, Badge, SearchInput, Modal, Input, Select,
  ConfirmDialog, EmptyState, LoadingSpinner, Table,
} from '@/components/ui'
import { payrollService, employeesService } from '@/services/firestoreService'
import { formatCurrency, statusLabels } from '@/lib/utils'
import type { PayrollRecord, Employee } from '@/types'

const STATUS_OPTIONS = ['draft', 'pending', 'approved', 'paid'].map(v => ({ value: v, label: statusLabels[v] }))

type FormData = Omit<PayrollRecord, 'id' | 'createdAt' | 'employeeName' | 'netPay'>

export function PayrollPage() {
  const [records, setRecords] = useState<PayrollRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PayrollRecord | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PayrollRecord | null>(null)
  const [saving, setSaving] = useState(false)

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>()

  // Auto-calculate net pay
  const watched = watch(['baseSalary', 'allowances', 'deductions', 'overtimePay', 'incentives', 'tax'])
  const calcNet = () => {
    const [base, allow, ded, ot, inc, tax] = watched.map(v => Number(v) || 0)
    return base + allow + ot + inc - ded - tax
  }

  const load = async () => {
    setLoading(true)
    try {
      const [r, e] = await Promise.all([payrollService.getAll(), employeesService.getAll()])
      setRecords(r)
      setEmployees(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const employeeOptions = employees.map(e => ({ value: e.id, label: e.name }))

  const openCreate = () => {
    setEditing(null)
    reset({ status: 'draft', baseSalary: 0, allowances: 0, deductions: 0, overtimeHours: 0, overtimePay: 0, incentives: 0, tax: 0, period: new Date().toISOString().slice(0, 7) })
    setModalOpen(true)
  }

  const openEdit = (r: PayrollRecord) => { setEditing(r); reset(r); setModalOpen(true) }

  const onSubmit = async (data: FormData) => {
    setSaving(true)
    try {
      const employeeName = employees.find(e => e.id === data.employeeId)?.name || ''
      const netPay = calcNet()
      if (editing) {
        await payrollService.update(editing.id, { ...data, employeeName, netPay })
      } else {
        await payrollService.create({ ...data, employeeName, netPay })
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
      await payrollService.delete(deleteTarget.id)
      setDeleteTarget(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  const filtered = records.filter(r =>
    r.employeeName.toLowerCase().includes(search.toLowerCase()) &&
    (!filterStatus || r.status === filterStatus)
  )

  const totalNet = filtered.reduce((s, r) => s + (r.netPay || 0), 0)
  const totalGross = filtered.reduce((s, r) => s + (r.baseSalary || 0) + (r.allowances || 0) + (r.overtimePay || 0) + (r.incentives || 0), 0)

  return (
    <div className="flex flex-col gap-6 animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Payroll</h1>
          <p className="text-white/40 text-sm mt-0.5">{records.length} payroll records</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<Download size={15} />} onClick={() => alert('Export coming soon')}>Export CSV</Button>
          <Button icon={<Plus size={15} />} onClick={openCreate}>New Record</Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="text-xs text-white/30 mb-1">Total Gross Pay</div>
          <div className="text-2xl font-display font-bold text-white">{formatCurrency(totalGross)}</div>
          <div className="text-xs text-white/30 mt-1">{filtered.length} records</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-white/30 mb-1">Total Net Pay</div>
          <div className="text-2xl font-display font-bold text-success">{formatCurrency(totalNet)}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-white/30 mb-1">Total Deductions + Tax</div>
          <div className="text-2xl font-display font-bold text-danger">{formatCurrency(totalGross - totalNet)}</div>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <SearchInput value={search} onChange={setSearch} placeholder="Search employee…" />
        <select className="input w-36" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : filtered.length === 0 ? (
        <EmptyState icon={<CreditCard size={32} />} title="No payroll records" message="Create payroll records for your team members." action={<Button icon={<Plus size={15} />} onClick={openCreate} size="sm">New Record</Button>} />
      ) : (
        <div className="card overflow-hidden">
          <Table headers={['Employee', 'Period', 'Base Salary', 'Allowances', 'Deductions', 'Tax', 'Net Pay', 'Status', 'Actions']}>
            {filtered.map(r => (
              <tr key={r.id} className="table-row">
                <td className="td font-medium text-white">{r.employeeName}</td>
                <td className="td text-white/50 font-mono text-xs">{r.period}</td>
                <td className="td text-white/70 text-xs">{formatCurrency(r.baseSalary)}</td>
                <td className="td text-success text-xs">+{formatCurrency(r.allowances + r.overtimePay + r.incentives)}</td>
                <td className="td text-danger text-xs">-{formatCurrency(r.deductions)}</td>
                <td className="td text-danger text-xs">-{formatCurrency(r.tax)}</td>
                <td className="td">
                  <span className="font-semibold text-white">{formatCurrency(r.netPay)}</span>
                </td>
                <td className="td"><Badge status={r.status} /></td>
                <td className="td">
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(r)} className="p-1.5 hover:bg-white/10 rounded text-white/30 hover:text-white transition-colors"><Pencil size={12} /></button>
                    <button onClick={() => setDeleteTarget(r)} className="p-1.5 hover:bg-danger/10 rounded text-white/30 hover:text-danger transition-colors"><Trash2 size={12} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Payroll Record' : 'New Payroll Record'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-3 gap-4">
          <Select label="Employee" options={employeeOptions} placeholder="Select employee" error={errors.employeeId?.message} {...register('employeeId', { required: 'Required' })} />
          <Input label="Pay Period" type="month" error={errors.period?.message} {...register('period', { required: 'Required' })} />
          <Select label="Status" options={STATUS_OPTIONS} {...register('status')} />

          <div className="col-span-3 border-t border-white/5 pt-4">
            <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">Earnings</p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Base Salary ($)" type="number" min="0" {...register('baseSalary', { valueAsNumber: true })} />
              <Input label="Allowances ($)" type="number" min="0" {...register('allowances', { valueAsNumber: true })} />
              <Input label="Incentives ($)" type="number" min="0" {...register('incentives', { valueAsNumber: true })} />
              <Input label="Overtime Hours" type="number" min="0" {...register('overtimeHours', { valueAsNumber: true })} />
              <Input label="Overtime Pay ($)" type="number" min="0" {...register('overtimePay', { valueAsNumber: true })} />
            </div>
          </div>

          <div className="col-span-3 border-t border-white/5 pt-4">
            <p className="text-xs text-white/30 uppercase tracking-wider font-medium mb-3">Deductions</p>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Deductions ($)" type="number" min="0" {...register('deductions', { valueAsNumber: true })} />
              <Input label="Tax ($)" type="number" min="0" {...register('tax', { valueAsNumber: true })} />
            </div>
          </div>

          {/* Net Pay Preview */}
          <div className="col-span-3 p-4 bg-white/5 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <Calculator size={15} />
              Calculated Net Pay
            </div>
            <div className="text-xl font-display font-bold text-success">{formatCurrency(calcNet())}</div>
          </div>

          <div className="col-span-3 flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Create Record'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Payroll Record" message={`Delete payroll record for "${deleteTarget?.employeeName}" (${deleteTarget?.period})?`} loading={saving} />
    </div>
  )
}
