import { CG } from 'src/codegen/CG';
import { CHECKBOX_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Checkboxes/config';
import { CompCategory } from 'src/layout/common';
import { DROPDOWN_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Dropdown/config';
import { INPUT_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Input/config';
import { MULTIPLE_SELECT_SUMMARY_OVERRIDE_PROPS } from 'src/layout/MultipleSelect/config';
import { RADIO_SUMMARY_OVERRIDE_PROPS } from 'src/layout/RadioButtons/config';
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
      'target',
      new CG.obj(
        new CG.prop(
          'type',
          new CG.enum('page', 'layoutSet', 'component', 'task')
            .optional({ default: 'component' })
            .setTitle('Mode')
            .setDescription('Config for what should be rendered'),
        ),
        new CG.prop('id', new CG.str()),
      ),
    ),
  )
  .addProperty(
    new CG.prop(
      'overrides',
      new CG.arr(
        new CG.union(
          INPUT_SUMMARY_OVERRIDE_PROPS,
          CHECKBOX_SUMMARY_OVERRIDE_PROPS,
          RADIO_SUMMARY_OVERRIDE_PROPS,
          DROPDOWN_SUMMARY_OVERRIDE_PROPS,
          MULTIPLE_SELECT_SUMMARY_OVERRIDE_PROPS,
        ),
      ).optional(),
    ),
  );
