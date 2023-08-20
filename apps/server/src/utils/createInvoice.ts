import {
  CartItemType,
  DeliveryAddressType,
  Ice,
  Milk,
  OrderType,
  PaymentStatusType,
  Size,
  Syrup,
  invoiceType,
} from "../types";

import PDFDocument from "pdfkit";
import fs from "fs";

/**
 * Returns a string describing the order based on the provided CartItemType.
 * @param props - The CartItemType to describe.
 * @returns A string describing the order.
 */
export default function OrderDescription(props: CartItemType) {
  // The function takes in a CartItemType object as a parameter, which contains information about the order.
  // It then constructs an array of strings based on the properties of the CartItemType object.
  // If a property is not set (e.g. size is Size.None), it is excluded from the array.
  // The array is then filtered to remove any falsy values (e.g. false, undefined, null, 0, ""), and joined into a single string with commas.
  return [
    props.size !== Size.None ? "Size " + props.size : false,
    props.milk !== Milk.None ? props.milk : false,
    props.syrup !== Syrup.None ? props.syrup : false,
    props.ice !== Ice.None ? props.ice + " Ice" : false,
    props.additives && props.additives.length != 0
      ? props.additives.join(", ")
      : false,
  ]
    .filter(Boolean)
    .join(", ");
}

/**
 * Generates an invoice object based on the provided OrderType and DeliveryAddressType.
 * @param _order - The OrderType object containing information about the order.
 * @param _deliveryAddress - The DeliveryAddressType object containing information about the delivery address.
 * @returns An invoiceType object containing information about the invoice.
 */
function shim(_order: OrderType, _deliveryAddress: DeliveryAddressType) {
  const address = [
    _deliveryAddress.unit_number ?? "",
    _deliveryAddress.street_number ?? "",
    _deliveryAddress.street_name ?? "",
    _deliveryAddress.barangay ?? "",
  ];

  const invoice: invoiceType = {
    shipping: {
      name: _deliveryAddress.name,
      address: address
        .filter((a) => {
          return a !== "" && a != undefined;
        })
        .join(","),
      city: _deliveryAddress.city,
      postal_code: _deliveryAddress.postal_code!,
      country: "Philippines",
    },
    items: _order.products.map((product) => {
      return {
        item: product.product_snapshot.name,
        description: OrderDescription(product),
        quantity: product.quantity,
        amount: product.product_snapshot.price * product.quantity,
      };
    }),
    payment_method: _order.payment_option,
    payment_status: _order.payment_status,
    subtotal: _order.total_price,
    paid: _order.total_price,
    invoice_nr: _order.id?.toString()!,
  };

  return invoice;
}

/**
 * Creates a PDF invoice based on the provided invoiceType and OrderType.
 * @param invoice - The invoiceType object containing information about the invoice.
 * @param _order - The OrderType object containing information about the order.
 * @param path - Optional. The path to write the PDF file to. If not provided, the PDF will not be written to the filesystem.
 * @returns A PDFDocument object containing the invoice.
 */
function createInvoice(
  invoice: invoiceType,
  _order: OrderType,
  dataCallback: (chunk: any) => void,
  endCallback: () => void
) {
  let doc = new PDFDocument({ size: "A4", margin: 50 });
  doc.on("data", dataCallback);
  doc.on("end", endCallback);
  // const pdfStream = fs.createWriteStream(`invoice_${_order.id}.pdf`);
  // doc.pipe(pdfStream);

  generateHeader(doc);
  generateCustomerInformation(doc, invoice);
  generateInvoiceTable(doc, invoice);
  generateFooter(doc, invoice);

  doc.end();

  return doc;
}

function generateHeader(doc: PDFKit.PDFDocument) {
  doc
    .image("src/assets/slogan.png", 50, 45, {
      width: 50,
    })
    .fillColor("#444444")
    .fontSize(20)
    .text("The Coffee Lounge", 110, 57)
    .fontSize(10)
    .text("The Coffee Lounge - Makati Branch", 200, 50, { align: "right" })
    .text("1760 Evangelista, Bangkal", 200, 65, { align: "right" })
    .text("Makati, 1233 Metro Manila", 200, 80, { align: "right" })
    .moveDown();
}

function generateCustomerInformation(
  doc: PDFKit.PDFDocument,
  invoice: invoiceType
) {
  doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

  generateHr(doc, 185);

  const customerInformationTop = 200;

  doc
    .fontSize(10)
    .text("Invoice Number:", 50, customerInformationTop)
    .font("src/assets/arialbd.ttf")
    .text(invoice.invoice_nr, 150, customerInformationTop)
    .font("src/assets/arial.ttf")
    .text("Invoice Date:", 50, customerInformationTop + 15)
    .text(formatDate(new Date()), 150, customerInformationTop + 15)
    .text("Balance Due:", 50, customerInformationTop + 30)
    .text(
      formatCurrency(invoice.subtotal - invoice.paid),
      150,
      customerInformationTop + 30
    )

    .font("src/assets/arialbd.ttf")
    .text(invoice.shipping.name, 300, customerInformationTop)
    .font("src/assets/arial.ttf")
    .text(invoice.shipping.address, 300, customerInformationTop + 15)
    .text(
      invoice.shipping.city + ", " + invoice.shipping.country,
      300,
      customerInformationTop + 30
    )
    .moveDown();

  generateHr(doc, 252);
}

function generateInvoiceTable(doc: PDFKit.PDFDocument, invoice: invoiceType) {
  let i;
  const invoiceTableTop = 330;

  doc.font("src/assets/arialbd.ttf");
  generateTableRow(
    doc,
    invoiceTableTop,
    "Item",
    "Description",
    "Unit Cost",
    "Qty",
    "Line Total"
  );
  generateHr(doc, invoiceTableTop + 20);
  doc.font("src/assets/arial.ttf");

  for (i = 0; i < invoice.items.length; i++) {
    const item = invoice.items[i];
    const position = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      position,
      item.item,
      item.description,
      formatCurrency(item.amount / item.quantity),
      item.quantity,
      formatCurrency(item.amount)
    );

    generateHr(doc, position + 20);
  }

  const subtotalPosition = invoiceTableTop + (i + 1) * 30;
  generateTableRow(
    doc,
    subtotalPosition,
    "",
    "",
    "Subtotal",
    "",
    formatCurrency(invoice.subtotal)
  );

  const paidToDatePosition = subtotalPosition + 20;
  generateTableRow(
    doc,
    paidToDatePosition,
    "",
    "",
    "Paid To Date",
    "",
    formatCurrency(invoice.paid)
  );

  const paymentMethodPosition = paidToDatePosition + 25;
  generateTableRow(
    doc,
    paymentMethodPosition,
    "",
    "",
    "Payment Method",
    "",
    invoice.payment_method
  );

  const duePosition = paymentMethodPosition + 35;
  doc.font("src/assets/arialbd.ttf");
  generateTableRow(
    doc,
    duePosition,
    "",
    "",
    "Balance Due",
    "",
    formatCurrency(invoice.subtotal - invoice.paid)
  );
  doc.font("src/assets/arial.ttf");
}

function generateFooter(doc: PDFKit.PDFDocument, invoice: invoiceType) {
  const end = "Thank you for your business.";

  doc
    .fontSize(10)
    .text(
      invoice.payment_status === PaymentStatusType.Paid
        ? `Payment is fully paid. ${end}`
        : `Payment is due within 15 days. ${end}`,
      50,
      780,
      { align: "center", width: 500 }
    );
}

function generateTableRow(
  doc: PDFKit.PDFDocument,
  y: number,
  item: string,
  description: string,
  unitCost: string,
  quantity: number | string,
  lineTotal: string
) {
  doc
    .fontSize(10)
    .text(item, 50, y, { height: 100 })
    .fontSize(7)
    .text(description, 180, y, { width: 200 })
    .fontSize(10)
    .text(unitCost, 350, y, { width: 90, align: "right", height: 100 })
    .text(quantity.toString(), 385, y, {
      width: 90,
      align: "right",
      height: 100,
    })
    .text(lineTotal, 0, y, { align: "right", height: 100 });
}

function generateHr(doc: PDFKit.PDFDocument, y: number) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

function formatCurrency(money: number) {
  return "₱ " + money.toFixed(2);
}

function formatDate(date: Date) {
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return year + "/" + month + "/" + day;
}

export { createInvoice, shim };
