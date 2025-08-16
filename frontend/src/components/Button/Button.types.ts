import type { ReactNode, ComponentType } from "react";
import type {LucideIcon} from "lucide-react";

export type ButtonStyle = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonIconPosition = 'left' | 'right' | 'alone';
export type ButtonState = 'enabled' | 'disabled';
export type Type = 'button' | 'submit' | 'reset';

export interface ButtonProps {
    label?: ReactNode;
    style?: ButtonStyle;
    size?: ButtonSize;
    state?: ButtonState;
    icon?: ReactNode | ComponentType<any> | LucideIcon;
    iconPosition?: ButtonIconPosition;
    onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
    type?: Type;
}
