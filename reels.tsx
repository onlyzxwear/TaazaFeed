import { Text, View } from "react-native";
export default function ReelsScreen() {
  return <View style={{ flex: 1, backgroundColor: "#101612", alignItems: "center", justifyContent: "center", padding: 28 }}>
    <Text style={{ fontSize: 48 }}>▶</Text>
    <Text style={{ color: "white", fontSize: 28, fontWeight: "900", marginTop: 16 }}>Taaza Reels</Text>
    <Text style={{ color: "#C4D1C8", textAlign: "center", marginTop: 10, lineHeight: 22 }}>Short videos will appear here. Next we’ll add video uploads, playback, likes, and comments.</Text>
  </View>;
}
