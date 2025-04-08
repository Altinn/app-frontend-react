import { API_CLIENT, APP, ORG } from 'src/next/app/App/App';
import { layoutStore } from 'src/next/stores/layoutStore';
import { initialStateStore } from 'src/next/stores/settingsStore';
import { textResourceStore } from 'src/next/stores/textResourceStore';

// @ts-ignore
const xsrfCookie = document.cookie
  .split('; ')
  .find((row) => row.startsWith('XSRF-TOKEN='))
  .split('=')[1];
const headers = { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': xsrfCookie };

export async function initialLoader() {
  const { user, validParties, applicationMetadata } = initialStateStore.getState();

  const { layoutSetsConfig, setDataModelSchema } = layoutStore.getState();

  const dataModelNames = applicationMetadata.dataTypes
    .filter((dataType) => dataType.allowedContentTypes?.includes('application/xml'))
    .map((dataType) => dataType.id);

  const dataModelSchemaFetches = dataModelNames.map((name) => API_CLIENT.org.jsonschemaDetail(name, ORG, APP));

  const dataModelSchemaResponses = await Promise.all(dataModelSchemaFetches);

  const schemaData = await Promise.all(dataModelSchemaResponses.map(async (res) => await res.json()));

  schemaData.forEach((data, idx) => setDataModelSchema(dataModelNames[idx], data));

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

  if (!layoutSetsConfig) {
    const res = await API_CLIENT.org.layoutsetsDetail(ORG, APP);
    const data = await res.json();
    layoutStore.getState().setLayoutSets(data);
  }

  if (user.profileSettingPreference.language) {
    const res = await API_CLIENT.org.v1TextsDetail(ORG, APP, user.profileSettingPreference.language);
    const data = await res.json();
    textResourceStore.setState({ textResource: data });
  }

  return { instanceId };
}
