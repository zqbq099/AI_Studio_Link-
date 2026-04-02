import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Linking,
  Alert
} from 'react-native';

// هذا هو الرابط السري لمصنعك (السيرفر الخاص بك)
const SERVER_URL = 'https://ais-pre-7ougyprfhdatt34vcmvai2-585872887532.europe-west2.run.app';

const KaaboolApp = () => {
  const [appName, setAppName] = useState('تطبيقي الأول');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('جاهز لاستقبال الأوامر');
  const [progress, setProgress] = useState(0);
  const [isBuilding, setIsBuilding] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState(null);
  
  const pollInterval = useRef(null);

  const startPolling = () => {
    if (pollInterval.current) clearInterval(pollInterval.current);
    
    // سيسأل السيرفر كل 5 ثوانٍ: هل انتهى البناء؟
    pollInterval.current = setInterval(async () => {
      try {
        const res = await fetch(`${SERVER_URL}/api/build/status`);
        const data = await res.json();

        if (data.status === 'in_progress' || data.status === 'queued') {
          setStatus('جاري البناء في مصانع GitHub...');
          setProgress(prev => (prev < 90 ? prev + 2 : 90));
        } else if (data.status === 'completed') {
          clearInterval(pollInterval.current);
          setIsBuilding(false);
          
          if (data.conclusion === 'success') {
            setStatus('اكتمل البناء بنجاح! 🎉');
            setProgress(100);
            if (data.artifactId) {
              setDownloadUrl(`${SERVER_URL}/api/download/${data.artifactId}`);
            } else {
               setDownloadUrl(data.url);
            }
            Alert.alert('مبروك!', 'تم بناء التطبيق بنجاح. يمكنك تحميله الآن.');
          } else {
            setStatus('فشل البناء ❌ الرجاء مراجعة الكود.');
            setProgress(0);
          }
        }
      } catch (err) {
        console.log('Polling error:', err);
      }
    }, 5000);
  };

  const handleBuild = async () => {
    if (!code.trim()) {
      Alert.alert('تنبيه', 'لا يمكن بناء هواء! ضع الكود أولاً.');
      return;
    }

    setIsBuilding(true);
    setDownloadUrl(null);
    setStatus('جاري إرسال الكود للسيرفر...');
    setProgress(10);

    try {
      // إرسال الطلب الحقيقي للسيرفر
      const response = await fetch(`${SERVER_URL}/api/build`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code,
          metadata: { name: appName, version: appVersion }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل الاتصال بالسيرفر');
      }

      setStatus('تم الاستلام! GitHub يبدأ العمل...');
      setProgress(20);
      startPolling();

    } catch (error) {
      setIsBuilding(false);
      setStatus('خطأ في الاتصال ❌');
      setProgress(0);
      Alert.alert('خطأ', error.message);
    }
  };

  const openDownload = () => {
    if (downloadUrl) {
      Linking.openURL(downloadUrl);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.logo}>🤖 كعبول <Text style={styles.accent}>PRO</Text></Text>
        <Text style={styles.subTitle}>النسخة الحقيقية المتصلة بالسيرفر</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.label}>إعدادات التطبيق</Text>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 2, marginRight: 10 }]} value={appName} onChangeText={setAppName} placeholder="اسم التطبيق" placeholderTextColor="#475569" editable={!isBuilding} />
            <TextInput style={[styles.input, { flex: 1 }]} value={appVersion} onChangeText={setAppVersion} placeholder="1.0.0" placeholderTextColor="#475569" editable={!isBuilding} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>محرر الكود</Text>
          <TextInput style={[styles.input, styles.editor]} multiline value={code} onChangeText={setCode} placeholder="الصق كود React Native هنا..." placeholderTextColor="#475569" editable={!isBuilding} autoCapitalize="none" autoCorrect={false} />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusText}>الحالة: <Text style={styles.accent}>{status}</Text></Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {!downloadUrl ? (
          <TouchableOpacity style={[styles.btn, isBuilding && styles.btnDisabled]} onPress={handleBuild} disabled={isBuilding}>
            <Text style={styles.btnText}>{isBuilding ? 'جاري العمل...' : '🚀 ابدأ البناء الحقيقي'}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.btn, styles.btnSuccess]} onPress={openDownload}>
            <Text style={styles.btnText}>⬇️ تحميل ملف الـ APK</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e293b', backgroundColor: '#0f172a' },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  accent: { color: '#6366f1' },
  subTitle: { color: '#94a3b8', fontSize: 12, marginTop: 5 },
  scroll: { padding: 20 },
  card: { backgroundColor: '#0f172a', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b' },
  row: { flexDirection: 'row' },
  label: { color: '#6366f1', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#020617', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  editor: { height: 200, textAlignVertical: 'top', fontFamily: 'monospace' },
  statusCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 15, marginBottom: 20 },
  statusText: { color: '#fff', marginBottom: 10, fontWeight: 'bold', fontSize: 13 },
  progressBg: { height: 8, backgroundColor: '#020617', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6366f1' },
  btn: { backgroundColor: '#6366f1', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnDisabled: { backgroundColor: '#475569' },
  btnSuccess: { backgroundColor: '#10b981' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 }
});

export default KaaboolApp;