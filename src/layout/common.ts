/**
 * This enum is used to distinguish purely presentational components
 * from interactive form components that can have formData etc.
 */
export enum ComponentCategory {
  Presentation = 'presentation',
  Form = 'form',
  Action = 'action',
  Container = 'container',
}
