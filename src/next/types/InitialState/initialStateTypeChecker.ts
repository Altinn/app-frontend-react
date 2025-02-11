import type {
  ApplicationMetadata,
  IApplicationSettings,
  IDataType,
  InitialState,
  IParty,
  IPartyTypesAllowed,
  IProfile,
  ITitle,
} from 'src/next/types/InitialState/InitialState';

const isString = (value: unknown): value is string => typeof value === 'string';
const isNumber = (value: unknown): value is number => typeof value === 'number';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
const isArray = <T>(value: unknown, checkFn: (item: unknown) => item is T, path: string): value is T[] => {
  if (!Array.isArray(value)) {
    console.error(`Validation Error: Expected ${path} to be an array, but got ${typeof value}`);
    return false;
  }
  return value.every((item, index) => checkFn(item));
};

const isTitle = (value: unknown): value is ITitle => {
  if (!isObject(value)) {
    console.error(`Validation Error: Expected title to be an object`);
    return false;
  }
  if (!Object.values(value).every(isString)) {
    console.error(`Validation Error: All values in title object should be strings`);
    return false;
  }
  return true;
};

const isIDataType = (value: unknown): value is IDataType => {
  if (!isObject(value)) {
    console.error(`Validation Error: Expected IDataType to be an object`);
    return false;
  }
  if (!isString(value.id)) {
    console.error(`Validation Error: IDataType.id must be a string`);
  }
  if (value.description !== null && !isString(value.description)) {
    console.error(`Validation Error: IDataType.description must be a string or null`);
  }
  if (
    value.allowedContentTypes !== null &&
    !isArray(value.allowedContentTypes, isString, 'IDataType.allowedContentTypes')
  ) {
    return false;
  }
  if (!isNumber(value.maxCount)) {
    console.error(`Validation Error: IDataType.maxCount must be a number`);
  }
  if (!isNumber(value.minCount)) {
    console.error(`Validation Error: IDataType.minCount must be a number`);
  }
  return true;
};

const isIPartyTypesAllowed = (value: unknown): value is IPartyTypesAllowed =>
  isObject(value) &&
  isBoolean(value.bankruptcyEstate) &&
  isBoolean(value.organisation) &&
  isBoolean(value.person) &&
  isBoolean(value.subUnit);

const isIApplicationSettings = (value: unknown): value is IApplicationSettings => {
  if (!isObject(value)) {
    console.error(`Validation Error: Expected IApplicationSettings to be an object`);
    return false;
  }
  if (!Object.values(value).every((val) => isString(val) || val === undefined)) {
    console.log(JSON.stringify(value, null, 2));
    console.error(`Validation Error: IApplicationSettings values must be strings or undefined`);

    return false;
  }
  return true;
};

const isIParty = (value: unknown): value is IParty => {
  if (!isObject(value)) {
    console.error(`Validation Error: Expected IParty to be an object`);
    return false;
  }
  if (!isNumber(value.partyId)) {
    console.error(`Validation Error: IParty.partyId must be a number`);
  }
  if (!isString(value.name)) {
    console.error(`Validation Error: IParty.name must be a string`);
  }
  if (!isBoolean(value.isDeleted)) {
    console.error(`Validation Error: IParty.isDeleted must be a boolean`);
  }
  return true;
};

const isIProfile = (value: unknown): value is IProfile => {
  if (!isObject(value)) {
    console.error(`Validation Error: Expected IProfile to be an object`);
    return false;
  }
  if (!isNumber(value.userId)) {
    console.error(`Validation Error: IProfile.userId must be a number`);
  }
  if (!isString(value.userName)) {
    console.error(`Validation Error: IProfile.userName must be a string`);
  }
  return true;
};

const isApplicationMetadata = (value: unknown): value is ApplicationMetadata => {
  if (!isObject(value)) {
    console.error(`Validation Error: Expected ApplicationMetadata to be an object`);
    return false;
  }
  if (!isString(value.id)) {
    console.error(`Validation Error: ApplicationMetadata.id must be a string`);
  }
  if (!isTitle(value.title)) {
    return false;
  }
  if (!isString(value.org)) {
    console.error(`Validation Error: ApplicationMetadata.org must be a string`);
  }
  if (!isIPartyTypesAllowed(value.partyTypesAllowed)) {
    return false;
  }
  if (!isArray(value.dataTypes, isIDataType, 'ApplicationMetadata.dataTypes')) {
    return false;
  }
  return true;
};

export const isInitialState = (value: unknown): value is InitialState => {
  if (!isObject(value)) {
    console.error(`Validation Error: InitialState must be an object`);
    return false;
  }
  if (!isApplicationMetadata(value.applicationMetadata)) {
    return false;
  }
  if (!isIApplicationSettings(value.frontEndSettings)) {
    return false;
  }
  if (!isIProfile(value.user)) {
    return false;
  }
  if (!isArray(value.validParties, isIParty, 'InitialState.validParties')) {
    return false;
  }
  return true;
};

// import type {
//   ApplicationMetadata,
//   IApplicationSettings,
//   IDataType,
//   InitialState,
//   IParty,
//   IPartyTypesAllowed,
//   IProfile,
//   ITitle,
// } from 'src/next/types/InitialState/InitialState';
//
// const isString = (value: unknown): value is string => typeof value === 'string';
// const isNumber = (value: unknown): value is number => typeof value === 'number';
// const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
// const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
// const isArray = <T>(value: unknown, checkFn: (item: unknown) => item is T): value is T[] =>
//   Array.isArray(value) && value.every(checkFn);
//
// const isTitle = (value: unknown): value is ITitle => isObject(value) && Object.values(value).every(isString);
//
// const isIDataType = (value: unknown): value is IDataType =>
//   isObject(value) &&
//   isString(value.id) &&
//   (value.description === null || isString(value.description)) &&
//   (value.allowedContentTypes === null || isArray(value.allowedContentTypes, isString)) &&
//   (value.allowedContributers === null || isArray(value.allowedContributers, isString)) &&
//   (value.appLogic === null || isObject(value.appLogic)) &&
//   (value.taskId === null || isString(value.taskId)) &&
//   (value.maxSize === null || isNumber(value.maxSize)) &&
//   isNumber(value.maxCount) &&
//   isNumber(value.minCount) &&
//   (value.grouping === null || isString(value.grouping));
//
// const isIPartyTypesAllowed = (value: unknown): value is IPartyTypesAllowed =>
//   isObject(value) &&
//   isBoolean(value.bankruptcyEstate) &&
//   isBoolean(value.organisation) &&
//   isBoolean(value.person) &&
//   isBoolean(value.subUnit);
//
// const isIApplicationSettings = (value: unknown): value is IApplicationSettings =>
//   isObject(value) && Object.values(value).every((val) => isString(val) || val === undefined);
//
// const isIParty = (value: unknown): value is IParty =>
//   isObject(value) &&
//   isNumber(value.partyId) &&
//   (value.partyUuid === null || isString(value.partyUuid)) &&
//   isString(value.partyTypeName) &&
//   (value.orgNumber === null || isString(value.orgNumber)) &&
//   (value.ssn === null || isString(value.ssn)) &&
//   (value.unitType === null || isString(value.unitType)) &&
//   isString(value.name) &&
//   isBoolean(value.isDeleted) &&
//   isBoolean(value.onlyHierarchyElementWithNoAccess) &&
//   (value.person === null || isObject(value.person)) &&
//   (value.organization === null || isObject(value.organization)) &&
//   (value.childParties === null || isArray(value.childParties, isIParty));
//
// const isIProfile = (value: unknown): value is IProfile =>
//   isObject(value) &&
//   isNumber(value.userId) &&
//   isString(value.userName) &&
//   isNumber(value.partyId) &&
//   isNumber(value.userType) &&
//   isObject(value.profileSettingPreference) &&
//   isIParty(value.party);
//
// const isApplicationMetadata = (value: unknown): value is ApplicationMetadata =>
//   isObject(value) &&
//   isString(value.id) &&
//   isTitle(value.title) &&
//   isString(value.org) &&
//   isIPartyTypesAllowed(value.partyTypesAllowed) &&
//   isArray(value.dataTypes, isIDataType) &&
//   isBoolean(value.autoDeleteOnProcessEnd) &&
//   (value.features === undefined || isObject(value.features)) &&
//   (value.promptForParty === undefined || isString(value.promptForParty)) &&
//   (value.externalApiIds === undefined || isArray(value.externalApiIds, isString)) &&
//   (value.isStatelessApp === undefined || isBoolean(value.isStatelessApp));
//
// export const isInitialState = (value: unknown): value is InitialState =>
//   isObject(value) &&
//   isApplicationMetadata(value.applicationMetadata) &&
//   isIApplicationSettings(value.frontEndSettings) &&
//   isIProfile(value.user) &&
//   isArray(value.validParties, isIParty);
