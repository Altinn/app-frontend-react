import { ILayoutComponent } from 'src/features/form/layout';
import { ITextResource } from 'src/types';
import * as React from 'react';
import { TableCell } from '@material-ui/core';
import { GenericComponent } from 'src/components/GenericComponent';
import {
  AltinnSpinner,
  AltinnTable,
  AltinnTableBody,
  AltinnTableHeader,
  AltinnTableRow,
} from 'altinn-shared/components';
import { getTextResource } from 'src/utils/formComponentUtils';
import { useGetOptions } from 'src/components/hooks';
import { useAppSelector } from 'src/common/hooks';
import { getOptionLookupKey } from 'src/utils/options';
import { IRadioButtonsContainerProps } from 'src/components/base/RadioButtonsContainerComponent';
import useMediaQuery from '@material-ui/core/useMediaQuery';

type RepeatingGroupsLikertContainerProps = {
  id: string;
  repeatingGroupDeepCopyComponents: ILayoutComponent[];
  textResources: ITextResource[];
};

export const RepeatingGroupsLikertContainer = ({
  id,
  repeatingGroupDeepCopyComponents,
  textResources,
}: RepeatingGroupsLikertContainerProps) => {
  const { optionsId, mapping, source, options } =
    repeatingGroupDeepCopyComponents[0] as IRadioButtonsContainerProps;
  const mobileView = useMediaQuery('(max-width:992px)'); // breakpoint on altinn-modal
  const apiOptions = useGetOptions({ optionsId, mapping, source });
  const calculatedOptions = apiOptions || options || [];
  const fetchingOptions = useAppSelector(
    (state) =>
      state.optionState.options[getOptionLookupKey(optionsId, mapping)]
        ?.loading,
  );

  if (mobileView) {
    return (
      <>
        {repeatingGroupDeepCopyComponents.map((comp) => {
          return (
            <GenericComponent
              key={comp.id}
              {...comp}
              likertDisplay={'mobile'}
            />
          );
        })}
      </>
    );
  }

  return (
    <>
      {fetchingOptions ? (
        <AltinnSpinner />
      ) : (
        <AltinnTable id={id} tableLayout='auto' wordBreak='normal'>
          <AltinnTableHeader id={`likert-table-header-${id}`} padding={'dense'}>
            <AltinnTableRow>
              <TableCell />
              {calculatedOptions.map((option, index) => {
                const colLabelId = `col-label-${index}`;
                return (
                  <TableCell key={option.value} id={colLabelId} align='center'>
                    {getTextResource(option.label, textResources)}
                  </TableCell>
                );
              })}
            </AltinnTableRow>
          </AltinnTableHeader>
          <AltinnTableBody id={`likert-table-body-${id}`} padding={'dense'}>
            {repeatingGroupDeepCopyComponents.map((comp) => {
              return (
                <GenericComponent
                  key={comp.id}
                  {...comp}
                  likertDisplay={'desktop'}
                />
              );
            })}
          </AltinnTableBody>
        </AltinnTable>
      )}
    </>
  );
};
