import React from 'react';

import { Link } from '@digdir/designsystemet-react';
import { pick } from 'dot-object';

import { AppTable } from 'src/app-components/Table/Table';
import { Caption } from 'src/components/form/caption/Caption';
import { useExternalApis } from 'src/features/externalApi/useExternalApi';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import { useIsMobile } from 'src/hooks/useDeviceWidths';
import { isFormDataObject, isFormDataObjectArray } from 'src/layout/SimpleTable/typeguards';
import { useItemWhenType } from 'src/utils/layout/useNodeItem';
import type { FormDataObject } from 'src/app-components/DynamicForm/DynamicForm';
import type { PropsFromGenericComponent } from 'src/layout';
import type { DataConfig } from 'src/layout/SimpleTable/config.generated';

interface ApiTableProps extends PropsFromGenericComponent<'SimpleTable'> {
  externalApi: DataConfig;
}

export function ApiTable({ baseComponentId, externalApi }: ApiTableProps) {
  const { textResourceBindings, zebra, size, columns } = useItemWhenType(baseComponentId, 'SimpleTable');
  const { title, description, help } = textResourceBindings ?? {};
  const { elementAsString } = useLanguage();
  const accessibleTitle = elementAsString(title);
  const isMobile = useIsMobile();
  const { data } = useExternalApis([externalApi.id]);

  if (!data[externalApi.id]) {
    return null;
  }

  const value = pick(externalApi.path, data[externalApi.id]);

  if (!value) {
    return null;
  }

  let dataToDisplay: FormDataObject[] = [];

  if (!isFormDataObject(value) && !isFormDataObjectArray(value)) {
    return;
  }

  if (!Array.isArray(value)) {
    dataToDisplay.push(value);
  } else {
    dataToDisplay = value;
  }

  return (
    <AppTable
      zebra={zebra}
      size={size}
      schema={{}}
      caption={
        title && (
          <Caption
            title={<Lang id={title} />}
            description={description && <Lang id={description} />}
            helpText={help ? { text: <Lang id={help} />, accessibleTitle } : undefined}
          />
        )
      }
      data={dataToDisplay}
      stickyHeader={true}
      emptyText={<Lang id='general.empty_table' />}
      columns={columns.map((config) => {
        const { component } = config;
        const header = <Lang id={config.header} />;
        let renderCell;
        if (component) {
          renderCell = (_, __, rowIndex) => {
            const rowData = dataToDisplay[rowIndex];
            if (component.type === 'link') {
              const href = pick(component.hrefPath, rowData);
              const text = pick(component.textPath, rowData);
              return (
                <Link
                  href={href}
                  target={component.openInNewTab ? '_blank' : undefined}
                >
                  {text}
                </Link>
              );
            }
          };
        }

        return {
          ...config,
          header,
          renderCell,
        };
      })}
      mobile={isMobile}
      actionButtonHeader={<Lang id='general.action' />}
    />
  );
}
