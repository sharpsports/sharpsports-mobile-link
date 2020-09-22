# Sharpsports Mobile Link - A React Native, Typescript NPM package.

**Sharpsports Mobile Link** is a customizable button built in React Native. It is intended to be used as the integration path for your React Native app.

# Getting Started

## 1. Add sharpsports-mobile-link to your dependencies

```
$ npm i @sharpsports/sharpsports-mobile-link --save
```

## 2. Import sharpsports-mobile-link in your app

```js
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SharpSportsMobileLink from '@sharpsports/sharpsports-mobile-link';

export default function App() {
  return (
    <View style={styles.container}>
      <SharpSportsMobileLink 
      internalId='test_id'
      token='1fb886d9aff543cb6e2d87691a8b977abf12d312'
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```
