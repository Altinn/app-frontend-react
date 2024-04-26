import { CG } from 'src/codegen/CG';
import { ExprVal } from 'src/features/expressions/types';
import { CompCategory } from 'src/layout/common';

export const Config = new CG.component({
  category: CompCategory.Presentation,
  rendersWithLabel: false,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: false,
    renderInAccordionGroup: false,
  },
})
  .addProperty(
    new CG.prop(
      'renderAsSummary',
      new CG.expr(ExprVal.Boolean)
        .optional({ default: false })
        .setTitle('Render as summary')
        .setDescription(
          'Boolean value or expression indicating if the component should be rendered as a summary. Defaults to false.',
        ),
    ),
  )
  .addTextResource(
    new CG.trb({
      name: 'title',
      title: 'Title',
      description: 'The title of the paragraph',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'description',
      title: 'Description',
      description: 'Description, optionally shown below the title',
    }),
  )
  .addProperty(
    new CG.prop(
      'paymentSettings',
      new CG.obj(
        new CG.prop(
          'autoForwardToPayment',
          new CG.bool()
            .setTitle('Auto Forward To Payment')
            .setDescription('Automaticaly forward the user to the payment page after the payment has been initiated'),
        ),
      )
        .setTitle('Payment Settings')
        .setDescription('Settings for the payment component'),
    ),
  );
