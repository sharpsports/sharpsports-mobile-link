import React from 'react';
import { StyleSheet, SafeAreaView, Button } from 'react-native';
//import SharpSportsMobileLink from 'sharpsports-mobile-link';
import SharpSportsMobileLink from '/Users/samuelcoolidge/Desktop/sports/sharpsports-mobile-link/src/SharpSportsMobileLink';

import { Props }  from './App';
import { openLoadingScreen, closeLoadingScreen } from './LoadingScreen';

export default function Main ({ navigation }: Props) {

    const _onPresentWebView = (webView: JSX.Element) => {
        navigation.navigate('Details', {webView});
    }

    const _onDismissWebView = () => {
        navigation.goBack();
    }

    const _onLoading = () => {
        openLoadingScreen();
    }

    const _onLoadingDismiss = () => {
        closeLoadingScreen();
    }

    return (
    <SafeAreaView style={styles.container}>
        <SharpSportsMobileLink 
        internalId='fd-test-4'
        publicKey='a4e27d45042947e7967146c26973bbd4a4e27d45'
        privateKey='433b0432d117a4c9ae338bd2e8467175d67af829'
        buttonText='Link SportsBook'
        paddingVertical={12}
        paddingHorizontal={25}
        backgroundColor="darkblue"
        buttonColor='#2ce384'
        borderRadius={8}
        fontFamily='Helvetica'
        fontSize={20}
        textAlign='center'
        presentWebView={_onPresentWebView}
        dismissWebView={_onDismissWebView}
        onLoading={_onLoading}
        onLoadingDismiss={_onLoadingDismiss}
        />
        <Button
            onPress={() => console.log('wip')}
            title="Refresh by bettorAccount"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
        />
        <Button
            onPress={() => console.log('wip')}
            title="Refresh by bettor"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
        />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
});
