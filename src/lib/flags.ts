/**
 * Feature Flags Helpers
 *
 * Provides functions to query feature toggles from the database.
 *
 * @module lib/flags
 */

import { connectDB } from "@/lib/db/connection";
import { FeatureFlag } from "@/lib/db/models/FeatureFlag";

/**
 * Checks if global maintenance mode is enabled in the database.
 */
export async function isMaintenanceModeActive(): Promise<boolean> {
  try {
    await connectDB();
    const flag = await FeatureFlag.findOne({
      key: { $in: ["maintenance_mode", "maintenance-mode"] },
    });
    return !!flag?.enabled;
  } catch (error) {
    console.error("[FeatureFlags] Error checking maintenance mode flag:", error);
    return false;
  }
}
