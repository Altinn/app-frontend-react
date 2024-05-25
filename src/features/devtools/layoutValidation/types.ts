import type { lookupBindingInSchema } from 'src/features/datamodel/SimpleSchemaTraversal';
import type { CompIntermediate, CompTypes } from 'src/layout/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export interface LayoutValidationCtx<T extends CompTypes> {
  node: LayoutNode<T>;
  item: CompIntermediate<T>;
  lookupBinding(binding: string): ReturnType<typeof lookupBindingInSchema>;
}
