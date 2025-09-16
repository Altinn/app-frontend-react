import React, { useMemo } from 'react';
import { Navigate, Outlet, useLoaderData, useParams } from 'react-router-dom';

import { FormEngine } from 'libs/FormEngine';
import { FormEngineProvider } from 'libs/FormEngineReact';
import { defaultComponentMap } from 'libs/LayoutComponents';
import { useStore } from 'zustand/index';

import classes from 'src/next/app/App/AppLayout/AppLayout.module.css';
import { Header } from 'src/next/components/Header';
import { initialStateStore } from 'src/next/stores/settingsStore';

export interface LoaderData {
  instanceId: string;
}

export const AppLayout = () => {
  const params = useParams();
  const { validParties } = useStore(initialStateStore);
  const currentParty = validParties[0];

  const { instanceId } = useLoaderData() as LoaderData;
  if (!instanceId) {
    throw new Error('no instance ID');
  }

  if (!currentParty) {
    throw new Error('No valid parties');
  }

  // Create FormEngine instance
  const engine = useMemo(() => {
    const formEngine = new FormEngine();
    // TODO: Initialize with real layout and data when available
    formEngine.initialize({
      data: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        age: 30,
        address: {
          street: '123 Main St',
          city: 'Oslo',
          postalCode: '0150',
        },
      },
      dataModelSchemas: {
        person: {
          type: 'object',
          properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            age: { type: 'number', minimum: 0 },
          },
        },
      },
      layoutSetsConfig: {
        sets: [{ id: 'main', dataType: 'person', tasks: ['Task_1'] }],
      },
      pageOrder: {
        pages: {
          order: ['page1', 'page2'],
        },
      },
      layouts: {
        page1: {
          data: {
            layout: [
              {
                id: 'input1',
                type: 'Input',
                dataModelBindings: { simpleBinding: 'firstName' },
                textResourceBindings: { title: 'First Name' },
              },
              {
                id: 'input2',
                type: 'Input',
                dataModelBindings: { simpleBinding: 'lastName' },
                textResourceBindings: { title: 'Last Name' },
              },
            ],
          },
        },
        page2: {
          data: {
            layout: [
              {
                id: 'summary1',
                type: 'Summary2',
                target: { type: 'page', id: 'page1' },
              },
            ],
          },
        },
      },
      applicationMetadata: {
        id: 'test-app',
        org: 'test-org',
        title: { nb: 'Test Application' },
        dataTypes: [{ id: 'person', allowedContentTypes: ['application/xml'], maxCount: 1 }],
      },
      frontEndSettings: {},
      componentConfigs: {},
      user: { userId: 123, userName: 'Test User', partyId: currentParty.partyId },
      validParties: [
        {
          partyId: currentParty.partyId,
          partyUuid: currentParty.partyUuid || 'test-uuid',
          partyTypeName: currentParty.partyTypeName,
          name: currentParty.name,
          isDeleted: currentParty.isDeleted,
          orgNumber: currentParty.orgNumber,
          ssn: currentParty.ssn,
          unitType: currentParty.unitType,
          onlyHierarchyElementWithNoAccess: currentParty.onlyHierarchyElementWithNoAccess,
          person: currentParty.person as any,
          organization: currentParty.organization,
        },
      ],
    });
    return formEngine;
  }, [currentParty]);

  return (
    <FormEngineProvider
      engine={engine}
      componentMap={defaultComponentMap}
    >
      <div className={classes.container}>
        <Header />
        {!params.instanceGuid && instanceId && <Navigate to={`instance/${instanceId}`} />}
        <main className={classes.mainContent}>
          <section
            id='main-content'
            className={classes.mainSection}
            tabIndex={-1}
          >
            <div className={classes.contentPadding}>
              <Outlet />
            </div>
          </section>
        </main>
      </div>
    </FormEngineProvider>
  );
};
