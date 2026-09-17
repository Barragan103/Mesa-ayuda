import React, { ReactNode } from 'react';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
    <AdminSidebar />
    <main className="flex-1 p-6 overflow-y-auto">
      {children}
    </main>
  </div>
  );
}
