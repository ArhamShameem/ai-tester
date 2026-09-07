export interface HeadingInfo {
  level: number;
  text: string;
}

export interface LinkInfo {
  text: string;
  href: string;
  isExternal: boolean;
}

export interface ButtonInfo {
  text: string;
  ariaLabel?: string;
  type?: string;
  id?: string;
  role?: string;
  testId?: string;
}

export interface InputInfo {
  type: string;
  name?: string;
  placeholder?: string;
  ariaLabel?: string;
  label?: string;
  required: boolean;
  id?: string;
  testId?: string;
}

export interface FormInfo {
  id?: string;
  name?: string;
  action?: string;
  method?: string;
  inputsCount: number;
  inputNames: string[];
}

export interface SelectOption {
  value: string;
  text: string;
}

export interface SelectInfo {
  name?: string;
  id?: string;
  label?: string;
  options: SelectOption[];
}

export interface CheckboxRadioInfo {
  type: "checkbox" | "radio";
  name?: string;
  id?: string;
  label?: string;
  checked: boolean;
}

export interface NavigationItem {
  text: string;
  href: string;
}

export interface StructuredAnalysis {
  url: string;
  title: string;
  description?: string;
  headings: HeadingInfo[];
  links: LinkInfo[];
  discoveredRoutes: string[];
  buttons: ButtonInfo[];
  inputs: InputInfo[];
  forms: FormInfo[];
  selects: SelectInfo[];
  checkboxes: CheckboxRadioInfo[];
  radioButtons: CheckboxRadioInfo[];
  navigation: NavigationItem[];
  visibleTextSummary: string;
  scannedAt: string;
}
