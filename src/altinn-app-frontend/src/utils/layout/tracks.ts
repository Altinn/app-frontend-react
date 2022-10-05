import type { ITracks } from 'src/types';

/**
 * Given the ITracks state, this returns the final order for layouts
 */
export function getLayoutOrderFromTracks(tracks: ITracks): string[] | null {
  if (tracks.order === null) {
    return null;
  }

  const hiddenSet = new Set(tracks.hidden);
  return [...tracks.order].filter((layout) => !hiddenSet.has(layout));
}
