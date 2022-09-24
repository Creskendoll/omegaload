import React, { useState } from "react";
import "./styles/App.css";
import Map from "./Map";
import Marker from "./Marker";
import { mockPath } from "./constants";
import MapDrawer from "./components/MapDrawer";
import DonePage from './components/DonePage'

type ScreenState =
    | "landing"
    | "map"
    | "search-location"
    | "in-progress"
    | "done";

export const ScreenContext = React.createContext<
    [ScreenState, (state: ScreenState) => void]
>(["landing", () => { }]);

function App() {
    const [clicks, setClicks] = useState<google.maps.LatLng[]>([]);
    const [zoom, setZoom] = useState(12);
    const [center, setCenter] = useState<google.maps.LatLngLiteral>({
        lat: 52.5,
        lng: 13.4,
    });
    const [bikeLocation, setBikeLocation] =
        React.useState<google.maps.LatLng | null>(null);
    const [screen, setScreen] = React.useState<ScreenState>("landing");
    const screenValue = React.useMemo(() => [screen, setScreen], [screen]);

    const dirService = React.useRef(new google.maps.DirectionsService());
    const dirRenderer = React.useRef(
        new google.maps.DirectionsRenderer({
            suppressMarkers: true,
            suppressBicyclingLayer: true,
        })
    );

    function animateBike(
        route: google.maps.LatLng[],
        index: number,
        wait: number
    ) {
        setBikeLocation(route[index]);
        if (index < route.length - 1) {
            // call the next "frame" of the animation
            setTimeout(() => {
                animateBike(route, index + 1, wait);
            }, wait);
        }
    }

    function fetchDestination(
        origin: google.maps.LatLng,
        destination: google.maps.LatLng
    ) {
        if (mockPath) {
            setClicks([
                new google.maps.LatLng(mockPath.request.origin.location),
                new google.maps.LatLng(mockPath.request.destination.location),
            ]);
            dirRenderer.current.setDirections(mockPath as any);
            animateBike(mockPath.routes[0].overview_path as any, 0, 40);
        } else {
            dirService.current.route(
                {
                    origin,
                    destination,
                    travelMode: google.maps.TravelMode.BICYCLING,
                },
                (result, status) => {
                    if (status === "OK")
                        dirRenderer.current.setDirections(result);
                    const [route] = result.routes;

                    if (route) animateBike(route.overview_path, 0, 40);
                }
            );
        }
    }

    const onClick = (e: google.maps.MapMouseEvent) => {
        const newClicks = [clicks[clicks.length - 1], e.latLng];
        setClicks(newClicks);

        const [origin, destination] = newClicks;
        if (origin && destination) {
            fetchDestination(origin, destination);
        }
    };

    const onIdle = (m: google.maps.Map) => {
        setZoom(m.getZoom());
        setCenter(m.getCenter().toJSON());

        if (!dirRenderer.current.getMap()) dirRenderer.current.setMap(m);
    };

    return (
        <ScreenContext.Provider value={screenValue as any}>
            <div>
                {screen === "landing" && (
                    <>
                        <h1>Bike Delivery</h1>
                        <button onClick={() => setScreen("map")}>Next</button>
                    </>
                )}
                {(screen === "map" || screen === "in-progress") && (
                    <>
                        <Map
                            style={{}}
                            center={center}
                            zoom={zoom}
                            onClick={onClick}
                            onIdle={onIdle}
                            clickableIcons={false}
                        >
                            {clicks.map((latLng, i) => (
                                <Marker
                                    key={i}
                                    position={latLng}
                                    animation={google.maps.Animation.DROP}
                                />
                            ))}
                            {bikeLocation && (
                                <Marker
                                    key={"bike"}
                                    icon={{
                                        url: "bike.png",
                                        scaledSize: new google.maps.Size(
                                            80,
                                            80
                                        ),
                                    }}
                                    position={bikeLocation}
                                />
                            )}
                        </Map>

                        <MapDrawer screen={screen} />
                    </>
                )}
                {screen === "search-location" && <h1>Search</h1>}
                {screen === "done" && <DonePage />}
            </div>
        </ScreenContext.Provider>
    );
}

export default App;
