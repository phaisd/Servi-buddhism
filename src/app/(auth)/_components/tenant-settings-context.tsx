"use client";

import * as React from "react";
import type { TenantSettings } from "@/features/identity";

export const TenantSettingsContext = React.createContext<TenantSettings | null>(null);

export function useTenantSettings(): TenantSettings | null {
  return React.useContext(TenantSettingsContext);
}
