import React from 'react';

import { v4 as uuidv4 } from 'uuid';

import { getApplicationMetadataMock } from 'src/__mocks__/getApplicationMetadataMock';
import { getInstanceDataMock } from 'src/__mocks__/getInstanceDataMock';
import { getLayoutSetsMock } from 'src/__mocks__/getLayoutSetsMock';
import { instanceIdExample } from 'src/__mocks__/mocks';
import { Lang } from 'src/features/language/Lang';
import { renderWithInstanceAndLayout } from 'src/test/renderWithProviders';
import type { IRawTextResource } from 'src/features/language/textResources';
import type { IData, IDataType } from 'src/types/shared';

interface TestProps {
  ids: string[];
  textResources: IRawTextResource[];
  dataModels: {
    [typeName: string]: object;
  };
  defaultDataModel: string;
}

function TestComponent({ ids }: TestProps) {
  return (
    <>
      {ids.map((id) => (
        <div
          data-testid={id}
          key={id}
        >
          <Lang
            key={id}
            id={id}
          />
        </div>
      ))}
    </>
  );
}

async function render(props: TestProps) {
  const dataModelNames = Object.keys(props.dataModels);
  const idToNameMap: { [id: string]: string } = {};
  function generateDataElements(): IData[] {
    return dataModelNames.map((name) => {
      const id = uuidv4();
      idToNameMap[id] = name;
      return {
        id,
        instanceGuid: instanceIdExample,
        dataType: name,
        contentType: 'application/xml',
        blobStoragePath: `ttd/frontend-test/${instanceIdExample}/data/${id}`,
        size: 1017,
        locked: false,
        refs: [],
        isRead: true,
        created: new Date('2021-06-04T13:26:43.9100666Z').toISOString(),
        createdBy: '12345',
        lastChanged: new Date('2021-06-04T13:26:43.9100666Z').toISOString(),
        lastChangedBy: '12345',
      };
    });
  }

  function generateDataTypes(): IDataType[] {
    return dataModelNames.map((name) => ({
      id: name,
      allowedContentTypes: ['application/xml'],
      appLogic: {
        autoCreate: true,
        classRef: name,
      },
      taskId: 'Task_1',
      maxCount: 1,
      minCount: 1,
    }));
  }

  return await renderWithInstanceAndLayout({
    renderer: () => <TestComponent {...props} />,
    queries: {
      fetchApplicationMetadata: async () =>
        getApplicationMetadataMock((a) => {
          a.dataTypes = a.dataTypes.filter((dt) => !dt.appLogic?.classRef);
          a.dataTypes.push(...generateDataTypes());
        }),
      fetchInstanceData: async () =>
        getInstanceDataMock((i) => {
          i.data = generateDataElements();
        }),
      fetchLayoutSets: async () => {
        const mock = getLayoutSetsMock();
        for (const set of mock.sets) {
          set.dataType = props.defaultDataModel;
        }
        return mock;
      },
      fetchTextResources: async () => ({
        resources: props.textResources,
        language: 'nb',
      }),
      fetchFormData: async (url) => {
        const id = url.split('/').pop();
        const modelName = idToNameMap[id!];
        const formData = props.dataModels[modelName];
        if (!formData) {
          throw new Error(`No form data for model: ${url} (modelName = ${modelName})`);
        }
        return formData;
      },
    },
  });
}

describe('FormDataReaders', () => {
  it('should render a simple resource with a variable lookup', async () => {
    await render({
      ids: ['test'],
      textResources: [
        {
          id: 'test',
          value: 'Hello {0}',
          variables: [
            {
              dataSource: 'dataModel.someModel',
              key: 'name',
            },
          ],
        },
      ],
      dataModels: {
        someModel: {
          name: 'World',
        },
      },
      defaultDataModel: 'someModel',
    });
  });
});
