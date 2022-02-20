# SharpSports Mobile Link - A React Native, Typescript NPM package.

  

**SharpSports Mobile Link** is a customizable package built in React Native that provides authenticated access to the SharpSports BookLink Button and Refresh methods. It is intended to be used as the integration path for your React Native app.


# Getting Started


## 1. Add sharpsports-mobile-link to your dependencies

 

```
$ npm i @sharpsports/sharpsports-mobile-link --save
```

  

## 2. Import SharpSports in your app

 Import the SharpSports package into your app and initialize. <strong> Note: it is important to only initialize SharpSports once in your application. </strong> 

```js
import SharpSports from '@sharpsports/sharpsports-mobile-link';

const internalId = 'my-internal-id'
const publicKey = 'my-public-key-string'
const privateKey = 'my-private-key-string'
const sharpsports = new SharpSports(internalId,publicKey,privateKey)
```

# Class Methods

## 1. LinkButton

The `LinkButton` method creates a customizable button which opens up the SharpSports
BookLink UI in a web-view.

### Style Arguments
The following arguments can be used to style the button as desired
```
buttonText: string;
paddingVertical: number;
paddingHorizontal: number;
backgroundColor: string;
buttonColor: string;
borderRadius: number;
fontFamily: string;
fontSize: number;
textAlign: 'center' | 'left' | 'right | justify'
```

### Navigation Callback Arguments
There are several callback functions that can/must be provided as arguments to `Link Button`. `presentWebView` and `dismissWebView` are required and must be linked to your navigation
stack. `onLoading` and `onLoadingDismiss` are optional, if you wish to use
a custom loading/transition screen. There's also an optional `onError` callback, which you can use to inform your users that something went wrong.
```
presentWebView: (webView: JSX.Element) =>  void;
dismissWebView: () =>  void;
onLoading?: () =>  void;
onLoadingDismiss?: () =>  void;
onError?: () =>  void;
```

## 2. Refresh
 
 The `Refresh` method allow you to make refresh requests to the SharpSports API. 

### Arguments
By default the `Refresh` method will run a refresh on all accounts associated with the `internalId` that you provided when initializing the `SharpSports` object. Optionally you can pass a `bettorId` to refresh all accounts associated with that ID or a `bettorAccountId` to refresh just a specific account.

You can also optionally pass `reverify: true` as an argument to attach the reverify query parameter to the refresh request.

```
bettorId?: string;
bettorAccountId?: string;
reverify?: boolean;
```

### Usage
#### Refresh by InternalID

```
sharpsports.Refresh()
```
corresponds to the API call
```
POST https://api.sharpsports.io/v1/bettors/<internalID>/refresh
```
#### Refresh by BettorID

```
sharpsports.Refresh({bettorId: <BTTR_ID>})
```
corresponds to the API call
```
POST https://api.sharpsports.io/v1/bettors/<BTTR_ID>/refresh
```

#### Refresh by BettorAccountID

```
sharpsports.Refresh({bettorAccountId: <BACT_ID>})
```
corresponds to the API call
```
POST https://api.sharpsports.io/v1/bettorAccounts/<BACT_ID>/refresh
```

#### Reverify

```
sharpsports.Refresh({bettorAccountId: <BACT_ID>, reverify: true})
```
corresponds to the API call
```
POST https://api.sharpsports.io/v1/bettorAccounts/<BACT_ID>/refresh?reverify=true
```

# Example Implementation
  
App.tsx

```js
import  React  from  'react';
import { NavigationContainer, NavigationContainerRef, RouteProp } from  '@react-navigation/native';
import { createStackNavigator, StackNavigationProp } from  '@react-navigation/stack';

import  Main  from  './Main'; // The page containing the SharpSportsMobileLink
import  Details  from  './Details'; // A page accepting an arbitrary WebView

type  RootStackParamList = {
	Main: undefined;
	Details: { webView: JSX.Element },
};

type  MainScreenNavigationProp = StackNavigationProp<
	RootStackParamList,
	'Main'
>;

type  DetailsScreenRouteProp = RouteProp<
	RootStackParamList,
	'Details'
>;

export  type  Props = {
  navigation: MainScreenNavigationProp;
  route: DetailsScreenRouteProp;
};

const  StackNavigator = createStackNavigator<RootStackParamList>();

const  MainStack = () => {
return (
	<StackNavigator.Navigator>
		<StackNavigator.Screen
			name="Main"
			component={Main}
			options={{headerShown:  false}}
		/>
		<StackNavigator.Screen
			name="Details"
			component={Details}
			options={{headerBackTitle:  "Close"}}
		/>
	</StackNavigator.Navigator>
)}

 export default function App() {
   return (
     <NavigationContainer>
       <MainStack />
     </NavigationContainer>
   );
 }
```
Main.tsx

```js
import  React  from  'react';
import { StyleSheet, SafeAreaView, Button, Alert, useNavigation } from  'react-native';
import { Props } from  './App';

import SharpSports from '@sharpsports/sharpsports-mobile-link';

//init sharpsports
const internalId = 'my-internal-id'
const publicKey = 'my-public-key-string'
const privateKey = 'my-private-key-string'
export const sharpsports = new SharpSports(internalId,publicKey,privateKey)

export  default  function  Main ({ navigation }: Props) {

	const  _onPresentWebView = (webView: JSX.Element) => {
		navigation.navigate('Details', {webView});
	}
	const  _onDismissWebView = () => {
		navigation.goBack();
	}
	const  _onLoading = () => {
		// Your loading method here
	}
	const  _onLoadingDismiss = () => {
		// Your dismiss loading method here
	}
	const  _onError = () => {
		// example error handling
		Alert.alert("SharpSports Error", "Could not load SharpSports BookLink")
	}

	return (
		<SafeAreaView  style={styles.container}>
			//Example BookLink Button
			{sharpsports.LinkButton({
				buttonText:  'Link SportsBook',
				paddingVertical:  12,
				paddingHorizontal:  25,
				backgroundColor:  "darkblue",
				buttonColor:  '#2ce384',
				borderRadius:  8,
				fontFamily:  'Helvetica',
				fontSize:  20,
				textAlign:  'center',
				presentWebView:  _onPresentWebView,
				dismissWebView:  _onDismissWebView,
				onLoading:  _onLoading,
				onLoadingDismiss:  _onLoadingDismiss,
				onError:  _onError
			})}
			//Example Refresh Button
			<Button 
				onPress={() =>  sharpsports.Refresh()}
				title="Refresh Bettor by InternalID"
				color="#841584"
			/>
		</SafeAreaView>
	)
}
```
Details.tsx
```js
import  React  from  'react';
import { SafeAreaView, StyleSheet } from  'react-native';
import { Props } from  './App';

export  default  function  Details ({ route }: Props) {=
	const { webView } = route.params;
	return (
		<SafeAreaView  style={styles.safeArea}>
			{webView}
		</SafeAreaView>
	)
}

const  styles = StyleSheet.create({
	safeArea: {
		flex:  1,
		justifyContent:  'center'
	}
})
```

