import { ContainerComponent } from 'src/layout/LayoutComponent';
import type { PropsFromGenericComponent } from 'src/layout';
import type { SummaryRendererProps } from 'src/layout/LayoutComponent';
import type { LayoutNodeFromType } from 'src/utils/layout/hierarchy.types';

export class Grid extends ContainerComponent<'Grid'> {
  render(_props: PropsFromGenericComponent<'Grid'>): JSX.Element | null {
    // TODO: Render the Grid
    return null;
  }

  renderSummary(_props: SummaryRendererProps<'Grid'>): JSX.Element | null {
    // PRIORITY: Implement
    return null;
  }

  useDisplayData(_node: LayoutNodeFromType<'Grid'>): string {
    // PRIORITY: Implement
    return '';
  }
}
