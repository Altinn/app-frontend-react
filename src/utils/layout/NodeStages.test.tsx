import React from 'react';

import { render, waitFor } from '@testing-library/react';

import { NodeStages, NodeStagesProvider } from 'src/utils/layout/NodeStages';

interface Props {
  logger: (...args: any[]) => void;
}

describe('NodeStages', () => {
  function TestComponent1({ logger }: Props) {
    NodeStages.MarkHidden.useEffect(() => {
      logger('useEffect in stage2');
    }, []);

    NodeStages.AddNodes.useEffect(() => {
      logger('useEffect in stage1');
    }, []);

    return null;
  }

  it('should run hooks in the correct order', async () => {
    const logger = jest.fn();
    render(
      <NodeStagesProvider>
        <TestComponent1 logger={logger} />
      </NodeStagesProvider>,
    );
    await waitFor(() => expect(logger).toHaveBeenCalledTimes(2));
    expect(logger).toHaveBeenNthCalledWith(1, 'useEffect in stage1');
    expect(logger).toHaveBeenNthCalledWith(2, 'useEffect in stage2');
  });

  function TestComponentParent({ logger }: Props) {
    NodeStages.AddNodes.useEffect(() => {
      logger('useEffect in stage1 in parent');
    }, []);

    NodeStages.MarkHidden.useEffect(() => {
      logger('useEffect in stage2 in parent');
    }, []);

    NodeStages.AddNodes.useOnDone(() => {
      logger('stage1 now done');
    });

    return <TestComponent1 logger={logger} />;
  }

  it('should run callback when done', async () => {
    const logger = jest.fn();
    render(
      <NodeStagesProvider>
        <TestComponentParent logger={logger} />
      </NodeStagesProvider>,
    );
    await waitFor(() => expect(logger).toHaveBeenCalledTimes(5));
    expect(logger).toHaveBeenNthCalledWith(1, 'useEffect in stage1');
    expect(logger).toHaveBeenNthCalledWith(2, 'useEffect in stage1 in parent');
    expect(logger).toHaveBeenNthCalledWith(3, 'stage1 now done');
    expect(logger).toHaveBeenNthCalledWith(4, 'useEffect in stage2');
    expect(logger).toHaveBeenNthCalledWith(5, 'useEffect in stage2 in parent');
  });
});
