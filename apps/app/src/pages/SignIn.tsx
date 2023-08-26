import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  UserCredential,
  getAuth,
  getRedirectResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithEmailLink,
  signInWithRedirect,
} from "firebase/auth";
import {
  IonButton,
  IonContent,
  IonIcon,
  IonImg,
  IonInput,
  IonLabel,
  IonPage,
  IonText,
  useIonViewWillEnter as useEffect,
  useIonAlert,
  useIonLoading,
  useIonRouter,
} from "@ionic/react";
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { emailForSignin, loginProviderAtom } from "../atoms/signin";
import { logoGoogle, mail } from "ionicons/icons";
import { useRecoilState, useSetRecoilState } from "recoil";

import EmailLoginButton from "../components/EmailLoginButton";
import { FirebaseError } from "firebase/app";
import { GoogleLoginButton } from "react-social-login-buttons";
import { LoginProvider } from "../types";
import Logo2 from "../assets/The Coffee Lounge - Logo 2.svg";
import { UserConvert } from "../converters/user";
import { google_provider } from "../OAuthProviders";
import { memo } from "react";

const SignIn = () => {
  const db = getFirestore();
  const auth = getAuth();
  const router = useIonRouter();
  const [loginProvider, setLoginProvider] = useRecoilState(loginProviderAtom);
  const [email, setEmail] = useRecoilState(emailForSignin);
  const [loading, dismiss] = useIonLoading();
  const [presentAlert] = useIonAlert();

  const handleGoogle = () => {
    (async () => {
      try {
        const provider = google_provider;
        await signInWithRedirect(auth, provider);
      } catch (err: unknown) {
        const error = err as FirebaseError;
        console.log("error: ", error);
      }
    })();
  };

  const handleEmailOTP = () => {
    (async () => {
      try {
        loading({
          message: "Sending you magic email!",
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
          message: `Check your email for the magic link. It will expire in 10 minutes.`,
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

  const confirmGoogle = (result: UserCredential) => {
    (async () => {
      try {
        await loading({
          message: "Signing you in...",
        });
        console.log("confirming google signin");

        setupProfile(result!.user!);

        await dismiss();
      } catch (err: unknown) {
        const error = err as FirebaseError;
        console.log("error: ", error);
        await dismiss();
        presentAlert({
          header: "Error",
          message: "Error signing in.",
          buttons: ["OK"],
        });
      }
    })();
  };

  const confirmEmail = () => {
    (async () => {
      try {
        const res = await signInWithEmailLink(
          auth,
          email!,
          window.location.href
        );
        console.log(res);
        await dismiss();

        setupProfile(res.user!);
      } catch (err: unknown) {
        const error = err as FirebaseError;
        console.log("error: ", error);
        await dismiss();
        presentAlert({
          header: "Error",
          message: "Error signing in.",
          buttons: ["OK"],
        });
      }
    })();
  };

  const setupProfile = (user: User) => {
    setLoginProvider(null);
    (async () => {
      // create reference to the user's document
      const userRef = doc(db, "users", user.uid).withConverter(UserConvert);

      // get the user's document
      const userDoc = await getDoc(userRef);

      // check if the user's document exits
      if (userDoc.exists()) {
        // this means we are an existing user
        // so we need to check if they're already onboarded

        if (userDoc.data()?.onboarded) {
          // if they're already onboarded, then we need to redirect them to home
          router.push("/home", "forward", "replace");
          return;
        } else {
          // if they're not onboarded, then we need to update the user's profile
          router.push("/onboarding", "forward", "replace");
        }
      } else {
        // this means we are a new user
        // so we need to update the user's profile
        await setDoc(userRef, {
          id: userDoc.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          nickname: user.displayName ?? "",
          onboarded: false,
        });

        // then we need to redirect them to onboarding
        router.push("/onboarding", "forward", "replace");
      }

      // clear the login provider
      setLoginProvider(null);
    })();
  };

  useEffect(() => {
    console.log("Location Origin: ", window.location.origin);
    const auth = getAuth();

    // check what provider was used to sign in
    getRedirectResult(auth).then((result) => {
      switch (result?.providerId) {
        case EmailAuthProvider.PROVIDER_ID:
          {
            if (isSignInWithEmailLink(auth, window.location.href)) {
              setLoginProvider(LoginProvider.EmailOTP);
              confirmEmail();
            }
          }
          break;
        case GoogleAuthProvider.PROVIDER_ID:
          {
            setLoginProvider(LoginProvider.Google);
            confirmGoogle(result);
          }
          break;
      }
    });
  }, []);

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
            {loginProvider === null && <Chooser handleGoogle={handleGoogle} />}
            {loginProvider === LoginProvider.EmailOTP && (
              <EmailOTP handleEmailOTP={handleEmailOTP} />
            )}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

const Chooser = memo((props: { handleGoogle: () => void }) => {
  const [loginProvider, setLoginProvider] = useRecoilState(loginProviderAtom);
  const r = useIonRouter();

  return (
    <>
      <div className="mt-4"></div>
      <IonButton
        onClick={() => setLoginProvider(LoginProvider.EmailOTP)}
        shape="round"
      >
        <IonLabel className="text-center">Send Magic Link</IonLabel>
        <IonIcon slot="start" src={mail} />
      </IonButton>
      <IonButton
        className="mt-2"
        onClick={() => props.handleGoogle()}
        shape="round"
      >
        <IonLabel className="text-center">Continue with Google</IonLabel>
        <IonIcon slot="start" src={logoGoogle} />
      </IonButton>

      <div className="inline-flex items-center justify-center w-full">
        <hr className="w-64 h-px mt-14 mb-10 bg-gray-200 border-0 dark:bg-gray-700"></hr>
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
  const setLoginProvider = useSetRecoilState(loginProviderAtom);

  return (
    <div className="w-full">
      <form className="mt-8">
        <IonInput
          value={email}
          fill="outline"
          type="email"
          label="Email"
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
