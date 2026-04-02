import React, { useState, useRef, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  ScrollView, SafeAreaView, StatusBar, Linking, Alert, 
  ActivityIndicator, Animated, KeyboardAvoidingView, Platform 
} from 'react-native';

// إعدادات المصنع
const SERVER_URL = 'https://ais-pre-7ougyprfhdatt34vcmvai2-585872887532.europe-west2.run.app';

export default function App() {
  // حالات التطبيق (States)
  const [appName, setAppName] = useState('تطبيقي الذكي');
  const [prompt, setPrompt] = useState(''); 
  const [generatedCode, setGeneratedCode] = useState('');
  const [status, setStatus] = useState('جاهز لصناعة المستحيل 🚀');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState(null);

  // أنيميشن للواجهة
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const pollInterval = useRef(null);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
    ]).start();
  }, []);

  // 1. ميزة الذكاء الاصطناعي: تحويل الكلام إلى كود
  const askKaaboolAI = async () => {
    if (!prompt.trim()) return Alert.alert('مهلاً!', 'أخبر كعبول ماذا تريد أن يصنع لك أولاً.');
    
    setIsAiLoading(true);
    setStatus('كعبول يفكر في الكود الأمثل... 🤔');
    
    try {
      const response = await fetch(`${SERVER_URL}/api/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt })
      });
      const data = await response.json();
      if (data.code) {
        setGeneratedCode(data.code);
        setStatus('تم توليد الكود بنجاح! راجعه ثم ابدأ البناء.');
      } else {
        setStatus('فشل في توليد الكود، حاول مرة أخرى.');
      }
    } catch (error) {
      Alert.alert('خطأ AI', 'تعذر الاتصال بمخ كعبول الإلكتروني.');
      setStatus('حدث خطأ في الاتصال ❌');
    } finally {
      setIsAiLoading(false);
    }
  };

  // 2. ميزة البناء السحابي (GitHub Integration)
  const startCloudBuild = async () => {
    if (!generatedCode.trim()) return Alert.alert('خطأ', 'لا يوجد كود لبنائه!');
    
    setIsBuilding(true);
    setDownloadUrl(null);
    setProgress(10);
    setStatus('يتم الآن نقل الكود إلى مستودع GitHub... ✈️');

    try {
      const response = await fetch(`${SERVER_URL}/api/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: generatedCode, 
          repo: 'zqbq099/AI_Studio_Link-',
          metadata: { name: appName }
        })
      });
      
      if (response.ok) {
        setStatus('وصل الكود للمصنع! جاري تشغيل المطارق... 🛠️');
        startPolling();
      } else {
        throw new Error('فشل السيرفر في استلام الطلب');
      }
    } catch (error) {
      setIsBuilding(false);
      setStatus('حدث خطأ في الجسر السحابي ❌');
    }
  };

  // 3. متابعة حالة البناء (Real-time Status)
  const startPolling = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/build/status`);
        const data = await res.json();
        
        if (data.status === 'completed') {
          clearInterval(pollInterval.current);
          setIsBuilding(false);
          setProgress(100);
          if (data.conclusion === 'success') {
            setStatus('اكتمل البناء! تطبيقك جاهز للعالم 🎉');
            setDownloadUrl(data.url || `${SERVER_URL}/api/download/latest`);
          } else {
            setStatus('للأسف فشل البناء في GitHub 💔');
          }
        } else {
          setProgress(prev => (prev < 95 ? prev + 1 : 95));
        }
      } catch (e) { 
        console.log("Polling error:", e); 
      }
    }, 7000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Animated.View style={[styles.header, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.logo}>🤖 كعبول <Text style={styles.pro}>ULTRA</Text></Text>
          <Text style={styles.tagline}>من الفكرة إلى الـ APK في جيبك</Text>
        </Animated.View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          
          {/* قسم اسم التطبيق */}
          <View style={styles.section}>
            <Text style={styles.label}>اسم مشروعك المستقبلي</Text>
            <TextInput 
              style={styles.input} 
              value={appName} 
              onChangeText={setAppName} 
              placeholder="مثلاً: متجر السعادة" 
              placeholderTextColor="#475569"
            />
          </View>

          {/* قسم المساعد الذكي */}
          <View style={styles.aiSection}>
            <Text style={[styles.label, { color: '#818cf8' }]}>اطلب من كعبول (بالعربي)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              multiline 
              value={prompt}
              onChangeText={setPrompt}
              placeholder="مثال: اصنع لي تطبيق آلة حاسبة احترافية بلون ذهبي..."
              placeholderTextColor="#475569"
            />
            <TouchableOpacity 
              style={[styles.aiBtn, isAiLoading && styles.disabled]} 
              onPress={askKaaboolAI}
              disabled={isAiLoading}
            >
              {isAiLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>✨ توليد الكود بالذكاء الاصطناعي</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* محرر الكود */}
          {generatedCode ? (
            <View style={styles.section}>
              <Text style={styles.label}>الكود المولد (جاهز للتعديل)</Text>
              <TextInput 
                style={[styles.input, styles.codeEditor]} 
                multiline 
                value={generatedCode}
                onChangeText={setGeneratedCode}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          ) : null}

          {/* حالة البناء والتقدم */}
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>{status}</Text>
            {(isBuilding || progress > 0) && (
              <View style={styles.progressContainer}>
                <Animated.View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
            )}
          </View>

          {/* أزرار الأكشن النهائية */}
          {!downloadUrl ? (
            <TouchableOpacity 
              style={[styles.buildBtn, (isBuilding || !generatedCode) && styles.disabled]} 
              onPress={startCloudBuild}
              disabled={isBuilding || !generatedCode}
            >
              <Text style={styles.btnText}>{isBuilding ? 'جاري الصهر والبناء...' : '🚀 إرسال للمصنع السحابي'}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={styles.downloadBtn} 
              onPress={() => Linking.openURL(downloadUrl)}
            >
              <Text style={styles.btnText}>📥 تحميل ملف الـ APK الآن</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { 
    paddingTop: 20,
    paddingBottom: 25, 
    alignItems: 'center', 
    backgroundColor: '#0f172a', 
    borderBottomWidth: 1, 
    borderBottomColor: '#1e293b' 
  },
  logo: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  pro: { color: '#6366f1', fontStyle: 'italic' },
  tagline: { color: '#94a3b8', fontSize: 13, marginTop: 5 },
  scroll: { padding: 20 },
  section: { marginBottom: 25 },
  aiSection: { 
    backgroundColor: '#1e293b', 
    padding: 15, 
    borderRadius: 24, 
    marginBottom: 25, 
    borderWidth: 1, 
    borderColor: '#334155',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  label: { color: '#6366f1', fontSize: 15, fontWeight: 'bold', marginBottom: 10, marginLeft: 5 },
  input: { 
    backgroundColor: '#020617', 
    color: '#fff', 
    padding: 18, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: '#334155', 
    fontSize: 16,
    textAlign: 'right'
  },
  textArea: { height: 120, textAlignVertical: 'top' },
  codeEditor: { 
    height: 300, 
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', 
    fontSize: 13, 
    color: '#10b981', 
    textAlign: 'left' 
  },
  aiBtn: { 
    backgroundColor: '#4f46e5', 
    padding: 18, 
    borderRadius: 15, 
    marginTop: 15, 
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  buildBtn: { 
    backgroundColor: '#6366f1', 
    padding: 22, 
    borderRadius: 18, 
    alignItems: 'center', 
    shadowColor: '#6366f1', 
    shadowOpacity: 0.4, 
    shadowRadius: 12, 
    elevation: 8 
  },
  downloadBtn: { 
    backgroundColor: '#10b981', 
    padding: 22, 
    borderRadius: 18, 
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8
  },
  disabled: { opacity: 0.5 },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
  statusBox: { padding: 15, alignItems: 'center', marginBottom: 20 },
  statusText: { color: '#94a3b8', fontSize: 15, textAlign: 'center', fontWeight: '500' },
  progressContainer: { 
    width: '100%', 
    height: 8, 
    backgroundColor: '#0f172a', 
    borderRadius: 4, 
    marginTop: 15, 
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1e293b'
  },
  progressBar: { height: '100%', backgroundColor: '#6366f1' }
});