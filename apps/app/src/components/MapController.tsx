import { AzureMap, AzureMapsContext, IAzureMapOptions, IAzureMapsContextProps } from "react-azure-maps";
import { data, layer, source } from "azure-maps-control";
import { memo, useContext, useEffect } from "react";
import { AuthenticationType } from "azure-maps-control";

const dataSourceRef = new source.DataSource();
const layerRef = new layer.SymbolLayer(dataSourceRef);

const AzureMapOptions: IAzureMapOptions = {
  authOptions: {
    authType: AuthenticationType.subscriptionKey,
    subscriptionKey: import.meta.env.VITE_AZURE_MAPS_KEY,
  },
  zoom: 15,
};

const MapController = memo((props: { lat: number; lon: number }) => {
  const { mapRef, isMapReady } =
    useContext<IAzureMapsContextProps>(AzureMapsContext);
  const changeMapCenter = () => {
    if (mapRef) {
      mapRef.setCamera({
        center: [props.lon, props.lat],
      });
    }
  };

  const addPin = () => {
    if (mapRef) {
      const newPoint = new data.Position(props.lon, props.lat, 0);
      dataSourceRef.add(new data.Feature(new data.Point(newPoint)));
    }
  };

  useEffect(() => {
    if (mapRef) {
      mapRef.sources.add(dataSourceRef);
      mapRef.layers.add(layerRef);
    }
  }, []);

  useEffect(() => {
    if (isMapReady && mapRef && props.lat && props.lon) {
      changeMapCenter();
      addPin();
    }
  }, [isMapReady, props.lat, props.lon]);

  console.log("props", props);

  return (
    <div style={{ height: "300px" }}>
      <AzureMap options={AzureMapOptions} />
    </div>
  );
});

export default MapController;