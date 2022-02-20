import React from 'react';
import { StyleSheet, SafeAreaView, Button, Alert } from 'react-native';
import { Props, sharpsports }  from './App';
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

    const _onError = () => {
        Alert.alert("SharpSports Error", "Could not load SharpSports BookLink")
    }

    const refreshbyInternalId = () => {
        sharpsports.Refresh()
    }

    const refreshbyBettorId = () => {
        sharpsports.Refresh({bettorId: 'BTTR_ec4f0aec303a4984a297b412a6929088'})
    }

    const refreshbyBettorAccountId = () => {
        sharpsports.Refresh({bettorAccountId: 'BACT_5063a4b8d86940cb8a29be05f2781202'})
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
