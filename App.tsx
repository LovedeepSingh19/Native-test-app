import React, { useEffect, useState } from 'react';
import { ProgressBar, Provider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { theme } from './src/core/theme';
import StartScreen from './src/screens/StartScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import LoginScreen from './src/screens/LoginScreen';
import Dashboard from './src/screens/DashboardScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import { ToastProvider } from 'react-native-toast-notifications';
import { cacheData, loadData } from './src/store/store';

const Stack = createStackNavigator();

export default function App() {
  const [userData, setUserData] = useState<cacheData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await loadData(`${process.env.CACHE_KEY}`);
        setUserData(userData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    fetchData();
  }, []);

  if (!userData) {
    <ProgressBar />
    return null;
  }

  console.log(userData);

  return (
    <ToastProvider
      placement="bottom"
      duration={5000}
      animationDuration={100}
      dangerColor="red"
      warningColor="orange"
      normalColor="grey"
      textStyle={{ fontSize: 20 }}
      swipeEnabled={true}
    >
      <Provider theme={theme}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName={userData.token ? 'Dashboard' : 'StartScreen'}
            screenOptions={{
              headerShown: false,
            }}
          >
            <Stack.Screen name="StartScreen" component={StartScreen} />
            <Stack.Screen name="LoginScreen" component={LoginScreen} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
            <Stack.Screen name="Dashboard" component={Dashboard} />
            <Stack.Screen
              name="ResetPasswordScreen"
              component={ResetPasswordScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </Provider>
    </ToastProvider>
  );
}
