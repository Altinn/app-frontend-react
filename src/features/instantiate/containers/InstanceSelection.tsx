import React, { useState } from 'react';

import { Pagination } from '@altinn/altinn-design-system';
import {
  Button,
  Heading,
  Paragraph,
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from '@digdir/design-system-react';
import { Edit as EditIcon } from '@navikt/ds-icons';
import type { DescriptionText } from '@altinn/altinn-design-system/dist/types/src/components/Pagination/Pagination';

import { ReadyForPrint } from 'src/components/ReadyForPrint';
import classes from 'src/features/instantiate/containers/InstanceSelection.module.css';
import { useIsMobileOrTablet } from 'src/hooks/useIsMobile';
import { useLanguage } from 'src/hooks/useLanguage';
import { getInstanceUiUrl } from 'src/utils/urls/appUrlHelper';
import type { ISimpleInstance } from 'src/types';

export interface IInstanceSelectionProps {
  instances: ISimpleInstance[];
  onNewInstance: () => void;
}

function getDateDisplayString(timeStamp: string) {
  let date = new Date(timeStamp);
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  const locale = window.navigator?.language || (window.navigator as any)?.userLanguage || 'nb-NO';
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function InstanceSelection({ instances, onNewInstance }: IInstanceSelectionProps) {
  const { lang, langAsString, language } = useLanguage();
  const mobileView = useIsMobileOrTablet();
  const rowsPerPageOptions = [10, 25, 50];

  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[0]);

  const instancesReversed = instances.slice().reverse();
  const paginatedInstances = instancesReversed.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  const openInstance = (instanceId: string) => {
    window.location.href = getInstanceUiUrl(instanceId);
  };

  function handleRowsPerPageChanged(newRowsPerPage: number) {
    setRowsPerPage(newRowsPerPage);
    if (instancesReversed.length < currentPage * newRowsPerPage) {
      setCurrentPage(Math.floor(instancesReversed.length / newRowsPerPage));
    }
  }

  const renderMobileTable = () => (
    <>
      <Heading
        size='xsmall'
        level={3}
        className={classes.leftOfHeading}
      >
        {lang('instance_selection.left_off')}
      </Heading>
      <Table id='instance-selection-mobile-table'>
        {paginatedInstances.map((instance, index) => (
          <TableRow
            key={`instance-selection-mobile-row-${instance.id}`}
            data-row-num={index}
          >
            <TableCell className={classes.mobileTableCell}>
              <div>
                <b className={classes.spaceAfterContent}>{langAsString('instance_selection.last_changed')}:</b>
                <span>{getDateDisplayString(instance.lastChanged)}</span>
              </div>
              <div>
                <b className={classes.spaceAfterContent}>{langAsString('instance_selection.changed_by')}:</b>
                <span>{instance.lastChangedBy}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className={classes.tableButtonWrapper}>
                <Button
                  variant='quiet'
                  color='secondary'
                  icon={<EditIcon />}
                  iconPlacement='right'
                  onClick={() => openInstance(instance.id)}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2}>
              <div className={classes.paginationWrapperMobile}>
                <Pagination
                  numberOfRows={instances.length}
                  rowsPerPageOptions={rowsPerPageOptions}
                  rowsPerPage={rowsPerPage}
                  currentPage={currentPage}
                  onRowsPerPageChange={(changeEvent) =>
                    handleRowsPerPageChanged(parseInt(changeEvent.currentTarget.value))
                  }
                  setCurrentPage={(page) => setCurrentPage(page)}
                  descriptionTexts={language && (language['list_component'] as DescriptionText)}
                />
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );

  const renderTable = () => (
    <div className={classes.tableContainer}>
      <Table id='instance-selection-table'>
        <TableHeader id='instance-selection-table-header'>
          <TableRow>
            <TableCell>{lang('instance_selection.last_changed')}</TableCell>
            <TableCell>{lang('instance_selection.changed_by')}</TableCell>
            <TableCell />
          </TableRow>
        </TableHeader>
        <TableBody id='instance-selection-table-body'>
          {paginatedInstances.map((instance: ISimpleInstance) => (
            <TableRow key={instance.id}>
              <TableCell>{getDateDisplayString(instance.lastChanged)}</TableCell>
              <TableCell>{instance.lastChangedBy}</TableCell>
              <TableCell className={classes.buttonCell}>
                <div className={classes.tableButtonWrapper}>
                  <Button
                    variant='quiet'
                    color='secondary'
                    icon={<EditIcon />}
                    iconPlacement='right'
                    onClick={() => openInstance(instance.id)}
                  >
                    {lang('instance_selection.continue')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>
              <div className={classes.paginationWrapper}>
                <Pagination
                  numberOfRows={instances.length}
                  rowsPerPageOptions={rowsPerPageOptions}
                  rowsPerPage={rowsPerPage}
                  currentPage={currentPage}
                  onRowsPerPageChange={(changeEvent) =>
                    handleRowsPerPageChanged(parseInt(changeEvent.currentTarget.value))
                  }
                  setCurrentPage={(page) => setCurrentPage(page)}
                  descriptionTexts={language && (language['list_component'] as DescriptionText)}
                />
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );

  return (
    <>
      <div id='instance-selection-container'>
        <div>
          <Heading
            level={2}
            size='medium'
            id='instance-selection-header'
          >
            {lang('instance_selection.header')}
          </Heading>
        </div>
        <div id='instance-selection-description'>
          <Paragraph className={classes.descriptionParagraph}>{lang('instance_selection.description')}</Paragraph>
        </div>

        {mobileView && renderMobileTable()}
        {!mobileView && renderTable()}
        <div className={classes.startNewButtonContainer}>
          <Button
            onClick={onNewInstance}
            id='new-instance-button'
          >
            {lang('instance_selection.new_instance')}
          </Button>
        </div>
      </div>
      <ReadyForPrint />
    </>
  );
}
