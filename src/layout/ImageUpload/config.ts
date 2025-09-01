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
      'cropAsCircle',
      new CG.bool()
        .optional({ default: false })
        .setTitle('Crop as a circle')
        .setDescription(
          'If enabled, the cropping area will be a circle. The resulting image will still be a square with transparent corners.',
        ),
    ),
  )
  .addSummaryOverrides();
