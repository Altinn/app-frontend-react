import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import type { PropsFromGenericComponent } from '..';

import { ButtonGroupComponent } from 'src/layout/ButtonGroup/ButtonGroupComponent';
import { ButtonGroupDef } from 'src/layout/ButtonGroup/config.def.generated';
import type { ChildClaimerProps } from 'src/layout/LayoutComponent';

export class ButtonGroup extends ButtonGroupDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'ButtonGroup'>>(
    function LayoutComponentButtonGroupRender(props, _): JSX.Element | null {
      return <ButtonGroupComponent {...props} />;
    },
  );

  shouldRenderInAutomaticPDF() {
    return false;
  }

  renderSummary(): JSX.Element | null {
    return null;
  }

  extraNodeGeneratorChildren(): string {
    return `<GenerateNodeChildren claims={props.childClaims} pluginKey='NonRepeatingChildrenPlugin/children' />`;
  }

  claimChildren({ item, claimChild, getType, getCapabilities }: ChildClaimerProps<'ButtonGroup'>): void {
    for (const id of item.children || []) {
      const type = getType(id);
      if (!type) {
        continue;
      }
      const capabilities = getCapabilities(type);
      if (!capabilities.renderInButtonGroup) {
        window.logWarn(
          `ButtonGroup component included a component '${id}', which ` +
            `is a '${type}' and cannot be rendered in an ButtonGroup.`,
        );
        continue;
      }
      claimChild('NonRepeatingChildrenPlugin/children', id);
    }
  }
}
