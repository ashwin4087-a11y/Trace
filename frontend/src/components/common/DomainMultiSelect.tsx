import { useState, useRef, useEffect, useCallback } from "react";

/* ── Domain definitions ──────────────────────────────── */
export const DOMAIN_OPTIONS = [
  { value: "ENGINEERING", label: "Engineering & Technology" },
  { value: "ARTS_SCIENCE", label: "Arts & Science" },
  { value: "TAMIL_LANGUAGE", label: "Tamil & Language" },
  { value: "OTHER", label: "Interdisciplinary" },
] as const;

export type DomainValue = (typeof DOMAIN_OPTIONS)[number]["value"];

/* ── Palette ─────────────────────────────────────────── */
const C = {
  surface: "#FFFFFF",
  border: "#DFC1B0",
  ink: "#1A1412",
  secondary: "#6B5448",
  terracotta: "#BF9270",
  terracottaMid: "rgba(191,146,112,0.18)",
  focus: "rgba(191,146,112,0.35)",
} as const;

/* ── Props ───────────────────────────────────────────── */
interface DomainMultiSelectProps {
  selected: DomainValue[];
  onChange: (values: DomainValue[]) => void;
  onApply: (values: DomainValue[]) => void;
}

/* ─────────────────────────────────────────────────────── */
export function DomainMultiSelect({ selected, onChange, onApply }: DomainMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DomainValue[]>(selected);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  /* Sync draft to applied selection when closed externally */
  useEffect(() => {
    if (!open) setDraft(selected);
  }, [selected, open]);

  /* Close on outside click — discard draft */
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setDraft(selected);
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, selected]);

  /* Escape — revert draft, close */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setDraft(selected);
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, selected]);

  const toggleOpen = () => {
    if (open) {
      setDraft(selected);
      setOpen(false);
    } else {
      setDraft([...selected]);
      setOpen(true);
    }
  };

  const toggleDomain = useCallback((value: DomainValue) => {
    setDraft((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  }, []);

  const handleApply = () => {
    onChange(draft);
    onApply(draft);
    setOpen(false);
  };

  const handleClearAll = () => setDraft([]);

  const removeChip = (value: DomainValue, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = selected.filter((v) => v !== value);
    onChange(next);
    onApply(next);
  };

  const isAllDomains = selected.length === 0;
  const MAX_CHIPS = 2;
  const visibleChips = selected.slice(0, MAX_CHIPS);
  const overflow = selected.length - MAX_CHIPS;

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%" }}>
      {/* ── Label ──────────────────────────────────────── */}
      <span
        style={{
          display: "block",
          fontFamily: "'Manrope', sans-serif",
          fontSize: 12,
          fontWeight: 600,
          color: C.ink,
          marginBottom: 4,
        }}
      >
        Domain
      </span>

      {/* ── Trigger field ──────────────────────────────── */}
      <button
        ref={triggerRef}
        id="domain-filter-btn"
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls="domain-dropdown"
        aria-label="Domain filter"
        onClick={toggleOpen}
        style={{
          width: "100%",
          minHeight: 42,
          background: C.surface,
          border: `1px solid ${open ? C.terracotta : C.border}`,
          borderRadius: 8,
          padding: "6px 36px 6px 10px",
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 4,
          cursor: "pointer",
          outline: "none",
          boxShadow: open ? `0 0 0 3px ${C.focus}` : "none",
          transition: "border-color 0.15s, box-shadow 0.15s",
          position: "relative",
          textAlign: "left",
        }}
      >
        {isAllDomains ? (
          <span style={{ fontFamily: "'Manrope', sans-serif", fontSize: 13, color: C.secondary }}>
            All domains
          </span>
        ) : (
          <>
            {visibleChips.map((val) => {
              const label = DOMAIN_OPTIONS.find((o) => o.value === val)?.label ?? val;
              return (
                <span
                  key={val}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background: C.terracottaMid,
                    border: `1px solid ${C.border}`,
                    borderRadius: 6,
                    padding: "2px 6px 2px 8px",
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 11,
                    fontWeight: 600,
                    color: C.ink,
                    maxWidth: 170,
                    overflow: "hidden",
                  }}
                >
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove ${label}`}
                    onClick={(e) => removeChip(val, e)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: C.terracotta,
                      fontSize: 13,
                      lineHeight: 1,
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    &#x2715;
                  </button>
                </span>
              );
            })}
            {overflow > 0 && (
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 11,
                  fontWeight: 600,
                  color: C.terracotta,
                  whiteSpace: "nowrap",
                }}
              >
                +{overflow} more
              </span>
            )}
          </>
        )}

        {/* Chevron */}
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: `translateY(-50%) rotate(${open ? 180 : 0}deg)`,
            transition: "transform 0.2s",
            color: C.secondary,
            pointerEvents: "none",
            fontSize: 10,
          }}
        >
          &#9660;
        </span>
      </button>

      {/* ── Dropdown ───────────────────────────────────── */}
      {open && (
        <div
          id="domain-dropdown"
          role="listbox"
          aria-multiselectable="true"
          aria-label="Domain filter options"
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 200,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(26,20,18,0.14)",
            overflow: "hidden",
          }}
        >
          {/* All domains */}
          <DomainRow
            label="All domains"
            checked={draft.length === 0}
            onChange={() => setDraft([])}
            isAll
          />

          <div style={{ height: 1, background: C.border, margin: "0 12px", opacity: 0.5 }} />

          {/* Individual options */}
          {DOMAIN_OPTIONS.map((opt) => (
            <DomainRow
              key={opt.value}
              label={opt.label}
              checked={draft.includes(opt.value)}
              onChange={() => toggleDomain(opt.value)}
            />
          ))}

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              borderTop: `1px solid ${C.border}`,
            }}
          >
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                color: C.secondary,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px 0",
                textDecoration: "underline",
                textUnderlineOffset: 2,
              }}
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={handleApply}
              style={{
                fontFamily: "'Manrope', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#FFFFFF",
                background: C.terracotta,
                border: "none",
                borderRadius: 6,
                padding: "6px 18px",
                cursor: "pointer",
                letterSpacing: "0.03em",
              }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Checkbox row ─────────────────────────────────────── */
interface DomainRowProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  isAll?: boolean;
}

function DomainRow({ label, checked, onChange, isAll }: DomainRowProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "9px 14px",
        cursor: "pointer",
        background: checked ? "rgba(191,146,112,0.09)" : "transparent",
        transition: "background 0.1s",
        userSelect: "none",
      }}
      onMouseEnter={(e) => {
        if (!checked)
          (e.currentTarget as HTMLElement).style.background = "rgba(191,146,112,0.05)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = checked
          ? "rgba(191,146,112,0.09)"
          : "transparent";
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        role="option"
        aria-selected={checked}
        style={{
          accentColor: "#BF9270",
          width: 15,
          height: 15,
          flexShrink: 0,
          cursor: "pointer",
        }}
      />
      <span
        style={{
          fontFamily: "'Manrope', sans-serif",
          fontSize: 13,
          fontWeight: isAll ? 600 : 400,
          color: checked ? "#1A1412" : "#6B5448",
        }}
      >
        {label}
      </span>
    </label>
  );
}