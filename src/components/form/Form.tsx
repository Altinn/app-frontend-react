import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';

import Grid from '@material-ui/core/Grid';
import deepEqual from 'fast-deep-equal';

import { ArbitraryStructureComponent } from 'src/components/ArbitraryStructurePresentation/ArbitraryStructurePresentation';
import classes from 'src/components/form/Form.module.css';
import { MessageBanner } from 'src/components/form/MessageBanner';
import { ErrorReport } from 'src/components/message/ErrorReport';
import { ReadyForPrint } from 'src/components/ReadyForPrint';
import { Loader } from 'src/core/loading/Loader';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { useExpandedWidthLayouts } from 'src/features/form/layout/LayoutsContext';
import { useNavigateToNode, useRegisterNodeNavigationHandler } from 'src/features/form/layout/NavigateToNode';
import { useUiConfigContext } from 'src/features/form/layout/UiConfigContext';
import { usePageSettings } from 'src/features/form/layoutSettings/LayoutSettingsContext';
import { FrontendValidationSource } from 'src/features/validation';
import { useTaskErrors } from 'src/features/validation/selectors/taskErrors';
import { SearchParams, useCurrentView, useNavigatePage } from 'src/hooks/useNavigatePage';
import { GenericComponentById } from 'src/layout/GenericComponent';
import { extractBottomButtons, hasRequiredFields } from 'src/utils/formLayout';
import { useNodesMemoSelector, useResolvedNode } from 'src/utils/layout/NodesContext';

interface FormState {
  hasRequired: boolean;
  requiredFieldsMissing: boolean;
  mainIds: string[] | undefined;
  errorReportIds: string[];
}

export function Form() {
  const currentPageId = useCurrentView();
  const { isValidPageId, navigateToPage } = useNavigatePage();

  const [formState, setFormState] = useState<FormState>({
    hasRequired: false,
    requiredFieldsMissing: false,
    mainIds: undefined,
    errorReportIds: [],
  });
  const { hasRequired, requiredFieldsMissing, mainIds, errorReportIds } = formState;

  useRedirectToStoredPage();
  useSetExpandedWidth();

  useRegisterNodeNavigationHandler((targetNode) => {
    const targetView = targetNode?.top.top.myKey;
    if (targetView && targetView !== currentPageId) {
      navigateToPage(targetView, {
        shouldFocusComponent: true,
        replace: window.location.href.includes(SearchParams.FocusComponentId),
      });
      return true;
    }
    return false;
  });

  if (!currentPageId || !isValidPageId(currentPageId)) {
    return <FormFirstPage />;
  }

  if (mainIds === undefined) {
    return (
      <>
        <ErrorProcessing setFormState={setFormState} />
        <Loader
          reason='form-ids'
          renderPresentation={false}
        />
      </>
    );
  }

  return (
    <>
      <ErrorProcessing setFormState={setFormState} />
      {hasRequired && (
        <MessageBanner
          error={requiredFieldsMissing}
          messageKey={'form_filler.required_description'}
        />
      )}
      <Grid
        container={true}
        spacing={3}
        alignItems='flex-start'
      >
        <ArbitraryStructureComponent
          config={{
            presentationDataId: 'aktør',
          }}
          input={{
            title: 'Kari Nordmann',
            data: [
              {
                data: {
                  Fødselsnummer: '12345678901',
                  Adresse: 'Norgesveien 12, 1337 Sandvika, Norge',
                },
              },
              'Rolle gyldig fra: 01.01.2021',
            ],
          }}
        />
        <div style={{ height: '25px', width: '100%' }}></div>
        <ArbitraryStructureComponent
          config={{
            presentationDataId: 'org',
          }}
          input={{
            title: 'Follebu og Bæverfjord Regnskap AS',
            data: [
              {
                data: {
                  'Org nr.': '12345678901',
                  Forretningsadresse: 'Norgesveien 123, 0088 Oslo, Norge',
                },
              },
            ],
          }}
        />
        <div style={{ height: '25px', width: '100%' }}></div>
        <ArbitraryStructureComponent
          config={{
            presentationDataId: 'test',
            direction: 'horizontal',
          }}
          input={{
            title: 'Saksopplysninger',
            description: 'Saksopplysninger for konkursboet til Follebu og Bæverfjord Regnskap AS',
            data: [
              {
                data: {
                  Åpningsdato: '14.10.2008',
                  Tingrett: 'RINGERIKE, ASKER OG BÆRUM TINGRETT',
                  Saksnummer: '01-52343FRE-TOS/09',
                  'Tingrett 2': 'RINGERIKE, ASKER OG BÆRUM TINGRETT',
                },
              },
            ],
          }}
        />
        <div style={{ height: '25px', width: '100%' }}></div>
        <ArbitraryStructureComponent
          config={{
            presentationDataId: 'test',
          }}
          input={{
            title: 'Bostyrer',
            data: [
              {
                data: {
                  Åpningsdato: '14.10.2008',
                  Tingrett: 'RINGERIKE, ASKER OG BÆRUM TINGRETT',
                  Saksnummer: '56-35553TRE-FOS/08',
                },
              },
            ],
          }}
        />
        <div style={{ height: '25px', width: '100%' }}></div>
        <ArbitraryStructureComponent
          config={{
            presentationDataId: 'test',
            direction: 'horizontal',
          }}
          input={{
            title: 'Kartverket',
            data: [
              {
                data: {
                  Kommunenr: '1337',
                  Gårdsnr: '33',
                  Bruksnr: '192',
                  Festenr: '-',
                  Seksjonsnr: '1',
                  Landbruk: 'Nei',
                  Eierbrøk: '1/2',
                },
              },
            ],
          }}
        />

        <div style={{ height: '25px', width: '100%' }}></div>
        <ArbitraryStructureComponent
          config={{
            presentationDataId: 'test',
          }}
          input={{
            title: 'Test data complicated structure',
            data: [
              {
                data: {
                  stringKey: 'string',
                  numberKey: 42,
                  booleanKey: true,
                  linkKey: { value: 'link', href: 'https://example.com' },
                  structureKey: {
                    data: {
                      stringKey2: 'string',
                      numberKey2: 42,
                      booleanKey2: true,
                      linkKey2: { value: 'link', href: 'https://example.com' },
                    },
                  },
                  structureArrayKey: [
                    'string in array',
                    42,
                    true,
                    { value: 'link', href: 'https://example.com' },
                    {
                      title: 'Test data complicated structure',
                      description: 'This is a test data structure with a lot of different types of data',
                      data: {
                        stringKey: 'string',
                        numberKey: 42,
                        booleanKey: true,
                        linkKey: { value: 'link', href: 'https://example.com' },
                      },
                    },
                  ],
                },
              },
            ],
          }}
        />

        {mainIds.map((id) => (
          <GenericComponentById
            key={id}
            id={id}
          />
        ))}
        <Grid
          item={true}
          xs={12}
          aria-live='polite'
          className={classes.errorReport}
        >
          <ErrorReport renderIds={errorReportIds} />
        </Grid>
      </Grid>
      <ReadyForPrint />
      <HandleNavigationFocusComponent />
    </>
  );
}

export function FormFirstPage() {
  const { startUrl, queryKeys } = useNavigatePage();
  return (
    <Navigate
      to={startUrl + queryKeys}
      replace
    />
  );
}

/**
 * Redirects users that had a stored page in their local storage to the correct
 * page, and later removes this currentViewCacheKey from localstorage, as
 * it is no longer needed.
 */
function useRedirectToStoredPage() {
  const { currentPageId, partyId, instanceGuid, isValidPageId, navigateToPage } = useNavigatePage();
  const applicationMetadataId = useApplicationMetadata()?.id;
  const location = useLocation().pathname;

  const instanceId = `${partyId}/${instanceGuid}`;
  const currentViewCacheKey = instanceId || applicationMetadataId;

  useEffect(() => {
    if (!currentPageId && !!currentViewCacheKey) {
      const lastVisitedPage = localStorage.getItem(currentViewCacheKey);
      if (lastVisitedPage !== null && isValidPageId(lastVisitedPage)) {
        localStorage.removeItem(currentViewCacheKey);
        navigateToPage(lastVisitedPage, { replace: true });
      }
    }
  }, [currentPageId, currentViewCacheKey, isValidPageId, location, navigateToPage]);
}

/**
 * Sets the expanded width for the current page if it is defined in the currently viewed layout-page
 */
function useSetExpandedWidth() {
  const currentPageId = useCurrentView();
  const expandedPagesFromLayout = useExpandedWidthLayouts();
  const expandedWidthFromSettings = usePageSettings().expandedWidth;
  const { setExpandedWidth } = useUiConfigContext();

  useEffect(() => {
    let defaultExpandedWidth = false;
    if (currentPageId && expandedPagesFromLayout[currentPageId] !== undefined) {
      defaultExpandedWidth = !!expandedPagesFromLayout[currentPageId];
    } else if (expandedWidthFromSettings !== undefined) {
      defaultExpandedWidth = expandedWidthFromSettings;
    }
    setExpandedWidth(defaultExpandedWidth);
  }, [currentPageId, expandedPagesFromLayout, expandedWidthFromSettings, setExpandedWidth]);
}

const emptyArray = [];
interface ErrorProcessingProps {
  setFormState: React.Dispatch<React.SetStateAction<FormState>>;
}

/**
 * Instead of re-rendering the entire Form component when any of this changes, we just report the
 * state to the parent component.
 */
function ErrorProcessing({ setFormState }: ErrorProcessingProps) {
  const currentPageId = useCurrentView();
  const topLevelNodeIds = useNodesMemoSelector(
    (nodes) =>
      nodes
        .findLayout(currentPageId)
        ?.children()
        .map((n) => n.item.id) || emptyArray,
  );
  const hasRequired = useNodesMemoSelector((nodes) => {
    const page = nodes.findLayout(currentPageId);
    return page ? hasRequiredFields(page) : false;
  });

  const { formErrors, taskErrors } = useTaskErrors();
  const hasErrors = Boolean(formErrors.length) || Boolean(taskErrors.length);
  const [mainIds, errorReportIds] = useNodesMemoSelector((nodes) => {
    const page = nodes.findLayout(currentPageId);
    if (!hasErrors || !page) {
      return [topLevelNodeIds, []];
    }
    return extractBottomButtons(page);
  });
  const requiredFieldsMissing = formErrors.some(
    (error) => error.source === FrontendValidationSource.EmptyField && error.pageKey === currentPageId,
  );

  useEffect(() => {
    setFormState((prevState) => {
      if (
        prevState.hasRequired === hasRequired &&
        prevState.requiredFieldsMissing === requiredFieldsMissing &&
        deepEqual(mainIds, prevState.mainIds) &&
        deepEqual(errorReportIds, prevState.errorReportIds)
      ) {
        return prevState;
      }

      return {
        hasRequired,
        requiredFieldsMissing,
        mainIds,
        errorReportIds,
      };
    });
  }, [setFormState, hasRequired, requiredFieldsMissing, mainIds, errorReportIds]);

  return null;
}

function HandleNavigationFocusComponent() {
  const [searchParams, setSearchParams] = useSearchParams();

  const componentId = searchParams.get(SearchParams.FocusComponentId);
  const focusNode = useResolvedNode(componentId);
  const navigateTo = useNavigateToNode();

  React.useEffect(() => {
    searchParams.delete(SearchParams.FocusComponentId);
    setSearchParams(searchParams, { replace: true, preventScrollReset: true });
  }, [searchParams, setSearchParams]);

  React.useEffect(() => {
    if (focusNode != null) {
      navigateTo(focusNode);
    }
  }, [navigateTo, focusNode]);

  return null;
}
