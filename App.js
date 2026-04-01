import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function App() {
  const [display, setDisplay] = useState('0');

  const handlePress = (val) => {
    if (val === '=') {
      try { setDisplay(eval(display).toString()); } 
      catch (e) { setDisplay('Error'); }
    } else if (val === 'C') {
      setDisplay('0');
    } else {
      setDisplay(display === '0' ? val : display + val);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.display}>{display}</Text>
      <View style={styles.buttons}>
        {['1','2','3','+','4','5','6','-','7','8','9','*','C','0','=','/'].map(b => (
          <TouchableOpacity key={b} style={styles.button} onPress={() => handlePress(b)}>
            <Text style={styles.btnText}>{b}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#222' },
  display: { fontSize: 60, color: 'white', textAlign: 'right', padding: 20 },
  buttons: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  button: { width: '20%', aspectRatio: 1, backgroundColor: '#444', margin: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  btnText: { fontSize: 30, color: 'white' }
});