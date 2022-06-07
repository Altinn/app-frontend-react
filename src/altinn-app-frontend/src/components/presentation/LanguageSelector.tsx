import { getTextFromAppOrDefault } from 'src/utils/textResource';
import { AltinnSpinner, Select } from 'altinn-shared/components';
import { Box } from '@material-ui/core';
import * as React from 'react';
import { useAppSelector } from 'src/common/hooks';
import TextResourcesActions from 'src/shared/resources/textResources/textResourcesActions';
import optionsActions from 'src/shared/resources/options/optionsActions';
import { useGetAppLanguageMutation } from 'src/services/AppLanguageApi';
import { LanguageActions } from 'src/shared/resources/language/languageSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export const LanguageSelector = () => {
  const language = useAppSelector(state => state.language.language || {});
  const [getAppLanguage, {isSuccess, data, isLoading}] = useGetAppLanguageMutation();
  const selectedAppLanguage = useAppSelector(
    (state) => state.language.selectedAppLanguage,
  );

  useEffect(()=>{
    getAppLanguage()
  },[getAppLanguage])

  const textResources = useAppSelector(state => state.textResources.resources);
  const dispatch = useDispatch()
  const handleAppLanguageChange = (languageCode: string) => {
    dispatch(LanguageActions.updateSelectedAppLanguage({ selected: languageCode }))
    TextResourcesActions.fetchTextResources();
    optionsActions.fetchOptions();
  };


  return <Box display='flex' flexDirection='column' className='mb-1'>
    {isLoading && <AltinnSpinner/>}
    {isSuccess && <>
      <label className='a-form-label' htmlFor='app-language-select'>
        {getTextFromAppOrDefault(
          'language.selector.label',
          textResources,
          language,
          null,
          true,
        )}
      </label>
      <Select
        options={data.map((l) => ({
          value: l.language,
          label: getTextFromAppOrDefault(
            'language.full_name.' + l.language,
            textResources,
            language,
            null,
            true,
          ),
        }))}
        onChange={(ev) => handleAppLanguageChange(ev.target.value)}
        value={selectedAppLanguage}
        id='app-language-select'
      />
    </>}
  </Box>
};
