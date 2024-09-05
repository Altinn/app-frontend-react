import type { CompExternal, CompTypes, ILayouts } from 'src/layout/layout';

/**
 * After the hierarchy generator rewrite, some apps in production broke badly because of misconfiguration. To make sure
 * we can still ship the rewrite, we need to apply some quirks/fixes to some layouts. This function applies those quirks
 * and warns about them.
 */
export function applyLayoutQuirks(layouts: ILayouts, layoutSetId: string) {
  const key = `${window.org}/${window.app}/${layoutSetId}`;
  const quirk = quirks[key];
  if (!quirk) {
    return layouts;
  }

  // Start off with a copy of the entire layouts that we'll throw away if anything fails
  const clone = structuredClone(layouts);

  try {
    quirk.verifyAndApply(clone);
    window.logError(
      `Layout quirk(s) applied: \n - ${quirk.logMessages.join('\n - ')}.\n` +
        `Please fix your layout configuration. These workarounds will be removed in the future.`,
    );
  } catch (_err) {
    return layouts;
  }

  // If we got here, the quirks were applied successfully
  return clone;
}

interface QuirkDef {
  verifyAndApply: (layouts: ILayouts) => void;
  logMessages: string[];
}

// Key format: 'org/app/layoutSetId' => QuirkDef
export const quirks: { [key: string]: QuirkDef } = {
  'digdir/tilskudd-dig-delt-komp/form': {
    verifyAndApply: (layouts) => {
      assert(layouts['03Description']![1].id === 'descriptionHeader');
      assert(layouts['pdfReceipt']![7].id === 'descriptionHeader');

      layouts['pdfReceipt']![7].id = 'descriptionHeaderPdfSummary';
    },
    logMessages: [`Renamed duplicate ID 'descriptionHeader' in 'pdfReceipt' layout to 'descriptionHeaderPdfSummary'`],
  },
  'dmf/bergrettigheter-fristilling-un/form': {
    verifyAndApply(layouts) {
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
  'krt/krt-1177a-1/form': {
    verifyAndApply: (layouts) => {
      assert(layouts['Summary']![0].id === 'Paragraph-PZVeXz-summary');
      assert(layouts['pdfLayout']![3].id === 'Paragraph-PZVeXz-summary');
      assert(layouts['Summary']![1].id === '1-header-summary');
      assert(layouts['pdfLayout']![4].id === '1-header-summary');
      assert(layouts['Summary']![2].id === '1-1-id-summary');
      assert(layouts['pdfLayout']![5].id === '1-1-id-summary');
      assert(layouts['Summary']![3].id === '1-2-id-summary');
      assert(layouts['pdfLayout']![6].id === '1-2-id-summary');
      assert(layouts['Summary']![4].id === '1-3-id-summary');
      assert(layouts['pdfLayout']![7].id === '1-3-id-summary');
      assert(layouts['Summary']![5].id === '1-4-id-summary');
      assert(layouts['pdfLayout']![8].id === '1-4-id-summary');
      assert(layouts['Summary']![6].id === '1-5-1-id-summary');
      assert(layouts['pdfLayout']![9].id === '1-5-1-id-summary');
      assert(layouts['Summary']![7].id === '1-5-2-id-summary');
      assert(layouts['pdfLayout']![10].id === '1-5-2-id-summary');
      assert(layouts['Summary']![8].id === '2-header-summary');
      assert(layouts['pdfLayout']![11].id === '2-header-summary');
      assert(layouts['Summary']![9].id === '2-1-id-summary');
      assert(layouts['pdfLayout']![12].id === '2-1-id-summary');
      assert(layouts['Summary']![10].id === '2-2-id-summary');
      assert(layouts['pdfLayout']![13].id === '2-2-id-summary');
      assert(layouts['Summary']![11].id === '2-3-1-id-summary');
      assert(layouts['pdfLayout']![14].id === '2-3-1-id-summary');
      assert(layouts['Summary']![12].id === '2-3-2-id-summary');
      assert(layouts['pdfLayout']![15].id === '2-3-2-id-summary');
      assert(layouts['Summary']![13].id === '2-4-id-summary');
      assert(layouts['pdfLayout']![16].id === '2-4-id-summary');
      assert(layouts['Summary']![14].id === '3-header-summary');
      assert(layouts['pdfLayout']![17].id === '3-header-summary');
      assert(layouts['Summary']![15].id === '3-1-id-summary');
      assert(layouts['pdfLayout']![18].id === '3-1-id-summary');
      assert(layouts['Summary']![16].id === '3-2-id-summary');
      assert(layouts['pdfLayout']![19].id === '3-2-id-summary');
      assert(layouts['Summary']![17].id === '3-3-1-id-summary');
      assert(layouts['pdfLayout']![20].id === '3-3-1-id-summary');
      assert(layouts['Summary']![18].id === '3-3-2-id-summary');
      assert(layouts['pdfLayout']![21].id === '3-3-2-id-summary');
      assert(layouts['Summary']![19].id === '3-4-id-summary');
      assert(layouts['pdfLayout']![22].id === '3-4-id-summary');
      assert(layouts['Summary']![20].id === '4-header-summary');
      assert(layouts['pdfLayout']![23].id === '4-header-summary');
      assert(layouts['Summary']![21].id === '4-1-id-summary');
      assert(layouts['pdfLayout']![24].id === '4-1-id-summary');
      assert(layouts['Summary']![22].id === '4-2-id-summary');
      assert(layouts['pdfLayout']![25].id === '4-2-id-summary');
      assert(layouts['Summary']![23].id === '4-3-id-summary');
      assert(layouts['pdfLayout']![26].id === '4-3-id-summary');
      assert(layouts['Summary']![24].id === '4-4-id-summary');
      assert(layouts['pdfLayout']![27].id === '4-4-id-summary');
      assert(layouts['Summary']![25].id === '5-header-summary');
      assert(layouts['pdfLayout']![28].id === '5-header-summary');
      assert(layouts['Summary']![26].id === '5-1-id-summary');
      assert(layouts['pdfLayout']![29].id === '5-1-id-summary');
      assert(layouts['Summary']![27].id === '5-2-id-summary');
      assert(layouts['pdfLayout']![30].id === '5-2-id-summary');
      assert(layouts['Summary']![28].id === '5-3-id-summary');
      assert(layouts['pdfLayout']![31].id === '5-3-id-summary');
      assert(layouts['Summary']![29].id === '5-4-group-summary');
      assert(layouts['pdfLayout']![32].id === '5-4-group-summary');
      assert(layouts['Summary']![30].id === '5-5-group-summary');
      assert(layouts['pdfLayout']![33].id === '5-5-group-summary');
      assert(layouts['Summary']![31].id === '5-group-paragraph-summary');
      assert(layouts['pdfLayout']![34].id === '5-group-paragraph-summary');
      assert(layouts['Summary']![32].id === '6-header-summary');
      assert(layouts['pdfLayout']![35].id === '6-header-summary');
      assert(layouts['Summary']![33].id === '6-1-id-summary');
      assert(layouts['pdfLayout']![36].id === '6-1-id-summary');
      assert(layouts['Summary']![34].id === '6-2-id-summary');
      assert(layouts['pdfLayout']![37].id === '6-2-id-summary');
      assert(layouts['Summary']![35].id === '6-3-id-summary');
      assert(layouts['pdfLayout']![38].id === '6-3-id-summary');
      assert(layouts['Summary']![36].id === '6-4-id-summary');
      assert(layouts['pdfLayout']![39].id === '6-4-id-summary');
      assert(layouts['Summary']![37].id === '6-5-id-summary');
      assert(layouts['pdfLayout']![40].id === '6-5-id-summary');
      assert(layouts['Summary']![38].id === '7-header-summary');
      assert(layouts['pdfLayout']![41].id === '7-header-summary');
      assert(layouts['Summary']![39].id === '7-1-id-summary');
      assert(layouts['pdfLayout']![42].id === '7-1-id-summary');
      assert(layouts['Summary']![40].id === '7-2-id-summary');
      assert(layouts['pdfLayout']![43].id === '7-2-id-summary');
      assert(layouts['Summary']![41].id === '7-3-id-summary');
      assert(layouts['pdfLayout']![44].id === '7-3-id-summary');
      assert(layouts['Summary']![42].id === '7-4-id-summary');
      assert(layouts['pdfLayout']![45].id === '7-4-id-summary');

      layouts['pdfLayout']![3].id = 'Paragraph-PZVeXz-summaryDuplicate';
      layouts['pdfLayout']![4].id = '1-header-summaryDuplicate';
      layouts['pdfLayout']![5].id = '1-1-id-summaryDuplicate';
      layouts['pdfLayout']![6].id = '1-2-id-summaryDuplicate';
      layouts['pdfLayout']![7].id = '1-3-id-summaryDuplicate';
      layouts['pdfLayout']![8].id = '1-4-id-summaryDuplicate';
      layouts['pdfLayout']![9].id = '1-5-1-id-summaryDuplicate';
      layouts['pdfLayout']![10].id = '1-5-2-id-summaryDuplicate';
      layouts['pdfLayout']![11].id = '2-header-summaryDuplicate';
      layouts['pdfLayout']![12].id = '2-1-id-summaryDuplicate';
      layouts['pdfLayout']![13].id = '2-2-id-summaryDuplicate';
      layouts['pdfLayout']![14].id = '2-3-1-id-summaryDuplicate';
      layouts['pdfLayout']![15].id = '2-3-2-id-summaryDuplicate';
      layouts['pdfLayout']![16].id = '2-4-id-summaryDuplicate';
      layouts['pdfLayout']![17].id = '3-header-summaryDuplicate';
      layouts['pdfLayout']![18].id = '3-1-id-summaryDuplicate';
      layouts['pdfLayout']![19].id = '3-2-id-summaryDuplicate';
      layouts['pdfLayout']![20].id = '3-3-1-id-summaryDuplicate';
      layouts['pdfLayout']![21].id = '3-3-2-id-summaryDuplicate';
      layouts['pdfLayout']![22].id = '3-4-id-summaryDuplicate';
      layouts['pdfLayout']![23].id = '4-header-summaryDuplicate';
      layouts['pdfLayout']![24].id = '4-1-id-summaryDuplicate';
      layouts['pdfLayout']![25].id = '4-2-id-summaryDuplicate';
      layouts['pdfLayout']![26].id = '4-3-id-summaryDuplicate';
      layouts['pdfLayout']![27].id = '4-4-id-summaryDuplicate';
      layouts['pdfLayout']![28].id = '5-header-summaryDuplicate';
      layouts['pdfLayout']![29].id = '5-1-id-summaryDuplicate';
      layouts['pdfLayout']![30].id = '5-2-id-summaryDuplicate';
      layouts['pdfLayout']![31].id = '5-3-id-summaryDuplicate';
      layouts['pdfLayout']![32].id = '5-4-group-summaryDuplicate';
      layouts['pdfLayout']![33].id = '5-5-group-summaryDuplicate';
      layouts['pdfLayout']![34].id = '5-group-paragraph-summaryDuplicate';
      layouts['pdfLayout']![35].id = '6-header-summaryDuplicate';
      layouts['pdfLayout']![36].id = '6-1-id-summaryDuplicate';
      layouts['pdfLayout']![37].id = '6-2-id-summaryDuplicate';
      layouts['pdfLayout']![38].id = '6-3-id-summaryDuplicate';
      layouts['pdfLayout']![39].id = '6-4-id-summaryDuplicate';
      layouts['pdfLayout']![40].id = '6-5-id-summaryDuplicate';
      layouts['pdfLayout']![41].id = '7-header-summaryDuplicate';
      layouts['pdfLayout']![42].id = '7-1-id-summaryDuplicate';
      layouts['pdfLayout']![43].id = '7-2-id-summaryDuplicate';
      layouts['pdfLayout']![44].id = '7-3-id-summaryDuplicate';
      layouts['pdfLayout']![45].id = '7-4-id-summaryDuplicate';
    },
    logMessages: [
      `Renamed component id 'Paragraph-PZVeXz-summary' to 'Paragraph-PZVeXz-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-header-summary' to '1-header-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-1-id-summary' to '1-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-2-id-summary' to '1-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-3-id-summary' to '1-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-4-id-summary' to '1-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-5-1-id-summary' to '1-5-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-5-2-id-summary' to '1-5-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-header-summary' to '2-header-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-1-id-summary' to '2-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-2-id-summary' to '2-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-3-1-id-summary' to '2-3-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-3-2-id-summary' to '2-3-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-4-id-summary' to '2-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-header-summary' to '3-header-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-1-id-summary' to '3-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-2-id-summary' to '3-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-3-1-id-summary' to '3-3-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-3-2-id-summary' to '3-3-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-4-id-summary' to '3-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-header-summary' to '4-header-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-1-id-summary' to '4-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-2-id-summary' to '4-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-3-id-summary' to '4-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-4-id-summary' to '4-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-header-summary' to '5-header-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-1-id-summary' to '5-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-2-id-summary' to '5-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-3-id-summary' to '5-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-4-group-summary' to '5-4-group-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-5-group-summary' to '5-5-group-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-group-paragraph-summary' to '5-group-paragraph-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-header-summary' to '6-header-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-id-summary' to '6-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-2-id-summary' to '6-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-3-id-summary' to '6-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-4-id-summary' to '6-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-5-id-summary' to '6-5-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '7-header-summary' to '7-header-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '7-1-id-summary' to '7-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '7-2-id-summary' to '7-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '7-3-id-summary' to '7-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '7-4-id-summary' to '7-4-id-summaryDuplicate' on page 'pdfLayout'`,
    ],
  },
  'lt/flight-hours/form-a': {
    verifyAndApply: (layouts) => {
      assert(layouts['Amount']![0].id === 'Header-RkBLKV');
      assert(layouts['Operator']![0].id === 'Header-RkBLKV');

      layouts['Operator']![0].id = 'Header-RkBLKVDuplicate';
    },
    logMessages: [`Renamed component id 'Header-RkBLKV' to 'Header-RkBLKVDuplicate' on page 'Operator'`],
  },
  'lt/operating-permit/form-a': {
    verifyAndApply: (layouts) => {
      assert(layouts['01.Privacy']![0].id === 'Panel-vQOOQx');
      assert(layouts['08.Confirmation']![0].id === 'Panel-vQOOQx');

      layouts['08.Confirmation']![0].id = 'Panel-vQOOQxDuplicate';
    },
    logMessages: [`Renamed component id 'Panel-vQOOQx' to 'Panel-vQOOQxDuplicate' on page '08.Confirmation'`],
  },
  'sfvt/dgm-ansvarlig/form-ansvarlig': {
    verifyAndApply: (layouts) => {
      assert(layouts['agency-contact']![3].id === 'NavigationButtons-NWIXih');
      assert(layouts['agency-picker']![4].id === 'NavigationButtons-NWIXih');
      assert(layouts['already-responsible']![5].id === 'already-responsible-info');
      assert(layouts['already-responsible']![6].id === 'already-responsible-info');
      assert(layouts['pdf']![3].id === 'summary-deceased-Group');
      assert(layouts['summary']![2].id === 'summary-deceased-Group');
      assert(layouts['pdf']![4].id === 'summary-Paragraph-deceased');
      assert(layouts['summary']![3].id === 'summary-Paragraph-deceased');
      assert(layouts['pdf']![5].id === 'summary-responsible-Group');
      assert(layouts['summary']![5].id === 'summary-responsible-Group');
      assert(layouts['pdf']![6].id === 'summary-responsible-responsibility');
      assert(layouts['summary']![6].id === 'summary-responsible-responsibility');
      assert(layouts['pdf']![7].id === 'summary-responsible-notified-others');
      assert(layouts['summary']![7].id === 'summary-responsible-notified-others');
      assert(layouts['pdf']![8].id === 'summary-deceased-municipality-unknown');
      assert(layouts['summary']![8].id === 'summary-deceased-municipality-unknown');
      assert(layouts['pdf']![9].id === 'summary-deceased-municipality');
      assert(layouts['summary']![9].id === 'summary-deceased-municipality');
      assert(layouts['pdf']![10].id === 'summary-funeralhome-group');
      assert(layouts['summary']![10].id === 'summary-funeralhome-group');
      assert(layouts['pdf']![11].id === 'summary-burial-should-use-agency');
      assert(layouts['summary']![11].id === 'summary-burial-should-use-agency');
      assert(layouts['pdf']![12].id === 'summary-burial-agency');
      assert(layouts['summary']![12].id === 'summary-burial-agency');
      assert(layouts['pdf']![13].id === 'summary-burial-agency-contact');
      assert(layouts['summary']![13].id === 'summary-burial-agency-contact');
      assert(layouts['pdf']![14].id === 'summary-burial-Group');
      assert(layouts['summary']![14].id === 'summary-burial-Group');
      assert(layouts['pdf']![15].id === 'summary-burial-type');
      assert(layouts['summary']![15].id === 'summary-burial-type');
      assert(layouts['pdf']![16].id === 'summary-burial-domestic-foreign');
      assert(layouts['summary']![16].id === 'summary-burial-domestic-foreign');
      assert(layouts['pdf']![17].id === 'summary-burial-should-handle-ashes');
      assert(layouts['summary']![17].id === 'summary-burial-should-handle-ashes');
      assert(layouts['pdf']![18].id === 'summary-burial-cremation-municipality');
      assert(layouts['summary']![18].id === 'summary-burial-cremation-municipality');
      assert(layouts['pdf']![19].id === 'summary-burial-municipality');
      assert(layouts['summary']![19].id === 'summary-burial-municipality');
      assert(layouts['pdf']![20].id === 'summary-ashes-permit');
      assert(layouts['summary']![20].id === 'summary-ashes-permit');
      assert(layouts['pdf']![21].id === 'summary-ashes-permit-file');
      assert(layouts['summary']![21].id === 'summary-ashes-permit-file');
      assert(layouts['pdf']![22].id === 'summary-Header-mottakere');
      assert(layouts['summary']![23].id === 'summary-Header-mottakere');
      assert(layouts['pdf']![23].id === 'summary-deceased-municipality-hidden');
      assert(layouts['summary']![24].id === 'summary-deceased-municipality-hidden');
      assert(layouts['pdf']![24].id === 'summary-Paragraph-mottakere');
      assert(layouts['summary']![25].id === 'summary-Paragraph-mottakere');

      layouts['agency-picker']![4].id = 'NavigationButtons-NWIXihDuplicate';
      layouts['already-responsible']![6].id = 'already-responsible-infoDuplicate';
      layouts['summary']![2].id = 'summary-deceased-GroupDuplicate';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layouts['summary']![2] as any).children = (layouts['summary']![2] as any).children.map((c: string) =>
        c === 'summary-deceased-multiple' ? c : `${c}Duplicate`,
      );
      layouts['summary']![3].id = 'summary-Paragraph-deceasedDuplicate';
      layouts['summary']![5].id = 'summary-responsible-GroupDuplicate';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layouts['summary']![5] as any).children = (layouts['summary']![5] as any).children.map(
        (c: string) => `${c}Duplicate`,
      );
      layouts['summary']![6].id = 'summary-responsible-responsibilityDuplicate';
      layouts['summary']![7].id = 'summary-responsible-notified-othersDuplicate';
      layouts['summary']![8].id = 'summary-deceased-municipality-unknownDuplicate';
      layouts['summary']![9].id = 'summary-deceased-municipalityDuplicate';
      layouts['summary']![10].id = 'summary-funeralhome-groupDuplicate';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layouts['summary']![10] as any).children = (layouts['summary']![10] as any).children.map(
        (c: string) => `${c}Duplicate`,
      );
      layouts['summary']![11].id = 'summary-burial-should-use-agencyDuplicate';
      layouts['summary']![12].id = 'summary-burial-agencyDuplicate';
      layouts['summary']![13].id = 'summary-burial-agency-contactDuplicate';
      layouts['summary']![14].id = 'summary-burial-GroupDuplicate';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (layouts['summary']![14] as any).children = (layouts['summary']![14] as any).children.map(
        (c: string) => `${c}Duplicate`,
      );
      layouts['summary']![15].id = 'summary-burial-typeDuplicate';
      layouts['summary']![16].id = 'summary-burial-domestic-foreignDuplicate';
      layouts['summary']![17].id = 'summary-burial-should-handle-ashesDuplicate';
      layouts['summary']![18].id = 'summary-burial-cremation-municipalityDuplicate';
      layouts['summary']![19].id = 'summary-burial-municipalityDuplicate';
      layouts['summary']![20].id = 'summary-ashes-permitDuplicate';
      layouts['summary']![21].id = 'summary-ashes-permit-fileDuplicate';
      layouts['summary']![23].id = 'summary-Header-mottakereDuplicate';
      layouts['summary']![24].id = 'summary-deceased-municipality-hiddenDuplicate';
      layouts['summary']![25].id = 'summary-Paragraph-mottakereDuplicate';
    },
    logMessages: [
      `Renamed component id 'NavigationButtons-NWIXih' to 'NavigationButtons-NWIXihDuplicate' on page 'agency-picker'`,
      `Renamed component id 'already-responsible-info' to 'already-responsible-infoDuplicate' on page 'already-responsible'`,
      `Renamed component id 'summary-deceased-Group' to 'summary-deceased-GroupDuplicate' on page 'summary'`,
      `Renamed component id 'summary-Paragraph-deceased' to 'summary-Paragraph-deceasedDuplicate' on page 'summary'`,
      `Renamed component id 'summary-responsible-Group' to 'summary-responsible-GroupDuplicate' on page 'summary'`,
      `Renamed component id 'summary-responsible-responsibility' to 'summary-responsible-responsibilityDuplicate' on page 'summary'`,
      `Renamed component id 'summary-responsible-notified-others' to 'summary-responsible-notified-othersDuplicate' on page 'summary'`,
      `Renamed component id 'summary-deceased-municipality-unknown' to 'summary-deceased-municipality-unknownDuplicate' on page 'summary'`,
      `Renamed component id 'summary-deceased-municipality' to 'summary-deceased-municipalityDuplicate' on page 'summary'`,
      `Renamed component id 'summary-funeralhome-group' to 'summary-funeralhome-groupDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-should-use-agency' to 'summary-burial-should-use-agencyDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-agency' to 'summary-burial-agencyDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-agency-contact' to 'summary-burial-agency-contactDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-Group' to 'summary-burial-GroupDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-type' to 'summary-burial-typeDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-domestic-foreign' to 'summary-burial-domestic-foreignDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-should-handle-ashes' to 'summary-burial-should-handle-ashesDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-cremation-municipality' to 'summary-burial-cremation-municipalityDuplicate' on page 'summary'`,
      `Renamed component id 'summary-burial-municipality' to 'summary-burial-municipalityDuplicate' on page 'summary'`,
      `Renamed component id 'summary-ashes-permit' to 'summary-ashes-permitDuplicate' on page 'summary'`,
      `Renamed component id 'summary-ashes-permit-file' to 'summary-ashes-permit-fileDuplicate' on page 'summary'`,
      `Renamed component id 'summary-Header-mottakere' to 'summary-Header-mottakereDuplicate' on page 'summary'`,
      `Renamed component id 'summary-deceased-municipality-hidden' to 'summary-deceased-municipality-hiddenDuplicate' on page 'summary'`,
      `Renamed component id 'summary-Paragraph-mottakere' to 'summary-Paragraph-mottakereDuplicate' on page 'summary'`,
    ],
  },
  'krt/krt-3010a-1/form': {
    verifyAndApply: (layouts) => {
      assert(layouts['Summary']![0].id === 'intro-id-summary');
      assert(layouts['pdfLayout']![0].id === 'intro-id-summary');
      assert(layouts['Summary']![1].id === '1--id-summary');
      assert(layouts['pdfLayout']![1].id === '1--id-summary');
      assert(layouts['Summary']![2].id === '1-1-id-summary');
      assert(layouts['pdfLayout']![2].id === '1-1-id-summary');
      assert(layouts['Summary']![3].id === '1-2-id-summary');
      assert(layouts['pdfLayout']![3].id === '1-2-id-summary');
      assert(layouts['Summary']![4].id === '1-3-id-summary');
      assert(layouts['pdfLayout']![4].id === '1-3-id-summary');
      assert(layouts['Summary']![5].id === '1-4-id-summary');
      assert(layouts['pdfLayout']![5].id === '1-4-id-summary');
      assert(layouts['Summary']![6].id === '1-5-id-summary');
      assert(layouts['pdfLayout']![6].id === '1-5-id-summary');
      assert(layouts['Summary']![7].id === '1-6-id-summary');
      assert(layouts['pdfLayout']![7].id === '1-6-id-summary');
      assert(layouts['Summary']![8].id === '2--id-summary');
      assert(layouts['pdfLayout']![9].id === '2--id-summary');
      assert(layouts['Summary']![9].id === '2-1-id-summary');
      assert(layouts['pdfLayout']![10].id === '2-1-id-summary');
      assert(layouts['Summary']![10].id === '2-2-id-summary');
      assert(layouts['pdfLayout']![11].id === '2-2-id-summary');
      assert(layouts['Summary']![11].id === '2-3-prefix-id-summary');
      assert(layouts['pdfLayout']![12].id === '2-3-prefix-id-summary');
      assert(layouts['Summary']![12].id === '2-3-id-summary');
      assert(layouts['pdfLayout']![13].id === '2-3-id-summary');
      assert(layouts['Summary']![13].id === '2-4-id-summary');
      assert(layouts['pdfLayout']![14].id === '2-4-id-summary');
      assert(layouts['Summary']![14].id === '2-5-id-summary');
      assert(layouts['pdfLayout']![15].id === '2-5-id-summary');
      assert(layouts['Summary']![15].id === '2-6-prefix-id-summary');
      assert(layouts['pdfLayout']![16].id === '2-6-prefix-id-summary');
      assert(layouts['Summary']![16].id === '2-6-id-summary');
      assert(layouts['pdfLayout']![17].id === '2-6-id-summary');
      assert(layouts['Summary']![18].id === 'repgruppe-agentforetak-summary');
      assert(layouts['pdfLayout']![18].id === 'repgruppe-agentforetak-summary');

      layouts['pdfLayout']![0].id = 'intro-id-summaryDuplicate';
      layouts['pdfLayout']![1].id = '1--id-summaryDuplicate';
      layouts['pdfLayout']![2].id = '1-1-id-summaryDuplicate';
      layouts['pdfLayout']![3].id = '1-2-id-summaryDuplicate';
      layouts['pdfLayout']![4].id = '1-3-id-summaryDuplicate';
      layouts['pdfLayout']![5].id = '1-4-id-summaryDuplicate';
      layouts['pdfLayout']![6].id = '1-5-id-summaryDuplicate';
      layouts['pdfLayout']![7].id = '1-6-id-summaryDuplicate';
      layouts['pdfLayout']![9].id = '2--id-summaryDuplicate';
      layouts['pdfLayout']![10].id = '2-1-id-summaryDuplicate';
      layouts['pdfLayout']![11].id = '2-2-id-summaryDuplicate';
      layouts['pdfLayout']![12].id = '2-3-prefix-id-summaryDuplicate';
      layouts['pdfLayout']![13].id = '2-3-id-summaryDuplicate';
      layouts['pdfLayout']![14].id = '2-4-id-summaryDuplicate';
      layouts['pdfLayout']![15].id = '2-5-id-summaryDuplicate';
      layouts['pdfLayout']![16].id = '2-6-prefix-id-summaryDuplicate';
      layouts['pdfLayout']![17].id = '2-6-id-summaryDuplicate';
      layouts['pdfLayout']![18].id = 'repgruppe-agentforetak-summaryDuplicate';

      removeChildThatDoesNotExist(layouts, '5--id', 'repgruppe-agentforetak', 'RepeatingGroup');
      removeChildThatDoesNotExist(layouts, '5-1-id', 'repgruppe-agentforetak', 'RepeatingGroup');
      removeChildThatDoesNotExist(layouts, '5-2-id', 'repgruppe-agentforetak', 'RepeatingGroup');
      removeChildThatDoesNotExist(layouts, '5-3-id', 'repgruppe-agentforetak', 'RepeatingGroup');
      removeChildThatDoesNotExist(layouts, '5-3-prefix-id', 'repgruppe-agentforetak', 'RepeatingGroup');
      removeChildThatDoesNotExist(layouts, '5-4-id', 'repgruppe-agentforetak', 'RepeatingGroup');
      removeChildThatDoesNotExist(layouts, '5-5-id', 'repgruppe-agentforetak', 'RepeatingGroup');
      removeChildThatDoesNotExist(layouts, '5-6-prefix-id', 'repgruppe-agentforetak', 'RepeatingGroup');
      removeChildThatDoesNotExist(layouts, '5-6-id', 'repgruppe-agentforetak', 'RepeatingGroup');
    },
    logMessages: [
      `Renamed component id 'intro-id-summary' to 'intro-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1--id-summary' to '1--id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-1-id-summary' to '1-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-2-id-summary' to '1-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-3-id-summary' to '1-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-4-id-summary' to '1-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-5-id-summary' to '1-5-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-6-id-summary' to '1-6-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2--id-summary' to '2--id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-1-id-summary' to '2-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-2-id-summary' to '2-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-3-prefix-id-summary' to '2-3-prefix-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-3-id-summary' to '2-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-4-id-summary' to '2-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-5-id-summary' to '2-5-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-6-prefix-id-summary' to '2-6-prefix-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-6-id-summary' to '2-6-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'repgruppe-agentforetak-summary' to 'repgruppe-agentforetak-summaryDuplicate' on page 'pdfLayout'`,
      `Removed child '5--id' from component 'repgruppe-agentforetak' which does not exist`,
      `Removed child '5-1-id' from component 'repgruppe-agentforetak' which does not exist`,
      `Removed child '5-2-id' from component 'repgruppe-agentforetak' which does not exist`,
      `Removed child '5-3-id' from component 'repgruppe-agentforetak' which does not exist`,
      `Removed child '5-3-prefix-id' from component 'repgruppe-agentforetak' which does not exist`,
      `Removed child '5-4-id' from component 'repgruppe-agentforetak' which does not exist`,
      `Removed child '5-5-id' from component 'repgruppe-agentforetak' which does not exist`,
      `Removed child '5-6-prefix-id' from component 'repgruppe-agentforetak' which does not exist`,
      `Removed child '5-6-id' from component 'repgruppe-agentforetak' which does not exist`,
    ],
  },
};

function assert(condition: boolean): asserts condition is true {
  if (!condition) {
    throw new Error('Quirk verification failed');
  }
}

function assertCompType<T extends CompTypes>(comp: CompExternal, type: T): asserts comp is CompExternal<T> {
  assert(comp.type === type);
}

function assertSequenceOfIds(layouts: ILayouts, page: string, ids: string[], startIndex = 0): void {
  for (const [idx, id] of ids.entries()) {
    assert(layouts[page]![startIndex + idx].id === id);
  }
}

function removeChildThatDoesNotExist(
  layouts: ILayouts,
  referenced: string,
  referencedBy: string,
  compType: 'Group' | 'RepeatingGroup',
) {
  for (const page of Object.values(layouts)) {
    for (const comp of page || []) {
      if (comp.id === referencedBy) {
        assertCompType(comp, compType);
        assert(Array.isArray(comp.children) && comp.children.includes(referenced));
        comp.children = comp.children.filter((c) => c !== referenced);
      }
      if (comp.id === referenced) {
        throw new Error('We found the target component after all');
      }
    }
  }
}
