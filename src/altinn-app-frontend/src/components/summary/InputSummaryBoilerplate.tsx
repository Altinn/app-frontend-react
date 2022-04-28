import * as React from 'react';
import {useDisplayData} from '../hooks';

interface BoilerplateProps extends React.PropsWithChildren<any> {
  formData: any;
  setDisplayData: (v: any) => void;
}

export default function InputSummaryBoilerplate({ setDisplayData, formData, children }: BoilerplateProps) {
  setDisplayData(useDisplayData({formData}))
  return <>{children}</>;
}
