import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏁 Bienvenido a MiTurno</Text>
      <Button title="Ir al Resumen" onPress={() => navigation.navigate('Resumen')} />
      <Button title="Ir al Historial" onPress={() => navigation.navigate('Historial')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20 },
});
