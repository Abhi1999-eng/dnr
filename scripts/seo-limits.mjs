/**
 * SERP limits shared between the runtime metadata helpers in lib/seo.ts and the
 * audit script, so the guard can never drift from what the app enforces.
 */
export const MAX_SERP_TITLE_LENGTH = 65;
export const MIN_META_DESCRIPTION_LENGTH = 110;
