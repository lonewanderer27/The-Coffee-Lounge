import { DeliveryStatusType, OrderType, PaymentStatusType } from "../../types";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFooter,
  IonGrid,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import { doc, getFirestore } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import AnimatedImg from "../../components/AnimatedImg";
import { Branches } from "../../constants";
import { OrderConvert } from "../../converters/orders";
import OrderDescription from "../../utils";
import { PaymentOptionType } from "coffee-lounge-types";
import { orderAtom } from "../../atoms/order";
import { paymentGatewayURL } from "@/hooks/checkout";
import { phpString } from "../../phpString";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useParams } from "react-router";

const Data = (props: { order_id: string; orderDetails: OrderType | null }) => {
  const setOrderDetails = useSetRecoilState(orderAtom);
  const db = getFirestore();
  const [totalCount, setTotalCount] = useState(0);
  const [order, loading] = useDocumentData(
    doc(db, "orders", props.order_id ?? props.orderDetails?.id).withConverter(
      OrderConvert
    ).withConverter(OrderConvert)
  );

  console.log("order", order);

  useEffect(() => {
    if (order) {
      let count = 0;
      order!.products.forEach((p) => {
        count += p.quantity;
      });

      setTotalCount(count);
      setOrderDetails(order);
    }
  }, [order]);

  return (
    <IonGrid>
      <IonRow>
        <IonList className="ion-no-margin">
          {order?.products
            .filter((product) => product.product_snapshot)
            .map((product, index) => (
              <IonItem
                key={`ionitem:${product.product_id}:${index}`}
                className="m-0"
              >
                <IonRow>
                  <IonCol size="2">
                    <div className="bg-slate-200 dark:bg-gray-700 p-2 rounded-xl w-full">
                      <AnimatedImg
                        src={product.product_snapshot.image}
                        alt={product.product_snapshot.name}
                      />
                    </div>
                  </IonCol>
                  <IonCol size="7" className="ion-padding-start">
                    <div className="flex flex-col">
                      <div>
                        <IonText className="font-semibold">
                          {product.product_snapshot.name}
                        </IonText>
                      </div>
                      <div className="pt-2">{OrderDescription(product)}</div>
                    </div>
                  </IonCol>
                  <IonCol size="3">
                    <div>
                      <IonText>
                        {phpString.format(
                          product.quantity * product.product_snapshot.price
                        )}
                      </IonText>
                    </div>
                    <div className="pt-2">
                      <IonText>x {product.quantity}</IonText>
                    </div>
                  </IonCol>
                </IonRow>
              </IonItem>
            ))}
        </IonList>
      </IonRow>
      <IonRow className="ion-margin-top w-full">
        <IonCol size="8" className="text-right">
          <IonText className="text-right w-full">Items</IonText>
        </IonCol>
        <IonCol size="4" className="text-center">
          x {totalCount}
        </IonCol>
      </IonRow>
      <IonRow className="m-0 w-full">
        <IonCol size="8" className="text-right">
          <IonText className="text-right w-full ">Total Price</IonText>
        </IonCol>
        <IonCol size="4" className="text-center font-bold">
          {phpString.format(order?.total_price || 0)}
        </IonCol>
      </IonRow>
      <IonRow className="ion-margin-top w-full">
        <IonCol size="8" className="text-right">
          <IonText className="text-right w-full ">
            {order?.delivery_option ?? ""}
          </IonText>
        </IonCol>
        <IonCol size="4" className="text-center">
          <IonText className="text-right w-full ">
            {order?.branch+""}
          </IonText>
        </IonCol>
      </IonRow>
      <IonRow className="w-full">
        <IonCol size="8" className="text-right">
          <IonText className="text-right w-full ">Payment Method</IonText>
        </IonCol>
        <IonCol size="4" className="text-center">
          {order?.payment_option}
        </IonCol>
      </IonRow>
      <IonRow className="w-full">
        <IonCol size="8" className="text-right">
          <IonText className="text-right w-full ">Paid</IonText>
        </IonCol>
        <IonCol size="4" className="text-center">
          {order?.payment_status.toUpperCase()}
        </IonCol>
      </IonRow>
    </IonGrid>
  );
};

export default function Order() {
  const { order_id } = useParams<{ order_id: string }>();
  const order = useRecoilValue(orderAtom);

  const handlePay = () => {
    window.location.href = paymentGatewayURL(
      order?.payment_option ?? PaymentOptionType.GCash,
      order?.total_price ?? 0,
      order?.id ?? ""
    )
  }

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>Order Detail</IonTitle>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/orders"></IonBackButton>
          </IonButtons>
          <IonButtons slot="end">
            {order?.payment_status == PaymentStatusType.Paid && (
              <IonButton
                routerLink={`/orders/${order_id ?? order?.id}/receipt`}
              >
                Receipt
              </IonButton>
            )}
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="ion-padding-vertical">
        <Data order_id={order_id} orderDetails={order} />
      </IonContent>
      <IonFooter>
        <IonToolbar className="p-2">
          {order?.payment_status === PaymentStatusType.Pending && (
            <IonButton expand="block" color="primary" shape="round" onClick={handlePay}>
              Pay Now
            </IonButton>
          )}
          {order?.delivery_status === DeliveryStatusType.Pending && (
            <IonButton
              expand="block"
              fill="outline"
              color="danger"
              className="ion-margin-top"
              shape="round"
            >
              Cancel
            </IonButton>
          )}
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
}
