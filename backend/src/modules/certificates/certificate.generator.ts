import fs from "node:fs";
import path from "node:path";
import PDFDocument from "pdfkit";
import { localCertificateDir } from "../../config/storage";
import { certificateQrPng, certificateVerifyUrl } from "../../integrations/qr/qr.service";

export async function writeCertificatePdf(input: {
  certificateCode: string;
  participantName: string;
  workshopTitle: string;
  attendancePercentage: number;
  issuedAt: Date;
  providerName: string;
  providerSignatory: string;
  traceSignatoryName: string;
  traceSignatoryTitle: string;
}): Promise<string> {
  fs.mkdirSync(localCertificateDir, { recursive: true });
  const filename = `${input.certificateCode}.pdf`;
  const filePath = path.join(localCertificateDir, filename);
  const qr = await certificateQrPng(input.certificateCode);

  await new Promise<void>((resolve, reject) => {
    // Landscape A4: 842 x 595
    const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 0 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const width = doc.page.width;
    const height = doc.page.height;

    // Background: Warm Ivory
    doc.rect(0, 0, width, height).fill("#FAF8F5");

    // Guilloché lines (simplified as subtle curved paths)
    doc.lineWidth(0.5).strokeColor("#EADACC").strokeOpacity(0.4);
    for (let i = 0; i < 15; i++) {
      doc
        .moveTo(0, 100 + i * 30)
        .bezierCurveTo(width / 3, 200 + i * 40, (width / 3) * 2, i * 20, width, 150 + i * 30)
        .stroke();
    }
    doc.strokeOpacity(1); // Reset opacity

    // Fine double border
    const m = 30; // margin
    doc.rect(m, m, width - 2 * m, height - 2 * m).lineWidth(1).stroke("#A57D61");
    doc.rect(m + 4, m + 4, width - 2 * m - 8, height - 2 * m - 8).lineWidth(0.5).stroke("#A57D61");

    // Corner security marks
    const cl = 15; // corner line length
    doc.moveTo(m - 5, m).lineTo(m + cl, m).stroke("#A57D61");
    doc.moveTo(m, m - 5).lineTo(m, m + cl).stroke("#A57D61");
    doc.moveTo(width - m + 5, m).lineTo(width - m - cl, m).stroke("#A57D61");
    doc.moveTo(width - m, m - 5).lineTo(width - m, m + cl).stroke("#A57D61");
    doc.moveTo(m - 5, height - m).lineTo(m + cl, height - m).stroke("#A57D61");
    doc.moveTo(m, height - m + 5).lineTo(m, height - m - cl).stroke("#A57D61");
    doc.moveTo(width - m + 5, height - m).lineTo(width - m - cl, height - m).stroke("#A57D61");
    doc.moveTo(width - m, height - m + 5).lineTo(width - m, height - m - cl).stroke("#A57D61");

    // Top section
    doc.font("Helvetica-Bold").fontSize(18).fillColor("#1A1412").text("TRACE", 80, 70, { characterSpacing: 4 });
    
    doc.font("Helvetica").fontSize(7).fillColor("#5F524B");
    doc.text("TRACE ACADEMIA", width - 280, 68);
    doc.text("LEARNING  ·  DEVELOPMENT  ·  COMMUNITY  ·  IMPACT", width - 280, 80, { characterSpacing: 1 });
    doc.font("Helvetica-Oblique").text("Every learning experience leaves a trace.", width - 280, 100);

    // Title
    doc.font("Helvetica").fontSize(8).fillColor("#5F524B").text("DATE OF COMPLETION", 80, 140, { characterSpacing: 1.5 });
    doc.text(input.issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }).toUpperCase(), 80, 155);
    
    doc.font("Times-Roman").fontSize(56).fillColor("#1A1412").text("CERTIFICATE", 75, 180);
    doc.font("Times-Roman").fontSize(22).fillColor("#A55743").text("OF COMPLETION", 80, 240, { characterSpacing: 4 });

    // Main text
    doc.font("Helvetica-Bold").fontSize(10).fillColor("#1A1412").text("THIS IS TO CERTIFY THAT", 80, 290, { characterSpacing: 1.5 });
    doc.moveTo(80, 310).lineTo(width - 320, 310).lineWidth(0.5).stroke("#A57D61");
    
    doc.font("Times-Bold").fontSize(20).fillColor("#1A1412").text(input.participantName, 80, 320, { align: "center", width: width - 400 });
    
    doc.font("Helvetica").fontSize(12).fillColor("#1A1412").text("has successfully completed", 80, 360);
    doc.font("Times-Bold").fontSize(28).fillColor("#1A1412").text(input.workshopTitle, 80, 385);
    
    doc.font("Helvetica").fontSize(11).fillColor("#1A1412").text("as part of the TRACE Academia Learning Programme.", 80, 425);
    doc.font("Helvetica").fontSize(10).fillColor("#5F524B")
      .text("In recognition of the successful completion of the prescribed learning experience", 80, 450)
      .text("and demonstrated engagement with the programme.", 80, 465);

    // TRACE Seal
    doc.circle(width - 150, 280, 60).lineWidth(1).stroke("#EADACC");
    doc.circle(width - 150, 280, 50).lineWidth(0.5).stroke("#EADACC");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#D1BBA2").text("TRACE ACADEMIA  ·  LEARNING  ·  DEVELOPMENT  ·  IMPACT  ·  ", width - 210, 220, { width: 120, align: "center" });

    // Signatures
    doc.moveTo(80, 490).lineTo(280, 490).lineWidth(0.5).stroke("#1A1412");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1A1412").text(input.traceSignatoryName.toUpperCase(), 80, 500, { width: 200, align: "center" });
    doc.font("Helvetica").fontSize(7).fillColor("#5F524B").text(input.traceSignatoryTitle, 80, 510, { width: 200, align: "center" });

    doc.moveTo(320, 490).lineTo(520, 490).lineWidth(0.5).stroke("#1A1412");
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#1A1412").text(input.providerSignatory.toUpperCase(), 320, 500, { width: 200, align: "center", lineBreak: false });
    doc.font("Helvetica").fontSize(7).fillColor("#5F524B").text(input.providerName, 320, 510, { width: 200, align: "center", height: 10, lineBreak: false });

    // Verification / QR
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#1A1412").text("VERIFY THIS CERTIFICATE", width - 240, 440);
    if (qr) {
      doc.image(qr, width - 240, 455, { width: 45 });
    }
    doc.font("Helvetica").fontSize(7).fillColor("#5F524B").text("Scan the QR code or visit", width - 185, 460);
    doc.text(certificateVerifyUrl("[CODE]").replace("[CODE]", ""), width - 185, 470); // the URL base
    doc.font("Helvetica-Bold").fillColor("#A55743").text(input.certificateCode, width - 185, 480);
    doc.font("Helvetica").fillColor("#5F524B").text(`Certificate ID: ${input.certificateCode}`, width - 185, 495);

    // Footer
    doc.font("Helvetica-Bold").fontSize(7).fillColor("#A57D61").text("LEARNING  ·  PEOPLE  ·  COMMUNITY  ·  IMPACT", 80, height - 50, { characterSpacing: 2 });
    doc.text("A BRIGHTER TOMORROW, TOGETHER", width - 280, height - 50, { characterSpacing: 2 });

    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });

  return `/certificates/${filename}`;
}
