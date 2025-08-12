import type { ButtonSize, ButtonStyle, ButtonState } from "./Button.types.ts";
import clsx from "clsx";

export default function getButtonStyle(
    size: ButtonSize,
    style: ButtonStyle,
    state: ButtonState
) {
    const baseClasses = "w-auto flex justify-center items-center transition-colors duration-300 rounded-md font-semibold select-none";

    const sizeClasses = {
        sm: "px-3 py-2 gap-1 text-sm",
        md: "px-4 py-2 gap-1 text-base",
        lg: "px-5 py-3 gap-2 text-lg",
        xl: "px-6 py-4 gap-2 text-2xl",
    };

    const iconSizeClasses = {
        sm: 14,
        md: 18,
        lg: 22,
        xl: 24,
    };

    const styleClasses = {
        primary:
            "bg-blue-600 text-white hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50 shadow-md",
        secondary:
            "bg-transparent text-blue-600 border border-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50",
        ghost:
            "bg-transparent text-white hover:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50",
    };

    const stateClasses = {
        enabled: clsx("cursor-pointer opacity-100"),
        disabled: "cursor-not-allowed opacity-50 pointer-events-none",
    };

    const buttonStyle = clsx(
        baseClasses,
        sizeClasses[size],
        styleClasses[style],
        stateClasses[state]
    );
    const iconSize = iconSizeClasses[size];

    return { buttonStyle, iconSize };
}
