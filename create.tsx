import { Alert, Pressable, Text, View } from "react-native";
export default function CreateScreen() {
  return <View style={{ flex: 1, backgroundColor: "#F7FAF8", alignItems: "center", justifyContent: "center", padding: 28 }}>
    <View style={{ width: 76, height: 76, borderRadius: 24, backgroundColor: "#DDF5E5", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 36 }}>＋</Text></View>
    <Text style={{ fontSize: 25, color: "#173B28", fontWeight: "900", marginTop: 18 }}>Create a post</Text>
    <Text style={{ color: "#738077", textAlign: "center", marginTop: 8, lineHeight: 22 }}>Photo and video upload is the next build step.</Text>
    <Pressable onPress={() => Alert.alert("Coming next", "We’ll connect image picker and Supabase Storage in the next step.")} style={{ marginTop: 22, paddingHorizontal: 22, paddingVertical: 13, backgroundColor: "#0F9D58", borderRadius: 12 }}>
      <Text style={{ color: "white", fontWeight: "800" }}>Prepare upload feature</Text>
    </Pressable>
  </View>;
}
