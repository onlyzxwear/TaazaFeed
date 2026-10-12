import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const green = "#0F9D58";

export default function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!isSupabaseConfigured || !supabase) {
      Alert.alert("Connect Supabase", "Copy .env.example to .env and add your Supabase URL and anon key.");
      return;
    }
    if (!email.trim() || password.length < 6) {
      Alert.alert("Check details", "Enter an email and a password with at least 6 characters.");
      return;
    }
    setBusy(true);
    const result = mode === "signup"
      ? await supabase.auth.signUp({ email: email.trim(), password })
      : await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (result.error) Alert.alert("Couldn't continue", result.error.message);
    else if (mode === "signup" && !result.data.session) {
      Alert.alert("Check your email", "Confirm your email, then sign in.");
      setMode("login");
    } else router.replace("/(tabs)");
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1, backgroundColor: "#F6FBF7", justifyContent: "center", padding: 24 }}>
      <View style={{ width: "100%", maxWidth: 420, alignSelf: "center" }}>
        <View style={{ width: 72, height: 72, borderRadius: 24, backgroundColor: green, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Text style={{ color: "white", fontSize: 34, fontWeight: "900" }}>T</Text>
        </View>
        <Text style={{ color: "#10251A", fontSize: 34, fontWeight: "900", letterSpacing: -1 }}>TaazaFeed</Text>
        <Text style={{ color: "#66756B", fontSize: 15, marginTop: 8, marginBottom: 28 }}>Share your moments. Stay connected.</Text>
        <Text style={{ color: "#173B28", fontSize: 22, fontWeight: "800", marginBottom: 16 }}>{mode === "signup" ? "Create your account" : "Welcome back"}</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Email address" autoCapitalize="none" keyboardType="email-address" style={inputStyle} />
        <TextInput value={password} onChangeText={setPassword} placeholder="Password (6+ characters)" secureTextEntry style={inputStyle} />
        <Pressable onPress={submit} disabled={busy} style={{ backgroundColor: green, padding: 16, borderRadius: 14, alignItems: "center", marginTop: 6, opacity: busy ? 0.6 : 1 }}>
          <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>{busy ? "Please wait…" : mode === "signup" ? "Create account" : "Sign in"}</Text>
        </Pressable>
        <Pressable onPress={() => setMode(mode === "signup" ? "login" : "signup")} style={{ padding: 16, alignItems: "center" }}>
          <Text style={{ color: "#365743" }}>{mode === "signup" ? "Already a member? Sign in" : "New to TaazaFeed? Create an account"}</Text>
        </Pressable>
        {!isSupabaseConfigured && <Text style={{ color: "#A35B00", fontSize: 12, marginTop: 10, textAlign: "center" }}>Setup needed: connect your Supabase project to enable accounts.</Text>}
      </View>
    </KeyboardAvoidingView>
  );
}

const inputStyle = { backgroundColor: "white", borderColor: "#DCE9DF", borderWidth: 1, padding: 15, borderRadius: 13, marginBottom: 12, fontSize: 16, color: "#173B28" } as const;
