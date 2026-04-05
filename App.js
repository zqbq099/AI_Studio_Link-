import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  StatusBar,
  Alert
} from 'react-native';

const DATES_DATA = [
  {
    id: '1',
    name: 'تمر عجوة المدينة',
    price: '120 ريال',
    description: 'أفخر أنواع تمور العجوة العضوية من مزارع المدينة المنورة.',
    image: 'https://images.unsplash.com/photo-1581375221873-8d81a4421113?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: '2',
    name: 'تمر سكري ملكي',
    price: '85 ريال',
    description: 'سكري مفتل حبة كبيرة، يتميز بحلاوته الطبيعية وقوامه الهش.',
    image: 'https://images.unsplash.com/photo-1604542031651-5337d8914e58?q=80&w=500&auto=format&fit=crop'
  },
  {
    id: '3',
    name: 'تمر مجدول فاخر',
    price: '150 ريال',
    description: 'حبات المجدول الكبيرة والطرية، الخيار الأول للضيافة الفاخرة.',
    image: 'https://images.unsplash.com/photo-1596431243114-1e76166d1136?q=80&w=500&auto=format&fit=crop'
  },
];

export default function App() {
  const [cartCount, setCartCount] = useState(0);

  const addToCart = (itemName) => {
    setCartCount(cartCount + 1);
    Alert.alert('سلة المشتريات 🛒', `تم إضافة ${itemName} إلى السلة بنجاح!`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.title}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.button}
            onPress={() => addToCart(item.name)}
          >
            <Text style={styles.buttonText}>أضف للسلة ➕</Text>
          </TouchableOpacity>
          <Text style={styles.price}>{item.price}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.cartBadge}>
          <Text style={styles.cartText}>🛒 {cartCount}</Text>
        </View>
        <Text style={styles.headerTitle}>🌴 تمور الأصالة</Text>
      </View>

      {/* List */}
      <FlatList
        data={DATES_DATA}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#1e1e1e',
    borderBottomWidth: 1,
    borderBottomColor: '#d4af37',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  cartBadge: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  cartText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333',
  },
  image: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
    textAlign: 'right',
  },
  description: {
    fontSize: 14,
    color: '#aaaaaa',
    marginBottom: 15,
    textAlign: 'right',
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d4af37',
  },
  button: {
    backgroundColor: '#d4af37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: '#121212',
    fontWeight: 'bold',
    fontSize: 14,
  },
});