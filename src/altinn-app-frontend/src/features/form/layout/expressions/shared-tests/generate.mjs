import fs from 'node:fs';

/**
 * This generates test cases for all possible combinations of typed arguments for two-argument functions
 * returning true/false.
 *
 * Execute this tool with:
 *    node generate.mjs <function name>
 *
 * Please note: The generated tests tries to be exhaustive without duplicating test cases. Not all tests
 * generated will make sense for your function, and you'll probably have to delete some of the generated
 * files that cannot possibly work.
 */

const functionName = (process.argv[2] || '').replace(/\/+$/, '');
if (!functionName) {
  throw new Error('Please provide a function name as the first argument');
}

const stat = fs.statSync(functionName);
if (!stat || !stat.isDirectory()) {
  throw new Error('Given function name (' + functionName+ ') does not have a directory for tests');
}

const types = {
  string: {
    name: 'string',
    plural: 'strings',
    example: 'foo',
    incompatibleWith: [],
  },
  bool: {
    name: 'boolean',
    plural: 'booleans',
    example: true,
    incompatibleWith: ['float'],
  },
  float: {
    name: 'float',
    plural: 'floats',
    example: 123.456,
    incompatibleWith: ['bool', 'null'],
  },
  int: {
    name: 'integer',
    plural: 'integers',
    example: 123,
    incompatibleWith: [],
  },
  null: {
    name: 'null',
    plural: 'nulls',
    example: null,
    incompatibleWith: ['float'],
  },
};

const existingFiles = fs.readdirSync(functionName);

for (const type1 of Object.keys(types)) {
  for (const type2 of Object.keys(types)) {
    for (let variant of [true, false]) {
      const t1 = types[type1];
      const t2 = types[type2];
      const sameType = type1 === type2;

      const suffix = sameType && type1 === 'null'
        ? ''
        : `-${variant}`;

      const fileName = sameType
          ? `same-types-${type1}${suffix}.json`
          : `diff-types-${type1}-${type2}${suffix}.json`;
      const altFileName = sameType
          ? `same-types-${type2}${suffix}.json`
          : `diff-types-${type2}-${type1}${suffix}.json`;

      if (existingFiles.includes(fileName) || existingFiles.includes(altFileName)) {
        continue;
      }

      const testObj = {
        name: sameType
          ? `Should work with ${t1.plural} (${variant})`
          : `Should work with [${t1.name}, ${t2.name}] (${variant})`,
        expression: {
          function: functionName,
          args: [t1.example, t2.example]
        },
        expects: variant,
      };

      console.log('Writing new file:', fileName, '(implement a real test case for it)');
      fs.writeFileSync(functionName + '/' + fileName, JSON.stringify(testObj, null, 2));
      existingFiles.push(fileName);
    }
  }
}
