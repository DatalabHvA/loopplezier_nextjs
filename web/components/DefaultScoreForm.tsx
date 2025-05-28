import React, { useState, useRef, useEffect } from "react";
import { useMapData } from "@/context/MapDataContext";
import { useRouteData } from "@/context/RouteDataContext";
import { Scores } from "@/types/types";

const ROUTE_TYPES = {
  water_and_roads: {
    label: "Water & Minder Drukke Wegen",
    description:
      "Een rustige route langs het water en weg van druk verkeer. Ideaal voor ontspanning.",
    scores: {
      "Score openbare verlichting": 2,
      "Score bomen": 1,
      "Score water": 5,
      "Score monumenten": 0,
      "Score drukke wegen": -10,
      "Score parken": 2,
    },
  },
  monuments_and_trees: {
    label: "Monumenten & Bomen",
    description:
      "Een culturele route door groene gebieden met historische monumenten.",
    scores: {
      "Score openbare verlichting": 2,
      "Score bomen": 5,
      "Score water": 1,
      "Score monumenten": 5,
      "Score drukke wegen": -3,
      "Score parken": 3,
    },
  },
};

const DISTANCE_OPTIONS = [
  { label: "500m", value: 500 },
  { label: "1km", value: 1000 },
  { label: "2km", value: 2000 },
  { label: "5km", value: 5000 },
  { label: "10km", value: 10000 },
];

export default function DefaultScoreForm() {
  const { setMapData } = useMapData();
  const { setRouteData } = useRouteData();
  const START_KNOOPPUNT = 2913;
  const EIND_KNOOPPUNT = 3045;

  const [routeType, setRouteType] =
    useState<keyof typeof ROUTE_TYPES>("water_and_roads");
  const [distance, setDistance] = useState<number>(500);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [distanceDropdownOpen, setDistanceDropdownOpen] = useState(false);
  const [routeDropdownOpen, setRouteDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    // Collapse immediately
    setIsOpen(false);
    setIsLoading(true); // Start loading

    const selected = ROUTE_TYPES[routeType];
    const scores: Scores = {
      "Start knooppunt": START_KNOOPPUNT,
      "Eind knooppunt": EIND_KNOOPPUNT,
      "Minimale afstand": distance,
      "Maximale afstand": distance,
      ...selected.scores,
    };

    try {
      const mapRes = await fetch("/api/data?endpoint=score_map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      });
      setMapData(await mapRes.json());

      const routeRes = await fetch("/api/data?endpoint=route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      });
      setRouteData(await routeRes.json());
    } catch (err) {
      console.error("Error generating route:", err);
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  // Collapse on outside click (mobile only)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div
      ref={containerRef}
      className={`fixed top-4 left-4 z-40 bg-white text-neutral-900 shadow-xl w-full sm:w-80 max-w-[90vw] overflow-hidden transition-all duration-500 rounded-xl ${
        isOpen ? "h-72 overflow-visible" : "h-12"
      }`}
    >
      {/* Always visible header */}
      <div
        className={`cursor-pointer px-4 flex items-center justify-between sm:cursor-default text-sm text-gray-600 transition-all duration-500 ${
          isOpen
            ? "opacity-0 scale-95 h-0 overflow-hidden"
            : "opacity-100 scale-100 h-12"
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">🚶‍♂️</span>
          <span>Genereer een route</span>
        </div>
      </div>

      {/* Expanding content */}
      <div className="flex flex-col justify-between h-full p-4 text-sm transition-all duration-500">
        {/* Top Section */}
        <div className="space-y-4">
          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Route type
            </label>
            <button
              type="button"
              className="w-full flex justify-between items-center px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onClick={() => setRouteDropdownOpen((prev) => !prev)}
            >
              {ROUTE_TYPES[routeType].label}
              <svg
                className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-300 ${
                  routeDropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {routeDropdownOpen && (
              <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                {Object.entries(ROUTE_TYPES).map(([key, { label }]) => (
                  <li
                    key={key}
                    onClick={() => {
                      setRouteType(key as keyof typeof ROUTE_TYPES);
                      setRouteDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-600 cursor-pointer rounded-lg transition"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="relative">
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Afstand
            </label>
            <button
              type="button"
              className="w-full flex justify-between items-center px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              onClick={() => setDistanceDropdownOpen((prev) => !prev)}
            >
              {DISTANCE_OPTIONS.find((d) => d.value === distance)?.label}
              <svg
                className={`w-4 h-4 ml-2 text-gray-500 transition-transform duration-300 ${
                  distanceDropdownOpen ? "rotate-180" : ""
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {distanceDropdownOpen && (
              <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                {DISTANCE_OPTIONS.map(({ label, value }) => (
                  <li
                    key={value}
                    onClick={() => {
                      setDistance(value);
                      setDistanceDropdownOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-gray-800 hover:bg-blue-50 hover:text-blue-600 cursor-pointer rounded-lg transition"
                  >
                    {label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="flex-grow" />

        <div className="space-y-2">
          <div className="text-xs text-gray-600">
            {ROUTE_TYPES[routeType].description}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 px-4 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-transparent shadow-sm transition duration-200"
          >
            Genereer route
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90vw] sm:w-auto bg-white text-gray-800 px-4 py-2 rounded-xl shadow-lg text-sm z-50">
          De route wordt gegenereerd. Bedankt voor je geduld.
        </div>
      )}
    </div>
  );
}
