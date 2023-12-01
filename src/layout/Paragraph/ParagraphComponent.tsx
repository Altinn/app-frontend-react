import React from 'react';

import { Grid, Typography } from '@material-ui/core';

import { HelpTextContainer } from 'src/components/form/HelpTextContainer';
import { Lang } from 'src/features/language/Lang';
import { useLanguage } from 'src/features/language/useLanguage';
import type { PropsFromGenericComponent } from 'src/layout';

export type IParagraphProps = PropsFromGenericComponent<'Paragraph'>;

export function ParagraphComponent({ node }: IParagraphProps) {
  const { id, textResourceBindings } = node.item;
  const { langAsString } = useLanguage();
  return (
    <Grid
      container={true}
      direction='row'
      alignItems='center'
      spacing={1}
    >
      <Grid item={true}>
        <Typography
          component={'div'}
          id={id}
          data-testid={`paragraph-component-${id}`}
        >
          <Lang id={textResourceBindings?.title} />
        </Typography>
      </Grid>
      {textResourceBindings?.help && (
        <Grid item={true}>
          <HelpTextContainer
            helpText={<Lang id={textResourceBindings.help} />}
            title={langAsString(textResourceBindings?.title)}
          />
        </Grid>
      )}
    </Grid>
  );
}
