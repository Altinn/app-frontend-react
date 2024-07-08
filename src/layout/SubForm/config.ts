import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
  },
})
  .addProperty(
    new CG.prop(
      'layoutSet',
      new CG.str().setTitle('Layout set ID').setDescription('Which layout set to load for this sub-form'),
    ),
  )
  .addProperty(
    new CG.prop(
      'dataType',
      new CG.str().setTitle('Data (model) type').setDescription('Which data model should be used for these sub-forms'),
    ),
  )
  .addProperty(new CG.prop('showAddButton', new CG.bool().optional({ default: true })))
  .addProperty(new CG.prop('showDeleteButton', new CG.bool().optional({ default: true })))
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title of the sub-form component',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'description',
      title: 'Description',
      description: 'The description text shown underneath the title',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'addButton',
      title: 'Add button (suffix)',
      description: 'The text for the "Add" button (used as a suffix after the default button text)',
    }),
  );

/**
   * {
        "id": "subForms",
        "type": "SubForm",
        "layoutSet": "message",
        "dataType": "message",
        "tableColumns": [
          {
            "title": "Regnr",
            "content": "BilInfo.RegNr"
          }
        ]
      }
   *
   */
