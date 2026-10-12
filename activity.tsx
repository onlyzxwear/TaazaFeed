import { Text, View } from "react-native";
export default function ActivityScreen() {
  return <View style={{ flex: 1, backgroundColor: "#F7FAF8", alignItems: "center", justifyContent: "center", padding: 28 }}>
    <Text style={{ fontSize: 42 }}>♡</Text><Text style={{ fontSize: 24, fontWeight: "900", color: "#173B28", marginTop: 12 }}>Activity</Text>
    <Text style={{ color: "#738077", textAlign: "center", marginTop: 8, lineHeight: 22 }}>Likes, new followers, and comment notifications will show up here.</Text>
  </View>;
}
