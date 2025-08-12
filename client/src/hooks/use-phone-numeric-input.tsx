import { useEffect, useRef } from "react";

export function usePhoneNumericInput(
  onDigit: (d: number) => void,
  onBackspace: () => void
) {
  const ref = useRef<HTMLInputElement>(null);

  // Expose a method to focus the hidden input
  const focusPad = () => ref.current?.focus({ preventScroll: true });

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
      style={{ 
        position: "fixed", 
        opacity: 0, 
        pointerEvents: "none", 
        left: -9999,
        zIndex: -1
      }}
    />
  );

  return {
    HiddenInput,
    focusPad,
  };
}