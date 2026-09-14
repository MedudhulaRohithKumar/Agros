/**
 * Clean thermal / PDF receipt printer
 * Opens an isolated print context with pure receipt styling to ensure
 * NO blank pages, NO browser URLs, NO app navigation bars, and crisp layout.
 */
export function printReceipt(order) {
    if (!order) return;

    const printWindow = window.open('', '_blank', 'width=450,height=650');
    if (!printWindow) {
        alert('Please allow popups to print the receipt.');
        return;
    }

    const itemsHtml = (order.items || []).map(item => `
        <tr>
            <td style="padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
                <div style="font-weight: 700; color: #1e293b;">${escapeHtml(item.productName)}</div>
                <div style="font-size: 10px; color: #64748b; font-family: monospace;">${escapeHtml(item.barcode)}</div>
            </td>
            <td style="text-align: center; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600;">${item.quantity}</td>
            <td style="text-align: right; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-family: monospace;">₹${Number(item.unitPrice).toFixed(2)}</td>
            <td style="text-align: right; padding: 5px 0; border-bottom: 1px solid #f1f5f9; font-weight: 700; font-family: monospace;">₹${Number(item.subTotal).toFixed(2)}</td>
        </tr>
    `).join('');

    const discountRow = order.discountType && order.discountType !== 'NONE' ? `
        <div style="display: flex; justify-content: space-between; color: #059669; font-weight: 700; margin-bottom: 4px;">
            <span>Discount (${order.discountType === 'PERCENTAGE' ? `${order.discountValue}%` : `Flat ₹${order.discountValue}`}):</span>
            <span style="font-family: monospace;">-₹${Number(order.discountAmount || 0).toFixed(2)}</span>
        </div>
    ` : '';

    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Receipt - ${escapeHtml(order.invoiceNumber || 'INV')}</title>
            <style>
                @page {
                    size: 80mm auto;
                    margin: 4mm;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    font-size: 12px;
                    line-height: 1.4;
                    color: #0f172a;
                    background: #ffffff;
                    margin: 0;
                    padding: 8px;
                }
                .container {
                    max-width: 320px;
                    margin: 0 auto;
                }
                .header {
                    text-align: center;
                    border-bottom: 2px dashed #cbd5e1;
                    padding-bottom: 12px;
                    margin-bottom: 10px;
                }
                .logo {
                    font-size: 24px;
                    margin-bottom: 4px;
                }
                .shop-name {
                    font-size: 18px;
                    font-weight: 900;
                    letter-spacing: -0.5px;
                    margin: 0;
                    color: #0f172a;
                }
                .tagline {
                    font-size: 10px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #059669;
                    margin-top: 2px;
                }
                .invoice-no {
                    font-size: 12px;
                    font-weight: 800;
                    font-family: monospace;
                    margin-top: 6px;
                    color: #334155;
                }
                .date {
                    font-size: 10px;
                    color: #64748b;
                }
                .meta {
                    border-bottom: 1px dashed #cbd5e1;
                    padding-bottom: 8px;
                    margin-bottom: 10px;
                    font-size: 11px;
                }
                .meta-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 3px;
                }
                .meta-label {
                    color: #64748b;
                }
                .meta-value {
                    font-weight: 700;
                    color: #0f172a;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                    font-size: 11px;
                }
                th {
                    text-align: left;
                    font-weight: 800;
                    color: #64748b;
                    font-size: 10px;
                    text-transform: uppercase;
                    border-bottom: 1px solid #cbd5e1;
                    padding-bottom: 4px;
                }
                th.right {
                    text-align: right;
                }
                th.center {
                    text-align: center;
                }
                .totals {
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 8px;
                    margin-bottom: 12px;
                    font-size: 11px;
                }
                .total-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                }
                .grand-total {
                    display: flex;
                    justify-content: space-between;
                    font-size: 16px;
                    font-weight: 900;
                    color: #0f172a;
                    border-top: 2px solid #0f172a;
                    padding-top: 6px;
                    margin-top: 6px;
                }
                .grand-total .amount {
                    color: #059669;
                    font-family: monospace;
                }
                .footer {
                    text-align: center;
                    font-size: 10px;
                    color: #64748b;
                    border-top: 1px dashed #cbd5e1;
                    padding-top: 10px;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">🌾</div>
                    <h1 class="shop-name">Agros Fertilizer Shop</h1>
                    <div class="tagline">Official Tax Invoice</div>
                    <div class="invoice-no">${escapeHtml(order.invoiceNumber || 'INV')}</div>
                    <div class="date">${new Date(order.createdAt).toLocaleString()}</div>
                </div>

                <div class="meta">
                    <div class="meta-row">
                        <span class="meta-label">Customer:</span>
                        <span class="meta-value">${escapeHtml(order.customerName || 'Walk-in')}</span>
                    </div>
                    ${order.customerMobile ? `
                        <div class="meta-row">
                            <span class="meta-label">Mobile:</span>
                            <span class="meta-value" style="font-family: monospace;">${escapeHtml(order.customerMobile)}</span>
                        </div>
                    ` : ''}
                    <div class="meta-row">
                        <span class="meta-label">Payment Mode:</span>
                        <span class="meta-value" style="color: #059669;">${escapeHtml(order.paymentMethod || 'CASH')}</span>
                    </div>
                    ${order.cashier ? `
                        <div class="meta-row">
                            <span class="meta-label">Billed By:</span>
                            <span class="meta-value">${escapeHtml(order.cashier)}</span>
                        </div>
                    ` : ''}
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th class="center">Qty</th>
                            <th class="right">Rate</th>
                            <th class="right">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="totals">
                    <div class="total-row">
                        <span style="color: #64748b;">Subtotal:</span>
                        <span style="font-family: monospace; font-weight: 700;">₹${Number(order.totalAmount || 0).toFixed(2)}</span>
                    </div>
                    ${discountRow}
                    <div class="grand-total">
                        <span>Total Paid</span>
                        <span class="amount">₹${Number(order.finalAmount || 0).toFixed(2)}</span>
                    </div>
                </div>

                <div class="footer">
                    Thank you for choosing Agros! 🌱<br/>
                    Fertilizers & Crop Care Center
                </div>
            </div>

            <script>
                window.onload = function() {
                    window.print();
                    setTimeout(function() {
                        window.close();
                    }, 500);
                };
            </script>
        </body>
        </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
