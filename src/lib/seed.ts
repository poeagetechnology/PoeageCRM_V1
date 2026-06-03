/**
 * SEED SCRIPT — populate Firestore with demo data
 * Usage: copy this file, set your Firebase config, run once in browser console
 * or create a Node.js script that imports firebase-admin.
 *
 * Browser usage:
 *   1. Open your deployed app and sign in
 *   2. Open browser console
 *   3. Paste the seed functions and call seedAll()
 */

import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const now = new Date().toISOString()
const daysAgo = (n: number) => new Date(Date.now() - n * 864e5).toISOString()
const daysAhead = (n: number) => new Date(Date.now() + n * 864e5).toISOString()

async function add(col: string, data: object) {
  return addDoc(collection(db, col), { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() })
}

export async function seedClients() {
  const clients = [
    { name: 'John Smith', company: 'Acme Corp', email: 'john@acme.com', phone: '+1 555 0101', industry: 'Technology', status: 'active', onboardingStage: 'onboarded', notes: 'Key enterprise client.' },
    { name: 'Sarah Lee', company: 'Bright Media', email: 'sarah@bright.io', phone: '+1 555 0102', industry: 'Media', status: 'prospect', onboardingStage: 'proposal', notes: 'Interested in full-stack development.' },
    { name: 'Mike Tan', company: 'HealthFirst', email: 'mike@hf.com', phone: '+1 555 0103', industry: 'Healthcare', status: 'active', onboardingStage: 'onboarded', notes: 'HIPAA compliance required.' },
    { name: 'Anna Cole', company: 'RetailX', email: 'anna@rx.com', phone: '+1 555 0104', industry: 'Retail', status: 'inactive', onboardingStage: 'lead', notes: 'On hold due to budget constraints.' },
    { name: 'David Park', company: 'FinanceHub', email: 'd.park@finhub.com', phone: '+1 555 0105', industry: 'Finance', status: 'active', onboardingStage: 'completed', notes: 'Long-term retainer client.' },
  ]
  const refs = []
  for (const c of clients) refs.push(await add('clients', c))
  console.log('✅ Seeded', clients.length, 'clients')
  return refs
}

export async function seedEmployees() {
  const employees = [
    { name: 'Arun Kumar', email: 'arun@company.com', phone: '+1 555 1001', role: 'Senior Developer', department: 'engineering', employmentType: 'full_time', status: 'active', monthlySalary: 6200, hourlyRate: 75, skills: ['React', 'Node.js', 'Firebase'], joinDate: daysAgo(400) },
    { name: 'Priya Sharma', email: 'priya@company.com', phone: '+1 555 1002', role: 'UI/UX Designer', department: 'design', employmentType: 'full_time', status: 'active', monthlySalary: 5400, hourlyRate: 65, skills: ['Figma', 'Tailwind', 'Prototyping'], joinDate: daysAgo(300) },
    { name: 'Maya Raj', email: 'maya@company.com', phone: '+1 555 1003', role: 'Project Manager', department: 'operations', employmentType: 'full_time', status: 'active', monthlySalary: 7100, hourlyRate: 85, skills: ['Agile', 'Scrum', 'JIRA'], joinDate: daysAgo(500) },
    { name: 'James Tran', email: 'james@company.com', phone: '+1 555 1004', role: 'QA Engineer', department: 'engineering', employmentType: 'full_time', status: 'on_leave', monthlySalary: 5000, hourlyRate: 60, skills: ['Selenium', 'Cypress', 'Jest'], joinDate: daysAgo(200) },
    { name: 'Lena Chen', email: 'lena@company.com', phone: '+1 555 1005', role: 'Finance Lead', department: 'finance', employmentType: 'full_time', status: 'active', monthlySalary: 6800, hourlyRate: 80, skills: ['QuickBooks', 'Excel', 'SAP'], joinDate: daysAgo(600) },
    { name: 'Dev Patel', email: 'dev@company.com', phone: '+1 555 1006', role: 'Backend Developer', department: 'engineering', employmentType: 'contractor', status: 'active', hourlyRate: 90, skills: ['Python', 'Django', 'PostgreSQL'], joinDate: daysAgo(150) },
  ]
  const refs = []
  for (const e of employees) refs.push(await add('employees', e))
  console.log('✅ Seeded', employees.length, 'employees')
  return refs
}

export async function seedProjects(clientIds: string[]) {
  const projects = [
    { title: 'Website Redesign', description: 'Full redesign of corporate website with modern UI.', clientId: clientIds[0], clientName: 'Acme Corp', status: 'active', priority: 'high', type: 'fixed', startDate: daysAgo(60), endDate: daysAhead(30), budget: 24000, spent: 18700, progress: 78, teamMemberIds: [], tags: ['design', 'frontend'] },
    { title: 'Mobile App v2', description: 'React Native mobile app for content delivery.', clientId: clientIds[1], clientName: 'Bright Media', status: 'planning', priority: 'critical', type: 'hourly', startDate: daysAgo(14), endDate: daysAhead(90), budget: 48000, spent: 8000, progress: 45, teamMemberIds: [], tags: ['mobile', 'react-native'] },
    { title: 'ERP Integration', description: 'Healthcare ERP system integration with existing tools.', clientId: clientIds[2], clientName: 'HealthFirst', status: 'active', priority: 'medium', type: 'fixed', startDate: daysAgo(90), endDate: daysAhead(10), budget: 65000, spent: 59000, progress: 92, teamMemberIds: [], tags: ['backend', 'integration'] },
    { title: 'Brand Guidelines', description: 'Complete brand identity and guidelines document.', clientId: clientIds[3], clientName: 'RetailX', status: 'on_hold', priority: 'low', type: 'fixed', startDate: daysAgo(30), endDate: daysAhead(60), budget: 12000, spent: 2400, progress: 20, teamMemberIds: [], tags: ['design', 'branding'] },
    { title: 'Financial Dashboard', description: 'Real-time analytics dashboard for portfolio tracking.', clientId: clientIds[4], clientName: 'FinanceHub', status: 'active', priority: 'high', type: 'retainer', startDate: daysAgo(20), endDate: daysAhead(45), budget: 35000, spent: 14000, progress: 55, teamMemberIds: [], tags: ['analytics', 'dashboard'] },
  ]
  const refs = []
  for (const p of projects) refs.push(await add('projects', p))
  console.log('✅ Seeded', projects.length, 'projects')
  return refs
}

export async function seedTasks(projectIds: string[]) {
  const tasks = [
    { title: 'Implement auth module', projectId: projectIds[0], projectName: 'Website Redesign', status: 'in_progress', priority: 'critical', type: 'development', estimatedHours: 16, spentHours: 12, assigneeName: 'Arun Kumar', dueDate: daysAhead(5) },
    { title: 'Homepage UI components', projectId: projectIds[0], projectName: 'Website Redesign', status: 'review', priority: 'high', type: 'design', estimatedHours: 8, spentHours: 8, assigneeName: 'Priya Sharma', dueDate: daysAhead(2) },
    { title: 'Set up CI/CD pipeline', projectId: projectIds[1], projectName: 'Mobile App v2', status: 'todo', priority: 'high', type: 'development', estimatedHours: 10, spentHours: 0, assigneeName: 'Dev Patel', dueDate: daysAhead(14) },
    { title: 'Database schema migration', projectId: projectIds[2], projectName: 'ERP Integration', status: 'in_progress', priority: 'high', type: 'development', estimatedHours: 20, spentHours: 15, assigneeName: 'Arun Kumar', dueDate: daysAhead(3) },
    { title: 'Write API documentation', projectId: projectIds[2], projectName: 'ERP Integration', status: 'todo', priority: 'medium', type: 'other', estimatedHours: 6, spentHours: 0, assigneeName: 'Maya Raj', dueDate: daysAhead(7) },
    { title: 'Initial wireframes', projectId: projectIds[0], projectName: 'Website Redesign', status: 'done', priority: 'medium', type: 'design', estimatedHours: 12, spentHours: 11, assigneeName: 'Priya Sharma', dueDate: daysAgo(10) },
    { title: 'Kickoff meeting', projectId: projectIds[1], projectName: 'Mobile App v2', status: 'done', priority: 'low', type: 'meeting', estimatedHours: 2, spentHours: 2, assigneeName: 'Maya Raj', dueDate: daysAgo(14) },
    { title: 'Build payment gateway', projectId: projectIds[1], projectName: 'Mobile App v2', status: 'in_progress', priority: 'high', type: 'development', estimatedHours: 24, spentHours: 10, assigneeName: 'Dev Patel', dueDate: daysAhead(20) },
    { title: 'User flow testing', projectId: projectIds[1], projectName: 'Mobile App v2', status: 'review', priority: 'high', type: 'qa', estimatedHours: 8, spentHours: 7, assigneeName: 'James Tran', dueDate: daysAhead(4) },
    { title: 'Design system tokens', projectId: projectIds[0], projectName: 'Website Redesign', status: 'done', priority: 'medium', type: 'design', estimatedHours: 6, spentHours: 5, assigneeName: 'Priya Sharma', dueDate: daysAgo(20) },
  ]
  const refs = []
  for (const t of tasks) refs.push(await add('tasks', t))
  console.log('✅ Seeded', tasks.length, 'tasks')
  return refs
}

export async function seedPayroll(employeeIds: string[]) {
  const names = ['Arun Kumar', 'Priya Sharma', 'Maya Raj', 'James Tran', 'Lena Chen', 'Dev Patel']
  const bases = [6200, 5400, 7100, 5000, 6800, 0]
  const hourly = [0, 0, 0, 0, 0, 90]
  const records = employeeIds.map((id, i) => ({
    employeeId: id,
    employeeName: names[i],
    period: '2026-03',
    baseSalary: bases[i] || hourly[i] * 120,
    allowances: [800, 500, 1200, 0, 900, 0][i],
    deductions: [400, 350, 500, 300, 450, 200][i],
    overtimeHours: [0, 0, 4, 0, 0, 20][i],
    overtimePay: [0, 0, 340, 0, 0, 1800][i],
    incentives: [500, 0, 0, 0, 400, 0][i],
    tax: 0,
    netPay: 0,
    status: ['paid', 'paid', 'pending', 'pending', 'paid', 'approved'][i],
  }))

  // Calculate tax and netPay
  records.forEach(r => {
    const gross = r.baseSalary + r.allowances + r.overtimePay + r.incentives
    r.tax = Math.round(gross * 0.22)
    r.netPay = gross - r.deductions - r.tax
  })

  const refs = []
  for (const r of records) refs.push(await add('payroll', r))
  console.log('✅ Seeded', records.length, 'payroll records')
  return refs
}

export async function seedAll() {
  console.log('🌱 Starting seed...')
  try {
    const clientRefs = await seedClients()
    const employeeRefs = await seedEmployees()
    const clientIds = clientRefs.map(r => r.id)
    const employeeIds = employeeRefs.map(r => r.id)
    const projectRefs = await seedProjects(clientIds)
    const projectIds = projectRefs.map(r => r.id)
    await seedTasks(projectIds)
    await seedPayroll(employeeIds)
    console.log('🎉 Seed complete!')
  } catch (e) {
    console.error('❌ Seed failed:', e)
  }
}
