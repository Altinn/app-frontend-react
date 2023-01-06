import { useEffect, useState } from 'react';

import { useAppSelector } from 'src/common/hooks';
import { getLanguageFromKey } from 'src/language/sharedLanguage';
import type { IFormDataState } from 'src/features/form/data';

export const useDisplayData = ({ formData }: Partial<IFormDataState> | { formData: string | string[] }) => {
  const [displayData, setDisplayData] = useState('');
  const language = useAppSelector((state) => state.language.language);
  useEffect(() => {
    const emptyString = getLanguageFromKey('general.empty_summary', language || {});

    if (formData && typeof formData === 'object') {
      let displayString = '';
      Object.keys(formData).forEach((key, index) => {
        displayString += `${index > 0 ? ' ' : ''}${formData[key]}`;
      });
      setDisplayData(displayString.trim().length > 0 ? displayString : emptyString);
    } else {
      setDisplayData(formData || emptyString);
    }
  }, [formData, setDisplayData, language]);
  return displayData;
};
