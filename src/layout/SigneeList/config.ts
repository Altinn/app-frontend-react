import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const SIGNEE_LIST_OVERRIDE_PROPS = new CG.obj(
  new CG.prop(
    'title',
    new CG.union(new CG.str(), CG.null)
      .setUnionType('discriminated')
      .optional()
      .setTitle('Summary title')
      .setDescription('Title of the summary'),
  ),
)
  .extends(CG.common('ISummaryOverridesCommon'))
  .optional()
  .setTitle('Summary properties')
  .setDescription('Properties for how to display the summary of the component')
  .exportAs('SigneeListSummaryOverrideProps');

export const Config = new CG.component({
  category: CompCategory.Presentation,
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
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'Header/title of the list',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'description',
      title: 'Description',
      description: 'Description of the list',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'help',
      title: 'Help',
      description: 'Help text of the list',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'summary_title',
      title: 'SummaryTitle',
      description: 'Title of the summary',
    }),
  );
