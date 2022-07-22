import React from 'react';
import { StyleSheet, SafeAreaView, Button, Alert } from 'react-native';
import { Props }  from './App';
import { openLoadingScreen, closeLoadingScreen } from './LoadingScreen';

//import SharpSports from '/Users/samuelcoolidge/Desktop/sports/sharpsports-mobile-link/src';
import SharpSports from '@sharpsports/sharpsports-mobile-link';

const internalId = 'fd-test-prod-0622'
const SSpublicKey = 'a4e27d45042947e7967146c26973bbd4a4e27d45'
const SSprivateKey = '433b0432d117a4c9ae338bd2e8467175d67af829'
export const sharpsports = new SharpSports(internalId,SSpublicKey,SSprivateKey)

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

    const _onError = () => {
        Alert.alert("SharpSports Error", "Could not load SharpSports BookLink")
    }

    const refreshbyInternalId = () => {
        sharpsports.Refresh()
    }

    const refreshbyBettorId = () => {
        sharpsports.Refresh({bettorId: 'BTTR_72cab09591ad4052ac881a608a368713'})
    }

    const refreshbyBettorAccountId = () => {
        sharpsports.Refresh({bettorAccountId: 'BACT_2e7f6f5e54bd4fed88452bd41301f2ba', reverify: true})
    }

    return (

    <SafeAreaView style={styles.container}>
        {sharpsports.LinkButton({
            buttonText: 'Link SportsBook',
            paddingVertical: 12,
            paddingHorizontal: 25,
            backgroundColor: "darkblue",
            buttonColor: '#2ce384',
            borderRadius: 8,
            fontFamily: 'Helvetica',
            fontSize: 20,
            textAlign: 'center',
            presentWebView: _onPresentWebView,
            dismissWebView: _onDismissWebView,
            onLoading: _onLoading,
            onLoadingDismiss: _onLoadingDismiss,
            onError: _onError
        })}
        <Button
            onPress={() => refreshbyInternalId()}
            title="Refresh Bettor by InternalID"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
        />
        <Button
            onPress={() => refreshbyBettorId()}
            title="Refresh Bettor by BettorID"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
        />
        <Button
            onPress={() => refreshbyBettorAccountId()}
            title="Refresh BettorAccountID"
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
