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
}): Promise<string> {
  fs.mkdirSync(localCertificateDir, { recursive: true });
  const filename = `${input.certificateCode}.pdf`;
  const filePath = path.join(localCertificateDir, filename);
  const qr = await certificateQrPng(input.certificateCode);

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 56 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.rect(36, 36, doc.page.width - 72, doc.page.height - 72).lineWidth(2).stroke("#0f6e56");
    doc.moveDown(2);
    doc.fillColor("#0f6e56").fontSize(14).text("AUREX 2026  ·  Lifelong Learning", { align: "center" });
    doc.moveDown(1.2);
    doc.fillColor("#10241f").fontSize(28).text("Certificate of Completion", { align: "center" });
    doc.moveDown(1);
    doc.fontSize(14).fillColor("#3d4a45").text("This certifies that", { align: "center" });
    doc.moveDown(0.6);
    doc.fontSize(24).fillColor("#10241f").text(input.participantName, { align: "center" });
    doc.moveDown(0.6);
    doc.fontSize(14).fillColor("#3d4a45").text("has completed", { align: "center" });
    doc.moveDown(0.4);
    doc.fontSize(18).fillColor("#10241f").text(input.workshopTitle, { align: "center" });
    doc.moveDown(1);
    doc.fontSize(12).text(
      `Attendance verified by the platform: ${input.attendancePercentage.toFixed(2)}%`,
      { align: "center" },
    );
    doc.text(`Issued ${input.issuedAt.toISOString().slice(0, 10)}`, { align: "center" });
    doc.moveDown(0.4);
    doc.text(`Certificate ID ${input.certificateCode}`, { align: "center" });
    doc.moveDown(1);
    doc.image(qr, doc.page.width / 2 - 70, doc.y, { width: 140 });
    doc.moveDown(8);
    doc.fontSize(10).fillColor("#3d4a45").text(certificateVerifyUrl(input.certificateCode), { align: "center" });
    doc.end();
    stream.on("finish", () => resolve());
    stream.on("error", reject);
  });

  return `/certificates/${filename}`;
}
