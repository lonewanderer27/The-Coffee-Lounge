import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  WithFieldValue,
  serverTimestamp,
} from "firebase/firestore";

import { DeliveryAddressType } from "../types";
import { UserType } from "coffee-lounge-types";

export const DeliveryAddressConvert: FirestoreDataConverter<DeliveryAddressType> =
  {
    fromFirestore(
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): DeliveryAddressType {
      const data = snapshot.data(options);
      return {
        id: snapshot.id,
        ...data,
      } as DeliveryAddressType;
    },
    toFirestore: (deliveryAddress: WithFieldValue<DeliveryAddressType>) => ({
      ...deliveryAddress,
      updatedAt: serverTimestamp(),
    }),
  };

export const UserConvert: FirestoreDataConverter<UserType> = {
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): UserType {
    const data = snapshot.data(options);
    return {
      id: snapshot.id,
      ...data,
    } as UserType;
  },
  toFirestore: (user: WithFieldValue<UserType>) => ({
    ...user,
    updatedAt: serverTimestamp(),
  }),
};
