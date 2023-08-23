import { IonCol, IonRouterLink, IonRow, useIonRouter } from "@ionic/react";

export const Action = (props: {
  message?: string;
  link: string;
  text: string;
  align?: "center" | "left" | "right";
  arrow?: boolean;
}) => {
  const r = useIonRouter();
  return (
    <IonRow className={`ion-text-${props.align} ion-justify-content-center`}>
      <IonCol size="12">
        <p className="text-center">
          {props.message}
          <IonRouterLink
            className="custom-link cursor-pointer"
            onClick={() => r.push(props.link, "forward", "replace")}
          >
            {" "}
            {props.text} {props.arrow && "&rarr;"}
          </IonRouterLink>
        </p>
      </IonCol>
    </IonRow>
  );
};

Action.defaultProps = {
  align: "center",
};
