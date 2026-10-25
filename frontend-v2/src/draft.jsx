import { createContext, useContext, useEffect, useRef, useState } from "react";

// The whole wizard lives here so the user can fill everything before
// creating an account. Text fields survive a reload via localStorage;
// File objects can't be serialized, so they're kept in memory only.

const DRAFT_KEY = "mm2_draft";

// Labels live in i18n.jsx as "service.<key>", icons in icons.jsx under
// the same key.
export const SERVICES = [
  { key: "electricity", meter: true },
  { key: "water", meter: true },
  { key: "gas", meter: true },
  { key: "arnona", meter: false },
  { key: "internet", meter: false }
];

const emptyPerson = { name: "", idNumber: "", phone: "", email: "" };

const initialDraft = {
  oldAddress: "",
  oldCity: "",
  newAddress: "",
  newCity: "",
  moveDate: "",
  services: [],
  readings: {},
  gasProvider: "",
  applicant: emptyPerson,
  newTenant: emptyPerson
};

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    return saved ? { ...initialDraft, ...saved } : initialDraft;
  } catch {
    return initialDraft;
  }
}

const DraftContext = createContext(null);

export function DraftProvider({ children }) {
  const [draft, setDraft] = useState(loadDraft);
  const files = useRef({ photos: {}, lease: null });
  const [, forceRender] = useState(0);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // Storage unavailable — the draft just won't survive a reload.
    }
  }, [draft]);

  const value = {
    draft,
    update: patch => setDraft(d => ({ ...d, ...patch })),
    files: files.current,
    setPhoto: (service, file) => {
      files.current.photos[service] = file;
      forceRender(n => n + 1);
    },
    setLease: file => {
      files.current.lease = file;
      forceRender(n => n + 1);
    },
    reset: () => {
      files.current = { photos: {}, lease: null };
      setDraft(initialDraft);
    }
  };

  return <DraftContext.Provider value={value}>{children}</DraftContext.Provider>;
}

export function useDraft() {
  return useContext(DraftContext);
}
