import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import DeviceInfo from 'react-native-device-info';

// =================================================================
// !! هام جداً !!
// ضع مفتاح Gemini API الخاص بك هنا
// =================================================================
const GEMINI_API_KEY = 'YOUR_API_KEY';
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;


// --- شاشة دليل إعدادات APN ---
const ApnGuideScreen = ({ onBack }) => {
  const [query, setQuery] = useState('');
  const [apnList, setApnList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const askGemini = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setError('');
    setApnList([]);

    const prompt = `أنت خبير في إعدادات شبكات الهاتف المحمول (APN) عالمياً. 
    يريد المستخدم إعدادات APN مناسبة للمشكلة أو للشبكة التالية: "${query}".
    أعد الإعدادات المقترحة بصيغة JSON فقط، بدون أي نص إضافي قبلها أو بعدها. يجب أن يكون الرد مصفوفة من الكائنات (array of objects).
    كل كائن يجب أن يحتوي على الحقول التالية فقط: "name", "apn", "proxy", "port", "username", "password".
    إذا لم يكن الحقل متوفراً، اتركه فارغاً "".
    مثال للرد الصحيح:
    [{"name": "Internet", "apn": "internet", "proxy": "", "port": "", "username": "", "password": ""}, {"name": "MMS", "apn": "mms.provider.com", "proxy": "10.0.0.1", "port": "8080", "username": "", "password": ""}]
    `;

    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!response.ok) {
        throw new Error(`خطأ في الشبكة: ${response.status}`);
      }

      const data = await response.json();
      const jsonText = data.candidates[0].content.parts[0].text;
      
      // تنظيف النص لاستخراج JSON صالح
      const cleanedJsonText = jsonText.replace(/