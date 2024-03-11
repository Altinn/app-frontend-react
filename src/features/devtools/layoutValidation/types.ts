import type { lookupBindingInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import type { CompInternal, CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface LayoutValidationCtx<T extends CompTypes> {
  node: LayoutNode<T>;
  item: CompInternal<T>;
  lookupBinding(binding: string): ReturnType<typeof lookupBindingInSchema>;
}

export interface LayoutValidationErrors {
  [layoutSetId: string]: {
    [pageName: string]: {
      [componentId: string]: string[];
    };
  };
}
