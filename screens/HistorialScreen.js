import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistorialScreen() {
  const [datos, setDatos] = useState({});

  useEffect(() => {
    const cargarDatos = async () => {
      const guardado = await AsyncStorage.getItem('@turnos');
      if (guardado) {
        setDatos(JSON.parse(guardado));
      }
    };
    cargarDatos();
  }, []);

  const calcularTotalesDia = (turnos) => {
    let totalKms = 0;
    let totalHoras = 0;
    let totalGanancia = 0;
    let totalGasolina = 0;
    let totalNeta = 0;

    turnos.forEach((t) => {
      totalKms += t.kms;
      totalHoras += t.duracionHoras;
      totalGanancia += t.ganancia;
      totalGasolina += t.gastoGasolina;
      totalNeta += t.gananciaNeta;
    });

    return {
      totalKms: totalKms.toFixed(2),
      totalHoras: totalHoras.toFixed(2),
      totalGanancia,
      totalGasolina: Math.round(totalGasolina),
      totalNeta: Math.round(totalNeta),
    };
  };

  const formatearCOP = (valor) => {
    return valor.toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📅 Historial de Turnos</Text>
      <FlatList
        data={Object.entries(datos)}
        keyExtractor={([fecha]) => fecha}
        renderItem={({ item }) => {
          const [fecha, turnos] = item;
          const totales = calcularTotalesDia(turnos);
          return (
            <View style={styles.card}>
              <Text style={styles.fecha}>📆 {fecha}</Text>
              {turnos.map((t, i) => (
                <View key={i} style={styles.turno}>
                  <Text>⏱️ {new Date(t.inicio).toLocaleTimeString()} - {new Date(t.fin).toLocaleTimeString()}</Text>
                  <Text>📍 {t.kms.toFixed(2)} km - 💰 {formatearCOP(t.ganancia)}</Text>
                </View>
              ))}
              <View style={styles.totalBox}>
                <Text style={styles.total}>🔢 Resumen del día:</Text>
                <Text>🕓 {totales.totalHoras} h</Text>
                <Text>🚗 {totales.totalKms} km</Text>
                <Text>💰 {formatearCOP(totales.totalGanancia)}</Text>
                <Text>⛽ {formatearCOP(totales.totalGasolina)}</Text>
                <Text>📈 {formatearCOP(totales.totalNeta)}</Text>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  fecha: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  card: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  turno: { marginBottom: 5 },
  totalBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: '#ccc' },
  total: { fontWeight: 'bold', marginBottom: 5 },
});