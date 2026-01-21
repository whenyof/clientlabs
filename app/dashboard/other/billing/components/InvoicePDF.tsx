"use client"

import { useState } from "react"
import { DocumentTextIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline"
import { type Invoice } from "../mock"

interface InvoicePDFProps {
  invoice: Invoice
  className?: string
}

export function InvoicePDF({ invoice, className }: InvoicePDFProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Simular generación de PDF
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Crear contenido HTML básico para el PDF
      const htmlContent = generateInvoiceHTML(invoice)

      // Aquí iría la lógica real para generar PDF
      // Por ejemplo, usando jsPDF o una librería similar
      console.log('Generando PDF para factura:', invoice.number)
      console.log('HTML Content:', htmlContent)

      // Simular descarga
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Factura-${invoice.number}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

    } catch (error) {
      console.error('Error generando PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <button
      onClick={generatePDF}
      disabled={isGenerating}
      className={`inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed ${className}`}
    >
      {isGenerating ? (
        <div className="w-4 h-4 border border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <ArrowDownTrayIcon className="w-4 h-4" />
      )}
      {isGenerating ? 'Generando...' : 'Descargar PDF'}
    </button>
  )
}

function generateInvoiceHTML(invoice: Invoice): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Factura ${invoice.number}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 40px;
            background: #f8f9fa;
            color: #333;
        }
        .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
        }
        .company-info, .client-info {
            flex: 1;
        }
        .company-info h1 {
            color: #6f42c1;
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .invoice-number {
            background: #6f42c1;
            color: white;
            padding: 10px 20px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: bold;
        }
        .info-section h3 {
            color: #6f42c1;
            margin: 20px 0 10px 0;
            font-size: 16px;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 30px;
        }
        .info-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 4px solid #6f42c1;
        }
        .info-item label {
            display: block;
            font-weight: bold;
            color: #495057;
            margin-bottom: 5px;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
        }
        .table th, .table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #dee2e6;
        }
        .table th {
            background: #f8f9fa;
            font-weight: 600;
            color: #495057;
        }
        .table .text-right {
            text-align: right;
        }
        .table .text-center {
            text-align: center;
        }
        .totals {
            display: flex;
            justify-content: flex-end;
            margin-top: 20px;
        }
        .totals-table {
            width: 300px;
        }
        .totals-table td {
            padding: 8px 15px;
            border: none;
        }
        .totals-table .total-row {
            background: #6f42c1;
            color: white;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #dee2e6;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-paid { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-overdue { background: #f8d7da; color: #721c24; }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <div class="company-info">
                <h1>${invoice.company.name}</h1>
                <p><strong>NIF:</strong> ${invoice.company.nif}</p>
                <p>${invoice.company.address}</p>
            </div>
            <div>
                <div class="invoice-number">Factura ${invoice.number}</div>
            </div>
        </div>

        <div class="info-grid">
            <div class="info-item">
                <label>Cliente:</label>
                <div>${invoice.client.name}</div>
                <div><strong>NIF:</strong> ${invoice.client.nif}</div>
                <div>${invoice.client.address}</div>
                <div><strong>Email:</strong> ${invoice.client.email}</div>
            </div>

            <div class="info-item">
                <label>Detalles de la factura:</label>
                <div><strong>Fecha:</strong> ${new Date(invoice.date).toLocaleDateString('es-ES')}</div>
                <div><strong>Vencimiento:</strong> ${new Date(invoice.dueDate).toLocaleDateString('es-ES')}</div>
                <div><strong>Términos:</strong> ${invoice.paymentTerms}</div>
                <div><strong>Estado:</strong> <span class="status-badge status-${invoice.status}">${invoice.status}</span></div>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th class="text-center">Cant.</th>
                    <th class="text-right">Precio</th>
                    <th class="text-center">IVA</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${invoice.lines.map(line => `
                    <tr>
                        <td>${line.description}</td>
                        <td class="text-center">${line.quantity}</td>
                        <td class="text-right">€${line.unitPrice.toLocaleString('es-ES')}</td>
                        <td class="text-center">${line.taxRate}%</td>
                        <td class="text-right">€${line.total.toLocaleString('es-ES')}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>

        <div class="totals">
            <table class="totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="text-right">€${invoice.subtotal.toLocaleString('es-ES')}</td>
                </tr>
                <tr>
                    <td>IVA:</td>
                    <td class="text-right">€${invoice.taxAmount.toLocaleString('es-ES')}</td>
                </tr>
                <tr class="total-row">
                    <td>Total:</td>
                    <td class="text-right">€${invoice.total.toLocaleString('es-ES')}</td>
                </tr>
            </table>
        </div>

        ${invoice.notes ? `
        <div style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 6px;">
            <h3 style="margin: 0 0 10px 0; color: #6f42c1;">Notas:</h3>
            <p style="margin: 0; line-height: 1.5;">${invoice.notes}</p>
        </div>
        ` : ''}

        <div class="footer">
            <p>Factura generada automáticamente por ClientLabs</p>
            ${invoice.hash ? `<p><small>Hash: ${invoice.hash}</small></p>` : ''}
        </div>
    </div>
</body>
</html>
  `
}