const PDFDocument = require('pdfkit');

const generateInvoicePDF = (order, dataCallback, endCallback) => {
  const doc = new PDFDocument({ margin: 50 });

  doc.on('data', dataCallback);
  doc.on('end', endCallback);

  // Header
  doc.fillColor('#d97706')
     .fontSize(24)
     .text('NAIVADYAM', 50, 45)
     .fillColor('#475569')
     .fontSize(10)
     .text('Authentic & Premium E-Commerce Store', 50, 75);

  doc.fillColor('#0f172a')
     .fontSize(20)
     .text('INVOICE', 400, 45, { align: 'right' })
     .fontSize(10)
     .text(`Invoice No: INV-${order._id.toString().slice(-8).toUpperCase()}`, 400, 70, { align: 'right' })
     .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 400, 85, { align: 'right' })
     .text(`Status: ${order.orderStatus}`, 400, 100, { align: 'right' });

  doc.moveTo(50, 120).lineTo(550, 120).stroke('#cbd5e1');

  // Customer & Shipping Info
  doc.fontSize(12).fillColor('#d97706').text('Billed & Shipped To:', 50, 135);
  doc.fontSize(10).fillColor('#0f172a')
     .text(order.shippingAddress.name, 50, 155)
     .text(order.shippingAddress.street, 50, 170)
     .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`, 50, 185)
     .text(`Phone: ${order.shippingAddress.phone}`, 50, 200);

  doc.fontSize(12).fillColor('#d97706').text('Payment Summary:', 350, 135);
  doc.fontSize(10).fillColor('#0f172a')
     .text(`Method: ${order.paymentMethod}`, 350, 155)
     .text(`Payment Status: ${order.paymentStatus}`, 350, 170)
     .text(`Tracking ID: ${order.trackingDetails?.trackingId || 'N/A'}`, 350, 185);

  doc.moveTo(50, 225).lineTo(550, 225).stroke('#cbd5e1');

  // Items Table Header
  let y = 240;
  doc.fillColor('#f8fafc').rect(50, y, 500, 20).fill('#1e293b');
  doc.fillColor('#ffffff').fontSize(10)
     .text('Item Description', 60, y + 5)
     .text('Qty', 330, y + 5, { width: 40, align: 'center' })
     .text('Price', 380, y + 5, { width: 70, align: 'right' })
     .text('Total', 460, y + 5, { width: 80, align: 'right' });

  y += 25;
  doc.fillColor('#0f172a');
  order.orderItems.forEach(item => {
    doc.text(item.title.substring(0, 45), 60, y)
       .text(item.quantity.toString(), 330, y, { width: 40, align: 'center' })
       .text(`INR ${item.price.toLocaleString()}`, 380, y, { width: 70, align: 'right' })
       .text(`INR ${(item.price * item.quantity).toLocaleString()}`, 460, y, { width: 80, align: 'right' });
    y += 20;
  });

  doc.moveTo(50, y + 5).lineTo(550, y + 5).stroke('#cbd5e1');
  y += 15;

  // Totals
  doc.text('Subtotal:', 350, y, { width: 100, align: 'left' })
     .text(`INR ${order.priceBreakup.subtotal.toLocaleString()}`, 460, y, { width: 80, align: 'right' });
  y += 18;

  if (order.priceBreakup.discount > 0) {
    doc.text('Coupon Discount:', 350, y, { width: 100, align: 'left' })
       .text(`- INR ${order.priceBreakup.discount.toLocaleString()}`, 460, y, { width: 80, align: 'right' });
    y += 18;
  }

  doc.text('Estimated Tax (5%):', 350, y, { width: 100, align: 'left' })
     .text(`INR ${order.priceBreakup.tax.toLocaleString()}`, 460, y, { width: 80, align: 'right' });
  y += 18;

  doc.text('Shipping Fee:', 350, y, { width: 100, align: 'left' })
     .text(order.priceBreakup.shipping === 0 ? 'FREE' : `INR ${order.priceBreakup.shipping}`, 460, y, { width: 80, align: 'right' });
  y += 22;

  doc.fontSize(12).fillColor('#d97706')
     .text('Grand Total:', 350, y, { width: 100, align: 'left' })
     .text(`INR ${order.priceBreakup.total.toLocaleString()}`, 460, y, { width: 80, align: 'right' });

  // Footer
  doc.fontSize(9).fillColor('#64748b')
     .text('Thank you for shopping with Naivadyam! For support, visit naivadyam.com/support', 50, 700, { align: 'center' });

  doc.end();
};

module.exports = { generateInvoicePDF };
