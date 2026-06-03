import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { doc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { useAuthStore } from '@/hooks/useAuthStore'
import { Avatar, Button, Input, Select } from '@/components/ui'
import { User, Lock, Bell, Shield, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { authService } from '@/services/authService'

const ROLE_OPTIONS = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'developer', label: 'Developer' },
  { value: 'hr', label: 'HR' },
  { value: 'finance', label: 'Finance' },
]

const DEPT_OPTIONS = [
  'Engineering', 'Design', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales'
].map(v => ({ value: v.toLowerCase(), label: v }))

export function ProfilePage() {
  const { user, setUser, logout } = useAuthStore()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'profile' | 'security' | 'notifications'>('profile')
  const [saving, setSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [pwError, setPwError] = useState('')
  const [pwSuccess, setPwSuccess] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { displayName: user?.displayName || '', department: user?.department || '', role: user?.role || 'developer' },
  })

  const { register: regPw, handleSubmit: handlePwSubmit, reset: resetPw } = useForm<{ current: string; next: string; confirm: string }>()

  const onProfileSubmit = async (data: any) => {
    if (!auth.currentUser) return
    setSaving(true)
    setProfileSuccess(false)
    try {
      await updateProfile(auth.currentUser, { displayName: data.displayName })
      await updateDoc(doc(db, 'users', auth.currentUser.uid), { displayName: data.displayName, department: data.department, role: data.role })
      setUser({ ...user!, displayName: data.displayName, department: data.department, role: data.role })
      setProfileSuccess(true)
      setTimeout(() => setProfileSuccess(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  const onPwSubmit = async (data: any) => {
    if (!auth.currentUser?.email) return
    if (data.next !== data.confirm) { setPwError('Passwords do not match'); return }
    if (data.next.length < 6) { setPwError('Min 6 characters'); return }
    setPwError('')
    setPwSaving(true)
    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, data.current)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, data.next)
      resetPw()
      setPwSuccess(true)
      setTimeout(() => setPwSuccess(false), 3000)
    } catch (e: any) {
      setPwError(e.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to update password.')
    } finally {
      setPwSaving(false)
    }
  }

  const handleSignOut = async () => {
    await authService.signOut()
    logout()
    navigate('/signin')
  }

  const TABS = [
    { key: 'profile', label: 'Profile', icon: <User size={15} /> },
    { key: 'security', label: 'Security', icon: <Lock size={15} /> },
    { key: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
  ] as const

  return (
    <div className="flex flex-col gap-6 animate-in max-w-2xl">
      <div>
        <h1 className="page-title">Settings</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage your account and preferences</p>
      </div>

      {/* Profile header */}
      <div className="card p-6 flex items-center gap-5">
        <Avatar name={user?.displayName || 'User'} url={user?.photoURL} size="xl" />
        <div>
          <div className="font-display font-bold text-xl text-white">{user?.displayName}</div>
          <div className="text-white/40 text-sm">{user?.email}</div>
          <div className="mt-1.5">
            <span className="badge bg-brand-500/10 text-brand-400">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-white/5">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${tab === t.key ? 'text-white border-brand-500' : 'text-white/40 border-transparent hover:text-white/70'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-5">Personal Information</h3>
          {profileSuccess && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">
              Profile updated successfully!
            </div>
          )}
          <form onSubmit={handleSubmit(onProfileSubmit)} className="flex flex-col gap-4">
            <Input label="Display Name" placeholder="Your name" {...register('displayName', { required: 'Required' })} />
            <div className="flex flex-col gap-1">
              <label className="label">Email</label>
              <input className="input opacity-50 cursor-not-allowed" value={user?.email || ''} disabled />
              <p className="text-xs text-white/30">Email cannot be changed here</p>
            </div>
            <Select label="Role" options={ROLE_OPTIONS} {...register('role')} />
            <Select label="Department" options={DEPT_OPTIONS} placeholder="Select department" {...register('department')} />
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-5">Change Password</h3>
          {pwError && (
            <div className="mb-4 p-3 bg-danger/10 border border-danger/20 rounded-lg text-sm text-danger">{pwError}</div>
          )}
          {pwSuccess && (
            <div className="mb-4 p-3 bg-success/10 border border-success/20 rounded-lg text-sm text-success">Password updated!</div>
          )}
          <form onSubmit={handlePwSubmit(onPwSubmit)} className="flex flex-col gap-4">
            <Input label="Current Password" type="password" placeholder="••••••••" {...regPw('current', { required: true })} />
            <Input label="New Password" type="password" placeholder="Min 6 characters" {...regPw('next', { required: true, minLength: 6 })} />
            <Input label="Confirm New Password" type="password" placeholder="Repeat new password" {...regPw('confirm', { required: true })} />
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={pwSaving}>Update Password</Button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
            <h3 className="font-semibold text-white mb-2">Danger Zone</h3>
            <p className="text-sm text-white/40 mb-4">Sign out from all sessions</p>
            <Button variant="danger" icon={<LogOut size={15} />} onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <div className="card p-6">
          <h3 className="font-semibold text-white mb-5">Notification Preferences</h3>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Task assigned to me', desc: 'Notify when a task is assigned to you' },
              { label: 'Project deadline approaching', desc: '3 days before project deadline' },
              { label: 'Payroll processed', desc: 'When your payslip is ready' },
              { label: 'Client message', desc: 'New messages from clients' },
              { label: 'Invoice overdue', desc: 'When an invoice becomes overdue' },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-white/80">{n.label}</div>
                  <div className="text-xs text-white/30 mt-0.5">{n.desc}</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-surface-600 peer-checked:bg-brand-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                </label>
              </div>
            ))}
          </div>
          <div className="flex justify-end mt-6">
            <Button onClick={() => {}}>Save Preferences</Button>
          </div>
        </div>
      )}
    </div>
  )
}
