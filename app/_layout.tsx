import React, { useState } from "react";
import { Text, View, FlatList, StyleSheet, Button, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import useWalkingLocationSharing from "@/hooks/useWalkingLocationSharing";

export default function Layout() {
    const predefinedUserIds = ["7db31549-0985-40ab-bbe7-b7231e24e8ec", "673843cb-e81b-4e2b-88fb-977feaaae8f3", "d701566a-2e55-483a-9c36-810740b9b0a6"];
    const predefinedDogIds = ["10da2493-1cf1-4457-8d5d-36ff42cff3c3", "81f2bbb9-4a17-40d0-98a0-6a83f977f057", "15430fee-41c6-4e6d-864f-201acee32e6b", "d46f7ea3-5479-49d2-b505-b4d49bc4f743"];
    const predefinedGroupWalkIds = ["071bcbd3-398c-46c3-84de-30f9584a9323"];

    const [userId, setUserId] = useState<string>("");
    const [dogIds, setDogIds] = useState<string[]>([]);
    const [selectedDogId, setSelectedDogId] = useState<string>("");
    const [groupWalkId, setGroupWalkId] = useState<string>("");
    const [isWalking, setIsWalking] = useState<boolean>(false);
    const [visibility, setVisibility] = useState<string>("PUBLIC");
    const [nearbyUsers, walkUsers, startWalk, endWalk] = useWalkingLocationSharing(isWalking, userId, dogIds, groupWalkId);

    const handleAddDogId = () => {
        if (selectedDogId && !dogIds.includes(selectedDogId)) {
            setDogIds((prev) => [...prev, selectedDogId]);
            setSelectedDogId("");
        } else {
            alert("Invalid or duplicate Dog ID.");
        }
    };

    const handleRemoveDogId = (id: string) => {
        setDogIds((prev) => prev.filter((dogId) => dogId !== id));
    };

    const handleStartWalk = async () => {
        if (!userId) {
            alert("Please select a User ID.");
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

    return (
        <View style={styles.container}>
            {!isWalking ? (
                <View>
                    <Text style={styles.label}>Select User ID:</Text>
                    <Picker
                        selectedValue={userId}
                        onValueChange={(value) => setUserId(value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select User ID" value="" />
                        {predefinedUserIds.map((id) => (
                            <Picker.Item key={id} label={id} value={id} />
                        ))}
                    </Picker>

                    <Text style={styles.label}>Select Dog ID:</Text>
                    <Picker
                        selectedValue={selectedDogId}
                        onValueChange={(value) => setSelectedDogId(value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Select Dog ID" value="" />
                        {predefinedDogIds.map((id) => (
                            <Picker.Item key={id} label={id} value={id} />
                        ))}
                    </Picker>
                    <Button title="Add Dog ID" onPress={handleAddDogId} />

                    {/* Display the selected dog IDs */}
                    <Text style={styles.label}>Selected Dog IDs:</Text>
                    <FlatList
                        data={dogIds}
                        keyExtractor={(item) => item}
                        renderItem={renderDogId}
                        style={styles.dogList}
                    />

                    <Text style={styles.label}>Select Group Walk ID (optional):</Text>
                    <Picker
                        selectedValue={groupWalkId}
                        onValueChange={(value) => setGroupWalkId(value)}
                        style={styles.picker}
                    >
                        <Picker.Item label="None" value="" />
                        {predefinedGroupWalkIds.map((id) => (
                            <Picker.Item key={id} label={id} value={id} />
                        ))}
                    </Picker>

                    <Text style={styles.label}>Select Visibility:</Text>
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
            <Text>{groupWalkId}</Text>

            <FlatList
                data={nearbyUsers}
                keyExtractor={(item) => item.userId}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>User ID: {item.userId}</Text>
                        <Text>Location: {item.latitude}, {item.longitude}</Text>
                        <Text>Timestamp: {item.timestamp}</Text>
                        <Text>NEARBY</Text>
                    </View>
                )}
            />

            <Text>{walkUsers.length != 0 ? "Walk Users" : "There are no walk users"}</Text>
            <FlatList
                data={walkUsers}
                keyExtractor={(item) => item.userId}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        <Text>User ID: {item.userId}</Text>
                        <Text>Location: {item.latitude}, {item.longitude}</Text>
                        <Text>Timestamp: {item.timestamp}</Text>
                        <Text>WALK</Text>
                    </View>
                )}
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
    label: {
        fontSize: 16,
        marginBottom: 4,
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
        backgroundColor: "#f9f9f9",
    },
    text: {
        fontSize: 16,
    },
});
