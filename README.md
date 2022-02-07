# Sharpsports Mobile Link - A React Native, Typescript NPM package.

**Sharpsports Mobile Link** is a customizable button built in React Native. It is intended to be used as the integration path for your React Native app.

# Getting Started

## 1. Add sharpsports-mobile-link to your dependencies

```
$ npm i @sharpsports/sharpsports-mobile-link --save
```

## 2. Import sharpsports-mobile-link in your app

Main.js
```js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SharpSportsMobileLink from '@sharpsports/sharpsports-mobile-link';

export default function Main() {
  return (
    <View>
      <SharpSportsMobileLink
      internalId='id'
      token='token'
      buttonText='Link SportsBook'
      paddingVertical={12}
      paddingHorizontal={25}
      backgroundColor="darkblue"
      buttonColor='#2ce384'
      borderRadius={8}
      fontFamily='Helvetica'
      fontSize={20}
      textAlign='center'
      presentWebView={ (webview: JSX.Element) => { console.log(`webview: ${webview}`) } }
      dismissWebView={ () => { console.log('here') } }
      onLoading={ () => { console.log('here') } }
      onLoadingDismiss={ () => { console.log('here') } }
      />
    </View>
  );
}
```

## 3. Implement navigation callbacks

`presentWebView` and `dismissWebView` must be linked to your navigation
stack. `onLoading` and `onLoadingDismiss` are optional, if you wish to use
a custom loading/transition screen, but operate in a similar way.

There's also an optional `onError` callback, which you can use to
inform your users that something went wrong.

App.js
```js
  import React from 'react';
  import { NavigationContainer } from '@react-navigation/native';
  import { createStackNavigator } from '@react-navigation/stack';

  // The page containing the SharpSportsMobileLink
  import Main from './Main';
  // A page accepting an arbitrary WebView
  import Form from './Form';

  const StackNavigator = createStackNavigator();

  const MainStack = () => {
    return (
      <StackNavigator.Navigator mode="modal">
        <StackNavigator.Screen
          name="Main"
          component={Main}
          options={{
            headerShown: false,
          }}
        />
        <StackNavigator.Screen
          name="Form"
          component={Form}
          options={{
            headerBackTitle: "Close"
          }}
        />
      </StackNavigator.Navigator>
    )
  }

  export default function App() {
    return (
      <NavigationContainer>
        <MainStack />
      </NavigationContainer>
    );
  }
```

Main.js
```js
  import React from 'react';
  import { useNavigation } from '@react-navigation/native';

  //...

  export default function Main() {
    const navigation = useNavigation();

    const _onPresentWebView = (webView: JSX.Element) => {
      navigation.navigate('Form', {webView});
    }
    const _onDismissWebView = () => {
      navigation.navigate('Main');
    }

    return (
      <View style={styles.container}>
        <SharpSportsMobileLink
          //...
          presentWebView={_onPresentWebView}
          dismissWebView={_onDismissWebView}
          //...
        />
      </View>
    );
  }
```

Form.js
```js
  import React from 'react';
  import { SafeAreaView, StyleSheet } from 'react-native';

  export default function Form(props) {
      const { webView } = props.route.params;
      return (
          <SafeAreaView style={styles.safeArea}>
              {webView}
          </SafeAreaView>
      )
  }

  const styles = StyleSheet.create({
      safeArea: {
          flex: 1,
          justifyContent: 'center'
      }
  })
```
