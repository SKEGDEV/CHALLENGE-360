export interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (hex: string) => void;
}
