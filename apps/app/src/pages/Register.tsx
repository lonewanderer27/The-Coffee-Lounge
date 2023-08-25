import "./Account.css";

import {
  FieldValue,
  doc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonImg,
  IonInput,
  IonPage,
  IonRouterLink,
  IonTitle,
  IonToolbar,
  useIonLoading,
  useIonRouter,
  useIonToast,
} from "@ionic/react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
  createUserWithEmailAndPassword,
  getAuth,
  updateProfile,
} from "firebase/auth";

import { Action } from "../components/Action";
import { useColorScheme } from "../hooks/page";

enum GenderEnum {
  Female = "Female",
  Male = "Male",
  NonBinary = "Non-Binary",
}

interface IFormInput {
  email: string;
  password: string;
  gender?: GenderEnum;
  pronouns?: string;
  nickname: string;
  updatedAt?: FieldValue;
}

const Register: React.FC = () => {
  const router = useIonRouter();
  const db = getFirestore();
  const auth = getAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IFormInput>();

  const [presentToast] = useIonToast();
  const [presentLoading, dismiss] = useIonLoading();

  const toast = (position: "top" | "middle" | "bottom", message: string) => {
    presentToast({
      message,
      duration: 1500,
      position: position,
    });
  };

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    presentLoading("Creating your account...");
    createUserWithEmailAndPassword(auth, data.email, data.password)
      .then((userCredential) => {
        dismiss(); // dismiss the original loading
        const user = userCredential.user;
        console.log(user);

        // update firebase user profile
        (async () => {
          await updateProfile(auth.currentUser!, {
            displayName: data.nickname,
          });
        })();

        // construct the user data
        const userData: {
          createdAt: FieldValue;
          updatedAt: FieldValue;
        } = {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // create a user in users documents
        (async () => {
          await setDoc(doc(db, "users", user.uid), userData);
          router.push("/home", "forward", "replace");
        })();
      })
      .catch((error) => {
        dismiss();
        toast("top", error.message);
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage);
      });
  };

  const { colorScheme } = useColorScheme();

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>Register</IonTitle>
          <IonButtons slot="start">
            <IonBackButton></IonBackButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="h-full flex">
          <form
            className="ion-padding h-full flex flex-col justify-center"
            onSubmit={handleSubmit(onSubmit)}
          >
            <IonImg
              src={
                colorScheme === "dark"
                  ? "/slogan_white_mode.png"
                  : "/slogan_dark_mode.png"
              }
              className="w-[35%] mx-auto"
            />
            <IonInput
              label="Email"
              labelPlacement="fixed"
              className="ion-margin-top"
              fill="outline"
              type="text"
              {...register("email", { required: true })}
            />
            <IonInput
              className="mt-2 "
              fill="outline"
              label="Password"
              labelPlacement="fixed"
              type="password"
              {...register("password", { required: true })}
            />
            
            <p className="ion-text-center mt-8">
              By tapping "Create Account" you agree to our{" "}
              <IonRouterLink>Terms of Use</IonRouterLink> and{" "}
              <IonRouterLink>Privacy Policy</IonRouterLink>
            </p>

            <IonButton
              expand="block"
              type="submit"
              disabled={!isValid}
              className="ion-margin-top"
            >
              Create Account
            </IonButton>
            <Action
              message="Have an account?"
              link="/signin"
              text="Signin"
              align="center"
            />
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Register;
