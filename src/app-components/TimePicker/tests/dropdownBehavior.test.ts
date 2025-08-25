import {
  calculateScrollPosition,
  findNearestOptionIndex,
  getInitialHighlightIndex,
  getNextIndex,
  roundToStep,
} from 'src/app-components/TimePicker/utils/dropdownBehavior';

describe('dropdownBehavior', () => {
  describe('roundToStep', () => {
    it('should round value to nearest step', () => {
      expect(roundToStep(7, 5)).toBe(5);
      expect(roundToStep(8, 5)).toBe(10);
      expect(roundToStep(7, 15)).toBe(0);
      expect(roundToStep(23, 15)).toBe(30);
      expect(roundToStep(7, 1)).toBe(7);
    });

    it('should handle gracefully with invalid step', () => {
      expect(roundToStep(7, 0)).toBe(7); // Invalid step, return value
      expect(roundToStep(7, -1)).toBe(7); // Invalid step, return value
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
    it('should move up and down correctly', () => {
      expect(getNextIndex(5, 'up', 10)).toBe(4);
      expect(getNextIndex(5, 'down', 10)).toBe(6);
      expect(getNextIndex(0, 'up', 10)).toBe(0); // Can't go below 0
      expect(getNextIndex(9, 'down', 10)).toBe(9); // Can't go above max
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
      expect(findNearestOptionIndex(25, options)).toBe(2); // Nearest to 30
      expect(findNearestOptionIndex(40, options)).toBe(3); // Nearest to 45
    });

    it('should handle string values', () => {
      const periodOptions = [
        { value: 'AM', label: 'AM' },
        { value: 'PM', label: 'PM' },
      ];
      expect(findNearestOptionIndex('PM', periodOptions)).toBe(1);
    });
  });

  describe('calculateScrollPosition', () => {
    it('should calculate correct scroll position to center item', () => {
      // Container 200px, item 40px
      expect(calculateScrollPosition(0, 200, 40)).toBe(0);
      expect(calculateScrollPosition(5, 200, 40)).toBe(120); // Center item 5
    });

    it('should not scroll negative', () => {
      expect(calculateScrollPosition(1, 400, 40)).toBe(0);
    });
  });
});
