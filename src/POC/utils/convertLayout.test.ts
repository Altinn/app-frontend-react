import { describe } from '@jest/globals';

import { convertLayout } from 'src/POC/utlis/convertLayout';
import type { Component } from 'src/POC/utlis/convertLayout';

describe('layoutConverter', () => {
  it('should output same as input when no child nesting', () => {
    const input: Component[] = [
      { id: '1', type: 'a' },
      { id: '2', type: 'b' },
    ];

    const { convertedLayout: output } = convertLayout(input);
    expect(output).toEqual(input);
  });

  it('should nest children', () => {
    const input: Component[] = [
      { id: '1', type: 'a', children: ['2'] },
      { id: '2', type: 'b' },
    ];

    const { convertedLayout: output } = convertLayout(input);
    expect(output).toEqual([{ id: '1', type: 'a', children: [{ id: '2', type: 'b' }] }]);
  });

  it('should nest children recursively', () => {
    const input: Component[] = [
      { id: '1', type: 'a', children: ['2'] },
      { id: '2', type: 'b', children: ['3'] },
      { id: '3', type: 'c' },
    ];

    const { convertedLayout: output } = convertLayout(input);
    expect(output).toEqual([
      {
        id: '1',
        type: 'a',
        children: [{ id: '2', type: 'b', children: [{ id: '3', type: 'c' }] }],
      },
    ]);
  });

  it('should nest children recursively with different order', () => {
    const input: Component[] = [
      { id: '1', type: 'a', children: ['2'] },
      { id: '3', type: 'c' },
      { id: '2', type: 'b', children: ['3'] },
    ];

    const { convertedLayout: output } = convertLayout(input);
    expect(output).toEqual([
      {
        id: '1',
        type: 'a',
        children: [{ id: '2', type: 'b', children: [{ id: '3', type: 'c' }] }],
      },
    ]);
  });

  it('should nest children recursively with multiple children', () => {
    const input: Component[] = [
      { id: '1', type: 'a', children: ['2'] },
      {
        id: '2',
        type: 'b',
        children: [
          {
            id: '3',
            type: 'c',
            children: [{ id: '4', type: 'd', children: ['5'] }],
          },
        ],
      },
      { id: '5', type: 'e' },
    ];

    const { convertedLayout: output } = convertLayout(input);

    expect(output).toEqual([
      {
        id: '1',
        type: 'a',
        children: [
          {
            id: '2',
            type: 'b',
            children: [
              {
                id: '3',
                type: 'c',
                children: [{ id: '4', type: 'd', children: [{ id: '5', type: 'e' }] }],
              },
            ],
          },
        ],
      },
    ]);
  });
});
