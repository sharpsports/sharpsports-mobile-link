import React from 'react';
import { LogBox } from 'react-native';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';

import Main from './Main';
import Details from './Details';
import LoadingScreen from './LoadingScreen';

import SharpSports from '@sharpsports/sharpsports-mobile-link';

const internalId = 'fd-refresh-tn'
const SSpublicKey = 'a4e27d45042947e7967146c26973bbd4a4e27d45'
const SSprivateKey = '433b0432d117a4c9ae338bd2e8467175d67af829'
export const sharpsports = new SharpSports(internalId,SSpublicKey,SSprivateKey)

type RootStackParamList = {
  Main: undefined;
  Details: { webView: JSX.Element },
  LoadingScreen: undefined;
};

type MainScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'Main'
>;

type LoadingScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    'LoadingScreen'
>;

type DetailsScreenRouteProp = RouteProp<
    RootStackParamList, 
    'Details'
>;

export type Props = {
    navigation: MainScreenNavigationProp;
    route: DetailsScreenRouteProp;
    loading: LoadingScreenNavigationProp;
};

const StackNavigator = createStackNavigator<RootStackParamList>();

const MainStack = () => {
  return (
    <StackNavigator.Navigator>
      <StackNavigator.Screen
        name="Main"
        component={Main}
        options={{
          headerShown: false,
        }}
      />
      <StackNavigator.Screen
        name="LoadingScreen"
        component={LoadingScreen}
        options={{
          cardOverlayEnabled: true,
          cardStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
          headerShown: false,
        }}
      />
      <StackNavigator.Screen 
        name="Details" 
        component={Details}
        options={{
          headerBackTitle: "Close"
        }}
      />
    </StackNavigator.Navigator>
  )
}

export const NavigationRef: React.RefObject<NavigationContainerRef> = React.createRef();

export default function App() {
  return (
    <NavigationContainer ref={NavigationRef}>
      <MainStack />
    </NavigationContainer>
  );
}

LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);
