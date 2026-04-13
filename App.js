=============== ملف: README.md ===============
# نت دكتور (Net Doctor)
تطبيق أندرويد لتشخيص وإصلاح مشاكل الإنترنت (3G/4G/5G) عالمياً، مع محلل ذكي لاستهلاك البيانات.

## الإعداد الأولي
1. أضف مفتاح Gemini API في ملف `local.properties`:
   GEMINI_API_KEY=YOUR_API_KEY
2. ضع ملف `apns.db` في مجلد `app/src/main/assets/`.
   (يمكنك الحصول عليه من مشروع LineageOS أو أي مصدر مفتوح)
3. شغّل التطبيق على جهاز حقيقي أو محاكي.

=============== ملف: app/build.gradle.kts ===============
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("dagger.hilt.android.plugin")
}

android {
    namespace = "com.netdoctor.app"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.netdoctor.app"
        minSdk = 28
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
        debug {
            buildConfigField("String", "GEMINI_API_KEY", "\"${project.findProperty("GEMINI_API_KEY") ?: ""}\"")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.8"
    }
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.1")
    implementation(platform("androidx.compose:compose-bom:2024.01.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    
    // Gemini
    implementation("com.google.ai.client.generativeai:generativeai:0.7.0")
    
    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    
    // Room
    implementation("androidx.room:room-runtime:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Charts
    implementation("com.github.PhilJay:MPAndroidChart:v3.1.0")
    
    // AdMob (اختياري للإعلانات)
    implementation("com.google.android.gms:play-services-ads:22.6.0")
}

=============== ملف: app/src/main/AndroidManifest.xml ===============
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.READ_PHONE_STATE" />
    <uses-permission android:name="android.permission.PACKAGE_USAGE_STATS" 
        tools:ignore="ProtectedPermissions" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <application
        android:name=".NetDoctorApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.NetDoctor"
        android:supportsRtl="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <!-- إعلانات AdMob (اختياري) -->
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ca-app-pub-3940256099942544~3347511713"/> <!-- معرف اختباري -->
    </application>
</manifest>

=============== ملف: app/src/main/java/com/netdoctor/app/NetDoctorApp.kt ===============
package com.netdoctor.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class NetDoctorApp : Application()

=============== ملف: app/src/main/java/com/netdoctor/app/di/AppModule.kt ===============
package com.netdoctor.app.di

import android.content.Context
import androidx.room.Room
import com.netdoctor.app.data.AppDatabase
import com.netdoctor.app.data.ApnRepository
import com.netdoctor.app.network.GeminiHelper
import com.netdoctor.app.network.NetworkDiagnosticsHelper
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "netdoctor_db"
        ).build()
    }
    
    @Provides
    @Singleton
    fun provideApnRepository(@ApplicationContext context: Context): ApnRepository {
        return ApnRepository(context)
    }
    
    @Provides
    @Singleton
    fun provideNetworkDiagnosticsHelper(@ApplicationContext context: Context): NetworkDiagnosticsHelper {
        return NetworkDiagnosticsHelper(context)
    }
    
    @Provides
    @Singleton
    fun provideGeminiHelper(): GeminiHelper {
        return GeminiHelper()
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/data/AppDatabase.kt ===============
package com.netdoctor.app.data

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters

@Database(
    entities = [AppUsageStat::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun appUsageDao(): AppUsageDao
}

=============== ملف: app/src/main/java/com/netdoctor/app/data/Converters.kt ===============
package com.netdoctor.app.data

import androidx.room.TypeConverter
import java.util.Date

class Converters {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? {
        return value?.let { Date(it) }
    }
    
    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? {
        return date?.time
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/data/AppUsageStat.kt ===============
package com.netdoctor.app.data

import androidx.room.Entity
import androidx.room.PrimaryKey
import java.util.Date

@Entity(tableName = "app_usage_stats")
data class AppUsageStat(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val packageName: String,
    val appName: String,
    val timestamp: Date,
    val mobileRxBytes: Long,
    val mobileTxBytes: Long,
    val wifiRxBytes: Long,
    val wifiTxBytes: Long,
    val foregroundTimeSeconds: Long
)

=============== ملف: app/src/main/java/com/netdoctor/app/data/AppUsageDao.kt ===============
package com.netdoctor.app.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface AppUsageDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(stat: AppUsageStat)
    
    @Query("""
        SELECT packageName, appName, 
               SUM(mobileRxBytes + mobileTxBytes) as totalMobileBytes,
               SUM(wifiRxBytes + wifiTxBytes) as totalWifiBytes,
               SUM(foregroundTimeSeconds) as totalForeground
        FROM app_usage_stats
        WHERE timestamp >= :startDate
        GROUP BY packageName
        ORDER BY totalMobileBytes DESC
    """)
    fun getUsageStatsSince(startDate: Date): Flow<List<AggregatedUsage>>
    
    data class AggregatedUsage(
        val packageName: String,
        val appName: String,
        val totalMobileBytes: Long,
        val totalWifiBytes: Long,
        val totalForeground: Long
    )
}

=============== ملف: app/src/main/java/com/netdoctor/app/data/ApnRepository.kt ===============
package com.netdoctor.app.data

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class ApnRepository(private val context: Context) {
    
    suspend fun getApnSettings(mcc: String, mnc: String): List<ApnConfig> = withContext(Dispatchers.IO) {
        val configs = mutableListOf<ApnConfig>()
        try {
            // افتراض وجود ملف apns.db في assets
            val dbFile = context.getDatabasePath("apns.db")
            if (!dbFile.exists()) {
                copyDatabaseFromAssets()
            }
            val db = SQLiteDatabase.openDatabase(dbFile.absolutePath, null, SQLiteDatabase.OPEN_READONLY)
            val cursor = db.rawQuery(
                "SELECT name, apn, proxy, port, username, password, server, mmsc, mmsproxy, mmsport, mcc, mnc, type FROM apns WHERE mcc=? AND mnc=?",
                arrayOf(mcc, mnc)
            )
            while (cursor.moveToNext()) {
                configs.add(
                    ApnConfig(
                        name = cursor.getString(0),
                        apn = cursor.getString(1),
                        proxy = cursor.getString(2),
                        port = cursor.getString(3),
                        username = cursor.getString(4),
                        password = cursor.getString(5),
                        server = cursor.getString(6),
                        mmsc = cursor.getString(7),
                        mmsProxy = cursor.getString(8),
                        mmsPort = cursor.getString(9),
                        mcc = cursor.getString(10),
                        mnc = cursor.getString(11),
                        type = cursor.getString(12)
                    )
                )
            }
            cursor.close()
            db.close()
        } catch (e: Exception) {
            e.printStackTrace()
        }
        configs
    }
    
    private fun copyDatabaseFromAssets() {
        context.assets.open("apns.db").use { input ->
            context.getDatabasePath("apns.db").outputStream().use { output ->
                input.copyTo(output)
            }
        }
    }
}

data class ApnConfig(
    val name: String,
    val apn: String,
    val proxy: String?,
    val port: String?,
    val username: String?,
    val password: String?,
    val server: String?,
    val mmsc: String?,
    val mmsProxy: String?,
    val mmsPort: String?,
    val mcc: String?,
    val mnc: String?,
    val type: String?
)

=============== ملف: app/src/main/java/com/netdoctor/app/network/NetworkDiagnosticsHelper.kt ===============
package com.netdoctor.app.network

import android.content.Context
import android.net.ConnectivityManager
import android.net.NetworkCapabilities
import android.net.wifi.WifiManager
import android.telephony.TelephonyManager
import android.telephony.TelephonyManager.NETWORK_TYPE_UNKNOWN
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

class NetworkDiagnosticsHelper(private val context: Context) {
    
    private val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager
    private val telephonyManager = context.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
    private val wifiManager = context.applicationContext.getSystemService(Context.WIFI_SERVICE) as WifiManager
    
    private val _networkInfo = MutableStateFlow(NetworkInfo())
    val networkInfo: StateFlow<NetworkInfo> = _networkInfo
    
    data class NetworkInfo(
        val networkType: String = "غير معروف",
        val signalStrength: Int = 0,
        val ipAddress: String = "",
        val isConnected: Boolean = false,
        val mcc: String = "",
        val mnc: String = ""
    )
    
    fun refresh() {
        val caps = connectivityManager.getNetworkCapabilities(connectivityManager.activeNetwork)
        val isConnected = caps != null
        var networkType = "غير متصل"
        var ip = ""
        
        if (isConnected) {
            when {
                caps.hasTransport(NetworkCapabilities.TRANSPORT_WIFI) -> {
                    networkType = "Wi-Fi"
                    ip = getWifiIpAddress()
                }
                caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR) -> {
                    networkType = getMobileNetworkType()
                    ip = getMobileIpAddress()
                }
            }
        }
        
        val signalStrength = if (isConnected && caps.hasTransport(NetworkCapabilities.TRANSPORT_CELLULAR)) {
            getMobileSignalStrength()
        } else 0
        
        val mcc = telephonyManager.networkOperator?.take(3) ?: ""
        val mnc = telephonyManager.networkOperator?.drop(3) ?: ""
        
        _networkInfo.value = NetworkInfo(
            networkType = networkType,
            signalStrength = signalStrength,
            ipAddress = ip,
            isConnected = isConnected,
            mcc = mcc,
            mnc = mnc
        )
    }
    
    private fun getWifiIpAddress(): String {
        val ip = wifiManager.connectionInfo.ipAddress
        return String.format("%d.%d.%d.%d", ip and 0xff, ip shr 8 and 0xff, ip shr 16 and 0xff, ip shr 24 and 0xff)
    }
    
    private fun getMobileIpAddress(): String = "غير متاح" // يمكن تحسينه لاحقاً
    
    private fun getMobileNetworkType(): String {
        return when (telephonyManager.dataNetworkType) {
            TelephonyManager.NETWORK_TYPE_LTE -> "4G LTE"
            TelephonyManager.NETWORK_TYPE_NR -> "5G"
            TelephonyManager.NETWORK_TYPE_UMTS -> "3G"
            else -> "خلوي"
        }
    }
    
    private fun getMobileSignalStrength(): Int {
        // تحتاج صلاحية READ_PHONE_STATE
        return 0 // تبسيط
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/network/GeminiHelper.kt ===============
package com.netdoctor.app.network

import com.google.ai.client.generativeai.GenerativeModel
import com.google.ai.client.generativeai.type.content
import com.netdoctor.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray

class GeminiHelper {
    
    private val model = GenerativeModel(
        modelName = "gemini-1.5-flash",
        apiKey = BuildConfig.GEMINI_API_KEY
    )
    
    suspend fun getApnSuggestions(userQuery: String): List<ApnConfig> = withContext(Dispatchers.IO) {
        try {
            val prompt = """
                أنت خبير في إعدادات شبكات الهاتف المحمول عالمياً.
                يريد المستخدم إعدادات APN مناسبة للمشكلة التالية:
                "$userQuery"
                
                أعد الإعدادات المقترحة بصيغة JSON بالقوائم التالية (name, apn, proxy, port, username, password).
                مثال:
                [{"name": "Internet", "apn": "internet", "proxy": "", "port": "", "username": "", "password": ""}]
            """.trimIndent()
            
            val response = model.generateContent(content { text(prompt) })
            val jsonText = response.text ?: return@withContext emptyList()
            
            parseApnJson(jsonText)
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    suspend fun getUsageRecommendation(summary: String): String = withContext(Dispatchers.IO) {
        try {
            val prompt = """
                أنت خبير في توفير استهلاك بيانات الهاتف.
                بناءً على التحليل التالي لاستهلاك المستخدم:
                $summary
                
                قدم توصية واحدة واضحة ومفيدة باللغة العربية لتقليل استهلاك البيانات.
            """.trimIndent()
            val response = model.generateContent(content { text(prompt) })
            response.text ?: "لا توجد توصيات حالياً."
        } catch (e: Exception) {
            "تعذر الحصول على توصية. حاول لاحقاً."
        }
    }
    
    private fun parseApnJson(jsonText: String): List<ApnConfig> {
        val configs = mutableListOf<ApnConfig>()
        try {
            val jsonArray = JSONArray(jsonText.substringAfter('[').substringBeforeLast(']').let { "[$it]" })
            for (i in 0 until jsonArray.length()) {
                val obj = jsonArray.getJSONObject(i)
                configs.add(
                    ApnConfig(
                        name = obj.optString("name", ""),
                        apn = obj.optString("apn", ""),
                        proxy = obj.optString("proxy", ""),
                        port = obj.optString("port", ""),
                        username = obj.optString("username", ""),
                        password = obj.optString("password", ""),
                        server = null, mmsc = null, mmsProxy = null, mmsPort = null, mcc = null, mnc = null, type = null
                    )
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return configs
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/MainActivity.kt ===============
package com.netdoctor.app.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.netdoctor.app.ui.screens.*
import com.netdoctor.app.ui.theme.NetDoctorTheme
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NetDoctorTheme {
                Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = "home") {
                        composable("home") { HomeScreen(navController) }
                        composable("apn_guide") { ApnGuideScreen() }
                        composable("usage_analytics") { UsageAnalyticsScreen() }
                    }
                }
            }
        }
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/screens/HomeScreen.kt ===============
package com.netdoctor.app.ui.screens

import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.navigation.NavController
import com.netdoctor.app.ui.components.NetworkCard
import com.netdoctor.app.ui.viewmodels.HomeViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(navController: NavController, viewModel: HomeViewModel = hiltViewModel()) {
    val context = LocalContext.current
    val networkInfo by viewModel.networkInfo.collectAsState()
    val recommendation by viewModel.recommendation.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.refreshNetworkInfo()
        viewModel.generateRecommendation()
    }
    
    Scaffold(
        topBar = { TopAppBar(title = { Text("نت دكتور") }) }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            NetworkCard(networkInfo = networkInfo, onRefresh = { viewModel.refreshNetworkInfo() })
            
            Button(
                onClick = { navController.navigate("apn_guide") },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("دليل إعدادات APN")
            }
            
            Button(
                onClick = { navController.navigate("usage_analytics") },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("تحليلات الاستهلاك")
            }
            
            if (!viewModel.hasUsageStatsPermission()) {
                Card(
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("يلزم تفعيل صلاحية الوصول لبيانات الاستخدام لتقديم تحليلات دقيقة.")
                        Button(onClick = {
                            context.startActivity(Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS))
                        }) {
                            Text("تفعيل")
                        }
                    }
                }
            }
            
            if (recommendation.isNotBlank()) {
                Card {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text("💡 توصية اليوم:", style = MaterialTheme.typography.titleMedium)
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(recommendation)
                    }
                }
            }
        }
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/screens/ApnGuideScreen.kt ===============
package com.netdoctor.app.ui.screens

import android.content.Intent
import android.provider.Settings
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.netdoctor.app.data.ApnConfig
import com.netdoctor.app.ui.viewmodels.ApnGuideViewModel

@Composable
fun ApnGuideScreen(viewModel: ApnGuideViewModel = hiltViewModel()) {
    val context = LocalContext.current
    val apnList by viewModel.apnList.collectAsState()
    val isGeminiLoading by viewModel.isGeminiLoading.collectAsState()
    var query by remember { mutableStateOf("") }
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("اسأل Gemini عن إعدادات") },
            modifier = Modifier.fillMaxWidth()
        )
        Button(
            onClick = { viewModel.askGemini(query) },
            enabled = query.isNotBlank() && !isGeminiLoading,
            modifier = Modifier.padding(vertical = 8.dp)
        ) {
            Text(if (isGeminiLoading) "جاري السؤال..." else "اسأل Gemini")
        }
        
        Text("الإعدادات المقترحة:", style = MaterialTheme.typography.titleMedium)
        LazyColumn {
            items(apnList) { apn ->
                ApnItem(apn = apn) {
                    // فتح شاشة إعدادات APN
                    context.startActivity(Intent(Settings.ACTION_APN_SETTINGS))
                }
            }
        }
    }
}

@Composable
fun ApnItem(apn: ApnConfig, onClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp),
        onClick = onClick
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("الاسم: ${apn.name}")
            Text("APN: ${apn.apn}")
            if (!apn.username.isNullOrBlank()) Text("اسم المستخدم: ${apn.username}")
            // ... عرض باقي التفاصيل
        }
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/screens/UsageAnalyticsScreen.kt ===============
package com.netdoctor.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.netdoctor.app.ui.components.UsageChart
import com.netdoctor.app.ui.viewmodels.UsageViewModel

@Composable
fun UsageAnalyticsScreen(viewModel: UsageViewModel = hiltViewModel()) {
    val stats by viewModel.usageStats.collectAsState()
    
    LaunchedEffect(Unit) {
        viewModel.collectStats()
    }
    
    Column(modifier = Modifier.fillMaxSize().padding(16.dp)) {
        Text("إجمالي استهلاك الجوال: ${viewModel.totalMobileData()}")
        UsageChart(stats = stats)
        LazyColumn {
            items(stats) { stat ->
                Card(modifier = Modifier.fillMaxWidth().padding(vertical = 4.dp)) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(stat.appName)
                        Text("بيانات الجوال: ${stat.totalMobileBytes / 1024 / 1024} MB")
                        Text("بيانات الواي فاي: ${stat.totalWifiBytes / 1024 / 1024} MB")
                    }
                }
            }
        }
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/components/NetworkCard.kt ===============
package com.netdoctor.app.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.netdoctor.app.network.NetworkDiagnosticsHelper

@Composable
fun NetworkCard(networkInfo: NetworkDiagnosticsHelper.NetworkInfo, onRefresh: () -> Unit) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("حالة الشبكة", style = MaterialTheme.typography.titleMedium)
            Spacer(modifier = Modifier.height(8.dp))
            Text("النوع: ${networkInfo.networkType}")
            Text("قوة الإشارة: ${networkInfo.signalStrength}%")
            Text("IP: ${networkInfo.ipAddress}")
            Text("MCC/MNC: ${networkInfo.mcc}/${networkInfo.mnc}")
            Button(onClick = onRefresh, modifier = Modifier.padding(top = 8.dp)) {
                Text("تحديث")
            }
        }
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/components/UsageChart.kt ===============
package com.netdoctor.app.ui.components

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import com.github.mikephil.charting.charts.PieChart
import com.github.mikephil.charting.data.PieData
import com.github.mikephil.charting.data.PieDataSet
import com.github.mikephil.charting.data.PieEntry
import com.netdoctor.app.data.AppUsageDao

@Composable
fun UsageChart(stats: List<AppUsageDao.AggregatedUsage>, modifier: Modifier = Modifier) {
    AndroidView(
        factory = { context ->
            PieChart(context).apply {
                val entries = stats.map { PieEntry(it.totalMobileBytes.toFloat(), it.appName) }
                val dataSet = PieDataSet(entries, "استهلاك الجوال")
                data = PieData(dataSet)
                invalidate()
            }
        },
        modifier = modifier.fillMaxWidth().height(200.dp)
    )
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/viewmodels/HomeViewModel.kt ===============
package com.netdoctor.app.ui.viewmodels

import android.app.usage.UsageStatsManager
import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.netdoctor.app.data.AppUsageDao
import com.netdoctor.app.network.GeminiHelper
import com.netdoctor.app.network.NetworkDiagnosticsHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val networkHelper: NetworkDiagnosticsHelper,
    private val geminiHelper: GeminiHelper,
    private val appUsageDao: AppUsageDao,
    private val context: Context
) : ViewModel() {
    
    val networkInfo = networkHelper.networkInfo
    
    private val _recommendation = MutableStateFlow("")
    val recommendation: StateFlow<String> = _recommendation
    
    fun refreshNetworkInfo() {
        networkHelper.refresh()
    }
    
    fun hasUsageStatsPermission(): Boolean {
        val usm = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val now = System.currentTimeMillis()
        val stats = usm.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, now - 1000 * 60 * 60 * 24, now)
        return stats.isNotEmpty()
    }
    
    fun generateRecommendation() {
        viewModelScope.launch {
            val startDate = Date(System.currentTimeMillis() - 7 * 24 * 60 * 60 * 1000) // أسبوع
            val stats = appUsageDao.getUsageStatsSince(startDate).firstOrNull() ?: emptyList()
            if (stats.isNotEmpty()) {
                val top = stats.take(3).joinToString("\n") {
                    "${it.appName}: ${it.totalMobileBytes / 1024 / 1024} MB"
                }
                val rec = geminiHelper.getUsageRecommendation("أعلى التطبيقات استهلاكاً للجوال:\n$top")
                _recommendation.value = rec
            }
        }
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/viewmodels/ApnGuideViewModel.kt ===============
package com.netdoctor.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.netdoctor.app.data.ApnConfig
import com.netdoctor.app.data.ApnRepository
import com.netdoctor.app.network.GeminiHelper
import com.netdoctor.app.network.NetworkDiagnosticsHelper
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ApnGuideViewModel @Inject constructor(
    private val repository: ApnRepository,
    private val geminiHelper: GeminiHelper,
    private val networkHelper: NetworkDiagnosticsHelper
) : ViewModel() {
    
    private val _apnList = MutableStateFlow<List<ApnConfig>>(emptyList())
    val apnList: StateFlow<List<ApnConfig>> = _apnList
    
    private val _isGeminiLoading = MutableStateFlow(false)
    val isGeminiLoading = _isGeminiLoading.asStateFlow()
    
    init {
        loadLocalApns()
    }
    
    private fun loadLocalApns() {
        viewModelScope.launch {
            val info = networkHelper.networkInfo.value
            if (info.mcc.isNotBlank() && info.mnc.isNotBlank()) {
                val configs = repository.getApnSettings(info.mcc, info.mnc)
                _apnList.value = configs
            }
        }
    }
    
    fun askGemini(query: String) {
        viewModelScope.launch {
            _isGeminiLoading.value = true
            try {
                val suggestions = geminiHelper.getApnSuggestions(query)
                _apnList.value = suggestions
            } finally {
                _isGeminiLoading.value = false
            }
        }
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/viewmodels/UsageViewModel.kt ===============
package com.netdoctor.app.ui.viewmodels

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.netdoctor.app.data.AppUsageDao
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import java.util.*
import javax.inject.Inject

@HiltViewModel
class UsageViewModel @Inject constructor(
    private val appUsageDao: AppUsageDao
) : ViewModel() {
    
    private val _usageStats = MutableStateFlow<List<AppUsageDao.AggregatedUsage>>(emptyList())
    val usageStats: StateFlow<List<AppUsageDao.AggregatedUsage>> = _usageStats
    
    fun collectStats() {
        viewModelScope.launch {
            val startDate = Date(System.currentTimeMillis() - 30L * 24 * 60 * 60 * 1000)
            appUsageDao.getUsageStatsSince(startDate).collect { stats ->
                _usageStats.value = stats
            }
        }
    }
    
    fun totalMobileData(): String {
        val total = _usageStats.value.sumOf { it.totalMobileBytes }
        return "${total / 1024 / 1024} MB"
    }
}

=============== ملف: app/src/main/java/com/netdoctor/app/ui/theme/Theme.kt ===============
package com.netdoctor.app.ui.theme

import androidx.compose.material3.*
import androidx.compose.runtime.Composable

@Composable
fun NetDoctorTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = lightColorScheme(),
        typography = Typography(),
        content = content
    )
}