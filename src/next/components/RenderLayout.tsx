import React from 'react';

import type { CompExternal } from 'src/layout/layout';

interface RenderLayoutType {
  component: CompExternal;
}

const RenderLayout: React.FunctionComponent<RenderLayoutType> = ({ component }) => <div />;
