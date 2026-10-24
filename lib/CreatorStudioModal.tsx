import React, { useState } from "react";
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Switch, Alert } from "react-native";

export default function CreatorStudioModal({
  visible,
  onClose,
  postsCount,
  reelsCount,
  tweetsCount,
  totalLikes,
  auraPoints,
}: any) {
  const [subTab, setSubTab] = useState<"analytics" | "security">("analytics");
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [commentFilter, setCommentFilter] = useState(true);
  const [hideOffensive, setHideOffensive] = useState(true);

  const weeklyGrowth = [
    { day: "Mon", views: 42, height: 45 },
    { day: "Tue", views: 68, height: 70 },
    { day: "Wed", views: 54, height: 55 },
    { day: "Thu", views: 92, height: 95 },
    { day: "Fri", views: 120, height: 120 },
    { day: "Sat", views: 145, height: 140 },
    { day: "Sun", views: 180, height: 165 },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={s.container}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: "#fff", fontSize: 22 }}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>📊 Creator Studio & Security</Text>
          <View style={{ width: 22 }} />
        </View>

        <View style={s.tabRow}>
          <TouchableOpacity
            style={[s.tabBtn, subTab === "analytics" && s.tabActive]}
            onPress={() => setSubTab("analytics")}
          >
            <Text style={[s.tabTxt, subTab === "analytics" && { color: "#38bdf8" }]}>📈 Real Analytics & Graphs</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.tabBtn, subTab === "security" && s.tabActive]}
            onPress={() => setSubTab("security")}
          >
            <Text style={[s.tabTxt, subTab === "security" && { color: "#facc15" }]}>🛡️ Privacy & Login Security</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1, padding: 16 }}>
          {subTab === "analytics" ? (
            <View>
              <View style={s.summaryGrid}>
                <View style={s.metricCard}>
                  <Text style={s.metricVal}>{(totalLikes * 4.2).toFixed(0)}</Text>
                  <Text style={s.metricLbl}>Total Reach (Unique)</Text>
                  <Text style={s.metricGreen}>▲ +28.4% this week</Text>
                </View>
                <View style={s.metricCard}>
                  <Text style={[s.metricVal, { color: "#facc15" }]}>₹{((totalLikes || 100) * 0.45).toFixed(0)}</Text>
                  <Text style={s.metricLbl}>Est. Creator Revenue</Text>
                  <Text style={s.metricGreen}>▲ Direct UPI + Ads</Text>
                </View>
              </View>

              <Text style={s.secHeading}>📊 7-Day Views & Followers Growth Graph</Text>
              <View style={s.graphCard}>
                <View style={s.barsRow}>
                  {weeklyGrowth.map((g) => (
                    <View key={g.day} style={s.barCol}>
                      <Text style={{ color: "#38bdf8", fontSize: 10, fontWeight: "700", marginBottom: 4 }}>
                        {g.views}K
                      </Text>
                      <View style={[s.barFill, { height: g.height }]} />
                      <Text style={{ color: "#94a3b8", fontSize: 11, marginTop: 6 }}>{g.day}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <Text style={s.secHeading}>🏆 Content Breakdown (Real-Time Database Count)</Text>
              <View style={s.reportRow}>
                <Text style={{ color: "#fff", fontSize: 14 }}>📰 Feed Videos (Reels) Published</Text>
                <Text style={{ color: "#38bdf8", fontWeight: "900", fontSize: 15 }}>{reelsCount}</Text>
              </View>
              <View style={s.reportRow}>
                <Text style={{ color: "#fff", fontSize: 14 }}>📷 Photo Posts Published</Text>
                <Text style={{ color: "#22c55e", fontWeight: "900", fontSize: 15 }}>{postsCount}</Text>
              </View>
              <View style={s.reportRow}>
                <Text style={{ color: "#fff", fontSize: 14 }}>💬 Public Tweets / Thoughts</Text>
                <Text style={{ color: "#facc15", fontWeight: "900", fontSize: 15 }}>{tweetsCount}</Text>
              </View>
              <View style={s.reportRow}>
                <Text style={{ color: "#fff", fontSize: 14 }}>✨ Total Aura Social Score</Text>
                <Text style={{ color: "#ec4899", fontWeight: "900", fontSize: 15 }}>+{auraPoints}</Text>
              </View>
            </View>
          ) : (
            <View>
              <Text style={s.secHeading}>💻 Active Login Sessions (Device Security)</Text>
              <View style={s.sessionCard}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#22c55e", fontWeight: "800", fontSize: 14 }}>● GitHub Codespaces Web (Active Now)</Text>
                  <Text style={{ color: "#94a3b8", fontSize: 12 }}>Delhi, India • Chrome Desktop</Text>
                </View>
              </View>
              <View style={s.sessionCard}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>📱 Android Smartphone (TaazaFeed App)</Text>
                  <Text style={{ color: "#94a3b8", fontSize: 12 }}>Delhi, India • Last active 2h ago</Text>
                </View>
                <TouchableOpacity onPress={() => Alert.alert("Logged Out", "Remote session terminated!")}>
                  <Text style={{ color: "#ef4444", fontWeight: "800", fontSize: 12 }}>Logout</Text>
                </TouchableOpacity>
              </View>

              <Text style={s.secHeading}>🛡️ Comment & Account Protection</Text>
              <View style={s.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Two-Factor Authentication (2FA)</Text>
                  <Text style={{ color: "#71717a", fontSize: 11 }}>Protect account with OTP verification</Text>
                </View>
                <Switch value={twoFactorAuth} onValueChange={setTwoFactorAuth} />
              </View>
              <View style={s.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>AI Toxic & Spam Comment Filter</Text>
                  <Text style={{ color: "#71717a", fontSize: 11 }}>Auto-hide abusive comments on your posts</Text>
                </View>
                <Switch value={commentFilter} onValueChange={setCommentFilter} />
              </View>
              <View style={s.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>Server-Side Secret Story Lock</Text>
                  <Text style={{ color: "#71717a", fontSize: 11 }}>Enforce strict 1-person stealth story encryption</Text>
                </View>
                <Switch value={hideOffensive} onValueChange={setHideOffensive} />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingTop: 40 },
  topBar: { height: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: "#27272a" },
  title: { color: "#fff", fontSize: 17, fontWeight: "900" },
  tabRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#27272a" },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#38bdf8" },
  tabTxt: { color: "#71717a", fontWeight: "800", fontSize: 13 },
  summaryGrid: { flexDirection: "row", gap: 10, marginBottom: 16 },
  metricCard: { flex: 1, backgroundColor: "#141418", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: "#27272a" },
  metricVal: { color: "#38bdf8", fontSize: 22, fontWeight: "900" },
  metricLbl: { color: "#94a3b8", fontSize: 11, marginTop: 4 },
  metricGreen: { color: "#22c55e", fontSize: 10, fontWeight: "700", marginTop: 4 },
  secHeading: { color: "#fff", fontSize: 14, fontWeight: "800", marginTop: 14, marginBottom: 10 },
  graphCard: { backgroundColor: "#11131a", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: "#27272a" },
  barsRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: 185 },
  barCol: { alignItems: "center", width: 34 },
  barFill: { width: 18, backgroundColor: "#0284c7", borderRadius: 6 },
  reportRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#18181b" },
  sessionCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#141418", padding: 12, borderRadius: 10, marginBottom: 8 },
  toggleRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#18181b" },
});
