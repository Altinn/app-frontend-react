export const secondaryGroup = {
  data: {
    layout: [
      {
        id: 'navx',
        type: 'NavigationBar',
      },
      {
        id: 'mainGroup2',
        type: 'Group',
        children: ['currentValue2', 'newValue2'],
        maxCount: 999,
        dataModelBindings: {
          group: 'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788',
        },
        textResourceBindings: {
          title: 'Group title',
        },
        edit: {
          mode: 'showTable',
          deleteButton: false,
          openByDefault: 'first',
        },
      },
      {
        id: 'currentValue2',
        type: 'Input',
        textResourceBindings: {
          title: '37131.SkattemeldingEndringEtterFristOpprinneligBelopdatadef37131.Label',
        },
        dataModelBindings: {
          simpleBinding:
            'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788.SkattemeldingEndringEtterFristOpprinneligBelop-datadef-37131.value',
        },
        required: false,
        readOnly: ['dataModel', 'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788.isPrefill'],
        labelSettings: {
          optionalIndicator: false,
        },
        grid: {
          md: 6,
        },
        formatting: {
          number: {
            thousandSeparator: ' ',
            prefix: 'NOK ',
            allowNegative: false,
          },
          align: 'right',
        },
      },
      {
        id: 'newValue2',
        type: 'Input',
        textResourceBindings: {
          title: '37132.SkattemeldingEndringEtterFristNyttBelopdatadef37132.Label',
        },
        dataModelBindings: {
          simpleBinding:
            'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788.SkattemeldingEndringEtterFristNyttBelop-datadef-37132.value',
        },
        required: false,
        readOnly: ['dataModel', 'Endringsmelding-grp-9786.OversiktOverEndringene-grp-9788.isPrefill'],
        grid: {
          md: 6,
        },
        formatting: {
          number: {
            thousandSeparator: ' ',
            prefix: 'NOK ',
            allowNegative: false,
          },
          align: 'right',
        },
        triggers: ['validation'],
      },
    ],
  },
};
