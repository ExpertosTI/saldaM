import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as crypto from 'crypto';
import { SplitSheet } from '../split-sheet/entities/split-sheet.entity';
import { Collaborator } from '../split-sheet/entities/collaborator.entity';

@Injectable()
export class SignatureService {

    // 1. Generate the visual PDF representation of the Split Sheet
    async generateSplitSheetPdf(splitSheet: SplitSheet): Promise<Buffer> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontSize = 12;

        page.drawText(`Split Sheet: ${splitSheet.title}`, {
            x: 50,
            y: height - 50,
            size: 20,
            font,
            color: rgb(0, 0, 0),
        });

        let yPosition = height - 100;

        // Draw Collaborators Table
        splitSheet.collaborators.forEach((collab, index) => {
            const text = `${index + 1}. ${collab.role} - ${collab.email} - ${collab.percentage}%`;
            page.drawText(text, { x: 50, y: yPosition, size: fontSize, font });

            if (collab.hasSigned) {
                page.drawText(`[SIGNED at ${collab.signedAt}]`, { x: 400, y: yPosition, size: 10, font, color: rgb(0, 0.5, 0) });
            } else {
                page.drawText(`[PENDING]`, { x: 400, y: yPosition, size: 10, font, color: rgb(0.8, 0, 0) });
            }
            yPosition -= 20;
        });

        return Buffer.from(await pdfDoc.save());
    }

    // 2. Append Audit Trail to the final PDF
    async appendAuditTrail(originalPdfBuffer: Buffer, splitSheet: SplitSheet): Promise<Buffer> {
        const pdfDoc = await PDFDocument.load(originalPdfBuffer);
        const auditPage = pdfDoc.addPage();
        const { width, height } = auditPage.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Courier);

        auditPage.drawText('AUDIT TRAIL / CERTIFICATE OF COMPLETION', {
            x: 50,
            y: height - 50,
            size: 18,
            font,
            color: rgb(0, 0, 0),
        });

        let y = height - 100;

        // Document ID
        auditPage.drawText(`Document ID: ${splitSheet.id}`, { x: 50, y, size: 10, font });
        y -= 15;
        auditPage.drawText(`Title: ${splitSheet.title}`, { x: 50, y, size: 10, font });
        y -= 30;

        // Signatures
        for (const collab of splitSheet.collaborators) {
            if (collab.hasSigned) {
                auditPage.drawText(`Signed by: ${collab.email}`, { x: 50, y, size: 10, font });
                y -= 12;
                auditPage.drawText(`  Date: ${collab.signedAt}`, { x: 50, y, size: 8, font });
                y -= 12;
                auditPage.drawText(`  IP Address: ${collab.ipAddress}`, { x: 50, y, size: 8, font });
                y -= 12;
                auditPage.drawText(`  User Agent: ${collab.userAgent}`, { x: 50, y, size: 8, font });
                y -= 25;
            }
        }

        // Hash the final document content (before audit page ideally, but for simplicity we hash the content so far or the final structure)
        // Here we define the audit trail IS part of the final doc.
        const finalBytes = await pdfDoc.save();
        return Buffer.from(finalBytes);
    }

    // 3. Hash the final file for integrity
    calculateHash(fileBuffer: Buffer): string {
        return crypto.createHash('sha256').update(fileBuffer).digest('hex');
    }
}
