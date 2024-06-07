import { CG, Variant } from 'src/codegen/CG';
import { CHECKBOX_SUMMARY_PROPS } from 'src/layout/Checkboxes/config';
import { CompCategory } from 'src/layout/common';
import { INPUT_SUMMARY_PROPS } from 'src/layout/Input/config';
import { RADIO_SUMMARY_PROPS } from 'src/layout/RadioButtons/config';
export const Config = new CG.component({
  category: CompCategory.Container,
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
      'children',
      new CG.arr(new CG.str())
        .optional()
        .setTitle('Children')
        .setDescription('Array of component IDs that should be displayed in the summary'),
    ).onlyIn(Variant.External),
  )
  .addProperty(new CG.prop('childComponents', new CG.arr(CG.layoutNode)).onlyIn(Variant.Internal))
  .addProperty(
    new CG.prop(
      'children',
      new CG.arr(new CG.str())
        .optional()
        .setTitle('Children')
        .setDescription('Array of component IDs that should be displayed in the summary'),
    ).onlyIn(Variant.External),
  )
  .addProperty(
    new CG.prop(
      'whatToRender',
      new CG.obj(
        new CG.prop(
          'type',
          new CG.enum('page', 'layoutSet', 'component', 'task')
            .optional({ default: 'component' })
            .setTitle('Mode')
            .setDescription('The mode of the repeating group'),
        ),
        new CG.prop('id', new CG.str()),
      ),
    ),
  )
  .addProperty(
    new CG.prop(
      'overWriteProperties',
      new CG.arr(new CG.union(INPUT_SUMMARY_PROPS, CHECKBOX_SUMMARY_PROPS, RADIO_SUMMARY_PROPS)).optional(),
    ),
  );
