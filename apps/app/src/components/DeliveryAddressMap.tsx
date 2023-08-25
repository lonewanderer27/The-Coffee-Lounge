import { lazy, memo, useState } from "react";

import {
  AzureMapsProvider,
} from "react-azure-maps";
import { useQuery } from "@tanstack/react-query";

const MapController = lazy(() => import("./MapController"));

const DeliveryAddressMap = memo((props: { addressString: string }) => {
  const [latlon, setLatlon] = useState<{
    lat: number | null;
    lon: number | null;
  }>({
    lat: null,
    lon: null,
  });

  const { data, status } = useQuery({
    queryKey: ["latlon", props],
    queryFn: async () => {
      console.log("addressString Fn: ", props.addressString);
      const res = await fetch(
        `https://atlas.microsoft.com/search/address/json?&subscription-key=${
          import.meta.env.VITE_AZURE_MAPS_KEY
        }&api-version=1.0&language=en-US&query=${props.addressString}`
      );

      const data = await res.json();
      setLatlon({
        lat: data.results[0].position.lat,
        lon: data.results[0].position.lon,
      });

      return data;
    },
    enabled: !!props.addressString,
  });

  console.log("data", data);

  if (latlon.lat !== null && latlon.lon !== null) {
    return (
      <AzureMapsProvider>
        <MapController lat={latlon!.lat} lon={latlon!.lon} />
      </AzureMapsProvider>
    );
  }

  return <></>;
});

export default DeliveryAddressMap;
