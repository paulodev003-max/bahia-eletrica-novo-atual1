import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Budget, UserSettings } from '../../types';

// Colors matching the reference
const BLUE = [26, 55, 112]; // Dark blue for headers
const WHITE = [255, 255, 255];
const BLACK = [0, 0, 0];
const GRAY_BG = [245, 245, 245];
const GRAY_TEXT = [100, 100, 100];

export const generateBudgetPDF = (budget: Budget, userSettings?: UserSettings) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    // Helper function to draw section header
    const drawSectionHeader = (y: number, title: string) => {
        doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
        doc.rect(margin, y, contentWidth, 6, 'F');
        doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(title, margin + 2, y + 4);
        return y + 6;
    };

    let y = 10;

    // === HEADER SECTION ===

    // Company logo placeholder (left)
    try {
        doc.addImage('/logo_bahia.jpg', 'JPEG', margin, y, 35, 20);
    } catch (e) {
        doc.setFillColor(200, 200, 200);
        doc.rect(margin, y, 35, 20, 'F');
        doc.setTextColor(100, 100, 100);
        doc.setFontSize(8);
        doc.text('LOGO', margin + 17, y + 12, { align: 'center' });
    }

    // Company info (right)
    const companyName = userSettings?.companyName || 'Bahia Elétrica & Automação';
    const companyCNPJ = userSettings?.companyCNPJ || '00.000.000/0001-00';
    const companyAddress = userSettings?.companyAddress || 'Rua Exemplo, 123 - Centro';
    const companyCity = userSettings?.companyCity || 'Salvador - BA - 40000-000';
    const companyPhone = userSettings?.companyPhone || '(71) 99999-9999';
    const companyEmail = userSettings?.companyEmail || 'contato@bahiaeletrica.com.br';

    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(companyName, pageWidth - margin, y + 5, { align: 'right' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(companyCNPJ, pageWidth - margin, y + 10, { align: 'right' });
    doc.text(companyAddress, pageWidth - margin, y + 15, { align: 'right' });
    doc.text(`${companyCity}`, pageWidth - margin, y + 20, { align: 'right' });
    doc.text(`${companyEmail} - ${companyPhone}`, pageWidth - margin, y + 25, { align: 'right' });

    y += 32;

    // === PEDIDO NUMBER BOX ===

    doc.setFillColor(BLUE[0], BLUE[1], BLUE[2]);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setTextColor(WHITE[0], WHITE[1], WHITE[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const budgetNumber = budget.id ? budget.id.slice(-8).toUpperCase() : '00000000';
    doc.text(`Pedido: ${budgetNumber}`, pageWidth / 2, y + 7, { align: 'center' });

    y += 12;

    // === STATUS ROW ===

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);

    autoTable(doc, {
        startY: y,
        head: [['Status', 'Comercialização', 'Fechamento', 'Consultor / Vendedor']],
        body: [[
            budget.status === 'approved' ? 'APROVADO' : budget.status === 'rejected' ? 'REJEITADO' : 'PENDENTE',
            new Date(budget.date).toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            budget.validityDate ? new Date(budget.validityDate).toLocaleDateString('pt-BR') + ' 12:00' : '-',
            userSettings?.fullName || 'Vendedor' + ' - ' + (userSettings?.companyEmail || '')
        ]],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, textColor: BLACK },
        headStyles: { fillColor: GRAY_BG, textColor: BLACK, fontStyle: 'bold', fontSize: 8 },
        margin: { left: margin, right: margin }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // === 1 DADOS DO CLIENTE ===

    y = drawSectionHeader(y, '1 Dados do Cliente');

    const customerData = [
        ['Razão / Fantasia', budget.customerName || 'Cliente'],
        ['Contato', '', 'Email', budget.customerEmail || ''],
        ['Fone Fixo', budget.customerPhone || '', 'Celular', ''],
        ['Endereço', budget.customerAddress || 'Endereço não informado']
    ];

    autoTable(doc, {
        startY: y,
        body: [
            [{ content: 'Razão / Fantasia', styles: { fontStyle: 'bold' } }, { content: budget.customerName || 'Cliente', colSpan: 3 }],
            [{ content: 'Contato', styles: { fontStyle: 'bold' } }, '', { content: 'Email', styles: { fontStyle: 'bold' } }, budget.customerEmail || ''],
            [{ content: 'Fone Fixo', styles: { fontStyle: 'bold' } }, budget.customerPhone || '', { content: 'Celular', styles: { fontStyle: 'bold' } }, ''],
            [{ content: 'Endereço', styles: { fontStyle: 'bold' } }, { content: budget.customerAddress || 'Endereço não informado', colSpan: 3 }]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, textColor: BLACK },
        margin: { left: margin, right: margin }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // === 2 PRODUTOS / SERVIÇOS ===

    y = drawSectionHeader(y, '2 Produtos / Serviços');

    const itemsHead = [['Imagem | Código | Descrição | Unidade', 'Qtd.', 'V. Unit.', 'IPI', 'Desconto', 'Subtotal']];
    const itemsBody = (budget.items || []).map(item => [
        `${item.name}\n${item.type === 'product' ? 'Produto' : 'Serviço'}`,
        item.quantity.toString(),
        item.unitPrice.toFixed(2),
        '0,00',
        '0,00',
        item.total.toFixed(2)
    ]);

    autoTable(doc, {
        startY: y,
        head: itemsHead,
        body: itemsBody.length > 0 ? itemsBody : [['Nenhum item', '-', '-', '-', '-', '-']],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, textColor: BLACK },
        headStyles: { fillColor: GRAY_BG, textColor: BLACK, fontStyle: 'bold', fontSize: 8 },
        columnStyles: {
            0: { cellWidth: 90 },
            1: { halign: 'center', cellWidth: 15 },
            2: { halign: 'right', cellWidth: 20 },
            3: { halign: 'right', cellWidth: 15 },
            4: { halign: 'right', cellWidth: 20 },
            5: { halign: 'right', cellWidth: 20, fontStyle: 'bold' }
        },
        margin: { left: margin, right: margin }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // === 2.1 TOTALIZADORES ===

    y = drawSectionHeader(y, '2.1 Totalizadores');

    const subtotal = (budget.items || []).reduce((acc, i) => acc + (i.total || 0), 0);
    const totalQtd = (budget.items || []).reduce((acc, i) => acc + (i.quantity || 0), 0);
    const productCount = (budget.items || []).filter(i => i.type === 'product').length;
    const serviceCount = (budget.items || []).filter(i => i.type === 'service').length;
    const productTotal = (budget.items || []).filter(i => i.type === 'product').reduce((acc, i) => acc + (i.total || 0), 0);
    const serviceTotal = (budget.items || []).filter(i => i.type === 'service').reduce((acc, i) => acc + (i.total || 0), 0);

    autoTable(doc, {
        startY: y,
        body: [
            [
                { content: 'Soma de Itens', styles: { fontStyle: 'bold' } }, (budget.items || []).length.toString(),
                { content: 'IPI', styles: { fontStyle: 'bold' } }, '0,00'
            ],
            [
                { content: 'Soma das Qtdes', styles: { fontStyle: 'bold' } }, totalQtd.toString(),
                { content: 'Frete', styles: { fontStyle: 'bold' } }, '0,00'
            ],
            [
                { content: 'Produtos', styles: { fontStyle: 'bold' } }, productTotal.toFixed(2),
                { content: 'Desconto', styles: { fontStyle: 'bold' } }, (budget.discount || 0).toFixed(2)
            ],
            [
                { content: 'Serviços', styles: { fontStyle: 'bold' } }, serviceTotal.toFixed(2),
                { content: 'Total Geral', styles: { fontStyle: 'bold', fillColor: GRAY_BG } },
                { content: (budget.totalValue || subtotal).toFixed(2), styles: { fontStyle: 'bold', fillColor: GRAY_BG } }
            ]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, textColor: BLACK },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 55 },
            2: { cellWidth: 35 },
            3: { cellWidth: 55, halign: 'right' }
        },
        margin: { left: margin, right: margin }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // === 3 FORMA DE PARCELAMENTO ===

    y = drawSectionHeader(y, '3 Forma de Parcelamento: ' + (budget.paymentMethod || 'À Vista'));

    autoTable(doc, {
        startY: y,
        head: [['Dias', 'Vencimento', 'Forma de Pagamento', 'Valor']],
        body: [
            ['30', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'), budget.paymentMethod || 'PIX / TRANSFERÊNCIA', (budget.totalValue || 0).toFixed(2)]
        ],
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 2, textColor: BLACK },
        headStyles: { fillColor: GRAY_BG, textColor: BLACK, fontStyle: 'bold', fontSize: 8 },
        columnStyles: {
            0: { halign: 'center', cellWidth: 20 },
            1: { halign: 'center', cellWidth: 30 },
            2: { cellWidth: 90 },
            3: { halign: 'right', cellWidth: 40 }
        },
        margin: { left: margin, right: margin }
    });

    y = (doc as any).lastAutoTable.finalY + 2;

    // === 4 DETALHAMENTO / OBSERVAÇÕES ===

    y = drawSectionHeader(y, '4 Detalhamento / Observações');

    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, y, contentWidth, 12, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    const notes = budget.notes || 'Sem observações adicionais.';
    const splitNotes = doc.splitTextToSize(notes, contentWidth - 4);
    doc.text(splitNotes, margin + 2, y + 4);

    y += 14;

    // === 5 OBSERVAÇÕES DE GARANTIA ===

    y = drawSectionHeader(y, '5 Observações de Garantia');

    doc.rect(margin, y, contentWidth, 12, 'S');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    const warrantyText = budget.warrantyNotes || 'Garantia conforme especificações do fabricante. Serviços com garantia de 90 dias.';
    const splitWarranty = doc.splitTextToSize(warrantyText, contentWidth - 4);
    doc.text(splitWarranty, margin + 2, y + 5);

    y += 12;

    // Declaration text
    doc.setFontSize(7);
    doc.setTextColor(BLACK[0], BLACK[1], BLACK[2]);
    doc.text('Declaro ter conferido a quantidade, e as condições dos produtos/serviços entregues, dando plena quitação do feito, para mais nada reclamar.', margin, y + 3);

    y += 8;

    // === 6 DADOS DE ACEITE DO PEDIDO ===

    y = drawSectionHeader(y, '6 Dados de Aceite do Pedido');

    // Signature area
    doc.rect(margin, y, contentWidth, 18, 'S');

    // Add signature if exists
    if (budget.signature) {
        try {
            doc.addImage(budget.signature, 'PNG', margin + 80, y + 1, 50, 15);
        } catch (e) {
            // Continue without signature
        }
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Data', margin + 5, y + 8);
    doc.text('Assinatura: ' + (budget.customerName || 'Cliente').toUpperCase(), pageWidth / 2, y + 8, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.line(margin + 15, y + 12, margin + 50, y + 12);

    y += 22;

    // === FOOTER ===

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    const now = new Date();
    const dateTimeStr = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) +
        ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    doc.setFontSize(7);
    doc.setTextColor(GRAY_TEXT[0], GRAY_TEXT[1], GRAY_TEXT[2]);
    doc.text(dateTimeStr, margin, pageHeight - 8);
    doc.text('Gerado por ' + (userSettings?.fullName || 'Sistema'), margin + 70, pageHeight - 8);
    doc.text('Página 1 de 1', pageWidth - margin - 20, pageHeight - 8);

    doc.setFontSize(6);
    doc.text('Informações geradas através do sistema BAHIA ELÉTRICA - ' + (userSettings?.companyEmail || 'contato@bahiaeletrica.com.br'), pageWidth / 2, pageHeight - 4, { align: 'center' });

    // Save with proper filename
    const fileName = `Proposta_${budgetNumber}.pdf`;
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 100);
};
