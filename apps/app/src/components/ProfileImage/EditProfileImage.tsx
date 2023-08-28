import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonModal,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  useIonAlert,
  useIonLoading,
} from "@ionic/react";
import { Swiper, SwiperSlide } from "swiper/react";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";
import { useRef, useState } from "react";

import { Avatar } from "coffee-lounge-types";
import CameraBrowser from "./EditProfileImage/CameraBrowser";
import { FirebaseError } from "firebase/app";
import GalleryBrowser from "./EditProfileImage/GalleryBrowser";
import { Swiper as SwiperType } from "swiper/types";
import { UserConvert } from "../../converters/user";
import { closeOutline } from "ionicons/icons";

function EditProfileImage(props: {
  isOpen: boolean;
  dismiss: () => void;
  defaultProfileImg: Avatar;
}) {
  const [controlledSwiper, setControlledSwiper] = useState<SwiperType | null>(
    null
  );

  const [loading, dismiss] = useIonLoading();
  const [show] = useIonAlert();
  const currentUser = getAuth().currentUser;
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
    props.defaultProfileImg
  );
  const db = getFirestore();
  const handleSave = async () => {
    // skip if the user hasn't changed their profile image

    if (selectedAvatar.name === props.defaultProfileImg.name) {
      props.dismiss();
      return;
    }

    try {
      await loading({
        message: "Saving new profile photo...",
      });
      // TODO: Save user's custom image to storage

      // Save it to Firebase Auth
      await updateProfile(currentUser!, {
        photoURL: selectedAvatar.name,
      });

      // create reference to user's document
      const userDocRef = doc(db, "users", currentUser!.uid).withConverter(
        UserConvert
      );

      // Save it to Firestore
      updateDoc(userDocRef, {
        profile: selectedAvatar,
      });

      // dismiss loading
      await dismiss();

      // dismiss modal
      props.dismiss();
    } catch (err: unknown) {
      const error = err as FirebaseError;

      // dismiss loading
      await dismiss();

      // show error alert
      await show({
        message: "There has been an error. Please try again.",
        buttons: ["OK"],
      });
    }
  };

  console.log("Default Profile Image", props.defaultProfileImg);
  const modal = useRef<HTMLIonModalElement>(null);

  return (
    <IonModal ref={modal} isOpen={props.isOpen}>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={props.dismiss}>
              <IonIcon icon={closeOutline} size="large" />
            </IonButton>
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>Save</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <Swiper
          onSwiper={setControlledSwiper}
          watchSlidesProgress
          onSlideChange={(e) =>
            setActivePage(
              e.activeIndex === 0 ? "galleryBrowser" : "cameraBrowser"
            )
          }
        >
          <SwiperSlide>
            <GalleryBrowser
              selectedAvatar={selectedAvatar}
              setSelectedAvatar={setSelectedAvatar}
            />
          </SwiperSlide>
          <SwiperSlide>
            <CameraBrowser />
          </SwiperSlide>
        </Swiper>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonSegment
            value={controlledSwiper?.activeIndex ?? 0}
            onIonChange={(e) => {
              controlledSwiper?.slideTo(e.detail.value as any);
            }}
          >
            <IonSegmentButton value={0}>Gallery</IonSegmentButton>
            <IonSegmentButton value={1}>Camera</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}

export default EditProfileImage;
