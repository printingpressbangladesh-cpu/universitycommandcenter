import {
  getSystemEmailConfig as loadConfig,
  saveSystemEmailConfig as saveConfig,
  type SystemEmailConfig,
} from "@/lib/supabase/data";

export type { SystemEmailConfig };

export async function getSystemEmailConfig(): Promise<SystemEmailConfig> {
  return loadConfig();
}

export async function saveSystemEmailConfig(patch: Partial<SystemEmailConfig>): Promise<SystemEmailConfig> {
  return saveConfig(patch);
}
