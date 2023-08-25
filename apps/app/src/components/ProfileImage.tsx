import { IonFabButton, IonIcon } from "@ionic/react";
import { Suspense, lazy, memo, useState } from "react";

import AnimatedImg from "./AnimatedImg";
import { SystemAvatars } from "../constants";
import { User } from "firebase/auth";
import { cameraOutline } from "ionicons/icons";

const EditProfileImage = lazy(() => import("./EditProfileImage"));
export const DefaultProfileImg = (
  photoURL: string | null | undefined,
  gender?: string
) => {
  console.log("photoURL", photoURL);
  if (photoURL == undefined || photoURL == null) {
    if (gender === "Female") {
      return SystemAvatars[3];
    } else {
      return SystemAvatars[1];
    }
  } else {
    return {
      path: photoURL,
      name: "User Profile Image",
      system: false
    };
  }
};


function ProfileImage(props: {
  currentUser: User | null | undefined;
  gender?: string;
  imgClassName?: string;
  onboarding?: boolean;
  showEditBtn?: boolean;
}) {
  const profile = DefaultProfileImg(props.currentUser?.photoURL, props.gender);

  const [isOpen, setIsOpen] = useState(() => false);
  const dismiss = () => setIsOpen(false);

  console.log("profile", profile);

  return (
    <div className="rounded-full my-2">
      <div className="relative">
        <AnimatedImg
          src={profile.path}
          className={`${!props.onboarding && "rounded-full bg-slate-200"} ${
            props.imgClassName
          }`}
        />
        {props.showEditBtn && (
          <IonFabButton
            className="absolute mt-[-55px] right-0"
            onClick={() => setIsOpen(true)}
          >
            <IonIcon icon={cameraOutline} />
          </IonFabButton>
        )}
        {props.showEditBtn && (
          <Suspense>
            <EditProfileImage
              defaultProfileImg={profile}
              isOpen={isOpen}
              dismiss={dismiss}
            />
          </Suspense>
        )}
      </div>
    </div>
  );
}

export default ProfileImage;
