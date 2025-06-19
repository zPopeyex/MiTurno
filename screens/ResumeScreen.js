import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ResumenScreen({ route }) {
  const { horaInicio, horaFin, kms } = route.params;
  const kmsNumber = parseFloat(kms) || 0;

  const [ganancia, setGanancia] = useState('');

  const duracion = calcularDuracion(horaInicio, horaFin);
  const duracionHoras = calcularHoras(horaInicio, horaFin);

  // === CONFIGURACIÓN GENERAL ===
  const rendimientoKmPorGalon = 45;
  const precioGalon = 16155;

  const formatearMiles = (valor) => {
    if (!valor) return '$0';
    return parseInt(valor).toLocaleString('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  const gastoGasolina = kmsNumber > 0
    ? (kmsNumber / rendimientoKmPorGalon) * precioGalon
    : 0;

  const gananciaNeta = ganancia
    ? parseInt(ganancia) - gastoGasolina
    : 0;

  const gananciaPorHora = ganancia && duracionHoras >= 0.05
    ? formatearMiles((parseInt(ganancia) / duracionHoras).toFixed(0))
    : '—';

  const gananciaPorKm = ganancia && kmsNumber >= 0.5
    ? formatearMiles((parseInt(ganancia) / kmsNumber).toFixed(0))
    : '—';

  const mostrarAdvertencia =
    duracionHoras < 0.05 || kmsNumber < 0.5;

  // === GUARDAR TURNO ===
  const guardarTurno = async () => {
    if (!ganancia) {
      Alert.alert('Falta ganancia', 'Por favor ingresa cuánto ganaste antes de guardar.');
      return;
    }

    const fechaHoy = new Date(horaInicio).toISOString().split('T')[0];

    const turno = {
      inicio: horaInicio,
      fin: horaFin,
      kms: kmsNumber,
      ganancia: parseInt(ganancia),
      gastoGasolina: parseInt(gastoGasolina),
      gananciaNeta: parseInt(gananciaNeta),
      duracionHoras: parseFloat(duracionHoras.toFixed(3)),
    };

    try {
      const data = await AsyncStorage.getItem('@turnos');
      const turnosTotales = data ? JSON.parse(data) : {};

      if (!turnosTotales[fechaHoy]) {
        turnosTotales[fechaHoy] = [];
      }
      turnosTotales[fechaHoy].push(turno);

      await AsyncStorage.setItem('@turnos', JSON.stringify(turnosTotales));
      Alert.alert('✅ Turno guardado correctamente');
    } catch (error) {
      console.error('Error guardando turno', error);
      Alert.alert('❌ Error al guardar el turno');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Resumen del Turno</Text>

      <Text>🕐 Inicio: {new Date(horaInicio).toLocaleTimeString()}</Text>
      <Text>🕐 Fin: {new Date(horaFin).toLocaleTimeString()}</Text>
      <Text>⏳ Duración: {duracion}</Text>
      <Text>📍 KMs recorridos: {kmsNumber.toFixed(2)}</Text>

      <Text style={styles.label}>💰 ¿Cuánto ganaste hoy?</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej: 40000"
        keyboardType="numeric"
        value={formatearInput(ganancia)}
        onChangeText={(text) => {
          const limpio = text.replace(/\./g, '');
          setGanancia(limpio);
        }}
      />

      {mostrarAdvertencia && (
        <Text style={styles.warning}>
          ⚠️ Tiempo o distancia muy bajos. Los datos podrían ser imprecisos.
        </Text>
      )}

      {ganancia !== '' && (
        <View style={styles.resultBox}>
          <Text>🧮 Ganancia por hora: {gananciaPorHora}</Text>
          <Text>🧮 Ganancia por KM: {gananciaPorKm}</Text>
          <Text>⛽ Gasto en gasolina: {formatearMiles(gastoGasolina)}</Text>
          <Text>📈 Ganancia neta: {formatearMiles(gananciaNeta)}</Text>
        </View>
      )}

      <View style={{ marginTop: 30 }}>
        <Button title="💾 Guardar turno" onPress={guardarTurno} />
      </View>
    </View>
  );
}

function calcularDuracion(inicio, fin) {
  const start = new Date(inicio);
  const end = new Date(fin);
  const diffMs = end - start;

  const totalSegundos = Math.floor(diffMs / 1000);
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;

  if (horas > 0) return `${horas}h ${minutos}min`;
  if (minutos > 0) return `${minutos}min`;
  return `${segundos}seg`;
}

function calcularHoras(inicio, fin) {
  const start = new Date(inicio);
  const end = new Date(fin);
  const diff = (end - start) / 1000 / 60 / 60;
  return parseFloat(diff.toFixed(3));
}

function formatearInput(valor) {
  if (!valor) return '';
  return parseInt(valor).toLocaleString('es-CO');
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, textAlign: 'center', marginBottom: 20 },
  label: { marginTop: 20, fontSize: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
    fontSize: 16,
  },
  resultBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
  },
  warning: {
    color: 'orange',
    marginTop: 15,
    fontWeight: 'bold',
  },
});
