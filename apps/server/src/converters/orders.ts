import {
  Firestore,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  WithFieldValue,
} from "firebase-admin/firestore";

import FirebaseFirestore from "@google-cloud/firestore";
import { OrderType } from "../types";
import { getFirestore } from "firebase-admin/firestore";

export const OrderConvert: FirestoreDataConverter<OrderType> = {
  fromFirestore(snapshot: QueryDocumentSnapshot): OrderType {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      ...data,
    } as OrderType;
  },
  toFirestore: (order: WithFieldValue<OrderType>) => {
    const db = getFirestore();
    return {
      ...order,
      updatedAt: FirebaseFirestore.FieldValue.serverTimestamp(),
    };
  },
};
