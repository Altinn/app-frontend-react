import {
  calculateScrollPosition,
  findNearestOptionIndex,
  getEndIndex,
  getHomeIndex,
  getInitialHighlightIndex,
  getNextIndex,
  getPageJumpIndex,
  roundToStep,
  shouldScrollToOption,
} from 'src/app-components/TimePicker/utils/dropdownBehavior';

describe('dropdownBehavior', () => {
  describe('roundToStep', () => {
    it('should round value to nearest step', () => {
      expect(roundToStep(7, 5)).toBe(5);
      expect(roundToStep(8, 5)).toBe(10);
      expect(roundToStep(12, 5)).toBe(10);
      expect(roundToStep(13, 5)).toBe(15);
    });

    it('should handle 15-minute steps', () => {
      expect(roundToStep(7, 15)).toBe(0);
      expect(roundToStep(8, 15)).toBe(15);
      expect(roundToStep(22, 15)).toBe(15);
      expect(roundToStep(23, 15)).toBe(30);
    });

    it('should handle 1-minute steps', () => {
      expect(roundToStep(7, 1)).toBe(7);
      expect(roundToStep(30, 1)).toBe(30);
    });

    it('should handle hour steps', () => {
      expect(roundToStep(0, 1)).toBe(0);
      expect(roundToStep(23, 1)).toBe(23);
    });
  });

  describe('getInitialHighlightIndex', () => {
    const hourOptions = Array.from({ length: 24 }, (_, i) => ({
      value: i,
      label: i.toString().padStart(2, '0'),
    }));

    const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
      value: i * 5,
      label: (i * 5).toString().padStart(2, '0'),
    }));

    it('should highlight current value when present', () => {
      expect(getInitialHighlightIndex(15, hourOptions)).toBe(15);
      expect(getInitialHighlightIndex(30, minuteOptions)).toBe(6); // 30 is at index 6 in 5-min steps
    });

    it('should highlight nearest to system time when value is null', () => {
      const systemTime = new Date();
      systemTime.setHours(14, 37, 0);

      // For hours, should select 14 (2pm)
      expect(getInitialHighlightIndex(null, hourOptions, 'hours', 1, systemTime)).toBe(14);

      // For minutes with 5-min step, 37 rounds to 35, which is index 7
      expect(getInitialHighlightIndex(null, minuteOptions, 'minutes', 5, systemTime)).toBe(7);
    });

    it('should round system time to nearest step', () => {
      const systemTime = new Date();
      systemTime.setHours(14, 23, 0);

      // 23 minutes rounds to 25 with 5-min step (index 5)
      expect(getInitialHighlightIndex(null, minuteOptions, 'minutes', 5, systemTime)).toBe(5);
    });

    it('should handle period segment', () => {
      const periodOptions = [
        { value: 'AM', label: 'AM' },
        { value: 'PM', label: 'PM' },
      ];

      expect(getInitialHighlightIndex('PM', periodOptions)).toBe(1);
      expect(getInitialHighlightIndex('AM', periodOptions)).toBe(0);
    });

    it('should return 0 when no match found', () => {
      expect(getInitialHighlightIndex(99, hourOptions)).toBe(0);
    });
  });

  describe('getNextIndex', () => {
    it('should move up by 1', () => {
      expect(getNextIndex(5, 'up', 10)).toBe(4);
      expect(getNextIndex(0, 'up', 10)).toBe(0); // Can't go below 0
    });

    it('should move down by 1', () => {
      expect(getNextIndex(5, 'down', 10)).toBe(6);
      expect(getNextIndex(9, 'down', 10)).toBe(9); // Can't go above max
    });

    it('should handle edge cases', () => {
      expect(getNextIndex(0, 'up', 5)).toBe(0);
      expect(getNextIndex(4, 'down', 5)).toBe(4);
    });
  });

  describe('getPageJumpIndex', () => {
    // 60 minutes with 5-min step = 12 items
    // 60 minutes with 15-min step = 4 items

    it('should jump by 60 minutes worth of options for minutes', () => {
      // 5-min step: jump 12 items (60/5)
      expect(getPageJumpIndex(20, 'up', 60, 5)).toBe(8); // 20 - 12 = 8
      expect(getPageJumpIndex(8, 'down', 60, 5)).toBe(20); // 8 + 12 = 20
    });

    it('should jump by at least 1 item', () => {
      // Even with 60-min step, should jump at least 1
      expect(getPageJumpIndex(1, 'up', 3, 60)).toBe(0);
      expect(getPageJumpIndex(1, 'down', 3, 60)).toBe(2);
    });

    it('should clamp to boundaries', () => {
      expect(getPageJumpIndex(5, 'up', 60, 5)).toBe(0); // Would be -7, clamp to 0
      expect(getPageJumpIndex(50, 'down', 60, 5)).toBe(59); // Would be 62, clamp to 59
    });

    it('should handle 15-minute steps', () => {
      // 60 min / 15 min = 4 items to jump
      expect(getPageJumpIndex(10, 'up', 20, 15)).toBe(6); // 10 - 4 = 6
      expect(getPageJumpIndex(10, 'down', 20, 15)).toBe(14); // 10 + 4 = 14
    });

    it('should handle 1-minute steps', () => {
      // 60 min / 1 min = 60 items to jump
      expect(getPageJumpIndex(70, 'up', 120, 1)).toBe(10); // 70 - 60 = 10
      expect(getPageJumpIndex(10, 'down', 120, 1)).toBe(70); // 10 + 60 = 70
    });
  });

  describe('getHomeIndex and getEndIndex', () => {
    it('should return first index for home', () => {
      expect(getHomeIndex()).toBe(0);
    });

    it('should return last index for end', () => {
      expect(getEndIndex(24)).toBe(23);
      expect(getEndIndex(60)).toBe(59);
    });
  });

  describe('findNearestOptionIndex', () => {
    const options = [
      { value: 0, label: '00' },
      { value: 15, label: '15' },
      { value: 30, label: '30' },
      { value: 45, label: '45' },
    ];

    it('should find exact matches', () => {
      expect(findNearestOptionIndex(30, options)).toBe(2);
      expect(findNearestOptionIndex(0, options)).toBe(0);
    });

    it('should find nearest when no exact match', () => {
      expect(findNearestOptionIndex(10, options)).toBe(1); // Nearest to 15
      expect(findNearestOptionIndex(20, options)).toBe(1); // Nearest to 15
      expect(findNearestOptionIndex(25, options)).toBe(2); // Nearest to 30
      expect(findNearestOptionIndex(40, options)).toBe(3); // Nearest to 45
    });

    it('should handle string values', () => {
      const periodOptions = [
        { value: 'AM', label: 'AM' },
        { value: 'PM', label: 'PM' },
      ];
      expect(findNearestOptionIndex('PM', periodOptions)).toBe(1);
      expect(findNearestOptionIndex('AM', periodOptions)).toBe(0);
    });

    it('should return 0 for empty options', () => {
      expect(findNearestOptionIndex(30, [])).toBe(0);
    });
  });

  describe('calculateScrollPosition', () => {
    it('should calculate correct scroll position to center item', () => {
      // Container 200px, item 40px, 10 items total
      // Index 0 should be at top
      expect(calculateScrollPosition(0, 200, 40)).toBe(0);

      // Index 5: (5 * 40) - (200/2) + (40/2) = 200 - 100 + 20 = 120
      expect(calculateScrollPosition(5, 200, 40)).toBe(120);
    });

    it('should not scroll negative', () => {
      expect(calculateScrollPosition(1, 400, 40)).toBe(0);
      expect(calculateScrollPosition(2, 300, 40)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(calculateScrollPosition(0, 100, 50)).toBe(0);
      // Index 10: (10 * 50) - (100/2) + (50/2) = 500 - 50 + 25 = 475
      expect(calculateScrollPosition(10, 100, 50)).toBe(475);
    });
  });

  describe('shouldScrollToOption', () => {
    it('should determine if option needs scrolling', () => {
      // Container 200px, scroll at 100px, item 40px
      // Visible range: 100-300px

      // Index 2 at 80px - not fully visible (starts before viewport)
      expect(shouldScrollToOption(2, 100, 200, 40)).toBe(true);

      // Index 4 at 160px - visible
      expect(shouldScrollToOption(4, 100, 200, 40)).toBe(false);

      // Index 8 at 320px - not visible (starts after viewport)
      expect(shouldScrollToOption(8, 100, 200, 40)).toBe(true);
    });

    it('should handle items at boundaries', () => {
      // Item exactly at scroll position - visible
      expect(shouldScrollToOption(5, 200, 200, 40)).toBe(false); // 5*40=200, visible

      // Item partially visible at viewport end
      expect(shouldScrollToOption(10, 200, 200, 40)).toBe(true); // 10*40=400, starts at edge (not visible)
    });

    it('should handle first item', () => {
      expect(shouldScrollToOption(0, 0, 200, 40)).toBe(false); // First item at top
      expect(shouldScrollToOption(0, 50, 200, 40)).toBe(true); // First item scrolled out
    });
  });

  describe('integration scenarios', () => {
    it('should handle typical minute selection flow', () => {
      const minuteOptions = Array.from({ length: 60 }, (_, i) => ({
        value: i,
        label: i.toString().padStart(2, '0'),
      }));

      // Start at 30 minutes
      let index = findNearestOptionIndex(30, minuteOptions);
      expect(index).toBe(30);

      // Press down arrow 5 times
      for (let i = 0; i < 5; i++) {
        index = getNextIndex(index, 'down', 60);
      }
      expect(index).toBe(35);

      // Page up (should go back by 60 items with 1-min step)
      index = getPageJumpIndex(index, 'up', 60, 1);
      expect(index).toBe(0); // 35 - 60 = -25, clamped to 0

      // End key
      index = getEndIndex(60);
      expect(index).toBe(59);
    });

    it('should handle typical hour selection flow', () => {
      const hourOptions = Array.from({ length: 24 }, (_, i) => ({
        value: i,
        label: i.toString().padStart(2, '0'),
      }));

      // Start at current time (2:37 PM)
      const systemTime = new Date();
      systemTime.setHours(14, 37, 0);

      let index = getInitialHighlightIndex(null, hourOptions, 'hours', 1, systemTime);
      expect(index).toBe(14);

      // Navigate up 3 times
      for (let i = 0; i < 3; i++) {
        index = getNextIndex(index, 'up', 24);
      }
      expect(index).toBe(11);

      // Home key
      index = getHomeIndex();
      expect(index).toBe(0);
    });

    it('should handle dropdown keyboard navigation with value updates', () => {
      const minuteOptions = Array.from({ length: 12 }, (_, i) => ({
        value: i * 5,
        label: (i * 5).toString().padStart(2, '0'),
      }));

      // Start with value 25 (index 5)
      let index = findNearestOptionIndex(25, minuteOptions);
      expect(index).toBe(5);

      // Arrow down - should update value immediately
      index = getNextIndex(index, 'down', 12);
      expect(index).toBe(6);
      expect(minuteOptions[index].value).toBe(30);

      // Page up - jump back by 12 items (60min/5min step)
      index = getPageJumpIndex(index, 'up', 12, 5);
      expect(index).toBe(0); // 6 - 12 = -6, clamped to 0
      expect(minuteOptions[index].value).toBe(0);
    });
  });
});
