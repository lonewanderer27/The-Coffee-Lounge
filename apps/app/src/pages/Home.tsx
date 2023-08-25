import "./Account.css";
import "swiper/css";

import { CategoryConvert, ProductConvert } from "../converters/products";
import {
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonRow,
  IonText,
  IonTitle,
  IonToolbar,
  isPlatform,
  useIonRouter,
} from "@ionic/react";
import { Suspense, lazy, memo } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { collection, getFirestore, query, where } from "firebase/firestore";

import AnimatedImg from "../components/AnimatedImg";
import { Autoplay } from "swiper/modules";
import CartBtn from "../components/CartBtn";
import { ProductLoading } from "../constants";
import { categoryAtom } from "../atoms/products";
import { chevronForwardOutline } from "ionicons/icons";
import { getAuth } from "firebase/auth";
import { useCollectionDataOnce } from "react-firebase-hooks/firestore";
import useFavorite from "../hooks/favorite";
import { useRefresh } from "../hooks/page";
import { useSetRecoilState } from "recoil";

// import ProductCard from "../components/ProductCard";

const ProductCard = lazy(() => import("../components/ProductCard"));

const Home: React.FC = () => {
  const setCategory = useSetRecoilState(categoryAtom);

  const db = getFirestore();
  const auth = getAuth();
  const [data, loading, error, snapshot, refresh] = useCollectionDataOnce(
    collection(db, "categories").withConverter(CategoryConvert)
  );

  const [
    productsData,
    productsLoading,
    productsError,
    productsSnapshot,
    productsRefresh,
  ] = useCollectionDataOnce(
    query(
      collection(db, "products").withConverter(ProductConvert),
      where("name", "!=", "Loading")
    ),
    {
      initialValue: [ProductLoading],
    }
  );

  const { favorites } = useFavorite();

  const router = useIonRouter();
  const switchCategory = (id: string, name: string, description: string) => {
    setCategory({
      id,
      name,
      description,
    });
    router.push(`/category?name=${name}&id=${id}&description=${description}`);
  };

  const handleRefresh = useRefresh([refresh, productsRefresh]);

  if (auth.currentUser != null && auth.currentUser?.displayName == null) {
    router.push("/onboarding", "forward", "replace");
  }

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
          {!isPlatform("ios") && (
            <IonButtons slot="end">
              <CartBtn />
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Home</IonTitle>
            <IonButtons slot="end">
              <Suspense>
                <CartBtn />
              </Suspense>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <Swiper
          autoplay={{
            delay: 2500,
          }}
          modules={[Autoplay]}
        >
          <SwiperSlide className="ion-padding">
            <AnimatedImg
              className="rounded-sm"
              src="/slides/black_coffee.webp"
              style={{ borderRadius: "10px" }}
            />
          </SwiperSlide>
          <SwiperSlide className="ion-padding">
            <AnimatedImg
              src="/slides/definitely_not_macchiato.webp"
              style={{ borderRadius: "10px" }}
            />
          </SwiperSlide>
          <SwiperSlide className="ion-padding">
            <AnimatedImg
              src="/slides/hot_chocolate.webp"
              style={{ borderRadius: "10px" }}
            />
          </SwiperSlide>
        </Swiper>
        <IonGrid className="ion-padding-vertical">
          {data?.map((category) => (
            <IonRow key={category.id + "ionrow"} className="ion-margin-bottom">
              <IonButton
                fill="clear"
                className="w-full text-inherit ion-no-margin"
                color="default"
                size="large"
                onClick={() =>
                  switchCategory(
                    category.id,
                    category.name,
                    category.description
                  )
                }
              >
                <IonText className="mr-auto font-semibold" slot="start">
                  {category.altName}
                </IonText>
                <IonIcon src={chevronForwardOutline} slot="end"></IonIcon>
              </IonButton>
              <IonCol size="12">
                <IonGrid>
                  <IonRow>
                    {productsData!
                      .filter((product) => product.category == category.id)
                      .slice(0, 2)
                      .map((product) => (
                        <ProductCard key={product.id} {...product} />
                      ))}
                  </IonRow>
                </IonGrid>
              </IonCol>
            </IonRow>
          ))}
          {favorites.length > 1 && (
            <IonRow className="ion-margin-bottom">
              <IonButton
                fill="clear"
                className="w-full text-inherit ion-no-margin"
                color="default"
                size="large"
                routerLink="/my-favorites"
              >
                <IonText className="mr-auto font-semibold" slot="start">
                  Your Favorites
                </IonText>
                <IonIcon src={chevronForwardOutline} slot="end" />
              </IonButton>
              <IonCol size="12">
                <IonGrid>
                  <IonRow>
                    {productsData!
                      .filter((product) =>
                        favorites?.includes(product.id) ? true : false
                      )
                      .slice(0, 2)
                      .map((product) => (
                        <Suspense>
                          <ProductCard
                            key={product.id}
                            image={product.image}
                            id={product.id}
                            category={product.category}
                            name={product.name}
                            price={product.price}
                            sales={product.sales}
                            description={product.description}
                            coffee_type={product.coffee_type}
                          />
                        </Suspense>
                      ))}
                  </IonRow>
                </IonGrid>
              </IonCol>
            </IonRow>
          )}
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default memo(Home);
