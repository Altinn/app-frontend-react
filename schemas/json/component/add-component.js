const fs = require('fs');

const componentTemplate = `{
  "$id": "https://altinncdn.no/schemas/json/component/<COMPONENT TYPE>.schema.v1.json",
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "<COMPONENT TYPE> component",
  "description": "Schema that describes the layout configuration for a <COMPONENT TYPE> component.",
  "type": "object",
  "properties": {
    "id": {
      "$ref": "common-defs.schema.v1.json#/$defs/id"
    },
    "type": {
      "type": "string",
      "title": "Type",
      "description": "The component type.",
      "const": "<COMPONENT TYPE>"
    },
    "textResourceBindings": {
      "type": "object",
      "title": "Text resource bindings",
      "description": "Text resource bindings for a component.",
      "properties": {
        "title": {
          "type": "string"
        }
      },
      "required": [
        "title"
      ],
      "additionalProperties": false
    },
    "required": {
      "$ref": "common-defs.schema.v1.json#/$defs/required"
    },
    "readOnly": {
      "$ref": "common-defs.schema.v1.json#/$defs/readOnly"
    },
    "renderAsSummary": {
      "title": "Render as summary",
      "description": "Boolean or expression indicating if the component should be rendered as a summary. Defaults to false.",
      "default": false,
      "$ref": "../layout/expression.schema.v1.json#/definitions/boolean"
    },
    "hidden": {
      "title": "Hidden",
      "description": "Boolean value or expression indicating if the component should be hidden. Defaults to false.",
      "default": false,
      "$ref": "../layout/expression.schema.v1.json#/definitions/boolean"
    },
    "grid": {
      "type": "object",
      "title": "Grid",
      "description": "Settings for the components grid. Used for controlling horizontal alignment.",
      "$ref": "common-defs.schema.v1.json#/$defs/gridSettings",
      "examples": [
        {
          "xs": 12
        }
      ]
    },
    "pageBreak": {
      "$ref": "common-defs.schema.v1.json#/$defs/pageBreak"
    }
  },
  "required": [
    "id",
    "type"
  ],
  "additionalProperties": false
}
`;

const replaceComponentType = (componentType) => componentTemplate.replaceAll('<COMPONENT TYPE>', componentType);

const updateLayoutSchema = (filePath, componentPath) => {
  const rawData = fs.readFileSync('./layout.schema.v2.json');
  const schema = JSON.parse(rawData);
  schema.$defs.component.oneOf.push({
    $ref: componentPath,
  });
  fs.writeFileSync(filePath, JSON.stringify(schema, null, 2));
};

const script = () => {
  let componentType;
  let pathToLayoutSchema;

  process.argv.slice(2).forEach((arg) => {
    const [key, value] = arg.split('=');
    switch (key) {
      case 'type': {
        componentType = value;
        break;
      }
      case 'schemaPath': {
        pathToLayoutSchema = value;
        break;
      }
      default:
        break;
    }
  });

  if (!componentType || !pathToLayoutSchema) {
    console.error('Input arguments missing!');
    console.error('-------------------');
    console.error('Usage:');
    console.error('node ./add-component.js type=<ComponentType> schemaPath=<path to layout schema>');
    return;
  }

  const componentFilePath = `${componentType}.schema.v1.json`;
  let componentString = replaceComponentType(componentType);
  fs.writeFileSync(componentFilePath, componentString, (err) => {
    if (err) {
      console.error(err);
    }
  });
  updateLayoutSchema(pathToLayoutSchema, componentFilePath);
};

script();
