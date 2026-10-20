import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { LanguageProvider } from './src/i18n/LanguageContext';
import { NetworkProvider } from './src/context/NetworkContext';
import { FoodProvider } from './src/context/FoodContext';

import { DishListScreen } from './src/screens/DishListScreen';
import { DishDetailScreen } from './src/screens/DishDetailScreen';
import { DishFormScreen } from './src/screens/DishFormScreen';
import { CategoryScreen } from './src/screens/CategoryScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <NetworkProvider>
          <FoodProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <Stack.Navigator
                initialRouteName="DishList"
                screenOptions={{
                  headerShown: false,
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="DishList" component={DishListScreen} />
                <Stack.Screen name="DishDetail" component={DishDetailScreen} />
                <Stack.Screen name="DishForm" component={DishFormScreen} />
                <Stack.Screen name="Categories" component={CategoryScreen} />
                <Stack.Screen name="Settings" component={SettingsScreen} />
              </Stack.Navigator>
            </NavigationContainer>
          </FoodProvider>
        </NetworkProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
