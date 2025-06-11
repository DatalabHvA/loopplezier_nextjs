"use client";

import React from "react";
import { MapDataProvider } from "@/context/MapDataContext";
import { RouteDataProvider } from "@/context/RouteDataContext";
import { DrawerProvider, useDrawer } from "@/context/DrawerContext";
import dynamic from "next/dynamic";
import DefaultScoreForm from "@/components/DefaultScoreForm";

const MapDisplay = dynamic(() => import("@/components/MapDisplay"), {
  ssr: false,
});

export default function Home() {
  return (
    <DrawerProvider>
      <MapDataProvider>
        <RouteDataProvider>
          <div className="relative flex h-screen w-full">
            <DefaultScoreForm />
            <div className="flex-grow z-10">
              <MapDisplay />
            </div>
          </div>
        </RouteDataProvider>
      </MapDataProvider>
    </DrawerProvider>
  );
}
