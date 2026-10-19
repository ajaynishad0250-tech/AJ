import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TextInput, Pressable, FlatList, ActivityIndicator, StyleSheet, KeyboardAvoidingView, Platform } from "react-native";
import * as Speech from "expo-speech";
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from "expo-speech-recognition";
import { StatusBar } from "expo-status-bar";

const API_URL = process.env.EXPO_PUBLIC_AI_API_URL || "";
const copy = {
  hi: { subtitle: "आपका हिंदी और English voice assistant", placeholder: "अपना संदेश लिखें…", send: "भेजें", noServer: "AI server सेट नहीं है। README में backend setup देखें।", error: "अभी जवाब नहीं मिल पाया। Backend URL और server logs जाँचें।", you: "आप", jarvis: "JARVIS", welcome: "नमस्ते! मैं AJAY JARVIS AI हूँ। मुझसे हिंदी या English में बात करें।" },
  en: { subtitle: "Your Hindi + English voice assistant", placeholder: "Type your message…", send: "Send", noServer: "AI server is not configured. See backend setup in README.", error: "I couldn't get a reply. Check the backend URL and server logs.", you: "You", jarvis: "JARVIS", welcome: "Hello! I’m AJAY JARVIS AI. Talk to me in Hindi or English." }
};

export default function App() {
  const [language, setLanguage] = useState("hi");
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([{ id: "welcome", role: "assistant", text: copy.hi.welcome }]);
  const t = copy[language];

  useEffect(() => {
    setMessages(current => current.map((m, i) => i === 0 && m.id === "welcome" ? { ...m, text: copy[language].welcome } : m));
  }, [language]);

  useSpeechRecognitionEvent("start", () => setListening(true));
  useSpeechRecognitionEvent("end", () => setListening(false));
  useSpeechRecognitionEvent("result", event => {
    const transcript = event.results?.[0]?.transcript;
    if (transcript) setInput(transcript);
  });
  useSpeechRecognitionEvent("error", () => setListening(false));

  function addMessage(role, text) {
    setMessages(current => [...current, { id: Date.now().toString() + Math.random().toString(16).slice(2), role, text }]);
  }

  async function startListening() {
    try {
      const permission = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!permission.granted) {
        addMessage("assistant", language === "hi" ? "माइक्रोफ़ोन अनुमति नहीं मिली। Android Settings में अनुमति दें।" : "Microphone permission was denied. Enable it in Android Settings.");
        return;
      }
      ExpoSpeechRecognitionModule.start({ lang: language === "hi" ? "hi-IN" : "en-US", interimResults: true, continuous: false });
    } catch {
      addMessage("assistant", language === "hi" ? "Speech recognition शुरू नहीं हो सका। Android speech service जाँचें।" : "Could not start speech recognition. Check the Android speech service.");
    }
  }

  async function sendMessage() {
    const prompt = input.trim();
    if (!prompt || busy) return;
    setInput("");
    addMessage("user", prompt);
    if (!API_URL) { addMessage("assistant", t.noServer); return; }
    setBusy(true);
    try {
      const response = await fetch(API_URL.replace(/\/$/, "") + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt, language })
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      const data = await response.json();
      const answer = String(data.reply || "").trim() || t.error;
      addMessage("assistant", answer);
      Speech.speak(answer, { language: language === "hi" ? "hi-IN" : "en-US", rate: 0.95 });
    } catch { addMessage("assistant", t.error); }
    finally { setBusy(false); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={styles.header}>
          <View style={styles.orb}><Text style={styles.orbText}>J</Text></View>
          <Text style={styles.title}>AJAY JARVIS AI</Text>
          <Text style={styles.subtitle}>{t.subtitle}</Text>
          <View style={styles.langRow}>
            <Pressable onPress={() => setLanguage("hi")} style={[styles.lang, language === "hi" && styles.langActive]}><Text style={styles.langText}>हिंदी</Text></Pressable>
            <Pressable onPress={() => setLanguage("en")} style={[styles.lang, language === "en" && styles.langActive]}><Text style={styles.langText}>English</Text></Pressable>
          </View>
        </View>
        <FlatList style={styles.chat} contentContainerStyle={styles.chatContent} data={messages} keyExtractor={item => item.id}
          renderItem={({ item }) => <View style={[styles.bubble, item.role === "user" ? styles.userBubble : styles.aiBubble]}>
            <Text style={styles.role}>{item.role === "user" ? t.you : t.jarvis}</Text><Text style={styles.message}>{item.text}</Text>
          </View>} />
        {busy && <View style={styles.loading}><ActivityIndicator color="#62e8ff" /><Text style={styles.muted}>Thinking…</Text></View>}
        <View style={styles.composer}>
          <Pressable onPress={startListening} style={[styles.mic, listening && styles.micActive]}><Text style={styles.micText}>{listening ? "●" : "🎙"}</Text></Pressable>
          <TextInput value={input} onChangeText={setInput} placeholder={t.placeholder} placeholderTextColor="#8795aa" multiline style={styles.input} />
          <Pressable onPress={sendMessage} disabled={busy} style={styles.send}><Text style={styles.sendText}>➤</Text></Pressable>
        </View>
        <Text style={styles.footer}>{listening ? (language === "hi" ? "सुन रहा हूँ…" : "Listening…") : "Tap mic to speak · Your choice, your control"}</Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#070b17" }, flex: { flex: 1 },
  header: { alignItems: "center", paddingTop: 18, paddingBottom: 14, borderBottomWidth: 1, borderBottomColor: "#1a2940" },
  orb: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: "#55dfff", alignItems: "center", justifyContent: "center", backgroundColor: "#10263c", marginBottom: 8 },
  orbText: { color: "#70eaff", fontSize: 30, fontWeight: "900" }, title: { color: "#f2f7ff", fontSize: 21, fontWeight: "800", letterSpacing: 1 },
  subtitle: { color: "#91a7bf", fontSize: 12, marginTop: 5 }, langRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  lang: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 18, borderWidth: 1, borderColor: "#2b4159" },
  langActive: { backgroundColor: "#123d51", borderColor: "#57dff5" }, langText: { color: "#edf8ff", fontWeight: "600" },
  chat: { flex: 1 }, chatContent: { padding: 14, gap: 12 }, bubble: { maxWidth: "88%", padding: 13, borderRadius: 16 },
  userBubble: { alignSelf: "flex-end", backgroundColor: "#123a50", borderBottomRightRadius: 4 },
  aiBubble: { alignSelf: "flex-start", backgroundColor: "#141e30", borderWidth: 1, borderColor: "#26354c", borderBottomLeftRadius: 4 },
  role: { color: "#62e8ff", fontSize: 10, fontWeight: "800", marginBottom: 5 }, message: { color: "#f0f5ff", fontSize: 15, lineHeight: 22 },
  loading: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, padding: 8 }, muted: { color: "#93a8c1" },
  composer: { flexDirection: "row", alignItems: "center", padding: 10, gap: 8, borderTopWidth: 1, borderTopColor: "#1a2940" },
  mic: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center", backgroundColor: "#14283c" },
  micActive: { backgroundColor: "#7c2337" }, micText: { color: "#f5fbff", fontSize: 20 },
  input: { flex: 1, maxHeight: 110, minHeight: 44, color: "#fff", backgroundColor: "#111a2a", borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#55dfff", alignItems: "center", justifyContent: "center" },
  sendText: { color: "#06101d", fontSize: 22, fontWeight: "900" }, footer: { textAlign: "center", color: "#7488a0", fontSize: 10, paddingBottom: 8 }
});