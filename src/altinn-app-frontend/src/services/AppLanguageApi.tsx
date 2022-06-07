import { appApi } from 'src/services/AppApi';
import { IAppLanguage } from 'altinn-shared/types';

export const appLanguageApi = appApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppLanguage: builder.mutation<IAppLanguage[], void>({
      query: () => ({
        url: '/api/v1/applicationlanguages',
        method: 'GET'
      }),
    })
  }),
});

export const { useGetAppLanguageMutation } = appLanguageApi;
