import { useEffect, useState } from 'react';

export const useDisplayData = ({ formData }: any) => {
  const [displayData, setDisplayData] = useState('');
  useEffect(() => {
    if (formData && typeof formData === 'object') {
      let displayString = '';
      Object.keys(formData).forEach((key, index) => {
        displayString += `${index > 0 ? ' ' : ''}${formData[key]}`;
      });
      setDisplayData(displayString);
    } else {
      setDisplayData(formData);
    }
  }, [formData, setDisplayData]);
  return displayData;
};
