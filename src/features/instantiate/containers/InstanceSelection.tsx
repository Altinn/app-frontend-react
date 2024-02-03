import React, { useState } from 'react';

import { Pagination } from '@altinn/altinn-design-system';
import { Button, Heading, Paragraph } from '@digdir/design-system-react';
import { Table } from '@digdir/design-system-react-latest';
import { Edit as EditIcon } from '@navikt/ds-icons';
import cn from 'classnames';
import type { DescriptionText } from '@altinn/altinn-design-system/dist/types/src/components/Pagination/Pagination';

import { ReadyForPrint } from 'src/components/ReadyForPrint';
import classes from 'src/features/instantiate/containers/InstanceSelection.module.css';
import { useApplicationMetadataQuery } from 'src/hooks/queries/useApplicationMetadataQuery';
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
  const { data: applicationMetadata } = useApplicationMetadataQuery();
  const instanceSelectionOptions = applicationMetadata?.onEntry?.instanceSelection;
  const selectedIndex = instanceSelectionOptions?.defaultSelectedOption;
  const { lang, langAsString, language } = useLanguage();
  const isMobileView = useIsMobileOrTablet();
  const rowsPerPageOptions = instanceSelectionOptions?.rowsPerPageOptions ?? [10, 25, 50];

  const doesIndexExist = (selectedIndex: number | undefined): selectedIndex is number =>
    selectedIndex !== undefined && rowsPerPageOptions.length - 1 >= selectedIndex && selectedIndex >= 0;

  const defaultSelectedOption = doesIndexExist(selectedIndex) ? selectedIndex : 0;
  const [currentPage, setCurrentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions[defaultSelectedOption]);

  if (instanceSelectionOptions?.sortDirection === 'desc') {
    instances = instances.slice().reverse();
  }
  const paginatedInstances = instances.slice(currentPage * rowsPerPage, (currentPage + 1) * rowsPerPage);

  function handleRowsPerPageChanged(newRowsPerPage: number) {
    setRowsPerPage(newRowsPerPage);
    if (instances.length < currentPage * newRowsPerPage) {
      setCurrentPage(Math.floor(instances.length / newRowsPerPage));
    }
  }

  const renderMobileTable = () => (
    <>
      <Heading
        size='xsmall'
        level={3}
        className={classes.leftOffHeading}
      >
        {lang('instance_selection.left_of')}
      </Heading>
      <Table
        border
        id='instance-selection-mobile-table'
        className={classes.table}
      >
        <Table.Body>
          {paginatedInstances.map((instance) => (
            <Table.Row key={instance.id}>
              <Table.Cell className={classes.mobileTableCell}>
                <div>
                  <b>{langAsString('instance_selection.last_changed')}:</b>
                  <br />
                  <span>{getDateDisplayString(instance.lastChanged)}</span>
                </div>
                <div>
                  <b>{langAsString('instance_selection.changed_by')}:</b>
                  <br />
                  <span>{instance.lastChangedBy}</span>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className={classes.tableButtonWrapper}>
                  <Button
                    variant='tertiary'
                    size='small'
                    color='second'
                    icon={<EditIcon />}
                    iconPlacement='right'
                    onClick={(ev) => openInstance(instance.id, ev)}
                    onMouseDown={(ev) => openInstance(instance.id, ev)}
                    aria-label={`${langAsString('instance_selection.continue')}`}
                  />
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
        {instances.length > rowsPerPageOptions[0] && (
          <tfoot>
            <Table.Row className={classes.semanticSurfaceBgColor}>
              {/* @ts-expect-error colSpan is supported, but the types of TableCell are incorrect */}
              <Table.Cell colSpan={2}>
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
              </Table.Cell>
            </Table.Row>
          </tfoot>
        )}
      </Table>
    </>
  );

  const renderTable = () => (
    <Table
      id='instance-selection-table'
      className={cn(classes.table, classes.tableContainer)}
      size='large'
      border
    >
      <Table.Head id='instance-selection-table-header'>
        <Table.Row>
          <Table.HeaderCell>{lang('instance_selection.last_changed')}</Table.HeaderCell>
          <Table.HeaderCell>{lang('instance_selection.changed_by')}</Table.HeaderCell>
          <Table.HeaderCell />
        </Table.Row>
      </Table.Head>
      <Table.Body id='instance-selection-table-body'>
        {paginatedInstances.map((instance: ISimpleInstance) => (
          <Table.Row key={instance.id}>
            <Table.Cell>{getDateDisplayString(instance.lastChanged)}</Table.Cell>
            <Table.Cell>{instance.lastChangedBy}</Table.Cell>
            <Table.Cell className={classes.buttonCell}>
              <div className={classes.tableButtonWrapper}>
                <Button
                  variant='tertiary'
                  size='small'
                  color='second'
                  icon={<EditIcon />}
                  iconPlacement='right'
                  onClick={(ev) => openInstance(instance.id, ev)}
                >
                  {lang('instance_selection.continue')}
                </Button>
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      {instances.length > rowsPerPageOptions[0] && (
        <tfoot className={classes.semanticSurfaceBgColor}>
          <Table.Row>
            {/* @ts-expect-error colSpan is supported, but the types of TableCell are incorrect */}
            <Table.Cell colSpan={3}>
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
            </Table.Cell>
          </Table.Row>
        </tfoot>
      )}
    </Table>
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

        {isMobileView && renderMobileTable()}
        {!isMobileView && renderTable()}
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

/**
 * Opens a new tab with the given url
 * This works much like window.open, but respects the browser settings for opening
 * new tabs (if they should open in the background or not)
 */
const openInTab = (url: string, originalEvent: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  const link = document.createElement('a');
  link.href = url;
  const options: MouseEventInit = {
    button: originalEvent.button,
    buttons: originalEvent.buttons,
    ctrlKey: originalEvent.ctrlKey,
    metaKey: originalEvent.metaKey,
    shiftKey: originalEvent.shiftKey,
  };
  const newEvent = new MouseEvent(originalEvent.type, options);
  link.dispatchEvent(newEvent);
};

/**
 * Opens the instance in a new tab if the user holds down ctrl or meta (cmd) while clicking, otherwise
 * behaves like a normal link.
 */
const openInstance = (instanceId: string, originalEvent: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
  if (originalEvent.ctrlKey || originalEvent.metaKey || originalEvent.button === 1) {
    originalEvent.stopPropagation();
    originalEvent.preventDefault();
    openInTab(getInstanceUiUrl(instanceId), originalEvent);
    return;
  }

  if (originalEvent.type !== 'click') {
    return;
  }

  window.location.href = getInstanceUiUrl(instanceId);
};
