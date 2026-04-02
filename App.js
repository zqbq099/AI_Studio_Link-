import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';

const KaaboolApp = () => {
  const [appName, setAppName] = useState('كعبول برو');
  const [appVersion, setAppVersion] = useState('1.0.0');
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('جاهز للعمل');
  const [progress, setProgress] = useState(0);

  const handleBuild = () => {
    if (!code.trim()) {
      setStatus('خطأ: يرجى إدخال الكود');
      return;
    }
    setStatus('جاري التحليل...');
    setProgress(30);
    setTimeout(() => { setStatus('جاري البناء...'); setProgress(70); }, 2000);
    setTimeout(() => { setStatus('اكتمل بنجاح! 🎉'); setProgress(100); }, 4000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.logo}>🤖 كعبول <Text style={{color: '#6366f1'}}>PRO</Text></Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.label}>إعدادات التطبيق</Text>
          <TextInput 
            style={styles.input} 
            value={appName} 
            onChangeText={setAppName} 
            placeholder="اسم التطبيق" 
            placeholderTextColor="#475569"
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>محرر الكود</Text>
          <TextInput
            style={[styles.input, styles.editor]}
            multiline
            value={code}
            onChangeText={setCode}
            placeholder="الصق كود React Native هنا..."
            placeholderTextColor="#475569"
          />
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.statusText}>الحالة: {status}</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleBuild}>
          <Text style={styles.btnText}>🚀 ابدأ البناء الآن</Text>
        </TouchableOpacity>

        <Text style={styles.footer}>صنع بواسطة كعبول AI © 2026</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020617' },
  header: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  logo: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  scroll: { padding: 20 },
  card: { backgroundColor: '#0f172a', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#1e293b' },
  label: { color: '#6366f1', fontSize: 12, fontWeight: 'bold', marginBottom: 10 },
  input: { backgroundColor: '#020617', color: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
  editor: { height: 200, textAlignVertical: 'top', fontFamily: 'monospace' },
  statusCard: { backgroundColor: '#1e293b', padding: 15, borderRadius: 15, marginBottom: 20 },
  statusText: { color: '#fff', marginBottom: 10, fontWeight: 'bold' },
  progressBg: { height: 8, backgroundColor: '#020617', borderRadius: 4 },
  progressFill: { height: '100%', backgroundColor: '#6366f1', borderRadius: 4 },
  btn: { backgroundColor: '#6366f1', padding: 18, borderRadius: 15, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  footer: { color: '#475569', textAlign: 'center', marginTop: 20, fontSize: 10 }
});

export default KaaboolApp;