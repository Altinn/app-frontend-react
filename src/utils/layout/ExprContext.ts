import React from 'react';

import type { LayoutRootNodeCollection } from 'src/utils/layout/hierarchy';

export const ExprContext = React.createContext<LayoutRootNodeCollection<'resolved'>>(undefined as any);
