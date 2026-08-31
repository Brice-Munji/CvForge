import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/cv-types";
import { pdfDate, contactList, PdfFlags } from "./pdf-utils";

const s = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    color: "#262626",
    paddingVertical: 44,
    paddingHorizontal: 52,
    fontSize: 10.5,
    lineHeight: 1.45,
  },
  name: { fontFamily: "Times-Bold", fontSize: 23, textAlign: "center", color: "#111827" },
  title: { fontSize: 12.5, textAlign: "center", color: "#4b5563", marginTop: 3 },
  contact: { fontSize: 9.5, textAlign: "center", color: "#4b5563", marginTop: 7 },
  divider: { borderBottomWidth: 1.2, borderBottomColor: "#1f2937", marginTop: 14, marginBottom: 12 },
  section: { marginBottom: 13 },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#1f2937",
    borderBottomWidth: 0.8,
    borderBottomColor: "#9ca3af",
    paddingBottom: 3,
    marginBottom: 7,
  },
  entry: { marginBottom: 8 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  entryTitle: { fontFamily: "Times-Bold", fontSize: 11.5, color: "#111827" },
  entrySub: { fontFamily: "Times-Italic", fontSize: 10, color: "#4b5563", marginTop: 1 },
  dates: { fontSize: 9.5, color: "#6b7280" },
  body: { fontSize: 10, color: "#374151", marginTop: 3, lineHeight: 1.5 },
  inline: { fontSize: 10.5, color: "#374151", lineHeight: 1.6 },
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={s.section} minPresenceAhead={46}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function ClassicPdf({ data, f }: { data: CVData; f: PdfFlags }) {
  const p = data.personal;
  const contacts = contactList(p, [
    "location",
    "phone",
    "email",
    "linkedin",
    "portfolio",
  ]);

  return (
    <Page size="A4" style={s.page} wrap>
      <View>
        <Text style={s.name}>{p.fullName.trim() || "Your Name"}</Text>
        {p.title.trim() ? <Text style={s.title}>{p.title}</Text> : null}
        {contacts ? <Text style={s.contact}>{contacts}</Text> : null}
      </View>

      {f.anyBody ? <View style={s.divider} /> : null}

      {f.summary ? (
        <Section title="Profile">
          <Text style={s.body}>{data.summary}</Text>
        </Section>
      ) : null}

      {f.experience ? (
        <Section title="Experience">
          {data.experiences.map((e) => (
            <View key={e.id} style={s.entry} wrap={false}>
              <View style={s.rowBetween}>
                <Text style={s.entryTitle}>{e.position || "Position"}</Text>
                <Text style={s.dates}>{pdfDate(e.startDate, e.endDate, e.current)}</Text>
              </View>
              <Text style={s.entrySub}>
                {[e.company, e.location].filter(Boolean).join(", ") || "Company"}
              </Text>
              {e.description.trim() ? <Text style={s.body}>{e.description}</Text> : null}
            </View>
          ))}
        </Section>
      ) : null}

      {f.education ? (
        <Section title="Education">
          {data.educations.map((ed) => (
            <View key={ed.id} style={s.entry} wrap={false}>
              <View style={s.rowBetween}>
                <Text style={s.entryTitle}>
                  {ed.degree || "Degree"}
                  {ed.field ? `, ${ed.field}` : ""}
                </Text>
                <Text style={s.dates}>{pdfDate(ed.startDate, ed.endDate)}</Text>
              </View>
              <Text style={s.entrySub}>{ed.institution || "Institution"}</Text>
              {ed.description.trim() ? <Text style={s.body}>{ed.description}</Text> : null}
            </View>
          ))}
        </Section>
      ) : null}

      {f.projects ? (
        <Section title="Projects">
          {data.projects.map((pr) => (
            <View key={pr.id} style={s.entry} wrap={false}>
              <View style={s.rowBetween}>
                <Text style={s.entryTitle}>{pr.name || "Project"}</Text>
                {pr.url.trim() ? <Text style={s.dates}>{pr.url}</Text> : null}
              </View>
              {pr.description.trim() ? <Text style={s.body}>{pr.description}</Text> : null}
              {pr.technologies.length ? (
                <Text style={s.entrySub}>{pr.technologies.join(", ")}</Text>
              ) : null}
            </View>
          ))}
        </Section>
      ) : null}

      {f.skills ? (
        <Section title="Skills">
          <Text style={s.inline}>
            {data.skills.map((sk) => sk.name).filter(Boolean).join("   ·   ")}
          </Text>
        </Section>
      ) : null}

      {f.certifications ? (
        <Section title="Certifications">
          {data.certifications.map((c) => (
            <View key={c.id} style={[s.rowBetween, { marginBottom: 3 }]} wrap={false}>
              <Text style={{ fontSize: 10.5 }}>
                <Text style={{ fontFamily: "Times-Bold" }}>{c.name || "Certification"}</Text>
                {c.issuer ? ` — ${c.issuer}` : ""}
              </Text>
              <Text style={s.dates}>{c.date}</Text>
            </View>
          ))}
        </Section>
      ) : null}

      {f.languages ? (
        <Section title="Languages">
          <Text style={s.inline}>
            {data.languages
              .map((l) => (l.name ? `${l.name} (${l.level})` : ""))
              .filter(Boolean)
              .join("   ·   ")}
          </Text>
        </Section>
      ) : null}
    </Page>
  );
}
