import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
}

export default function Button({
  children,
  loading = false,
  loadingText = "Carregando...",
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={loading || disabled}
      className={`
        h-11
        rounded-lg
        bg-[red]
        text-white
        font-medium
        transition
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {loading ? loadingText : children}
    </button>
  );
}
