import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  key: string;
  sequence?: string[];
  ctrl?: boolean;
  meta?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
  /** If true, shortcut will work even when typing in input fields */
  allowInInput?: boolean;
}

/**
 * Checks if the user is currently typing in an input field.
 */
function isTypingInInput(): boolean {
  const activeElement = document.activeElement;
  if (!activeElement) return false;

  const tagName = activeElement.tagName.toLowerCase();
  const isEditable = activeElement.getAttribute("contenteditable") === "true";

  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    isEditable
  );
}

/**
 * Normalizes key names for cross-browser compatibility.
 */
function normalizeKey(key: string): string {
  const keyMap: Record<string, string> = {
    Esc: "Escape",
    "/": "/",
  };
  return keyMap[key] || key;
}

function matchesKey(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
  const key = normalizeKey(event.key);
  const ctrlMatch = shortcut.ctrl ? event.ctrlKey : !event.ctrlKey;
  const metaMatch = shortcut.meta ? event.metaKey : !event.metaKey;
  const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
  const altMatch = shortcut.alt ? event.altKey : !event.altKey;

  // Handle Cmd/Ctrl as interchangeable for shortcuts that opt into either.
  const modifierMatch =
    (shortcut.ctrl || shortcut.meta) && (event.ctrlKey || event.metaKey);

  return (
    key.toLowerCase() === shortcut.key.toLowerCase() &&
    (modifierMatch || (ctrlMatch && metaMatch)) &&
    shiftMatch &&
    altMatch
  );
}

/**
 * Hook that registers global keyboard shortcuts.
 * Automatically prevents shortcuts from firing when typing in input fields
 * unless `allowInInput` is explicitly set to true.
 */
export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]): void {
  const shortcutsRef = useRef(shortcuts);
  const sequenceRef = useRef<string[]>([]);
  const sequenceTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const resetSequence = useCallback(() => {
    sequenceRef.current = [];
    if (sequenceTimeoutRef.current !== null) {
      window.clearTimeout(sequenceTimeoutRef.current);
      sequenceTimeoutRef.current = null;
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const typing = isTypingInInput();

    if (event.key === "Escape") {
      resetSequence();
    }

    if (!typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const key = normalizeKey(event.key).toLowerCase();
      const sequenceShortcuts = shortcutsRef.current.filter(
        (shortcut) => shortcut.sequence && shortcut.sequence.length > 0,
      );

      if (sequenceShortcuts.length > 0 && key.length === 1) {
        const nextSequence = [...sequenceRef.current, key].slice(-2);
        const matchingSequence = sequenceShortcuts.find((shortcut) => {
          const sequence = shortcut.sequence?.map((item) => item.toLowerCase());
          return (
            sequence?.length === nextSequence.length &&
            sequence.every((item, index) => item === nextSequence[index])
          );
        });

        const canContinueSequence = sequenceShortcuts.some((shortcut) => {
          const sequence = shortcut.sequence?.map((item) => item.toLowerCase());
          return (
            sequence &&
            nextSequence.length < sequence.length &&
            nextSequence.every((item, index) => item === sequence[index])
          );
        });

        if (matchingSequence) {
          event.preventDefault();
          resetSequence();
          matchingSequence.action();
          return;
        }

        if (canContinueSequence) {
          event.preventDefault();
          sequenceRef.current = nextSequence;
          if (sequenceTimeoutRef.current !== null) {
            window.clearTimeout(sequenceTimeoutRef.current);
          }
          sequenceTimeoutRef.current = window.setTimeout(resetSequence, 1000);
          return;
        }

        resetSequence();
      }
    }

    for (const shortcut of shortcutsRef.current) {
      if (shortcut.sequence) continue;

      // Skip if typing in input and shortcut doesn't allow it
      if (typing && !shortcut.allowInInput) continue;

      if (matchesKey(event, shortcut)) {
        event.preventDefault();
        resetSequence();
        shortcut.action();
        break;
      }
    }
  }, [resetSequence]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      resetSequence();
    };
  }, [handleKeyDown, resetSequence]);
}

/**
 * Returns the platform-appropriate modifier key label (Cmd on Mac, Ctrl elsewhere).
 */
export function getModifierKey(): "Cmd" | "Ctrl" {
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  return isMac ? "Cmd" : "Ctrl";
}

/**
 * Formats a keyboard shortcut for display.
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const parts: string[] = [];
  const mod = getModifierKey();

  if (shortcut.ctrl || shortcut.meta) parts.push(mod);
  if (shortcut.shift) parts.push("Shift");
  if (shortcut.alt) parts.push("Alt");

  // Capitalize single letters for display
  const keyDisplay =
    shortcut.key.length === 1 ? shortcut.key.toUpperCase() : shortcut.key;
  parts.push(keyDisplay);

  return parts.join(" + ");
}
