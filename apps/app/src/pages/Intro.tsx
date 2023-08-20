import "@dotlottie/react-player/dist/index.css";
import "swiper/css";
import "swiper/css/pagination";

import { AnimatePresence, motion } from "framer-motion";
import { Controller, Pagination } from "swiper/modules";
import {
  IonApp,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonPage,
  IonRow,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";

import { DotLottiePlayer } from "@dotlottie/react-player";
import { INTRO_KEY } from "../App";
import { Preferences } from "@capacitor/preferences";
import { Swiper as SwiperType } from "swiper/types";
import { getAuth } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { useState } from "react";

const sliderData = [
  {
    title: "Create Perfect Beverage",
    description:
      "Customize your coffee exactly the way you like it - size, milk, syrup, ice, and more.",
    image: "/lotties/coffee-1-NJVoiHpml6.lottie",
  },
  {
    title: "Flexible Pickup & Delivery",
    description:
      "Get your coffee delivered to your doorstep or pick it up in-store.",
    image: "/lotties/delivery-girl-cycling-city-g4Hj3urOHo.lottie",
  },
  {
    title: "Explore Cafe Virtually",
    description: "Experience our cafe in stunning 3D view.",
    image:
      "/lotties/futuristic-virtual-reality-glasses-helmet-t8rqMmyk1s.lottie",
  },
];

type slideType = {
  title: string;
  description: string;
  image: string;
};

export default function Intro(props: {
  setIntro: React.Dispatch<React.SetStateAction<boolean | null>>;
}) {
  const [user] = useAuthState(getAuth());

  const doneIntro = () => {
    Preferences.set({ key: INTRO_KEY, value: "true" });
    props.setIntro(true);
    window.history.replaceState({}, "", user ? "/home" : "/signin");
  };

  const [index, setIndex] = useState<number>(0);
  const [controlledSwiper, setControlledSwiper] = useState<SwiperType | null>(
    null
  );

  const handleNext = () => {
    if (index !== 2) {
      setIndex((prev) => prev + 1);
    }
    controlledSwiper?.slideNext();
  };

  const handleSkip = () => {
    controlledSwiper?.slideTo(4);
    setIndex(2);
  };

  console.log("index: ", index);

  return (
    <IonApp>
      <IonPage>
        <IonContent fullscreen>
          <div className="h-full">
            <IonRow className="h-96 w-full ion-padding">
              {index === 0 && (
                <motion.div
                  key={0}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <Player src={sliderData[0].image} />
                </motion.div>
              )}
              {index === 1 && (
                <motion.div
                  key={1}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <Player src={sliderData[1].image} />
                </motion.div>
              )}
              {index === 2 && (
                <motion.div
                  key={2}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                >
                  <Player src={sliderData[2].image} />
                </motion.div>
              )}
            </IonRow>
            <IonRow className="h-52">
              <Swiper
                modules={[Pagination, Controller]}
                onSwiper={setControlledSwiper}
                pagination={true}
                watchSlidesProgress={true}
                onSlideChange={(swiperCore) => {
                  const { activeIndex } = swiperCore;
                  if (activeIndex != 3) {
                    setIndex(activeIndex);
                  }
                }}
              >
                {sliderData.map((slide: slideType, index) => (
                  <SwiperSlide key={`swiperslide${index}`}>
                    <Slide {...slide} key={`slide${index}`} />
                  </SwiperSlide>
                ))}
                <SwiperSlide>
                  <div className="text-center flex flex-col items-center justify-center">
                    <IonText>
                      <h1 className="font-bold">The Coffee Lounge</h1>
                    </IonText>
                    <IonText>
                      <p className="text-center font-bold">
                        Experience a new way of ordering coffee
                      </p>
                    </IonText>
                    <IonButton onClick={doneIntro}>
                      <IonText>{user ? "Done" : "Continue"}</IonText>
                    </IonButton>
                  </div>
                </SwiperSlide>
              </Swiper>
            </IonRow>
          </div>
        </IonContent>
        <IonFooter>
          <IonToolbar className="ion-padding-horizontal">
            {controlledSwiper != undefined &&
              controlledSwiper?.activeIndex <= 3 && (
                <IonButton slot="start" fill="clear" onClick={handleSkip}>
                  Skip
                </IonButton>
              )}
            {controlledSwiper != undefined &&
              controlledSwiper?.activeIndex <= 3 && (
                <IonButton slot="end" onClick={handleNext}>
                  Next
                </IonButton>
              )}
          </IonToolbar>
        </IonFooter>
      </IonPage>
    </IonApp>
  );
}

function Slide(props: slideType) {
  return (
    <div>
      <IonText>
        <h1 className="ion-text-center font-bold">{props.title}</h1>
      </IonText>
      <IonText>
        <p className="text-center font-bold  p-5">{props.description}</p>
      </IonText>
    </div>
  );
}

const Player = (props: { src: string }) => {
  return (
    <DotLottiePlayer
      src={props.src}
      autoplay
      loop
      className="p-5 mt-5 w-full h-96"
    />
  );
};
