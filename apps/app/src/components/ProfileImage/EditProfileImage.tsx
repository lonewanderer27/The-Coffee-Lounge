import { Camera, CameraResultType } from "@capacitor/camera";
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonModal,
  IonRow,
  IonToolbar,
  useIonAlert,
  useIonLoading,
} from "@ionic/react";
import { cameraOutline, closeOutline } from "ionicons/icons";
import { doc, getFirestore, updateDoc } from "firebase/firestore";
import { getAuth, updateProfile } from "firebase/auth";
import {
  getDownloadURL,
  getStorage,
  ref as storageRef,
  uploadBytes,
} from "firebase/storage";
import { useRef, useState } from "react";

import AnimatedImg from "../AnimatedImg";
import { Avatar } from "coffee-lounge-types";
import { FirebaseError } from "firebase/app";
import ReactAvatarEditor from "react-avatar-editor";
import { UserConvert } from "../../converters/user";
import { defineCustomElements } from "@ionic/pwa-elements/loader";
import { profileImagesAtom } from "@/atoms/profile";
import { useRecoilState } from "recoil";

defineCustomElements(window);

function EditProfileImage(props: {
  isOpen: boolean;
  dismiss: () => void;
  defaultProfileImg: Avatar;
}) {
  const editor = useRef<ReactAvatarEditor>(null);

  const [loading, dismiss] = useIonLoading();
  const [show] = useIonAlert();

  const currentUser = getAuth().currentUser;

  const [profileImages, setProfileImages] = useRecoilState(profileImagesAtom);
  const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(
    props.defaultProfileImg
  );
  const db = getFirestore();

  const handleCamera = async () => {
    try {
      // Get the image from the camera
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        width: 2000,
        height: 2000,
        resultType: CameraResultType.Uri,
      });

      // Create a new avatar
      const newAvatar: Avatar = {
        name: `${currentUser!.uid} Profile Image`,
        path: image.webPath!,
        system: false,
      };

      console.log(newAvatar);

      // Append it to the profile images so the user can select them
      setProfileImages((prev) => [newAvatar, ...prev]);

      // Set the selected avatar to the new avatar
      setSelectedAvatar(newAvatar);
    } catch (err) {
      // user cancelled the action
      console.log(err);
    }
  };

  const handleSave = async () => {
    // skip if the user hasn't changed their profile image

    if (selectedAvatar.name === props.defaultProfileImg.name) {
      props.dismiss();
      return;
    }

    // create reference to user's document
    const userDocRef = doc(db, "users", currentUser!.uid).withConverter(
      UserConvert
    );

    try {
      await loading({
        message: "Saving new profile photo...",
      });

      // If the user's profile image is a system image, just save it to Firebase Auth
      // Save user's custom image to storage
      if (selectedAvatar.system) {
        // Save it to Firebase Auth
        await updateProfile(currentUser!, {
          photoURL: selectedAvatar.name,
        });

        // Save it to Firestore
        updateDoc(userDocRef, {
          profile: selectedAvatar,
        });
      } else {
        // get storage reference
        const storage = getStorage();

        // create a reference to the user's profile image
        const profileImageRef = storageRef(
          storage,
          `avatars/users/${currentUser!.uid}/${selectedAvatar.name}`
        );

        // fetch data URL of the cropped image from the editor
        const url = editor.current?.getImageScaledToCanvas().toDataURL();

        // fetch the blob
        const blob = await fetch(url!).then((r) => r.blob());

        // upload the image to storage
        await uploadBytes(profileImageRef, blob!);

        // get the download url
        const downloadURL = await getDownloadURL(profileImageRef);

        // save it to Firebase Auth
        await updateProfile(currentUser!, {
          photoURL: downloadURL,
        });

        // create a new avatar object
        const newAvatar: Avatar = {
          name: selectedAvatar.name,
          path: downloadURL,
          system: false,
        };

        // save it to Firestore
        updateDoc(userDocRef, {
          profile: newAvatar,
        });
      }

      // dismiss loading
      await dismiss();

      // dismiss modal
      props.dismiss();
    } catch (err: unknown) {
      const error = err as FirebaseError;

      console.log(error);

      // dismiss loading
      await dismiss();

      // show error alert
      await show({
        message: "There has been an error. Please try again.",
        buttons: ["OK"],
      });
    }
  };

  console.log("Profile Image", props.defaultProfileImg);
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
        <div className="w-full h-auto flex py-16 px-20 justify-center bg-slate-100 relative">
          <ReactAvatarEditor
            image={selectedAvatar.path}
            borderRadius={100}
            ref={editor}
          />
          <IonFabButton
            className="absolute right-3 bottom-3"
            onClick={handleCamera}
          >
            <IonIcon icon={cameraOutline} />
          </IonFabButton>
        </div>
        <IonGrid className="ion-padding">
          <IonRow className="overflow-y-scroll h-72">
            {profileImages.map((avatar, index) => (
              <IonCol
                key={`${avatar.name} ${index}`}
                onClick={() => {
                  console.log("new avatar", avatar);
                  setSelectedAvatar(avatar);
                }}
                size="4"
                className="aspect-w-1 aspect-h-1 overflow-hidden"
              >
                <AnimatedImg
                  src={avatar.path}
                  className={`${
                    selectedAvatar.name === avatar.name && "bg-slate-200"
                  } object-cover w-full h-full`}
                />
              </IonCol>
            ))}
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonModal>
  );
}

export default EditProfileImage;
