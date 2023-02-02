import React from 'react';

import type { IFooterIcon } from 'src/features/footer/components/types';

interface FooterIconProps {
  icon: IFooterIcon;
}

export const FooterIcon = ({ icon }: FooterIconProps) => <span>This is an icon :P</span>;
