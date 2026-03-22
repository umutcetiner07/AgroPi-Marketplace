"use client";

import { useState } from "react";

type Page = "dashboard" | "insights" | "monitor" | "profile";

interface BottomNavProps {
  active: Page;
  onChange: (page: Page) => void;
}

export function BottomNav({ active, onChange }: BottomNavProps) {
  const pages: { key: Page; label: string; icon: string }[] = [
    { key: "dashboard", label: "Dashboard", icon: "🏠" },
    { key: "insights", label: "Insights", icon: "🤖" },
    { key: "monitor", label: "Monitor", icon: "🌾" },
    { key: "profile", label: "Profile", icon: "👤" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 max-w-lg mx-auto">
      <div className="flex justify-around items-center py-2">
        {pages.map((page) => (
          <button
            key={page.key}
            onClick={() => onChange(page.key)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              active === page.key
                ? "text-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            <span className="text-xl mb-1">{page.icon}</span>
            <span className="text-xs">{page.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
