import * as React from 'react';

import { InstantiationButton } from 'src/components/base/ButtonComponent/InstantiationButton';
import type { IInstantiationButtonProps } from 'src/components/base/ButtonComponent/InstantiationButton';

const btnGroupStyle = {
  marginTop: '3.6rem',
  marginBottom: '0',
};

const rowStyle = {
  marginLeft: '0',
};

export function InstantiationButtonComponent({
  text,
  ...props
}: IInstantiationButtonProps) {
  return (
    <div className='container pl-0'>
      <div
        className='a-btn-group'
        style={btnGroupStyle}
      >
        <div
          className='row'
          style={rowStyle}
        >
          <div className='pl-0 a-btn-sm-fullwidth'>
            <InstantiationButton {...props}>{text}</InstantiationButton>
          </div>
        </div>
      </div>
    </div>
  );
}
