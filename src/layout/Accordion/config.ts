import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { NonRepeatingChildrenPlugin } from 'src/utils/layout/plugins/NonRepeatingChildrenPlugin';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: true,
    renderInCards: false,
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
      description: 'The title of the accordion',
    }),
  )
  .addPlugin(
    new NonRepeatingChildrenPlugin({
      onlyWithCapability: 'renderInAccordion',
      description: 'List of child component IDs to show inside the Accordion (limited to a few component types)',
    }),
  )
  .addProperty(new CG.prop('headingLevel', CG.common('HeadingLevel').optional()));
