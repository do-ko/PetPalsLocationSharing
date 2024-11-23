import {Text, View} from 'react-native';
import useWalkingLocationSharing from "@/hooks/useWalkingLocationSharing";

export default function Layout() {
    // Initialize MQTT connection
    useWalkingLocationSharing("userId");

    return (
        <View style={{flex: 1}}>
            {/* Your tab navigation or child components go here */}
            <Text>TESTING MQTT CONNECTION</Text>
        </View>
    );
}
