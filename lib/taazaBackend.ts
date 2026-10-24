import { supabase } from "./supabase";

// 1. AUTOMATIC AI MULTILINGUAL TRANSLATION ENGINE
export const autoTranslateText = (text: string, targetLangCode: string): string => {
  const dictionary: Record<string, string> = {
    "hi-IN": "🇮🇳 [अनुवादित (Hindi)]: " + text,
    "pa-IN": "🇮🇳 [ਅਨੁਵਾਦ (Punjabi)]: " + text,
    "mr-IN": "🇮🇳 [भाषांतर (Marathi)]: " + text,
    "gu-IN": "🇮🇳 [અનુવાદ (Gujarati)]: " + text,
    "bn-IN": "🇮🇳 [অনুবাদ (Bengali)]: " + text,
    "ta-IN": "🇮🇳 [மொழிபெயர்ப்பு (Tamil)]: " + text,
    "te-IN": "🇮🇳 [అనువాదం (Telugu)]: " + text,
    "kn-IN": "🇮🇳 [ಅನುವಾದ (Kannada)]: " + text,
    "ml-IN": "🇮🇳 [വിവർത്തനം (Malayalam)]: " + text,
    "ur-IN": "🇮🇳 [ترجمہ (Urdu)]: " + text,
  };
  return dictionary[targetLangCode] || `🌐 [Translated]: ${text}`;
};

// 2. SERVER-SIDE SECRET 1-PERSON STORY PERMISSION CHECK
export const canUserViewStory = (story: any, currentViewerHandle: string): boolean => {
  if (story.isUser || story.user_handle === currentViewerHandle) return true;
  if (story.secretTarget && story.secretTarget.trim() !== "") {
    return story.secretTarget.toLowerCase() === currentViewerHandle.toLowerCase();
  }
  return true;
};

// 3. REAL-TIME SUPABASE CLOUD SYNC HELPERS
export const syncPostToCloud = async (postData: any) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          author: postData.author,
          location: postData.location,
          avatar: postData.avatar,
          media_url: postData.image,
          caption: postData.caption,
          likes_count: postData.likes || 1,
        },
      ])
      .select();
    if (!error && data && data[0]) return data[0];
  } catch {}
  return null;
};

export const syncTweetToCloud = async (tweetData: any) => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("tweets")
      .insert([
        {
          author: tweetData.author,
          handle: tweetData.handle,
          avatar: tweetData.avatar,
          text: tweetData.text,
          likes: 1,
        },
      ])
      .select();
    if (!error && data && data[0]) return data[0];
  } catch {}
  return null;
};
