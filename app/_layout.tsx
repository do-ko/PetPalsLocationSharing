import React from 'react';
import { Text, View, FlatList, StyleSheet } from 'react-native';
import useWalkingLocationSharing from "@/hooks/useWalkingLocationSharing";

export default function Layout() {
    // Get the nearby users from the hook
    const nearbyUsers = useWalkingLocationSharing("userId");

    const renderItem = ({ item }: { item: any }) => (
        <View style={styles.item}>
            <Text style={styles.text}>User ID: {item.userId}</Text>
            <Text style={styles.text}>
                Location: {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
            </Text>
            <Text style={styles.text}>Timestamp: {item.timestamp}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Nearby Users</Text>
            <FlatList
                data={nearbyUsers}
                keyExtractor={(item) => item.userId}
                renderItem={renderItem}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    item: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 12,
    },
    text: {
        fontSize: 16,
    },
});
