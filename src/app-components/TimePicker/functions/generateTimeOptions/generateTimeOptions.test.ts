import {
  generateHourOptions,
  generateMinuteOptions,
  generateSecondOptions,
} from 'src/app-components/TimePicker/functions/generateTimeOptions/generateTimeOptions';

describe('generateTimeOptions', () => {
  describe('generateHourOptions', () => {
    describe('24-hour format', () => {
      it('should generate 24 options from 00 to 23', () => {
        const options = generateHourOptions(false);

        expect(options).toHaveLength(24);
        expect(options[0]).toEqual({ value: 0, label: '00', disabled: false });
        expect(options[12]).toEqual({ value: 12, label: '12', disabled: false });
        expect(options[23]).toEqual({ value: 23, label: '23', disabled: false });
      });

      it('should pad single digits with zero', () => {
        const options = generateHourOptions(false);

        expect(options[1].label).toBe('01');
        expect(options[9].label).toBe('09');
        expect(options[10].label).toBe('10');
      });
    });

    describe('12-hour format', () => {
      it('should generate 12 options from 01 to 12', () => {
        const options = generateHourOptions(true);

        expect(options).toHaveLength(12);
        expect(options[0]).toEqual({ value: 1, label: '01', disabled: false });
        expect(options[11]).toEqual({ value: 12, label: '12', disabled: false });
      });

      it('should not include 00 or values above 12', () => {
        const options = generateHourOptions(true);

        const values = options.map((o) => o.value);
        expect(values).not.toContain(0);
        expect(values).not.toContain(13);
        expect(Math.max(...(values as number[]))).toBe(12);
        expect(Math.min(...(values as number[]))).toBe(1);
      });
    });
  });

  describe('generateMinuteOptions', () => {
    it('should generate 60 options by default (step=1)', () => {
      const options = generateMinuteOptions();

      expect(options).toHaveLength(60);
      expect(options[0]).toEqual({ value: 0, label: '00', disabled: false });
      expect(options[30]).toEqual({ value: 30, label: '30', disabled: false });
      expect(options[59]).toEqual({ value: 59, label: '59', disabled: false });
    });

    it('should generate correct number of options for step=5', () => {
      const options = generateMinuteOptions(5);

      expect(options).toHaveLength(12); // 60 / 5 = 12
      expect(options[0]).toEqual({ value: 0, label: '00', disabled: false });
      expect(options[1]).toEqual({ value: 5, label: '05', disabled: false });
      expect(options[11]).toEqual({ value: 55, label: '55', disabled: false });
    });

    it('should generate correct number of options for step=15', () => {
      const options = generateMinuteOptions(15);

      expect(options).toHaveLength(4); // 60 / 15 = 4
      expect(options[0]).toEqual({ value: 0, label: '00', disabled: false });
      expect(options[1]).toEqual({ value: 15, label: '15', disabled: false });
      expect(options[2]).toEqual({ value: 30, label: '30', disabled: false });
      expect(options[3]).toEqual({ value: 45, label: '45', disabled: false });
    });

    it('should pad single digits with zero', () => {
      const options = generateMinuteOptions(1);

      expect(options[5].label).toBe('05');
      expect(options[9].label).toBe('09');
      expect(options[10].label).toBe('10');
    });
  });

  describe('generateSecondOptions', () => {
    it('should generate 60 options by default (step=1)', () => {
      const options = generateSecondOptions();

      expect(options).toHaveLength(60);
      expect(options[0]).toEqual({ value: 0, label: '00', disabled: false });
      expect(options[30]).toEqual({ value: 30, label: '30', disabled: false });
      expect(options[59]).toEqual({ value: 59, label: '59', disabled: false });
    });

    it('should generate correct number of options for step=5', () => {
      const options = generateSecondOptions(5);

      expect(options).toHaveLength(12); // 60 / 5 = 12
      expect(options[0]).toEqual({ value: 0, label: '00', disabled: false });
      expect(options[1]).toEqual({ value: 5, label: '05', disabled: false });
      expect(options[11]).toEqual({ value: 55, label: '55', disabled: false });
    });

    it('should behave identically to generateMinuteOptions', () => {
      const minuteOptions = generateMinuteOptions(10);
      const secondOptions = generateSecondOptions(10);

      expect(secondOptions).toEqual(minuteOptions);
    });
  });

  describe('constraints handling', () => {
    it('should accept constraints parameter for all functions', () => {
      const constraints = { minTime: '09:00', maxTime: '17:00' };

      expect(() => generateHourOptions(false, constraints)).not.toThrow();
      expect(() => generateMinuteOptions(1, constraints)).not.toThrow();
      expect(() => generateSecondOptions(1, constraints)).not.toThrow();
    });

    it('should return all options as enabled when constraints are provided (TODO)', () => {
      const constraints = { minTime: '09:00', maxTime: '17:00' };

      const hourOptions = generateHourOptions(false, constraints);
      const minuteOptions = generateMinuteOptions(1, constraints);
      const secondOptions = generateSecondOptions(1, constraints);

      // Currently all options are enabled, but this will change when constraint validation is implemented
      expect(hourOptions.every((o) => !o.disabled)).toBe(true);
      expect(minuteOptions.every((o) => !o.disabled)).toBe(true);
      expect(secondOptions.every((o) => !o.disabled)).toBe(true);
    });
  });
});
