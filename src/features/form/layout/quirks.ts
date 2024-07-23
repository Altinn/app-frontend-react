import type { ILayouts } from 'src/layout/layout';

/**
 * After the hierarchy generator rewrite, some apps in production broke badly because of misconfiguration. To make sure
 * we can still ship the rewrite, we need to apply some quirks/fixes to some layouts. This function applies those quirks
 * and warns about them.
 */
export function applyLayoutQuirks(layouts: ILayouts, layoutSetId: string) {
  const quirk = quirks[`${window.org}/${window.app}/${layoutSetId}`];
  if (!quirk) {
    return;
  }

  // Start off with a copy of the entire layouts that we'll throw away if anything fails
  const clone = structuredClone(layouts);

  try {
    quirk.verifyAndApply(clone);
    window.logError(
      `Layout quirk(s) applied: \n - ${quirk.logMessages.join('\n - ')}.\n` +
        `Please fix your layout configuration. These workarounds will be removed in the future.`,
    );
  } catch (e) {
    return;
  }

  // If we got here, the quirks were applied successfully
  Object.assign(layouts, clone);
}

interface QuirkDef {
  verifyAndApply: (layouts: ILayouts) => void;
  logMessages: string[];
}

// Key format: 'org/app/layoutSetId' => QuirkDef
const quirks: { [key: string]: QuirkDef } = {
  'digdir/tilskudd-dig-delt-komp/form': {
    verifyAndApply: (layouts) => {
      assert(layouts['03Description']![1].id === 'descriptionHeader');
      assert(layouts['pdfReceipt']![7].id === 'descriptionHeader');

      layouts['pdfReceipt']![7].id = 'descriptionHeaderPdfSummary';
    },
    logMessages: [`Renamed duplicate ID 'descriptionHeader' in 'pdfReceipt' layout to 'descriptionHeaderPdfSummary'`],
  },
  'dmf/bergrettigheter-fristilling-un/form': {
    verifyAndApply: (layouts) => {
      const copyPasteSequence = [
        'tittelRapport',
        'raportplikt1',
        'raportplikt2',
        'raportplikt3',
        'raportplikt4',
        'raportplikt5',
        'tittelSluttRapport',
        'sluttraport',
        'tittelPorve',
        'Provemateriale',
        'tittelKarantere',
        'Karantene',
      ];

      assertSequenceOfIds(layouts, 'Oppsummering', copyPasteSequence, 6);
      assertSequenceOfIds(layouts, 'Raportering', copyPasteSequence);
      assert(layouts['Innsender']!.at(-1)!.id === 'knappNavigasjonForside');
      assert(layouts['Raportering']!.at(-1)!.id === 'knappNavigasjonForside');

      for (const idx of copyPasteSequence.keys()) {
        layouts['Oppsummering']![6 + idx].id += 'Oppsummering';
      }
      layouts['Innsender']!.at(-1)!.id = 'knappNavigasjonForsideInnsender';
    },
    logMessages: [
      `Renamed duplicate ID 'tittelRapport' (+ subsequent copy-pasted components)`,
      `Renamed duplicate ID 'knappNavigasjonForside' components.`,
    ],
  },
  'dsb/bekymring-forbrukertjenester/form': {
    verifyAndApply: (layouts) => {
      assert(layouts['01Introduction']!.at(-1)!.id === 'navButtons');
      assert(layouts['02ContactInfo']!.at(-1)!.id === 'navButtons');
      assert(layouts['03ProductInformation']!.at(-1)!.id === 'navButtons');
      assert(layouts['04Incident']!.at(-1)!.id === 'navButtons');
      assert(layouts['05Remarks']!.at(-1)!.id === 'navButtons');
      assert(layouts['06Attachments']!.at(-1)!.id === 'navButtons');
      const sequenceOfIds = [
        'contactInfo-group',
        'contactInfoFirstName-summary',
        'contactInfoLastName-summary',
        'contactInfoPhone-summary',
        'contactInfoEmail-summary',
        'productInfo-group',
        'productInfoCategory-summary',
        'productInfoCategoryDescription-summary',
        'productInfoProvider-summary',
        'productInfoLocation-summary',
        'productInfoOtherInformation-summary',
        'productInfoOtherInformationRequired-summary',
        'incident-group',
        'incidentLocation-summary',
        'incidentDate-summary',
        'incidentInformation-summary',
        'incidentCause-summary',
        'incidentPersonInjury-summary',
        'incidentPersonInjuryConsequence-summary',
        'incidentDescription-summary',
        'incidentDescriptionRequired-summary',
        'incidentVictimGroup-summary',
        'remarks-group',
        'remarks-summary',
        'attachmentsHeader-summary',
        'attachmentsUpload-summary',
      ];
      assertSequenceOfIds(layouts, '99Summary', sequenceOfIds, 2);
      assertSequenceOfIds(layouts, 'pdfReceipt', sequenceOfIds, 1);

      // Remove children that does not exist ('incidentVictimGroupHeader-summary')
      assert(layouts['99Summary']!.at(14)!.id === 'incident-group');
      assert((layouts['99Summary']!.at(14) as any).children[6] === 'incidentVictimGroupHeader-summary');
      assert(layouts['pdfReceipt']!.at(13)!.id === 'incident-group');
      assert((layouts['pdfReceipt']!.at(13) as any).children[6] === 'incidentVictimGroupHeader-summary');
      (layouts['99Summary']!.at(14) as any)!.children.splice(6, 1);
      (layouts['pdfReceipt']!.at(13) as any)!.children.splice(6, 1);

      layouts['01Introduction']!.at(-1)!.id = 'navButtons1';
      layouts['02ContactInfo']!.at(-1)!.id = 'navButtons2';
      layouts['03ProductInformation']!.at(-1)!.id = 'navButtons3';
      layouts['04Incident']!.at(-1)!.id = 'navButtons4';
      layouts['05Remarks']!.at(-1)!.id = 'navButtons5';
      layouts['06Attachments']!.at(-1)!.id = 'navButtons6';

      for (const idx of sequenceOfIds.keys()) {
        const comp = layouts['99Summary']![2 + idx];
        comp.id += 'SummaryPage';
        if (sequenceOfIds[idx].endsWith('-group') && comp.type === 'Group') {
          // Update child references as well
          for (const childIdx of comp.children!.keys()) {
            comp.children![childIdx] += 'SummaryPage';
          }
        }
      }
    },
    logMessages: [
      'Renamed duplicate IDs for NavigationButtons on page 1-6',
      'Renamed components copy-pasted between Summary and pdfReceipt pages',
      `Removed child that does not exist from 'incident-group'`,
    ],
  },
};

function assert(condition: boolean): void {
  if (!condition) {
    throw new Error('Quirk verification failed');
  }
}

function assertSequenceOfIds(layouts: ILayouts, page: string, ids: string[], startIndex = 0): void {
  for (const [idx, id] of ids.entries()) {
    assert(layouts[page]![startIndex + idx].id === id);
  }
}
