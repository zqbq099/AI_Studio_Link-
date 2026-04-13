import React, 'react';
import {
  StyleSheet,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Alert,
  Platform,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// --- Configuration ---
// هام: يجب استبدال هذا المفتاح بمفتاح Gemini API الخاص بك
const GEMINI_API_KEY = AIzaSyC0p7Qkoo5gjrp7Yz6by06iWZQKL8S0teg

// --- Mock Data ---
// لا يمكن لـ React Native الوصول إلى إحصائيات استخدام التطبيقات بدون كود أصلي معقد.
// لذلك، سنستخدم بيانات وهمية لعرض الفكرة.
const MOCK_USAGE_STATS = [
  { appName: 'يوتيوب', totalMobileBytes: 540 * 1024 * 1024, totalWifiBytes: 1200 * 1024 * 1024 },
  { appName: 'تيك توك', totalMobileBytes: 320 * 1024 * 1024, totalWifiBytes: 800 * 1024 * 1024 },
  { appName: 'فيسبوك', totalMobileBytes: 150 * 1024 * 1024, totalWifiBytes: 400 * 1024 * 1024 },
  { appName: 'واتساب', totalMobileBytes: 80 * 1024 * 1024, totalWifiBytes: 250 * 1024 * 1024 },
];


// --- API Helper (Gemini) ---

// دالة للتواصل مع Gemini للحصول على اقتراحات APN
async function getApnSuggestions(userQuery) {
  const prompt = `أنت خبير في إعدادات شبكات الهاتف المحمول عالمياً. المستخدم يطلب إعدادات APN لهذه الحالة: "${userQuery}".
أعد الإعدادات المقترحة بصيغة JSON فقط داخل مصفوفة. كل عنصر يجب أن يحتوي على: name, apn, username, password, proxy, port.
مثال: [{"name": "Internet", "apn": "internet", "proxy": "", "port": "", "username": "", "password": ""}]`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await response.json();
    const jsonText = data.candidates[0].content.parts[0].text;
    
    // تنظيف استجابة Gemini لاستخراج JSON فقط
    const cleanedJson = jsonText.substring(jsonText.indexOf('['), jsonText.lastIndexOf(']') + 1);
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Gemini APN Error:", error);
    return [];
  }
}

// دالة للحصول على توصية لتوفير البيانات
async function getUsageRecommendation(usageSummary) {
    const prompt = `أنت خبير في توفير استهلاك بيانات الهاتف. بناءً على التحليل التالي لاستهلاك المستخدم:
${usageSummary}
قدم توصية واحدة واضحة ومفيدة باللغة العربية لا تزيد عن سطرين لتقليل استهلاك البيانات.`;
    
    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        });
        const data = await response.json();
        return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
        console.error("Gemini Recommendation Error:", error);
        return "تعذر الحصول على توصية. حاول لاحقاً.";
    }
}

// --- Components ---

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const NetworkCard = ({ networkInfo, onRefresh }) => (
  <Card>
    <Text style={styles.cardTitle}>حالة الشبكة</Text>
    <Text style={styles.infoText}>النوع: {networkInfo.networkType}</Text>
    <Text style={styles.infoText}>قوة الإشارة: {networkInfo.signalStrength}%</Text>
    <Text style={styles.infoText}>IP: {networkInfo.ipAddress}</Text>
    <Text style={styles.infoText}>MCC/MNC: {networkInfo.mcc}/{networkInfo.mnc}</Text>
    <TouchableOpacity style={styles.buttonSmall} onPress={onRefresh}>
      <Text style={styles.buttonText}>تحديث</Text>
    </TouchableOpacity>
  </Card>
);

const ApnItem = ({ item }) => (
    <TouchableOpacity onPress={() => {
        // هذه الوظيفة تفتح إعدادات APN مباشرة في الأندرويد
        if (Platform.OS === 'android') {
            Linking.sendIntent('android.settings.APN_SETTINGS').catch(() => {
                Alert.alert("خطأ", "لا يمكن فتح إعدادات APN مباشرة. يرجى فتحها يدوياً من إعدادات الهاتف.");
            });
        } else {
             Alert.alert("غير مدعوم", "هذه الميزة متاحة فقط على أندرويد.");
        }
    }}>
        <Card>
            <Text style={styles.apnTitle}>الاسم: {item.name}</Text>
            <Text>APN: {item.apn}</Text>
            {item.username ? <Text>اسم المستخدم: {item.username}</Text> : null}
        </Card>
    </TouchableOpacity>
);

// --- Screens ---

function HomeScreen({ navigation }) {
    const [networkInfo, setNetworkInfo] = React.useState({
        networkType: '4G LTE',
        signalStrength: 85,
        ipAddress: '10.0.2.16',
        isConnected: true,
        mcc: '420',
        mnc: '01',
    });
    const [recommendation, setRecommendation] = React.useState("جاري توليد التوصية...");

    React.useEffect(() => {
        // في تطبيق حقيقي، سنستخدم مكتبة مثل @react-native-community/netinfo
        // هنا، نحن نحاكي عملية التحديث
        console.log("تحديث معلومات الشبكة...");
        
        // جلب توصية عند تحميل الشاشة
        const fetchRecommendation = async () => {
             const topUsage = MOCK_USAGE_STATS
                .slice(0, 3)
                .map(stat => `${stat.appName}: ${Math.round(stat.totalMobileBytes / (1024*1024))} MB`)
                .join('\n');
            const summary = `أعلى التطبيقات استهلاكاً للجوال:\n${topUsage}`;
            const rec = await getUsageRecommendation(summary);
            setRecommendation(rec);
        };

        fetchRecommendation();
    }, []);

    const refreshNetworkInfo = () => {
        setNetworkInfo(prev => ({ ...prev, signalStrength: Math.floor(Math.random() * (95 - 70 + 1) + 70) }));
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>نت دكتور</Text>

                <NetworkCard networkInfo={networkInfo} onRefresh={refreshNetworkInfo} />
                
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ApnGuide')}>
                    <Text style={styles.buttonText}>دليل إعدادات APN</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UsageAnalytics')}>
                    <Text style={styles.buttonText}>تحليلات الاستهلاك</Text>
                </TouchableOpacity>

                <Card style={{ backgroundColor: '#fff8e1' }}>
                    <Text style={styles.cardTitle}>💡 توصية اليوم</Text>
                    <Text>{recommendation}</Text>
                </Card>

            </ScrollView>
        </SafeAreaView>
    );
}

function ApnGuideScreen() {
    const [query, setQuery] = React.useState('');
    const [apnList, setApnList] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleAskGemini = async () => {
        if (!query.trim() || GEMINI_API_KEY === "YOUR_GEMINI_API_KEY") {
            Alert.alert("خطأ", "الرجاء إدخال وصف لمشكلتك أو بلدك والمشغل، والتأكد من إضافة مفتاح API.");
            return;
        }
        setIsLoading(true);
        setApnList([]);
        const suggestions = await getApnSuggestions(query);
        setApnList(suggestions);
        setIsLoading(false);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.header}>دليل إعدادات APN</Text>
                <TextInput
                    style={styles.input}
                    placeholder="مثال: موبايلي السعودية للإنترنت"
                    value={query}
                    onChangeText={setQuery}
                />
                <TouchableOpacity style={styles.button} onPress={handleAskGemini} disabled={isLoading}>
                    <Text style={styles.buttonText}>{isLoading ? "جاري البحث..." : "اسأل Gemini"}</Text>
                </TouchableOpacity>
                
                {isLoading && <ActivityIndicator size="large" color="#007bff" />}

                {apnList.length > 0 && (
                     <ScrollView>
                        {apnList.map((item, index) => <ApnItem key={index} item={item} />)}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

function UsageAnalyticsScreen() {
    const totalMobileData = MOCK_USAGE_STATS.reduce((sum, stat) => sum + stat.totalMobileBytes, 0);
    const totalMobileDataMB = Math.round(totalMobileData / (1024 * 1024));

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.content}>
                <Text style={styles.header}>تحليلات الاستهلاك</Text>
                <Card>
                   <Text style={styles.totalUsageText}>إجمالي استهلاك الجوال: {totalMobileDataMB} MB</Text>
                </Card>
                
                {/* في تطبيق حقيقي، يمكن إضافة رسم بياني هنا باستخدام مكتبة مثل react-native-pie-chart */}
                <View style={styles.chartPlaceholder}>
                    <Text style={styles.placeholderText}>مكان الرسم البياني</Text>
                </View>

                {MOCK_USAGE_STATS.map((stat, index) => (
                    <Card key={index}>
                        <Text style={styles.appName}>{stat.appName}</Text>
                        <Text>بيانات الجوال: {Math.round(stat.totalMobileBytes / (1024 * 1024))} MB</Text>
                        <Text>بيانات الواي فاي: {Math.round(stat.totalWifiBytes / (1024 * 1024))} MB</Text>
                    </Card>
                ))}
            </ScrollView>
        </SafeAreaView>
    );
}


// --- App Navigation ---
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ApnGuide" component={ApnGuideScreen} />
        <Stack.Screen name="UsageAnalytics" component={UsageAnalyticsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  content: {
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0056b3',
  },
  infoText: {
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonSmall: {
    backgroundColor: '#6c757d',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'right',
  },
  apnTitle: {
      fontSize: 16,
      fontWeight: 'bold',
  },
  totalUsageText: {
      fontSize: 18,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#d9534f'
  },
  chartPlaceholder: {
      height: 200,
      backgroundColor: '#e9ecef',
      borderRadius: 8,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
  },
  placeholderText: {
      color: '#6c757d',
      fontSize: 16,
  },
  appName: {
      fontSize: 16,
      fontWeight: 'bold',
  }
});