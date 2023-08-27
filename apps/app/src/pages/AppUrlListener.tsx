import { App, URLOpenListenerEvent } from "@capacitor/app";

import { useEffect } from "react";
import { useHistory } from "react-router";

const AppUrlListener = () => {
  let history = useHistory();
  useEffect(() => {
    App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
      const slug = event.url.split(".app").pop();
      if (slug) {
        history.push(slug)
      }

      // If no match, do nothing - let regular routing
      // logic take over
    })
  }, []);

  return null;
}

export default AppUrlListener;