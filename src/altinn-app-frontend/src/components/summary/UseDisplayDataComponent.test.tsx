import * as React from 'react';
import { render } from '@testing-library/react';

import {useDisplayData} from 'src/components/hooks';
interface componentProps {
  formData: any;
  setDisplayData: (v: any) => void;
}
function ComponentWithHook({ setDisplayData, formData }: componentProps) {
  setDisplayData(useDisplayData({formData}))
  return <></>;
}
describe('ComponentWithHook', () => {
  test('should change the displayData when formData is changed', async () => {
    let displayData = null;
    const setDisplayData = v => displayData = v;
    render(
      <ComponentWithHook
        formData={null}
        setDisplayData={setDisplayData}
      />,
    );
    expect(displayData).toBeNull();
    render(
      <ComponentWithHook
        formData={{ value: 'some value in an object' }}
        setDisplayData={setDisplayData}
      />,
    );
    expect(displayData).toBe('some value in an object');
    render(
      <ComponentWithHook
        formData={['values', 'in', 'an', 'array']}
        setDisplayData={setDisplayData}
      />,
    );
    expect(displayData).toBe('values in an array');
    render(
      <ComponentWithHook
        formData={'single value'}
        setDisplayData={setDisplayData}
      />,
    );
    expect(displayData).toBe('single value');
  });
});
