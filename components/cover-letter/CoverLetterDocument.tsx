import type { CoverLetterData } from "@/lib/coverletter-types";

function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export function CoverLetterDocument({ data }: { data: CoverLetterData }) {
  const c = data.content;
  const modern = data.template === "modern";

  const senderMeta = [c.senderEmail, c.senderPhone, c.senderLocation]
    .filter((x) => x?.trim())
    .join("   •   ");
  const recipientLines = [
    data.hiringManager,
    data.companyName,
    data.companyLocation,
  ].filter((x) => x?.trim());

  const bodyParas = paragraphs(c.body);

  return (
    <div
      className={
        modern
          ? "font-sans px-[64px] py-[60px] text-neutral-800"
          : "font-serifcv px-[68px] py-[64px] text-neutral-800"
      }
    >
      {/* Sender header */}
      <div>
        <h1
          className={
            modern
              ? "text-[26px] font-extrabold tracking-tight text-[#0A4531]"
              : "text-[24px] font-bold text-neutral-900"
          }
        >
          {c.senderName?.trim() || "Your Name"}
        </h1>
        {modern && c.senderTitle?.trim() && (
          <p className="mt-0.5 text-[12.5px] font-semibold text-[#0E6B49]">
            {c.senderTitle}
          </p>
        )}
        {senderMeta && (
          <p className="mt-1.5 text-[11.5px] text-neutral-500">{senderMeta}</p>
        )}
      </div>

      {modern ? (
        <div className="my-5 h-[3px] w-[54px] bg-[#0E6B49]" />
      ) : (
        <div className="my-5 border-b border-neutral-300" />
      )}

      {c.date?.trim() && (
        <p className="mb-4 text-[12.5px] text-neutral-500">{c.date}</p>
      )}

      {recipientLines.length > 0 && (
        <div className="mb-4 text-[12.5px] leading-relaxed text-neutral-700">
          {recipientLines.map((l, i) => (
            <p key={i}>{l}</p>
          ))}
        </div>
      )}

      {c.subject?.trim() && (
        <p
          className={
            modern
              ? "mb-3 text-[13px] font-bold text-[#0A4531]"
              : "mb-3 text-[13.5px] font-bold text-neutral-900"
          }
        >
          {c.subject}
        </p>
      )}

      {c.greeting?.trim() && (
        <p className="mb-3 text-[12.5px] text-neutral-800">{c.greeting}</p>
      )}

      <div className="space-y-3 text-[12.5px] leading-[1.7] text-neutral-700">
        {c.opening?.trim() && <p>{c.opening}</p>}
        {bodyParas.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
        {c.closing?.trim() && <p>{c.closing}</p>}
      </div>

      <div className="mt-5 text-[12.5px] text-neutral-800">
        <p>Kind regards,</p>
        <p className="mt-1 font-bold">
          {c.signature?.trim() || c.senderName?.trim() || "Your Name"}
        </p>
      </div>
    </div>
  );
}
