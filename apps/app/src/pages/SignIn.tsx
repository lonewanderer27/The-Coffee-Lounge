import {
  EmailAuthProvider,
  GoogleAuthProvider,
  User,
  UserCredential,
  getAuth,
  getRedirectResult,
  isSignInWithEmailLink,
  sendSignInLinkToEmail,
  signInWithCredential,
  signInWithCustomToken,
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
import { memo, useEffect } from "react";
import { useRecoilState, useSetRecoilState } from "recoil";

import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { FirebaseError } from "firebase/app";
import { LoginProvider } from "../types";
import Logo2 from "../assets/The Coffee Lounge - Logo 2.svg";
import { UserConvert } from "../converters/user";

const SignIn = () => {
  const db = getFirestore();
  const router = useIonRouter();
  const [loginProvider, setLoginProvider] = useRecoilState(loginProviderAtom);
  const [email, setEmail] = useRecoilState(emailForSignin);
  const [loading, dismiss] = useIonLoading();
  const [presentAlert] = useIonAlert();

  const handleGoogle = () => {
    (async () => {
      try {
        const res = await FirebaseAuthentication.signInWithGoogle({
          mode: Capacitor.isNativePlatform() ? "popup" : "redirect",
        });
        const cred = GoogleAuthProvider.credential(res.credential?.idToken);
        const auth = await getAuth();
        await signInWithCredential(auth, cred);
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
        const res = await FirebaseAuthentication.sendSignInLinkToEmail({
          email: email!,
          actionCodeSettings: {
            url: `${window.location.origin}/signin/complete`,
            handleCodeInApp: true,
            android: {
              packageName: "com.jamma.coffeelounge",
              installApp: true,
              minimumVersion: "5",
            },
            dynamicLinkDomain: "thecoffeelounge.page.link",
          },
        });
        console.log(res);
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
        // Confirm the link is a sign-in with email link.
        const emailLink = window.location.href;
        const { isSignInWithEmailLink } =
          await FirebaseAuthentication.isSignInWithEmailLink({
            emailLink,
          });
        if (!isSignInWithEmailLink) {
          throw new Error("Invalid email link!");
        }

        // TODO:  If the saved email is different from what is in the link
        //        ask the user the email again to confirm.

        // The client SDK will parse the code from the link for you.
        const cred = EmailAuthProvider.credentialWithLink(email!, emailLink);
        const auth = getAuth();
        const res = await signInWithCredential(auth, cred);

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

    (async () => {
      const { isSignInWithEmailLink } =
        await FirebaseAuthentication.isSignInWithEmailLink({
          emailLink: window.location.href,
        });
      if (isSignInWithEmailLink) {
        loading({
          message: "Signing you in...",
        });
        setLoginProvider(LoginProvider.EmailOTP);
        confirmEmail();
      } else {
        // check what provider was used to sign in from the redirect
        getRedirectResult(auth).then((result) => {
          switch (result?.providerId) {
            case GoogleAuthProvider.PROVIDER_ID:
              {
                setLoginProvider(LoginProvider.Google);
                confirmGoogle(result);
              }
              break;
          }
        });
      }
    })();
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
      {/* <IonButton
        className="mt-2"
        onClick={() => props.handleGoogle()}
        shape="round"
      >
        <IonLabel className="text-center">Continue with Google</IonLabel>
        <IonIcon slot="start" src={logoGoogle} />
      </IonButton> */}

      <div className="inline-flex items-center justify-center w-full">
        <hr className="w-64 h-px mt-10 mb-10 bg-gray-200 border-0 dark:bg-gray-700"></hr>
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
