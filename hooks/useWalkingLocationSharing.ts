import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import mqtt from '@taoqf/react-native-mqtt';

const useWalkingLocationSharing = (userId: string) => {
  const [nearbyUsers, setNearbyUsers] = useState([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const initialize = async () => {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted');
        return;
      }

      // Connect to MQTT broker
      const client = mqtt.connect('wss://62547b40ec024d1099d2aae7fe842f47.s1.eu.hivemq.cloud:8884/mqtt', {
        username: 'pet-pals-mqtt', // Replace with HiveMQ username
        password: 'Password123', // Replace with HiveMQ password
        clientId: `walking-client-${userId}`,
        will: {
          topic: `presence/user/${userId}`,
          payload: 'offline',
          qos: 1,
          retain: false,
        },
      });

      client.on('connect', () => {
        console.log('Connected to MQTT broker');
        // Notify others of presence
        client.publish(`presence/user/${userId}`, 'online', { qos: 1 });

        // Subscribe to the nearby users topic
        const nearbyTopic = `location/nearby/${userId}`;
        client.subscribe(nearbyTopic, { qos: 1 }, (err) => {
          if (err) {
            console.error(`Failed to subscribe to ${nearbyTopic}:`, err);
          } else {
            console.log(`Subscribed to ${nearbyTopic}`);
          }
        });

        // Handle incoming messages
        client.on('message', (topic, message) => {
          if (topic === `location/nearby/${userId}`) {
            try {
              const parsedMessage = JSON.parse(message.toString());
              console.log('Received nearby users:', parsedMessage);
              setNearbyUsers(parsedMessage); // Update the state with the nearby users
            } catch (err) {
              console.error('Error parsing message:', err);
            }
          }
        });

        // Start sending periodic location updates
        interval = setInterval(async () => {
          try {
            const location = await Location.getCurrentPositionAsync({});
            const payload = JSON.stringify({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              timestamp: location.timestamp,
            });

            client.publish(`location/user/${userId}`, payload, { qos: 1 });
            console.log(`Published location: ${payload}`);
          } catch (err) {
            console.error('Error fetching or publishing location:', err);
          }
        }, 5000); // Send location every 5 seconds
      });

      client.on('error', (err) => {
        console.error('MQTT connection error:', err);
      });

      client.on('close', () => {
        console.log('Disconnected from MQTT broker');
      });

      return () => {
        if (interval) clearInterval(interval);
        client.end(); // Clean up the MQTT client
      };
    };

    initialize();
  }, [userId]);

  return nearbyUsers; // Return the nearby users to the component
};

export default useWalkingLocationSharing;
