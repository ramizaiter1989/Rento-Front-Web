import React from 'react';
import { AgentNavbar } from './AgentNavbar';

export const AgentLayout = ({ children, noIndex = false }) => {
  return (
    <>
      <AgentNavbar />
      <main className="pt-16 md:pt-12 min-h-screen">
        {children}
      </main>
    </>
  );
};
