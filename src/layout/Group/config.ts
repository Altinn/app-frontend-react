import { CG, Variant } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const GROUP_SUMMARY_PROPS = new CG.obj(
  new CG.prop(
    'isCompact',
    new CG.bool()
      .optional()
      .setTitle('Compact summary')
      .setDescription('Boolean value indicating if the summary should be compact'),
  ),
)
  .extends(CG.common('ISummaryOverridesCommon'))
  .optional()
  .setTitle('Summary properties')
  .setDescription('Properties for how to display the summary of the component')
  .exportAs('GroupSummaryOverrideProps');

export const Config = new CG.component({
  category: CompCategory.Container,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: true,
    renderInCardsMedia: false,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title of the group (shown above the group)',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'description',
      title: 'Description',
      description: 'The description text shown underneath the title',
    }),
  )
  .addProperty(new CG.prop('childComponents', new CG.arr(CG.layoutNode)).onlyIn(Variant.Internal))
  .addProperty(
    new CG.prop(
      'groupingIndicator',
      new CG.enum('indented', 'panel')
        .optional()
        .setTitle('Set grouping indicator')
        .setDescription('Can visually group components together by indenting them or by putting them in a panel. '),
    ),
  )
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .setTitle('Children')
        .setDescription('Array of component IDs that should be displayed in the group'),
    ).onlyIn(Variant.External),
  )
  .addProperty(
    new CG.prop(
      'headingLevel',
      new CG.enum(2, 3, 4, 5, 6)
        .optional()
        .setTitle('Heading level')
        .setDescription('The heading level of the group title.'),
    ),
  )
  .addProperty(new CG.prop('summaryProps', GROUP_SUMMARY_PROPS).onlyIn(Variant.Internal));
