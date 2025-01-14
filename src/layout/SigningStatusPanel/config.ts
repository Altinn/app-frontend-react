import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
    renderInTabs: false,
  },
  functionality: {
    customExpressions: false,
  },
})
  .addTextResource(
    new CG.trb({
      name: 'checkbox_label',
      title: 'Checkbox label',
      description: 'The text to display when a user is asked to confirm what they are signing',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'checkbox_description',
      title: 'Checkbox description',
      description: 'A text that describes the checkbox label in more detail if needed',
    }),
  );
