import { CartItemType, OrderType } from "../../types";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonLoading,
} from "@ionic/react";
import { Suspense, lazy, memo, useEffect, useState } from "react";
import { doc, getFirestore } from "firebase/firestore";
import { fetchAndActivate, getValue } from "firebase/remote-config";

import { OrderConvert } from "../../converters/orders";
import { downloadOutline } from "ionicons/icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { phpString } from "../../phpString";
import { useDocumentDataOnce } from "react-firebase-hooks/firestore";
import { useParams } from "react-router";
import { remoteConfig } from "@/main";

const ReceiptItems = lazy(() => import("./ReceiptItems"));
const QRCode = lazy(() => import("react-qr-code"));
const Barcode = lazy(() => import("react-barcode"));

function Receipt() {
  const [ctf_code, set_ctf_code] = useState<string>();
  const { order_id } = useParams<{ order_id: string }>();
  console.log("order_id: ", order_id);

  const db = getFirestore();
  const orderRef = order_id
    ? doc(db, "orders", order_id).withConverter(OrderConvert)
    : null;
  const [order, loading] = useDocumentDataOnce(orderRef);

  console.log("order", order);

  const totalCount = () => {
    let count = 0;
    order?.products.forEach((p) => {
      count += p.quantity;
    });

    console.log("Total Count: ", count);
    return count;
  };

  const [showLoading, dismiss] = useIonLoading();

  const printDocument = async () => {
    showLoading({
      message: "Generating Receipt",
    });
    const input = document.getElementById("receipt");
    const canvas = await html2canvas(input!, { backgroundColor: "white", scale: 4 });
    const inputWidth = input!.offsetWidth;
    const inputHeight = input!.offsetHeight;

    const orientation = inputWidth >= inputHeight ? "l" : "p";

    const pdf = new jsPDF({
      orientation,
      unit: "px",
    });
    pdf.internal.pageSize.width = inputWidth;
    pdf.internal.pageSize.height = inputHeight;

    pdf.addImage(canvas, "SVG", 0, 0, inputWidth, inputHeight);

    pdf.save(`receipt_${order!.id}.pdf`);

    dismiss();
  };

  useEffect(() => {
    const val = getValue(remoteConfig, "CTF_CODE_2")
    set_ctf_code(val.asString());
  }, [])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Order Receipt</IonTitle>
          <IonButtons slot="start">
            <IonBackButton
              defaultHref={`/orders/${order?.id}`}
            ></IonBackButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={() => printDocument()}>
              <IonIcon src={downloadOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div
          id="receipt"
          className="rounded-tl-lg rounded-tr-lg border-4 border-slate-700 w-full text-center ion-padding"
        >
          <IonRow className="text-center">
            <IonCol size="12" className="text-center">
              <IonImg src="/slogan_dark_mode.png" className="w-20 h-auto mx-auto" />
            </IonCol>
          </IonRow>
          <IonText className="font-bold">
            <span>Thank You!</span>
          </IonText>
          <br />
          <IonText color="#555555">
            <span>Your transaction was successful</span>
          </IonText>
          <IonGrid className="ion-margin-vertical">
            <IonRow>
              <IonCol className="ion-text-start">
                <IonText color="#555555">
                  <span>ID Transaction</span>
                </IonText>
              </IonCol>
              <IonCol>
                <IonText color="#555555">
                  <span>{order?.id}</span>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-start">
                <IonText color="#555555">
                  <span>Date</span>
                </IonText>
              </IonCol>
              <IonCol className="ion-text-end">
                <IonText color="#555555">
                  {order?.payment_at && <span>
                    {new Date(order!.payment_at!.toDate()).toDateString()}
                  </span>}
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-start">
                <IonText color="#555555">
                  <span>Time</span>
                </IonText>
              </IonCol>
              <IonCol className="ion-text-end">
                <IonText color="#555555">
                  {order?.payment_at && <span>
                    {new Date(
                      order!.payment_at!.toDate()
                    ).toLocaleTimeString()}
                  </span>}
                </IonText>
              </IonCol>
            </IonRow>

            <IonRow className="ion-margin-vertical">
              <IonCol className="ion-text-start">
                <IonText color="#555555" className="font-bold">
                  <span>Order Details</span>
                </IonText>
              </IonCol>
            </IonRow>
            {order?.products.map(
              (product: CartItemType, index: number) => (
                <ReceiptItems
                  key={"order:" + product.product_id + index}
                  {...product}
                />
              )
            )}
            <IonRow className="ion-margin-vertical">
              <IonCol size="6" className="text-left">
                <IonText>Total Items</IonText>
              </IonCol>
              <IonCol size="6" className="text-right">
                <IonText className="ml-auto">x {totalCount()}</IonText>
              </IonCol>
            </IonRow>

            <IonRow className="ion-margin-top">
              <IonCol className="ion-text-start" size="12">
                <IonText color="#555555" className="font-bold">
                  Payment Summary
                </IonText>
              </IonCol>
              <IonCol className="ion-text-start">
                <IonText color="#555555">Total Price</IonText>
              </IonCol>
              <IonCol className="ion-text-end">
                <IonText color="#555555">
                  {phpString.format(order?.total_price ?? 0)}
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-start">
                <IonText color="#555555">
                  <span>Payment Method</span>
                </IonText>
              </IonCol>
              <IonCol className="ion-text-end">
                <IonText color="#555555">
                  <span>{order?.payment_option}</span>
                </IonText>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-start">
                <IonText color="#555555">
                  {order?.delivery_option}
                </IonText>
              </IonCol>
              <IonCol className="ion-text-end">
                <IonText color="#555555">
                  {order?.branch+""}
                </IonText>
              </IonCol>
            </IonRow>

            <IonRow className="ion-margin-top ion-no-padding">
              <Suspense>
                <Barcode value={order?.id! ?? ctf_code} />
              </Suspense>
            </IonRow>
            <IonRow className="ion-margin-top ion-padding w-full flex justify-center">
              <Suspense>
                <QRCode value={order?.id ?? ""} style={{
                  maxWidth: "70%"
                }} />
              </Suspense>
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  )
}

export default memo(Receipt);
