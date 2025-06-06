import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { GridRowsPlugin } from 'src/layout/Grid/GridRowsPlugin';

export const Config = new CG.component({
  category: CompCategory.Container,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: true,
    renderInAccordionGroup: false,
    renderInCards: true,
    renderInCardsMedia: false,
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
})
  .addSummaryOverrides((obj) => {
    obj.addProperty(
      new CG.prop(
        'hideEmptyRows',
        new CG.bool()
          .optional()
          .setTitle('Hide empty rows')
          .setDescription(
            'Whether to hide empty rows in the Grid. Rows are considered empty only when they contain components, and all those components are hidden or empty.',
          ),
      ),
    );
  })
  .addPlugin(new GridRowsPlugin())
  .extends(CG.common('LabeledComponentProps'))
  .extendTextResources(CG.common('TRBLabel'));
