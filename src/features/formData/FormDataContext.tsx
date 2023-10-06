import React from 'react';

import { Loader } from 'src/features/isLoading/Loader';
import { useFormDataQuery } from 'src/hooks/queries/useFormDataQuery';
import { createLaxContext } from 'src/utils/createContext';

const { Provider } = createLaxContext<undefined>(undefined);

export const FormDataProvider = ({ children }) => {
  const { isFetching: isFormDataFetching } = useFormDataQuery();

  if (isFormDataFetching) {
    return <Loader />;
  }

  return <Provider value={undefined}>{children}</Provider>;
};
