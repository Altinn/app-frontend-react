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
      name: 'awaiting_signature_panel_title',
      title: 'Awaiting signature panel title',
      description: 'The title of the panel that is displayed when the user should sign',
    }),
  )
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
  )
  .addTextResource(
    new CG.trb({
      name: 'sign_button',
      title: 'Signing button',
      description: 'The text to display in the button that the user clicks in order to sign',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'submit_panel_title_ready_for_submit',
      title: 'Ready for submit title',
      description: 'The title for the panel when the signing task is ready for submit',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'submit_panel_title_not_ready_for_submit',
      title: 'Not ready for submit title',
      description: 'The title for the panel when the signing task is not ready for submit',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'submit_panel_description_ready_for_submit',
      title: 'Ready for submit description',
      description: 'The description for the panel when the signing task is ready for submit',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'submit_panel_description_not_signing',
      title: 'Not signing description',
      description: 'The description for the panel when the user does not have signing rights',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'submit_panel_description_signed',
      title: 'Signed description',
      description: 'The description for the panel when the user has signed',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'submit_button',
      title: 'Submit button',
      description: 'The text to display in the button that the user clicks in order to submit the signing task',
    }),
  )

  .addTextResource(
    new CG.trb({
      name: 'go_to_inbox_panel_title_has_signed',
      title: 'Go to inbox panel title signed',
      description:
        'The title of the panel that is displayed when the user has signed and no further action is required',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'go_to_inbox_panel_title_not_signed',
      title: 'Go to inbox panel title not signed',
      description:
        'The title of the panel that is displayed when the user has not signed and no further action is required',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'go_to_inbox_panel_description_has_signed',
      title: 'Go to inbox panel description signed',
      description:
        'The description of the panel that is displayed when the user has signed and no further action is required',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'go_to_inbox_panel_description_not_signed',
      title: 'Go to inbox panel description not signed',
      description:
        'The description of the panel that is displayed when the user has not signed and no further action is required',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'go_to_inbox_button',
      title: 'Go to inbox button',
      description:
        'The text to display in the button that the user clicks in order to go to the inbox and no further action is required',
    }),
  );
