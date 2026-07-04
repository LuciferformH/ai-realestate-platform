import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PropertyListPage = lazy(() => import('./pages/PropertyListPage'));
const PropertyDetailPage = lazy(() => import('./pages/PropertyDetailPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const MapsPage = lazy(() => import('./pages/MapsPage'));
const AIPredictPage = lazy(() => import('./pages/AIPredictPage'));
const MLModelsPage = lazy(() => import('./pages/MLModelsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const AdminPanelPage = lazy(() => import('./pages/AdminPanelPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminPropertiesPage = lazy(() => import('./pages/AdminPropertiesPage'));
const AdminDatasetPage = lazy(() => import('./pages/AdminDatasetPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/login" element={<Suspense fallback={<LoadingFallback />}><LoginPage /></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={<LoadingFallback />}><SignupPage /></Suspense>} />
        <Route path="/forgot-password" element={<Suspense fallback={<LoadingFallback />}><ForgotPasswordPage /></Suspense>} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Suspense fallback={<LoadingFallback />}><DashboardPage /></Suspense>} />
          <Route path="properties" element={<Suspense fallback={<LoadingFallback />}><PropertyListPage /></Suspense>} />
          <Route path="properties/:id" element={<Suspense fallback={<LoadingFallback />}><PropertyDetailPage /></Suspense>} />
          <Route path="analytics" element={<Suspense fallback={<LoadingFallback />}><AnalyticsPage /></Suspense>} />
          <Route path="maps" element={<Suspense fallback={<LoadingFallback />}><MapsPage /></Suspense>} />
          <Route path="ai-predict" element={<Suspense fallback={<LoadingFallback />}><AIPredictPage /></Suspense>} />
          <Route path="ml-models" element={<Suspense fallback={<LoadingFallback />}><MLModelsPage /></Suspense>} />
          <Route path="reports" element={<Suspense fallback={<LoadingFallback />}><ReportsPage /></Suspense>} />
          <Route path="admin" element={<Suspense fallback={<LoadingFallback />}><AdminPanelPage /></Suspense>} />
          <Route path="admin/users" element={<Suspense fallback={<LoadingFallback />}><AdminUsersPage /></Suspense>} />
          <Route path="admin/properties" element={<Suspense fallback={<LoadingFallback />}><AdminPropertiesPage /></Suspense>} />
          <Route path="admin/dataset" element={<Suspense fallback={<LoadingFallback />}><AdminDatasetPage /></Suspense>} />
          <Route path="profile" element={<Suspense fallback={<LoadingFallback />}><ProfilePage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<LoadingFallback />}><SettingsPage /></Suspense>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            border: '1px solid rgba(51, 65, 85, 0.5)',
            padding: '12px 16px',
            fontSize: '14px',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
          success: { iconTheme: { primary: '#14b8a6', secondary: '#f1f5f9' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
