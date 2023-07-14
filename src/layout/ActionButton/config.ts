import { CG } from 'src/codegen';
import { ComponentCategory } from 'src/layout/common';

export const Generator = CG.newComponent(ComponentCategory.Action).addTextResource(
  'title',
  'Button title/text',
  'The text to display on the button.',
);
