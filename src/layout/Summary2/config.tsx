import { CG } from 'src/codegen/CG';
import { CHECKBOX_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Checkboxes/config';
import { CompCategory } from 'src/layout/common';
import { DATEPICKER_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Datepicker/config';
import { DROPDOWN_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Dropdown/config';
import { GROUP_SUMMARY_PROPS } from 'src/layout/Group/config';
import { INPUT_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Input/config';
import { LIKERT_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Likert/config';
import { LIST_SUMMARY_OVERRIDE_PROPS } from 'src/layout/List/config';
import { MAP_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Map/config';
import { MULTIPLE_SELECT_SUMMARY_OVERRIDE_PROPS } from 'src/layout/MultipleSelect/config';
import { PAYMENT_SUMMARY_OVERRIDE_PROPS } from 'src/layout/Payment/config';
import { RADIO_SUMMARY_OVERRIDE_PROPS } from 'src/layout/RadioButtons/config';
import { REPEATING_GROUP_SUMMARY_OVERRIDE_PROPS } from 'src/layout/RepeatingGroup/config';
import { TABS_SUMMARY_PROPS } from 'src/layout/Tabs/config';
import { TEXTAREA_SUMMARY_PROPS } from 'src/layout/TextArea/config';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
    renderInCards: false,
    renderInCardsMedia: false,
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
  directRendering: true,
})
  .addProperty(
    new CG.prop(
      'target',
      new CG.obj(
        new CG.prop(
          'type',
          new CG.enum('page', 'layoutSet', 'component').optional({ default: 'component' }).setTitle('Mode'),
        ),
        new CG.prop('id', new CG.str().optional()),
        new CG.prop(
          'taskId',
          new CG.str()
            .optional()
            .setTitle('Task ID')
            .setDescription('Use this if you want to render something from another task.'),
        ),
      )
        .setDescription('Config for what should be rendered. If you set taskId, this property is optional.')
        .optional(),
    ),
  )
  .addProperty(new CG.prop('showPageInAccordion', new CG.bool().optional()))
  .addProperty(
    new CG.prop(
      'hideEmptyFields',
      new CG.bool()
        .optional()
        .setDescription("Set this to true if you don't want to show fields that have not been filled out."),
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
          GROUP_SUMMARY_PROPS,
          TEXTAREA_SUMMARY_PROPS,
          REPEATING_GROUP_SUMMARY_OVERRIDE_PROPS,
          DATEPICKER_SUMMARY_OVERRIDE_PROPS,
          LIST_SUMMARY_OVERRIDE_PROPS,
          TABS_SUMMARY_PROPS,
          MAP_SUMMARY_OVERRIDE_PROPS,
          LIKERT_SUMMARY_OVERRIDE_PROPS,
          PAYMENT_SUMMARY_OVERRIDE_PROPS,
        ).exportAs('AnySummaryOverrideProps'),
      ).optional(),
    ),
  );
