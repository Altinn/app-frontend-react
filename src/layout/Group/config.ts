import { CG } from 'src/codegen/CG';
import { ComponentCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: ComponentCategory.Container,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
  },
});

//   validTextResourceBindings:
//     | TextBindingsForSummarizableComponents
//     | 'title'
//     // Used in repeating groups:
//     | 'add_button_full'
//     | 'add_button'
//     | 'save_button'
//     | 'save_and_next_button'
//     | 'edit_button_close'
//     | 'edit_button_open'
//     // Used when rendered as Panel:
//     | 'add_label'
//     | 'body'
//     // Used when in Likert mode:
//     | 'leftColumnHeader'
//     | 'description';
