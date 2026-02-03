import { Injectable } from '@nestjs/common';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as crypto from 'crypto';
import { existsSync, readFileSync } from 'fs';
import * as path from 'path';
import { SplitSheet } from '../split-sheet/entities/split-sheet.entity';
import { Collaborator } from '../split-sheet/entities/collaborator.entity';

@Injectable()
export class SignatureService {

    private resolveLogoPngPath() {
        const candidates = [
            path.resolve(process.cwd(), 'apps/web/public/logo.png'),
            path.resolve(process.cwd(), '../web/public/logo.png'),
            path.resolve(process.cwd(), '../../web/public/logo.png'),
            path.resolve(process.cwd(), '../../apps/web/public/logo.png'),
            path.resolve(process.cwd(), '../../../apps/web/public/logo.png'),
        ];
        for (const p of candidates) {
            if (existsSync(p)) return p;
        }
        return null;
    }

    private safeText(value: any) {
        if (value === null || value === undefined) return '';
        return String(value);
    }

    private formatDate(value: any) {
        try {
            const d = value instanceof Date ? value : new Date(value);
            if (Number.isNaN(d.getTime())) return '';
            return d.toISOString().slice(0, 10);
        } catch {
            return '';
        }
    }

    private formatPercentage(value: any) {
        const n = Number(value);
        if (!Number.isFinite(n)) return '';
        return `${n.toFixed(2)}%`;
    }

    private wrapText(text: string, maxChars: number) {
        const words = (text || '').split(/\s+/).filter(Boolean);
        const lines: string[] = [];
        let line = '';
        for (const w of words) {
            const next = line ? `${line} ${w}` : w;
            if (next.length > maxChars && line) {
                lines.push(line);
                line = w;
            } else {
                line = next;
            }
        }
        if (line) lines.push(line);
        return lines.length ? lines : [''];
    }

    // 1. Generate the visual PDF representation of the Split Sheet
    async generateSplitSheetPdf(splitSheet: SplitSheet): Promise<Buffer> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const marginX = 50;
        let y = height - 50;
        let logoBottomY: number | null = null;

        const logoPath = this.resolveLogoPngPath();
        if (logoPath) {
            try {
                const logoBytes = readFileSync(logoPath);
                // Limitar tamaño máximo a 500KB para evitar cuelgues
                if (logoBytes.length > 500 * 1024) {
                    console.warn(`Logo too large (${logoBytes.length} bytes), skipping to prevent PDF hang`);
                } else {
                    const logo = await pdfDoc.embedPng(logoBytes);
                    const logoWidth = 40; // Reducido de 70 a 40 para evitar procesamiento pesado
                    const logoHeight = (logo.height / logo.width) * logoWidth;
                    const bottomY = y - logoHeight + 10;
                    page.drawImage(logo, { x: marginX, y: bottomY, width: logoWidth, height: logoHeight });
                    logoBottomY = bottomY;
                }
            } catch (err) {
                console.warn('Logo embed failed, continuing without logo:', err.message);
            }
        }

        page.drawText('SPLIT SHEET', { x: marginX + 90, y, size: 18, font: fontBold, color: rgb(0, 0, 0) });
        y -= 22;
        page.drawText(this.safeText(splitSheet.title), { x: marginX + 90, y, size: 14, font: fontBold, color: rgb(0.1, 0.1, 0.1) });

        const metaY = height - 55;
        page.drawText(`DATE: ${this.formatDate(splitSheet.createdAt)}`, { x: width - marginX - 200, y: metaY, size: 10, font, color: rgb(0.2, 0.2, 0.2) });
        page.drawText(`DOC ID: ${this.safeText(splitSheet.id)}`, { x: width - marginX - 200, y: metaY - 14, size: 8, font, color: rgb(0.35, 0.35, 0.35) });

        y -= 26;
        if (logoBottomY !== null && y > logoBottomY - 14) {
            y = logoBottomY - 14;
        }
        page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
        y -= 18;

        const sectionTitle = 'COMPOSICIÓN / AUTOR / PUBLISHER';
        page.drawText(sectionTitle, { x: marginX, y, size: 11, font: fontBold, color: rgb(0.75, 0.35, 0.1) });
        y -= 12;
        page.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 0.8, color: rgb(0.9, 0.9, 0.9) });
        y -= 14;

        const tableX = marginX;
        const tableW = width - marginX * 2;
        const cols = [
            { key: 'name', w: tableW * 0.42, label: 'COMPOSITOR / AUTOR / PUBLISHER' },
            { key: 'pro', w: tableW * 0.14, label: 'PRO' },
            { key: 'ipi', w: tableW * 0.17, label: 'CAE / IPI' },
            { key: 'split', w: tableW * 0.12, label: 'SPLIT %' },
            { key: 'sig', w: tableW * 0.15, label: 'FIRMA' },
        ];
        const headerH = 18;
        const rowH = 26;

        page.drawRectangle({ x: tableX, y: y - headerH, width: tableW, height: headerH, color: rgb(0.97, 0.94, 0.91), borderColor: rgb(0.85, 0.8, 0.75), borderWidth: 1 });
        let cx = tableX;
        for (const c of cols) {
            page.drawText(c.label, { x: cx + 6, y: y - headerH + 5, size: 8, font: fontBold, color: rgb(0.4, 0.2, 0.08) });
            cx += c.w;
            page.drawLine({ start: { x: cx, y: y - headerH }, end: { x: cx, y }, thickness: 1, color: rgb(0.85, 0.8, 0.75) });
        }
        y -= headerH;

        const collaborators = (splitSheet.collaborators || []) as Collaborator[];
        for (const collab of collaborators) {
            if (y - rowH < 80) break;
            page.drawRectangle({ x: tableX, y: y - rowH, width: tableW, height: rowH, borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1, color: rgb(1, 1, 1) });

            const displayName = this.safeText(collab.legalName || collab.email);
            const nameLines = this.wrapText(displayName, 34).slice(0, 2);

            const statusText = collab.hasSigned ? 'FIRMADO' : 'PENDIENTE';
            const statusColor = collab.hasSigned ? rgb(0.05, 0.55, 0.2) : rgb(0.8, 0.0, 0.0);

            const values: Record<string, string[]> = {
                name: nameLines,
                pro: [this.safeText(collab.proAffiliation)],
                ipi: [this.safeText(collab.ipi)],
                split: [this.formatPercentage(collab.percentage)],
                sig: [statusText],
            };

            let rx = tableX;
            for (const c of cols) {
                const lines = values[c.key] || [''];
                const textYTop = y - 10;
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i] || '';
                    const size = c.key === 'name' ? 9 : 9;
                    const color = c.key === 'sig' ? statusColor : rgb(0.1, 0.1, 0.1);
                    page.drawText(line, { x: rx + 6, y: textYTop - i * 10, size, font, color });
                }

                if (c.key === 'sig' && collab.hasSigned && collab.signedAt) {
                    const signed = this.formatDate(collab.signedAt);
                    if (signed) {
                        page.drawText(signed, { x: rx + 6, y: y - rowH + 4, size: 7, font, color: rgb(0.35, 0.35, 0.35) });
                    }
                }

                rx += c.w;
                page.drawLine({ start: { x: rx, y: y - rowH }, end: { x: rx, y }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
            }
            y -= rowH;
        }

        y -= 22;
        const footerY = 45;
        page.drawLine({ start: { x: marginX, y: footerY + 20 }, end: { x: width - marginX, y: footerY + 20 }, thickness: 0.8, color: rgb(0.9, 0.9, 0.9) });
        page.drawText(`STATUS: ${this.safeText(splitSheet.status)}`, { x: marginX, y: footerY + 5, size: 9, font: fontBold, color: rgb(0.25, 0.25, 0.25) });

        return Buffer.from(await pdfDoc.save());
    }

    async generateFullSplitSheetPdf(splitSheet: SplitSheet): Promise<Buffer> {
        const pdfDoc = await PDFDocument.create();
        const page1 = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page1.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        const marginX = 45;
        const headerTextX = marginX + 75;
        let y = height - 45;
        let logoBottomY: number | null = null;

        const logoPath = this.resolveLogoPngPath();
        if (logoPath) {
            try {
                const logoBytes = readFileSync(logoPath);
                // Limitar tamaño máximo a 500KB para evitar cuelgues
                if (logoBytes.length > 500 * 1024) {
                    console.warn(`Logo too large (${logoBytes.length} bytes), skipping to prevent PDF hang`);
                } else {
                    const logo = await pdfDoc.embedPng(logoBytes);
                    const logoWidth = 35; // Reducido de 60 a 35
                    const logoHeight = (logo.height / logo.width) * logoWidth;
                    const bottomY = y - logoHeight + 8;
                    page1.drawImage(logo, { x: marginX, y: bottomY, width: logoWidth, height: logoHeight });
                    logoBottomY = bottomY;
                }
            } catch (err) {
                console.warn('Logo embed failed, continuing without logo:', err.message);
            }
        }

        page1.drawText('FULL SPLIT-SHEET', { x: headerTextX, y, size: 16, font: fontBold, color: rgb(0.75, 0.55, 0.15) });
        y -= 18;
        page1.drawText('DOCUMENTO DE REPARTO DE DERECHOS DE AUTOR', { x: headerTextX, y, size: 10, font: fontBold, color: rgb(0.4, 0.4, 0.4) });
        y -= 20;

        if (logoBottomY !== null && y > logoBottomY - 10) {
            y = logoBottomY - 10;
        }

        page1.drawText(`Título de la canción: ${this.safeText(splitSheet.title)}`, { x: headerTextX, y, size: 9, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 12;
        page1.drawText(`Fecha: ${this.formatDate(splitSheet.createdAt)}    Sello: ${this.safeText(splitSheet.label)}    Estudio: ${this.safeText(splitSheet.studio)}`, { x: headerTextX, y, size: 9, font, color: rgb(0.15, 0.15, 0.15) });
        y -= 14;
        page1.drawLine({ start: { x: marginX, y }, end: { x: width - marginX, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
        y -= 16;

        const drawGridTable = (page: any, startY: number, title: string, columns: { label: string; w: number }[], rows: string[][]) => {
            let ty = startY;
            page.drawText(title, { x: marginX, y: ty, size: 10, font: fontBold, color: rgb(0.75, 0.35, 0.1) });
            ty -= 10;

            const tableX = marginX;
            const tableW = width - marginX * 2;
            const headerH = 18;
            const rowH = 22;

            page.drawRectangle({ x: tableX, y: ty - headerH, width: tableW, height: headerH, color: rgb(0.97, 0.94, 0.91), borderColor: rgb(0.85, 0.8, 0.75), borderWidth: 1 });
            let cx = tableX;
            for (const c of columns) {
                page.drawText(c.label, { x: cx + 6, y: ty - headerH + 5, size: 8, font: fontBold, color: rgb(0.4, 0.2, 0.08) });
                cx += c.w;
                page.drawLine({ start: { x: cx, y: ty - headerH }, end: { x: cx, y: ty }, thickness: 1, color: rgb(0.85, 0.8, 0.75) });
            }
            ty -= headerH;

            for (const r of rows) {
                page.drawRectangle({ x: tableX, y: ty - rowH, width: tableW, height: rowH, borderColor: rgb(0.9, 0.9, 0.9), borderWidth: 1, color: rgb(1, 1, 1) });
                let rx = tableX;
                for (let i = 0; i < columns.length; i++) {
                    const text = r[i] || '';
                    page.drawText(text, { x: rx + 6, y: ty - 14, size: 9, font, color: rgb(0.1, 0.1, 0.1) });
                    rx += columns[i].w;
                    page.drawLine({ start: { x: rx, y: ty - rowH }, end: { x: rx, y: ty }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
                }
                ty -= rowH;
            }

            return ty;
        };

        const tableW = width - marginX * 2;
        const compCols = [
            { label: 'COMPOSITOR / AUTOR / PUBLISHER', w: tableW * 0.42 },
            { label: 'PRO', w: tableW * 0.14 },
            { label: 'CAE / IPI', w: tableW * 0.17 },
            { label: 'SPLIT %', w: tableW * 0.12 },
            { label: 'FIRMA', w: tableW * 0.15 },
        ];
        const collaborators = (splitSheet.collaborators || []) as Collaborator[];
        const compRows = collaborators.map(c => [
            this.safeText(c.legalName || c.email),
            this.safeText(c.proAffiliation),
            this.safeText(c.ipi),
            this.formatPercentage(c.percentage),
            '',
        ]);
        while (compRows.length < 7) compRows.push(['', '', '', '', '']);
        y = drawGridTable(page1, y, 'COMPOSICIÓN / AUTOR / PUBLISHER', compCols, compRows.slice(0, 7));

        y -= 18;
        const masterCols = [
            { label: 'DUEÑOS DE DERECHOS DEL MÁSTER', w: tableW * 0.36 },
            { label: 'CÉDULA', w: tableW * 0.16 },
            { label: 'RELACIÓN', w: tableW * 0.18 },
            { label: 'SPLIT %', w: tableW * 0.12 },
            { label: 'FIRMA', w: tableW * 0.18 },
        ];
        const masterRows: string[][] = [];
        for (let i = 0; i < 6; i++) masterRows.push(['', '', '', '', '']);
        y = drawGridTable(page1, y, 'DERECHOS DEL MÁSTER (SOUND RECORDING)', masterCols, masterRows);

        page1.drawText(`DOC ID: ${this.safeText(splitSheet.id)}`, { x: marginX, y: 25, size: 8, font, color: rgb(0.5, 0.5, 0.5) });

        const page2 = pdfDoc.addPage([595.28, 841.89]);
        const p2h = page2.getSize().height;
        let y2 = p2h - 60;

        page2.drawText('DETALLES DE INFORMACIÓN Y DATOS IMPORTANTES', { x: marginX, y: y2, size: 12, font: fontBold, color: rgb(0.75, 0.55, 0.15) });
        y2 -= 22;

        const drawLineField = (label: string, value: string) => {
            page2.drawText(label, { x: marginX, y: y2, size: 9, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
            page2.drawText(value || '', { x: marginX + 160, y: y2, size: 9, font, color: rgb(0.1, 0.1, 0.1) });
            page2.drawLine({ start: { x: marginX + 160, y: y2 - 2 }, end: { x: width - marginX, y: y2 - 2 }, thickness: 0.8, color: rgb(0.75, 0.75, 0.75) });
            y2 -= 18;
        };

        drawLineField('Título de la canción:', this.safeText(splitSheet.title));
        drawLineField('Fecha de la creación:', this.formatDate(splitSheet.createdAt));
        drawLineField('Sello disquero:', this.safeText(splitSheet.label));
        drawLineField('Nombre del estudio:', this.safeText(splitSheet.studio));
        drawLineField('Productor:', this.safeText(splitSheet.producerName));

        y2 -= 10;
        page2.drawText('DETALLES DE AUTORES Y/O DUEÑOS DE DERECHOS', { x: marginX, y: y2, size: 12, font: fontBold, color: rgb(0.75, 0.55, 0.15) });
        y2 -= 22;

        const blocks = Math.min(Math.max(collaborators.length, 1), 3);
        for (let i = 0; i < blocks; i++) {
            const c = collaborators[i];
            const header = `AUTOR Y/O DUEÑO DE DERECHOS ${i + 1}`;
            page2.drawText(header, { x: marginX, y: y2, size: 10, font: fontBold, color: rgb(0.2, 0.2, 0.2) });
            y2 -= 16;
            drawLineField('Nombre(s) / Apellido(s):', this.safeText(c ? (c.legalName || c.email) : ''));
            drawLineField('Email:', this.safeText(c ? c.email : ''));
            drawLineField('Teléfono:', this.safeText(c ? c.phone : ''));
            drawLineField('Dirección:', this.safeText(c ? c.address : ''));
            drawLineField('Sociedad (PRO):', this.safeText(c ? c.proAffiliation : ''));
            drawLineField('CAE / IPI:', this.safeText(c ? c.ipi : ''));
            drawLineField('Publishing Company:', this.safeText(c ? c.publishingCompany : ''));
            y2 -= 10;
            if (y2 < 120) break;
        }

        page2.drawText(`DOC ID: ${this.safeText(splitSheet.id)}`, { x: marginX, y: 25, size: 8, font, color: rgb(0.5, 0.5, 0.5) });

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
