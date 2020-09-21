import React from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import SharpSportsMobileLink from 'sharpsports-mobile-link';

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
        presentWebView={_onPresentWebView}
        dismissWebView={_onDismissWebView}
        onLoading={_onLoading}
        onLoadingDismiss={_onLoadingDismiss}
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
