import "./Account.css";

import {
  IonAlert,
  IonButton,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonPage,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  useIonRouter,
} from "@ionic/react";
import { doc, getFirestore } from "firebase/firestore";

import ManAlt from "../assets/avatars/man_alt.png";
import ProfileImage from "../components/ProfileImage";
import { UserConvert } from "../converters/user";
import WomanAlt from "../assets/avatars/woman_alt.png";
import { chevronForwardOutline } from "ionicons/icons";
import { getAuth } from "firebase/auth";
import { memo } from "react";
import { useDocument } from "react-firebase-hooks/firestore";

const Account = (props: {
  setIntro: React.Dispatch<React.SetStateAction<boolean | null>>;
}) => {
  const db = getFirestore();
  const router = useIonRouter();
  const { currentUser } = getAuth();
  const auth = getAuth();

  const ref = doc(db, "users", currentUser!.uid).withConverter(UserConvert);
  const [userData] = useDocument(ref);

  const logout = () => auth.signOut().then(() => router.push("/signin"));

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>Account</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonGrid className="ion-padding-horizontal">
          <IonRow>
            <IonCol size="4" className="ml-[-5px] mt-[20px]">
              <ProfileImage
                currentUser={currentUser}
                gender={userData?.get("gender")}
              />
            </IonCol>
            <IonCol className="ion-padding-start flex items-center">
              <IonText>
                <h2>{userData?.get("nickname")}</h2>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonList>
          <IonListHeader>
            <IonLabel>My Account</IonLabel>
          </IonListHeader>
          <IonItem routerLink="/account/accountandsecurity">
            <IonLabel>Profile & Security</IonLabel>
          </IonItem>
          <IonItem routerLink="/account/delivery-addresses">
            <IonLabel>My Addresses</IonLabel>
          </IonItem>
          <IonItem routerLink="/account/bankaccountscards">
            <IonLabel>Bank Accounts / Cards</IonLabel>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader>
            <IonLabel>Settings</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonLabel>Chat Settings</IonLabel>
            <IonIcon src={chevronForwardOutline}></IonIcon>
          </IonItem>
          <IonItem>
            <IonLabel>Notification Settings</IonLabel>
            <IonIcon src={chevronForwardOutline}></IonIcon>
          </IonItem>
        </IonList>
        <IonList>
          <IonListHeader>
            <IonLabel>Support</IonLabel>
          </IonListHeader>
          <IonItem onClick={() => props.setIntro(null)}>
            <IonLabel>About</IonLabel>
            <IonIcon src={chevronForwardOutline}></IonIcon>
          </IonItem>
        </IonList>
        <div className="ion-padding">
          <IonButton expand="block" id="logout" className="ion-margin-top">
            Logout
          </IonButton>
          <IonAlert
            trigger="logout"
            header="Logout"
            message="Are you sure you want to log out?"
            buttons={[
              {
                text: "Cancel",
                role: "cancel",
              },
              {
                text: "Logout",
                handler: logout,
              },
            ]}
          ></IonAlert>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default memo(Account);
