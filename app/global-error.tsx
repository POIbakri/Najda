"use client";

// Last-resort boundary: only fires if the root layout itself throws, so it
// replaces the layout entirely and cannot rely on the i18n provider, Tailwind,
// or the global Call 998 bar. It is fully self-contained and still keeps 998
// reachable — a person must always be able to call for help.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
          padding: 24,
          textAlign: "center",
          background: "#F7F3EC",
          color: "#16202B",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>نجدة</h1>
        <p style={{ fontSize: 18, color: "#46535F", maxWidth: 320 }}>
          حدث خطأ غير متوقع. أعد المحاولة، وإن كانت الحالة طارئة اتصل بـ ٩٩٨ الآن.
        </p>
        <button
          onClick={() => reset()}
          style={{
            minHeight: 56,
            padding: "0 24px",
            borderRadius: 16,
            border: "none",
            background: "#16202B",
            color: "#F7F3EC",
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          إعادة المحاولة
        </button>
        <a
          href="tel:998"
          style={{
            minHeight: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            borderRadius: 16,
            border: "2px solid rgba(228,69,31,0.3)",
            background: "#fff",
            color: "#B8350F",
            fontSize: 18,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          اتصل بـ ٩٩٨
        </a>
      </body>
    </html>
  );
}
