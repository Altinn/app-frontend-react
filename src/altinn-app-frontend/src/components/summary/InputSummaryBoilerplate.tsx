import * as React from 'react';

interface BoilerplateProps extends React.PropsWithChildren<any> {
  formData: any;
  setDisplayData: (v: any) => void;
}

export default function InputSummaryBoilerplate({ setDisplayData, formData, children }: BoilerplateProps) {
  React.useEffect(() => {
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
  return <>{children}</>;
}
