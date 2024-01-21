import { applyPatch } from 'fast-json-patch';

import { createPatch } from 'src/features/formData/jsonPatch/createPatch';
import type { JsonPatch } from 'src/features/formData/jsonPatch/types';

interface TestPatchProps<T> {
  prev: T;
  next: T;
  current?: T;
  final?: T;
  expectedPatch: JsonPatch;
}

function testPatch<T extends object>({ prev, next, current, final, expectedPatch }: TestPatchProps<T>) {
  const hasCurrent = current !== undefined;
  const maybeSimulatedCurrent = hasCurrent ? current : prev;

  if (!hasCurrent) {
    test('creating patch for prev -> next', () => {
      const patch = createPatch({ prev, next });
      expect(patch).toEqual(expectedPatch);
    });

    const testText2 = final ? 'applying patch to prev produces final' : 'applying patch to prev produces next';
    test(testText2, () => {
      const patch = createPatch({ prev, next });
      const prevCopy = structuredClone(prev);
      const patched = applyPatch(prevCopy, patch).newDocument;
      expect(patched).toEqual(final ?? next);
      expect(prevCopy).toEqual(final ?? next); // Ensure the patch modified the original object as well
    });
  }

  const testSuffix = hasCurrent ? '(with current)' : '(with simulated current)';
  test(`creating patch for prev -> next ${testSuffix}`, () => {
    const patch = createPatch({ prev, next, current: maybeSimulatedCurrent });
    const expectedWithoutTests = expectedPatch.filter((op) => op.op !== 'test');
    expect(patch).toEqual(expectedWithoutTests);
  });

  const testText3 = final ? 'applying patch to current produces final' : 'applying patch to current produces next';
  test(testText3, () => {
    const patch = createPatch({ prev, next, current: maybeSimulatedCurrent });
    const currentCopy = structuredClone(maybeSimulatedCurrent);
    const patched = applyPatch(currentCopy, patch).newDocument;
    expect(patched).toEqual(final ?? next);
    expect(currentCopy).toEqual(final ?? next); // Ensure the patch modified the original object as well
  });
}

describe('createPatch', () => {
  describe('should return an empty array when given two empty objects', () => {
    testPatch({ prev: {}, next: {}, expectedPatch: [] });
  });

  describe('should return an empty array when given two identical objects', () => {
    testPatch({ prev: { a: 1 }, next: { a: 1 }, expectedPatch: [] });
  });

  describe('should return simple replace', () => {
    testPatch({
      prev: { a: 1 },
      next: { a: 2 },
      expectedPatch: [
        { op: 'test', path: '/a', value: 1 },
        { op: 'replace', path: '/a', value: 2 },
      ],
    });
  });

  describe('should return simple remove', () => {
    testPatch({
      prev: { a: 1 },
      next: {},
      expectedPatch: [
        { op: 'test', path: '/a', value: 1 },
        { op: 'remove', path: '/a' },
      ],
    });
  });

  describe('should return simple add', () => {
    testPatch({ prev: {}, next: { a: 1 }, expectedPatch: [{ op: 'add', path: '/a', value: 1 }] });
  });

  describe('should create an add op for a nested object', () => {
    testPatch({ prev: {}, next: { a: { b: 1 } }, expectedPatch: [{ op: 'add', path: '/a', value: { b: 1 } }] });
  });

  describe('should create an add op for a nested array', () => {
    testPatch({ prev: {}, next: { a: [1, 2, 3] }, expectedPatch: [{ op: 'add', path: '/a', value: [1, 2, 3] }] });
  });

  describe('should create an add op for a nested array with objects', () => {
    testPatch({
      prev: {},
      next: { a: [{ b: 1 }, { b: 2 }] },
      expectedPatch: [{ op: 'add', path: '/a', value: [{ b: 1 }, { b: 2 }] }],
    });
  });

  describe('should create a shallower add op for a nested object', () => {
    testPatch({
      prev: { a: { b: 1 } },
      next: { a: { b: 1, c: 2 } },
      expectedPatch: [{ op: 'add', path: '/a/c', value: 2 }],
    });
  });

  describe('should create a shallower add op for a nested array', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [1, 2, 3, 4] },
      expectedPatch: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'add', path: '/a/-', value: 4 },
      ],
    });
  });

  describe('should create a shallower add op for a nested array with objects', () => {
    const common = { d: 5, e: 6 };
    testPatch({
      prev: {
        a: [
          { b: 1, ...common },
          { b: 2, ...common },
        ],
      },
      next: { a: [{ b: 1, ...common }, { b: 2, ...common }, { b: 3 }] },
      expectedPatch: [
        {
          op: 'test',
          path: '/a',
          value: [
            { b: 1, ...common },
            { b: 2, ...common },
          ],
        },
        { op: 'add', path: '/a/-', value: { b: 3 } },
      ],
    });
  });

  describe('should create a remove op for a nested object', () => {
    testPatch({
      prev: { a: { b: 1 } },
      next: {},
      expectedPatch: [
        { op: 'test', path: '/a', value: { b: 1 } },
        { op: 'remove', path: '/a' },
      ],
    });
  });

  describe('should create a remove op for a nested array', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: {},
      expectedPatch: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'remove', path: '/a' },
      ],
    });
  });

  describe('should create a remove op when removing an index from a nested array', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [1, 3] },
      expectedPatch: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'remove', path: '/a/1' },
      ],
    });
  });

  describe('should create a remove op when removing an object from a nested array', () => {
    testPatch({
      prev: { a: [{ b: 1 }, { b: 2 }] },
      next: { a: [{ b: 1 }] },
      expectedPatch: [
        { op: 'test', path: '/a', value: [{ b: 1 }, { b: 2 }] },
        { op: 'remove', path: '/a/1' },
      ],
    });
  });

  describe('should not produce a patch when deep arrays are equal', () => {
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
      expectedPatch: [],
    });
  });

  describe('should create multiple remove operations when removing multiple values from arrays', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [1] },
      expectedPatch: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'remove', path: '/a/2' },
        { op: 'remove', path: '/a/1' },
      ],
    });
  });

  describe('should create a valid patch when removing values and adding values to the array at the same time', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [2, 3, 4] },
      expectedPatch: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'remove', path: '/a/0' },
        { op: 'add', path: '/a/-', value: 4 },
      ],
    });
  });

  describe('should create a valid patch when removing objects and adding objects to the array while the length stays the same', () => {
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
      expectedPatch: [
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

  describe('should create multiple remove operations when removing multiple values the middle of an array', () => {
    testPatch({
      prev: { a: [0, 1, 2, 3, 4, 5, 6] },
      next: { a: [0, 1, 5, 6] },
      expectedPatch: [
        { op: 'test', path: '/a', value: [0, 1, 2, 3, 4, 5, 6] },
        { op: 'remove', path: '/a/4' },
        { op: 'remove', path: '/a/3' },
        { op: 'remove', path: '/a/2' },
      ],
    });
  });

  describe('should prefer remove and add operations for a simple string in a large array', () => {
    testPatch({
      prev: { a: ['foo', 'bar', 'baz', 'qux'] },
      next: { a: ['foo', 'bar2', 'baz', 'qux'] },
      expectedPatch: [
        { op: 'test', path: '/a', value: ['foo', 'bar', 'baz', 'qux'] },
        { op: 'remove', path: '/a/1' },
        { op: 'add', path: '/a/1', value: 'bar2' },
      ],
    });
  });

  describe('should prefer a simple replace op for a number in a nested array', () => {
    testPatch({
      prev: { a: [{ b: [{ a: 5, b: 3, c: 8 }] }] },
      next: { a: [{ b: [{ a: 5, b: 3, c: 9 }] }] },
      expectedPatch: [
        { op: 'test', path: '/a/0/b/0/c', value: 8 },
        { op: 'replace', path: '/a/0/b/0/c', value: 9 },
      ],
    });
  });

  describe('should create an add operation with a dash key when appending to an array', () => {
    testPatch({
      prev: { a: [1, 2, 3] },
      next: { a: [1, 2, 3, 4] },
      expectedPatch: [
        { op: 'test', path: '/a', value: [1, 2, 3] },
        { op: 'add', path: '/a/-', value: 4 },
      ],
    });
  });

  describe('should create a minimal patch with replace operations when multiple values are changed inside nested arrays', () => {
    const equalObject = { foo: 'bar', baz: 'qux' };
    testPatch({
      prev: { a: [{ b: [equalObject, { a: 5, b: 3, c: 8 }, equalObject, { d: 4, ...equalObject }] }] },
      next: { a: [{ b: [equalObject, { a: 5, b: 3, c: 9 }, equalObject, { d: 5, ...equalObject }] }] },
      expectedPatch: [
        { op: 'test', path: '/a/0/b/1/c', value: 8 },
        { op: 'replace', path: '/a/0/b/1/c', value: 9 },
        { op: 'test', path: '/a/0/b/3/d', value: 4 },
        { op: 'replace', path: '/a/0/b/3/d', value: 5 },
      ],
    });
  });

  describe('should create a simple replace op for a string in a nested object', () => {
    testPatch({
      prev: { a: { b: 'foo' } },
      next: { a: { b: 'bar' } },
      expectedPatch: [
        { op: 'test', path: '/a/b', value: 'foo' },
        { op: 'replace', path: '/a/b', value: 'bar' },
      ],
    });
  });

  describe('should create a simple replace when new value is null', () => {
    testPatch({
      prev: { a: { b: 'foo' } },
      next: { a: { b: null } },
      expectedPatch: [
        { op: 'test', path: '/a/b', value: 'foo' },
        { op: 'replace', path: '/a/b', value: null },
      ],
    });
  });

  describe('should create a simple replace when old value is null', () => {
    testPatch({
      prev: { a: { b: null } },
      next: { a: { b: 'foo' } },
      expectedPatch: [
        { op: 'test', path: '/a/b', value: null },
        { op: 'replace', path: '/a/b', value: 'foo' },
      ],
    });
  });

  describe('should create add operations for new properties in an empty object, even when inside an array', () => {
    testPatch({
      prev: { a: [{}] },
      next: { a: [{ b: 1, d: 2, e: 5, f: 8 }] },
      expectedPatch: [
        { op: 'add', path: '/a/0/b', value: 1 },
        { op: 'add', path: '/a/0/d', value: 2 },
        { op: 'add', path: '/a/0/e', value: 5 },
        { op: 'add', path: '/a/0/f', value: 8 },
      ],
    });
  });

  describe('should compare object individually, not taking arrays in them into account', () => {
    // This case appears a lot when comparing backend changes in the data model to our own current model. The backend
    // may send us lots of new properties on objects in arrays where we just added an empty object. For nested groups
    // that could lead to the whole upper object being compared and it was assumed the whole object was changed enough
    // that it should be removed and a new one added.
    const complex = { d: 5, e: 6, f: 7 };
    testPatch({
      prev: { a: [{ b: { c: 1 }, nested: [{}, {}, {}] }] },
      next: { a: [{ b: { c: 2 }, nested: [complex, complex, complex] }] },
      expectedPatch: [
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

  describe('when given a current object, there should be no test operations', () => {
    testPatch({
      prev: { a: 1 },
      next: { a: 2 },
      current: { a: 1 },
      expectedPatch: [{ op: 'replace', path: '/a', value: 2 }],
    });
  });

  describe('should not overwrite user changes to the current object when given a change in next', () => {
    testPatch({
      prev: { a: 1 },
      next: { a: 2 },
      current: { a: 3 },
      final: { a: 3 },
      expectedPatch: [],
    });
  });

  describe('should not apply updates to a row that has been removed in the current model', () => {
    const objA = { foo: 'bar', row: 'a' };
    const objB = { foo: 'baz', row: 'b' };
    const objC = { foo: 'qux', row: 'c' };
    testPatch({
      prev: { a: [objA, objB, objC] },
      next: { a: [objA, { ...objB, foo: 'baz2' }, objC] },
      current: { a: [objA, objC] },
      final: { a: [objA, objC] },
      expectedPatch: [],
    });
  });

  describe('should seamlessly apply changes to one property even if another property has changed in current', () => {
    testPatch({
      prev: { a: [{ b: 1, c: 2 }] },
      next: { a: [{ b: 1, c: 3 }] },
      current: { a: [{ b: 1, c: 2 }] },
      expectedPatch: [{ op: 'replace', path: '/a/0/c', value: 3 }],
    });
  });

  describe('should seamlessly add a property even if another property has changed in current', () => {
    testPatch({
      prev: { a: [{ b: 1 }] },
      next: { a: [{ b: 1, c: 3 }] },
      current: { a: [{ b: 2 }] },
      final: { a: [{ b: 2, c: 3 }] },
      expectedPatch: [{ op: 'add', path: '/a/0/c', value: 3 }],
    });
  });

  describe('should preserve row added by openByDefault in nested group (1)', () => {
    testPatch({
      prev: { group: [{}] },
      next: { group: [{ a: 5, childGroup: [] }] },
      current: { group: [{ childGroup: [{}] }] }, // While saving, our current model got a new blank row
      final: { group: [{ a: 5, childGroup: [{}] }] }, // The final model should have the blank row
      expectedPatch: [
        // The patch should respect the change in current and not overwrite it
        { op: 'add', path: '/group/0/a', value: 5 },
      ],
    });
  });

  describe('should preserve row added by openByDefault in nested group (2)', () => {
    testPatch({
      // The only change from the above is that we don't already have an object in prev, but that should not matter
      // as the object exists in both next and current.
      prev: { group: [] },
      next: { group: [{ a: 5, childGroup: [] }] },
      current: { group: [{ childGroup: [{}] }] },
      final: { group: [{ a: 5, childGroup: [{}] }] },
      expectedPatch: [{ op: 'add', path: '/group/0/a', value: 5 }],
    });
  });

  describe('should ignore removed data in current array that is changed in next', () => {
    testPatch({
      // In many ways, this is the exact opposite of what happens in the two tests above
      prev: { group: [{ a: 5 }] },
      next: { group: [{ a: 6 }] },
      current: { group: [] },
      final: { group: [] },
      expectedPatch: [],
    });
  });

  describe('adding a row with backend updates will only add new properties', () => {
    // It is important that we create new array objects for every `childGroup`, to make sure createPatch() compares
    // these properly, not just by equality (===).
    const existingRow = { a: 1, b: 2, childGroup: 'replace-this-with-an-empty-array' };
    const newRow = { a: 1, b: 2, c: 3 };
    testPatch({
      prev: { group: [{ ...existingRow, childGroup: [] }, {}] },
      next: { group: [{ ...existingRow, childGroup: [] }, newRow] },
      current: { group: [{ ...existingRow, childGroup: [] }, { d: 5 }] },
      final: {
        group: [
          { ...existingRow, childGroup: [] },
          { ...newRow, d: 5 },
        ],
      },
      expectedPatch: [
        { op: 'add', path: '/group/1/a', value: 1 },
        { op: 'add', path: '/group/1/b', value: 2 },
        { op: 'add', path: '/group/1/c', value: 3 },
      ],
    });
  });

  describe('uploaded file on the client mapped to an array should not be overwritten by backend', () => {
    testPatch({
      prev: { group: [{ fileIds: [] }] },
      next: { group: [{ fileIds: [] }] },
      current: { group: [{ fileIds: ['fileId1'] }] },
      final: { group: [{ fileIds: ['fileId1'] }] },
      expectedPatch: [],
    });
  });
});
