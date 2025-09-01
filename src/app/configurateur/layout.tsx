"use client";
import React from "react";
import ConfigSidebar from "./Sidebar";

export default function ConfigLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <ConfigSidebar />
      <main className="flex-1 overflow-y-auto min-w-0 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
