"use client";

import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import chroma from "chroma-js";
import { useMapData } from "@/context/MapDataContext";
import { useRouteData } from "@/context/RouteDataContext";
import { NodesData, RoadsData } from "@/types/types";
import L from "leaflet";

const fetchGeoJSON = async (endpoint: string) => {
  const response = await fetch(`/api/data?endpoint=${endpoint}`);
  const data = await response.json();
  return JSON.parse(data);
};

const getColorForScore = (score: number): string => {
  const colormap = chroma.scale("RdYlGn").domain([-1, 1]);
  return colormap(score).hex();
};

const MapDisplay = () => {
  const [nodesData, setNodesData] = useState<NodesData | null>(null);
  const [roadsData, setRoadsData] = useState<RoadsData | null>(null);
  const [renderNodes, setRenderNodes] = useState(false);
  const { mapData } = useMapData();
  const { routeData } = useRouteData();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const nodes = await fetchGeoJSON("nodes");
        const roads = await fetchGeoJSON("roads");

        setRoadsData(roads);
        setNodesData(nodes);
        setRenderNodes(true);
      } catch (error) {
        console.error("Error fetching geoJSON data:", error);
      }
    };

    fetchData();
  }, []);

  const memoizedRoadsData = useMemo(() => roadsData, [roadsData]);
  const memoizedNodesData = useMemo(() => nodesData, [nodesData]);
  const memoizedMapData = useMemo(() => mapData, [mapData]);
  const memoizedRouteData = useMemo(() => routeData, [routeData]);

  const roadStyle = (feature: any) => ({
    color: getColorForScore(feature.properties.Score),
    weight: 3,
  });

  const routeStyle = {
    color: "#0b6ce3",
    weight: 3,
  };

  const pointToLayer = (feature: any, latlng: L.LatLng) => {
    return L.circleMarker(latlng, {
      radius: 1,
      color: "black",
    });
  };

  const onEachNodeFeature = (feature: any, layer: any) => {
    layer.bindPopup(
      `<div>
        <strong>Knooppunt: </strong>${feature.properties.knooppunt}<br />
        <strong>Street Count: </strong>${feature.properties.street_count}
      </div>`
    );
  };

  return (
    <MapContainer
      center={[52.35981168158447, 4.908318156554737]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
      attributionControl={false}
      zoomControl={false}
      preferCanvas={true}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      {!memoizedMapData && memoizedRoadsData && (
        <GeoJSON
          key={`roadsData-${JSON.stringify(memoizedRoadsData).length}`}
          data={memoizedRoadsData}
          style={roadStyle}
        />
      )}

      {memoizedMapData && (
        <GeoJSON
          key={`mapData-${JSON.stringify(memoizedMapData).length}`}
          data={memoizedMapData}
          style={roadStyle}
        />
      )}

      {memoizedRouteData && (
        <GeoJSON
          key={`routeData-${JSON.stringify(memoizedRouteData).length}`}
          data={memoizedRouteData}
          style={routeStyle}
        />
      )}

      {renderNodes && memoizedNodesData && (
        <GeoJSON
          key={`nodesData-${JSON.stringify(memoizedNodesData).length}`}
          data={memoizedNodesData}
          pointToLayer={pointToLayer}
          onEachFeature={onEachNodeFeature}
        />
      )}
    </MapContainer>
  );
};

export default React.memo(MapDisplay);
