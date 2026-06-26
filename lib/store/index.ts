"use client";

import { hasSupabase } from "@/lib/config";
import { demoStore } from "./demo";
import { supabaseStore } from "./supabase";
import type { Store } from "./types";

/**
 * The one data layer every screen imports. Picks the real backend when keys are
 * present, otherwise the self-contained demo store. Screens never know which.
 */
export const db: Store = hasSupabase ? supabaseStore : demoStore;

export type { Store };
