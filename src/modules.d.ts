declare module '*.png';

declare module '*.module.css' {
  const styles: { [className: string]: string };
  export = styles;
}

declare module 'ajv-formats-draft2019' {
  import type Ajv from 'ajv/dist/core';
  function addAdditionalFormats(ajv: Ajv): void;
  export = addAdditionalFormats;
}
