import type { CompTypes } from 'src/layout/layout';

export type PropList = {
  [key in CompTypes]: PropObjectProperties;
};

export type PropObjectProperties = {
  [key: string]: ComponentProperty;
};

export type ComponentProperty =
  | PropString
  | PropBool
  | PropNumber
  | PropDate
  | PropAnyExpr
  | PropConst
  | PropLink
  | PropEnum
  | PropComplexUnion
  | PropSimpleUnion
  | PropRange
  | PropObject
  | PropArray;

export interface PropTexts {
  title?: string;
  description?: string;
}

export interface PropBase {
  nb?: PropTexts;
  en?: PropTexts;
  default?: unknown;
  examples?: unknown[];
  deprecated?: boolean;
  required?: boolean;
}

export interface PropMaybeExpression extends PropBase {
  canBeExpression?: boolean;
}

export interface PropString extends PropMaybeExpression {
  type: 'string';
  pattern?: string;
}

export interface PropBool extends PropMaybeExpression {
  type: 'boolean';
}

export interface PropNumber extends PropMaybeExpression {
  type: 'number' | 'integer';
  minimum?: number;
  maximum?: number;
}

export interface PropDate extends PropMaybeExpression {
  type: 'date';
}

export interface PropAnyExpr extends PropMaybeExpression {
  type: 'any';
  canBeExpression: true;
}

export interface PropConst extends PropBase {
  type: 'const';
  const: unknown;
}

export interface PropLink extends Partial<PropBase> {
  type: 'link';
  link: string;
}

export interface PropEnum extends PropBase {
  type: 'enum';
  enum: unknown[];
}

// A complex union contains non-scalar alternatives, like objects or arrays
export interface PropComplexUnion extends PropBase {
  type: 'complexUnion';
  union: ComponentProperty[];
}

// A simple union contains simple values. Either plain types (any string, boolean, number, etc.), or specific values
// like enums. This can also simply represent an enum, but may extend what a plain enum can do (as it can
// include other types and ranges as well).
export interface PropSimpleUnion extends PropBase {
  type: 'simpleUnion';
  types?: ('string' | 'boolean' | 'number' | 'integer')[];
  enums?: (string | boolean | number | null)[];
  ranges?: { min: number; max: number }[];
}

export interface PropRange extends PropBase {
  type: 'range';
  minimum: number;
  maximum: number;
  asText: string;
}

export interface PropObject extends PropBase {
  type: 'object';
  properties: PropObjectProperties;
}

export interface PropArray extends PropBase {
  type: 'array';
  items: ComponentProperty;
  minItems?: number;
  maxItems?: number;
}
