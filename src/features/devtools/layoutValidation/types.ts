import type { lookupBindingInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import type { CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/features/form/nodes/LayoutNode';

export interface LayoutValidationCtx<T extends CompTypes> {
  node: LayoutNode<T>;
  lookupBinding(binding: string): ReturnType<typeof lookupBindingInSchema>;
}

export interface LayoutValidationErrors {
  [layoutSetId: string]: {
    [pageName: string]: {
      [componentId: string]: string[];
    };
  };
}
