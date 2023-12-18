import React from 'react';

import { Panel, PanelVariant } from '@altinn/altinn-design-system';
import { Grid } from '@material-ui/core';
import { createSelector } from 'reselect';

import { FullWidthWrapper } from 'src/components/form/FullWidthWrapper';
import classes from 'src/components/message/ErrorReport.module.css';
import { FormLayoutActions } from 'src/features/form/layout/formLayoutSlice';
import { usePageNavigationContext } from 'src/features/form/layout/PageNavigationContext';
import { Lang } from 'src/features/language/Lang';
import { useAppDispatch } from 'src/hooks/useAppDispatch';
import { useAppSelector } from 'src/hooks/useAppSelector';
import { useNavigatePage } from 'src/hooks/useNavigatePage';
import { getParsedLanguageFromText } from 'src/language/sharedLanguage';
import { AsciiUnitSeparator } from 'src/layout/FileUpload/utils/asciiUnitSeparator';
import { GenericComponent } from 'src/layout/GenericComponent';
import { useExprContext } from 'src/utils/layout/ExprContext';
import { BaseLayoutNode, type LayoutNode } from 'src/utils/layout/LayoutNode';
import { getMappedErrors, getUnmappedErrors } from 'src/utils/validation/validation';
import type { IRuntimeState } from 'src/types';
import type { IValidations } from 'src/utils/validation/types';
import type { FlatError } from 'src/utils/validation/validation';

export interface IErrorReportProps {
  nodes: LayoutNode[];
}

const ArrowForwardSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16px" style="position: relative; top: 2px">
<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"></path>
</svg>`;
const listStyleImg = `url("data:image/svg+xml,${encodeURIComponent(ArrowForwardSvg)}")`;

const selectValidations = (state: IRuntimeState) => state.formValidations.validations;
const createMappedAndUnmappedErrors = (validations: IValidations): [FlatError[], string[]] => [
  getMappedErrors(validations),
  getUnmappedErrors(validations),
];
const selectMappedUnmappedErrors = createSelector(selectValidations, createMappedAndUnmappedErrors);

export const ErrorReport = ({ nodes }: IErrorReportProps) => {
  const dispatch = useAppDispatch();
  const { currentPageId, navigateToPage } = useNavigatePage();
  const { setFocusId } = usePageNavigationContext();
  const [errorsMapped, errorsUnmapped] = useAppSelector(selectMappedUnmappedErrors);
  const allNodes = useExprContext();
  const hasErrors = errorsUnmapped.length > 0 || errorsMapped.length > 0;

  if (!hasErrors) {
    return null;
  }

  const handleErrorClick = (error: FlatError) => (ev: React.KeyboardEvent | React.MouseEvent) => {
    if (ev.type === 'keydown' && (ev as React.KeyboardEvent).key !== 'Enter') {
      return;
    }
    ev.preventDefault();
    const componentNode = allNodes?.findById(error.componentId);
    if (!componentNode || componentNode.isHidden()) {
      // No point in trying to focus on a hidden component
      return;
    }

    if (currentPageId !== error.layout) {
      navigateToPage(error.layout);
    }

    const allParents = componentNode?.parents() || [];
    for (const [i, parentNode] of allParents.entries()) {
      if (!(parentNode instanceof BaseLayoutNode && parentNode.isType('RepeatingGroup'))) {
        continue;
      }
      const editMode = parentNode.item.edit?.mode;
      if (editMode === 'onlyTable') {
        // No need to set editIndex for likert or repeating groups only rendering in table.
        // These have no edit container.
        continue;
      }

      const childNode = i == 0 ? componentNode : (allParents[i - 1] as LayoutNode);
      const childBaseId = childNode.item.baseComponentId || childNode.item.id;
      const tableColSetup = parentNode.item.tableColumns && parentNode.item.tableColumns[childBaseId];

      if (tableColSetup?.editInTable || tableColSetup?.showInExpandedEdit === false) {
        // No need to open rows or set editIndex for components that are
        // rendered in table (outside of the edit container)
        continue;
      }

      const childRow = childNode.rowIndex !== undefined ? parentNode.item.rows[childNode.rowIndex] : undefined;
      const edit = {
        ...parentNode.item.edit,
        ...childRow?.groupExpressions?.edit,
      };
      if (edit.editButton === false) {
        // Cannot open this group row for editing, as the edit button is disabled
        continue;
      }

      // Go to correct multiPage page if necessary
      if (parentNode.item.edit?.multiPage && childNode.item.multiPageIndex !== undefined) {
        const multiPageIndex = childNode.item.multiPageIndex;
        dispatch(
          FormLayoutActions.repGroupSetMultiPage({
            groupId: parentNode.item.id,
            page: multiPageIndex,
          }),
        );
      }

      if (childNode?.rowIndex !== undefined) {
        // Set editIndex to rowIndex
        dispatch(
          FormLayoutActions.updateRepeatingGroupsEditIndex({
            group: parentNode.item.id,
            index: childNode.rowIndex,
            currentPageId,
          }),
        );
      }
    }

    // Set focus
    setFocusId(error.componentId);
  };

  const errorMessage = (message: string) =>
    message.includes(AsciiUnitSeparator) ? message.substring(message.indexOf(AsciiUnitSeparator) + 1) : message;

  return (
    <div data-testid='ErrorReport'>
      <FullWidthWrapper isOnBottom={true}>
        <Panel
          title={<Lang id={'form_filler.error_report_header'} />}
          showIcon={false}
          variant={PanelVariant.Error}
        >
          <Grid
            container={true}
            item={true}
            spacing={3}
            alignItems='flex-start'
          >
            <Grid
              item
              xs={12}
            >
              <ul className={classes.errorList}>
                {errorsUnmapped.map((error: string) => (
                  <li
                    key={`unmapped-${error}`}
                    style={{ listStyleImage: listStyleImg }}
                  >
                    {getParsedLanguageFromText(error, {
                      disallowedTags: ['a'],
                    })}
                  </li>
                ))}
                {errorsMapped.map((error) => (
                  <li
                    key={`mapped-${error.componentId}-${error.message}`}
                    style={{ listStyleImage: listStyleImg }}
                  >
                    <button
                      className={classes.buttonAsInvisibleLink}
                      onClick={handleErrorClick(error)}
                      onKeyDown={handleErrorClick(error)}
                    >
                      {getParsedLanguageFromText(errorMessage(error.message), {
                        disallowedTags: ['a'],
                      })}
                    </button>
                  </li>
                ))}
              </ul>
            </Grid>
            {nodes.map((n) => (
              <GenericComponent
                key={n.item.id}
                node={n}
              />
            ))}
          </Grid>
        </Panel>
      </FullWidthWrapper>
    </div>
  );
};
