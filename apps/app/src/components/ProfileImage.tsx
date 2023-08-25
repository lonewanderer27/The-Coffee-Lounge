import AnimatedImg from "./AnimatedImg";
import ManAlt from "../assets/people/man_alt.png";
import { User } from "firebase/auth";
import WomanAlt from "../assets/people/woman_alt.png";
import { memo } from "react";

/**
 * Renders a profile image for a user.
 * @param {Object} props - The component props.
 * @param {User|null|undefined} props.currentUser - The current user object.
 * @param {string} [props.gender] - The gender of the user. Defaults to undefined.
 * @param {string} [props.imgClassName] - The class name for the image element. Defaults to undefined.
 * @param {boolean} [props.onboarding] - Whether the component is being used in an onboarding flow. Defaults to undefined.
 * @returns {JSX.Element} - The rendered component.
 */
function ProfileImage(props: {
  currentUser: User | null | undefined;
  gender?: string;
  imgClassName?: string;
  onboarding?: boolean;
}) {
  return (
    <div>
      {props.currentUser?.photoURL ? (
        <AnimatedImg
          src={props.currentUser.photoURL}
          className={`${!props.onboarding && "rounded-full bg-slate-200"} `}
        />
      ) : (
        <div>
          {props.gender == "Female" ? (
            <AnimatedImg
              src={WomanAlt}
              className={`${!props.onboarding && "rounded-full bg-slate-200"} ${
                props.imgClassName
              }`}
            />
          ) : (
            <AnimatedImg
              src={ManAlt}
              className={`${!props.onboarding && "rounded-full bg-slate-200"} ${
                props.imgClassName
              }`}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default memo(ProfileImage);
