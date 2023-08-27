import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonSegment,
  IonSegmentButton,
  IonToolbar,
  useIonLoading,
} from "@ionic/react";
import { doc, getFirestore, setDoc, updateDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";
import { lazy, useRef, useState } from "react";

import AnimatedImg from "./AnimatedImg";
import { Avatar } from "coffee-lounge-types";
import { SystemAvatars } from "../constants";
import { UserConvert } from "../converters/user";
import { closeOutline } from "ionicons/icons";

const ReactAvatarEditor = lazy(() => import("react-avatar-editor"));

function EditProfileImage(props: {
  isOpen: boolean;
  dismiss: () => void;
  defaultProfileImg: Avatar;
}) {
  const [loading, dismiss] = useIonLoading();
  const currentUser = getAuth().currentUser;
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
    props.defaultProfileImg
  );
  const db = getFirestore();
  const handleSave = async () => {
    loading({
      message: "Saving new profile photo...",
    })
    // TODO: Save user's custom image to storage

    // Save it to Firebase Auth
    await updateProfile(currentUser!, {
      photoURL: selectedAvatar.path,
    });

    // create reference to user's document
    const userDocRef = doc(db, "users", currentUser!.uid).withConverter(UserConvert);

    // Save it to Firestore
    updateDoc(userDocRef, {
      profile: selectedAvatar
    })
    
    // dismiss loading
    dismiss();

    // dismiss modal
    props.dismiss();
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
        <div className="w-full h-auto flex p-10 justify-center bg-slate-100">
          {/* <div className="w-60 h-auto relative bg-slate-200">
            <AnimatedImg className="w-max h-max" src={selectedAvatar.path} />
          </div> */}
          <ReactAvatarEditor image={selectedAvatar.path} borderRadius={100} />
        </div>
        <div className="ion-padding">
          <IonRow>
            {SystemAvatars.map((avatar) => (
              <IonCol
                key={avatar.name}
                onClick={() => {
                  console.log("new avatar", avatar);
                  setSelectedAvatar(avatar);
                }}
              >
                <AnimatedImg
                  src={avatar.path}
                  className={`${
                    selectedAvatar.name === avatar.name && "bg-slate-200"
                  }`}
                />
              </IonCol>
            ))}
          </IonRow>
        </div>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonSegment value="gallery">
            <IonSegmentButton value="gallery">Gallery</IonSegmentButton>
            <IonSegmentButton value="camera">Camera</IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}

export default EditProfileImage;
