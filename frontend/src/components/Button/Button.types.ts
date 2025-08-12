import type {LucideIcon} from "lucide-react";
import type {ReactNode} from "react";

export type ButtonStyle = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonIconPosition = 'left' | 'right' | 'alone';
export type ButtonState = 'enabled' | 'disabled';

export interface ButtonProps {
    label?: ReactNode;
    style?: ButtonStyle;
    icon?: LucideIcon;
    iconPosition?: ButtonIconPosition;
    size?: ButtonSize;
    state?: ButtonState;
    onClick?: () => void;
}
