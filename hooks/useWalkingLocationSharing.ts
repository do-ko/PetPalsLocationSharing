import { useEffect, useState } from "react";
import mqtt from "@taoqf/react-native-mqtt";
import * as Location from "expo-location";

const useWalkingLocationSharing = (
    isWalking: boolean,
    userId: string,
    dogIds: string[],
    groupWalkId: string // Optional groupWalkId
): [any[], any[], (visibility: string) => Promise<void>, () => void] => {
    const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
    const [walkUsers, setWalkUsers] = useState<any[]>([]);
    const [mqttClient, setMqttClient] = useState<any>(null);
    const [lastLocation, setLastLocation] = useState<any>(null);
    const [locationSubscription, setLocationSubscription] = useState<any>(null);
    const [locations, setLocations] = useState<any[]>([]); // Track all locations during the walk
    const distanceThreshold = 10; // Threshold in meters
    const timeThreshold = 5000; // Minimum interval between messages in milliseconds
    let lastSentTimestamp = 0;

    // MQTT Initialization
    useEffect(() => {
        const client = mqtt.connect("wss://62547b40ec024d1099d2aae7fe842f47.s1.eu.hivemq.cloud:8884/mqtt", {
            username: "pet-pals-mqtt",
            password: "Password123",
            clientId: `walking-client-${userId}`,
        });

        client.on("connect", () => {
            console.log("Connected to MQTT broker");
        });

        client.on("message", (topic, message) => {
            if (topic === `location/nearby/${userId}`) {
                try {
                    const parsedMessage = JSON.parse(message.toString());
                    setNearbyUsers(parsedMessage);
                } catch (err) {
                    console.error("Error parsing message:", err);
                }
            }

            if (topic === `location/walk/071bcbd3-398c-46c3-84de-30f9584a9323/${userId}`) {
                try {
                    const parsedMessage = JSON.parse(message.toString());
                    setWalkUsers(parsedMessage);
                } catch (err) {
                    console.error("Error parsing message:", err);
                }
            }
        });

        client.on("error", (err) => {
            console.error("MQTT connection error:", err);
        });

        client.on("close", () => {
            console.log("Disconnected from MQTT broker");
        });

        setMqttClient(client);

        return () => {
            client.end();
        };
    }, [userId]);

    // Start Walk
    const startWalk = async (visibility: string) => {
        if (!mqttClient || locationSubscription) return;

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            console.error("Location permission not granted");
            return;
        }

        // Subscribe to nearby users and group walk topics if groupWalkId is provided
        mqttClient.subscribe(`location/nearby/${userId}`, { qos: 1 });
        if (groupWalkId) {
            mqttClient.subscribe(`location/walk/${groupWalkId}/${userId}`, { qos: 1 });
        }

        // Publish walk start message with groupWalkId if provided
        mqttClient.publish(
            `walk/start/${userId}`,
            JSON.stringify({ timestamp: new Date().toISOString(), visibility, dogIds, groupWalkId }),
            { qos: 1 }
        );

        const subscription = await Location.watchPositionAsync(
            { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 5 },
            (location) => {
                const currentTimestamp = Date.now();

                if (
                    !lastLocation ||
                    (calculateDistance(
                            lastLocation.latitude,
                            lastLocation.longitude,
                            location.coords.latitude,
                            location.coords.longitude
                        ) > distanceThreshold &&
                        currentTimestamp - lastSentTimestamp > timeThreshold)
                ) {
                    const isoTimestamp = new Date(location.timestamp).toISOString();
                    const payload = JSON.stringify({
                        userId,
                        latitude: location.coords.latitude,
                        longitude: location.coords.longitude,
                        timestamp: isoTimestamp,
                        groupWalkId, // Include groupWalkId in location updates
                    });

                    setLocations((prev) => [...prev, { latitude: location.coords.latitude, longitude: location.coords.longitude, timestamp: isoTimestamp }]);
                    mqttClient.publish(`location/user/${userId}`, payload, { qos: 1 });
                    setLastLocation(location.coords);
                    lastSentTimestamp = currentTimestamp; // Update last sent timestamp
                    console.log("Location updated and sent:", payload);
                }
            }
        );

        setLocationSubscription(subscription);
    };

    // End Walk
    const endWalk = () => {
        if (mqttClient) {
            const payload = JSON.stringify({
                timestamp: new Date().toISOString(),
                locations,
                groupWalkId, // Include groupWalkId in the end walk payload
            });
            mqttClient.publish(
                `walk/end/${userId}`,
                payload,
                { qos: 1 }
            );
            mqttClient.unsubscribe(`location/nearby/${userId}`);
            if (groupWalkId) {
                mqttClient.unsubscribe(`location/walk/${groupWalkId}/${userId}`);
            }
        }

        // Clear location subscription
        if (locationSubscription) {
            locationSubscription.remove();
            setLocationSubscription(null);
        }

        setNearbyUsers([]); // Clear nearby users list
        setWalkUsers([]); // Clear nearby users list
        setLastLocation(null); // Reset last location
        setLocations([]); // Clear stored locations
        console.log("Walk ended and nearby users cleared.");
    };

    // Calculate Distance
    const calculateDistance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number => {
        const R = 6371e3; // Earth's radius in meters
        const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
        const dLat = toRadians(lat2 - lat1);
        const dLon = toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in meters
    };

    return [nearbyUsers, walkUsers, startWalk, endWalk];
};

export default useWalkingLocationSharing;
