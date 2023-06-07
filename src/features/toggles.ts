import type { IAltinnWindow } from 'src/types';

type FeatureToggle = 'UseDoNotPromptForPartyPreference';
export type IFeatureToggles = { [key in FeatureToggle]?: boolean };

const altinnWindow = window as Window as IAltinnWindow;

const featureToggles: IFeatureToggles = {
  UseDoNotPromptForPartyPreference: altinnWindow.featureToggles?.UseDoNotPromptForPartyPreference ?? false,
};

altinnWindow.featureToggles = featureToggles;
