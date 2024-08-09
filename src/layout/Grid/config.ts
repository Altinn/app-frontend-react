import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { GridRowsPlugin } from 'src/layout/Grid/GridRowsPlugin';

export const Config = new CG.component({
  category: CompCategory.Container,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
}).addPlugin(new GridRowsPlugin());

// We don't render the label in GenericComponent, but we still need the
// text resource bindings for rendering them on our own
//Config.addTextResourcesForLabel().inner.extends(CG.common('LabeledComponentProps'));
// TODO: Fix this after merge from main. The performance branch removed it, maybe the label PR needed it?
