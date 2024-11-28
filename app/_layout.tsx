import React, { useState } from "react";
import { Text, View, FlatList, StyleSheet, TextInput, Button, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import useWalkingLocationSharing from "@/hooks/useWalkingLocationSharing";

export default function Layout() {
    const [userId, setUserId] = useState<string>("");
    const [dogIds, setDogIds] = useState<string[]>([]);
    const [newDogId, setNewDogId] = useState<string>(""); // For adding new dog IDs
    const [isWalking, setIsWalking] = useState<boolean>(false);
    const [visibility, setVisibility] = useState<string>("PUBLIC"); // Default visibility
    const [nearbyUsers, startWalk, endWalk] = useWalkingLocationSharing(isWalking, userId, dogIds);

    const handleAddDogId = () => {
        if (newDogId.trim() && !dogIds.includes(newDogId)) {
            setDogIds((prev) => [...prev, newDogId]);
            setNewDogId(""); // Clear the input field
        } else {
            alert("Invalid or duplicate Dog ID.");
        }
    };

    const handleRemoveDogId = (id: string) => {
        setDogIds((prev) => prev.filter((dogId) => dogId !== id));
    };

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

    const renderDogId = ({ item }: { item: string }) => (
        <View style={styles.dogItem}>
            <Text style={styles.text}>{item}</Text>
            <TouchableOpacity onPress={() => handleRemoveDogId(item)}>
                <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
        </View>
    );

    const renderNearbyUser = ({ item }: { item: any }) => (
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
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Dog ID"
                        value={newDogId}
                        onChangeText={setNewDogId}
                    />
                    <Button title="Add Dog ID" onPress={handleAddDogId} />
                    <FlatList
                        data={dogIds}
                        keyExtractor={(item) => item}
                        renderItem={renderDogId}
                        style={styles.dogList}
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
                renderItem={renderNearbyUser}
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
    dogList: {
        marginBottom: 10,
    },
    dogItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 8,
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 8,
        marginBottom: 5,
    },
    removeText: {
        color: "red",
        fontSize: 14,
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
