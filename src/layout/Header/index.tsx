import React, { forwardRef } from 'react';
import type { JSX } from 'react';

import { Heading } from '@digdir/designsystemet-react';

import { HeaderDef } from 'src/layout/Header/config.def.generated';
import { getHeaderProps, HeaderComponent } from 'src/layout/Header/HeaderComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { CompIntermediateExact } from 'src/layout/layout';
import type { Summary2Props } from 'src/layout/Summary2/SummaryComponent2/types';
import type { CommonProps } from 'src/next-prev/types/CommonComponentProps';

export type IHeaderProps = PropsFromGenericComponent<'Header'>;

export class Header extends HeaderDef {
  render = forwardRef<HTMLElement, PropsFromGenericComponent<'Header'>>(
    function LayoutComponentHeaderRender(props, _): JSX.Element | null {
      return <HeaderComponent {...props} />;
    },
  );

  renderSummary2(props: Summary2Props<'Header'>): JSX.Element | null {
    return (
      <HeaderComponent
        node={props.target}
        containerDivRef={React.createRef()}
      />
    );
  }

  renderNext(props: CompIntermediateExact<'Header'>, commonProps: CommonProps): React.JSX.Element | null {
    // debugger;
    // if (!commonProps.label) {
    //   debugger;
    // }

    return (
      <Heading
        id={props.id}
        {...getHeaderProps(props.size)}
      >
        {commonProps.label}
      </Heading>
    );
  }
}
