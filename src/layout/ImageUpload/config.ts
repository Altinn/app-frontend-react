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
      'circleCrop',
      new CG.bool().optional().setTitle('Circloe crop').setDescription('Uses a circle crop area instead of a square.'),
    ),
  )
  .addProperty(
    new CG.prop(
      'aspectRatio',
      new CG.str()
        .optional()
        .setTitle('Aspect ratio')
        .setDescription('Fix the crop area to a specific aspect ratio. E.g. 16:9 or 4:3')
        .setPattern(/^\\d+:\\d+$/),
    ),
  )
  .addSummaryOverrides();
