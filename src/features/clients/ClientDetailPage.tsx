import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Building2, Mail, Phone, MapPin, Plus, Pencil, Trash2, User } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { clientsService, contactsService, projectsService } from '@/services/firestoreService'
import { Button, Badge, Modal, Input, LoadingSpinner, ProgressBar, Table, ConfirmDialog } from '@/components/ui'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Client, Contact, Project } from '@/types'

export function ClientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [client, setClient] = useState<Client | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [contactModal, setContactModal] = useState(false)
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const [deleteContact, setDeleteContact] = useState<Contact | null>(null)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'contacts' | 'projects'>('overview')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<Omit<Contact, 'id' | 'clientId' | 'createdAt'>>()

  const load = async () => {
    if (!id) return
    setLoading(true)
    try {
      const [c, ctcts, projs] = await Promise.all([
        clientsService.getById(id),
        contactsService.getAll([contactsService.where('clientId', '==', id)]),
        projectsService.getAll([projectsService.where('clientId', '==', id)]),
      ])
      setClient(c)
      setContacts(ctcts)
      setProjects(projs)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  const openContactModal = (c?: Contact) => {
    setEditingContact(c || null)
    reset(c ? { name: c.name, email: c.email, phone: c.phone, role: c.role, isPrimary: c.isPrimary } : { isPrimary: false })
    setContactModal(true)
  }

  const onContactSubmit = async (data: any) => {
    if (!id) return
    setSaving(true)
    try {
      if (editingContact) {
        await contactsService.update(editingContact.id, data)
      } else {
        await contactsService.create({ ...data, clientId: id })
      }
      setContactModal(false)
      load()
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteContact = async () => {
    if (!deleteContact) return
    setSaving(true)
    try {
      await contactsService.delete(deleteContact.id)
      setDeleteContact(null)
      load()
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!client) return <div className="text-white/40 text-center py-20">Client not found</div>

  const TABS = ['overview', 'contacts', 'projects'] as const

  return (
    <div className="flex flex-col gap-6 animate-in">
      {/* Back + Header */}
      <div>
        <Link to="/clients" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors mb-4">
          <ArrowLeft size={14} /> Back to Clients
        </Link>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-brand-500/10 flex items-center justify-center border border-brand-500/20">
              <Building2 size={24} className="text-brand-400" />
            </div>
            <div>
              <h1 className="page-title">{client.name}</h1>
              <p className="text-white/40 text-sm">{client.company}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge status={client.status} />
            <Badge status={client.onboardingStage} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5 pb-0">
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${activeTab === tab ? 'text-white border-brand-500' : 'text-white/40 border-transparent hover:text-white/70'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card p-6">
            <h3 className="font-semibold text-white mb-4">Client Information</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: <Mail size={14} />, label: 'Email', value: client.email },
                { icon: <Phone size={14} />, label: 'Phone', value: client.phone || '—' },
                { icon: <Building2 size={14} />, label: 'Industry', value: client.industry },
                { icon: <MapPin size={14} />, label: 'Address', value: client.address || '—' },
              ].map(item => (
                <div key={item.label} className="p-3 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-2 text-white/30 text-xs mb-1">{item.icon}{item.label}</div>
                  <div className="text-sm text-white/80">{item.value}</div>
                </div>
              ))}
            </div>
            {client.notes && (
              <div className="mt-4 p-3 bg-white/5 rounded-lg">
                <div className="text-xs text-white/30 mb-1">Notes</div>
                <p className="text-sm text-white/70">{client.notes}</p>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-4">
            <div className="card p-5">
              <div className="text-xs text-white/30 mb-1">Total Projects</div>
              <div className="text-2xl font-display font-bold text-white">{projects.length}</div>
            </div>
            <div className="card p-5">
              <div className="text-xs text-white/30 mb-1">Total Budget</div>
              <div className="text-2xl font-display font-bold text-white">
                {formatCurrency(projects.reduce((s, p) => s + (p.budget || 0), 0))}
              </div>
            </div>
            <div className="card p-5">
              <div className="text-xs text-white/30 mb-1">Member Since</div>
              <div className="text-lg font-semibold text-white">{formatDate(client.createdAt)}</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'contacts' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-white/5">
            <h3 className="font-semibold text-white">Contacts ({contacts.length})</h3>
            <Button size="sm" icon={<Plus size={13} />} onClick={() => openContactModal()}>Add Contact</Button>
          </div>
          {contacts.length === 0 ? (
            <div className="py-12 text-center text-white/30 text-sm">No contacts yet</div>
          ) : (
            <Table headers={['Name', 'Role', 'Email', 'Phone', 'Primary', 'Actions']}>
              {contacts.map(c => (
                <tr key={c.id} className="table-row">
                  <td className="td font-medium text-white">{c.name}</td>
                  <td className="td text-white/50">{c.role}</td>
                  <td className="td"><a href={`mailto:${c.email}`} className="text-brand-400 hover:text-brand-300 text-xs">{c.email}</a></td>
                  <td className="td text-white/50 text-xs">{c.phone || '—'}</td>
                  <td className="td">{c.isPrimary && <span className="badge bg-success/10 text-success">Primary</span>}</td>
                  <td className="td">
                    <div className="flex gap-1">
                      <button onClick={() => openContactModal(c)} className="p-1.5 hover:bg-white/10 rounded text-white/30 hover:text-white transition-colors"><Pencil size={12} /></button>
                      <button onClick={() => setDeleteContact(c)} className="p-1.5 hover:bg-danger/10 rounded text-white/30 hover:text-danger transition-colors"><Trash2 size={12} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="flex flex-col gap-3">
          {projects.length === 0 ? (
            <div className="card py-12 text-center text-white/30 text-sm">No projects linked to this client</div>
          ) : (
            projects.map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="card p-4 hover:border-white/10 transition-all flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium text-white">{p.title}</div>
                  <div className="text-xs text-white/30 mt-0.5">{formatDate(p.startDate)} → {formatDate(p.endDate)}</div>
                  <ProgressBar value={p.progress} className="mt-2 max-w-xs" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">{formatCurrency(p.budget)}</div>
                    <div className="text-xs text-white/30">budget</div>
                  </div>
                  <Badge status={p.status} />
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Contact Modal */}
      <Modal open={contactModal} onClose={() => setContactModal(false)} title={editingContact ? 'Edit Contact' : 'Add Contact'} size="md">
        <form onSubmit={handleSubmit(onContactSubmit)} className="flex flex-col gap-4">
          <Input label="Name" placeholder="Jane Doe" error={errors.name?.message} {...register('name', { required: 'Required' })} />
          <Input label="Role" placeholder="CTO" {...register('role')} />
          <Input label="Email" type="email" placeholder="jane@company.com" error={errors.email?.message} {...register('email', { required: 'Required' })} />
          <Input label="Phone" placeholder="+1 555 0100" {...register('phone')} />
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" {...register('isPrimary')} className="w-4 h-4 accent-blue-500" />
            <span className="text-sm text-white/70">Primary contact</span>
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={() => setContactModal(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editingContact ? 'Save' : 'Add Contact'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteContact} onClose={() => setDeleteContact(null)} onConfirm={handleDeleteContact}
        title="Delete Contact" message={`Remove "${deleteContact?.name}" from this client?`} loading={saving} />
    </div>
  )
}
