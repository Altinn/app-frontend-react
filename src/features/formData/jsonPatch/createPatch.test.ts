import { applyPatch } from 'fast-json-patch';

import { createPatch } from 'src/features/formData/jsonPatch/createPatch';
import type { JsonPatch } from 'src/features/formData/jsonPatch/types';

interface TestPatchProps<T> {
  prev: T;
  next: T;
  expected: JsonPatch;
}

function testPatch<T extends object>({ prev, next, expected }: TestPatchProps<T>) {
  const patch = createPatch({ prev, next });
  expect(patch).toEqual(expected);

  const patched = applyPatch(prev, patch).newDocument;
  expect(patched).toEqual(next);
}

describe('createPatch', () => {
  it('should return an empty array when given two empty objects', () => {
    testPatch({ prev: {}, next: {}, expected: [] });
  });

  it('should return an empty array when given two identical objects', () => {
    testPatch({ prev: { a: 1 }, next: { a: 1 }, expected: [] });
  });

  it('should return simple replace', () => {
    testPatch({
      prev: { a: 1 },
      next: { a: 2 },
      expected: [
        { op: 'test', path: '/a', value: 1 },
        { op: 'replace', path: '/a', value: 2 },
      ],
    });
  });

  it('should return simple remove', () => {
    testPatch({
      prev: { a: 1 },
      next: {},
      expected: [
        { op: 'test', path: '/a', value: 1 },
        { op: 'remove', path: '/a' },
      ],
    });
  });

  it('should return simple add', () => {
    testPatch({ prev: {}, next: { a: 1 }, expected: [{ op: 'add', path: '/a', value: 1 }] });
  });

  it('should create an add op for a nested object', () => {
    testPatch({ prev: {}, next: { a: { b: 1 } }, expected: [{ op: 'add', path: '/a', value: { b: 1 } }] });
  });

  it('should create an add op for a nested array', () => {
    testPatch({ prev: {}, next: { a: [1, 2, 3] }, expected: [{ op: 'add', path: '/a', value: [1, 2, 3] }] });
  });

  it('should create an add op for a nested array with objects', () => {
    testPatch({
      prev: {},
      next: { a: [{ b: 1 }, { b: 2 }] },
      expected: [{ op: 'add', path: '/a', value: [{ b: 1 }, { b: 2 }] }],
    });
  });

  it('should create a shallower add op for a nested object', () => {
    testPatch({
      prev: { a: { b: 1 } },
      next: { a: { b: 1, c: 2 } },
      expected: [{ op: 'add', path: '/a/c', value: 2 }],
    });
  });

  it('should create a shallower add op for a nested array', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [1, 2, 3, 4] },
      expected: [
        // TODO: Add back in when backend is fixed
        // { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'add', path: '/a/-', value: 4 },
      ],
    });
  });

  it('should create a shallower add op for a nested array with objects', () => {
    const common = { d: 5, e: 6 };
    testPatch({
      prev: {
        a: [
          { b: 1, ...common },
          { b: 2, ...common },
        ],
      },
      next: { a: [{ b: 1, ...common }, { b: 2, ...common }, { b: 3 }] },
      expected: [
        // TODO: Add back in when backend is fixed
        // {
        //   op: 'test',
        //   path: '/a',
        //   value: [
        //     { b: 1, ...common },
        //     { b: 2, ...common },
        //   ],
        // },
        { op: 'add', path: '/a/-', value: { b: 3 } },
      ],
    });
  });

  it('should create a remove op for a nested object', () => {
    testPatch({
      prev: { a: { b: 1 } },
      next: {},
      expected: [
        { op: 'test', path: '/a', value: { b: 1 } },
        { op: 'remove', path: '/a' },
      ],
    });
  });

  it('should create a remove op for a nested array', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: {},
      expected: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'remove', path: '/a' },
      ],
    });
  });

  it('should create a remove op when removing an index from a nested array', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [1, 3] },
      expected: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'remove', path: '/a/1' },
      ],
    });
  });

  it('should create a remove op when removing an object from a nested array', () => {
    testPatch({
      prev: { a: [{ b: 1 }, { b: 2 }] },
      next: { a: [{ b: 1 }] },
      expected: [
        { op: 'test', path: '/a', value: [{ b: 1 }, { b: 2 }] },
        { op: 'remove', path: '/a/1' },
      ],
    });
  });

  it('should not produce a patch when deep arrays are equal', () => {
    testPatch({
      prev: {
        a: [
          [1, 2],
          [3, 4],
        ],
      },
      next: {
        a: [
          [1, 2],
          [3, 4],
        ],
      },
      expected: [],
    });
  });

  it('should create multiple remove operations when removing multiple values from arrays', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [1] },
      expected: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'remove', path: '/a/2' },
        { op: 'remove', path: '/a/1' },
      ],
    });
  });

  it('should create a valid patch when removing values and adding values to the array at the same time', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [2, 3, 4] },
      expected: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'remove', path: '/a/0' },
        { op: 'add', path: '/a/-', value: 4 },
      ],
    });
  });

  it('should create a valid patch when removing objects and adding objects to the array while the length stays the same', () => {
    testPatch({
      prev: {
        a: [
          { b: 1, row: 'first' },
          { b: 2, row: 'second' },
          { b: 3, row: 'third' },
        ],
      },
      next: {
        a: [{ b: 2, row: 'second' }, { b: 3, row: 'third' }, { b: 4 }],
      },
      expected: [
        {
          op: 'test',
          path: '/a',
          value: [
            { b: 1, row: 'first' },
            { b: 2, row: 'second' },
            { b: 3, row: 'third' },
          ],
        },
        { op: 'remove', path: '/a/0' },
        { op: 'add', path: '/a/-', value: { b: 4 } },
      ],
    });
  });

  it('should create multiple remove operations when removing multiple values the middle of an array', () => {
    testPatch({
      prev: { a: [0, 1, 2, 3, 4, 5, 6] },
      next: { a: [0, 1, 5, 6] },
      expected: [
        { op: 'test', path: '/a', value: [0, 1, 2, 3, 4, 5, 6] },
        { op: 'remove', path: '/a/4' },
        { op: 'remove', path: '/a/3' },
        { op: 'remove', path: '/a/2' },
      ],
    });
  });

  it('should prefer remove and add operations for a simple string in a large array', () => {
    testPatch({
      prev: { a: ['foo', 'bar', 'baz', 'qux'] },
      next: { a: ['foo', 'bar2', 'baz', 'qux'] },
      expected: [
        { op: 'test', path: '/a', value: ['foo', 'bar', 'baz', 'qux'] },
        { op: 'remove', path: '/a/1' },
        { op: 'add', path: '/a/1', value: 'bar2' },
      ],
    });
  });

  it('should prefer a simple replace op for a number in a nested array', () => {
    testPatch({
      prev: { a: [{ b: [{ a: 5, b: 3, c: 8 }] }] },
      next: { a: [{ b: [{ a: 5, b: 3, c: 9 }] }] },
      expected: [
        { op: 'test', path: '/a/0/b/0/c', value: 8 },
        { op: 'replace', path: '/a/0/b/0/c', value: 9 },
      ],
    });
  });

  it('should create an add operation with a dash key when appending to an array', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [1, 2, 3, 4] },
      expected: [
        // TODO: Add back in when backend is fixed
        // { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'add', path: '/a/-', value: 4 },
      ],
    });
  });

  it('should create a minimal patch with replace operations when multiple values are changed inside nested arrays', () => {
    const equalObject = { foo: 'bar', baz: 'qux' };
    testPatch({
      prev: { a: [{ b: [equalObject, { a: 5, b: 3, c: 8 }, equalObject, { d: 4, ...equalObject }] }] },
      next: { a: [{ b: [equalObject, { a: 5, b: 3, c: 9 }, equalObject, { d: 5, ...equalObject }] }] },
      expected: [
        { op: 'test', path: '/a/0/b/1/c', value: 8 },
        { op: 'replace', path: '/a/0/b/1/c', value: 9 },
        { op: 'test', path: '/a/0/b/3/d', value: 4 },
        { op: 'replace', path: '/a/0/b/3/d', value: 5 },
      ],
    });
  });

  it('should create a simple replace op for a string in a nested object', () => {
    testPatch({
      prev: { a: { b: 'foo' } },
      next: { a: { b: 'bar' } },
      expected: [
        { op: 'test', path: '/a/b', value: 'foo' },
        { op: 'replace', path: '/a/b', value: 'bar' },
      ],
    });
  });

  it('should create a simple replace when new value is null', () => {
    testPatch({
      prev: { a: { b: 'foo' } },
      next: { a: { b: null } },
      expected: [
        { op: 'test', path: '/a/b', value: 'foo' },
        { op: 'replace', path: '/a/b', value: null },
      ],
    });
  });

  it('should create a simple replace when old value is null', () => {
    testPatch({
      prev: { a: { b: null } },
      next: { a: { b: 'foo' } },
      expected: [
        { op: 'test', path: '/a/b', value: null },
        { op: 'replace', path: '/a/b', value: 'foo' },
      ],
    });
  });

  it('should create add operations for new properties in an empty object, even when inside an array', () => {
    testPatch({
      prev: { a: [{}] },
      next: { a: [{ b: 1, d: 2, e: 5, f: 8 }] },
      expected: [
        { op: 'add', path: '/a/0/b', value: 1 },
        { op: 'add', path: '/a/0/d', value: 2 },
        { op: 'add', path: '/a/0/e', value: 5 },
        { op: 'add', path: '/a/0/f', value: 8 },
      ],
    });
  });

  it('should compare object individually, not taking arrays in them into account', () => {
    // This case appears a lot when comparing backend changes in the data model to our own current model. The backend
    // may send us lots of new properties on objects in arrays where we just added an empty object. For nested groups
    // that could lead to the whole upper object being compared and it was assumed the whole object was changed enough
    // that it should be removed and a new one added.
    const complex = { d: 5, e: 6, f: 7 };
    testPatch({
      prev: { a: [{ b: { c: 1 }, nested: [{}, {}, {}] }] },
      next: { a: [{ b: { c: 2 }, nested: [complex, complex, complex] }] },
      expected: [
        { op: 'test', path: '/a/0/b/c', value: 1 },
        { op: 'replace', path: '/a/0/b/c', value: 2 },

        { op: 'add', path: '/a/0/nested/0/d', value: 5 },
        { op: 'add', path: '/a/0/nested/0/e', value: 6 },
        { op: 'add', path: '/a/0/nested/0/f', value: 7 },

        { op: 'add', path: '/a/0/nested/1/d', value: 5 },
        { op: 'add', path: '/a/0/nested/1/e', value: 6 },
        { op: 'add', path: '/a/0/nested/1/f', value: 7 },

        { op: 'add', path: '/a/0/nested/2/d', value: 5 },
        { op: 'add', path: '/a/0/nested/2/e', value: 6 },
        { op: 'add', path: '/a/0/nested/2/f', value: 7 },
      ],
    });
  });
});
