import { NextRequest } from "next/server";
import {
  Document,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Header,
  Footer,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  WidthType,
  Packer,
  PageNumber,
} from "docx";

interface CompanyInfo {
  companyName: string;
  industry: string;
  companySize: string;
  scope: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
}

interface FrameworkInfo {
  id: string;
  name: string;
  version: string;
  region: string;
}

interface ControlInfo {
  id: string;
  ref: string;
  theme: string;
  description: string;
}

interface RequestBody {
  company: CompanyInfo;
  framework: FrameworkInfo;
  controls: ControlInfo[];
  generatedDate: string;
  policyId?: string;
  policyName?: string;
}

function createDoc(body: RequestBody) {
  const { company, framework, controls, generatedDate, policyName } = body;
  const docTitle = policyName && policyName !== "General Policy" ? policyName : "COMPLIANCE POLICY";

  const section = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, bold: true, size: 28, font: "Calibri" })],
      spacing: { before: 400, after: 200 },
    });

  const bodyText = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, size: 22, font: "Calibri" })],
      spacing: { after: 120 },
    });

  const boldBody = (parts: { text: string; bold?: boolean }[]) =>
    new Paragraph({
      children: parts.map(
        (p) => new TextRun({ text: p.text, size: 22, font: "Calibri", bold: p.bold })
      ),
      spacing: { after: 120 },
    });

  const controlBlock = (c: ControlInfo) => [
    new Paragraph({
      children: [
        new TextRun({ text: `${c.ref}`, size: 20, font: "Consolas", color: "888888" }),
        new TextRun({ text: `  ${c.theme}`, bold: true, size: 22, font: "Calibri" }),
      ],
      spacing: { before: 200, after: 60 },
    }),
    new Paragraph({
      children: [new TextRun({ text: c.description, size: 22, font: "Calibri" })],
      spacing: { after: 160 },
      indent: { left: 360 },
    }),
  ];

  const headerRow = (cells: string[]) =>
    new TableRow({
      tableHeader: true,
      children: cells.map(
        (c) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: c, bold: true, size: 20, font: "Calibri" })],
                spacing: { before: 40, after: 40 },
              }),
            ],
            shading: { type: "clear", fill: "F1F5F9" },
          })
      ),
    });

  const detailRow = (label: string, value: string) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 4000, type: WidthType.DXA },
          children: [
            new Paragraph({
              children: [new TextRun({ text: label, bold: true, size: 20, font: "Calibri" })],
              spacing: { before: 40, after: 40 },
            }),
          ],
        }),
        new TableCell({
          width: { size: 8000, type: WidthType.DXA },
          children: [
            new Paragraph({
              children: [new TextRun({ text: value, size: 20, font: "Calibri" })],
              spacing: { before: 40, after: 40 },
            }),
          ],
        }),
      ],
    });

  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: docTitle, bold: true, size: 36, font: "Calibri" })],
      spacing: { before: 600, after: 200 },
    })
  );

  const policySuffix = body.policyId && body.policyId !== "all" ? body.policyId.toUpperCase().replace(/-/g, "") : "GEN";
  const docRef = `POL-${framework.name.substring(0, 3).toUpperCase()}-${policySuffix}`;
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `Document Ref: ${docRef}`, size: 22, font: "Calibri", color: "666666" })],
      spacing: { after: 400 },
    })
  );

  // Company details table
  children.push(
    new Table({
      rows: [
        detailRow("Company", company.companyName),
        detailRow("Industry", company.industry),
        detailRow("Company Size", company.companySize),
        detailRow("Framework", `${framework.name} v${framework.version} (${framework.region})`),
        detailRow("Date", generatedDate),
        detailRow("Controls", `${controls.length} requirements`),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    })
  );

  // 1.0 Purpose and Scope
  children.push(section("1.0 Purpose and Scope"));
  children.push(
    boldBody([
      { text: "This document establishes the compliance policy for ", bold: false },
      { text: company.companyName, bold: true },
      { text: ` ("the Organization"), governing its operations within the `, bold: false },
      { text: company.industry, bold: true },
      {
        text: ` sector. This policy is derived from the `,
        bold: false,
      },
      { text: `${framework.name}`, bold: true },
      {
        text: ` v${framework.version} (${framework.region}) framework and defines the mandatory requirements, responsibilities, and evidence criteria that shall be implemented and maintained by the Organization to achieve and demonstrate full compliance.`,
        bold: false,
      },
    ])
  );
  children.push(boldBody([{ text: `Scope of Application: `, bold: true }, { text: company.scope, bold: false }]));
  children.push(
    bodyText(
      `All personnel, systems, processes, and third-party relationships within the scope defined above shall comply with the requirements set forth in this policy. The ${framework.name} framework comprises ${controls.length} controls, each of which is addressed in Section 2.0 below.`
    )
  );

  // 2.0 Policy Requirements
  children.push(section("2.0 Policy Requirements"));
  children.push(
    bodyText(
      `The following controls define the specific requirements that shall be implemented by ${company.companyName} to achieve and maintain compliance with ${framework.name}. Each control includes the reference identifier, thematic category, and the mandatory requirement statement.${policyName && policyName !== "General Policy" ? ` Only controls relevant to ${policyName} are listed in this section.` : ""}`
    )
  );
  for (const c of controls) {
    children.push(...controlBlock(c));
  }

  // 3.0 Compliance and Enforcement
  children.push(section("3.0 Compliance and Enforcement"));

  children.push(
    new Table({
      rows: [
        detailRow("Compliance Officer", company.contactName),
        detailRow("Title", company.contactTitle),
        detailRow("Email", company.contactEmail),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    })
  );

  children.push(
    bodyText(
      "Compliance with this policy shall be verified through regular internal audits, management reviews, and independent assessments conducted at intervals defined by the Organization's compliance program. Non-compliance shall be documented, escalated to the designated Compliance Officer, and remediated within defined SLA thresholds."
    )
  );
  children.push(
    bodyText(
      "The Compliance Officer shall ensure that all controls are implemented, maintained, and continuously improved. Annual policy reviews shall be conducted to incorporate framework updates, regulatory changes, and lessons learned from compliance assessments."
    )
  );

  // 4.0 Document History
  children.push(section("4.0 Document History"));

  children.push(
    new Table({
      rows: [
        headerRow(["Version", "Date", "Description"]),
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: "1.0", size: 20, font: "Consolas" })] })],
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: generatedDate, size: 20, font: "Calibri" })] })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Initial policy generation for ${company.companyName} based on ${framework.name} (${controls.length} controls)`,
                      size: 20,
                      font: "Calibri",
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1 },
        bottom: { style: BorderStyle.SINGLE, size: 1 },
        left: { style: BorderStyle.SINGLE, size: 1 },
        right: { style: BorderStyle.SINGLE, size: 1 },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
        insideVertical: { style: BorderStyle.SINGLE, size: 1 },
      },
    })
  );

  // Footer note
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "Produced by Compliance Engine — Confidential", size: 18, font: "Calibri", color: "999999" })],
      spacing: { before: 600 },
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: "This document is a generated compliance policy and should be reviewed by qualified professionals.",
          size: 18,
          font: "Calibri",
          color: "999999",
        }),
      ],
      spacing: { after: 200 },
    })
  );

  return new Document({
    styles: {
      default: {
        document: {
          run: { font: "Calibri", size: 22 },
        },
      },
    },
    sections: [
      {
        properties: {},
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    text: `${docTitle} — ${company.companyName}`,
                    size: 16,
                    font: "Calibri",
                    color: "999999",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Page ", size: 18, font: "Calibri", color: "999999" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Calibri", color: "999999" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: RequestBody = await req.json();

    if (!body.company?.companyName || !body.framework?.name || !body.controls) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const doc = createDoc(body);
    const buffer = await Packer.toBuffer(doc);

    const policySuffix = body.policyId && body.policyId !== "all" ? body.policyId : "General_Policy";
    const filename = `${body.company.companyName.replace(/\s+/g, "_")}_${policySuffix}_${body.framework.name.replace(/\s+/g, "_")}.docx`;

    return new Response(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("DOCX generation error:", error);
    return Response.json({ error: "Failed to generate document" }, { status: 500 });
  }
}
