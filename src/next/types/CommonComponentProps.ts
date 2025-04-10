export interface CommonProps {
  onChange: (nextValue: string) => void;
  currentValue?: string;
  label: string | undefined;
  required?: boolean;
  options?: Record<string, any>;
  pageOrder?: string[];
}
