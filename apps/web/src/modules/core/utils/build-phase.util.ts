import { PHASE_PRODUCTION_BUILD } from 'next/constants';

/**
 * True while `next build` prerenders. Fallbacks for an unreachable API belong
 * here only: at runtime an ISR render must throw so Next keeps the last good page
 * instead of caching an empty one.
 */
export function isBuildPhase(): boolean {
  return process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD;
}
