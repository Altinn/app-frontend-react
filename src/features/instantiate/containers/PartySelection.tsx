import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useMatch } from 'react-router-dom';

import { LegacyCheckbox } from '@digdir/design-system-react';
import { Heading, Paragraph } from '@digdir/designsystemet-react';
import { PlusIcon } from '@navikt/aksel-icons';

import { Button } from 'src/app-components/Button/Button';
import { Flex } from 'src/app-components/Flex/Flex';
import { Input } from 'src/app-components/Input/Input';
import { AltinnParty } from 'src/components/altinnParty';
import { useAppName, useAppOwner } from 'src/core/texts/appTexts';
import { useApplicationMetadata } from 'src/features/applicationMetadata/ApplicationMetadataProvider';
import { InstantiationContainer } from 'src/features/instantiate/containers/InstantiationContainer';
import classes from 'src/features/instantiate/containers/PartySelection.module.css';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import {
  useCurrentParty,
  useParties,
  useSetCurrentParty,
  useSetHasSelectedParty,
} from 'src/features/party/PartiesProvider';
import { useNavigate } from 'src/features/routing/AppRoutingContext';
import { AltinnPalette } from 'src/theme/altinnAppTheme';
import { changeBodyBackground } from 'src/utils/bodyStyling';
import { getPageTitle } from 'src/utils/getPageTitle';
import { HttpStatusCodes } from 'src/utils/network/networking';
import { capitalizeName } from 'src/utils/stringHelper';
import type { IParty } from 'src/types/shared';

export const PartySelection = () => {
  changeBodyBackground(AltinnPalette.white);
  const match = useMatch(`/party-selection/:errorCode`);
  const errorCode = match?.params.errorCode;

  const selectParty = useSetCurrentParty();
  const selectedParty = useCurrentParty();
  const setUserHasSelectedParty = useSetHasSelectedParty();

  const parties = useParties() ?? [];
  const appMetadata = useApplicationMetadata();

  const appPromptForPartyOverride = appMetadata.promptForParty;
  const { langAsString } = useLanguage();

  const [filterString, setFilterString] = React.useState('');
  const [numberOfPartiesShown, setNumberOfPartiesShown] = React.useState(4);
  const [showSubUnits, setShowSubUnits] = React.useState(true);
  const [showDeleted, setShowDeleted] = React.useState(false);
  const navigate = useNavigate();

  const appName = useAppName();
  const appOwner = useAppOwner();

  const onSelectParty = async (party: IParty) => {
    await selectParty(party);
    setUserHasSelectedParty(true);
    navigate('/');
  };

  const filteredParties = parties
    .filter(
      (party) => party.name.toUpperCase().includes(filterString.toUpperCase()) && !(party.isDeleted && !showDeleted),
    )
    .slice(0, numberOfPartiesShown);

  const hasMoreParties = filteredParties.length < parties.length;

  function renderParties() {
    return (
      <>
        {filteredParties.map((party, index) => (
          <AltinnParty
            key={index}
            party={party}
            onSelectParty={onSelectParty}
            showSubUnits={showSubUnits}
          />
        ))}
        {hasMoreParties ? (
          <Flex
            container
            direction='row'
          >
            <Button
              variant='secondary'
              onClick={() => setNumberOfPartiesShown(numberOfPartiesShown + 4)}
            >
              <PlusIcon
                fontSize='1rem'
                aria-hidden
              />
              <Lang id='party_selection.load_more' />
            </Button>
          </Flex>
        ) : null}
      </>
    );
  }

  function getRepresentedPartyName(): string {
    if (!selectedParty || selectedParty.name === null) {
      return '';
    }
    return capitalizeName(selectedParty.name);
  }

  function templateErrorMessage() {
    if (errorCode === '403') {
      return (
        <Paragraph
          data-testid={`error-code-${HttpStatusCodes.Forbidden}`}
          className={classes.error}
          id='party-selection-error'
        >
          {`${langAsString('party_selection.invalid_selection_first_part')} ${getRepresentedPartyName()}.
            ${langAsString('party_selection.invalid_selection_second_part')} ${templatePartyTypesString()}.
            ${langAsString('party_selection.invalid_selection_third_part')}`}
        </Paragraph>
      );
    }
  }

  function templatePartyTypesString() {
    /*
      This method we always return the strings in an order of:
      1. private person
      2. organisation
      3. sub unit
      4. bankruptcy state
    */
    const { partyTypesAllowed } = appMetadata ?? {};
    const partyTypes: string[] = [];

    let returnString = '';

    if (partyTypesAllowed?.person) {
      partyTypes.push(langAsString('party_selection.unit_type_private_person'));
    }
    if (partyTypesAllowed?.organisation) {
      partyTypes.push(langAsString('party_selection.unit_type_company'));
    }
    if (partyTypesAllowed?.subUnit) {
      partyTypes.push(langAsString('party_selection.unit_type_subunit'));
    }
    if (partyTypesAllowed?.bankruptcyEstate) {
      partyTypes.push(langAsString('party_selection.unit_type_bankruptcy_state'));
    }

    if (partyTypes.length === 1) {
      return partyTypes[0];
    }

    for (let i = 0; i < partyTypes.length; i++) {
      if (i === 0) {
        returnString += partyTypes[i];
      } else if (i === partyTypes.length - 1) {
        returnString += ` ${langAsString('party_selection.binding_word')} ${partyTypes[i]}`;
      } else {
        returnString += `, ${partyTypes[i]} `;
      }
    }

    return returnString;
  }

  const onFilterStringChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterString(event.target.value);
  };

  const toggleShowDeleted = () => {
    setShowDeleted(!showDeleted);
  };

  const toggleShowSubUnits = () => {
    setShowSubUnits(!showSubUnits);
  };

  return (
    <InstantiationContainer>
      <Helmet>
        <title>{`${getPageTitle(appName, langAsString('party_selection.header'), appOwner)}`}</title>
      </Helmet>
      <Flex
        container
        direction='row'
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Heading
          level={1}
          className={classes.title}
        >
          <Lang id='party_selection.header' />
        </Heading>
        {templateErrorMessage()}
      </Flex>
      <Flex
        container
        direction='column'
        className={classes.searchFieldContainer}
      >
        <Input
          size='md'
          aria-label={langAsString('party_selection.search_placeholder')}
          placeholder={langAsString('party_selection.search_placeholder')}
          onChange={onFilterStringChange}
          value={filterString}
          inputMode='search'
        />
      </Flex>
      <Flex
        container
        direction='column'
      >
        <Flex
          container
          justifyContent='space-between'
          direction='row'
        >
          <Flex item>
            <Paragraph className={classes.subTitle}>
              <Lang id='party_selection.subheader' />
            </Paragraph>
          </Flex>

          <Flex item>
            <Flex
              container
              direction='row'
            >
              <Flex
                item
                className={classes.checkbox}
              >
                <Flex
                  container
                  direction='row'
                >
                  <LegacyCheckbox
                    checked={showDeleted}
                    onChange={toggleShowDeleted}
                    label={<Lang id='party_selection.show_deleted' />}
                  />
                </Flex>
              </Flex>
              <Flex
                item
                className={classes.checkbox}
              >
                <Flex
                  container
                  direction='row'
                >
                  <LegacyCheckbox
                    checked={showSubUnits}
                    onChange={toggleShowSubUnits}
                    label={<Lang id='party_selection.show_sub_unit' />}
                  />
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        {renderParties()}
        {errorCode === 'explained' && (
          <Flex style={{ padding: 12 }}>
            <Heading
              level={2}
              size='medium'
              style={{ fontSize: '1.5rem', fontWeight: '500', marginBottom: 12 }}
            >
              <Lang id='party_selection.why_seeing_this' />
            </Heading>
            <Paragraph>
              <Lang
                id={
                  appPromptForPartyOverride === 'always'
                    ? 'party_selection.seeing_this_override'
                    : 'party_selection.seeing_this_preference'
                }
              />
            </Paragraph>
          </Flex>
        )}
      </Flex>
    </InstantiationContainer>
  );
};
