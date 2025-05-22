import { initReactI18next } from 'react-i18next';

import i18n from 'i18next';
import Backend from 'i18next-http-backend';
import { z } from 'zod';
import type { HttpBackendOptions } from 'i18next-http-backend';

import { en } from 'src/language/texts/en';
import { nb } from 'src/language/texts/nb';
import { nn } from 'src/language/texts/nn';

const resources = {
  en: {
    translation: en(),
  },
  nb: {
    translation: nb(),
  },
  nn: {
    translation: nn(),
  },
};

export const variableSchema = z.object({
  key: z.literal('instanceContext').or(z.literal('applicationSettings')).or(z.custom<`dataModel.${string}`>()),
  dataSource: z.string(),
  defaultValue: z.string().nullish(),
});

export type Variable = z.infer<typeof variableSchema>;

const resourceSchema = z.object({
  id: z.string(),
  value: z.string(),
  variables: z.array(variableSchema).nullable(),
});

const backendResponseSchema = z
  .object({
    id: z.string(),
    org: z.string(),
    language: z.string(),
    resources: z.array(resourceSchema),
  })
  .transform((data) => {
    const { resources, ...rest } = data;

    const transformedData: Record<string, { value: string; variables: Variable[] | null }> = {};

    resources.forEach((item) => {
      const { id, ...rest } = item;
      transformedData[id] = rest;
    });

    return { ...rest, translation: transformedData };
  });

type BackendResponse = z.infer<typeof backendResponseSchema>;
export type ResolvedValue = BackendResponse['translation'][keyof BackendResponse['translation']];

// eslint-disable-next-line import/no-named-as-default-member
i18n
  .use(initReactI18next)
  .use(Backend)
  .init<HttpBackendOptions>({
    // resources,
    load: 'languageOnly',
    lng: 'nb', // default language
    fallbackLng: 'nb',
    partialBundledLanguages: true,
    returnObjects: true,
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    backend: {
      loadPath: () => {
        const [_, org, app] = window.location.pathname.split('/');
        return `/${org}/${app}/api/v1/texts/{{lng}}`;
      },
      // Transform the response data format
      parse: (data, _languages, _namespaces) => {
        const parseResult = backendResponseSchema.safeParse(JSON.parse(data));

        if (!parseResult.success) {
          console.error('Failed to parse backend response:', parseResult.error);
          return {};
        }

        const parsedData = parseResult.data;
        // Get local translations based on language
        const localTranslation =
          parsedData.language === 'en'
            ? resources.en.translation
            : parsedData.language === 'nn'
              ? resources.nn.translation
              : resources.nb.translation;

        return {
          ...localTranslation,
          ...parsedData.translation,
        };
      },
    },
    debug: process.env.NODE_ENV !== 'production',
  });

// eslint-disable-next-line import/no-default-export
export default i18n;
