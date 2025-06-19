import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import ResumenScreen from './screens/ResumeScreen';
import HistorialScreen from './screens/HistorialScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Inicio">
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Resumen" component={ResumenScreen} />
        <Stack.Screen name="Historial" component={HistorialScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
