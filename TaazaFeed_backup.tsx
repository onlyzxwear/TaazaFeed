import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Modal,
  Alert,
  Share as NativeShare,
  Dimensions,
  Animated,
  Switch,
  Linking,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "./lib/supabase";
const { width } = Dimensions.get("window");

// --- 1. 12+ BEAUTY & AESTHETIC FILTERS (GORA, BLACK, GOLDEN, ETC.) ---
const ALL_FILTERS = [
  { id: "f_norm", name: "Normal", overlay: "transparent" },
  { id: "f_gora", name: "✨ Gora / Fair Glow", overlay: "rgba(255, 248, 242, 0.30)" },
  { id: "f_rosy", name: "🌸 Pink Rosy Glow", overlay: "rgba(255, 192, 203, 0.25)" },
  { id: "f_black", name: "🖤 Pure Black (B&W)", overlay: "rgba(0, 0, 0, 0.58)" },
  { id: "f_matte", name: "🌑 Dark Noir Matte", overlay: "rgba(15, 23, 42, 0.48)" },
  { id: "f_gold", name: "☀️ Golden Skin", overlay: "rgba(250, 204, 21, 0.22)" },
  { id: "f_warm", name: "🔥 Warm Sunset", overlay: "rgba(249, 115, 22, 0.22)" },
  { id: "f_neon", name: "💜 Neon Cyber", overlay: "rgba(168, 85, 247, 0.25)" },
  { id: "f_ice", name: "❄️ Cool Ice", overlay: "rgba(56, 189, 248, 0.22)" },
  { id: "f_vintage", name: "🎬 Vintage 90s", overlay: "rgba(234, 179, 8, 0.24)" },
  { id: "f_emerald", name: "🌿 Emerald Vibe", overlay: "rgba(16, 185, 129, 0.20)" },
];

// --- 2. ALL 24+ INDIAN REGIONAL LANGUAGES & DIALECTS ---
const REGIONAL_LANGUAGES: Record<
  string,
  { code: string; label: string; greeting: string; like: string; comment: string; repost: string; share: string; save: string; listen: string; follow: string; following: string }
> = {
  hi: { code: "hi-IN", label: "हिंदी (Hindi)", greeting: "🌞 शुभ प्रभात! आज का दिन मंगलमय हो।", like: "पसंद", comment: "जवाब", repost: "रीपोस्ट", share: "भेजें", save: "सेव", listen: "🔊 सुनें", follow: "+ फॉलो करें", following: "✓ फॉलो किया" },
  bho: { code: "hi-IN", label: "भोजपुरी (Bhojpuri)", greeting: "🌞 प्रणाम! रउआ सब के दिन मंगलमय होखे।", like: "नीक लागल", comment: "बोलल जाव", repost: "आगे बढ़ाईं", share: "भेजीं", save: "रखीं", listen: "🔊 सुनीं", follow: "+ जुड़ीं", following: "✓ जुड़ल बानी" },
  mai: { code: "hi-IN", label: "मैथिली (Maithili)", greeting: "🌞 प्रणाम! अहाँक दिन मंगलमय होए।", like: "नीक लागल", comment: "विचार", repost: "आगाँ बढ़ाऊ", share: "पठाऊ", save: "राखू", listen: "🔊 सुनू", follow: "+ जुड़ू", following: "✓ जुड़ल छी" },
  awa: { code: "hi-IN", label: "अवधी (Awadhi)", greeting: "🌞 राम-राम! तोहार दिन शुभ होय।", like: "नीक लागा", comment: "कहौ", repost: "आगे करौ", share: "भेजौ", save: "धरौ", listen: "🔊 सुनौ", follow: "+ जुड़ौ", following: "✓ जुड़े हन" },
  bgc: { code: "hi-IN", label: "हरियाणवी (Haryanvi)", greeting: "🌞 राम-राम जी! थारा दिन घणा बढ़िया जावे।", like: "कसूता", comment: "जवाब", repost: "आगे भेजो", share: "शेयर", save: "संभालो", listen: "🔊 सुणो", follow: "+ जोड़ो", following: "✓ गेल हो" },
  raj: { code: "hi-IN", label: "राजस्थानी (Marwari)", greeting: "🌞 खम्मा घणी सा! आपरो दिन शुभ रहे।", like: "चोखो लाग्यो", comment: "जवाब", repost: "आगे भेजो", share: "बांटो", save: "सांचो", listen: "🔊 सुणो सा", follow: "+ जुड़ो सा", following: "✓ जुड़या हो" },
  pa: { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)", greeting: "🌞 ਸਤਿ ਸ਼੍ਰੀ ਅਕਾਲ! ਤੁਹਾਡਾ ਦਿਨ ਸ਼ੁਭ ਰਹੇ।", like: "ਪਸੰਦ", comment: "ਜਵਾਬ", repost: "ਰੀਪੋਸਟ", share: "ਭੇਜੋ", save: "ਸੇਵ", listen: "🔊 ਸੁਣੋ", follow: "+ ਫਾਲੋ", following: "✓ ਫਾਲੋ ਕੀਤਾ" },
  mr: { code: "mr-IN", label: "मराठी (Marathi)", greeting: "🌞 शुभ प्रभात! तुमचा दिवस आनंदात जावो।", like: "आवडले", comment: "प्रतिक्रिया", repost: "पुन्हा पोस्ट", share: "पाठवा", save: "जतन करा", listen: "🔊 ऐका", follow: "+ फॉलो करा", following: "✓ फॉलो केले" },
  gu: { code: "gu-IN", label: "ગુજરાતી (Gujarati)", greeting: "🌞 જય શ્રી કૃષ્ણ! તમારો દિવસ શુભ રહે।", like: "ગમ્યું", comment: "જવાબ", repost: "રીપોસ્ટ", share: "મોકલો", save: "સાચવો", listen: "🔊 સાંભળો", follow: "+ ફોલો કરો", following: "✓ ફોલો કર્યું" },
  bn: { code: "bn-IN", label: "বাংলা (Bengali)", greeting: "🌞 শুভ সকাল! আপনার দিনটি শুভ হোক।", like: "পছন্দ", comment: "মন্তব্য", repost: "রিপোস্ট", share: "শেয়ার", save: "সেভ", listen: "🔊 শুনুন", follow: "+ ফলো", following: "✓ ফলোয়িং" },
  as: { code: "bn-IN", label: "অসমীয়া (Assamese)", greeting: "🌞 সুপ্ৰভাত! আপোনাৰ দিনটো শুভ হওক।", like: "ভাল লাগিল", comment: "মন্তব্য", repost: "পুনৰ প'ষ্ট", share: "ভাগ কৰক", save: "সাচক", listen: "🔊 শুনক", follow: "+ ফ'ল' কৰক", following: "✓ ফ'ল' কৰিছে" },
  or: { code: "hi-IN", label: "ଓଡ଼ିଆ (Odia)", greeting: "🌞 ସୁପ୍ରଭାତ! ଆପଣଙ୍କ ଦିନ ମଙ୍ଗଳମୟ ହେଉ।", like: "পସନ୍ଦ", comment: "ମତାମତ", repost: "ରିପୋଷ୍ଟ", share: "ସେୟାର", save: "ସେଭ୍", listen: "🔊 ଶୁଣନ୍ତୁ", follow: "+ ଫଲୋ", following: "✓ ଫଲୋଇଙ୍ଗ" },
  ta: { code: "ta-IN", label: "தமிழ் (Tamil)", greeting: "🌞 காலை வணக்கம்! இனிய நாளாக அமையட்டும்.", like: "பிடித்தது", comment: "கருத்து", repost: "மறுபதிவு", share: "பகிர்", save: "சேமி", listen: "🔊 கேள்", follow: "+ பின்தொடர்", following: "✓ இணைந்தது" },
  te: { code: "te-IN", label: "తెలుగు (Telugu)", greeting: "🌞 శుభోదయం! మీ రోజు శుభప్రదంగా ఉండాలి.", like: "ఇష్టం", comment: "కామెంట్", repost: "రీపోస్ట్", share: "షేర్", save: "సేవ్", listen: "🔊 వినండి", follow: "+ ఫాలో", following: "✓ ఫాలోయింగ్" },
  kn: { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)", greeting: "🌞 ಶುಭೋದಯ! ನಿಮ್ಮ ದಿನ ಶುಭವಾಗಿರಲಿ.", like: "ಇಷ್ಟ", comment: "ಪ್ರತಿಕ್ರಿಯೆ", repost: "ಮರುಪೋಸ್ಟ್", share: "ಹಂಚಿಕೊಳ್ಳಿ", save: "ಉಳಿಸಿ", listen: "🔊 ಕೇಳಿ", follow: "+ ಅನುಸರಿಸಿ", following: "✓ ಅನುಸರಿಸುತ್ತಿದ್ದೀರಿ" },
  ml: { code: "ml-IN", label: "മലയാളം (Malayalam)", greeting: "🌞 സുപ്രഭാതം! നല്ലൊരു ദിവസം ആശംസിക്കുന്നു.", like: "ഇഷ്ടപ്പെട്ടു", comment: "അഭിപ്രായം", repost: "റീപോസ്റ്റ്", share: "പങ്കിടുക", save: "സേവ്", listen: "🔊 കേൾക്കുക", follow: "+ ഫോളോ", following: "✓ ഫോളോയിംഗ്" },
  ur: { code: "ur-IN", label: "اردو (Urdu)", greeting: "🌞 صبح بخیر! آپ کا دن خوشگوار گزرے۔", like: "پسند", comment: "تبصرہ", repost: "ری پوسٹ", share: "شیئر", save: "محفوظ", listen: "🔊 سنیں", follow: "+ فالو کریں", following: "✓ فالو کیا" },
  sa: { code: "hi-IN", label: "संस्कृतम् (Sanskrit)", greeting: "🌞 सुप्रभातम्! भवतः दिनं शुभं भवतु।", like: "रोचते", comment: "टिप्पणी", repost: "पुनः प्रेषणम्", share: "वितरणम्", save: "रक्षणम्", listen: "🔊 शृण्वन्तु", follow: "+ अनुसरतु", following: "✓ अनुसृतम्" },
  ks: { code: "hi-IN", label: "कॉशुर / کشمیری (Kashmiri)", greeting: "🌞 आदाब / नमस्कार! तुहन्द दोह आसि शुभ।", like: "पसंद", comment: "राय", repost: "रीपोस्ट", share: "शेयर", save: "सेव", listen: "🔊 बोज़िव", follow: "+ फॉलो", following: "✓ फॉलो" },
  kok: { code: "mr-IN", label: "कोंकणी (Konkani)", greeting: "🌞 सुप्रभात! तुमचो दीस बरो वचूं।", like: "आवडलें", comment: "मत", repost: "रीपोस्ट", share: "वांटचें", save: "सांबाळचें", listen: "🔊 आयकात", follow: "+ फॉलो", following: "✓ फॉलो केला" },
  sd: { code: "hi-IN", label: "सिन्धी (Sindhi)", greeting: "🌞 झूलेलाल! तव्हांजो डींहु शुभ हुजे।", like: "वण्यो", comment: "राय", repost: "रीपोस्ट", share: "शेयर", save: "सेव", listen: "🔊 बुधी", follow: "+ फॉलो", following: "✓ फॉलो" },
  ne: { code: "hi-IN", label: "नेपाली (Nepali)", greeting: "🌞 शुभ प्रभात! तपाईंको दिन शुभ रहोस्।", like: "मन पर्यो", comment: "प्रतिक्रिया", repost: "रिपोस्ट", share: "सेयर", save: "सेभ", listen: "🔊 सुन्नुहोस्", follow: "+ फलो", following: "✓ फलोइङ" },
  en: { code: "en-IN", label: "English (Global)", greeting: "🌞 Good Morning! Have a blessed day ahead.", like: "Like", comment: "Comment", repost: "Repost", share: "Share", save: "Save", listen: "🔊 Listen", follow: "Follow", following: "Following" },
};

// --- 3. ALL-DEMOGRAPHIC HUBS ---
const YOUTH_VIBES = [
  "🔥 All",
  "🏏 Men's Arena (Cricket & Bikes)",
  "💄 Women's Glam & Try-On",
  "🌧️ Late Night Sufi",
  "💪 Gym & Hustle",
  "😂 Memes & Anime",
];
const SENIOR_VIBES = [
  "🙏 सभी पोस्ट",
  "🕉️ भक्ति दर्शन",
  "📻 सदाबहार गीत",
  "☕ चौपाल चर्चा",
  "👩 गृहिणी व रसोई",
  "💊 सेहत व योग",
];

// --- 4. PROFESSIONS LIST ---
const PROFESSIONS = [
  "Digital creator",
  "Actor",
  "Cricketer",
  "Politician",
  "Artist",
  "Software Engineer",
  "Entrepreneur",
  "Musician",
];

// --- 5. PRODUCTS CATALOG ---
const SHOP_PRODUCTS = [
  { id: "prod_1", title: "Special Kaju Katli (1kg)", price: "₹950", img: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=200" },
  { id: "prod_2", title: "Handcrafted Silver Jhumka", price: "₹499", img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=200" },
  { id: "prod_3", title: "Classic Moto Leather Jacket", price: "₹2,899", img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=200" },
  { id: "prod_4", title: "Teekha Jii Masala Makhana (Pack of 3)", price: "₹349", img: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=200" },
];

// --- 6. PLAYABLE MUSIC LIBRARY ---
const MUSIC_LIBRARY = [
  { id: "m1", title: "Midnight Echoes (Lofi)", artist: "Lofi Cafe", duration: "0:30", reelsCount: "142.8K reels", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: "m2", title: "Banjaare Acoustic Flow", artist: "Bairan Vibes", duration: "0:30", reelsCount: "210.4K reels", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: "m3", title: "Lag Jaa Gale (Retro Classic)", artist: "Evergreen Radio", duration: "0:45", reelsCount: "520K reels", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  { id: "m4", title: "Sufi Soul Qawwali", artist: "Nusrat Tribute", duration: "0:40", reelsCount: "390K reels", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
];

// --- 7. FLOATING NOTES ---
const INITIAL_NOTES = [
  { id: "note_me", user: "Your note", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", text: "Shipping TaazaFeed...", music: null, isUser: true },
  { id: "note_1", user: "Deepak Kumar", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", text: "Dil Sambhal Ja...", music: "Arijit Singh ❤️" },
  { id: "note_2", user: "Yash", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", text: "High Vibe", music: "Gursewak..." },
  { id: "note_3", user: "Prashant Rana", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", text: "Zindagi", music: "cefur stu..." },
];

// --- 8. INBOX THREADS ---
const INBOX_THREADS = [
  { id: "th1", name: "Anand Agarwal", tag: "i_anandagarwal", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", verified: true, pinned: true, category: "primary", status: "Seen 1h ago", unread: false },
  { id: "th2", name: "thereal._adiii", tag: "thereal_adi", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", verified: false, pinned: false, category: "primary", status: "Liked a message • now", unread: true },
  { id: "th3", name: "Vishal", tag: "vishal_baniya20", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", verified: false, pinned: false, category: "primary", status: "2 new messages • 34m", unread: true },
  { id: "th4", name: "Gyan Prakash", tag: "fitwithgyan", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", verified: false, pinned: false, category: "primary", status: "Sent a reel by fitwithgyan... 1h", unread: true },
  { id: "th5", name: "Umesh Yadav", tag: "umesh_ydv", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", verified: false, pinned: false, category: "requests", status: "Wants to send you a message • 2h", unread: true },
];

// --- 9. STORY VIEWERS ---
const STORY_VIEWERS_DATA = [
  { id: "v1", name: "Princ Gupta", user: "princgupta4", time: "22m ago", liked: true, avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150" },
  { id: "v2", name: "Rajnish Kumar", user: "ra.jnishkumar_0002", time: "34m ago", liked: true, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150" },
  { id: "v3", name: "Rahul Kumar Gupta", user: "official_rahul_gupta1245", time: "39m ago", liked: true, avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
  { id: "v4", name: "Sumit Yuva", user: "sumit_kumar01012003", time: "1h ago", liked: true, avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" },
];

// --- 10. NOTIFICATIONS ---
const NOTIFICATIONS_DATA = [
  { id: "notif_1", type: "repost", userGroup: "_nikhil_ydv, anandyadav_7250", text: "reposted your reel.", time: "2m", thumb: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=150", category: "all" },
  { id: "notif_2", type: "like", userGroup: "_nikhil_ydv, mr_happy and 29,894 others", text: "liked your reel.", time: "3m", thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=150", category: "all" },
  { id: "notif_3", type: "comment", userGroup: "vickythakurxedits", text: "commented: 'Bhai cinematography ek number hai!'", time: "14m", thumb: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=150", category: "comments" },
  { id: "notif_4", type: "follow", userGroup: "zara_lens", text: "started following you.", time: "25m", thumb: "", category: "follows" },
];

// --- 11. HIGHLIGHTS & PINNED ---
const HIGHLIGHTS = [
  { id: "h0", title: "New", isNew: true },
  { id: "h1", title: "❤️", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
  { id: "h2", title: "🎬", img: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=150" },
  { id: "h3", title: "🏍️ Bullet", img: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=150" },
];

const PROFILE_PINNED_POSTS = [
  { id: "pin1", views: "2,928", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
  { id: "pin2", views: "5,225", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400" },
  { id: "pin3", views: "3,083", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400" },
];

// --- 12. TRENDING TOPICS ---
const TRENDING_TOPICS = [
  { id: "tr1", category: "Cricket & Men", title: "IND vs AUS Live: Kohli & Gill Power 220+ Partnership!", time: "LIVE", count: "145K posts", verifiedFact: "Live Score: IND 248/2 (38.4 Overs) • Verified Sports Desk.", avatars: ["https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100"] },
  { id: "tr2", category: "Women & Glam", title: "Festive Jhumka & Kurta Styling Trends Taking Over Delhi", time: "4 hours ago", count: "64K posts", verifiedFact: "AI Virtual Try-On enabled on 500+ festive collections.", avatars: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100", "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100"] },
  { id: "tr3", category: "Bhakti & Seniors", title: "Devotees Honor Maa Kushmanda on Navratri's Fourth Day", time: "7 hours ago", count: "28K posts", verifiedFact: "Live Aarti streams active across temples in Delhi & Varanasi.", avatars: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100", "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100"] },
];

const INITIAL_COLLECTIONS = [
  { id: "col_all", name: "All Posts", count: 12, cover: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200" },
  { id: "col_family", name: "🏡 पारिवारिक धरोहर (Family)", count: 8, cover: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200" },
  { id: "col_1", name: "Cinematic Vibes", count: 5, cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200" },
  { id: "col_2", name: "Bullet & Travel", count: 4, cover: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=200" },
];

const INITIAL_TWEETS = [
  {
    id: "tw_1",
    author: "itsanandgupta",
    handle: "itsanandgupta",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    verified: true,
    time: "12m",
    text: "TaazaFeed now supports all 24+ Indian Regional Languages, Live Streaming Studio, Secret 1-Person Stealth Story, and Real-Time Creator Analytics Dashboard! 🚀 #buildinpublic",
    simpleHindi: "आनंद कह रहे हैं: TaazaFeed में अब भारत की सभी 24+ भाषाएं, लाइव स्ट्रीमिंग और रियल डैशबोर्ड जुड़ गया है!",
    factNote: "Verified Creator Update • 100% Authentic",
    likes: 342,
    reposts: 89,
    comments: 24,
  },
  {
    id: "tw_2",
    author: "Vimal Kumar Gupta",
    handle: "vimal_gupta_senior",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    verified: true,
    time: "30m",
    text: "सुप्रभात बच्चों! आज सुबह की चाय और पुराने गीतों के साथ दिन की शानदार शुरुआत। आप सभी खुश रहें, स्वस्थ रहें 🙏🌺 #Suprabhat #Blessings",
    simpleHindi: "पिताजी की ओर से सुबह का आशीर्वाद और शुभकामनाएँ। आप सभी खुश रहें, स्वस्थ रहें।",
    factNote: null,
    likes: 512,
    reposts: 64,
    comments: 42,
  },
];

const INITIAL_FOLLOWERS = [
  { id: "u1", name: "Aarav Sharma", handle: "aarav_official", avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", following: true, type: "follower" },
  { id: "u2", name: "Priya Art", handle: "priya_art", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", following: false, type: "follower" },
  { id: "u3", name: "Rohit Vlogs", handle: "rohit_vlogs", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150", following: false, type: "follower" },
  { id: "u4", name: "Zara Lens", handle: "zara_lens", avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150", following: true, type: "following" },
  { id: "u5", name: "Vishal Gupta", handle: "vishal_baniya20", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150", following: true, type: "following" },
];

const INITIAL_STORIES = [
  { id: "s1", name: "Your Story", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150", isUser: true, music: null, hoursLeft: 24, isSpotlightPushed: false, secretTarget: null, filterOverlay: "transparent" },
  { id: "s2", name: "aarav_official", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150", music: "Midnight Echoes", hoursLeft: 18, filterOverlay: "transparent" },
  { id: "s3", name: "priya_art", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150", music: "Golden Sunset", hoursLeft: 12, filterOverlay: "transparent" },
];

const INITIAL_POSTS = [
  {
    id: "p1",
    author: "itsanandgupta",
    location: "Delhi, India",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800",
    likes: 14420,
    reposts: 420,
    caption: "हे माँ ...... \n#maadurga #jagdamba #navratri #explorepage #foryou",
    simpleHindiMeaning: "माँ दुर्गा की भव्य आरती और नवरात्रि की शुभकामनाएँ। जय माता दी!",
    audioTitle: "Original Audio • itsanandgupta",
    taggedProduct: "Special Kaju Katli (1kg)",
    filterOverlay: "transparent",
    isTrial: false,
    postType: "feedVideo",
    comments: [
      { id: "c1", user: "aarav_official", text: "Pure aesthetic vibes 🔥", isAudio: false },
      { id: "c2", user: "manju_devi", text: "🎙️ [आशीर्वाद ऑडियो: 0:06s] सदा खुश रहो बेटा! ✋❤️", isAudio: true },
    ],
  },
  {
    id: "p2",
    author: "priya_art",
    location: "New Delhi, India",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800",
    likes: 3410,
    reposts: 88,
    caption: "Bro cooked hard! Creative flow mode on, pure aura +1000 🎨✨ #noCap",
    simpleHindiMeaning: "प्रिया ने बहुत सुंदर नई पेंटिंग बनाई है और सभी की राय पूछ रही हैं।",
    audioTitle: "Midnight Echoes (Lofi)",
    taggedProduct: "Handcrafted Silver Jhumka",
    filterOverlay: "transparent",
    isTrial: false,
    postType: "photo",
    comments: [{ id: "c3", user: "rohit_vlogs", text: "Incredible shading!", isAudio: false }],
  },
];

export default function App() {
  const [tab, setTab] = useState<"feed" | "explore" | "videoFeed" | "profile">("feed");

  // ================= SMART PERSONA & 24+ REGIONAL LANGUAGES ENGINE =================
  const [isSeniorMode, setIsSeniorMode] = useState(false);
  const [regionalLang, setRegionalLang] = useState<string>("hi");
  const [showLangModal, setShowLangModal] = useState(false);
  const [langSearchQuery, setLangSearchQuery] = useState("");
  const [selectedVibe, setSelectedVibe] = useState("🔥 All");
  const [auraPoints, setAuraPoints] = useState(54200);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingTrackTitle, setPlayingTrackTitle] = useState<string | null>(null);
  const audioPlayerRef = useRef<any>(null);

  const L = REGIONAL_LANGUAGES[regionalLang] || REGIONAL_LANGUAGES.hi;

  // Core Data
  const [posts, setPosts] = useState<any[]>(INITIAL_POSTS);
  const [stories, setStories] = useState<any[]>(INITIAL_STORIES);
  const [tweets, setTweets] = useState<any[]>(INITIAL_TWEETS);
  const [collections, setCollections] = useState<any[]>(INITIAL_COLLECTIONS);
  const [followersList, setFollowersList] = useState<any[]>(INITIAL_FOLLOWERS);
  const [followedAuthors, setFollowedAuthors] = useState<Record<string, boolean>>({
    aarav_official: true,
    priya_art: false,
    cinematic_vibes: false,
    itsanandgupta: true,
  });

  // ================= LIKE & WATCH HISTORY ENGINE =================
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyTab, setHistoryTab] = useState<"liked" | "watched">("liked");
  const [watchHistory, setWatchHistory] = useState<{ id: string; title: string; author: string; thumb: string; time: string; type: string }[]>([
    { id: "wh_1", title: "हे माँ ...... #maadurga #navratri", author: "itsanandgupta", thumb: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200", time: "2 mins ago", type: "Feed Video" },
    { id: "wh_2", title: "Tokyo rain reflections 🌧️✨", author: "cinematic_vibes", thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=200", time: "15 mins ago", type: "Feed Video" },
  ]);

  // ================= GO LIVE STREAMING STUDIO ENGINE =================
  const [showLiveStreamModal, setShowLiveStreamModal] = useState(false);
  const [liveViewersCount, setLiveViewersCount] = useState(148);
  const [liveChatInput, setLiveChatInput] = useState("");
  const [liveGuestConnected, setLiveGuestConnected] = useState<string | null>(null);
  const [liveComments, setLiveComments] = useState<{ id: string; user: string; text: string; isTip?: boolean }[]>([
    { id: "lc1", user: "vishal_baniya20", text: "Bhai live quality ek number aa rahi hai! 🔥" },
    { id: "lc2", user: "rohit_vlogs", text: " bullet ride kab chalna hai?" },
    { id: "lc3", user: "aarav_official", text: "⚡ Sent ₹100 SuperChat!", isTip: true },
  ]);

  // ================= SECRET 1-PERSON STEALTH STORY TARGET =================
  const [secretSpecialPerson, setSecretSpecialPerson] = useState("");

  // ================= LIVE CAMERA STUDIO & AI MAGIC STUDIO =================
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [cameraTarget, setCameraTarget] = useState<"story" | "post">("story");
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [flashOn, setFlashOn] = useState(false);
  const [activeCameraFilter, setActiveCameraFilter] = useState(ALL_FILTERS[0]);
  const [showAIMagicModal, setShowAIMagicModal] = useState(false);
  const [aiPromptInput, setAiPromptInput] = useState("");

  // Profile Privacy & Profession
  const [isAccountPrivate, setIsAccountPrivate] = useState(false);
  const [userProfession, setUserProfession] = useState("Digital creator");
  const [showProfessionPicker, setShowProfessionPicker] = useState(false);

  // Interactions
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({ p1: true });
  const [repostedItems, setRepostedItems] = useState<Record<string, boolean>>({});
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({ p1: true });

  // Direct UPI Tipping Modal
  const [tipTargetAuthor, setTipTargetAuthor] = useState<string | null>(null);
  const [selectedTipAmount, setSelectedTipAmount] = useState("50");

  // Floating Heart Animation
  const [animHeartId, setAnimHeartId] = useState<string | null>(null);
  const heartScale = useRef(new Animated.Value(0)).current;
  const heartOpacity = useRef(new Animated.Value(0)).current;
  const lastTapRef = useRef<{ [key: string]: number }>({});

  // Story Creator & Multi-Filter States
  const [showStoryEditor, setShowStoryEditor] = useState(false);
  const [storyImage, setStoryImage] = useState<string | null>(null);
  const [activeStoryFilter, setActiveStoryFilter] = useState(ALL_FILTERS[0]);
  const [isSpotlightPushed, setIsSpotlightPushed] = useState(false);
  const [selectedStoryMusic, setSelectedStoryMusic] = useState<string | null>(null);
  const [showMusicPicker, setShowMusicPicker] = useState(false);
  const [storyAudienceSheet, setStoryAudienceSheet] = useState(false);
  const [storyAudience, setStoryAudience] = useState("Your story");
  const [showStoryViewers, setShowStoryViewers] = useState(false);
  const [storyViewerSearch, setStoryViewerSearch] = useState("");

  // Publish Sheet State (Post / Feed Video / Thought)
  const [showAdvancedPublish, setShowAdvancedPublish] = useState(false);
  const [createType, setCreateType] = useState<"media" | "tweet">("media");
  const [mediaSubType, setMediaSubType] = useState<"photo" | "feedVideo">("feedVideo");
  const [publishCaption, setPublishCaption] = useState("हे माँ ......\n\n#maadurga #jagdamba #navratri #explorepage #foryou");
  const [newTweetText, setNewTweetText] = useState("");
  const [publishImage, setPublishImage] = useState<string>("https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800");
  const [activePostFilter, setActivePostFilter] = useState(ALL_FILTERS[0]);
  const [publishLocation, setPublishLocation] = useState<string>("Delhi, India");
  const [alsoShareToFeed, setAlsoShareToFeed] = useState(true);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [shareAsTemplate, setShareAsTemplate] = useState(false);
  const [addAILabel, setAddAILabel] = useState(false);
  const [allowGifts, setAllowGifts] = useState(false);
  const [translateReel, setTranslateReel] = useState(true);
  const [requestOriginalCredit, setRequestOriginalCredit] = useState(false);
  const [hideLikeCount, setHideLikeCount] = useState(false);
  const [hideShareCount, setHideShareCount] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [aiViralScore, setAiViralScore] = useState(94);

  // Sub-Modals for Publish Sheet
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAudienceModal, setShowAudienceModal] = useState(false);
  const [reelAudience, setReelAudience] = useState<"Everyone" | "Close Friends" | "Subscribers" | "Trial">("Trial");
  const [showMoreOptionsModal, setShowMoreOptionsModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [attachedUrl, setAttachedUrl] = useState("");
  const [audioName, setAudioName] = useState("Original Audio • itsanandgupta");

  // Comments
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [showVideoComments, setShowVideoComments] = useState(false);
  const [videoComments, setVideoComments] = useState<any[]>([
    { id: "vc1", user: "aarav_official", text: "Soundtrack ka naam kya hai?" },
    { id: "vc2", user: "zara_lens", text: "Lighting aur grading kamaal ki hai!" },
  ]);
  const [videoCommentInput, setVideoCommentInput] = useState("");

  // Share & Save Collections
  const [shareTargetPost, setShareTargetPost] = useState<any | null>(null);
  const [shareFriendSearch, setShareFriendSearch] = useState("");
  const [showSaveCollectionSheet, setShowSaveCollectionSheet] = useState(false);
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [activeAudioSheet, setActiveAudioSheet] = useState<any | null>(null);

  // Explore Dual Mode & Categories
  const [exploreViewType, setExploreViewType] = useState<"news" | "grid">("news");
  const [exploreCategory, setExploreCategory] = useState("Explore");
  const [exploreSearch, setExploreSearch] = useState("");

  // Profile Tab Bar & Connections Search
  const [profileTab, setProfileTab] = useState<"posts" | "feedReels" | "reposts" | "collections">("posts");
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [followModalTab, setFollowModalTab] = useState<"followers" | "following">("followers");
  const [followSearch, setFollowSearch] = useState("");

  // Direct Inbox & Floating Notes
  const [showInboxModal, setShowInboxModal] = useState(false);
  const [inboxCategory, setInboxCategory] = useState("primary");
  const [showNewMsgModal, setShowNewMsgModal] = useState(false);
  const [newMsgSearch, setNewMsgSearch] = useState("");
  const [activeChat, setActiveChat] = useState<any | null>(null);
  const [chatMessages, setChatMessages] = useState<Record<string, { id: string; sender: string; text: string }[]>>({
    th1: [{ id: "m1", sender: "Anand Agarwal", text: "Bhai updates checked! Sab working hai." }],
    th3: [{ id: "m2", sender: "Vishal", text: "Bhai updates live ho gaye kya?" }],
  });
  const [liveMsgInput, setLiveMsgInput] = useState("");

  // Notifications & Help Desk
  const [showNotifModal, setShowNotifModal] = useState(false);
  const [notifFilter, setNotifFilter] = useState("all");
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [helpTicketType, setHelpTicketType] = useState("Bug Report");
  const [helpDescription, setHelpDescription] = useState("");

  // ================= REAL-TIME PROFILE DASHBOARD CALCULATIONS =================
  const myPostsCount = posts.filter((p) => p.author === "itsanandgupta" && p.postType !== "feedVideo").length;
  const myFeedVideosCount = posts.filter((p) => p.author === "itsanandgupta" && p.postType === "feedVideo").length;
  const myTweetsCount = tweets.filter((t) => t.handle === "itsanandgupta").length;
  const myRepostsCount = Object.values(repostedItems).filter(Boolean).length;
  const myLikedCount = Object.values(likedItems).filter(Boolean).length;
  const myTotalLikesReceived =
    posts.filter((p) => p.author === "itsanandgupta").reduce((acc, cur) => acc + (cur.likes || 0), 0) +
    tweets.filter((t) => t.handle === "itsanandgupta").reduce((acc, cur) => acc + (cur.likes || 0), 0);

  // ================= 1. PERMANENT STORAGE + SUPABASE SYNC =================
  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const savedPostsLocal = window.localStorage.getItem("taazafeed_posts_v2");
        const savedTweetsLocal = window.localStorage.getItem("taazafeed_tweets_v2");
        const savedFollowsLocal = window.localStorage.getItem("taazafeed_follows_v2");
        const savedAuraLocal = window.localStorage.getItem("taazafeed_aura_v2");
        const savedHistoryLocal = window.localStorage.getItem("taazafeed_history_v2");
        if (savedPostsLocal) setPosts(JSON.parse(savedPostsLocal));
        if (savedTweetsLocal) setTweets(JSON.parse(savedTweetsLocal));
        if (savedFollowsLocal) setFollowedAuthors(JSON.parse(savedFollowsLocal));
        if (savedAuraLocal) setAuraPoints(Number(savedAuraLocal));
        if (savedHistoryLocal) setWatchHistory(JSON.parse(savedHistoryLocal));
      } catch {}
    }

    const fetchCloudData = async () => {
      if (!supabase) return;
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*, comments(*)")
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          const formatted = data.map((d: any) => ({
            id: d.id,
            author: d.author,
            location: d.location,
            avatar: d.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
            image: d.media_url,
            likes: d.likes_count || 0,
            reposts: 0,
            caption: d.caption,
            simpleHindiMeaning: d.caption,
            audioTitle: "Original Audio • itsanandgupta",
            taggedProduct: null,
            filterOverlay: "transparent",
            isTrial: false,
            postType: "feedVideo",
            comments: (d.comments || []).map((c: any) => ({
              id: c.id,
              user: c.user_name,
              text: c.comment_text,
            })),
          }));
          setPosts(formatted);
        }
      } catch {
        // fallback
      } finally {
      }
    };
    fetchCloudData();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        window.localStorage.setItem("taazafeed_posts_v2", JSON.stringify(posts));
        window.localStorage.setItem("taazafeed_tweets_v2", JSON.stringify(tweets));
        window.localStorage.setItem("taazafeed_follows_v2", JSON.stringify(followedAuthors));
        window.localStorage.setItem("taazafeed_aura_v2", String(auraPoints));
        window.localStorage.setItem("taazafeed_history_v2", JSON.stringify(watchHistory));
      } catch {}
    }
  }, [posts, tweets, followedAuthors, auraPoints, watchHistory]);

  // Record Watch History Helper
  const recordWatchEvent = (title: string, author: string, thumb: string, type: string) => {
    const entry = {
      id: "wh_" + Date.now(),
      title: title.slice(0, 45),
      author,
      thumb,
      time: "Just now",
      type,
    };
    setWatchHistory((prev) => [entry, ...prev.slice(0, 25)]);
  };

  // ================= 2. REAL VOICE TEXT-TO-SPEECH =================
  const speakAloudReal = (textToSpeak: string) => {
    if (Platform.OS === "web" && typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = L.code || "hi-IN";
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      Alert.alert(`${L.listen} (${L.label})`, textToSpeak);
    }
  };

  // ================= 3. REAL MUSIC AUDIO STREAM PLAYER =================
  const togglePlayRealAudio = (trackTitle: string, mp3Url?: string) => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        if (playingTrackTitle === trackTitle && audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          setPlayingTrackTitle(null);
          return;
        }
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
        }
        const streamUrl = mp3Url || "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
        const audio = new window.Audio(streamUrl);
        audioPlayerRef.current = audio;
        audio.play();
        setPlayingTrackTitle(trackTitle);
        audio.onended = () => setPlayingTrackTitle(null);
      } catch {
        Alert.alert("Playing Audio 🎵", trackTitle);
      }
    } else {
      Alert.alert("Playing Audio 🎵", trackTitle);
    }
  };

  // ================= 4. REAL UPI DEEP-LINK PAYMENT TRIGGER =================
  const triggerRealUPITransfer = async () => {
    const upiUrl = `upi://pay?pa=taazafeed@kotak&pn=${encodeURIComponent(tipTargetAuthor || "Creator")}&am=${selectedTipAmount}&cu=INR`;
    try {
      const supported = await Linking.canOpenURL(upiUrl);
      if (supported) {
        await Linking.openURL(upiUrl);
      } else {
        Alert.alert(
          "⚡ UPI Payment Triggered!",
          `₹${selectedTipAmount} UPI Transfer initiated to @${tipTargetAuthor} (+50 Aura Points added!)`
        );
      }
    } catch {
      Alert.alert("⚡ Super-Tip Sent!", `₹${selectedTipAmount} sent to @${tipTargetAuthor}`);
    }
    setAuraPoints((a) => a + 50);
    setTipTargetAuthor(null);
  };

  // Follow Author directly from Post or Feed Reel
  const toggleFollowAuthor = (authorHandle: string) => {
    const nextState = !followedAuthors[authorHandle];
    setFollowedAuthors((prev) => ({ ...prev, [authorHandle]: nextState }));
    if (nextState) setAuraPoints((a) => a + 15);
  };

  // Double Tap Floating Heart Trigger
  const triggerDoubleTapHeart = (id: string, isTweet = false) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (lastTapRef.current[id] && now - lastTapRef.current[id] < DOUBLE_PRESS_DELAY) {
      if (!likedItems[id]) {
        toggleLike(id, isTweet);
      }
      setAnimHeartId(id);
      heartScale.setValue(0);
      heartOpacity.setValue(1);
      Animated.sequence([
        Animated.spring(heartScale, { toValue: 1.2, friction: 3, useNativeDriver: true }),
        Animated.timing(heartOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => setAnimHeartId(null));
    } else {
      lastTapRef.current[id] = now;
    }
  };

  const toggleLike = async (id: string, isTweet = false) => {
    const isLiked = !likedItems[id];
    setLikedItems((prev) => ({ ...prev, [id]: isLiked }));
    if (isLiked) setAuraPoints((a) => a + 10);
    if (isTweet) {
      const foundTw = tweets.find((t) => t.id === id);
      if (foundTw && isLiked) {
        recordWatchEvent(foundTw.text, foundTw.handle, foundTw.avatar, "Liked Tweet");
      }
      setTweets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, likes: t.likes + (isLiked ? 1 : -1) } : t))
      );
    } else {
      const foundPost = posts.find((p) => p.id === id);
      if (foundPost && isLiked) {
        recordWatchEvent(foundPost.caption, foundPost.author, foundPost.image, "Liked Post");
      }
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, likes: p.likes + (isLiked ? 1 : -1) } : p))
      );
      if (supabase && typeof id === "string" && !id.startsWith("p")) {
        const cur = posts.find((p) => p.id === id);
        const updated = (cur?.likes || 0) + (isLiked ? 1 : -1);
        await supabase.from("posts").update({ likes_count: Math.max(0, updated) }).eq("id", id);
      }
    }
  };

  const toggleRepost = (id: string, isTweet = false) => {
    const isReposted = !repostedItems[id];
    setRepostedItems((prev) => ({ ...prev, [id]: isReposted }));
    if (isReposted) setAuraPoints((a) => a + 25);
    if (isTweet) {
      setTweets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, reposts: t.reposts + (isReposted ? 1 : -1) } : t))
      );
    } else {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, reposts: (p.reposts || 0) + (isReposted ? 1 : -1) } : p))
      );
    }
    Alert.alert(isReposted ? "Reposted! 🔁 (+25 Aura)" : "Undo Repost", "Real-time count updated on your profile dashboard.");
  };

  const handleSavePress = (id: string) => {
    setSavedPosts((prev) => ({ ...prev, [id]: true }));
    setShowSaveCollectionSheet(true);
  };

  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) return;
    const newCol = {
      id: "col_" + Date.now(),
      name: newFolderName.trim(),
      count: 1,
      cover: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200",
    };
    setCollections([...collections, newCol]);
    setNewFolderName("");
    setShowCreateFolderModal(false);
    setShowSaveCollectionSheet(false);
    Alert.alert("Saved! 📁", `Organized in '${newCol.name}'`);
  };

  // ================= CAMERA & GALLERY LAUNCHERS =================
  const openCameraStudio = (target: "story" | "post") => {
    setCameraTarget(target);
    setActiveCameraFilter(ALL_FILTERS[0]);
    setShowCameraModal(true);
  };

  const triggerDeviceHardwareCamera = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        return Alert.alert("Camera Permission", "Using In-App Live Studio Camera Viewfinder!");
      }
      const res = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.9 });
      if (!res.canceled) {
        handleCapturedPhoto(res.assets[0].uri);
      }
    } catch {
      handleCapturedPhoto(
        isFrontCamera
          ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"
          : "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"
      );
    }
  };

  const handleCapturedPhoto = (uri: string) => {
    setShowCameraModal(false);
    if (cameraTarget === "story") {
      setStoryImage(uri);
      setActiveStoryFilter(activeCameraFilter);
      setShowStoryEditor(true);
    } else {
      setPublishImage(uri);
      setActivePostFilter(activeCameraFilter);
      setShowAdvancedPublish(true);
    }
  };

  const pickGalleryMedia = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.All, allowsEditing: true });
    if (!res.canceled) {
      setShowCameraModal(false);
      setPublishImage(res.assets[0].uri);
      setAiViralScore(Math.floor(Math.random() * 12) + 88);
      setShowAdvancedPublish(true);
    }
  };

  const pickStoryGallery = async () => {
    let res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true });
    if (!res.canceled) {
      setShowCameraModal(false);
      setStoryImage(res.assets[0].uri);
      setShowStoryEditor(true);
    }
  };

  // Publish Story (Including Secret 1-Person Stealth Mode)
  const handlePublishStory = () => {
    if (storyAudience === "Secret Special Person" && !secretSpecialPerson.trim()) {
      return Alert.alert("Enter Username", "Please enter the @username of that special person!");
    }
    const newStory = {
      id: "s_" + Date.now(),
      name: "Your Story",
      img: storyImage || "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800",
      isUser: true,
      filter: activeStoryFilter.name,
      filterOverlay: activeStoryFilter.overlay,
      hoursLeft: 24,
      isSpotlightPushed: isSpotlightPushed,
      secretTarget: storyAudience === "Secret Special Person" ? secretSpecialPerson.trim() : null,
      music: selectedStoryMusic || "Original Audio",
    };
    setStories([newStory, ...stories.filter((s) => !s.isUser)]);
    setStoryAudienceSheet(false);
    setShowStoryEditor(false);
    if (storyAudience === "Secret Special Person") {
      Alert.alert(
        "🤫 Stealth Story Live!",
        `Your story will ONLY be visible to @${secretSpecialPerson.trim()}, disguised with a normal public ring so they never suspect it's exclusively for them!`
      );
    } else {
      Alert.alert(
        "Story Live! ⚡",
        `Shared with Filter: ${activeStoryFilter.name}.${isSpotlightPushed ? " Secret Spotlight Push active!" : ""}`
      );
    }
  };

  const handleExtendStory = () => {
    setStories((prev) =>
      prev.map((s) => (s.isUser ? { ...s, hoursLeft: s.hoursLeft + 24 } : s))
    );
    Alert.alert("Story Extended! ⏳", "Your story validity extended by +24 hours!");
  };

  // Final Publish Handler (Updates Real Profile Dashboard Counts)
  const handleFinalPublish = async () => {
    if (createType === "tweet") {
      if (!newTweetText.trim()) return Alert.alert("Wait", "Please enter tweet/thought text!");
      const newTw = {
        id: "tw_" + Date.now(),
        author: "itsanandgupta",
        handle: "itsanandgupta",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
        verified: true,
        time: "Just now",
        text: newTweetText.trim(),
        simpleHindi: newTweetText.trim(),
        factNote: null,
        likes: 1,
        reposts: 0,
        comments: 0,
      };
      setTweets([newTw, ...tweets]);
      setNewTweetText("");
      setAuraPoints((a) => a + 50);
      setShowAdvancedPublish(false);
      Alert.alert("Tweet Posted! 💬", "Your real-time Tweet counter on Profile Dashboard has increased!");
      setTab("explore");
      setExploreCategory("Tweets 💬");
      return;
    }

    if (!publishCaption.trim()) return Alert.alert("Wait", "Please enter caption!");
    const newPost: any = {
      id: "p_" + Date.now(),
      author: "itsanandgupta",
      location: publishLocation,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      image: publishImage,
      likes: 1,
      reposts: 0,
      caption: publishCaption,
      simpleHindiMeaning: publishCaption,
      audioTitle: audioName,
      taggedProduct: selectedProduct,
      filterOverlay: activePostFilter.overlay,
      isTrial: reelAudience === "Trial",
      hideLikes: hideLikeCount,
      postType: mediaSubType,
      comments: [],
    };

    if (supabase) {
      try {
        const { data } = await supabase.from("posts").insert([
          {
            author: "itsanandgupta",
            location: publishLocation,
            avatar: newPost.avatar,
            media_url: publishImage,
            caption: publishCaption,
            likes_count: 1,
          },
        ]).select();
        if (data && data[0]) newPost.id = data[0].id;
      } catch {}
    }

    if (alsoShareToFeed) {
      setPosts([newPost, ...posts]);
    }
    setAuraPoints((a) => a + 100);
    setShowAdvancedPublish(false);
    Alert.alert("Published! 🚀 (+100 Aura)", `Added to your real-time ${mediaSubType === "feedVideo" ? "Feed Videos" : "Posts"} count!`);
    setTab("feed");
  };

  const handleAddComment = async (customText?: string, isAudio = false) => {
    const finalTxt = customText || commentInput.trim();
    if (!finalTxt || !activeCommentsPostId) return;
    const cObj = { id: "c_" + Date.now(), user: "itsanandgupta", text: finalTxt, isAudio };
    setPosts((prev) =>
      prev.map((p) => (p.id === activeCommentsPostId ? { ...p, comments: [...p.comments, cObj] } : p))
    );
    if (supabase && typeof activeCommentsPostId === "string" && !activeCommentsPostId.startsWith("p")) {
      await supabase.from("comments").insert([{ post_id: activeCommentsPostId, user_name: "itsanandgupta", comment_text: finalTxt }]);
    }
    setCommentInput("");
  };

  const handleSendMessage = () => {
    if (!liveMsgInput.trim() || !activeChat) return;
    const msg = { id: "m_" + Date.now(), sender: "me", text: liveMsgInput.trim() };
    setChatMessages((prev) => ({ ...prev, [activeChat.id]: [...(prev[activeChat.id] || []), msg] }));
    setLiveMsgInput("");
  };

  // Send Live Stream Comment
  const handleSendLiveComment = () => {
    if (!liveChatInput.trim()) return;
    const newMsg = { id: "lc_" + Date.now(), user: "itsanandgupta (Host)", text: liveChatInput.trim() };
    setLiveComments((prev) => [...prev, newMsg]);
    setLiveChatInput("");
  };

  const activePostForComments = posts.find((p) => p.id === activeCommentsPostId);

  return (
    <View style={s.container}>
      {/* ================= 1. HOME FEED VIEW ================= */}
      {tab === "feed" && (
        <View style={{ flex: 1 }}>
          <View style={s.header}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              <Text style={[s.brandTitle, isSeniorMode && { fontSize: 21, color: "#facc15" }]}>TaazaFeed</Text>
              {/* SMART PERSONA SWITCHER */}
              <TouchableOpacity
                style={[s.personaSwitchPill, isSeniorMode && s.personaSwitchSenior]}
                onPress={() => {
                  const nextMode = !isSeniorMode;
                  setIsSeniorMode(nextMode);
                  setSelectedVibe(nextMode ? "🙏 सभी पोस्ट" : "🔥 All");
                }}
              >
                <Text style={[s.personaSwitchTxt, isSeniorMode && { color: "#000", fontWeight: "900" }]}>
                  {isSeniorMode ? "👓 सरल 60+" : "⚡ Pro / 👓 सरल"}
                </Text>
              </TouchableOpacity>

              {/* 24+ REGIONAL LANGUAGES PICKER BUTTON */}
              <TouchableOpacity style={s.langBtnPill} onPress={() => setShowLangModal(true)}>
                <Text style={{ color: "#fde047", fontSize: 10, fontWeight: "800" }}>🌐 24+ भाषा</Text>
              </TouchableOpacity>
            </View>

            <View style={s.headerIcons}>
              {/* GO LIVE BUTTON */}
              <TouchableOpacity
                onPress={() => {
                  setShowLiveStreamModal(true);
                }}
                style={s.goLiveTopBtn}
              >
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 10 }}>🔴 LIVE</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => openCameraStudio("post")} style={s.glassPillBtn}>
                <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 11 }}>📷 Cam</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.iconTouch} onPress={() => setShowHistoryModal(true)}>
                <Text style={s.transIcon}>🕒</Text>
              </TouchableOpacity>

              <TouchableOpacity style={s.iconTouch} onPress={() => setShowNotifModal(true)}>
                <Text style={s.transIcon}>♡</Text>
                <View style={s.dotBadge} />
              </TouchableOpacity>

              <TouchableOpacity style={s.iconTouch} onPress={() => setShowInboxModal(true)}>
                <Text style={s.transIcon}>✈</Text>
                <View style={s.numBadge}><Text style={s.numBadgeTxt}>4</Text></View>
              </TouchableOpacity>
            </View>
          </View>

          {/* NOW PLAYING REAL AUDIO BAR */}
          {playingTrackTitle && (
            <View style={s.nowPlayingBanner}>
              <Text style={{ color: "#38bdf8", fontSize: 12, fontWeight: "800" }}>🎵 Playing Now: {playingTrackTitle}</Text>
              <TouchableOpacity onPress={() => togglePlayRealAudio(playingTrackTitle)}>
                <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "900" }}>⏹ Stop</Text>
              </TouchableOpacity>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 70 }}>
            {/* VIBE TUNER BAR */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.vibeBarScroll}>
              {(isSeniorMode ? SENIOR_VIBES : YOUTH_VIBES).map((vb) => (
                <TouchableOpacity
                  key={vb}
                  style={[
                    s.vibePill,
                    selectedVibe === vb && (isSeniorMode ? s.vibePillSeniorActive : s.vibePillYouthActive),
                  ]}
                  onPress={() => {
                    setSelectedVibe(vb);
                    if (vb.includes("Men's Arena")) {
                      Alert.alert("🏏 Men's Arena & Ride Club", "Live Score: IND 248/2 • Royal Enfield Sunday Ride registrations open!");
                    } else if (vb.includes("Women's Glam")) {
                      Alert.alert("💄 Women's Glam & AI Try-On", "Virtual Try-On active for Festive Jhumkas, Suits & Beauty looks!");
                    } else if (vb === "☕ चौपाल चर्चा") {
                      speakAloudReal("वरिष्ठ नागरिक चौपाल में आपका स्वागत है। यहाँ आज के समाचार और स्वास्थ्य पर चर्चा चल रही है।");
                    }
                  }}
                >
                  <Text
                    style={[
                      s.vibePillTxt,
                      isSeniorMode && { fontSize: 15 },
                      selectedVibe === vb && { color: isSeniorMode ? "#000" : "#fff", fontWeight: "800" },
                    ]}
                  >
                    {vb}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* SENIOR REGIONAL GREETING & SUPRABHAT BANNER */}
            {isSeniorMode && (
              <View style={s.seniorWelcomeBanner}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fef08a", fontSize: 16, fontWeight: "900" }}>{L.greeting}</Text>
                  <Text style={{ color: "#e2e8f0", fontSize: 13, marginTop: 2 }}>
                    🌐 भाषा: {L.label} • 🔊 असली आवाज़ इंजन चालू है
                  </Text>
                </View>
                <TouchableOpacity style={s.suprabhatSendBtn} onPress={() => speakAloudReal(L.greeting)}>
                  <Text style={{ color: "#000", fontWeight: "900", fontSize: 12 }}>{L.listen}</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Story Bar + Go Live Bubble */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.storyBar}>
              {/* Dedicated GO LIVE Bubble */}
              <TouchableOpacity
                style={s.storyWrapper}
                onPress={() => {
                  setShowLiveStreamModal(true);
                }}
              >
                <View style={[s.storyBorder, { borderColor: "#ef4444", borderWidth: 2.5 }]}>
                  <Image source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" }} style={s.storyImg} />
                  <View style={s.liveBadgeMini}><Text style={{ color: "#fff", fontSize: 8, fontWeight: "900" }}>LIVE</Text></View>
                </View>
                <Text style={[s.storyLabel, { color: "#ef4444", fontWeight: "800" }]}>Go Live 🔴</Text>
                <Text style={{ color: "#94a3b8", fontSize: 8 }}>Broadcast</Text>
              </TouchableOpacity>

              {stories.map((st) => (
                <TouchableOpacity
                  key={st.id}
                  style={s.storyWrapper}
                  onPress={() => (st.isUser ? openCameraStudio("story") : Alert.alert(st.name, "Viewing friend story"))}
                >
                  {/* Normal Ring even if secretTarget is set so nobody suspects! */}
                  <View style={[s.storyBorder, st.isUser && s.userBorder, isSeniorMode && { borderColor: "#facc15", borderWidth: 3 }]}>
                    <Image source={{ uri: st.img }} style={s.storyImg} />
                    {st.isUser && <View style={s.addIcon}><Text style={s.addTxt}>📷</Text></View>}
                  </View>
                  <Text style={[s.storyLabel, isSeniorMode && { fontSize: 14, fontWeight: "700" }]} numberOfLines={1}>
                    {st.name}
                  </Text>
                  {st.isUser && (
                    <Text style={{ color: "#38bdf8", fontSize: isSeniorMode ? 10 : 8 }}>
                      {st.secretTarget ? "Public Ring (1-Target)" : `+ Camera / ${st.hoursLeft}h`}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.divider} />

            {/* UNIFIED POSTS STREAM */}
            {posts.map((post) => {
              const isLiked = !!likedItems[post.id];
              const isReposted = !!repostedItems[post.id];
              const isSaved = !!savedPosts[post.id];
              const isFollowingAuthor = !!followedAuthors[post.author];

              return (
                <View key={post.id} style={[s.postCard, isSeniorMode && s.postCardSeniorHighlight]}>
                  <View style={s.postUserRow}>
                    <Image source={{ uri: post.avatar }} style={[s.postAvatar, isSeniorMode && { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: "#facc15" }]} />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <Text style={[s.authorText, isSeniorMode && { fontSize: 18, color: "#fef08a" }]}>{post.author}</Text>
                        <View style={s.blueTick}><Text style={s.tickTxt}>✓</Text></View>
                        {post.isTrial && <View style={s.trialBadge}><Text style={s.trialBadgeTxt}>TRIAL</Text></View>}

                        {/* DIRECT FOLLOW BUTTON ON POST HEADER */}
                        <TouchableOpacity
                          style={[s.inlineFollowBtn, isFollowingAuthor && s.inlineFollowingBtn]}
                          onPress={() => toggleFollowAuthor(post.author)}
                        >
                          <Text style={[s.inlineFollowTxt, isFollowingAuthor && { color: "#cbd5e1" }]}>
                            {isSeniorMode ? (isFollowingAuthor ? L.following : L.follow) : isFollowingAuthor ? "Following" : "Follow"}
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[s.subLoc, isSeniorMode && { fontSize: 14, color: "#cbd5e1" }]}>📍 {post.location}</Text>
                    </View>

                    <View style={{ flexDirection: "row", gap: 6 }}>
                      <TouchableOpacity
                        style={s.listenAloudBtn}
                        onPress={() => {
                          recordWatchEvent(post.caption, post.author, post.image, "Listened Post");
                          speakAloudReal(`${post.author} की पोस्ट: ${post.simpleHindiMeaning || post.caption}`);
                        }}
                      >
                        <Text style={{ color: "#000", fontWeight: "900", fontSize: 11 }}>{L.listen}</Text>
                      </TouchableOpacity>
                      {!isSeniorMode && (
                        <TouchableOpacity style={s.quickTipPill} onPress={() => setTipTargetAuthor(post.author)}>
                          <Text style={{ color: "#facc15", fontSize: 11, fontWeight: "800" }}>⚡ Tip</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  {/* Double Tap Image Surface (Also records in Watch History) */}
                  <TouchableOpacity
                    activeOpacity={1}
                    onPress={() => {
                      recordWatchEvent(post.caption, post.author, post.image, "Viewed Post");
                      triggerDoubleTapHeart(post.id);
                    }}
                    style={{ position: "relative" }}
                  >
                    <Image source={{ uri: post.image }} style={s.postPhoto} />
                    {post.filterOverlay && post.filterOverlay !== "transparent" && (
                      <View style={[StyleSheet.absoluteFillObject, { backgroundColor: post.filterOverlay }]} pointerEvents="none" />
                    )}
                    {animHeartId === post.id && (
                      <Animated.View style={[s.floatingHeartMask, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}>
                        <Text style={{ fontSize: 90 }}>❤️</Text>
                      </Animated.View>
                    )}
                  </TouchableOpacity>

                  {/* Action Bar */}
                  <View style={s.actionBar}>
                    <View style={{ flexDirection: "row", gap: isSeniorMode ? 14 : 18, alignItems: "center", flexWrap: "wrap" }}>
                      <TouchableOpacity style={s.actionTouchItem} onPress={() => toggleLike(post.id)}>
                        <Text style={[s.actIcon, isLiked && { color: "#ff2d55" }]}>{isLiked ? "♥" : "♡"}</Text>
                        {isSeniorMode && <Text style={s.seniorIconLabel}>{L.like}</Text>}
                      </TouchableOpacity>

                      <TouchableOpacity style={s.actionTouchItem} onPress={() => setActiveCommentsPostId(post.id)}>
                        <Text style={s.actIcon}>💬</Text>
                        {isSeniorMode && <Text style={s.seniorIconLabel}>{L.comment}</Text>}
                      </TouchableOpacity>

                      <TouchableOpacity style={s.actionTouchItem} onPress={() => toggleRepost(post.id)}>
                        <Text style={[s.actIcon, isReposted && { color: "#22c55e" }]}>🔁</Text>
                        {isSeniorMode && <Text style={s.seniorIconLabel}>{L.repost}</Text>}
                      </TouchableOpacity>

                      <TouchableOpacity style={s.actionTouchItem} onPress={() => setShareTargetPost(post)}>
                        <Text style={s.actIcon}>✈</Text>
                        {isSeniorMode && <Text style={s.seniorIconLabel}>{L.share}</Text>}
                      </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={s.actionTouchItem} onPress={() => handleSavePress(post.id)}>
                      <Text style={[s.actIcon, isSaved && { color: "#38bdf8" }]}>{isSaved ? "🏷" : "⚐"}</Text>
                      {isSeniorMode && <Text style={s.seniorIconLabel}>{L.save}</Text>}
                    </TouchableOpacity>
                  </View>

                  <View style={{ paddingHorizontal: 14 }}>
                    {!post.hideLikes && (
                      <Text style={[s.likesCount, isSeniorMode && { fontSize: 17, color: "#fef08a" }]}>
                        {post.likes.toLocaleString()} {L.like} • {post.reposts || 0} {L.repost}
                      </Text>
                    )}
                    <Text style={[s.caption, isSeniorMode && { fontSize: 19, lineHeight: 28, fontWeight: "700", color: "#ffffff" }]}>
                      <Text style={{ fontWeight: "900", color: isSeniorMode ? "#38bdf8" : "#fff" }}>{post.author}: </Text>
                      {post.caption}
                    </Text>

                    {isSeniorMode && post.simpleHindiMeaning && (
                      <View style={s.aiBridgeBox}>
                        <Text style={{ color: "#fde047", fontSize: 15, fontWeight: "800" }}>
                          💡 सरल अर्थ ({L.label}): {post.simpleHindiMeaning}
                        </Text>
                      </View>
                    )}

                    {post.taggedProduct && (
                      <TouchableOpacity style={s.taggedProductPill} onPress={() => openCameraStudio("story")}>
                        <Text style={{ color: "#fff", fontSize: isSeniorMode ? 14 : 11, fontWeight: "600" }}>
                          🛍️ {post.taggedProduct} • ✨ Tap for Live Camera Try-On
                        </Text>
                      </TouchableOpacity>
                    )}

                    {post.audioTitle && (
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
                        <TouchableOpacity style={s.audioVoicePill} onPress={() => togglePlayRealAudio(post.audioTitle)}>
                          <Text style={{ color: "#38bdf8", fontSize: isSeniorMode ? 14 : 11, fontWeight: "700" }}>
                            {playingTrackTitle === post.audioTitle ? "⏸ Pause Audio" : `▶ Play: ${post.audioTitle}`}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[s.audioVoicePill, { backgroundColor: "#27272a" }]}
                          onPress={() => setActiveAudioSheet({ title: post.audioTitle, reelsCount: "142.8K reels" })}
                        >
                          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>💿 Use Audio</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    <TouchableOpacity onPress={() => setActiveCommentsPostId(post.id)} style={{ marginTop: 8 }}>
                      <Text style={{ color: isSeniorMode ? "#38bdf8" : "#71717a", fontSize: isSeniorMode ? 16 : 13, fontWeight: isSeniorMode ? "700" : "400" }}>
                        {post.comments.length > 0 ? `सभी ${post.comments.length} कमेंट्स और आशीर्वाद देखें...` : "🎙️ बोलकर कमेंट या आशीर्वाद लिखें..."}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ================= 2. EXPLORE & TWEETS VIEW ================= */}
      {tab === "explore" && (
        <View style={{ flex: 1 }}>
          <View style={s.exploreTopRow}>
            <Image source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }} style={s.exploreUserAvatar} />
            <View style={s.exploreSearchPill}>
              <Text style={{ color: "rgba(255,255,255,0.5)", marginRight: 8 }}>🔍</Text>
              <TextInput
                placeholder={isSeniorMode ? "पुराने मित्र, समाचार या भजन खोजें..." : "Search tweets, news, cricket, beauty..."}
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={[s.exploreInputText, isSeniorMode && { fontSize: 16 }]}
                value={exploreSearch}
                onChangeText={setExploreSearch}
              />
            </View>
            <TouchableOpacity onPress={() => setShowHistoryModal(true)}>
              <Text style={s.transIcon}>🕒</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.exploreCatsBar}>
            {["Explore", "Trending", "Tweets 💬", "☕ चौपाल", "🏏 Sports", "💄 Glam"].map((c) => (
              <TouchableOpacity
                key={c}
                style={[s.exploreCatTab, exploreCategory === c && s.exploreCatActive]}
                onPress={() => setExploreCategory(c)}
              >
                <Text style={[s.exploreCatTxt, isSeniorMode && { fontSize: 16 }, exploreCategory === c && { color: "#fff" }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {exploreCategory === "Tweets 💬" ? (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
              <TouchableOpacity
                style={s.quickTweetBar}
                onPress={() => {
                  setCreateType("tweet");
                  setShowAdvancedPublish(true);
                }}
              >
                <Image source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }} style={s.quickTweetAvatar} />
                <Text style={{ color: "#cbd5e1", fontSize: isSeniorMode ? 17 : 14 }}>
                  {isSeniorMode ? "🎙️ यहाँ दबाकर अपना विचार या सुप्रभात लिखें..." : "Post a tweet / thought... ✍️"}
                </Text>
              </TouchableOpacity>

              {tweets.map((tw) => {
                const isLiked = !!likedItems[tw.id];
                const isReposted = !!repostedItems[tw.id];
                const isFollowingTw = !!followedAuthors[tw.handle];

                return (
                  <TouchableOpacity
                    key={tw.id}
                    activeOpacity={1}
                    onPress={() => {
                      recordWatchEvent(tw.text, tw.handle, tw.avatar, "Viewed Tweet");
                      triggerDoubleTapHeart(tw.id, true);
                    }}
                    style={[s.tweetCard, isSeniorMode && { backgroundColor: "#121216", borderWidth: 1, borderColor: "#3f3f46", margin: 8, borderRadius: 14 }]}
                  >
                    <Image source={{ uri: tw.avatar }} style={s.tweetAvatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 6 }}>
                        <Text style={[s.tweetAuthor, isSeniorMode && { fontSize: 18, color: "#fef08a" }]}>{tw.author}</Text>
                        {tw.verified && <View style={s.blueTickSmall}><Text style={s.blueTickTxt}>✓</Text></View>}
                        <Text style={s.tweetHandle}>@{tw.handle} • {tw.time}</Text>
                        <TouchableOpacity
                          style={[s.inlineFollowBtn, isFollowingTw && s.inlineFollowingBtn]}
                          onPress={() => toggleFollowAuthor(tw.handle)}
                        >
                          <Text style={s.inlineFollowTxt}>{isFollowingTw ? L.following : L.follow}</Text>
                        </TouchableOpacity>
                      </View>
                      <Text style={[s.tweetBody, isSeniorMode && { fontSize: 19, lineHeight: 27, fontWeight: "700" }]}>{tw.text}</Text>

                      {tw.factNote && (
                        <View style={s.factCheckBox}>
                          <Text style={{ color: "#38bdf8", fontSize: 11, fontWeight: "700" }}>🛡️ Community Context: {tw.factNote}</Text>
                        </View>
                      )}

                      <View style={s.tweetActionBar}>
                        <TouchableOpacity style={s.tweetActionBtn}>
                          <Text style={s.tweetActionIcon}>💬</Text>
                          <Text style={s.tweetActionCount}>{tw.comments}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.tweetActionBtn} onPress={() => toggleRepost(tw.id, true)}>
                          <Text style={[s.tweetActionIcon, isReposted && { color: "#22c55e" }]}>🔁</Text>
                          <Text style={[s.tweetActionCount, isReposted && { color: "#22c55e", fontWeight: "bold" }]}>{tw.reposts}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.tweetActionBtn} onPress={() => toggleLike(tw.id, true)}>
                          <Text style={[s.tweetActionIcon, isLiked && { color: "#ff2d55" }]}>{isLiked ? "♥" : "♡"}</Text>
                          <Text style={[s.tweetActionCount, isLiked && { color: "#ff2d55", fontWeight: "bold" }]}>{tw.likes}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.tweetActionBtn} onPress={() => handleSavePress(tw.id)}>
                          <Text style={s.tweetActionIcon}>🏷</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => speakAloudReal(tw.simpleHindi || tw.text)}>
                          <Text style={{ color: "#facc15", fontSize: 12, fontWeight: "800" }}>{L.listen}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 80 }}>
              <View style={s.toggleRow}>
                <TouchableOpacity style={[s.toggleBtn, exploreViewType === "news" && s.toggleBtnActive]} onPress={() => setExploreViewType("news")}>
                  <Text style={[s.toggleTxt, exploreViewType === "news" && { color: "#fff" }]}>📰 Today's News</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.toggleBtn, exploreViewType === "grid" && s.toggleBtnActive]} onPress={() => setExploreViewType("grid")}>
                  <Text style={[s.toggleTxt, exploreViewType === "grid" && { color: "#fff" }]}>▦ Media Grid</Text>
                </TouchableOpacity>
              </View>

              {exploreViewType === "news" ? (
                <View>
                  <View style={s.heroBanner}>
                    <Image source={{ uri: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=800" }} style={s.heroImg} />
                    <View style={s.heroOverlay} />
                    <View style={s.heroTextWrap}>
                      <Text style={s.heroHeading}>UNIQLO x Bumrah</Text>
                      <Text style={s.heroSubtitle}>All-demographic Arena: Sports, Glam, Creator & Senior Chaupal</Text>
                      <Text style={s.heroPromoted}>↗ Promoted by UNIQLO INDIA</Text>
                    </View>
                  </View>

                  <Text style={s.sectionHeader}>Today's Verified Pulse (Tap to Listen 🔊)</Text>
                  {TRENDING_TOPICS.map((topic) => (
                    <TouchableOpacity
                      key={topic.id}
                      style={[s.newsCard, isSeniorMode && { paddingVertical: 16, borderColor: "#3f3f46" }]}
                      onPress={() => {
                        recordWatchEvent(topic.title, topic.category, topic.avatars[0], "Read News");
                        speakAloudReal(`${topic.title}. ${topic.verifiedFact}`);
                      }}
                    >
                      <Text style={[s.newsTitle, isSeniorMode && { fontSize: 18, color: "#fef08a" }]}>{topic.title}</Text>
                      <Text style={{ color: "#22c55e", fontSize: 12, marginTop: 4 }}>✓ {topic.verifiedFact}</Text>
                      <View style={s.topicMetaRow}>
                        <View style={s.stackedAvatars}>
                          <Image source={{ uri: topic.avatars[0] }} style={[s.stackedImg, { left: 0 }]} />
                          <Image source={{ uri: topic.avatars[1] }} style={[s.stackedImg, { left: 14 }]} />
                        </View>
                        <Text style={s.newsMeta}>{topic.time} • {topic.category} • <Text style={{ color: "#94a3b8" }}>{topic.count}</Text></Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <View style={s.mediaGrid}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <TouchableOpacity key={i} style={s.mediaGridTile} onPress={() => setTab("videoFeed")}>
                      <Image source={{ uri: `https://images.unsplash.com/photo-150${i}899036084-c55cdd92da26?w=400` }} style={{ width: "100%", height: 130 }} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </ScrollView>
          )}

          <TouchableOpacity
            style={s.floatingFab}
            onPress={() => {
              setCreateType(exploreCategory === "Tweets 💬" ? "tweet" : "media");
              setShowAdvancedPublish(true);
            }}
          >
            <Text style={{ color: "#fff", fontSize: 26, fontWeight: "700" }}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ================= 3. FULLSCREEN "FEED" (REELS ENGINE) ================= */}
      {tab === "videoFeed" && (
        <View style={s.reelScreen}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {
              recordWatchEvent("Tokyo rain reflections 🌧️✨", "cinematic_vibes", "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=200", "Watched Feed Video");
              triggerDoubleTapHeart("feed_main");
            }}
            style={{ width: "100%", height: "100%" }}
          >
            <Image source={{ uri: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800" }} style={s.reelImage} />
            <View style={[StyleSheet.absoluteFillObject, { backgroundColor: activePostFilter.overlay }]} pointerEvents="none" />
            <View style={s.reelDarkMask} />
            {animHeartId === "feed_main" && (
              <Animated.View style={[s.floatingHeartMask, { opacity: heartOpacity, transform: [{ scale: heartScale }] }]}>
                <Text style={{ fontSize: 90 }}>❤️</Text>
              </Animated.View>
            )}
          </TouchableOpacity>

          <View style={s.reelTopRow}>
            <Text style={s.reelLogo}>Feed</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <TouchableOpacity
                style={[s.reelCameraBtn, { borderColor: "#ef4444" }]}
                onPress={() => {
                  setShowLiveStreamModal(true);
                }}
              >
                <Text style={{ color: "#ef4444", fontWeight: "900", fontSize: 12 }}>🔴 Go Live</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.reelCameraBtn} onPress={() => openCameraStudio("post")}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>📷 Camera</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.reelRightSide}>
            <TouchableOpacity style={s.reelBtn} onPress={() => toggleLike("feed_main")}>
              <Text style={[s.reelIconTrans, likedItems["feed_main"] && { color: "#ff2d55" }]}>
                {likedItems["feed_main"] ? "♥" : "♡"}
              </Text>
              <Text style={s.reelNum}>{isSeniorMode ? L.like : "84.2K"}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.reelBtn} onPress={() => setShowVideoComments(true)}>
              <Text style={s.reelIconTrans}>💬</Text>
              <Text style={s.reelNum}>{isSeniorMode ? L.comment : videoComments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.reelBtn} onPress={() => toggleRepost("feed_main")}>
              <Text style={[s.reelIconTrans, repostedItems["feed_main"] && { color: "#22c55e" }]}>🔁</Text>
              <Text style={s.reelNum}>{L.repost}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.reelBtn} onPress={() => setTipTargetAuthor("cinematic_vibes")}>
              <Text style={s.reelIconTrans}>⚡</Text>
              <Text style={s.reelNum}>Tip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.reelBtn} onPress={() => { setSavedPosts((prev) => ({ ...prev, feed_main: true })); setShowSaveCollectionSheet(true); }}>
              <Text style={s.reelIconTrans}>🏷</Text>
              <Text style={s.reelNum}>{L.save}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.reelBtn} onPress={() => setShareTargetPost(posts[0])}>
              <Text style={s.reelIconTrans}>✈</Text>
              <Text style={s.reelNum}>{L.share}</Text>
            </TouchableOpacity>
          </View>

          <View style={s.reelBottomInfo}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>@cinematic_vibes</Text>
              <View style={s.blueTick}><Text style={s.tickTxt}>✓</Text></View>
              <TouchableOpacity
                style={[s.reelFollowBtn, followedAuthors["cinematic_vibes"] && s.reelFollowingBtn]}
                onPress={() => toggleFollowAuthor("cinematic_vibes")}
              >
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 12 }}>
                  {followedAuthors["cinematic_vibes"] ? L.following : L.follow}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: "#fff", fontSize: 13, marginBottom: 6 }}>Tokyo rain reflections 🌧️✨ #aesthetic #cinematic</Text>
            <TouchableOpacity
              style={s.reelAudioPill}
              onPress={() => togglePlayRealAudio("lofi_tokyo_rain_vibe")}
            >
              <Text style={{ color: "#fff", fontSize: 11 }}>
                {playingTrackTitle === "lofi_tokyo_rain_vibe" ? "⏸ Playing Lofi Rain..." : "♫ lofi_tokyo_rain_vibe • Tap to Play"}
              </Text>
              <TouchableOpacity
                style={s.useVoiceBtnMini}
                onPress={() => setActiveAudioSheet({ title: "lofi_tokyo_rain_vibe", artist: "cinematic_vibes", reelsCount: "142.8K reels" })}
              >
                <Text style={{ color: "#000", fontSize: 9, fontWeight: "bold" }}>Use Audio</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ================= 4. CREATOR PROFILE WITH REAL-TIME LIVE DASHBOARD ================= */}
      {tab === "profile" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 70 }}>
          <View style={s.profHeaderRow}>
            <TouchableOpacity onPress={() => openCameraStudio("story")}><Text style={{ color: "#fff", fontSize: 22 }}>📷</Text></TouchableOpacity>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Text style={s.profHeaderTitle}>itsanandgupta</Text>
              <View style={s.blueTickSmall}><Text style={s.blueTickTxt}>✓</Text></View>
              {isAccountPrivate && <Text style={{ color: "#f59e0b", fontSize: 11 }}>🔒</Text>}
            </View>
            <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
              <TouchableOpacity onPress={() => setShowHistoryModal(true)}>
                <Text style={s.transIcon}>🕒</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowSettingsModal(true)}>
                <Text style={s.transIcon}>☰</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.profStatsRow}>
            <TouchableOpacity onPress={() => openCameraStudio("story")} style={s.profAvatarWrapper}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200" }} style={[s.profMainAvatar, { borderColor: "#38bdf8" }]} />
              <View style={s.profAvatarAddBadge}><Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>+</Text></View>
            </TouchableOpacity>
            <View style={s.statsCountsRow}>
              <View style={{ alignItems: "center" }}>
                <Text style={s.statNum}>{myPostsCount + myFeedVideosCount + myTweetsCount}</Text>
                <Text style={s.statLbl}>total creations</Text>
              </View>
              <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() => {
                  setFollowModalTab("followers");
                  setFollowSearch("");
                  setShowFollowModal(true);
                }}
              >
                <Text style={s.statNum}>14.4K</Text>
                <Text style={[s.statLbl, { color: "#38bdf8", fontWeight: "bold" }]}>followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ alignItems: "center" }}
                onPress={() => {
                  setFollowModalTab("following");
                  setFollowSearch("");
                  setShowFollowModal(true);
                }}
              >
                <Text style={s.statNum}>{Object.values(followedAuthors).filter(Boolean).length + 265}</Text>
                <Text style={[s.statLbl, { color: "#38bdf8", fontWeight: "bold" }]}>following</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.bioContainer}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={[s.bioName, isSeniorMode && { fontSize: 18 }]}>Anand Gupta ( आनन्द अग्रवाल )</Text>
              <View style={s.auraBadge}>
                <Text style={{ color: "#facc15", fontSize: 11, fontWeight: "900" }}>✨ +{auraPoints.toLocaleString()} Aura</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setShowProfessionPicker(true)} style={s.professionPill}>
              <Text style={s.professionPillTxt}>{userProfession} ✏️</Text>
            </TouchableOpacity>
            <Text style={[s.bioLine, isSeniorMode && { fontSize: 15 }]}>📍 Delhi || UP 🏰</Text>
            <Text style={[s.bioLine, isSeniorMode && { fontSize: 15 }]}>• Navodayan ✨ @i_anandagarwal</Text>
            <Text style={[s.bioLine, isSeniorMode && { fontSize: 15 }]}>• | ॐ कृष्णाय वासुदेवाय हरये परमात्मने |</Text>
            <Text style={s.bioLink}>🔗 onlyzxwear.github.io/onlyzxwear/</Text>
          </View>

          {/* ================= REAL-TIME CREATOR ANALYTICS & COUNTING DASHBOARD ================= */}
          <View style={s.realDashboardCard}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 14 }}>📊 Real-Time Creator Dashboard</Text>
              <TouchableOpacity onPress={() => setShowHistoryModal(true)} style={s.historyBtnMini}>
                <Text style={{ color: "#facc15", fontSize: 11, fontWeight: "800" }}>🕒 Like & Watch History ›</Text>
              </TouchableOpacity>
            </View>

            <View style={s.dashMetricsGrid}>
              <View style={s.dashMetricBox}>
                <Text style={s.dashMetricNum}>{myFeedVideosCount}</Text>
                <Text style={s.dashMetricLabel}>📰 Feed (Reels)</Text>
              </View>
              <View style={s.dashMetricBox}>
                <Text style={s.dashMetricNum}>{myPostsCount}</Text>
                <Text style={s.dashMetricLabel}>📷 Photo Posts</Text>
              </View>
              <View style={s.dashMetricBox}>
                <Text style={s.dashMetricNum}>{myTweetsCount}</Text>
                <Text style={s.dashMetricLabel}>💬 Tweets</Text>
              </View>
              <View style={s.dashMetricBox}>
                <Text style={s.dashMetricNum}>{myRepostsCount}</Text>
                <Text style={s.dashMetricLabel}>🔁 Reposts</Text>
              </View>
            </View>

            <View style={[s.dashMetricsGrid, { marginTop: 8 }]}>
              <View style={s.dashMetricBox}>
                <Text style={[s.dashMetricNum, { color: "#ff2d55" }]}>{myLikedCount}</Text>
                <Text style={s.dashMetricLabel}>❤️ Liked by You</Text>
              </View>
              <View style={s.dashMetricBox}>
                <Text style={[s.dashMetricNum, { color: "#22c55e" }]}>{watchHistory.length}</Text>
                <Text style={s.dashMetricLabel}>👁️ Watched History</Text>
              </View>
              <View style={s.dashMetricBox}>
                <Text style={[s.dashMetricNum, { color: "#facc15" }]}>{myTotalLikesReceived.toLocaleString()}</Text>
                <Text style={s.dashMetricLabel}>🔥 Total Likes Got</Text>
              </View>
            </View>
          </View>

          <View style={s.privacyToggleBar}>
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Account Privacy: {isAccountPrivate ? "Private 🔒" : "Public 🌐"}</Text>
            <Switch value={isAccountPrivate} onValueChange={setIsAccountPrivate} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.highlightsBar}>
            {HIGHLIGHTS.map((hl) => (
              <TouchableOpacity key={hl.id} style={s.hlItem} onPress={() => (hl.isNew ? openCameraStudio("story") : setShowStoryViewers(true))}>
                <View style={[s.hlCircle, hl.isNew && { borderColor: "#3f3f46" }]}>
                  {hl.isNew ? <Text style={{ color: "#fff", fontSize: 22 }}>+</Text> : <Image source={{ uri: hl.img }} style={s.hlImg} />}
                </View>
                <Text style={s.hlTitle}>{hl.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.fourTabsBar}>
            <TouchableOpacity style={[s.fourTab, profileTab === "posts" && s.fourTabActive]} onPress={() => setProfileTab("posts")}>
              <Text style={{ fontSize: 13, color: profileTab === "posts" ? "#fff" : "rgba(255,255,255,0.4)" }}>▦ Posts ({myPostsCount})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.fourTab, profileTab === "feedReels" && s.fourTabActive]} onPress={() => setProfileTab("feedReels")}>
              <Text style={{ fontSize: 13, color: profileTab === "feedReels" ? "#fff" : "rgba(255,255,255,0.4)" }}>📰 Feed ({myFeedVideosCount})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.fourTab, profileTab === "reposts" && s.fourTabActive]} onPress={() => setProfileTab("reposts")}>
              <Text style={{ fontSize: 13, color: profileTab === "reposts" ? "#fff" : "rgba(255,255,255,0.4)" }}>🔁 Reposts ({myRepostsCount})</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.fourTab, profileTab === "collections" && s.fourTabActive]} onPress={() => setProfileTab("collections")}>
              <Text style={{ fontSize: 13, color: profileTab === "collections" ? "#fff" : "rgba(255,255,255,0.4)" }}>📁 Folders ({collections.length})</Text>
            </TouchableOpacity>
          </View>

          {profileTab === "collections" ? (
            <View style={s.collectionsGrid}>
              <TouchableOpacity style={s.createFolderCard} onPress={() => setShowCreateFolderModal(true)}>
                <Text style={{ fontSize: 28 }}>➕</Text>
                <Text style={{ color: "#fff", fontWeight: "700", marginTop: 4 }}>New Folder</Text>
              </TouchableOpacity>
              {collections.map((col) => (
                <View key={col.id} style={s.folderCard}>
                  <Image source={{ uri: col.cover }} style={s.folderCover} />
                  <Text style={s.folderName}>{col.name}</Text>
                  <Text style={s.folderCount}>{col.count} saved</Text>
                </View>
              ))}
            </View>
          ) : (
            <View style={s.pinnedGrid}>
              {posts
                .filter((p) => p.author === "itsanandgupta")
                .map((myP) => (
                  <View key={myP.id} style={s.pinnedGridTile}>
                    <Image source={{ uri: myP.image }} style={{ width: "100%", height: 160 }} />
                    <View style={s.pinIconBadge}><Text style={{ fontSize: 10 }}>✨</Text></View>
                    <View style={s.viewsCountBadge}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>❤️ {myP.likes}</Text></View>
                  </View>
                ))}
              {PROFILE_PINNED_POSTS.map((pin) => (
                <View key={pin.id} style={s.pinnedGridTile}>
                  <Image source={{ uri: pin.img }} style={{ width: "100%", height: 160 }} />
                  <View style={s.pinIconBadge}><Text style={{ fontSize: 10 }}>📌</Text></View>
                  <View style={s.viewsCountBadge}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "bold" }}>👁 {pin.views}</Text></View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* ================= TRANSPARENT BOTTOM NAVIGATION BAR ================= */}
      <View style={[s.mainBottomBar, isSeniorMode && { height: 64 }]}>
        <TouchableOpacity style={s.bottomTab} onPress={() => setTab("feed")}>
          <Text style={[s.transIcon, tab === "feed" && s.iconActiveWhite]}>🏠</Text>
          {isSeniorMode && <Text style={s.seniorNavTxt}>होम</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.bottomTab} onPress={() => setTab("explore")}>
          <Text style={[s.transIcon, tab === "explore" && s.iconActiveWhite]}>🔍</Text>
          {isSeniorMode && <Text style={s.seniorNavTxt}>खोजें</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.bottomTab} onPress={() => openCameraStudio("post")}>
          <View style={s.addCircleTrans}><Text style={{ color: "#fff", fontSize: 20 }}>+</Text></View>
          {isSeniorMode && <Text style={s.seniorNavTxt}>कैमरा/पोस्ट</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.bottomTab} onPress={() => setTab("videoFeed")}>
          <Text style={[s.transIcon, tab === "videoFeed" && s.iconActiveWhite]}>📰</Text>
          {isSeniorMode && <Text style={s.seniorNavTxt}>फ़ीड वीडियो</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={s.bottomTab} onPress={() => setTab("profile")}>
          <Image source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }} style={[s.bottomProfPic, tab === "profile" && s.bottomProfActive]} />
          {isSeniorMode && <Text style={s.seniorNavTxt}>प्रोफ़ाइल</Text>}
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* ================= NEW MODAL A: GO LIVE STREAMING STUDIO ================= */}
      {/* ========================================================================= */}
      <Modal visible={showLiveStreamModal} animationType="slide" transparent={false}>
        <View style={s.storyEditorCanvas}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800" }}
            style={s.storyFullMedia}
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: activeCameraFilter.overlay }]} pointerEvents="none" />

          {/* Top Live Status Bar */}
          <View style={s.storyEditorTop}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={s.liveRedPill}>
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>🔴 LIVE</Text>
              </View>
              <View style={s.liveViewersPill}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 12 }}>👁 {liveViewersCount} watching</Text>
              </View>
            </View>
            <TouchableOpacity
              style={s.endLiveBtn}
              onPress={() => {
                setShowLiveStreamModal(false);
                Alert.alert("Live Ended! 📊", `Peak Viewers: ${liveViewersCount} • +250 Aura Points earned!`);
                setAuraPoints((a) => a + 250);
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "900", fontSize: 12 }}>End Live ✕</Text>
            </TouchableOpacity>
          </View>

          {/* Co-Host Split Box if Guest Joined */}
          {liveGuestConnected && (
            <View style={s.coHostBox}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" }} style={{ width: "100%", height: "100%" }} />
              <View style={s.coHostLabel}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}>🎤 @{liveGuestConnected}</Text></View>
            </View>
          )}

          {/* Live Chat Stream Overlay */}
          <View style={s.liveChatContainer}>
            <ScrollView style={{ maxHeight: 190 }} showsVerticalScrollIndicator={false}>
              {liveComments.map((lc) => (
                <View key={lc.id} style={[s.liveChatBubble, lc.isTip && { backgroundColor: "rgba(250,204,21,0.25)", borderColor: "#facc15", borderWidth: 1 }]}>
                  <Text style={{ color: lc.isTip ? "#facc15" : "#38bdf8", fontWeight: "800", fontSize: 12 }}>@{lc.user}: </Text>
                  <Text style={{ color: "#fff", fontSize: 12 }}>{lc.text}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Live Bottom Input & Co-Host Controls */}
            <View style={s.liveBottomInputRow}>
              <TextInput
                placeholder="Say something to live viewers..."
                placeholderTextColor="#cbd5e1"
                style={s.liveInputBox}
                value={liveChatInput}
                onChangeText={setLiveChatInput}
              />
              <TouchableOpacity style={s.liveSendBtn} onPress={handleSendLiveComment}>
                <Text style={{ color: "#fff", fontWeight: "900" }}>Send</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.liveSendBtn, { backgroundColor: "#8b5cf6" }]}
                onPress={() => {
                  const nextGuest = liveGuestConnected ? null : "vishal_baniya20";
                  setLiveGuestConnected(nextGuest);
                  Alert.alert(nextGuest ? "🎤 Co-Host Joined!" : "Co-Host Removed", nextGuest ? "@vishal_baniya20 is now live with you!" : "Back to solo stream.");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 11 }}>+Mic 👥</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.liveSendBtn, { backgroundColor: "#ff2d55" }]}
                onPress={() => {
                  setLiveViewersCount((v) => v + 14);
                  triggerDoubleTapHeart("live_heart");
                }}
              >
                <Text style={{ fontSize: 16 }}>❤️</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* ================= NEW MODAL B: LIKE & WATCH HISTORY CENTER ================= */}
      {/* ========================================================================= */}
      <Modal visible={showHistoryModal} animationType="slide" transparent={false}>
        <View style={s.modalInnerDark}>
          <View style={s.publishTopBar}>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}><Text style={{ color: "#fff", fontSize: 22 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>🕒 Activity & History</Text>
            <TouchableOpacity
              onPress={() => {
                setWatchHistory([]);
                Alert.alert("Cleared", "Watch history cleared!");
              }}
            >
              <Text style={{ color: "#ef4444", fontSize: 12, fontWeight: "700" }}>Clear</Text>
            </TouchableOpacity>
          </View>

          <View style={s.followToggleRow}>
            <TouchableOpacity
              style={[s.followToggleTab, historyTab === "liked" && s.followToggleActive]}
              onPress={() => setHistoryTab("liked")}
            >
              <Text style={[s.followToggleTxt, historyTab === "liked" && { color: "#fff" }]}>❤️ Liked History ({myLikedCount})</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.followToggleTab, historyTab === "watched" && s.followToggleActive]}
              onPress={() => setHistoryTab("watched")}
            >
              <Text style={[s.followToggleTxt, historyTab === "watched" && { color: "#fff" }]}>👁️ Watch History ({watchHistory.length})</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {historyTab === "liked" ? (
              <View>
                {posts
                  .filter((p) => likedItems[p.id])
                  .map((p) => (
                    <View key={p.id} style={s.historyItemCard}>
                      <Image source={{ uri: p.image }} style={s.historyThumb} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>@{p.author}</Text>
                        <Text style={{ color: "#cbd5e1", fontSize: 12 }} numberOfLines={2}>{p.caption}</Text>
                        <Text style={{ color: "#ff2d55", fontSize: 11, marginTop: 4 }}>❤️ Liked Post/Feed</Text>
                      </View>
                    </View>
                  ))}
                {tweets
                  .filter((t) => likedItems[t.id])
                  .map((t) => (
                    <View key={t.id} style={s.historyItemCard}>
                      <Image source={{ uri: t.avatar }} style={s.historyThumb} />
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>@{t.handle}</Text>
                        <Text style={{ color: "#cbd5e1", fontSize: 12 }} numberOfLines={2}>{t.text}</Text>
                        <Text style={{ color: "#38bdf8", fontSize: 11, marginTop: 4 }}>❤️ Liked Tweet</Text>
                      </View>
                    </View>
                  ))}
              </View>
            ) : (
              <View>
                {watchHistory.map((item) => (
                  <View key={item.id} style={s.historyItemCard}>
                    <Image source={{ uri: item.thumb }} style={s.historyThumb} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{item.title}</Text>
                      <Text style={{ color: "#94a3b8", fontSize: 12 }}>@{item.author} • {item.type}</Text>
                      <Text style={{ color: "#22c55e", fontSize: 11, marginTop: 4 }}>🕒 {item.time}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* ================= MODAL 0: AI MAGIC IMAGINE STUDIO ================= */}
      {/* ========================================================================= */}
      <Modal visible={showAIMagicModal} animationType="fade" transparent={true}>
        <View style={s.modalDimMaskCenter}>
          <View style={s.professionDialog}>
            <Text style={{ color: "#facc15", fontWeight: "900", fontSize: 17 }}>🪄 AI Magic Content Studio</Text>
            <Text style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}>
              Type any topic, festival, bike ride or shayari—AI will generate a viral post or thought!
            </Text>
            <TextInput
              placeholder="e.g. Royal Enfield night ride in Delhi rain..."
              placeholderTextColor="#71717a"
              style={[s.folderTextInput, { minHeight: 70, marginTop: 12 }]}
              multiline
              value={aiPromptInput}
              onChangeText={setAiPromptInput}
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 14 }}>
              <TouchableOpacity onPress={() => setShowAIMagicModal(false)}>
                <Text style={{ color: "#94a3b8" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{ backgroundColor: "#0284c7", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8 }}
                onPress={() => {
                  const prompt = aiPromptInput.trim() || "Late night Delhi vibes & unstoppable hustle";
                  setPublishCaption(`✨ ${prompt} 🔥\n\n#TaazaFeed #AICreator #DelhiVibes #Trending`);
                  setShowAIMagicModal(false);
                  setCreateType("media");
                  setShowAdvancedPublish(true);
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "900", fontSize: 13 }}>✨ Generate Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* ================= MODAL 1: LIVE CAMERA STUDIO + 12 FILTERS ================= */}
      {/* ========================================================================= */}
      <Modal visible={showCameraModal} animationType="slide" transparent={false}>
        <View style={s.storyEditorCanvas}>
          <Image
            source={{
              uri: isFrontCamera
                ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"
                : "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800",
            }}
            style={s.storyFullMedia}
          />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: activeCameraFilter.overlay }]} pointerEvents="none" />

          <View style={s.storyEditorTop}>
            <TouchableOpacity onPress={() => setShowCameraModal(false)}>
              <Text style={{ color: "#fff", fontSize: 26 }}>✕</Text>
            </TouchableOpacity>
            <View style={s.cameraModeBadge}>
              <Text style={{ color: "#38bdf8", fontWeight: "900", fontSize: 12 }}>
                📷 LIVE {cameraTarget === "story" ? "STORY" : "FEED / REEL"} CAMERA
              </Text>
            </View>
            <TouchableOpacity onPress={() => setFlashOn(!flashOn)}>
              <Text style={{ color: flashOn ? "#facc15" : "#fff", fontSize: 22 }}>⚡</Text>
            </TouchableOpacity>
          </View>

          <View style={{ position: "absolute", top: 95, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14 }}>
            <Text style={{ color: "#facc15", fontWeight: "800", fontSize: 13 }}>Filter: {activeCameraFilter.name}</Text>
          </View>

          <View style={{ position: "absolute", bottom: 115, left: 0, right: 0 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 14 }}>
              {ALL_FILTERS.map((flt) => (
                <TouchableOpacity
                  key={flt.id}
                  style={[s.filterBubble, activeCameraFilter.id === flt.id && s.filterBubbleActive]}
                  onPress={() => setActiveCameraFilter(flt)}
                >
                  <Text style={s.filterBubbleTxt}>{flt.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={s.cameraBottomBar}>
            <TouchableOpacity
              style={s.camSideBtn}
              onPress={() => (cameraTarget === "story" ? pickStoryGallery() : pickGalleryMedia())}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>🖼️ Gallery</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.shutterOuter}
              onPress={() =>
                handleCapturedPhoto(
                  isFrontCamera
                    ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800"
                    : "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800"
                )
              }
            >
              <View style={s.shutterInner} />
            </TouchableOpacity>

            <TouchableOpacity style={s.camSideBtn} onPress={() => setIsFrontCamera(!isFrontCamera)}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>🔄 Flip</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={s.deviceCamLink} onPress={triggerDeviceHardwareCamera}>
            <Text style={{ color: "#38bdf8", fontSize: 12, fontWeight: "700" }}>📱 Open Device Hardware Camera</Text>
          </TouchableOpacity>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* ================= MODAL 2: FOLLOWERS & FOLLOWING WITH SEARCH BAR ================= */}
      {/* ========================================================================= */}
      <Modal visible={showFollowModal} animationType="slide" transparent={false}>
        <View style={s.modalInnerDark}>
          <View style={s.publishTopBar}>
            <TouchableOpacity onPress={() => setShowFollowModal(false)}><Text style={{ color: "#fff", fontSize: 22 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>itsanandgupta</Text>
            <View style={{ width: 22 }} />
          </View>

          <View style={s.followToggleRow}>
            <TouchableOpacity
              style={[s.followToggleTab, followModalTab === "followers" && s.followToggleActive]}
              onPress={() => setFollowModalTab("followers")}
            >
              <Text style={[s.followToggleTxt, followModalTab === "followers" && { color: "#fff" }]}>14.4K Followers</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.followToggleTab, followModalTab === "following" && s.followToggleActive]}
              onPress={() => setFollowModalTab("following")}
            >
              <Text style={[s.followToggleTxt, followModalTab === "following" && { color: "#fff" }]}>268 Following</Text>
            </TouchableOpacity>
          </View>

          <View style={s.followSearchRow}>
            <Text style={{ color: "#38bdf8", marginRight: 8 }}>🔍</Text>
            <TextInput
              placeholder={`Search in ${followModalTab}...`}
              placeholderTextColor="#71717a"
              style={{ flex: 1, color: "#fff", fontSize: 14 }}
              value={followSearch}
              onChangeText={setFollowSearch}
            />
            {followSearch.length > 0 && (
              <TouchableOpacity onPress={() => setFollowSearch("")}>
                <Text style={{ color: "#71717a", fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            {followersList
              .filter(
                (u) =>
                  u.name.toLowerCase().includes(followSearch.toLowerCase()) ||
                  u.handle.toLowerCase().includes(followSearch.toLowerCase())
              )
              .map((u) => (
                <View key={u.id} style={s.followerItemRow}>
                  <Image source={{ uri: u.avatar }} style={s.followerAvatar} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>@{u.handle}</Text>
                    <Text style={{ color: "#71717a", fontSize: 12 }}>{u.name}</Text>
                  </View>
                  <TouchableOpacity
                    style={[s.followActionButton, u.following && { backgroundColor: "rgba(255,255,255,0.15)" }]}
                    onPress={() =>
                      setFollowersList((prev) =>
                        prev.map((f) => (f.id === u.id ? { ...f, following: !f.following } : f))
                      )
                    }
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>
                      {u.following ? "Following" : "Follow"}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* ================= MODAL 3: ALL 24+ INDIAN REGIONAL LANGUAGES ================= */}
      {/* ========================================================================= */}
      <Modal visible={showLangModal} animationType="fade" transparent={true}>
        <View style={s.modalDimMaskCenter}>
          <View style={s.professionDialog}>
            <Text style={{ color: "#facc15", fontWeight: "900", fontSize: 17, marginBottom: 4 }}>
              🇮🇳 भारत की सभी 24+ भाषाएं (All Regional Languages)
            </Text>
            <TextInput
              placeholder="Search language (e.g. Bhojpuri, Maithili, Tamil, Marathi)..."
              placeholderTextColor="#71717a"
              style={[s.viewerSearchInput, { marginVertical: 8 }]}
              value={langSearchQuery}
              onChangeText={setLangSearchQuery}
            />
            <ScrollView style={{ maxHeight: 330 }}>
              {Object.keys(REGIONAL_LANGUAGES)
                .filter((k) => REGIONAL_LANGUAGES[k].label.toLowerCase().includes(langSearchQuery.toLowerCase()))
                .map((key) => (
                  <TouchableOpacity
                    key={key}
                    style={s.professionItem}
                    onPress={() => {
                      setRegionalLang(key);
                      setIsSeniorMode(true);
                      setShowLangModal(false);
                      speakAloudReal(REGIONAL_LANGUAGES[key].greeting);
                    }}
                  >
                    <Text style={{ color: regionalLang === key ? "#facc15" : "#fff", fontSize: 15, fontWeight: "700" }}>
                      {REGIONAL_LANGUAGES[key].label}
                    </Text>
                    {regionalLang === key && <Text style={{ color: "#facc15", fontSize: 16 }}>✓</Text>}
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity style={[s.doneBtn, { marginTop: 12 }]} onPress={() => setShowLangModal(false)}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 4: DIRECT UPI SUPER-TIPPING ================= */}
      <Modal visible={!!tipTargetAuthor} animationType="fade" transparent={true}>
        <View style={s.modalDimMaskCenter}>
          <View style={s.newFolderDialog}>
            <Text style={{ color: "#facc15", fontWeight: "900", fontSize: 17 }}>⚡ Support @{tipTargetAuthor}</Text>
            <Text style={{ color: "#a1a1aa", fontSize: 12, marginTop: 4 }}>100% Direct UPI Transfer (0% Commission)</Text>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginVertical: 14 }}>
              {["10", "50", "100", "500"].map((amt) => (
                <TouchableOpacity
                  key={amt}
                  style={[s.tipAmtPill, selectedTipAmount === amt && { backgroundColor: "#facc15" }]}
                  onPress={() => setSelectedTipAmount(amt)}
                >
                  <Text style={{ color: selectedTipAmount === amt ? "#000" : "#fff", fontWeight: "800" }}>₹{amt}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 14 }}>
              <TouchableOpacity onPress={() => setTipTargetAuthor(null)}><Text style={{ color: "#94a3b8" }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={triggerRealUPITransfer}>
                <Text style={{ color: "#22c55e", fontWeight: "900" }}>Open UPI App & Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 5: STORY CREATOR WITH 12 FILTERS & FULL SIDE TOOLS ================= */}
      <Modal visible={showStoryEditor} animationType="slide" transparent={false}>
        <View style={s.storyEditorCanvas}>
          <Image source={{ uri: storyImage || "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800" }} style={s.storyFullMedia} />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: activeStoryFilter.overlay }]} pointerEvents="none" />

          <View style={s.storyEditorTop}>
            <TouchableOpacity onPress={() => setShowStoryEditor(false)}><Text style={{ color: "#fff", fontSize: 24 }}>←</Text></TouchableOpacity>
            <TouchableOpacity
              style={[s.spotlightPill, isSpotlightPushed && { backgroundColor: "#0284c7" }]}
              onPress={() => {
                const next = !isSpotlightPushed;
                setIsSpotlightPushed(next);
                Alert.alert("Secret Spotlight Push", next ? "Story will secretly be boosted to non-followers!" : "Normal reach active.");
              }}
            >
              <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                {isSpotlightPushed ? "✨ Spotlight PUSH Active" : "✨ Spotlight"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={s.storySideToolsBar}>
            <TouchableOpacity style={s.storyToolIcon} onPress={() => openCameraStudio("story")}><Text style={s.toolEmoji}>📷</Text><Text style={s.toolLabel}>Camera</Text></TouchableOpacity>
            <TouchableOpacity style={s.storyToolIcon} onPress={() => Alert.alert("Text", "Add typography overlay")}><Text style={s.toolEmoji}>Aa</Text><Text style={s.toolLabel}>Text</Text></TouchableOpacity>
            <TouchableOpacity style={s.storyToolIcon} onPress={() => Alert.alert("Stickers", "Open sticker drawer")}><Text style={s.toolEmoji}>😀</Text><Text style={s.toolLabel}>Stickers</Text></TouchableOpacity>
            <TouchableOpacity style={s.storyToolIcon} onPress={() => setShowMusicPicker(true)}><Text style={s.toolEmoji}>🎵</Text><Text style={s.toolLabel}>Music</Text></TouchableOpacity>
            <TouchableOpacity style={s.storyToolIcon} onPress={() => setStoryAudienceSheet(true)}><Text style={s.toolEmoji}>🤫</Text><Text style={s.toolLabel}>1-Person</Text></TouchableOpacity>
            <TouchableOpacity style={s.storyToolIcon} onPress={() => Alert.alert("Draw", "Freehand sketching mode")}><Text style={s.toolEmoji}>〰️</Text><Text style={s.toolLabel}>Draw</Text></TouchableOpacity>
            <TouchableOpacity style={s.storyToolIcon} onPress={() => Alert.alert("Saved", "Downloaded to device gallery")}><Text style={s.toolEmoji}>↓</Text><Text style={s.toolLabel}>Save</Text></TouchableOpacity>
            <TouchableOpacity style={s.storyToolIcon} onPress={() => Alert.alert("AI", "Label AI metadata applied")}><Text style={s.toolEmoji}>✨</Text><Text style={s.toolLabel}>Label AI</Text></TouchableOpacity>
          </View>

          <View style={s.storyFilterTrayContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filtersScroll}>
              {ALL_FILTERS.map((flt) => (
                <TouchableOpacity
                  key={flt.id}
                  style={[s.filterBubble, activeStoryFilter.id === flt.id && s.filterBubbleActive]}
                  onPress={() => setActiveStoryFilter(flt)}
                >
                  <Text style={s.filterBubbleTxt}>{flt.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={s.storyEditorBottomBar}>
            <TouchableOpacity style={s.storyAudienceBtn} onPress={() => setStoryAudienceSheet(true)}>
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
                {storyAudience === "Secret Special Person" ? `🤫 Only @${secretSpecialPerson || "Special"}` : storyAudience}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.storyNextRoundBtn} onPress={handlePublishStory}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>➔</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 6: STORY VIEWERS WITH SEARCH & +24H EXTENSION ================= */}
      <Modal visible={showStoryViewers} animationType="slide" transparent={true}>
        <View style={s.modalDimMask}>
          <View style={s.viewersDrawer}>
            <View style={s.sheetGrabber} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 8 }}>
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>👁 59 Views • Active</Text>
              <TouchableOpacity onPress={handleExtendStory} style={s.extendStoryBtn}>
                <Text style={{ color: "#38bdf8", fontWeight: "bold", fontSize: 12 }}>+24h Extend ⏳</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowStoryViewers(false)}><Text style={{ color: "rgba(255,255,255,0.6)" }}>✕</Text></TouchableOpacity>
            </View>

            <TextInput
              placeholder="Search viewers by name..."
              placeholderTextColor="#71717a"
              style={s.viewerSearchInput}
              value={storyViewerSearch}
              onChangeText={setStoryViewerSearch}
            />

            <ScrollView style={{ flex: 1, marginTop: 10 }}>
              {STORY_VIEWERS_DATA
                .filter((v) => v.name.toLowerCase().includes(storyViewerSearch.toLowerCase()) || v.user.toLowerCase().includes(storyViewerSearch.toLowerCase()))
                .map((vw) => (
                  <View key={vw.id} style={s.viewerRow}>
                    <Image source={{ uri: vw.avatar }} style={s.viewerAvatar} />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{vw.user}</Text>
                      <Text style={{ color: "#71717a", fontSize: 11 }}>{vw.name} • {vw.time}</Text>
                    </View>
                    {vw.liked && <Text style={{ color: "#ff2d55", fontSize: 16 }}>❤️</Text>}
                  </View>
                ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 7: PROFESSION PICKER ================= */}
      <Modal visible={showProfessionPicker} animationType="fade" transparent={true}>
        <View style={s.modalDimMaskCenter}>
          <View style={s.professionDialog}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16, marginBottom: 12 }}>Choose Your Profession</Text>
            {PROFESSIONS.map((p) => (
              <TouchableOpacity
                key={p}
                style={s.professionItem}
                onPress={() => {
                  setUserProfession(p);
                  setShowProfessionPicker(false);
                }}
              >
                <Text style={{ color: userProfession === p ? "#38bdf8" : "#fff", fontSize: 14 }}>{p}</Text>
                {userProfession === p && <Text style={{ color: "#38bdf8" }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 8: ADVANCED POST / FEED PUBLISH ================= */}
      <Modal visible={showAdvancedPublish} animationType="slide" transparent={false}>
        <View style={s.publishScreenContainer}>
          <View style={s.publishTopBar}>
            <TouchableOpacity onPress={() => setShowAdvancedPublish(false)}>
              <Text style={{ color: "#fff", fontSize: 24 }}>←</Text>
            </TouchableOpacity>
            <Text style={s.publishHeaderTitle}>New Creation</Text>
            <TouchableOpacity onPress={() => openCameraStudio("post")}>
              <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 14 }}>📷 Camera</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
            <View style={s.createModeToggle}>
              <TouchableOpacity
                style={[s.modePill, createType === "media" && mediaSubType === "feedVideo" && s.modePillActive]}
                onPress={() => {
                  setCreateType("media");
                  setMediaSubType("feedVideo");
                }}
              >
                <Text style={[s.modePillTxt, createType === "media" && mediaSubType === "feedVideo" && { color: "#fff" }]}>📰 Feed (Reel)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modePill, createType === "media" && mediaSubType === "photo" && s.modePillActive]}
                onPress={() => {
                  setCreateType("media");
                  setMediaSubType("photo");
                }}
              >
                <Text style={[s.modePillTxt, createType === "media" && mediaSubType === "photo" && { color: "#fff" }]}>📷 Photo Post</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modePill, createType === "tweet" && s.modePillActive]}
                onPress={() => setCreateType("tweet")}
              >
                <Text style={[s.modePillTxt, createType === "tweet" && { color: "#fff" }]}>💬 Tweet</Text>
              </TouchableOpacity>
            </View>

            {createType === "tweet" ? (
              <TextInput
                placeholder="What's happening? Share a thought, quote or tweet with #hashtags..."
                placeholderTextColor="#71717a"
                style={s.thoughtInputArea}
                multiline
                value={newTweetText}
                onChangeText={setNewTweetText}
              />
            ) : (
              <View>
                <View style={s.previewCardArea}>
                  <View style={s.previewMediaWrapper}>
                    <Image source={{ uri: publishImage }} style={s.previewMediaImage} />
                    <View style={[StyleSheet.absoluteFillObject, { backgroundColor: activePostFilter.overlay }]} pointerEvents="none" />
                    <View style={s.previewPillTop}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>{activePostFilter.name}</Text></View>
                    <TouchableOpacity onPress={pickGalleryMedia} style={s.editCoverBtn}>
                      <Text style={{ color: "#fff", fontSize: 11, fontWeight: "bold" }}>Gallery / Cover</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                  {ALL_FILTERS.map((flt) => (
                    <TouchableOpacity
                      key={flt.id}
                      style={[s.filterBubble, activePostFilter.id === flt.id && s.filterBubbleActive]}
                      onPress={() => setActivePostFilter(flt)}
                    >
                      <Text style={s.filterBubbleTxt}>{flt.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={s.aiPredictorBanner}>
                  <Text style={{ color: "#22c55e", fontWeight: "900", fontSize: 13 }}>🤖 AI Viral Potential: {aiViralScore}% 🔥</Text>
                  <TouchableOpacity onPress={() => setPublishCaption((prev) => prev + " #TaazaFeed #ViralVibes #DelhiCreators")}>
                    <Text style={{ color: "#38bdf8", fontSize: 12, fontWeight: "700" }}>+ Auto-Hook & Tags</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  placeholder="Write a caption... #maadurga #navratri"
                  placeholderTextColor="#71717a"
                  style={s.publishCaptionInput}
                  multiline
                  value={publishCaption}
                  onChangeText={setPublishCaption}
                />

                <View style={s.publishChipsRow}>
                  <TouchableOpacity style={s.publishChip} onPress={() => Alert.alert("Poll Added", "Poll sticker is live on this post!")}>
                    <Text style={{ color: "#cbd5e1", fontSize: 13, fontWeight: "600" }}>📊 Poll</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.publishChip} onPress={() => Alert.alert("Prompt Added", "Question prompt added!")}>
                    <Text style={{ color: "#cbd5e1", fontSize: 13, fontWeight: "600" }}>💬 Prompt</Text>
                  </TouchableOpacity>
                </View>

                <View style={s.thinDivider} />

                <TouchableOpacity style={s.publishOptionRow} onPress={() => Alert.alert("Tag People", "Tag collaborators or friends")}>
                  <Text style={s.publishOptionIcon}>👥</Text>
                  <Text style={s.publishOptionTitle}>Tag people</Text>
                  <Text style={s.publishArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.publishOptionRow} onPress={() => setShowProductModal(true)}>
                  <Text style={s.publishOptionIcon}>🛍️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.publishOptionTitle}>Add products</Text>
                    <Text style={{ color: "#71717a", fontSize: 11 }}>{selectedProduct ? `Tagged: ${selectedProduct}` : "Tag products to sell"}</Text>
                  </View>
                  <Text style={s.publishArrow}>›</Text>
                </TouchableOpacity>

                <View style={s.publishOptionRow}>
                  <Text style={[s.publishOptionIcon, { color: "#38bdf8" }]}>📍</Text>
                  <TextInput
                    placeholder="Add location (e.g. Delhi, India)..."
                    placeholderTextColor="#71717a"
                    style={{ flex: 1, color: "#fff", fontSize: 14 }}
                    value={publishLocation}
                    onChangeText={setPublishLocation}
                  />
                  {publishLocation.length > 0 && (
                    <TouchableOpacity onPress={() => setPublishLocation("")}>
                      <Text style={{ color: "#71717a", fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={s.thinDivider} />

                <View style={s.publishOptionRow}>
                  <Text style={s.publishOptionIcon}>📰</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.publishOptionTitle}>Also share to feed</Text>
                    <Text style={{ color: "#71717a", fontSize: 11 }}>Show post in main feed stream.</Text>
                  </View>
                  <Switch value={alsoShareToFeed} onValueChange={setAlsoShareToFeed} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
                </View>

                <TouchableOpacity style={s.publishOptionRow} onPress={() => setShowAddLinkModal(true)}>
                  <Text style={s.publishOptionIcon}>🔗</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.publishOptionTitle}>Add link</Text>
                    <Text style={{ color: "#71717a", fontSize: 11 }}>{attachedUrl ? attachedUrl : "TaazaFeed Pro • 4 links left"}</Text>
                  </View>
                  <Text style={s.publishArrow}>›</Text>
                </TouchableOpacity>

                <View style={s.publishOptionRow}>
                  <Text style={s.publishOptionIcon}>⏰</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.publishOptionTitle}>Schedule this post</Text>
                    <Text style={{ color: "#71717a", fontSize: 11 }}>Auto-publish at peak time</Text>
                  </View>
                  <Switch value={scheduleEnabled} onValueChange={setScheduleEnabled} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
                </View>

                <View style={s.publishOptionRow}>
                  <Text style={s.publishOptionIcon}>📋</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.publishOptionTitle}>Share as template</Text>
                    <Text style={{ color: "#71717a", fontSize: 11 }}>Let anyone use your post as a template.</Text>
                  </View>
                  <Switch value={shareAsTemplate} onValueChange={setShareAsTemplate} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
                </View>

                <TouchableOpacity
                  style={s.publishOptionRow}
                  onPress={() => Alert.alert("Rename Audio", "Audio track locked as: " + audioName)}
                >
                  <Text style={s.publishOptionIcon}>🎵</Text>
                  <Text style={s.publishOptionTitle}>Rename audio</Text>
                  <Text style={{ color: "#94a3b8", fontSize: 12, marginRight: 6 }}>{audioName}</Text>
                  <Text style={s.publishArrow}>›</Text>
                </TouchableOpacity>

                <View style={s.publishOptionRow}>
                  <Text style={s.publishOptionIcon}>✨</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={s.publishOptionTitle}>Add AI label</Text>
                    <Text style={{ color: "#71717a", fontSize: 11 }}>Required for realistic photos and videos made with AI.</Text>
                  </View>
                  <Switch value={addAILabel} onValueChange={setAddAILabel} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
                </View>

                <TouchableOpacity style={s.publishOptionRow} onPress={() => setShowAudienceModal(true)}>
                  <Text style={s.publishOptionIcon}>👁️</Text>
                  <Text style={s.publishOptionTitle}>Audience</Text>
                  <Text style={{ color: "#38bdf8", fontSize: 13, marginRight: 6, fontWeight: "bold" }}>{reelAudience}</Text>
                  <Text style={s.publishArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={s.publishOptionRow} onPress={() => setShowMoreOptionsModal(true)}>
                  <Text style={s.publishOptionIcon}>⚙️</Text>
                  <Text style={s.publishOptionTitle}>More options</Text>
                  <Text style={s.publishArrow}>›</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={s.publishBottomBarFixed}>
            <View style={s.publishBtnDualRow}>
              <TouchableOpacity style={s.saveDraftBtn} onPress={() => { setShowAdvancedPublish(false); Alert.alert("Draft Saved! 💾"); }}>
                <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>Save draft</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shareGradientBtn} onPress={handleFinalPublish}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{createType === "tweet" ? "Post Tweet 💬" : "Share"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 9: AUDIENCE SELECTOR WITH "TRIAL" MODE ================= */}
      <Modal visible={showAudienceModal} animationType="slide" transparent={false}>
        <View style={s.modalInnerDark}>
          <View style={s.publishTopBar}>
            <TouchableOpacity onPress={() => setShowAudienceModal(false)}><Text style={{ color: "#fff", fontSize: 24 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Audience</Text>
            <View style={{ width: 24 }} />
          </View>

          <View style={{ padding: 16 }}>
            <Text style={{ color: "#cbd5e1", fontSize: 15, fontWeight: "700", marginBottom: 14 }}>Who can see your post</Text>

            <TouchableOpacity style={s.audienceSelectRow} onPress={() => { setReelAudience("Trial"); setShowAudienceModal(false); }}>
              <View style={[s.starIconCircle, { backgroundColor: "#f59e0b", marginRight: 12 }]}><Text style={{ fontSize: 14 }}>🧪</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>Trial Mode</Text>
                <Text style={{ color: "#71717a", fontSize: 12 }}>Test performance with non-followers first before main feed.</Text>
              </View>
              <Text style={{ color: reelAudience === "Trial" ? "#0095f6" : "#71717a", fontSize: 20 }}>{reelAudience === "Trial" ? "●" : "○"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.audienceSelectRow} onPress={() => { setReelAudience("Everyone"); setShowAudienceModal(false); }}>
              <Text style={{ fontSize: 20, marginRight: 12 }}>👥</Text>
              <Text style={{ color: "#fff", fontSize: 15, flex: 1 }}>Everyone (Public & Family)</Text>
              <Text style={{ color: reelAudience === "Everyone" ? "#0095f6" : "#71717a", fontSize: 20 }}>{reelAudience === "Everyone" ? "●" : "○"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.audienceSelectRow} onPress={() => { setReelAudience("Close Friends"); setShowAudienceModal(false); }}>
              <View style={[s.starIconCircle, { backgroundColor: "#22c55e", marginRight: 12 }]}><Text style={{ fontSize: 14 }}>⭐</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 15 }}>Close Friends & Family Circle</Text>
                <Text style={{ color: "#71717a", fontSize: 12 }}>14 people ›</Text>
              </View>
              <Text style={{ color: reelAudience === "Close Friends" ? "#0095f6" : "#71717a", fontSize: 20 }}>{reelAudience === "Close Friends" ? "●" : "○"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.audienceSelectRow} onPress={() => { setReelAudience("Subscribers"); setShowAudienceModal(false); }}>
              <View style={[s.starIconCircle, { backgroundColor: "#8b5cf6", marginRight: 12 }]}><Text style={{ fontSize: 14 }}>👑</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 15, flex: 1 }}>Subscribers</Text>
              </View>
              <Text style={{ color: reelAudience === "Subscribers" ? "#0095f6" : "#71717a", fontSize: 20 }}>{reelAudience === "Subscribers" ? "●" : "○"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 10: MORE OPTIONS ================= */}
      <Modal visible={showMoreOptionsModal} animationType="slide" transparent={false}>
        <View style={s.modalInnerDark}>
          <View style={s.publishTopBar}>
            <TouchableOpacity onPress={() => setShowMoreOptionsModal(false)}><Text style={{ color: "#fff", fontSize: 24 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>More options</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            <TouchableOpacity style={s.publishOptionRow} onPress={() => Alert.alert("Reminder", "Schedule notification reminder")}>
              <Text style={s.publishOptionIcon}>📅</Text>
              <Text style={s.publishOptionTitle}>Add reminder</Text>
              <Text style={s.publishArrow}>›</Text>
            </TouchableOpacity>

            <Text style={s.moreSectionHeading}>Ads and monetization</Text>
            <TouchableOpacity style={s.publishOptionRow} onPress={() => Alert.alert("Branded Content", "Add sponsored partnership tag")}>
              <Text style={s.publishOptionIcon}>🤝</Text>
              <Text style={s.publishOptionTitle}>Content & ad labels</Text>
              <Text style={s.publishArrow}>›</Text>
            </TouchableOpacity>

            <View style={s.publishOptionRow}>
              <Text style={s.publishOptionIcon}>🎁</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.publishOptionTitle}>Allow gifts & UPI tips</Text>
                <Text style={{ color: "#71717a", fontSize: 11 }}>Turn on viewer tipping and digital badges.</Text>
              </View>
              <Switch value={allowGifts} onValueChange={setAllowGifts} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
            </View>

            <Text style={s.moreSectionHeading}>Accessibility and AI translation</Text>
            <View style={s.publishOptionRow}>
              <Text style={s.publishOptionIcon}>🌐</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.publishOptionTitle}>AI Voice Dubbing & Translate</Text>
                <Text style={{ color: "#71717a", fontSize: 11 }}>Auto-dubbing in viewer's native language.</Text>
              </View>
              <Switch value={translateReel} onValueChange={setTranslateReel} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
            </View>

            <Text style={s.moreSectionHeading}>How others can interact</Text>
            <View style={s.publishOptionRow}>
              <Text style={s.publishOptionIcon}>👤</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.publishOptionTitle}>Request original credit</Text>
                <Text style={{ color: "#71717a", fontSize: 11 }}>Add 'Original by itsanandgupta' label on remixes.</Text>
              </View>
              <Switch value={requestOriginalCredit} onValueChange={setRequestOriginalCredit} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
            </View>

            <View style={s.publishOptionRow}>
              <Text style={s.publishOptionIcon}>🤍</Text>
              <Text style={s.publishOptionTitle}>Hide like count on this post</Text>
              <Switch value={hideLikeCount} onValueChange={setHideLikeCount} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
            </View>

            <View style={s.publishOptionRow}>
              <Text style={s.publishOptionIcon}>✈</Text>
              <Text style={s.publishOptionTitle}>Hide share count on this post</Text>
              <Switch value={hideShareCount} onValueChange={setHideShareCount} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
            </View>

            <View style={s.publishOptionRow}>
              <Text style={s.publishOptionIcon}>📥</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.publishOptionTitle}>Allow people to download</Text>
                <Text style={{ color: "#71717a", fontSize: 11 }}>Anyone can download public video to gallery.</Text>
              </View>
              <Switch value={allowDownload} onValueChange={setAllowDownload} trackColor={{ false: "#27272a", true: "#0284c7" }} thumbColor="#fff" />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ================= MODAL 11: ADD LINK ================= */}
      <Modal visible={showAddLinkModal} animationType="slide" transparent={false}>
        <View style={s.modalInnerDark}>
          <View style={s.publishTopBar}>
            <TouchableOpacity onPress={() => setShowAddLinkModal(false)}><Text style={{ color: "#fff", fontSize: 24 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Add link</Text>
            <TouchableOpacity onPress={() => setShowAddLinkModal(false)}>
              <Text style={{ color: "#38bdf8", fontWeight: "bold", fontSize: 16 }}>Done</Text>
            </TouchableOpacity>
          </View>
          <View style={{ padding: 16 }}>
            <TextInput
              placeholder="https://yourstore.com"
              placeholderTextColor="#71717a"
              style={s.urlInputField}
              value={attachedUrl}
              onChangeText={setAttachedUrl}
              autoCapitalize="none"
            />
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 12: ADD PRODUCTS ================= */}
      <Modal visible={showProductModal} animationType="slide" transparent={false}>
        <View style={s.modalInnerDark}>
          <View style={s.publishTopBar}>
            <TouchableOpacity onPress={() => setShowProductModal(false)}><Text style={{ color: "#fff", fontSize: 24 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Tag Products</Text>
            <View style={{ width: 24 }} />
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {SHOP_PRODUCTS.map((prod) => (
              <TouchableOpacity
                key={prod.id}
                style={[s.productCardRow, selectedProduct === prod.title && s.productCardRowActive]}
                onPress={() => {
                  setSelectedProduct(prod.title);
                  setShowProductModal(false);
                }}
              >
                <Image source={{ uri: prod.img }} style={s.productThumb} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: "#fff", fontWeight: "700", fontSize: 14 }}>{prod.title}</Text>
                  <Text style={{ color: "#22c55e", fontSize: 13, fontWeight: "bold" }}>{prod.price}</Text>
                </View>
                <Text style={{ color: selectedProduct === prod.title ? "#38bdf8" : "#71717a" }}>{selectedProduct === prod.title ? "✓" : "+"}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ========================================================================= */}
      {/* ================= MODAL 13: STORY SHARE SHEET (WITH SECRET 1-PERSON STEALTH) ================= */}
      {/* ========================================================================= */}
      <Modal visible={storyAudienceSheet} animationType="slide" transparent={true}>
        <View style={s.modalDimMask}>
          <View style={s.audienceBottomSheet}>
            <View style={s.sheetGrabber} />
            <Text style={s.shareTitle}>Share Story</Text>

            <TouchableOpacity style={s.audienceOptionRow} onPress={() => setStoryAudience("Your story")}>
              <Image source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" }} style={s.audAvatar} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Your story</Text>
                <Text style={{ color: "#71717a", fontSize: 12 }}>TaazaFeed Public Story</Text>
              </View>
              <Text style={{ color: storyAudience === "Your story" ? "#0095f6" : "#71717a", fontSize: 20 }}>{storyAudience === "Your story" ? "●" : "○"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.audienceOptionRow} onPress={() => setStoryAudience("Close Friends")}>
              <View style={[s.starIconCircle, { backgroundColor: "#22c55e" }]}><Text style={{ fontSize: 14 }}>⭐</Text></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Close Friends & Family</Text>
                <Text style={{ color: "#71717a", fontSize: 12 }}>Only specific family & friends</Text>
              </View>
              <Text style={{ color: storyAudience === "Close Friends" ? "#0095f6" : "#71717a", fontSize: 20 }}>{storyAudience === "Close Friends" ? "●" : "○"}</Text>
            </TouchableOpacity>

            {/* SECRET 1-PERSON STEALTH STORY FEATURE */}
            <TouchableOpacity style={s.audienceOptionRow} onPress={() => setStoryAudience("Secret Special Person")}>
              <View style={[s.starIconCircle, { backgroundColor: "#ec4899" }]}><Text style={{ fontSize: 16 }}>🤫</Text></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "#f472b6", fontWeight: "800" }}>Custom Special Person (Stealth Mode)</Text>
                <Text style={{ color: "#a1a1aa", fontSize: 11 }}>
                  Only 1 person will see this story, but it looks like a normal public story so they never know!
                </Text>
              </View>
              <Text style={{ color: storyAudience === "Secret Special Person" ? "#ec4899" : "#71717a", fontSize: 20 }}>
                {storyAudience === "Secret Special Person" ? "●" : "○"}
              </Text>
            </TouchableOpacity>

            {storyAudience === "Secret Special Person" && (
              <TextInput
                placeholder="Enter special person's @username (e.g. priya_art)..."
                placeholderTextColor="#71717a"
                style={[s.viewerSearchInput, { marginTop: 10, borderColor: "#ec4899", borderWidth: 1 }]}
                value={secretSpecialPerson}
                onChangeText={setSecretSpecialPerson}
                autoCapitalize="none"
              />
            )}

            <TouchableOpacity style={s.shareConfirmBtn} onPress={handlePublishStory}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Share Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 14: MUSIC PICKER ================= */}
      <Modal visible={showMusicPicker} animationType="slide" transparent={true}>
        <View style={s.modalDimMask}>
          <View style={s.musicSheet}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Select Soundtrack (Tap to Preview 🎵)</Text>
              <TouchableOpacity onPress={() => setShowMusicPicker(false)}><Text style={{ color: "#94a3b8" }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 280 }}>
              {MUSIC_LIBRARY.map((m) => (
                <View key={m.id} style={s.musicRow}>
                  <TouchableOpacity onPress={() => togglePlayRealAudio(m.title, m.url)}>
                    <Text style={{ fontSize: 22, marginRight: 12 }}>{playingTrackTitle === m.title ? "⏸" : "▶️"}</Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: "#fff", fontWeight: "700" }}>{m.title}</Text>
                    <Text style={{ color: "#71717a", fontSize: 12 }}>{m.artist} ({m.duration})</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedStoryMusic(`${m.title} • ${m.artist}`);
                      setShowMusicPicker(false);
                    }}
                  >
                    <Text style={{ color: "#38bdf8", fontWeight: "800" }}>Use</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 15: INBOX WITH FLOATING NOTES ================= */}
      <Modal visible={showInboxModal} animationType="slide" transparent={false}>
        <View style={s.inboxScreen}>
          <View style={s.inboxTopBar}>
            <TouchableOpacity onPress={() => setShowInboxModal(false)}><Text style={{ color: "#fff", fontSize: 22 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>itsanandgupta ⌄</Text>
            <TouchableOpacity onPress={() => setShowNewMsgModal(true)}><Text style={{ color: "#fff", fontSize: 20 }}>✏️</Text></TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.notesBarRow}>
            {INITIAL_NOTES.map((n) => (
              <View key={n.id} style={s.noteItem}>
                <View style={s.noteBubble}>
                  {n.music && <Text style={{ color: "#38bdf8", fontSize: 8 }}>॥ {n.music}</Text>}
                  <Text style={{ color: "#fff", fontSize: 9 }}>{n.text}</Text>
                </View>
                <Image source={{ uri: n.avatar }} style={s.noteAvatar} />
                <Text style={s.noteUser}>{n.user}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={s.inboxPillsRow}>
            {["primary", "requests", "general"].map((cat) => (
              <TouchableOpacity key={cat} style={[s.inboxPill, inboxCategory === cat && s.inboxPillActive]} onPress={() => setInboxCategory(cat)}>
                <Text style={[s.inboxPillTxt, inboxCategory === cat && { color: "#fff" }]}>{cat.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView style={{ flex: 1 }}>
            {INBOX_THREADS.filter((th) => th.category === inboxCategory).map((th) => (
              <TouchableOpacity key={th.id} style={s.threadItem} onPress={() => setActiveChat(th)}>
                <Image source={{ uri: th.avatar }} style={s.threadAvatar} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>{th.name}</Text>
                  <Text style={{ color: "#71717a", fontSize: 12 }}>{th.status}</Text>
                </View>
                {th.unread && <View style={s.unreadDot} />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ================= MODAL 16: NEW MESSAGE DRAWER ================= */}
      <Modal visible={showNewMsgModal} animationType="slide" transparent={false}>
        <View style={s.inboxScreen}>
          <View style={s.inboxTopBar}>
            <TouchableOpacity onPress={() => setShowNewMsgModal(false)}><Text style={{ color: "#fff", fontSize: 22 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>New message</Text>
            <View style={{ width: 22 }} />
          </View>

          <View style={{ flexDirection: "row", paddingHorizontal: 16, borderBottomWidth: 0.5, borderBottomColor: "#27272a", paddingVertical: 10 }}>
            <Text style={{ color: "#a1a1aa", marginRight: 8 }}>To:</Text>
            <TextInput placeholder="Search..." placeholderTextColor="#71717a" style={{ flex: 1, color: "#fff" }} value={newMsgSearch} onChangeText={setNewMsgSearch} />
          </View>

          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            <TouchableOpacity style={s.newActionRow} onPress={() => Alert.alert("Group Chat", "Create group workflow")}>
              <View style={s.newActionIcon}><Text style={{ fontSize: 18 }}>👥</Text></View>
              <Text style={s.newActionTxt}>Group chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.newActionRow} onPress={() => Alert.alert("Broadcast", "Create broadcast channel")}>
              <View style={s.newActionIcon}><Text style={{ fontSize: 18 }}>📢</Text></View>
              <Text style={s.newActionTxt}>Create a channel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.newActionRow} onPress={() => Alert.alert("AI Twin", "TaazaFeed 24x7 AI Digital Twin ready")}>
              <View style={s.newActionIcon}><Text style={{ fontSize: 18 }}>🤖</Text></View>
              <Text style={s.newActionTxt}>AI Digital Twin Chat</Text>
            </TouchableOpacity>

            <Text style={{ color: "#fff", fontWeight: "700", marginTop: 14, marginBottom: 8 }}>Suggested</Text>
            {INBOX_THREADS.map((ct) => (
              <TouchableOpacity key={ct.id} style={{ flexDirection: "row", alignItems: "center", paddingVertical: 10 }} onPress={() => { setShowNewMsgModal(false); setActiveChat(ct); }}>
                <Image source={{ uri: ct.avatar }} style={{ width: 44, height: 44, borderRadius: 22 }} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ color: "#fff", fontWeight: "600" }}>{ct.name}</Text>
                  <Text style={{ color: "#71717a", fontSize: 12 }}>@{ct.tag}</Text>
                </View>
                <Text style={{ color: "#71717a" }}>✕</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ================= MODAL 17: CHAT CONVERSATION ================= */}
      <Modal visible={!!activeChat} animationType="slide" transparent={false}>
        <View style={s.inboxScreen}>
          <View style={s.inboxTopBar}>
            <TouchableOpacity onPress={() => setActiveChat(null)}><Text style={{ color: "#fff", fontSize: 22 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontWeight: "700" }}>@{activeChat?.tag}</Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => Alert.alert("🍿 Watch Party Started!", "You and @" + activeChat?.tag + " can now scroll Feed videos & listen to music together!")}>
                <Text style={{ fontSize: 18 }}>🍿</Text>
              </TouchableOpacity>
              <Text style={{ color: "#fff", fontSize: 18 }}>📞</Text>
            </View>
          </View>
          <View style={s.fraudShieldBanner}>
            <Text style={{ color: "#22c55e", fontSize: 11, fontWeight: "700" }}>🛡️ TaazaFeed Fraud Shield Active • Screenshot Protection ON</Text>
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            {(chatMessages[activeChat?.id || ""] || []).map((m) => (
              <View key={m.id} style={[s.bubble, m.sender === "me" ? s.bubbleMe : s.bubbleThem]}>
                <Text style={{ color: "#fff", fontSize: isSeniorMode ? 18 : 14 }}>{m.text}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={s.chatInputRow}>
            <TextInput placeholder="Message..." placeholderTextColor="#71717a" style={s.chatInput} value={liveMsgInput} onChangeText={setLiveMsgInput} />
            <TouchableOpacity onPress={handleSendMessage} style={{ paddingHorizontal: 12 }}>
              <Text style={{ color: "#0284c7", fontWeight: "bold" }}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 18: NOTIFICATIONS ================= */}
      <Modal visible={showNotifModal} animationType="slide" transparent={false}>
        <View style={s.inboxScreen}>
          <View style={s.inboxTopBar}>
            <TouchableOpacity onPress={() => setShowNotifModal(false)}><Text style={{ color: "#fff", fontSize: 22 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Notifications</Text>
            <View style={{ width: 22 }} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.notifPillBar}>
            {["all", "People you follow", "comments", "follows", "tags & mentions"].map((flt) => (
              <TouchableOpacity key={flt} style={[s.inboxPill, notifFilter === flt && s.inboxPillActive]} onPress={() => setNotifFilter(flt)}>
                <Text style={[s.inboxPillTxt, notifFilter === flt && { color: "#fff" }]}>{flt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", marginVertical: 12 }}>Today</Text>
            {NOTIFICATIONS_DATA.map((nt) => (
              <View key={nt.id} style={s.notifRow}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: "#fff", fontSize: 13, lineHeight: 18 }}>
                    <Text style={{ fontWeight: "bold" }}>{nt.userGroup} </Text>
                    {nt.text} <Text style={{ color: "#71717a" }}>{nt.time}</Text>
                  </Text>
                </View>
                {nt.thumb ? <Image source={{ uri: nt.thumb }} style={{ width: 44, height: 44, borderRadius: 6, marginLeft: 10 }} /> : null}
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* ================= MODAL 19: MULTI-PLATFORM SHARE DRAWER ================= */}
      <Modal visible={!!shareTargetPost} animationType="slide" transparent={true}>
        <View style={s.modalDimMask}>
          <View style={s.shareSheet}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Share Post</Text>
              <TouchableOpacity onPress={() => setShareTargetPost(null)}><Text style={{ color: "#94a3b8" }}>✕</Text></TouchableOpacity>
            </View>

            <TextInput
              placeholder="Search friends to send..."
              placeholderTextColor="#71717a"
              style={s.shareSearchInput}
              value={shareFriendSearch}
              onChangeText={setShareFriendSearch}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
              {INBOX_THREADS.filter((c) => c.name.toLowerCase().includes(shareFriendSearch.toLowerCase())).map((f) => (
                <TouchableOpacity
                  key={f.id}
                  style={s.shareFriendItem}
                  onPress={() => {
                    Alert.alert("Sent! 🚀", `Forwarded to @${f.name}`);
                    setShareTargetPost(null);
                  }}
                >
                  <Image source={{ uri: f.avatar }} style={s.shareFriendAvatar} />
                  <Text style={s.shareFriendName} numberOfLines={1}>@{f.name}</Text>
                  <View style={s.sendMiniBtn}><Text style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}>Send</Text></View>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={s.shareExternalGrid}>
              <TouchableOpacity style={s.shareOptBtn} onPress={() => Alert.alert("Link Copied! 📋", "https://taazafeed.app/p/p1")}>
                <View style={s.shareIconCircle}><Text style={{ fontSize: 18 }}>📋</Text></View>
                <Text style={s.shareOptTxt}>Copy Link</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shareOptBtn} onPress={async () => {
                try {
                  await NativeShare.share({ title: "TaazaFeed Post", message: "Check out this post on TaazaFeed!" });
                } catch {}
              }}>
                <View style={[s.shareIconCircle, { backgroundColor: "rgba(34,197,94,0.3)" }]}><Text style={{ fontSize: 18 }}>💬</Text></View>
                <Text style={s.shareOptTxt}>WhatsApp</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shareOptBtn} onPress={async () => {
                try {
                  await NativeShare.share({ title: "TaazaFeed Post", message: "Check out this post on TaazaFeed!" });
                } catch {}
              }}>
                <View style={[s.shareIconCircle, { backgroundColor: "rgba(2,132,199,0.3)" }]}><Text style={{ fontSize: 18 }}>✈</Text></View>
                <Text style={s.shareOptTxt}>Telegram</Text>
              </TouchableOpacity>
              <TouchableOpacity style={s.shareOptBtn} onPress={async () => {
                try {
                  await NativeShare.share({ title: "TaazaFeed Post", message: "Check out this post on TaazaFeed!" });
                } catch {}
              }}>
                <View style={[s.shareIconCircle, { backgroundColor: "rgba(59,130,246,0.3)" }]}><Text style={{ fontSize: 18 }}>🌐</Text></View>
                <Text style={s.shareOptTxt}>More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 20: POST COMMENTS & VOICE BLESSINGS ================= */}
      <Modal visible={!!activeCommentsPostId} animationType="slide" transparent={true}>
        <View style={s.modalDimMask}>
          <View style={s.commentsSheet}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Comments & Voice Notes</Text>
              <TouchableOpacity onPress={() => setActiveCommentsPostId(null)}><Text style={{ color: "#94a3b8" }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 220, marginVertical: 8 }}>
              {activePostForComments?.comments.map((cm: any) => (
                <View key={cm.id} style={{ flexDirection: "row", marginBottom: 12, alignItems: "center" }}>
                  <Text style={{ color: "#38bdf8", fontWeight: "700", marginRight: 6, fontSize: isSeniorMode ? 16 : 13 }}>@{cm.user}</Text>
                  <Text style={{ color: cm.isAudio ? "#facc15" : "#cbd5e1", flex: 1, fontSize: isSeniorMode ? 16 : 13 }}>{cm.text}</Text>
                  <TouchableOpacity onPress={() => speakAloudReal(cm.text)}>
                    <Text style={{ fontSize: 14, marginLeft: 6 }}>🔊</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 8 }}>
              <TouchableOpacity style={s.voiceCommentBtn} onPress={() => handleAddComment("🎙️ [Voice Comment: 0:05s] क्या शानदार पोस्ट है! 🔥", true)}>
                <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>🎙️ बोलकर कमेंट (Voice)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.voiceCommentBtn, { backgroundColor: "rgba(250,204,21,0.2)", borderColor: "#facc15" }]}
                onPress={() => handleAddComment("✋ आशीर्वाद! सदा खुश और स्वस्थ रहो बेटा 🙏🌺", true)}
              >
                <Text style={{ color: "#facc15", fontSize: 12, fontWeight: "800" }}>✋ आशीर्वाद भेजें</Text>
              </TouchableOpacity>
            </View>
            <View style={s.commentInputRow}>
              <TextInput placeholder="Add a comment..." placeholderTextColor="#71717a" style={s.commentField} value={commentInput} onChangeText={setCommentInput} />
              <TouchableOpacity onPress={() => handleAddComment()}><Text style={{ color: "#38bdf8", fontWeight: "700" }}>Post</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 21: FEED VIDEO COMMENTS ================= */}
      <Modal visible={showVideoComments} animationType="slide" transparent={true}>
        <View style={s.modalDimMask}>
          <View style={s.commentsSheet}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Feed Comments</Text>
              <TouchableOpacity onPress={() => setShowVideoComments(false)}><Text style={{ color: "#94a3b8" }}>✕</Text></TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 250, marginVertical: 8 }}>
              {videoComments.map((rc) => (
                <View key={rc.id} style={{ flexDirection: "row", marginBottom: 12 }}>
                  <Text style={{ color: "#fff", fontWeight: "700", marginRight: 6 }}>@{rc.user}</Text>
                  <Text style={{ color: "#cbd5e1", flex: 1 }}>{rc.text}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={s.commentInputRow}>
              <TextInput placeholder="Comment on this feed video..." placeholderTextColor="#71717a" style={s.commentField} value={videoCommentInput} onChangeText={setVideoCommentInput} />
              <TouchableOpacity onPress={() => {
                if (!videoCommentInput.trim()) return;
                setVideoComments([{ id: "vc_" + Date.now(), user: "itsanandgupta", text: videoCommentInput.trim() }, ...videoComments]);
                setVideoCommentInput("");
              }}>
                <Text style={{ color: "#38bdf8", fontWeight: "700" }}>Post</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 22: SETTINGS & ACTIVITY ================= */}
      <Modal visible={showSettingsModal} animationType="slide" transparent={false}>
        <View style={s.inboxScreen}>
          <View style={s.inboxTopBar}>
            <TouchableOpacity onPress={() => setShowSettingsModal(false)}><Text style={{ color: "#fff", fontSize: 22 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Settings and activity</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <View style={s.settingsSearchPill}><Text style={{ color: "#71717a" }}>🔍 Search</Text></View>
            <Text style={s.settingSectionTitle}>Your account & History</Text>
            <TouchableOpacity
              style={s.settingRow}
              onPress={() => {
                setShowSettingsModal(false);
                setShowHistoryModal(true);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#facc15", fontWeight: "800", fontSize: 15 }}>🕒 Like & Watch History Center</Text>
                <Text style={{ color: "#71717a", fontSize: 12 }}>Review all posts, reels & tweets you liked or watched</Text>
              </View>
              <Text style={{ color: "#facc15" }}>➔</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={s.settingRow}
              onPress={() => {
                setShowSettingsModal(false);
                setShowLangModal(true);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#38bdf8", fontWeight: "800", fontSize: 15 }}>🇮🇳 All 24+ Indian Regional Languages</Text>
                <Text style={{ color: "#71717a", fontSize: 12 }}>Current: {L.label}</Text>
              </View>
              <Text style={{ color: "#38bdf8" }}>➔</Text>
            </TouchableOpacity>

            <Text style={s.settingSectionTitle}>How you use TaazaFeed</Text>
            {["Saved", "Archive", "Your activity", "Notifications", "Time management"].map((menu) => (
              <TouchableOpacity key={menu} style={s.settingRow} onPress={() => Alert.alert(menu, `Opening ${menu}`)}>
                <Text style={{ color: "#fff", fontSize: 14 }}>{menu}</Text>
                <Text style={{ color: "#71717a" }}>➔</Text>
              </TouchableOpacity>
            ))}

            <Text style={s.settingSectionTitle}>Support & Grievances</Text>
            <TouchableOpacity style={s.settingRow} onPress={() => setShowHelpModal(true)}>
              <Text style={{ color: "#f59e0b", fontSize: 14 }}>❔ Help & Grievance Desk (24x7)</Text>
              <Text style={{ color: "#71717a" }}>➔</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ================= MODAL 23: HELP & SUPPORT DESK ================= */}
      <Modal visible={showHelpModal} animationType="slide" transparent={false}>
        <View style={s.inboxScreen}>
          <View style={s.inboxTopBar}>
            <TouchableOpacity onPress={() => setShowHelpModal(false)}><Text style={{ color: "#fff", fontSize: 22 }}>←</Text></TouchableOpacity>
            <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800" }}>Help & Support</Text>
            <View style={{ width: 22 }} />
          </View>
          <ScrollView style={{ flex: 1, padding: 16 }}>
            <Text style={{ color: "#fff", fontWeight: "bold", marginBottom: 12 }}>How can we help you today?</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
              {["Bug Report", "Account Safety", "Verification Badge", "Story/Music Help", "Feedback"].map((cat) => (
                <TouchableOpacity key={cat} style={[s.inboxPill, helpTicketType === cat && s.inboxPillActive]} onPress={() => setHelpTicketType(cat)}>
                  <Text style={[s.inboxPillTxt, helpTicketType === cat && { color: "#fff" }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              placeholder="Describe your issue or feedback in detail..."
              placeholderTextColor="#71717a"
              style={{ backgroundColor: "#18181b", color: "#fff", padding: 12, borderRadius: 10, minHeight: 90 }}
              multiline
              value={helpDescription}
              onChangeText={setHelpDescription}
            />
            <TouchableOpacity
              style={s.shareConfirmBtn}
              onPress={() => {
                if (!helpDescription.trim()) return Alert.alert("Wait", "Please describe your query.");
                Alert.alert("Ticket Submitted (#TF-9901)", "Support Desk has received your request.");
                setHelpDescription("");
                setShowHelpModal(false);
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>Submit Ticket</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* ================= MODAL 24: SAVE TO CUSTOM COLLECTION FOLDER ================= */}
      <Modal visible={showSaveCollectionSheet} animationType="slide" transparent={true}>
        <View style={s.modalDimMask}>
          <View style={s.collectionDrawer}>
            <View style={s.sheetGrabber} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
              <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Save to Folder</Text>
              <TouchableOpacity onPress={() => setShowCreateFolderModal(true)}>
                <Text style={{ color: "#38bdf8", fontWeight: "bold" }}>+ New Folder</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {collections.map((col) => (
                <TouchableOpacity
                  key={col.id}
                  style={s.folderOptionItem}
                  onPress={() => {
                    Alert.alert("Saved! 📁", `Organized into '${col.name}'`);
                    setShowSaveCollectionSheet(false);
                  }}
                >
                  <Image source={{ uri: col.cover }} style={s.folderOptionImg} />
                  <Text style={s.folderOptionTxt} numberOfLines={1}>{col.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={s.doneBtn} onPress={() => setShowSaveCollectionSheet(false)}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= SUB-MODAL 25: NEW FOLDER NAME ================= */}
      <Modal visible={showCreateFolderModal} animationType="fade" transparent={true}>
        <View style={s.modalDimMaskCenter}>
          <View style={s.newFolderDialog}>
            <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>New Folder Name</Text>
            <TextInput placeholder="e.g. Family Legacy, Bikes, Glam..." placeholderTextColor="#71717a" style={s.folderTextInput} value={newFolderName} onChangeText={setNewFolderName} />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 14, marginTop: 14 }}>
              <TouchableOpacity onPress={() => setShowCreateFolderModal(false)}><Text style={{ color: "#94a3b8" }}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleCreateNewFolder}><Text style={{ color: "#38bdf8", fontWeight: "bold" }}>Create</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL 26: AUDIO DETAIL & "USE AUDIO" DRAWER ================= */}
      <Modal visible={!!activeAudioSheet} animationType="slide" transparent={true}>
        <View style={s.modalDimMask}>
          <View style={s.audioDrawer}>
            <View style={s.sheetGrabber} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Original Audio Voice</Text>
              <TouchableOpacity onPress={() => setActiveAudioSheet(null)}><Text style={{ color: "#94a3b8" }}>✕</Text></TouchableOpacity>
            </View>
            <View style={s.audioTrackDetailsRow}>
              <TouchableOpacity style={s.audioDiscGraphic} onPress={() => togglePlayRealAudio(activeAudioSheet?.title || "Audio")}>
                <Text style={{ fontSize: 22 }}>{playingTrackTitle === activeAudioSheet?.title ? "⏸" : "▶️"}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "800", fontSize: 15 }}>{activeAudioSheet?.title}</Text>
                <Text style={{ color: "#94a3b8", fontSize: 12 }}>{activeAudioSheet?.artist || "Original Audio"} • {activeAudioSheet?.reelsCount}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={s.useAudioHeroBtn}
              onPress={() => {
                setAudioName(activeAudioSheet?.title || "Original Audio");
                setActiveAudioSheet(null);
                openCameraStudio("post");
              }}
            >
              <Text style={{ color: "#000", fontWeight: "900", fontSize: 15 }}>♫ Use Audio in Camera</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000000", paddingTop: 40 },
  header: { height: 54, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.08)" },
  brandTitle: { fontSize: 18, fontWeight: "900", color: "#fff" },
  personaSwitchPill: { backgroundColor: "rgba(56,189,248,0.15)", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "#38bdf8" },
  personaSwitchSenior: { backgroundColor: "#facc15", borderColor: "#fef08a" },
  personaSwitchTxt: { color: "#38bdf8", fontSize: 9, fontWeight: "800" },
  langBtnPill: { backgroundColor: "rgba(250,204,21,0.15)", paddingHorizontal: 7, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "#facc15" },
  goLiveTopBtn: { backgroundColor: "#ef4444", paddingHorizontal: 7, paddingVertical: 5, borderRadius: 10 },
  headerIcons: { flexDirection: "row", gap: 6, alignItems: "center" },
  glassPillBtn: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 8, paddingVertical: 5, borderRadius: 12, borderWidth: 1, borderColor: "rgba(56,189,248,0.3)" },
  nowPlayingBanner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", paddingHorizontal: 16, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#38bdf8" },
  iconTouch: { position: "relative", padding: 3 },
  transIcon: { color: "rgba(255,255,255,0.7)", fontSize: 20 },
  iconActiveWhite: { color: "#ffffff" },
  dotBadge: { position: "absolute", top: 2, right: 2, width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#ff2d55" },
  numBadge: { position: "absolute", top: -2, right: -4, backgroundColor: "#ff2d55", borderRadius: 8, paddingHorizontal: 4, paddingVertical: 1 },
  numBadgeTxt: { color: "#fff", fontSize: 9, fontWeight: "700" },
  vibeBarScroll: { paddingHorizontal: 12, paddingVertical: 8, maxHeight: 48 },
  vibePill: { backgroundColor: "#18181b", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, marginRight: 8, borderWidth: 1, borderColor: "#27272a" },
  vibePillYouthActive: { backgroundColor: "#0284c7", borderColor: "#38bdf8" },
  vibePillSeniorActive: { backgroundColor: "#facc15", borderColor: "#fef08a" },
  vibePillTxt: { color: "#94a3b8", fontSize: 12, fontWeight: "600" },
  seniorWelcomeBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e1b4b", marginHorizontal: 12, marginVertical: 6, padding: 12, borderRadius: 14, borderWidth: 1.5, borderColor: "#facc15" },
  suprabhatSendBtn: { backgroundColor: "#facc15", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, marginLeft: 8 },
  storyBar: { paddingVertical: 10, paddingLeft: 12 },
  storyWrapper: { alignItems: "center", marginRight: 14, width: 72 },
  storyBorder: { width: 66, height: 66, borderRadius: 33, borderWidth: 2, borderColor: "#e1306c", alignItems: "center", justifyContent: "center" },
  userBorder: { borderColor: "rgba(255,255,255,0.3)" },
  storyImg: { width: 58, height: 58, borderRadius: 29 },
  liveBadgeMini: { position: "absolute", bottom: -2, backgroundColor: "#ef4444", paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  addIcon: { position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: "#0095f6", alignItems: "center", justifyContent: "center" },
  addTxt: { color: "#fff", fontSize: 10, fontWeight: "700" },
  storyLabel: { color: "#fff", fontSize: 11, marginTop: 4 },
  divider: { height: 0.5, backgroundColor: "rgba(255,255,255,0.08)" },
  postCard: { marginBottom: 18 },
  postCardSeniorHighlight: { backgroundColor: "#090d16", marginHorizontal: 8, paddingBottom: 14, borderRadius: 16, borderWidth: 1.5, borderColor: "#38bdf8" },
  postUserRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 10 },
  postAvatar: { width: 36, height: 36, borderRadius: 18 },
  authorText: { color: "#ffffff", fontWeight: "700", fontSize: 14 },
  blueTick: { backgroundColor: "#0095f6", width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  tickTxt: { color: "#fff", fontSize: 9, fontWeight: "800" },
  trialBadge: { backgroundColor: "rgba(245,158,11,0.2)", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 },
  trialBadgeTxt: { color: "#f59e0b", fontSize: 9, fontWeight: "800" },
  inlineFollowBtn: { backgroundColor: "rgba(0,149,246,0.18)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: "#0095f6", marginLeft: 4 },
  inlineFollowingBtn: { backgroundColor: "rgba(255,255,255,0.08)", borderColor: "#52525b" },
  inlineFollowTxt: { color: "#38bdf8", fontSize: 11, fontWeight: "800" },
  subLoc: { color: "rgba(255,255,255,0.4)", fontSize: 11 },
  listenAloudBtn: { backgroundColor: "#facc15", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10 },
  quickTipPill: { backgroundColor: "rgba(250,204,21,0.15)", paddingHorizontal: 9, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: "#facc15" },
  postPhoto: { width: "100%", height: 380, backgroundColor: "#121212" },
  floatingHeartMask: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", zIndex: 20 },
  actionBar: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 14, paddingVertical: 10 },
  actionTouchItem: { alignItems: "center" },
  actIcon: { color: "rgba(255,255,255,0.7)", fontSize: 22 },
  seniorIconLabel: { color: "#facc15", fontSize: 12, fontWeight: "800", marginTop: 2 },
  likesCount: { color: "#ffffff", fontWeight: "700", fontSize: 13, marginBottom: 4 },
  caption: { color: "#e5e5e5", fontSize: 13, lineHeight: 18 },
  aiBridgeBox: { backgroundColor: "rgba(250,204,21,0.12)", padding: 10, borderRadius: 10, marginTop: 8, borderLeftWidth: 4, borderLeftColor: "#facc15" },
  taggedProductPill: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: "flex-start", marginTop: 6, borderWidth: 0.5, borderColor: "#38bdf8" },
  audioVoicePill: { flexDirection: "row", alignItems: "center", backgroundColor: "#18181b", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, alignSelf: "flex-start" },
  exploreTopRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, height: 50, gap: 10 },
  exploreUserAvatar: { width: 32, height: 32, borderRadius: 16 },
  exploreSearchPill: { flex: 1, height: 36, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 18, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  exploreInputText: { flex: 1, color: "#fff", fontSize: 13 },
  exploreCatsBar: { maxHeight: 42, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.08)" },
  exploreCatTab: { paddingHorizontal: 14, justifyContent: "center" },
  exploreCatActive: { borderBottomWidth: 2, borderBottomColor: "#fff" },
  exploreCatTxt: { color: "#71717a", fontWeight: "700", fontSize: 13 },
  quickTweetBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#121214", marginHorizontal: 16, marginVertical: 10, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#27272a" },
  quickTweetAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  tweetCard: { flexDirection: "row", padding: 16, borderBottomWidth: 0.5, borderBottomColor: "#1c1c20" },
  tweetAvatar: { width: 44, height: 44, borderRadius: 22 },
  tweetAuthor: { color: "#fff", fontWeight: "700", fontSize: 14 },
  tweetHandle: { color: "#71717a", fontSize: 12 },
  blueTickSmall: { backgroundColor: "#0095f6", width: 14, height: 14, borderRadius: 7, alignItems: "center", justifyContent: "center" },
  blueTickTxt: { color: "#fff", fontSize: 8, fontWeight: "900" },
  tweetBody: { color: "#e2e8f0", fontSize: 14, lineHeight: 20, marginVertical: 8 },
  factCheckBox: { backgroundColor: "rgba(56,189,248,0.1)", padding: 6, borderRadius: 6, marginBottom: 6 },
  tweetActionBar: { flexDirection: "row", justifyContent: "space-between", marginTop: 6, paddingRight: 16 },
  tweetActionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  tweetActionIcon: { fontSize: 16, color: "rgba(255,255,255,0.7)" },
  tweetActionCount: { color: "#71717a", fontSize: 11 },
  floatingFab: { position: "absolute", bottom: 70, right: 18, width: 56, height: 56, borderRadius: 28, backgroundColor: "#0284c7", alignItems: "center", justifyContent: "center", elevation: 6 },
  toggleRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 10, marginBottom: 8, gap: 8 },
  toggleBtn: { flex: 1, paddingVertical: 8, backgroundColor: "#18181b", borderRadius: 8, alignItems: "center" },
  toggleBtnActive: { backgroundColor: "#27272a" },
  toggleTxt: { color: "#71717a", fontWeight: "600", fontSize: 13 },
  heroBanner: { margin: 16, borderRadius: 12, height: 180, overflow: "hidden", position: "relative" },
  heroImg: { width: "100%", height: "100%" },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.35)" },
  heroTextWrap: { position: "absolute", bottom: 12, left: 12, right: 12 },
  heroHeading: { color: "#fff", fontSize: 18, fontWeight: "900" },
  heroSubtitle: { color: "#e2e8f0", fontSize: 12, marginTop: 2 },
  heroPromoted: { color: "#94a3b8", fontSize: 10, marginTop: 4 },
  sectionHeader: { color: "#fff", fontSize: 16, fontWeight: "800", paddingHorizontal: 16, marginTop: 10, marginBottom: 8 },
  newsCard: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#18181b" },
  newsTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  newsMeta: { color: "#71717a", fontSize: 11 },
  topicMetaRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  stackedAvatars: { width: 38, height: 20, position: "relative", marginRight: 8 },
  stackedImg: { width: 18, height: 18, borderRadius: 9, position: "absolute", top: 0, borderWidth: 1, borderColor: "#000" },
  mediaGrid: { flexDirection: "row", flexWrap: "wrap", padding: 1 },
  mediaGridTile: { width: "33.1%", padding: 1 },
  reelScreen: { flex: 1, backgroundColor: "#000", position: "relative" },
  reelImage: { width: "100%", height: "100%", resizeMode: "cover" },
  reelDarkMask: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.28)" },
  reelTopRow: { position: "absolute", top: 16, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reelLogo: { color: "#fff", fontSize: 22, fontWeight: "800" },
  reelCameraBtn: { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "#38bdf8" },
  reelRightSide: { position: "absolute", right: 14, bottom: 24, alignItems: "center", gap: 14 },
  reelBtn: { alignItems: "center" },
  reelIconTrans: { color: "rgba(255,255,255,0.75)", fontSize: 26 },
  reelNum: { color: "rgba(255,255,255,0.8)", fontSize: 11, marginTop: 2 },
  reelBottomInfo: { position: "absolute", bottom: 20, left: 16, right: 80 },
  reelFollowBtn: { backgroundColor: "#0095f6", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 },
  reelFollowingBtn: { backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "#fff" },
  reelAudioPill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, alignSelf: "flex-start", marginTop: 6 },
  useVoiceBtnMini: { backgroundColor: "#fff", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  profHeaderRow: { height: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16 },
  profHeaderTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  profStatsRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, marginTop: 6 },
  profAvatarWrapper: { position: "relative" },
  profMainAvatar: { width: 84, height: 84, borderRadius: 42, borderWidth: 2, borderColor: "#27272a" },
  profAvatarAddBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#0095f6", width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  statsCountsRow: { flex: 1, flexDirection: "row", justifyContent: "space-around", marginLeft: 16 },
  statNum: { color: "#fff", fontSize: 16, fontWeight: "800" },
  statLbl: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  bioContainer: { paddingHorizontal: 16, marginTop: 10 },
  bioName: { color: "#fff", fontWeight: "700", fontSize: 14 },
  auraBadge: { backgroundColor: "rgba(250,204,21,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: "#facc15" },
  professionPill: { backgroundColor: "rgba(56,189,248,0.15)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12, alignSelf: "flex-start", marginVertical: 4 },
  professionPillTxt: { color: "#38bdf8", fontSize: 11, fontWeight: "700" },
  bioLine: { color: "#e2e8f0", fontSize: 12, marginTop: 2 },
  bioLink: { color: "#38bdf8", fontSize: 12, marginTop: 4 },
  realDashboardCard: { backgroundColor: "#11131a", marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: "#27272a" },
  historyBtnMini: { backgroundColor: "rgba(250,204,21,0.15)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  dashMetricsGrid: { flexDirection: "row", justifyContent: "space-between", gap: 6 },
  dashMetricBox: { flex: 1, backgroundColor: "#181824", paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  dashMetricNum: { color: "#38bdf8", fontSize: 16, fontWeight: "900" },
  dashMetricLabel: { color: "#94a3b8", fontSize: 10, marginTop: 2, fontWeight: "600" },
  privacyToggleBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", marginHorizontal: 16, marginTop: 10, padding: 10, borderRadius: 10 },
  highlightsBar: { paddingHorizontal: 16, marginVertical: 8, maxHeight: 95 },
  hlItem: { alignItems: "center", marginRight: 14, width: 62 },
  hlCircle: { width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, borderColor: "#71717a", alignItems: "center", justifyContent: "center", overflow: "hidden" },
  hlImg: { width: "100%", height: "100%" },
  hlTitle: { color: "#fff", fontSize: 11, marginTop: 4, textAlign: "center" },
  fourTabsBar: { flexDirection: "row", borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.1)", marginTop: 10 },
  fourTab: { flex: 1, alignItems: "center", paddingVertical: 10 },
  fourTabActive: { borderBottomWidth: 2, borderBottomColor: "#fff" },
  pinnedGrid: { flexDirection: "row", flexWrap: "wrap", gap: 2, padding: 1 },
  pinnedGridTile: { width: (width - 6) / 3, height: 160, position: "relative" },
  pinIconBadge: { position: "absolute", top: 6, right: 6, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 10, padding: 3 },
  viewsCountBadge: { position: "absolute", bottom: 6, left: 6, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 4, paddingHorizontal: 4 },
  collectionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, padding: 16 },
  folderCard: { width: (width - 42) / 2, backgroundColor: "#18181b", borderRadius: 12, overflow: "hidden", paddingBottom: 8 },
  createFolderCard: { width: (width - 42) / 2, height: 160, backgroundColor: "#18181b", borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1, borderStyle: "dashed", borderColor: "#38bdf8" },
  folderCover: { width: "100%", height: 120 },
  folderName: { color: "#fff", fontWeight: "700", fontSize: 13, marginTop: 6, paddingHorizontal: 8 },
  folderCount: { color: "#71717a", fontSize: 11, paddingHorizontal: 8 },
  mainBottomBar: { height: 50, flexDirection: "row", justifyContent: "space-around", alignItems: "center", backgroundColor: "rgba(0,0,0,0.9)", borderTopWidth: 0.5, borderTopColor: "rgba(255,255,255,0.08)" },
  bottomTab: { flex: 1, alignItems: "center" },
  seniorNavTxt: { color: "#facc15", fontSize: 10, fontWeight: "800", marginTop: 2 },
  addCircleTrans: { width: 32, height: 32, borderRadius: 8, borderWidth: 1.5, borderColor: "rgba(255,255,255,0.7)", alignItems: "center", justifyContent: "center" },
  bottomProfPic: { width: 24, height: 24, borderRadius: 12 },
  bottomProfActive: { borderWidth: 2, borderColor: "#fff" },
  tipAmtPill: { backgroundColor: "#27272a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },

  // Live Stream Studio Styles
  liveRedPill: { backgroundColor: "#ef4444", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  liveViewersPill: { backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  endLiveBtn: { backgroundColor: "rgba(239,68,68,0.85)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  coHostBox: { position: "absolute", top: 100, right: 16, width: 110, height: 150, borderRadius: 14, overflow: "hidden", borderWidth: 2, borderColor: "#38bdf8", zIndex: 15 },
  coHostLabel: { position: "absolute", bottom: 4, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 6, borderRadius: 6 },
  liveChatContainer: { position: "absolute", bottom: 20, left: 14, right: 14, zIndex: 15 },
  liveChatBubble: { flexDirection: "row", backgroundColor: "rgba(0,0,0,0.55)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, marginBottom: 6, alignSelf: "flex-start" },
  liveBottomInputRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
  liveInputBox: { flex: 1, backgroundColor: "rgba(0,0,0,0.7)", color: "#fff", borderRadius: 20, paddingHorizontal: 14, height: 40, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  liveSendBtn: { backgroundColor: "#0284c7", paddingHorizontal: 12, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },

  // History Modal Styles
  historyItemCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#141418", padding: 10, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: "#27272a" },
  historyThumb: { width: 56, height: 56, borderRadius: 10 },

  // Live Camera & Story Canvas Styles
  storyEditorCanvas: { flex: 1, backgroundColor: "#000", position: "relative" },
  storyFullMedia: { width: "100%", height: "100%", resizeMode: "cover" },
  storyEditorTop: { position: "absolute", top: 40, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 10 },
  cameraModeBadge: { backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: "#38bdf8" },
  cameraBottomBar: { position: "absolute", bottom: 40, left: 20, right: 20, flexDirection: "row", justifyContent: "space-around", alignItems: "center", zIndex: 10 },
  camSideBtn: { backgroundColor: "rgba(0,0,0,0.65)", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  shutterOuter: { width: 74, height: 74, borderRadius: 37, borderWidth: 4, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  shutterInner: { width: 58, height: 58, borderRadius: 29, backgroundColor: "#e1306c" },
  deviceCamLink: { position: "absolute", bottom: 12, alignSelf: "center", zIndex: 10 },
  spotlightPill: { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  storySideToolsBar: { position: "absolute", top: 80, right: 16, gap: 12, alignItems: "center", zIndex: 10 },
  storyToolIcon: { alignItems: "center" },
  toolEmoji: { fontSize: 16, color: "#fff", backgroundColor: "rgba(0,0,0,0.5)", width: 34, height: 34, textAlign: "center", lineHeight: 34, borderRadius: 17, overflow: "hidden" },
  toolLabel: { color: "#fff", fontSize: 9, marginTop: 2 },
  storyFilterTrayContainer: { position: "absolute", bottom: 80, left: 0, right: 0, zIndex: 10 },
  filtersScroll: { paddingHorizontal: 16 },
  filterBubble: { backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, marginRight: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  filterBubbleActive: { borderColor: "#facc15", backgroundColor: "rgba(250,204,21,0.25)" },
  filterBubbleTxt: { color: "#fff", fontSize: 12, fontWeight: "700" },
  storyEditorBottomBar: { position: "absolute", bottom: 24, left: 16, right: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 10 },
  storyAudienceBtn: { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  storyNextRoundBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#0095f6", alignItems: "center", justifyContent: "center" },

  // Viewers Drawer
  viewersDrawer: { backgroundColor: "#18181b", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, height: 420 },
  viewerSearchInput: { backgroundColor: "#27272a", color: "#fff", borderRadius: 10, paddingHorizontal: 12, height: 38 },
  extendStoryBtn: { backgroundColor: "rgba(56,189,248,0.15)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  viewerRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  viewerAvatar: { width: 40, height: 40, borderRadius: 20 },
  sheetGrabber: { width: 36, height: 4, backgroundColor: "#3f3f46", borderRadius: 2, alignSelf: "center", marginBottom: 12 },

  // Publish Sheet
  publishScreenContainer: { flex: 1, backgroundColor: "#000000", paddingTop: 40 },
  publishTopBar: { height: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16 },
  publishHeaderTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  createModeToggle: { flexDirection: "row", backgroundColor: "#27272a", borderRadius: 10, padding: 3, marginHorizontal: 16, marginVertical: 10 },
  modePill: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 8 },
  modePillActive: { backgroundColor: "#0284c7" },
  modePillTxt: { color: "#71717a", fontWeight: "700", fontSize: 12 },
  thoughtInputArea: { backgroundColor: "#121214", color: "#fff", borderRadius: 10, padding: 14, marginHorizontal: 16, minHeight: 140, fontSize: 15, textAlignVertical: "top" },
  previewCardArea: { alignItems: "center", marginVertical: 12 },
  previewMediaWrapper: { width: 150, height: 220, borderRadius: 14, overflow: "hidden", position: "relative" },
  previewMediaImage: { width: "100%", height: "100%", resizeMode: "cover" },
  previewPillTop: { position: "absolute", top: 8, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.7)", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 12 },
  editCoverBtn: { position: "absolute", bottom: 8, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.75)", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  aiPredictorBanner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "rgba(34,197,94,0.12)", marginHorizontal: 16, marginBottom: 10, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: "#22c55e" },
  publishCaptionInput: { color: "#fff", fontSize: 14, paddingHorizontal: 16, minHeight: 70, textAlignVertical: "top" },
  publishChipsRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginVertical: 10 },
  publishChip: { backgroundColor: "rgba(255,255,255,0.08)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.15)" },
  publishOptionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  publishOptionIcon: { fontSize: 20, width: 32, color: "#cbd5e1" },
  publishOptionTitle: { color: "#fff", fontSize: 15, fontWeight: "600", flex: 1 },
  publishArrow: { color: "#71717a", fontSize: 22 },
  publishBottomBarFixed: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 0.5, borderTopColor: "#1c1c20", backgroundColor: "#000" },
  publishBtnDualRow: { flexDirection: "row", gap: 12 },
  saveDraftBtn: { flex: 1, backgroundColor: "#27272a", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  shareGradientBtn: { flex: 1, backgroundColor: "#e1306c", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  modalInnerDark: { flex: 1, backgroundColor: "#000", paddingTop: 40 },
  modalDimMask: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" },
  modalDimMaskCenter: { flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center" },
  audienceBottomSheet: { backgroundColor: "#18181b", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, minHeight: 340 },
  shareTitle: { color: "#fff", fontSize: 16, fontWeight: "800", textAlign: "center", marginBottom: 16 },
  audienceOptionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#27272a" },
  audAvatar: { width: 44, height: 44, borderRadius: 22 },
  starIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  shareConfirmBtn: { backgroundColor: "#0095f6", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 20 },
  professionDialog: { width: width - 40, backgroundColor: "#18181b", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "#27272a" },
  professionItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#27272a" },
  productCardRow: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.06)", padding: 12, borderRadius: 12, marginBottom: 10 },
  productCardRowActive: { borderColor: "#38bdf8", borderWidth: 1.5 },
  productThumb: { width: 50, height: 50, borderRadius: 8 },
  followerItemRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "rgba(255,255,255,0.08)" },
  followerAvatar: { width: 44, height: 44, borderRadius: 22 },
  followActionButton: { backgroundColor: "#0095f6", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 8 },
  followToggleRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#27272a" },
  followToggleTab: { flex: 1, alignItems: "center", paddingVertical: 12 },
  followToggleActive: { borderBottomWidth: 2, borderBottomColor: "#fff" },
  followToggleTxt: { color: "#71717a", fontWeight: "700", fontSize: 14 },
  followSearchRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#1c1c1e", marginHorizontal: 16, marginVertical: 10, borderRadius: 10, paddingHorizontal: 12, height: 40, borderWidth: 1, borderColor: "#27272a" },
  collectionDrawer: { backgroundColor: "#18181b", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, minHeight: 240 },
  folderOptionItem: { width: 90, marginRight: 12, alignItems: "center" },
  folderOptionImg: { width: 80, height: 80, borderRadius: 10 },
  folderOptionTxt: { color: "#fff", fontSize: 11, marginTop: 4 },
  doneBtn: { backgroundColor: "#27272a", paddingVertical: 12, borderRadius: 10, alignItems: "center", marginTop: 12 },
  newFolderDialog: { width: width - 60, backgroundColor: "#18181b", padding: 20, borderRadius: 14 },
  folderTextInput: { backgroundColor: "#27272a", color: "#fff", borderRadius: 8, padding: 10, marginTop: 8 },
  urlInputField: { backgroundColor: "#18181b", borderRadius: 10, padding: 14, color: "#fff", fontSize: 15, borderWidth: 1, borderColor: "#27272a" },
  moreSectionHeading: { color: "#71717a", fontSize: 12, fontWeight: "700", marginTop: 18, marginBottom: 8 },
  thinDivider: { height: 0.5, backgroundColor: "#1c1c20", marginVertical: 4 },
  audienceSelectRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: "#1c1c20" },

  // Shared Modals
  musicSheet: { backgroundColor: "#18181b", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, minHeight: 340 },
  musicRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#27272a" },
  audioDrawer: { backgroundColor: "#18181b", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, minHeight: 220 },
  audioTrackDetailsRow: { flexDirection: "row", alignItems: "center", marginVertical: 16 },
  audioDiscGraphic: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#27272a", alignItems: "center", justifyContent: "center" },
  useAudioHeroBtn: { backgroundColor: "#38bdf8", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  inboxScreen: { flex: 1, backgroundColor: "#000", paddingTop: 40 },
  inboxTopBar: { height: 50, flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16 },
  fraudShieldBanner: { backgroundColor: "rgba(34,197,94,0.12)", paddingVertical: 6, alignItems: "center", borderBottomWidth: 0.5, borderBottomColor: "#22c55e" },
  notesBarRow: { paddingHorizontal: 16, marginVertical: 8, maxHeight: 110 },
  noteItem: { alignItems: "center", marginRight: 16, width: 72, position: "relative" },
  noteBubble: { backgroundColor: "#27272a", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, position: "absolute", top: -14, zIndex: 10, maxWidth: 78, alignItems: "center" },
  noteAvatar: { width: 54, height: 54, borderRadius: 27, marginTop: 12 },
  noteUser: { color: "#94a3b8", fontSize: 10, marginTop: 4 },
  inboxPillsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 8, marginVertical: 8 },
  inboxPill: { backgroundColor: "#18181b", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  inboxPillActive: { backgroundColor: "#27272a" },
  inboxPillTxt: { color: "#71717a", fontSize: 11, fontWeight: "700" },
  threadItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12 },
  threadAvatar: { width: 48, height: 48, borderRadius: 24 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#0095f6" },
  newActionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  newActionIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#18181b", alignItems: "center", justifyContent: "center", marginRight: 14 },
  newActionTxt: { color: "#fff", fontSize: 14, fontWeight: "600" },
  chatInputRow: { flexDirection: "row", alignItems: "center", padding: 10, backgroundColor: "#18181b" },
  chatInput: { flex: 1, backgroundColor: "#27272a", color: "#fff", borderRadius: 20, paddingHorizontal: 14, height: 40 },
  bubble: { maxWidth: "75%", padding: 10, borderRadius: 14, marginBottom: 8 },
  bubbleMe: { alignSelf: "flex-end", backgroundColor: "#0095f6" },
  bubbleThem: { alignSelf: "flex-start", backgroundColor: "#27272a" },
  notifPillBar: { paddingHorizontal: 16, maxHeight: 44, marginVertical: 8 },
  notifRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#18181b" },
  settingsSearchPill: { backgroundColor: "#18181b", padding: 10, borderRadius: 10, marginBottom: 14 },
  settingSectionTitle: { color: "#94a3b8", fontSize: 12, fontWeight: "700", marginTop: 16, marginBottom: 8 },
  settingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: "#18181b" },
  shareSheet: { backgroundColor: "#121214", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 18, minHeight: 320 },
  shareSearchInput: { backgroundColor: "#202024", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: "#fff", fontSize: 13 },
  shareFriendItem: { alignItems: "center", marginRight: 16, width: 62 },
  shareFriendAvatar: { width: 52, height: 52, borderRadius: 26 },
  shareFriendName: { color: "#d4d4d8", fontSize: 10, marginTop: 4, textAlign: "center" },
  sendMiniBtn: { backgroundColor: "#0095f6", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 4 },
  shareExternalGrid: { flexDirection: "row", justifyContent: "space-around", borderTopWidth: 0.5, borderTopColor: "#27272a", paddingTop: 14, marginTop: 8 },
  shareOptBtn: { alignItems: "center" },
  shareIconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", marginBottom: 6 },
  shareOptTxt: { color: "rgba(255,255,255,0.7)", fontSize: 11 },
  commentsSheet: { backgroundColor: "#18181b", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, minHeight: 360 },
  voiceCommentBtn: { flex: 1, backgroundColor: "rgba(56,189,248,0.15)", paddingVertical: 8, borderRadius: 12, alignItems: "center", borderWidth: 1, borderColor: "#38bdf8" },
  commentInputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#27272a", borderRadius: 24, paddingHorizontal: 12, paddingVertical: 6, marginTop: 6 },
  commentField: { flex: 1, color: "#fff", fontSize: 13, paddingVertical: 4 },
});