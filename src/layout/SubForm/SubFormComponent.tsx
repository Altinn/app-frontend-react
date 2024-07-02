import React from 'react';
import { Link } from 'react-router-dom';

import { Table } from '@digdir/designsystemet-react';

import { useFormDataQuery } from 'src/features/formData/useFormDataQuery';
import { useStrictInstanceData } from 'src/features/instance/InstanceContext';
import { getDataModelUrl } from 'src/utils/urls/appUrlHelper';
import type { PropsFromGenericComponent } from 'src/layout';
import type { LayoutNode } from 'src/utils/layout/LayoutNode';

export function SubFormComponent({ node }: PropsFromGenericComponent<'SubForm'>): React.JSX.Element | null {
  const dataType = node.item.dataType;
  const dataElements = useStrictInstanceData().data.filter((d) => d.dataType === dataType);

  return (
    <>
      <h1>Here we are in the SubForm component</h1>
      <Table>
        <Table.Row>
          {dataElements.map((dataElement) => (
            <SubFormElement
              key={dataElement.id}
              id={dataElement.id}
              node={node}
            />
          ))}
        </Table.Row>
      </Table>
    </>
  );
}

function SubFormElement({ id, node }: { id: string; node: LayoutNode<'SubForm'> }) {
  const instance = useStrictInstanceData();
  const url = getDataModelUrl(instance.id, id, true);
  const { isFetching, data, error } = useFormDataQuery(url);

  if (isFetching) {
    // TODO: Spinner
    return null;
  }
  // <span>{dot.pick('Path.Inside.DataModel', data)}</span>

  return (
    <Table.Cell key={id}>
      <Link to={`${node.item.id}/${id}`}>{id}</Link>
    </Table.Cell>
  );
}
