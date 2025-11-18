"use client";

import { useState } from "react";
import App from "./App";
import AdminPage from "../app/admin/page";

export default function AppWrapper() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Check if we should show admin panel
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path.startsWith("/admin") && !isAdminMode) {
      setIsAdminMode(true);
    } else if (!path.startsWith("/admin") && isAdminMode) {
      setIsAdminMode(false);
    }
  }

  return isAdminMode ? <AdminPage /> : <App />;
}
