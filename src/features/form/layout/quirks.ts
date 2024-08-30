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
  'dsb/melding-om-sikkerhetsraadgiver/form': {
    verifyAndApply(layouts) {
      assert(layouts['99Summary']!.at(4)!.id === 'safetyAdvisersSummary');
      assert(layouts['pdfReceipt']!.at(3)!.id === 'safetyAdvisersSummary');

      assert(layouts['99Summary']!.at(5)!.id === 'termsSummary');
      assert(layouts['pdfReceipt']!.at(4)!.id === 'termsSummary');

      layouts['99Summary']!.at(4)!.id += 'SummaryPage';
      layouts['99Summary']!.at(5)!.id += 'SummaryPage';
    },
    logMessages: [
      `Renamed duplicate ID 'safetyAdvisersSummary' in '99Summary' layout to 'safetyAdvisersSummarySummaryPage'`,
      `Renamed duplicate ID 'termsSummary' in '99Summary' layout to 'termsSummarySummaryPage'`,
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
  'krt/krt-3011a-1/form': {
    verifyAndApply: (layouts) => {
      assert(layouts['Summary']![0].id === 'introparagraf-1-id-summary');
      assert(layouts['pdfLayout']![1].id === 'introparagraf-1-id-summary');
      assert(layouts['Summary']![1].id === 'introparagraf-4-id-summary');
      assert(layouts['pdfLayout']![2].id === 'introparagraf-4-id-summary');
      assert(layouts['Summary']![2].id === '1--id-summary');
      assert(layouts['pdfLayout']![3].id === '1--id-summary');
      assert(layouts['Summary']![3].id === '1-1-id-summary');
      assert(layouts['pdfLayout']![4].id === '1-1-id-summary');
      assert(layouts['Summary']![4].id === '1-2-id-summary');
      assert(layouts['pdfLayout']![5].id === '1-2-id-summary');
      assert(layouts['Summary']![5].id === '1-3-id-summary');
      assert(layouts['pdfLayout']![6].id === '1-3-id-summary');
      assert(layouts['Summary']![6].id === '1-4-id-summary');
      assert(layouts['pdfLayout']![7].id === '1-4-id-summary');
      assert(layouts['Summary']![7].id === '1-5-id-summary');
      assert(layouts['pdfLayout']![8].id === '1-5-id-summary');
      assert(layouts['Summary']![8].id === '1-6-id-summary');
      assert(layouts['pdfLayout']![9].id === '1-6-id-summary');
      assert(layouts['Summary']![9].id === '1-7-id-summary');
      assert(layouts['pdfLayout']![10].id === '1-7-id-summary');
      assert(layouts['Summary']![10].id === '1-1-egendefinert-id-summary');
      assert(layouts['pdfLayout']![11].id === '1-1-egendefinert-id-summary');
      assert(layouts['Summary']![11].id === '1-8-id-summary');
      assert(layouts['pdfLayout']![12].id === '1-8-id-summary');
      assert(layouts['Summary']![12].id === '1-8-0-id-summary');
      assert(layouts['pdfLayout']![13].id === '1-8-0-id-summary');
      assert(layouts['Summary']![13].id === '1-orgnr-janei-id-summary');
      assert(layouts['pdfLayout']![14].id === '1-orgnr-janei-id-summary');
      assert(layouts['Summary']![14].id === '1-9-id-summary');
      assert(layouts['pdfLayout']![15].id === '1-9-id-summary');
      assert(layouts['Summary']![15].id === '1-10-id-summary');
      assert(layouts['pdfLayout']![16].id === '1-10-id-summary');
      assert(layouts['Summary']![16].id === '1-11-id-summary');
      assert(layouts['pdfLayout']![17].id === '1-11-id-summary');
      assert(layouts['Summary']![17].id === '1-12-id-summary');
      assert(layouts['pdfLayout']![18].id === '1-12-id-summary');
      assert(layouts['Summary']![18].id === '1-13-id-summary');
      assert(layouts['pdfLayout']![19].id === '1-13-id-summary');
      assert(layouts['Summary']![19].id === '1-14-id-summary');
      assert(layouts['pdfLayout']![20].id === '1-14-id-summary');
      assert(layouts['Summary']![20].id === '2-id-summary');
      assert(layouts['pdfLayout']![21].id === '2-id-summary');
      assert(layouts['Summary']![21].id === '2-1-id-summary');
      assert(layouts['pdfLayout']![22].id === '2-1-id-summary');
      assert(layouts['Summary']![22].id === '2-1-1-id-summary');
      assert(layouts['pdfLayout']![23].id === '2-1-1-id-summary');
      assert(layouts['Summary']![23].id === '2-1-2-id-summary');
      assert(layouts['pdfLayout']![24].id === '2-1-2-id-summary');
      assert(layouts['Summary']![24].id === '2-4-2-id-summary');
      assert(layouts['pdfLayout']![25].id === '2-4-2-id-summary');
      assert(layouts['Summary']![25].id === '2-4-3-id-summary');
      assert(layouts['pdfLayout']![26].id === '2-4-3-id-summary');
      assert(layouts['Summary']![26].id === '3--id-summary');
      assert(layouts['pdfLayout']![27].id === '3--id-summary');
      assert(layouts['Summary']![27].id === 'primaerkontaktperson-id-summary');
      assert(layouts['pdfLayout']![28].id === 'primaerkontaktperson-id-summary');
      assert(layouts['Summary']![28].id === '3-1-id-summary');
      assert(layouts['pdfLayout']![29].id === '3-1-id-summary');
      assert(layouts['Summary']![29].id === '3-2-id-summary');
      assert(layouts['pdfLayout']![30].id === '3-2-id-summary');
      assert(layouts['Summary']![30].id === 'primaerperson-landskode-prefix-id-summary');
      assert(layouts['pdfLayout']![31].id === 'primaerperson-landskode-prefix-id-summary');
      assert(layouts['Summary']![31].id === '3-3-id-summary');
      assert(layouts['pdfLayout']![32].id === '3-3-id-summary');
      assert(layouts['Summary']![32].id === 'sekundaerkontaktperson-id-summary');
      assert(layouts['pdfLayout']![33].id === 'sekundaerkontaktperson-id-summary');
      assert(layouts['Summary']![33].id === '3-4-id-summary');
      assert(layouts['pdfLayout']![34].id === '3-4-id-summary');
      assert(layouts['Summary']![34].id === '3-5-id-summary');
      assert(layouts['pdfLayout']![35].id === '3-5-id-summary');
      assert(layouts['Summary']![35].id === 'sekundaer-landskode-prefix-id-summary');
      assert(layouts['pdfLayout']![36].id === 'sekundaer-landskode-prefix-id-summary');
      assert(layouts['Summary']![36].id === '3-6-id-summary');
      assert(layouts['pdfLayout']![37].id === '3-6-id-summary');
      assert(layouts['Summary']![37].id === '4--id-summary');
      assert(layouts['pdfLayout']![38].id === '4--id-summary');
      assert(layouts['Summary']![38].id === '4-1-1-id-summary');
      assert(layouts['pdfLayout']![39].id === '4-1-1-id-summary');
      assert(layouts['Summary']![39].id === '4-1-2-id-summary');
      assert(layouts['pdfLayout']![40].id === '4-1-2-id-summary');
      assert(layouts['Summary']![40].id === '4-2-id-summary');
      assert(layouts['pdfLayout']![41].id === '4-2-id-summary');
      assert(layouts['Summary']![41].id === 'myRepeatingGroup-summary');
      assert(layouts['pdfLayout']![42].id === 'myRepeatingGroup-summary');
      assert(layouts['Summary']![42].id === '4-2-1-id-summary');
      assert(layouts['pdfLayout']![43].id === '4-2-1-id-summary');
      assert(layouts['Summary']![43].id === '4-3-id-summary');
      assert(layouts['pdfLayout']![44].id === '4-3-id-summary');
      assert(layouts['Summary']![44].id === '4-3-1-id-summary');
      assert(layouts['pdfLayout']![45].id === '4-3-1-id-summary');
      assert(layouts['Summary']![45].id === '4-3-1-description-summary');
      assert(layouts['pdfLayout']![46].id === '4-3-1-description-summary');
      assert(layouts['Summary']![46].id === 'repgruppe-laaneformidlere-summary');
      assert(layouts['pdfLayout']![47].id === 'repgruppe-laaneformidlere-summary');
      assert(layouts['Summary']![47].id === '5--id-summary');
      assert(layouts['pdfLayout']![48].id === '5--id-summary');
      assert(layouts['Summary']![48].id === 'repgruppe-laaneformidlere2-summary');
      assert(layouts['pdfLayout']![49].id === 'repgruppe-laaneformidlere2-summary');
      assert(layouts['Summary']![49].id === 'generertID-12-id-summary');
      assert(layouts['pdfLayout']![50].id === 'generertID-12-id-summary');
      assert(layouts['Summary']![50].id === '5-4-id-summary');
      assert(layouts['pdfLayout']![51].id === '5-4-id-summary');
      assert(layouts['Summary']![51].id === '5-4-fileUpload-id-summary');
      assert(layouts['pdfLayout']![52].id === '5-4-fileUpload-id-summary');
      assert(layouts['Summary']![52].id === '6-id-summary');
      assert(layouts['pdfLayout']![53].id === '6-id-summary');
      assert(layouts['Summary']![53].id === '6-1-id-summary');
      assert(layouts['pdfLayout']![54].id === '6-1-id-summary');
      assert(layouts['Summary']![54].id === '6-1-1-id-summary');
      assert(layouts['pdfLayout']![55].id === '6-1-1-id-summary');
      assert(layouts['Summary']![55].id === '6-1-2-title-id-summary');
      assert(layouts['pdfLayout']![56].id === '6-1-2-title-id-summary');
      assert(layouts['Summary']![56].id === '6-1-3-id-summary');
      assert(layouts['pdfLayout']![57].id === '6-1-3-id-summary');
      assert(layouts['Summary']![57].id === '6-1-4-id-summary');
      assert(layouts['pdfLayout']![58].id === '6-1-4-id-summary');
      assert(layouts['Summary']![58].id === '6-1-5-id-summary');
      assert(layouts['pdfLayout']![59].id === '6-1-5-id-summary');
      assert(layouts['Summary']![59].id === '6-1-6-id-summary');
      assert(layouts['pdfLayout']![60].id === '6-1-6-id-summary');
      assert(layouts['Summary']![60].id === '6-1-7-id-summary');
      assert(layouts['pdfLayout']![61].id === '6-1-7-id-summary');
      assert(layouts['Summary']![61].id === '6-1-8-id-summary');
      assert(layouts['pdfLayout']![62].id === '6-1-8-id-summary');
      assert(layouts['Summary']![62].id === '6-2-id-summary');
      assert(layouts['pdfLayout']![63].id === '6-2-id-summary');
      assert(layouts['Summary']![63].id === '6-2-1-id-summary');
      assert(layouts['pdfLayout']![64].id === '6-2-1-id-summary');
      assert(layouts['Summary']![64].id === '6-2-2-id-summary');
      assert(layouts['pdfLayout']![65].id === '6-2-2-id-summary');
      assert(layouts['Summary']![65].id === '6-2-3-id-summary');
      assert(layouts['pdfLayout']![66].id === '6-2-3-id-summary');
      assert(layouts['Summary']![66].id === '7-id-summary');
      assert(layouts['pdfLayout']![67].id === '7-id-summary');
      assert(layouts['Summary']![67].id === '7-paragraph-summary');
      assert(layouts['pdfLayout']![68].id === '7-paragraph-summary');
      assert(layouts['Summary']![68].id === 'repgruppe-produkter-summary');
      assert(layouts['pdfLayout']![69].id === 'repgruppe-produkter-summary');
      assert(layouts['Summary']![69].id === '8-id-summary');
      assert(layouts['pdfLayout']![70].id === '8-id-summary');
      assert(layouts['Summary']![70].id === '8-1-id-summary');
      assert(layouts['pdfLayout']![71].id === '8-1-id-summary');
      assert(layouts['Summary']![71].id === '8-1-fileUpload-id-summary');
      assert(layouts['pdfLayout']![72].id === '8-1-fileUpload-id-summary');
      assert(layouts['Summary']![72].id === '8-2-fileUpload-id-summary');
      assert(layouts['pdfLayout']![73].id === '8-2-fileUpload-id-summary');
      assert(layouts['Summary']![73].id === '8-3-fileUpload-id-summary');
      assert(layouts['pdfLayout']![74].id === '8-3-fileUpload-id-summary');
      assert(layouts['Summary']![74].id === '8-4-fileUpload-id-summary');
      assert(layouts['pdfLayout']![75].id === '8-4-fileUpload-id-summary');
      assert(layouts['Summary']![75].id === '8-3-id-summary');
      assert(layouts['pdfLayout']![76].id === '8-3-id-summary');
      assert(layouts['Summary']![76].id === 'repgruppe-foretakskalformidle-summary');
      assert(layouts['pdfLayout']![77].id === 'repgruppe-foretakskalformidle-summary');
      assert(layouts['Summary']![77].id === '8-7-id-summary');
      assert(layouts['pdfLayout']![78].id === '8-7-id-summary');
      assert(layouts['Summary']![78].id === '8-4-id-summary');
      assert(layouts['pdfLayout']![79].id === '8-4-id-summary');
      assert(layouts['Summary']![79].id === '8-5-id-summary');
      assert(layouts['pdfLayout']![80].id === '8-5-id-summary');
      assert(layouts['Summary']![80].id === '8-5-1-1-id-summary');
      assert(layouts['pdfLayout']![81].id === '8-5-1-1-id-summary');
      assert(layouts['Summary']![81].id === '8-5-1-id-summary');
      assert(layouts['pdfLayout']![82].id === '8-5-1-id-summary');
      assert(layouts['Summary']![82].id === '8-5-12-id-summary');
      assert(layouts['pdfLayout']![83].id === '8-5-12-id-summary');
      assert(layouts['Summary']![83].id === '8-5-13-id-summary');
      assert(layouts['pdfLayout']![84].id === '8-5-13-id-summary');
      assert(layouts['Summary']![84].id === '8-5-25-id-summary');
      assert(layouts['pdfLayout']![85].id === '8-5-25-id-summary');
      assert(layouts['Summary']![85].id === '8-6-id-summary');
      assert(layouts['pdfLayout']![86].id === '8-6-id-summary');
      assert(layouts['Summary']![86].id === '8-6-1-id-summary');
      assert(layouts['pdfLayout']![87].id === '8-6-1-id-summary');
      assert(layouts['Summary']![87].id === '8-6-2-id-summary');
      assert(layouts['pdfLayout']![88].id === '8-6-2-id-summary');
      assert(layouts['Summary']![88].id === '8-6-3-id-summary');
      assert(layouts['pdfLayout']![89].id === '8-6-3-id-summary');
      assert(layouts['Summary']![89].id === 'generertID-15-id-summary');
      assert(layouts['pdfLayout']![90].id === 'generertID-15-id-summary');
      assert(layouts['Summary']![90].id === '8-6-4-id-summary');
      assert(layouts['pdfLayout']![91].id === '8-6-4-id-summary');
      assert(layouts['Summary']![91].id === '8-6-5-id-summary');
      assert(layouts['pdfLayout']![92].id === '8-6-5-id-summary');
      assert(layouts['Summary']![92].id === '8-6-6-id-summary');
      assert(layouts['pdfLayout']![93].id === '8-6-6-id-summary');
      assert(layouts['Summary']![93].id === '8-6-7-id-summary');
      assert(layouts['pdfLayout']![94].id === '8-6-7-id-summary');
      assert(layouts['Summary']![94].id === '8-7-0-id-summary');
      assert(layouts['pdfLayout']![95].id === '8-7-0-id-summary');
      assert(layouts['Summary']![95].id === '8-6-description-id-summary');
      assert(layouts['pdfLayout']![96].id === '8-6-description-id-summary');
      assert(layouts['Summary']![96].id === '8-7-1-id-summary');
      assert(layouts['pdfLayout']![97].id === '8-7-1-id-summary');
      assert(layouts['Summary']![97].id === '8-7-2-id-summary');
      assert(layouts['pdfLayout']![98].id === '8-7-2-id-summary');
      assert(layouts['Summary']![98].id === '8-7-3-id-summary');
      assert(layouts['pdfLayout']![99].id === '8-7-3-id-summary');
      assert(layouts['Summary']![99].id === '8-7-4-id-summary');
      assert(layouts['pdfLayout']![100].id === '8-7-4-id-summary');
      assert(layouts['Summary']![100].id === '9-id-summary');
      assert(layouts['pdfLayout']![101].id === '9-id-summary');
      assert(layouts['Summary']![101].id === 'repgruppe-kommentarer-summary');
      assert(layouts['pdfLayout']![102].id === 'repgruppe-kommentarer-summary');
      assert(layouts['Summary']![102].id === 'NavigationBar-summary');
      assert(layouts['pdfLayout']![103].id === 'NavigationBar-summary');
      assert(layouts['Summary']![103].id === 'submit');
      assert(layouts['pdfLayout']![104].id === 'submit');

      layouts['pdfLayout']![1].id = 'introparagraf-1-id-summaryDuplicate';
      layouts['pdfLayout']![2].id = 'introparagraf-4-id-summaryDuplicate';
      layouts['pdfLayout']![3].id = '1--id-summaryDuplicate';
      layouts['pdfLayout']![4].id = '1-1-id-summaryDuplicate';
      layouts['pdfLayout']![5].id = '1-2-id-summaryDuplicate';
      layouts['pdfLayout']![6].id = '1-3-id-summaryDuplicate';
      layouts['pdfLayout']![7].id = '1-4-id-summaryDuplicate';
      layouts['pdfLayout']![8].id = '1-5-id-summaryDuplicate';
      layouts['pdfLayout']![9].id = '1-6-id-summaryDuplicate';
      layouts['pdfLayout']![10].id = '1-7-id-summaryDuplicate';
      layouts['pdfLayout']![11].id = '1-1-egendefinert-id-summaryDuplicate';
      layouts['pdfLayout']![12].id = '1-8-id-summaryDuplicate';
      layouts['pdfLayout']![13].id = '1-8-0-id-summaryDuplicate';
      layouts['pdfLayout']![14].id = '1-orgnr-janei-id-summaryDuplicate';
      layouts['pdfLayout']![15].id = '1-9-id-summaryDuplicate';
      layouts['pdfLayout']![16].id = '1-10-id-summaryDuplicate';
      layouts['pdfLayout']![17].id = '1-11-id-summaryDuplicate';
      layouts['pdfLayout']![18].id = '1-12-id-summaryDuplicate';
      layouts['pdfLayout']![19].id = '1-13-id-summaryDuplicate';
      layouts['pdfLayout']![20].id = '1-14-id-summaryDuplicate';
      layouts['pdfLayout']![21].id = '2-id-summaryDuplicate';
      layouts['pdfLayout']![22].id = '2-1-id-summaryDuplicate';
      layouts['pdfLayout']![23].id = '2-1-1-id-summaryDuplicate';
      layouts['pdfLayout']![24].id = '2-1-2-id-summaryDuplicate';
      layouts['pdfLayout']![25].id = '2-4-2-id-summaryDuplicate';
      layouts['pdfLayout']![26].id = '2-4-3-id-summaryDuplicate';
      layouts['pdfLayout']![27].id = '3--id-summaryDuplicate';
      layouts['pdfLayout']![28].id = 'primaerkontaktperson-id-summaryDuplicate';
      layouts['pdfLayout']![29].id = '3-1-id-summaryDuplicate';
      layouts['pdfLayout']![30].id = '3-2-id-summaryDuplicate';
      layouts['pdfLayout']![31].id = 'primaerperson-landskode-prefix-id-summaryDuplicate';
      layouts['pdfLayout']![32].id = '3-3-id-summaryDuplicate';
      layouts['pdfLayout']![33].id = 'sekundaerkontaktperson-id-summaryDuplicate';
      layouts['pdfLayout']![34].id = '3-4-id-summaryDuplicate';
      layouts['pdfLayout']![35].id = '3-5-id-summaryDuplicate';
      layouts['pdfLayout']![36].id = 'sekundaer-landskode-prefix-id-summaryDuplicate';
      layouts['pdfLayout']![37].id = '3-6-id-summaryDuplicate';
      layouts['pdfLayout']![38].id = '4--id-summaryDuplicate';
      layouts['pdfLayout']![39].id = '4-1-1-id-summaryDuplicate';
      layouts['pdfLayout']![40].id = '4-1-2-id-summaryDuplicate';
      layouts['pdfLayout']![41].id = '4-2-id-summaryDuplicate';
      layouts['pdfLayout']![42].id = 'myRepeatingGroup-summaryDuplicate';
      layouts['pdfLayout']![43].id = '4-2-1-id-summaryDuplicate';
      layouts['pdfLayout']![44].id = '4-3-id-summaryDuplicate';
      layouts['pdfLayout']![45].id = '4-3-1-id-summaryDuplicate';
      layouts['pdfLayout']![46].id = '4-3-1-description-summaryDuplicate';
      layouts['pdfLayout']![47].id = 'repgruppe-laaneformidlere-summaryDuplicate';
      layouts['pdfLayout']![48].id = '5--id-summaryDuplicate';
      layouts['pdfLayout']![49].id = 'repgruppe-laaneformidlere2-summaryDuplicate';
      layouts['pdfLayout']![50].id = 'generertID-12-id-summaryDuplicate';
      layouts['pdfLayout']![51].id = '5-4-id-summaryDuplicate';
      layouts['pdfLayout']![52].id = '5-4-fileUpload-id-summaryDuplicate';
      layouts['pdfLayout']![53].id = '6-id-summaryDuplicate';
      layouts['pdfLayout']![54].id = '6-1-id-summaryDuplicate';
      layouts['pdfLayout']![55].id = '6-1-1-id-summaryDuplicate';
      layouts['pdfLayout']![56].id = '6-1-2-title-id-summaryDuplicate';
      layouts['pdfLayout']![57].id = '6-1-3-id-summaryDuplicate';
      layouts['pdfLayout']![58].id = '6-1-4-id-summaryDuplicate';
      layouts['pdfLayout']![59].id = '6-1-5-id-summaryDuplicate';
      layouts['pdfLayout']![60].id = '6-1-6-id-summaryDuplicate';
      layouts['pdfLayout']![61].id = '6-1-7-id-summaryDuplicate';
      layouts['pdfLayout']![62].id = '6-1-8-id-summaryDuplicate';
      layouts['pdfLayout']![63].id = '6-2-id-summaryDuplicate';
      layouts['pdfLayout']![64].id = '6-2-1-id-summaryDuplicate';
      layouts['pdfLayout']![65].id = '6-2-2-id-summaryDuplicate';
      layouts['pdfLayout']![66].id = '6-2-3-id-summaryDuplicate';
      layouts['pdfLayout']![67].id = '7-id-summaryDuplicate';
      layouts['pdfLayout']![68].id = '7-paragraph-summaryDuplicate';
      layouts['pdfLayout']![69].id = 'repgruppe-produkter-summaryDuplicate';
      layouts['pdfLayout']![70].id = '8-id-summaryDuplicate';
      layouts['pdfLayout']![71].id = '8-1-id-summaryDuplicate';
      layouts['pdfLayout']![72].id = '8-1-fileUpload-id-summaryDuplicate';
      layouts['pdfLayout']![73].id = '8-2-fileUpload-id-summaryDuplicate';
      layouts['pdfLayout']![74].id = '8-3-fileUpload-id-summaryDuplicate';
      layouts['pdfLayout']![75].id = '8-4-fileUpload-id-summaryDuplicate';
      layouts['pdfLayout']![76].id = '8-3-id-summaryDuplicate';
      layouts['pdfLayout']![77].id = 'repgruppe-foretakskalformidle-summaryDuplicate';
      layouts['pdfLayout']![78].id = '8-7-id-summaryDuplicate';
      layouts['pdfLayout']![79].id = '8-4-id-summaryDuplicate';
      layouts['pdfLayout']![80].id = '8-5-id-summaryDuplicate';
      layouts['pdfLayout']![81].id = '8-5-1-1-id-summaryDuplicate';
      layouts['pdfLayout']![82].id = '8-5-1-id-summaryDuplicate';
      layouts['pdfLayout']![83].id = '8-5-12-id-summaryDuplicate';
      layouts['pdfLayout']![84].id = '8-5-13-id-summaryDuplicate';
      layouts['pdfLayout']![85].id = '8-5-25-id-summaryDuplicate';
      layouts['pdfLayout']![86].id = '8-6-id-summaryDuplicate';
      layouts['pdfLayout']![87].id = '8-6-1-id-summaryDuplicate';
      layouts['pdfLayout']![88].id = '8-6-2-id-summaryDuplicate';
      layouts['pdfLayout']![89].id = '8-6-3-id-summaryDuplicate';
      layouts['pdfLayout']![90].id = 'generertID-15-id-summaryDuplicate';
      layouts['pdfLayout']![91].id = '8-6-4-id-summaryDuplicate';
      layouts['pdfLayout']![92].id = '8-6-5-id-summaryDuplicate';
      layouts['pdfLayout']![93].id = '8-6-6-id-summaryDuplicate';
      layouts['pdfLayout']![94].id = '8-6-7-id-summaryDuplicate';
      layouts['pdfLayout']![95].id = '8-7-0-id-summaryDuplicate';
      layouts['pdfLayout']![96].id = '8-6-description-id-summaryDuplicate';
      layouts['pdfLayout']![97].id = '8-7-1-id-summaryDuplicate';
      layouts['pdfLayout']![98].id = '8-7-2-id-summaryDuplicate';
      layouts['pdfLayout']![99].id = '8-7-3-id-summaryDuplicate';
      layouts['pdfLayout']![100].id = '8-7-4-id-summaryDuplicate';
      layouts['pdfLayout']![101].id = '9-id-summaryDuplicate';
      layouts['pdfLayout']![102].id = 'repgruppe-kommentarer-summaryDuplicate';
      layouts['pdfLayout']![103].id = 'NavigationBar-summaryDuplicate';
      layouts['pdfLayout']![104].id = 'submitDuplicate';
    },
    logMessages: [
      `Renamed component id 'introparagraf-1-id-summary' to 'introparagraf-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'introparagraf-4-id-summary' to 'introparagraf-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1--id-summary' to '1--id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-1-id-summary' to '1-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-2-id-summary' to '1-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-3-id-summary' to '1-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-4-id-summary' to '1-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-5-id-summary' to '1-5-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-6-id-summary' to '1-6-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-7-id-summary' to '1-7-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-1-egendefinert-id-summary' to '1-1-egendefinert-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-8-id-summary' to '1-8-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-8-0-id-summary' to '1-8-0-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-orgnr-janei-id-summary' to '1-orgnr-janei-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-9-id-summary' to '1-9-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-10-id-summary' to '1-10-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-11-id-summary' to '1-11-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-12-id-summary' to '1-12-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-13-id-summary' to '1-13-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '1-14-id-summary' to '1-14-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-id-summary' to '2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-1-id-summary' to '2-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-1-1-id-summary' to '2-1-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-1-2-id-summary' to '2-1-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-4-2-id-summary' to '2-4-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '2-4-3-id-summary' to '2-4-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3--id-summary' to '3--id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'primaerkontaktperson-id-summary' to 'primaerkontaktperson-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-1-id-summary' to '3-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-2-id-summary' to '3-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'primaerperson-landskode-prefix-id-summary' to 'primaerperson-landskode-prefix-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-3-id-summary' to '3-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'sekundaerkontaktperson-id-summary' to 'sekundaerkontaktperson-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-4-id-summary' to '3-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-5-id-summary' to '3-5-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'sekundaer-landskode-prefix-id-summary' to 'sekundaer-landskode-prefix-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '3-6-id-summary' to '3-6-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4--id-summary' to '4--id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-1-1-id-summary' to '4-1-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-1-2-id-summary' to '4-1-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-2-id-summary' to '4-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'myRepeatingGroup-summary' to 'myRepeatingGroup-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-2-1-id-summary' to '4-2-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-3-id-summary' to '4-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-3-1-id-summary' to '4-3-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '4-3-1-description-summary' to '4-3-1-description-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'repgruppe-laaneformidlere-summary' to 'repgruppe-laaneformidlere-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5--id-summary' to '5--id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'repgruppe-laaneformidlere2-summary' to 'repgruppe-laaneformidlere2-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'generertID-12-id-summary' to 'generertID-12-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-4-id-summary' to '5-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '5-4-fileUpload-id-summary' to '5-4-fileUpload-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-id-summary' to '6-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-id-summary' to '6-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-1-id-summary' to '6-1-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-2-title-id-summary' to '6-1-2-title-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-3-id-summary' to '6-1-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-4-id-summary' to '6-1-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-5-id-summary' to '6-1-5-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-6-id-summary' to '6-1-6-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-7-id-summary' to '6-1-7-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-1-8-id-summary' to '6-1-8-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-2-id-summary' to '6-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-2-1-id-summary' to '6-2-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-2-2-id-summary' to '6-2-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '6-2-3-id-summary' to '6-2-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '7-id-summary' to '7-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '7-paragraph-summary' to '7-paragraph-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'repgruppe-produkter-summary' to 'repgruppe-produkter-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-id-summary' to '8-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-1-id-summary' to '8-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-1-fileUpload-id-summary' to '8-1-fileUpload-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-2-fileUpload-id-summary' to '8-2-fileUpload-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-3-fileUpload-id-summary' to '8-3-fileUpload-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-4-fileUpload-id-summary' to '8-4-fileUpload-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-3-id-summary' to '8-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'repgruppe-foretakskalformidle-summary' to 'repgruppe-foretakskalformidle-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-7-id-summary' to '8-7-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-4-id-summary' to '8-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-5-id-summary' to '8-5-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-5-1-1-id-summary' to '8-5-1-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-5-1-id-summary' to '8-5-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-5-12-id-summary' to '8-5-12-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-5-13-id-summary' to '8-5-13-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-5-25-id-summary' to '8-5-25-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-id-summary' to '8-6-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-1-id-summary' to '8-6-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-2-id-summary' to '8-6-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-3-id-summary' to '8-6-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'generertID-15-id-summary' to 'generertID-15-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-4-id-summary' to '8-6-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-5-id-summary' to '8-6-5-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-6-id-summary' to '8-6-6-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-7-id-summary' to '8-6-7-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-7-0-id-summary' to '8-7-0-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-6-description-id-summary' to '8-6-description-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-7-1-id-summary' to '8-7-1-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-7-2-id-summary' to '8-7-2-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-7-3-id-summary' to '8-7-3-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '8-7-4-id-summary' to '8-7-4-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id '9-id-summary' to '9-id-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'repgruppe-kommentarer-summary' to 'repgruppe-kommentarer-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'NavigationBar-summary' to 'NavigationBar-summaryDuplicate' on page 'pdfLayout'`,
      `Renamed component id 'submit' to 'submitDuplicate' on page 'pdfLayout'`,
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
