/**
 * Which Optics color family a color type belongs to.
 *
 * This is identity, not presentation, so it lives with the baseline data rather
 * than in either serializer — the store, the Figma exporter, the JSON importer
 * and the CSS exporter all need the same answer.
 */

/**
 * Color types that the Optics design system groups under an `alerts/` namespace
 * (i.e. Figma variables named `alerts/notice/…`, CSS tokens named
 * `--op-color-alerts-danger-base`). Nesting them lets exported tokens import
 * cleanly as a new *mode* of an existing Optics collection.
 */
export const ALERT_TYPE_NAMES = ['notice', 'warning', 'danger', 'info'];

/** `Brand Accent` -> `brand-accent`, `  Sea Foam!  ` -> `sea-foam`. */
export function familySlug(typeName: string): string {
  return typeName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Map a color type name onto its Optics CSS variable family. The four alert
 * types live under an `alerts-` prefix, mirroring the `alerts/` grouping the
 * Figma export uses.
 */
export function opticsFamilyName(typeName: string): string {
  const slug = familySlug(typeName);
  return ALERT_TYPE_NAMES.includes(slug) ? `alerts-${slug}` : slug;
}
