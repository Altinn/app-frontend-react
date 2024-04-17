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
  .addTextResource(
    new CG.trb({
      name: 'receiptOrgName',
      title: 'Receipt Organization Name',
      description: 'The organization name of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptOrgNumber',
      title: 'Receipt Organization Number',
      description: 'The organization number of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptBankAcountNumber',
      title: 'Receipt Bank Account Number',
      description: 'The bank account number of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptEmailAdress',
      title: 'Receipt Email Address',
      description: 'The email address of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptPhoneNumber',
      title: 'Receipt Phone Number',
      description: 'The phone number of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptSupportPhoneNumber',
      title: 'Receipt Support Phone Number',
      description: 'The support phone number of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptStreetAdress',
      title: 'Receipt Street Address',
      description: 'The street address of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptZipCode',
      title: 'Receipt Zip Code',
      description: 'The zip code of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptCity',
      title: 'Receipt City',
      description: 'The city of the payment recipient to be displayed on the recipt',
    }),
  )
  .addTextResource(
    new CG.trb({
      name: 'receiptCountry',
      title: 'Receipt Country',
      description: 'The country of the payment recipient to be displayed on the recipt',
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
