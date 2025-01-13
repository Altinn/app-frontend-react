import React from 'react';
import type { JSX, PropsWithChildren, ReactElement } from 'react';

import { Fieldset as DesignsystemetFieldset, Label as DesignsystemetLabel } from '@digdir/designsystemet-react';
import cn from 'classnames';
import type { LabelProps as DesignsystemetLabelProps } from '@digdir/designsystemet-react';

import { Flex } from 'src/app-components/Flex/Flex';
import labelClasses from 'src/app-components/Label/Label.module.css';
import type { IGridStyling } from 'src/layout/common.generated';

export type FieldsetProps = {
  id?: string;
  legend: string | ReactElement | undefined;
  legendSize?: Extract<DesignsystemetLabelProps['size'], 'sm' | 'md' | 'lg' | 'xl'>;
  className?: string;
  grid?: IGridStyling;
  optionalIndicator?: ReactElement;
  help?: ReactElement;
  description?: ReactElement;
  required?: boolean;
  requiredIndicator?: JSX.Element;
  style?: DesignsystemetLabelProps['style'];
  size?: Extract<DesignsystemetLabelProps['size'], 'sm' | 'md' | 'lg' | 'xl'>;
};

export function Fieldset({
  id,
  children,
  className,
  legend,
  legendSize = 'md',
  grid,
  style,
  help,
  description,
  required,
  requiredIndicator,
  size = 'md',
  optionalIndicator,
}: PropsWithChildren<FieldsetProps>) {
  if (!legend) {
    return (
      <Flex
        id={id}
        container
        spacing={2}
      >
        <Flex
          item
          size={grid ?? { xs: 12 }}
          className={className}
        >
          {children}
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex
      id={id}
      container
      spacing={2}
    >
      <Flex
        item
        size={grid ?? { xs: 12 }}
      >
        <DesignsystemetFieldset
          className={cn(className)}
          size={size}
          legend={
            <span className={cn(labelClasses.labelAndHelpWrapper)}>
              <DesignsystemetLabel
                weight='medium'
                size={legendSize}
                style={style}
                asChild
              >
                <span>
                  {legend}
                  {required && requiredIndicator}
                  {!required && optionalIndicator}
                </span>
              </DesignsystemetLabel>
              {help}
            </span>
          }
          // FIXME: find a way to use classnames for setting font size. Not working currently
          description={description}
        >
          {children}
        </DesignsystemetFieldset>
      </Flex>
    </Flex>
  );
}
