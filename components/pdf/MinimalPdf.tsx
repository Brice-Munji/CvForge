import { Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { CVData } from "@/lib/cv-types";
import { pdfDate, contactList, PdfFlags } from "./pdf-utils";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    color: "#2b2b2b",
    paddingVertical: 54,
    paddingHorizontal: 60,
    fontSize: 10,
    lineHeight: 1.5,
  },
  name: { fontFamily: "Helvetica-Bold", fontSize: 21, color: "#111827", letterSpacing: -0.3 },
  title: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  contact: { fontSize: 9, color: "#6b7280", marginTop: 8 },
  divider: { borderBottomWidth: 0.8, borderBottomColor: "#e5e7eb", marginTop: 18, marginBottom: 18 },
  section: { marginBottom: 18 },
  heading: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    letterSpacing: 2.6,
    textTransform: "uppercase",
    color: "#9ca3af",
    marginBottom: 9,
  },
  summary: { fontSize: 10, color: "#374151", lineHeight: 1.6 },
  row: { flexDirection: "row", marginBottom: 11 },
  dateCol: { width: 84, fontSize: 8.5, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.4 },
  content: { flex: 1 },
  entryTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: "#111827" },
  entrySub: { fontSize: 9.5, color: "#6b7280", marginTop: 1 },
  body: { fontSize: 9.5, color: "#4b5563", marginTop: 3, lineHeight: 1.55 },
  chips: { flexDirection: "row", flexWrap: "wrap" },
  chip: {
    borderWidth: 0.8,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingVertical: 3,
    paddingHorizontal: 9,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 9,
    color: "#374151",
  },
  twoCol: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "47%" },
  liItem: { fontSize: 9.5, color: "#374151", marginBottom: 4 },
  liStrong: { fontFamily: "Helvetica-Bold", color: "#111827" },
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section} minPresenceAhead={44}>
      <Text style={s.heading}>{title}</Text>
      {children}
    </View>
  );
}

function TwoColRow({ date, children }: { date: string; children: React.ReactNode }) {
  return (
    <View style={s.row} wrap={false}>
      <Text style={s.dateCol}>{date || "—"}</Text>
      <View style={s.content}>{children}</View>
    </View>
  );
}

export function MinimalPdf({ data, f }: { data: CVData; f: PdfFlags }) {
  const p = data.personal;
  const contacts = contactList(p, [
    "email",
    "phone",
    "location",
    "linkedin",
    "portfolio",
  ]).replace(/•/g, "/");

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
          <Text style={s.summary}>{data.summary}</Text>
        </Section>
      ) : null}

      {f.experience ? (
        <Section title="Experience">
          {data.experiences.map((e) => (
            <TwoColRow key={e.id} date={pdfDate(e.startDate, e.endDate, e.current)}>
              <Text style={s.entryTitle}>{e.position || "Position"}</Text>
              <Text style={s.entrySub}>
                {[e.company, e.location].filter(Boolean).join(", ") || "Company"}
              </Text>
              {e.description.trim() ? <Text style={s.body}>{e.description}</Text> : null}
            </TwoColRow>
          ))}
        </Section>
      ) : null}

      {f.education ? (
        <Section title="Education">
          {data.educations.map((ed) => (
            <TwoColRow key={ed.id} date={pdfDate(ed.startDate, ed.endDate)}>
              <Text style={s.entryTitle}>
                {ed.degree || "Degree"}
                {ed.field ? `, ${ed.field}` : ""}
              </Text>
              <Text style={s.entrySub}>{ed.institution || "Institution"}</Text>
              {ed.description.trim() ? <Text style={s.body}>{ed.description}</Text> : null}
            </TwoColRow>
          ))}
        </Section>
      ) : null}

      {f.projects ? (
        <Section title="Projects">
          {data.projects.map((pr) => (
            <TwoColRow key={pr.id} date={pr.technologies[0] ?? "—"}>
              <Text style={s.entryTitle}>{pr.name || "Project"}</Text>
              {pr.description.trim() ? <Text style={s.body}>{pr.description}</Text> : null}
              {pr.technologies.length ? (
                <Text style={[s.entrySub, { marginTop: 3 }]}>
                  {pr.technologies.join(" · ")}
                  {pr.url.trim() ? `   ${pr.url}` : ""}
                </Text>
              ) : pr.url.trim() ? (
                <Text style={[s.entrySub, { marginTop: 3 }]}>{pr.url}</Text>
              ) : null}
            </TwoColRow>
          ))}
        </Section>
      ) : null}

      {f.skills ? (
        <Section title="Skills">
          <View style={s.chips}>
            {data.skills.map((sk) => (
              <Text key={sk.id} style={s.chip}>
                {sk.name || "Skill"}
              </Text>
            ))}
          </View>
        </Section>
      ) : null}

      {f.certifications || f.languages ? (
        <View style={s.twoCol} minPresenceAhead={40}>
          {f.certifications ? (
            <View style={s.col}>
              <Text style={s.heading}>Certifications</Text>
              {data.certifications.map((c) => (
                <Text key={c.id} style={s.liItem} wrap={false}>
                  <Text style={s.liStrong}>{c.name || "Certification"}</Text>
                  {c.issuer ? ` · ${c.issuer}` : ""}
                </Text>
              ))}
            </View>
          ) : (
            <View style={s.col} />
          )}
          {f.languages ? (
            <View style={s.col}>
              <Text style={s.heading}>Languages</Text>
              {data.languages.map((l) => (
                <Text key={l.id} style={s.liItem} wrap={false}>
                  <Text style={s.liStrong}>{l.name || "Language"}</Text>
                  {`  —  ${l.level}`}
                </Text>
              ))}
            </View>
          ) : (
            <View style={s.col} />
          )}
        </View>
      ) : null}
    </Page>
  );
}
