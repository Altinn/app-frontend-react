import React from 'react';
import {IComponentProps} from "src/components";


export const PrintButtonComponent = ({textResourceBindings, getTextResource}: IComponentProps) => {
  return (
    <button onClick={() => window.print()}>
      {getTextResource(textResourceBindings.text)}
    </button>)
}
