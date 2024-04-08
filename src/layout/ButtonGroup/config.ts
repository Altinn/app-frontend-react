import { CG } from 'src/codegen/CG';
import { LabelRendering } from 'src/codegen/Config';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Container,
  rendersWithLabel: LabelRendering.FromGenericComponent,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
  functionality: {
    customExpressions: false,
  },
}).addSimpleChildrenPlugin('Child component IDs of button-like components to be rendered in this group');
