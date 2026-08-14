import { useSyncExternalStore } from 'react';
import { subscribe, getProgress } from '../state/progressStore';

/**
 * Live view of the persisted profile.
 *
 * useSyncExternalStore rather than a useState copy per screen: the previous
 * approach meant the drill list showed whatever stats existed when it mounted,
 * and three components each held their own divergent snapshot.
 */
export function useProgress() {
  return useSyncExternalStore(subscribe, getProgress, getProgress);
}
