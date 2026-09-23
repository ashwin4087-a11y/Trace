import { useState } from "react";
import { OrganizerLayout } from "../../components/layout/OrganizerLayout";
import { useWorkshopList } from "../../hooks/useWorkshop";
import { api } from "../../services/api";

const TERRACOTTA = "#BF9270";
const INK = "#1A1412";
const BORDER = "#DFC1B0";
const CANVAS = "#FFEDDB";

const labelStyle: React.CSSProperties = {
  fontFamily: "'Manrope', sans-serif",
  fontSize: 12,
  fontWeight: 600,
  color: INK,
  display: "block",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  fontFamily: "'Manrope', sans-serif",
  fontSize: 14,
  color: INK,
  background: "#FFFFFF",
  border: `1px solid ${BORDER}`,
  borderRadius: 8,
  padding: "10px 14px",
  width: "100%",
  outline: "none",
  boxSizing: "border-box",
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  resize: "vertical",
  minHeight: 120,
};

export function AnnouncementsPage() {
  const workshops = useWorkshopList();
  const workshopId = workshops.data?.[0]?.id ?? "";
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/announcements", { workshopId, title, body });
      setSent(true);
      setTitle("");
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <OrganizerLayout title="Announcements">
      <div
        style={{
          borderBottom: `1px solid ${BORDER}`,
          paddingBottom: 16,
          marginBottom: 28,
        }}
      >
        <p
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: TERRACOTTA,
            marginBottom: 4,
          }}
        >
          Organizer Tools
        </p>
        <h1
          style={{
            fontFamily: "'EB Garamond', Georgia, serif",
            fontSize: 28,
            fontWeight: 600,
            color: INK,
            margin: 0,
          }}
        >
          Announcements
        </h1>
        <p
          style={{
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13,
            color: "#6B5448",
            marginTop: 4,
          }}
        >
          Notify confirmed participants with an important message about your workshop.
        </p>
      </div>

      {sent && (
        <div
          style={{
            background: "#F2F9F4",
            border: "1px solid #9BCFAA",
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13,
            color: "#2D6B43",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 16 }}>&#x2713;</span>
          Confirmed participants were notified.
        </div>
      )}

      {!workshops.isLoading && !workshopId && (
        <div
          style={{
            background: CANVAS,
            border: `1px solid ${BORDER}`,
            borderRadius: 8,
            padding: "12px 16px",
            marginBottom: 20,
            fontFamily: "'Manrope', sans-serif",
            fontSize: 13,
            color: "#7A5438",
          }}
        >
          No workshops found. Create a workshop before sending announcements.
        </div>
      )}

      <div
        style={{
          background: "#FFFFFF",
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          padding: "28px",
          boxShadow: "0 1px 4px rgba(26,20,18,0.06)",
          maxWidth: 560,
        }}
      >
        <div
          style={{
            borderBottom: `1px solid ${BORDER}`,
            paddingBottom: 14,
            marginBottom: 20,
          }}
        >
          <span
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: TERRACOTTA,
            }}
          >
            New Announcement
          </span>
          <h2
            style={{
              fontFamily: "'EB Garamond', Georgia, serif",
              fontSize: 20,
              fontWeight: 600,
              color: INK,
              margin: "2px 0 0",
            }}
          >
            Compose Message
          </h2>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label style={labelStyle} htmlFor="ann-title">
              Subject / Title
            </label>
            <input
              id="ann-title"
              style={inputStyle}
              placeholder="e.g. Schedule change for Session 2"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (sent) setSent(false);
              }}
              required
            />
          </div>

          <div>
            <label style={labelStyle} htmlFor="ann-body">
              Message
            </label>
            <textarea
              id="ann-body"
              style={textareaStyle}
              placeholder="Write your announcement here..."
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (sent) setSent(false);
              }}
              required
            />
          </div>

          <button
            type="submit"
            disabled={!workshopId || submitting}
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.04em",
              background: !workshopId || submitting ? "#E8D5C8" : TERRACOTTA,
              color: !workshopId || submitting ? "#A08878" : "#FFFFFF",
              border: "none",
              borderRadius: 8,
              padding: "12px 24px",
              cursor: !workshopId || submitting ? "not-allowed" : "pointer",
              transition: "background 0.15s, opacity 0.15s",
              alignSelf: "flex-start",
            }}
          >
            {submitting ? "Publishing..." : "Publish Announcement"}
          </button>
        </form>
      </div>
    </OrganizerLayout>
  );
}