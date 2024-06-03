import { CG, Variant } from 'src/codegen/CG';

export const InputSummaryConfig = {
  InputSummaryConfig: () =>
    new CG.obj(
      new CG.prop(
        'summaryProps',
        new CG.obj(
          new CG.prop(
            'hidden',
            new CG.bool()
              .optional()
              .setTitle('Hidden')
              .setDescription('Boolean value indicating if the component should be hidden in the summary'),
          ),
          new CG.prop(
            'displayType',
            new CG.enum('list', 'string')
              .setTitle('Display type')
              .setDescription('How data should be displayed for the radio in the summary'),
          ),
        )
          .optional()
          .setTitle('Summary properties')
          .setDescription('Properties for how to display the summary of the component'),
      ).onlyIn(Variant.Internal),
    ),
};
