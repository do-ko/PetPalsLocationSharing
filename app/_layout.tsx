import React, { useState } from "react";
import { Text, View, FlatList, StyleSheet, TextInput, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import useWalkingLocationSharing from "@/hooks/useWalkingLocationSharing";

export default function Layout() {
    const [userId, setUserId] = useState<string>("");
    const [isWalking, setIsWalking] = useState<boolean>(false);
    const [visibility, setVisibility] = useState<string>("PUBLIC"); // Default visibility
    const [nearbyUsers, startWalk, endWalk] = useWalkingLocationSharing(isWalking, userId);

    const handleStartWalk = async () => {
        if (!userId) {
            alert("Please enter a valid User ID.");
            return;
        }
        setIsWalking(true);
        await startWalk(visibility); // Pass the selected visibility
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
                    <Picker
                        selectedValue={visibility}
                        onValueChange={(itemValue) => setVisibility(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Public" value="PUBLIC" />
                        <Picker.Item label="Private" value="PRIVATE" />
                        <Picker.Item label="Friends Only" value="FRIENDS_ONLY" />
                    </Picker>
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
    picker: {
        height: 50,
        marginBottom: 10,
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
