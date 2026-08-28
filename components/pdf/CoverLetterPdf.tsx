import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CoverLetterData } from "@/lib/coverletter-types";

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const classic = StyleSheet.create({
  page: { fontFamily: "Times-Roman", color: "#1f2937", paddingVertical: 56, paddingHorizontal: 60, fontSize: 11, lineHeight: 1.55 },
  senderName: { fontFamily: "Times-Bold", fontSize: 18, color: "#111827" },
  senderMeta: { fontSize: 9.5, color: "#4b5563", marginTop: 2 },
  rule: { borderBottomWidth: 1, borderBottomColor: "#d1d5db", marginTop: 14, marginBottom: 16 },
  date: { fontSize: 10.5, color: "#4b5563", marginBottom: 14 },
  recipient: { fontSize: 10.5, color: "#1f2937", marginBottom: 14 },
  subject: { fontFamily: "Times-Bold", fontSize: 11.5, color: "#111827", marginBottom: 12 },
  greeting: { marginBottom: 10 },
  para: { marginBottom: 10, textAlign: "justify" },
  sign: { marginTop: 8 },
  signName: { fontFamily: "Times-Bold", marginTop: 2 },
});

const modern = StyleSheet.create({
  page: { fontFamily: "Helvetica", color: "#262626", paddingVertical: 52, paddingHorizontal: 56, fontSize: 10.5, lineHeight: 1.6 },
  senderName: { fontFamily: "Helvetica-Bold", fontSize: 20, color: "#0A4531", letterSpacing: -0.3 },
  senderTitle: { fontSize: 10.5, color: "#0E6B49", fontFamily: "Helvetica-Bold", marginTop: 2 },
  senderMeta: { fontSize: 9, color: "#6b7280", marginTop: 6 },
  accent: { height: 3, width: 54, backgroundColor: "#0E6B49", marginTop: 12, marginBottom: 18 },
  date: { fontSize: 10, color: "#6b7280", marginBottom: 14 },
  recipient: { fontSize: 10, color: "#374151", marginBottom: 14 },
  subject: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#0A4531", marginBottom: 12 },
  greeting: { marginBottom: 10 },
  para: { marginBottom: 10 },
  sign: { marginTop: 8 },
  signName: { fontFamily: "Helvetica-Bold", marginTop: 2 },
});

function LetterBody({
  data,
  s,
  variant,
}: {
  data: CoverLetterData;
  // Styles differ per variant; typed loosely so both stylesheets fit.
  s: Record<string, any>;
  variant: "classic" | "modern";
}) {
  const c = data.content;
  const senderMeta = [c.senderEmail, c.senderPhone, c.senderLocation]
    .filter(Boolean)
    .join("   •   ");
  const recipientLines = [
    data.hiringManager,
    data.companyName,
    data.companyLocation,
  ].filter(Boolean);

  return (
    <Page size="A4" style={s.page} wrap>
      <View>
        <Text style={s.senderName}>{c.senderName || "Your Name"}</Text>
        {variant === "modern" && c.senderTitle ? (
          <Text style={s.senderTitle}>{c.senderTitle}</Text>
        ) : null}
        {senderMeta ? <Text style={s.senderMeta}>{senderMeta}</Text> : null}
      </View>

      {variant === "modern" ? (
        <View style={s.accent} />
      ) : (
        <View style={s.rule} />
      )}

      {c.date ? <Text style={s.date}>{c.date}</Text> : null}

      {recipientLines.length ? (
        <View style={s.recipient}>
          {recipientLines.map((l, i) => (
            <Text key={i}>{l}</Text>
          ))}
        </View>
      ) : null}

      {c.subject ? <Text style={s.subject}>{c.subject}</Text> : null}
      {c.greeting ? <Text style={s.greeting}>{c.greeting}</Text> : null}

      {c.opening ? <Text style={s.para}>{c.opening}</Text> : null}
      {paragraphs(c.body).map((p, i) => (
        <Text key={i} style={s.para}>
          {p}
        </Text>
      ))}
      {c.closing ? <Text style={s.para}>{c.closing}</Text> : null}

      <View style={s.sign}>
        <Text>Kind regards,</Text>
        <Text style={s.signName}>{c.signature || c.senderName || "Your Name"}</Text>
      </View>
    </Page>
  );
}

export function CoverLetterPdfDocument({ data }: { data: CoverLetterData }) {
  const variant = data.template === "modern" ? "modern" : "classic";
  const s = variant === "modern" ? modern : classic;
  return (
    <Document
      title={`Cover Letter — ${data.content.senderName || "CVForge"}`}
      author={data.content.senderName || "CVForge"}
      creator="CVForge"
      producer="CVForge"
    >
      <LetterBody data={data} s={s} variant={variant} />
    </Document>
  );
}
