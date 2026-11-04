export interface StepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
  disabled?: boolean;
  decreaseLabel?: string;
  increaseLabel?: string;
}
