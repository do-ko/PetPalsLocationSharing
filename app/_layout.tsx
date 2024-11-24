import React, { useState } from "react";
import { Text, View, FlatList, StyleSheet, TextInput, Button } from "react-native";
import useWalkingLocationSharing from "@/hooks/useWalkingLocationSharing";

export default function Layout() {
    const [userId, setUserId] = useState<string>("");
    const [isWalking, setIsWalking] = useState<boolean>(false);
    const [nearbyUsers, startWalk, endWalk] = useWalkingLocationSharing(isWalking, userId);

    const handleStartWalk = async () => {
        if (!userId) {
            alert("Please enter a valid User ID.");
            return;
        }
        setIsWalking(true);
        await startWalk();
    };

    const handleEndWalk = () => {
        setIsWalking(false);
        endWalk();
    };

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
            {!isWalking ? (
                <View>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter User ID"
                        value={userId}
                        onChangeText={setUserId}
                    />
                    <Button title="Start Walk" onPress={handleStartWalk} />
                </View>
            ) : (
                <Button title="End Walk" onPress={handleEndWalk} />
            )}

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
    input: {
        height: 40,
        borderColor: "gray",
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 8,
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
