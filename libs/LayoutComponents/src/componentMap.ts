import { ComponentMap } from 'libs/FormEngineReact';
import { 
  InputComponent, 
  TextComponent,
  HeaderComponent,
  CheckboxesComponent,
  RepeatingGroupComponent,
  SummaryComponent
} from './components';

export const defaultComponentMap: ComponentMap = {
  Input: InputComponent,
  Text: TextComponent,
  Header: HeaderComponent,
  Checkboxes: CheckboxesComponent,
  RepeatingGroup: RepeatingGroupComponent,
  Summary2: SummaryComponent,
};