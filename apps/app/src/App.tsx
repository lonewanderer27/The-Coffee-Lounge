import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";
import "./theme/index.css";
import "./global.styles.css";

import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  useIonAlert,
  useIonRouter,
} from "@ionic/react";
import { Redirect, Route } from "react-router-dom";
import { Suspense, lazy, useEffect, useState } from "react";
import {
  bagOutline,
  homeOutline,
  personCircleOutline,
  receiptOutline,
  starOutline,
} from "ionicons/icons";

import AppUrlListener from "./pages/AppUrlListener";
import Home from "./pages/Home";
import { IonReactRouter } from "@ionic/react-router";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import { Preferences } from "@capacitor/preferences";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import dayjs from "dayjs";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";
import { registerSW } from "virtual:pwa-register";
import relativeTime from 'dayjs/plugin/relativeTime'
import { setupIonicReact } from "@ionic/react";
import { useAuthState } from "react-firebase-hooks/auth";

const PaymentMethods = lazy(() => import("./pages/Checkout/PaymentMethods"));

const ProductPage = lazy(() => import("./pages/Product"));

const CategoryPage = lazy(() => import("./pages/Category"));
const Orders = lazy(() => import("./pages/Orders"));
const Order = lazy(() => import("./pages/Order/Order"));
const EditDeliveryAddress = lazy(() => import("./pages/EditDeliveryAddress"));
const Cart = lazy(() => import("./pages/Cart"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Explore = lazy(() => import("./pages/Explore"));
const MyFavorites = lazy(() => import("./pages/MyFavorites"));
const Account = lazy(() => import("./pages/Account"));
const DeliveryAddresses = lazy(() => import("./pages/DeliveryAddresses"));
const Card = lazy(() => import("./pages/Account/Cards/Card"));
const VirtualVisit = lazy(() => import("./pages/VirtualVisit"));
const ProfileAndSecurity = lazy(
  () => import("./pages/Account/ProfileAndSecurity")
);
const ChangePassword = lazy(
  () => import("./pages/Account/ProfileAndSecurity/ChangePassword")
);
const Receipt = lazy(() => import("./pages/Order/Receipt"));
const MyCards = lazy(() => import("./pages/Account/MyCards"));
const Intro = lazy(() => import("./pages/Intro"));
const About = lazy(() => import("./pages/About"));
const PaymentSuccess = lazy(() => import("./pages/Order/PaymentSuccess"));

// Setup DayJS with relative time plugin
dayjs.extend(relativeTime)

setupIonicReact();

export const INTRO_KEY = "seen-intro";

function App() {
  const [introSeen, setIntroSeen] = useState<boolean | null>(null);

  useEffect(() => {
    const checkStorage = async () => {
      const seen = await Preferences.get({ key: INTRO_KEY });
      console.log("seen: ", seen);
      setIntroSeen(seen.value === "true");
    };
    checkStorage();
  }, []);

  console.log("introSeen: ", introSeen);

  const [showUpdate] = useIonAlert();
  const updateSW = registerSW({
    onNeedRefresh() {
      showUpdate({
        header: "New version available",
        message: "Please update the app to continue",
        buttons: [
          {
            text: "Update",
            handler: async () => {
              await updateSW(true);
            },
          },
        ],
      });
    },
  });

  if (!introSeen || introSeen === null) {
    return (
      <Suspense>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
        >
          <Intro setIntro={setIntroSeen} />
        </motion.div>
      </Suspense>
    );
  } else {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <IonApp>
          <IonReactRouter>
            <IonTabs>
              <AppUrlListener></AppUrlListener>
              <IonRouterOutlet>
                <Route exact path="/virtualVisit/index.html" />
                <AuthWrapper>
                  <Route exact path="/account">
                    <Suspense>
                      <Account setIntro={setIntroSeen} />
                    </Suspense>
                  </Route>
                  <Route exact path="/account/accountandsecurity">
                    <Suspense>
                      <ProfileAndSecurity />
                    </Suspense>
                  </Route>
                  <Route exact path="/account/bankaccountscards">
                    <Suspense>
                      <MyCards />
                    </Suspense>
                  </Route>
                  <Route exact path="/account/cards/:card_id">
                    <Suspense>
                      <Card />
                    </Suspense>
                  </Route>
                  <Route exact path="/account/changepass">
                    <Suspense>
                      <ChangePassword />
                    </Suspense>
                  </Route>
                  <Route exact path="/checkout/">
                    <Suspense>
                      <Checkout />
                    </Suspense>
                  </Route>
                  <Route exact path="/checkout/choose-payoption">
                    <Suspense>
                      <PaymentMethods />
                    </Suspense>
                  </Route>
                  <Route exact path="/account/delivery-addresses">
                    <Suspense>
                      <DeliveryAddresses />
                    </Suspense>
                  </Route>
                  <Route
                    exact
                    path="/account/delivery-addresses/edit/:address_id"
                  >
                    <Suspense>
                      <EditDeliveryAddress />
                    </Suspense>
                  </Route>
                  <Route exact path="/account/delivery-addresses/choose">
                    <Suspense>
                      <DeliveryAddresses choose={true} />
                    </Suspense>
                  </Route>
                  <Route exact path="/orders">
                    <Suspense>
                      <Orders />
                    </Suspense>
                  </Route>
                  <Route exact path="/orders/:order_id">
                    <Suspense>
                      <Order />
                    </Suspense>
                  </Route>
                  <Route exact path="/my-favorites">
                    <Suspense>
                      <MyFavorites />
                    </Suspense>
                  </Route>
                  <Route exact path="/orders/:order_id/payment-success">
                    <Suspense>
                      <PaymentSuccess />
                    </Suspense>
                  </Route>
                  <Route exact path="/orders/:order_id/receipt">
                    <Suspense>
                      <Receipt />
                    </Suspense>
                  </Route>
                  <Route exact path="/onboarding">
                    <Onboarding />
                  </Route>
                </AuthWrapper>
                <Route exact path="/home">
                  <Home />
                </Route>
                <Route exact path="/virtualVisit">
                  <Suspense>
                    <VirtualVisit />
                  </Suspense>
                </Route>
                <Route exact path="/explore">
                  <Suspense>
                    <Explore />
                  </Suspense>
                </Route>
                <Route exact path="/cart">
                  <Suspense>
                    <Cart />
                  </Suspense>
                </Route>
                <Route exact path="/">
                  <Redirect to="/home" />
                </Route>
                <Route exact path="/register">
                  <Suspense>
                    <Register />
                  </Suspense>
                </Route>
                <Route exact path="/login">
                  <Login />
                </Route>
                <Route path="/signin/">
                  <SignIn />
                </Route>
                <Route exact path="/category">
                  <Suspense>
                    <CategoryPage />
                  </Suspense>
                </Route>
                <Route exact path="/product/:product_id">
                  <Suspense>
                    <ProductPage />
                  </Suspense>
                </Route>
                <Route exact path="/about">
                  <Suspense>
                    <About />
                  </Suspense>
                </Route>
              </IonRouterOutlet>
              <IonTabBar slot="bottom">
                <IonTabButton tab="home" href="/home">
                  <IonIcon aria-hidden="true" icon={homeOutline} />
                  {/* <IonLabel>Home</IonLabel> */}
                </IonTabButton>
                <IonTabButton tab="explore" href="/explore">
                  <IonIcon aria-hidden="true" icon={starOutline} />
                  {/* <IonLabel>Explore</IonLabel> */}
                </IonTabButton>
                <IonTabButton tab="cart" href="/cart">
                  <IonIcon aria-hidden="true" icon={bagOutline} />
                  {/* <IonLabel>Cart</IonLabel> */}
                </IonTabButton>
                <IonTabButton tab="order" href="/orders">
                  <IonIcon aria-hidden="true" icon={receiptOutline} />
                  {/* <IonLabel>Orders</IonLabel> */}
                </IonTabButton>
                <IonTabButton tab="account" href="/account">
                  <IonIcon aria-hidden="true" icon={personCircleOutline} />
                  {/* <IonLabel>Account</IonLabel> */}
                </IonTabButton>
              </IonTabBar>
            </IonTabs>
          </IonReactRouter>
        </IonApp>
      </motion.div>
    );
  }
}

export const AuthWrapper = ({
  children,
}: React.PropsWithChildren): JSX.Element => {
  const auth = getAuth();
  const [user, loading] = useAuthState(auth);
  const router = useIonRouter();

  useResetNextParam();

  if (user) {
    return children as unknown as JSX.Element;
  }

  if (!loading && user === null) {
    if (router.routeInfo.pathname !== "/signin") {
      router.push(
        "/signin?redirect=" + router.routeInfo.pathname.split("/")[1]
      );
    }
    return (<SignIn />) as unknown as JSX.Element;
  }

  return <></>;
};

export default App;

export function useResetNextParam(): void {
  useEffect(() => {
    const resetNextParam = (): void => {
      const urlSearchParams = new URLSearchParams(window.location.search);
      urlSearchParams.delete("redirect");
      window.history.replaceState(null, "", window.location.pathname);
    };

    resetNextParam();
  }, []);
}

export function nextUrl(url: string) {
  const searchParams = new URLSearchParams(location.search);
  const nextUrl = searchParams.get("redirect") || null;

  console.log("nextUrl: ", "/" + nextUrl);
  console.log("url: ", url);

  if (nextUrl === null) {
    console.log(`redirecting to url: ${url}`);
    return url;
  } else {
    console.log(`redirecting to nextUrl: /${nextUrl}`);
    return `/${nextUrl}`;
  }
}
