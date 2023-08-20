import { NextFunction, Request, Response } from "express";

import { Addresses } from "src/constants";
import { OrderConvert } from "../converters/orders";
import { Router } from "express";
import { appCheckVerification } from ".";
import { createInvoice } from "src/utils/createInvoice";
import { getFirestore } from "firebase-admin/firestore";
import { shim } from "src/utils/createInvoice";

const r = Router();
r.use(appCheckVerification)

const receipt = async (req: Request, res: Response, _next: NextFunction) => {
  const db = getFirestore();
  const orderId = req.params.order_id;

  // fetch order data
  const orderRef = db
    .collection("orders")
    .doc(orderId)
    .withConverter(OrderConvert);
  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    res.status(404);
    return res.json({
      data: null,
      msg: "Order not found!",
    });
  } else {
    const orderData = orderDoc.data();

    // create invoice
    const invoice = shim(orderData!, Addresses[0]);

    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=order.pdf",
    });

    // create invoice pdf
    const doc = createInvoice(
      invoice,
      orderData!,
      (chunk: any) => stream.write(chunk),
      () => stream.end()
    );
  }
};

r.get("/receipt/:order_id", receipt);
