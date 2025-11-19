import { CG } from 'src/codegen/CG';
import { CompCategory } from 'src/layout/common';
import { credentialTypes } from 'src/layout/Lommebok/types';

export const Config = new CG.component({
  category: CompCategory.Form,
  capabilities: {
    renderInTable: false,
    renderInButtonGroup: false,
    renderInAccordion: true,
    renderInAccordionGroup: false,
    renderInCards: true,
    renderInCardsMedia: false,
    renderInTabs: true,
  },
  functionality: {
    customExpressions: false,
  },
}).addProperty(
  new CG.prop(
    'request',
    new CG.arr(
      new CG.union(...credentialTypes.map((type) => new CG.obj(new CG.prop('type', new CG.const(type)))))
        .setUnionType('discriminated')
        .exportAs('RequestedDocument'),
    ),
  ),
);
