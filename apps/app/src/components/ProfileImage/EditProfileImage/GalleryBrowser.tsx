import { IonCol, IonRow } from "@ionic/react";

import AnimatedImg from "../../AnimatedImg";
import { Avatar } from "coffee-lounge-types";
import { SystemAvatars } from "../../../constants";
import { lazy } from "react";

const ReactAvatarEditor = lazy(() => import("react-avatar-editor"));

export default function GalleryBrowser(props: {
  selectedAvatar: Avatar,
  setSelectedAvatar: (avatar: Avatar) => void
}) {
  return (
    <>
      <div className="w-full h-auto flex p-10 justify-center bg-slate-100">
        <ReactAvatarEditor image={props.selectedAvatar.path} borderRadius={100} />
      </div>
      <div className="ion-padding">
        <IonRow>
          {SystemAvatars.map((avatar) => (
            <IonCol
              key={avatar.name}
              onClick={() => {
                console.log("new avatar", avatar);
                props.setSelectedAvatar(avatar);
              }}
            >
              <AnimatedImg
                src={avatar.path}
                className={`${
                  props.selectedAvatar.name === avatar.name && "bg-slate-200"
                }`}
              />
            </IonCol>
          ))}
        </IonRow>
      </div>
    </>
  );
}
