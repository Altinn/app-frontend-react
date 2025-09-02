import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  capabilities: {
    renderInTable: true,
    renderInButtonGroup: false,
    renderInAccordion: true,
    renderInAccordionGroup: false,
    renderInTabs: true,
    renderInCards: true,
    renderInCardsMedia: false,
  },
  functionality: {
    customExpressions: true,
  },
})
  .makeSummarizable()
  .extendTextResources(CG.common('TRBLabel'))
  .addProperty(
    new CG.prop(
      'viewport',
      new CG.enum('1:1', '4:3', '16:9', 'circle')
        .optional({ default: 'circle' })
        .setTitle('Viewport')
        .setDescription('The aspect ratio of the cropping area'),
    ),
  )
  .addSummaryOverrides();
