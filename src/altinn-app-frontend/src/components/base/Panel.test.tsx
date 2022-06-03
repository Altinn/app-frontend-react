import { PanelVariant } from '@altinn/altinn-design-system';

import { getVariant } from './Panel';

describe('Panel', () => {
  describe('getVariant', () => {
    it('should return correctly mapped variant', () => {
      expect(getVariant({ variant: 'info' })).toBe(PanelVariant.Info);
      expect(getVariant({ variant: 'success' })).toBe(PanelVariant.Success);
      expect(getVariant({ variant: 'warning' })).toBe(PanelVariant.Warning);
    });

    it('should return PanelVariant.Info when no variant is passed', () => {
      expect(getVariant()).toBe(PanelVariant.Info);
    });
  });
});
