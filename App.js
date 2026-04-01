import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function CalculatorApp() {
  const [display, setDisplay] = useState('0');

  const handlePress = (val) => {
    if (display === '0') {
      setDisplay(val);
    } else {
      setDisplay(display + val);
    }
  };

  const calculate = () => {
    try {
      // استخدام eval للتبسيط في هذا المثال
      setDisplay(eval(display).toString());
    } catch (e) {
      setDisplay('خطأ');
    }
  };

  const clear = () => setDisplay('0');

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{display}</Text>
      </View>
      
      <View style={styles.buttonsContainer}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('7')}><Text style={styles.buttonText}>7</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('8')}><Text style={styles.buttonText}>8</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('9')}><Text style={styles.buttonText}>9</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.operator]} onPress={() => handlePress('/')}><Text style={styles.buttonText}>/</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('4')}><Text style={styles.buttonText}>4</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('5')}><Text style={styles.buttonText}>5</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('6')}><Text style={styles.buttonText}>6</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.operator]} onPress={() => handlePress('*')}><Text style={styles.buttonText}>*</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('1')}><Text style={styles.buttonText}>1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('2')}><Text style={styles.buttonText}>2</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('3')}><Text style={styles.buttonText}>3</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.operator]} onPress={() => handlePress('-')}><Text style={styles.buttonText}>-</Text></TouchableOpacity>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={[styles.button, styles.clearButton]} onPress={clear}><Text style={styles.buttonText}>C</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => handlePress('0')}><Text style={styles.buttonText}>0</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.equalButton]} onPress={calculate}><Text style={styles.buttonText}>=</Text></TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.operator]} onPress={() => handlePress('+')}><Text style={styles.buttonText}>+</Text></TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1e1e1e' },
  displayContainer: { flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 20, backgroundColor: '#000' },
  displayText: { fontSize: 60, color: '#fff' },
  buttonsContainer: { paddingBottom: 30, paddingTop: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  button: { backgroundColor: '#333', width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center' },
  operator: { backgroundColor: '#ff9500' },
  clearButton: { backgroundColor: '#a5a5a5' },
  equalButton: { backgroundColor: '#34c759' },
  buttonText: { fontSize: 30, color: '#fff', fontWeight: 'bold' }
});