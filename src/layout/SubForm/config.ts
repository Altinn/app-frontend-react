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
      new CG.str().setTitle('Layout set ID').setDescription('The layout set to load for this sub-form'),
    ),
  )
  .addProperty(
    new CG.prop(
      'dataType',
      new CG.str().setTitle('Data (model) type').setDescription('The data model be used for these sub-forms'),
    ),
  )
  .addProperty(new CG.prop('showAddButton', new CG.bool().optional({ default: true })))
  .addProperty(new CG.prop('showDeleteButton', new CG.bool().optional({ default: true })))
  .addProperty(
    new CG.prop(
      'tableColumns',
      new CG.arr(
        new CG.obj(
          new CG.prop(
            'headerContent',
            new CG.str()
              .setTitle('The column header value')
              .setDescription(
                'The header value to display. May contain a text resource bindings, but no data model lookups.',
              ),
          ),
          new CG.prop(
            'cellContent',
            new CG.str()
              .setTitle('The column cell value')
              .setDescription(
                'The value to display for each cell/row in this column. May contain text resource bindings and data model lookups (dot notation).',
              ),
          ),
        ),
      ),
    ),
  )
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