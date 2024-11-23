import { useEffect } from 'react';
import mqtt from '@taoqf/react-native-mqtt';

const useMqtt = () => {
    useEffect(() => {
        // Connect to the MQTT broker
        const client = mqtt.connect('wss://62547b40ec024d1099d2aae7fe842f47.s1.eu.hivemq.cloud:8884/mqtt', {
            username: 'pet-pals-mqtt', // Replace with your broker's username
            password: 'Password123', // Replace with your broker's password
            clientId: 'react-native-client-7db31549-0985-40ab-bbe7-b7231e24e8ec', // Unique Client ID
        });

        // On connect
        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            const userId = '7db31549-0985-40ab-bbe7-b7231e24e8ec';

            // Publish initial location
            const locationPayload = JSON.stringify({ latitude: 37.7749, longitude: -122.4194 });
            client.publish(`location/user/${userId}`, locationPayload, { qos: 1 });

            // Subscribe to the user's nearby topic
            client.subscribe(`location/nearby/${userId}`, (err) => {
                if (!err) {
                    console.log(`Subscribed to location/nearby/${userId}`);
                } else {
                    console.error('Subscription error:', err);
                }
            });
        });

        // Handle incoming messages
        client.on('message', (topic, message) => {
            console.log(`Message received on topic ${topic}:`, message.toString());
        });

        // Handle disconnection
        client.on('close', () => {
            console.log('Disconnected from MQTT broker');
        });

        return () => {
            client.end(); // Cleanup on unmount
        };
    }, []);
};

export default useMqtt;
