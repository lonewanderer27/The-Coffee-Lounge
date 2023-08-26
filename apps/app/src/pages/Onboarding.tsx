import { ComboBox, Item } from "../components/ComboBox";
import {
  FieldValue,
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  IonButton,
  IonContent,
  IonInput,
  IonPage,
  IonRow,
  IonSpinner,
  useIonAlert,
  useIonRouter,
} from "@ionic/react";
import { SubmitHandler, useForm } from "react-hook-form";
import { getAuth, updateProfile } from "firebase/auth";
import { memo, useState } from "react";

import { FirebaseError } from "firebase/app";
import ProfileImage from "../components/ProfileImage";
import { UserConvert } from "../converters/user";
import { isPlatform } from "@ionic/react";
import { useDocument } from "react-firebase-hooks/firestore";

interface IFormInput {
  nickname: string;
  gender?: string;
  pronouns?: string;
  updatedAt?: FieldValue;
}

function Onboarding() {
  const db = getFirestore();
  const auth = getAuth();
  const router = useIonRouter();

  const userRef = doc(
    db,
    "users",
    auth.currentUser?.uid ?? "Loading"
  ).withConverter(UserConvert);
  const [values] = useDocument(userRef);
  let userData: any;

  console.info(values);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { isValid, isValidating },
  } = useForm<IFormInput>({
    defaultValues: async () => {
      userData = await getDoc(userRef);
      return {
        nickname: userData.get("nickname") ?? "",
        gender: userData.get("gender") ?? "",
        pronouns: userData.get("pronouns") ?? "",
      };
    },
  });
  const [loading, setLoading] = useState(false);
  const [presentAlert] = useIonAlert();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    setLoading(true);

    try {
      // update firebase user profile
      await updateProfile(auth.currentUser!, {
        displayName: data.nickname,
      });

      // construct the user data
      const formData: IFormInput = {
        nickname: data.nickname,
        updatedAt: serverTimestamp(),
        ...(data.gender && { gender: data.gender }),
        ...(data.pronouns && { pronouns: data.pronouns }),
      };

      // set the information in user's document
      await setDoc(userRef, {
        ...userData,
        ...formData,
        onboarded: true,
      });

      // navigate to home
      setLoading(false);
      router.push("/home", "forward", "replace");
    } catch (err: unknown) {
      const error = err as FirebaseError;
      console.error(err);
      presentAlert({
        header: "Error",
        message: error.message,
        buttons: ["OK"],
      });
    }
  };

  const currentUser = auth.currentUser;

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div className="p-4 pt-0">
          <ProfileImage
            currentUser={currentUser}
            gender={watch("gender")}
            imgClassName="my-5 w-2/4 ml-[-20px] rounded-full"
            onboarding
            showEditBtn
          />
          <h6 className="font-bold">Before you start</h6>
          <p>
            To personalize your orders, we would like to ask you a few things.
          </p>
          <form
            className="flex flex-col justify-center items-center mt-8"
            onSubmit={handleSubmit(onSubmit)}
          >
            <IonInput
              label="Nickname"
              labelPlacement="floating"
              fill="outline"
              placeholder="What should we call you?"
              {...register("nickname", { required: true })}
            />
            <IonRow>
              <div>
                <div className="mt-2">
                  <ComboBox
                    inputValue={watch("gender")}
                    label="Gender (Optional)"
                    {...register("gender", { required: false })}
                    onInputChange={(v) => {
                      if (v.includes("not say")) {
                        setValue("gender", "");
                      } else {
                        setValue("gender", v);
                      }
                    }}
                  >
                    <Item key="Male">Male</Item>
                    <Item key="Female">Female</Item>
                    <Item key="Non Binary">Non-Binary</Item>
                    <Item key="I'd rather not say">I'd rather not say</Item>
                  </ComboBox>
                </div>
              </div>
              <div>
                <div className="mt-2">
                  <ComboBox
                    inputValue={watch("pronouns")}
                    label="Pronouns (Optional)"
                    {...register("pronouns", { required: false })}
                    onInputChange={(v) => {
                      if (v.includes("not say")) {
                        setValue("pronouns", "");
                      } else {
                        setValue("pronouns", v);
                      }
                    }}
                  >
                    <Item key="He/Him">He/Him</Item>
                    <Item key="She/Her">She/Her</Item>
                    <Item key="They/Them">They/Them</Item>
                    <Item key="I'd rather not say">I'd rather not say</Item>
                  </ComboBox>
                </div>
              </div>
            </IonRow>
            <IonButton
              className="ion-margin-top w-full mt-8"
              type="submit"
              disabled={!isValid || isValidating}
            >
              {loading ? (
                <IonSpinner
                  className={`${!isPlatform("ios") && "animate-spin"}`}
                />
              ) : (
                "Continue"
              )}
            </IonButton>
          </form>
        </div>
      </IonContent>
    </IonPage>
  );
}

export default memo(Onboarding);
