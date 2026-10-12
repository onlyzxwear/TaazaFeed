import { useEffect, useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function ProfileScreen() {
  const [email, setEmail] = useState("Your profile");
  useEffect(() => { supabase?.auth.getUser().then(({ data }) => { if (data.user?.email) setEmail(data.user.email); }); }, []);
  async function signOut() {
    if (!supabase) { router.replace("/auth"); return; }
    const { error } = await supabase.auth.signOut();
    if (error) Alert.alert("Sign out failed", error.message);
    else router.replace("/auth");
  }
  return <View style={{ flex: 1, backgroundColor: "#F7FAF8", padding: 24 }}>
    <Text style={{ color: "#0F9D58", fontSize: 26, fontWeight: "900" }}>Your profile</Text>
    <View style={{ backgroundColor: "white", borderRadius: 20, padding: 22, marginTop: 20, borderColor: "#E5EEE7", borderWidth: 1 }}>
      <View style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: "#DDF5E5", alignItems: "center", justifyContent: "center" }}><Text style={{ fontSize: 34 }}>👤</Text></View>
      <Text style={{ color: "#173B28", fontSize: 18, fontWeight: "800", marginTop: 14 }}>{email}</Text>
      <Text style={{ color: "#738077", marginTop: 5 }}>Welcome to TaazaFeed</Text>
      <View style={{ flexDirection: "row", marginTop: 22, gap: 28 }}>
        <View><Text style={{ fontSize: 20, fontWeight: "900", color: "#173B28" }}>0</Text><Text style={{ color: "#738077" }}>Posts</Text></View>
        <View><Text style={{ fontSize: 20, fontWeight: "900", color: "#173B28" }}>0</Text><Text style={{ color: "#738077" }}>Followers</Text></View>
        <View><Text style={{ fontSize: 20, fontWeight: "900", color: "#173B28" }}>0</Text><Text style={{ color: "#738077" }}>Following</Text></View>
      </View>
    </View>
    <Pressable onPress={signOut} style={{ marginTop: 18, padding: 15, backgroundColor: "white", borderRadius: 13, borderWidth: 1, borderColor: "#E5EEE7", alignItems: "center" }}><Text style={{ color: "#B42318", fontWeight: "800" }}>Sign out</Text></Pressable>
  </View>;
}
