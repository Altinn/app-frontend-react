import type { JSONSchema7 } from 'json-schema';

import { generateCommonSchema } from 'src/codegen/Common';
import { SchemaFile } from 'src/codegen/SchemaFile';

export class LayoutSetsSchemaV1 extends SchemaFile {
  getFileName(): string {
    return 'layout/layout-sets.schema.v1.json';
  }

  async getSchema(): Promise<JSONSchema7> {
    generateCommonSchema();
    return {
      title: 'Altinn layout sets',
      description: 'Schema that describes the different layout sets for an Altinn application and when to use them',
      type: 'object',
      properties: {
        sets: {
          type: 'array',
          items: {
            $ref: '#/definitions/layoutset',
          },
        },
      },
      definitions: {
        layoutset: {
          type: 'object',
          additionalProperties: false,
          description: 'Settings regarding a specific layoutset',
          properties: {
            id: {
              type: 'string',
              title: 'id',
              description: 'The layoutset ID. Must be unique within a given application.',
            },
            dataType: {
              type: 'string',
              title: 'dataType',
              description: 'The datatype to use this layoyut.',
            },
            tasks: {
              $ref: '#/definitions/tasks',
            },
          },
        },
        tasks: {
          additionalProperties: false,
          description: 'An array specifying which task to use a layoutset',
          type: 'array',
          items: {
            description: "A layoutSet name, for instance 'Form1'",
            type: 'string',
          },
        },
      },
    };
  }
}
