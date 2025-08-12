import { useEffect, useRef } from "react";

export function usePhoneNumericInput(
  onDigit: (d: number) => void,
  onBackspace: () => void
) {
  const ref = useRef<HTMLInputElement>(null);

  // Expose a method to focus the hidden input
  const focusPad = () => {
    const input = ref.current;
    if (input) {
      console.log('Attempting to focus hidden input');
      input.focus({ preventScroll: true });
      console.log('Input focused, document.activeElement:', document.activeElement === input);
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onInput = () => {
      const v = el.value.slice(-1);
      if (/[1-9]/.test(v)) onDigit(Number(v));
      if (v === "0") onBackspace(); // treat 0 as clear
      el.value = "";
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key >= "1" && e.key <= "9") onDigit(Number(e.key));
      if (e.key === "Backspace") onBackspace();
    };

    el.addEventListener("input", onInput);
    window.addEventListener("keydown", onKey);

    return () => {
      el.removeEventListener("input", onInput);
      window.removeEventListener("keydown", onKey);
    };
  }, [onDigit, onBackspace]);

  const HiddenInput = () => (
    <input
      ref={ref}
      type="tel"
      inputMode="numeric"
      pattern="[0-9]*"
      aria-hidden="true"
      autoComplete="off"
      autoCorrect="off"
      autoCapitalize="off"
      spellCheck="false"
      style={{ 
        position: "fixed", 
        opacity: 0, 
        pointerEvents: "none", 
        left: 0,
        top: 0,
        zIndex: -1,
        width: 1,
        height: 1,
        border: 'none',
        outline: 'none',
        background: 'transparent'
      }}
    />
  );

  return {
    HiddenInput,
    focusPad,
  };
}