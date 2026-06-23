import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { RequireAuth } from '../components/auth/RequireAuth';
import Login from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';

// Mock the auth service to start logged out
vi.mock('../services/authService', () => ({
  authService: {
    onAuthStateChanged: vi.fn((cb) => {
      cb(null); // start logged out
      return () => {};
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
  }
}));
vi.mock('../services/workshopService', () => ({
  workshopService: {
    getAllWorkshops: vi.fn().mockResolvedValue([]),
  }
}));

const AdminApp = () => (
  <AuthProvider>
    <Routes>
      <Route path="/admin/login" element={<Login />} />
      <Route 
        path="/admin/dashboard" 
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        } 
      />
    </Routes>
  </AuthProvider>
);

describe('Admin Integration', () => {
  it('redirects unauthenticated users to login from dashboard', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/dashboard']}>
        <AdminApp />
      </MemoryRouter>
    );

    // Should redirect to login page
    expect(await screen.findByText(/Admin Portal/i)).toBeInTheDocument();
  });
});
