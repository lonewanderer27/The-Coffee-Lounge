import {
  IonButton,
  IonCard,
  IonCardSubtitle,
  IonCol,
  IonIcon,
  IonImg,
  IonRow,
  IonText,
} from "@ionic/react";
import { OrderType, PaymentStatusType, ProductType } from "../../types";

import AnimatedImg from "../../components/AnimatedImg";
import { chevronForwardOutline } from "ionicons/icons";
import { memo } from "react";
import { orderAtom } from "../../atoms/order";
import { phpString } from "../../phpString";
import { useSetRecoilState } from "recoil";

function OrderItem(props: OrderType) {
  const setOrder = useSetRecoilState(orderAtom);
  const totalCount = () => {
    let count = 0;
    props.products.forEach((p) => {
      count += p.quantity;
    });

    console.log("Total Count: ", count);
    return count;
  };
  console.log("Order Detail: ", props);

  const viewOrderDetail = () => {
    setOrder(props);
  };

  return (
    <div className="w-full my-5">
      <IonRow className="flex items-center">
        <IonCol size="8">
          <IonCard className="mx-0 bg-transparent my-0 shadow-none">
            <IonCardSubtitle>
              {new Date(props!.payment_at!.toDate()).toDateString()}
              {" | "}
              {new Date(props!.payment_at!.toDate()).toLocaleTimeString()}
            </IonCardSubtitle>
          </IonCard>
        </IonCol>
        <IonCol size="4">
          <IonCard className="bg-transparent text-right mx-0 my-0 shadow-none">
            <IonText className="text-xl">
              {phpString.format(props.total_price)}
            </IonText>
          </IonCard>
        </IonCol>
      </IonRow>
      <IonRow className="my-0 mx-2">
        {props.products.map((product) => (
          <>
            <IonCol
              key={`ioncol2:${product.product_id}`}
              size="11"
              className="flex items-center"
            >
              {`${product.product_snapshot.name}`}
            </IonCol>
            <IonCol
              key={`ioncol3:${product.product_id}`}
              size="1"
              className="flex items-center"
            >
              x{`${product.quantity}`}
            </IonCol>
          </>
        ))}
      </IonRow>
      <IonRow className="my-2 mx-2">
        <IonCol size="10" className="flex">
          <IonText className="text-right w-full">Total Items</IonText>
        </IonCol>
        <IonCol size="2" className="flex">
          <IonText className="text-right w-full">{totalCount()}</IonText>
        </IonCol>
      </IonRow>
      {props.payment_status == PaymentStatusType.Pending && (
        <IonRow className="mt-5 mx-0 flex justify-end">
          {/* <span className="mr-3">Pay Now</span>
          <span className="mr-3">{" | "}</span>
          <span>Cancel</span> */}
          <span>Pending Payment</span>
        </IonRow>
      )}
      <IonButton
        fill="clear"
        className="w-full text-inherit ion-no-margin ion-no-padding"
        color="default"
        size="default"
        routerLink={`/orders/${props.id}`}
      >
        <IonText className="ml-auto font-semibold">Order Details</IonText>
        <IonIcon src={chevronForwardOutline} slot="end" />
      </IonButton>
    </div>
  );
}

export default memo(OrderItem);
