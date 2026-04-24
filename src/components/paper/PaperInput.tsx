"use client";

import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const fieldStyle: React.CSSProperties = {
  background: "var(--paper-input-bg)",
  border: "1.5px solid var(--paper-input-border)",
  color: "var(--paper-text-1)",
  fontFamily: "var(--font-caveat), 'Caveat', cursive",
  fontSize: 17,
  padding: "8px 12px",
  borderRadius: 5,
  width: "100%",
  outline: "none",
  transition: "border-color 0.15s",
};

const focusStyle: React.CSSProperties = {
  borderColor: "var(--paper-accent)",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 17,
  fontWeight: 600,
  color: "var(--paper-text-2)",
  marginBottom: 6,
};

export const PaperInput = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = "", onFocus, onBlur, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          style={{ ...fieldStyle, ...(error ? { borderColor: "var(--paper-red)" } : {}) }}
          onFocus={(e) => {
            if (!error) Object.assign(e.currentTarget.style, focusStyle);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = "var(--paper-input-border)";
            onBlur?.(e);
          }}
          {...props}
        />
        {error && <p style={{ marginTop: 4, fontSize: 17, color: "var(--paper-red)" }}>{error}</p>}
      </div>
    );
  }
);
PaperInput.displayName = "PaperInput";

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const PaperTextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, id, className = "", onFocus, onBlur, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          style={{ ...fieldStyle, ...(error ? { borderColor: "var(--paper-red)" } : {}), fontFamily: "var(--font-caveat), 'Caveat', cursive" }}
          onFocus={(e) => {
            if (!error) Object.assign(e.currentTarget.style, focusStyle);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            if (!error) e.currentTarget.style.borderColor = "var(--paper-input-border)";
            onBlur?.(e);
          }}
          {...props}
        />
        {error && <p style={{ marginTop: 4, fontSize: 17, color: "var(--paper-red)" }}>{error}</p>}
      </div>
    );
  }
);
PaperTextArea.displayName = "PaperTextArea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const PaperSelect = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, className = "", ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className={className}>
        {label && (
          <label htmlFor={inputId} style={labelStyle}>
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          style={{ ...fieldStyle, ...(error ? { borderColor: "var(--paper-red)" } : {}) }}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p style={{ marginTop: 4, fontSize: 17, color: "var(--paper-red)" }}>{error}</p>}
      </div>
    );
  }
);
PaperSelect.displayName = "PaperSelect";
