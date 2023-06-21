type FeatureToggle = 'doNotPromptForPartyPreference' | 'useNewFormDataHook';
export type IFeatureToggles = { [key in FeatureToggle]: boolean };

export const featureToggles: IFeatureToggles = {
  doNotPromptForPartyPreference: window.featureToggles?.doNotPromptForPartyPreference ?? false,
  useNewFormDataHook: window.featureToggles?.useNewFormDataHook ?? false,
};

window.featureToggles = featureToggles;
