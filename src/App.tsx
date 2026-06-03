import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/hooks/useAuthStore";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { AppLayout } from "@/components/AppLayout";
import { ToastProvider } from "@/hooks/useToast";
import { SignInPage } from "@/features/auth/SignInPage";
import { SignUpPage } from "@/features/auth/SignUpPage";
import { DashboardPage } from "@/features/dashboard/DashboardPage";
import { ClientsPage } from "@/features/clients/ClientsPage";
import { ClientDetailPage } from "@/features/clients/ClientDetailPage";
import { ProjectsPage } from "@/features/projects/ProjectsPage";
import { ProjectDetailPage } from "@/features/projects/ProjectDetailPage";
import { TasksPage } from "@/features/tasks/TasksPage";
import { EmployeesPage } from "@/features/employees/EmployeesPage";
import { PayrollPage } from "@/features/payroll/PayrollPage";
import { ReportsPage } from "@/features/reports/ReportsPage";
import { ProfilePage } from "@/features/profile/ProfilePage";

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AuthObserver() {
  const { setUser, setLoading } = useAuthStore();
  useEffect(() => {
    const unsub = authService.onAuthStateChange(async (fbUser) => {
      if (fbUser) {
        const profile = await authService.getProfile(fbUser.uid);
        setUser(
          profile || {
            uid: fbUser.uid,
            email: fbUser.email!,
            displayName: fbUser.displayName || "User",
            role: "developer",
            createdAt: new Date().toISOString(),
          },
        );
      } else {
        setUser(null);
      }
    });
    return unsub;
  }, []);
  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <ToastProvider>
        <BrowserRouter>
          <AuthObserver />
          <Routes>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AppLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="clients" element={<ClientsPage />} />
              <Route path="clients/:id" element={<ClientDetailPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:id" element={<ProjectDetailPage />} />
              <Route path="tasks" element={<TasksPage />} />
              <Route path="employees" element={<EmployeesPage />} />
              <Route path="payroll" element={<PayrollPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}
