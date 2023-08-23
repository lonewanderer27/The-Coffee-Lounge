import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonPage,
  IonText,
  useIonAlert,
  useIonLoading,
  useIonRouter,
  useIonViewWillEnter,
} from "@ionic/react";
import { doc, getFirestore, serverTimestamp, setDoc } from "firebase/firestore";
import { emailForSignin, loginProviderAtom } from "../atoms/signin";
import {
  getAuth,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
} from "firebase/auth";
import { logoGoogle, mail } from "ionicons/icons";

import { FirebaseError } from "firebase/app";
import { LoginProvider } from "../types";
import Logo2 from "../assets/The Coffee Lounge - Logo 2.svg";
import { memo } from "react";
import { useRecoilState } from "recoil";

const SignIn = () => {
  const db = getFirestore();
  const auth = getAuth();
  const router = useIonRouter();
  const [loginProvider, setLoginProvider] = useRecoilState(loginProviderAtom);
  const [email, setEmail] = useRecoilState(emailForSignin);
  const [loading, dismiss] = useIonLoading();
  const [presentAlert] = useIonAlert();

  const handleEmailOTP = () => {
    (async () => {
      try {
        loading({
          message: "Sending you the magic email!",
        });
        const actionCodeSettings = {
          url: `${window.location.origin}/signin/complete`,
          handleCodeInApp: true,
        };

        await sendSignInLinkToEmail(auth, email!, actionCodeSettings);
        setEmail(email!);

        dismiss();
        presentAlert({
          header: "Email Sent!",
          message: `Please check your email for the magic link. It will expire in 10 minutes.`,
          buttons: ["OK"],
        });
      } catch (err: unknown) {
        const error = err as FirebaseError;
        console.log("error: ", err);
        dismiss();
        presentAlert({
          header: "Error",
          message: error.message,
          buttons: ["OK"],
        });
      }
    })();
  };

  const confirmEmailSignin = () => {
    (async () => {
      try {
        loading({
          message: "Signing you in...",
        });
        console.log("confirming email signin");

        if (isSignInWithEmailLink(auth, window.location.href)) {
          const res = await signInWithEmailLink(
            auth,
            email!,
            window.location.href
          );
          console.log(res);
          dismiss();
          setLoginProvider(null);

          await setDoc(doc(db, "users", res.user.uid), {
            created_at: serverTimestamp(),
          });

          if (res.user.displayName === null || res.user.displayName === "") {
            router.push("/onboarding");
          } else {
            router.push("/home");
          }
        } else {
          dismiss();
          presentAlert({
            header: "Error",
            message: "Invalid email link.",
            buttons: ["OK"],
          });
        }
      } catch (err: unknown) {
        const error = err as FirebaseError;
        console.log("error: ", err);
        dismiss();
        presentAlert({
          header: "Error",
          message: "Error signing in.",
          buttons: ["OK"],
        });
      }
    })();
  };

  useIonViewWillEnter(() => {
    console.log("Location Origin: ", window.location.origin);
    if (
      window.location.href.includes(`${window.location.origin}/signin/complete`)
    ) {
      setLoginProvider(LoginProvider.EmailOTP);
      confirmEmailSignin();
    }
  }, [window.location.origin]);

  return (
    <IonPage>
      <IonContent>
        <div className="h-full flex">
          <div className="ion-padding flex flex-col justify-center h-full text-center">
            <IonImg src={Logo2} className="w-[35%] mx-auto tcl-logo" />
            <IonText>
              <h1 className="font-bold">Sign In</h1>
            </IonText>
            <IonText>
              <p className="text-center font-bold">Let's get you signed in!</p>
            </IonText>
            {loginProvider === null && <Chooser />}
            {loginProvider === LoginProvider.EmailOTP && (
              <EmailOTP handleEmailOTP={handleEmailOTP} />
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const Chooser = memo(() => {
  const [loginProvider, setLoginProvider] = useRecoilState(loginProviderAtom);
  const r = useIonRouter();

  return (
    <>
      <div className="mt-4"></div>
      <IonButton
        color="light"
        onClick={() => setLoginProvider(LoginProvider.EmailOTP)}
      >
        <IonText>Send Magic Link</IonText>
        <IonIcon slot="start" src={mail} />
      </IonButton>
      <IonButton
        color="light"
        onClick={() => setLoginProvider(LoginProvider.Google)}
        disabled
      >
        <IonText>Sign in with Google</IonText>
        <IonIcon slot="start" src={logoGoogle} />
      </IonButton>

      <div className="inline-flex items-center justify-center w-full">
        <hr className="w-64 h-px my-10 bg-gray-200 border-0 dark:bg-gray-700"></hr>
        <span className="absolute px-3 font-medium text-gray-900 -translate-x-1/2 bg-white  dark:text-white dark:bg-gray-900">
          OR
        </span>
      </div>

      <IonButton
        expand="block"
        fill="clear"
        onClick={() => r.push("/login", "forward", "replace")}
      >
        Sign In With Password
      </IonButton>
    </>
  );
});

const EmailOTP = memo((props: { handleEmailOTP: () => void }) => {
  const [email, setEmail] = useRecoilState(emailForSignin);
  const [loginProvider, setLoginProvider] = useRecoilState(loginProviderAtom);

  return (
    <div className="w-full">
      <form className="mt-8">
        <IonInput
          value={email}
          fill="outline"
          type="email"
          label="Email"
          // labelPlacement="floating"
          onIonChange={(e) => setEmail(e.detail.value!)}
        />
        <IonButton
          className="ion-margin-top"
          expand="block"
          onClick={props.handleEmailOTP}
        >
          Send Email OTP
        </IonButton>
      </form>
      <IonButton
        className="my-10"
        expand="block"
        fill="clear"
        onClick={() => setLoginProvider(null)}
      >
        Go Back
      </IonButton>
    </div>
  );
});

export default memo(SignIn);
