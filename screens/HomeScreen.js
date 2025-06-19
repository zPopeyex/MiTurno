import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';

export default function HomeScreen({ navigation }) {
  const [inicio, setInicio] = useState(null);
  const [fin, setFin] = useState(null);
  const [ubicaciones, setUbicaciones] = useState([]);
  const [watcher, setWatcher] = useState(null);
  const [kms, setKms] = useState(0);

  const iniciarTurno = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la ubicación');
      return;
    }

    const watcherId = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, distanceInterval: 10 },
      (location) => {
        setUbicaciones((prev) => [...prev, location.coords]);
      }
    );

    setInicio(new Date());
    setWatcher(watcherId);
    setFin(null);
    setUbicaciones([]);
    setKms(0);
  };

  const finalizarTurno = () => {
    if (watcher) {
      watcher.remove();
      setWatcher(null);
    }
    setFin(new Date());
    calcularDistancia();
  };

  const calcularDistancia = () => {
    let total = 0;
    for (let i = 1; i < ubicaciones.length; i++) {
      const a = ubicaciones[i - 1];
      const b = ubicaciones[i];
      total += getDistanceFromLatLonInKm(a.latitude, a.longitude, b.latitude, b.longitude);
    }
    setKms(total.toFixed(2));
  };

  const irAlResumen = () => {
    if (!inicio || !fin) {
      Alert.alert('Turno incompleto', 'Debes iniciar y finalizar el turno primero.');
      return;
    }

    navigation.navigate('Resumen', {
      horaInicio: inicio.toISOString(),
      horaFin: fin.toISOString(),
      kms: kms,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🚗 MiTurno</Text>
      <Button title="Iniciar Turno" onPress={iniciarTurno} />
      <View style={{ margin: 10 }} />
      <Button title="Finalizar Turno" onPress={finalizarTurno} />
      <View style={{ margin: 10 }} />
      <Button title="Ver Resumen" onPress={irAlResumen} />
      <Text style={{ marginTop: 20 }}>KMs recorridos: {kms}</Text>
      <Text>Inicio: {inicio ? inicio.toLocaleTimeString() : '—'}</Text>
      <Text>Fin: {fin ? fin.toLocaleTimeString() : '—'}</Text>
          <Button title="📅 Ver Historial" onPress={() => navigation.navigate('Historial')} />

    </View>
  );
  
  
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // radio de la tierra en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 26, marginBottom: 30 },
});
