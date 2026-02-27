/**
 * OS Clinical Engine — client facade.
 * Engine logic runs server-side via buildClinicalPlan callable.
 * This module provides the client API and schema reference.
 */

export { buildClinicalPlan } from "@/services/clinicalPlanService";

export const ENGINE_VERSION = "wc_os_engine_v1";
