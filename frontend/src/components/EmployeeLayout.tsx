import React, { ReactNode } from 'react';
import EmployeeNavbar from './EmployeeNavbar';

export default function EmployeeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <EmployeeNavbar />
      <main className="flex-1 p-6 bg-white">{children}</main>
    </div>
  );
}
