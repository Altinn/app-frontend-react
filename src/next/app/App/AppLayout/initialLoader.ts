import type { FormEngine } from 'libs/FormEngine';
import type { ApplicationMetadata as FormEngineApplicationMetadata } from 'libs/FormEngine/types';
import { API_CLIENT, APP, ORG } from 'src/next/app/App/App';
import { layoutStore } from 'src/next/stores/layoutStore';
import { initialStateStore } from 'src/next/stores/settingsStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';
import type { ApplicationMetadata as OldApplicationMetadata } from 'src/next/types/InitialState/InitialState';

/**
 * Recursively resolves any $ref entries in a JSON schema that point into $defs.
 * Returns a deep copy of the schema with references replaced by their definitions.
 */
export function resolveSchemaDefs(schema: any, root: any = schema): any {
  // If it's not an object or array, just return as is.
  if (typeof schema !== 'object' || schema === null) {
    return schema;
  }

  // If it's a direct reference to something in $defs, resolve it.
  if (schema.$ref && schema.$ref.startsWith('#/$defs/')) {
    const refName = schema.$ref.replace('#/$defs/', '');
    const definition = root.$defs?.[refName];

    if (!definition) {
      throw new Error(`Definition not found for reference: ${schema.$ref}`);
    }

    // Merge the referenced definition with the current node’s additional keys.
    // Then resolve recursively in case the definition itself has nested refs.
    const { $ref, ...rest } = schema;
    return resolveSchemaDefs({ ...definition, ...rest }, root);
  }

  // If it's an array, resolve each item.
  if (Array.isArray(schema)) {
    return schema.map((item) => resolveSchemaDefs(item, root));
  }

  // Otherwise, recursively resolve all object properties.
  const resolved: Record<string, any> = {};
  for (const key of Object.keys(schema)) {
    resolved[key] = resolveSchemaDefs(schema[key], root);
  }

  return resolved;
}

// @ts-ignore
const xsrfCookie = document.cookie
  .split('; ')
  .find((row) => row.startsWith('XSRF-TOKEN='))
  .split('=')[1];
const headers = { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfCookie };

/**
 * Converts old ApplicationMetadata type to FormEngine's expected type
 */
function convertApplicationMetadata(oldMetadata: OldApplicationMetadata): FormEngineApplicationMetadata {
  return {
    ...oldMetadata,
    dataTypes: oldMetadata.dataTypes.map(dataType => {
      // Convert individual data type, excluding problematic fields
      const { appLogic, allowedContributers, ...baseDataType } = dataType;
      return {
        ...baseDataType,
        // Convert appLogic if it exists, filtering out null values
        ...(appLogic && {
          appLogic: {
            autoCreate: appLogic.autoCreate ?? undefined,
            allowAnonymousOnStateless: appLogic.allowAnonymousOnStateless ?? undefined,
            classRef: appLogic.classRef ?? undefined,
            schemaRef: appLogic.schemaRef ?? undefined,
            disallowUserCreate: appLogic.disallowUserCreate ?? undefined,
          }
        }),
        // Keep allowedContributers as is (it should be compatible)
        allowedContributers,
      };
    }),
  };
}

export async function initialLoader(formEngine: FormEngine) {
  console.log('initialLoader: Starting with FormEngine instance');
  
  const { user, validParties, applicationMetadata } = initialStateStore.getState();

  const { layoutSetsConfig, setDataModelSchema } = layoutStore.getState();

  // Load and populate schemas in FormEngine
  const dataModelNames = applicationMetadata.dataTypes
    .filter((dataType) => dataType.allowedContentTypes?.includes('application/xml'))
    .map((dataType) => dataType.id);

  const dataModelSchemaFetches = dataModelNames.map((name) => API_CLIENT.org.jsonschemaDetail(name, ORG, APP));

  const dataModelSchemaResponses = await Promise.all(dataModelSchemaFetches);

  const schemaData = await Promise.all(dataModelSchemaResponses.map(async (res) => await res.json()));

  // Set schemas in both old store (for compatibility) and FormEngine
  const resolvedSchemas: Record<string, any> = {};
  schemaData.forEach((data, idx) => {
    const resolvedSchema = resolveSchemaDefs(data);
    const schemaName = dataModelNames[idx];
    
    // Old store
    setDataModelSchema(schemaName, resolvedSchema);
    
    // FormEngine
    formEngine.schema.setSchema(schemaName, resolvedSchema);
    resolvedSchemas[schemaName] = resolvedSchema;
  });

  console.log('initialLoader: Loaded schemas into FormEngine:', Object.keys(resolvedSchemas));

  // Set application metadata in FormEngine (convert from old type to new type)
  formEngine.application.initialize({
    applicationMetadata: convertApplicationMetadata(applicationMetadata),
    frontEndSettings: {},
    componentConfigs: {},
  });

  console.log('initialLoader: Set application metadata in FormEngine');

  const currentParty = validParties[0];

  if (!currentParty) {
    throw new Error('No valid parties');
  }

  const res = await API_CLIENT.org.activeDetail(ORG, APP, currentParty.partyId);

  const instances = await res.json();
  let instanceId = '';

  if (instances.length > 0) {
    instanceId = instances[0].id;
  } else {
    const res = await API_CLIENT.org.instancesCreate(
      ORG,
      APP,
      {
        instanceOwnerPartyId: currentParty.partyId,
      },
      {
        headers,
      },
    );
    const data = await res.json();

    instanceId = data.id;
  }

  // Load layout sets configuration
  let layoutSetsConfigData = layoutSetsConfig;
  if (!layoutSetsConfigData) {
    const res = await API_CLIENT.org.layoutsetsDetail(ORG, APP);
    const data = await res.json();
    layoutStore.getState().setLayoutSets(data);
    layoutSetsConfigData = data;
  }

  // Set layout sets config in FormEngine (with minimal data for now)
  if (layoutSetsConfigData) {
    formEngine.layout.setLayoutData({
      layoutSetsConfig: layoutSetsConfigData,
      pageOrder: { pages: { order: [] } }, // Will be populated later
      layouts: {}, // Will be populated later
    });
    console.log('initialLoader: Set layout sets config in FormEngine');
  }

  const langRes = await API_CLIENT.org.v1TextsDetail(ORG, APP, user.profileSettingPreference.language ?? 'nb');
  const langData = await langRes.json();
  textResourceStore.setState({ textResource: langData });

  console.log('initialLoader: Progressive loading phase 1 complete - app metadata, schemas, and layout sets loaded');

  return { instanceId };
}
