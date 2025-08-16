import React from "react";
import type { ButtonProps } from "./Button.types";
import getButtonStyle from "./Button.styles";

export default function Button({
                                   style = "primary",
                                   size = "md",
                                   state = "enabled",
                                   label,
                                   icon,
                                   iconPosition = "left",
                                   onClick,
                                   type = "button",
                               }: ButtonProps) {
    const { buttonStyle, iconSize } = getButtonStyle(size, style, state);
    const isDisabled = state === "disabled";

    const renderIcon = () => {
        if (!icon) return null;
        if (React.isValidElement(icon)) return icon;
        return React.createElement(icon as any, { size: iconSize });
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={buttonStyle}
            disabled={isDisabled}
        >
            {iconPosition === "left" && renderIcon()}
            {iconPosition !== "alone" && label}
            {iconPosition === "right" && renderIcon()}
            {iconPosition === "alone" && renderIcon()}
        </button>
    );
}
