import React from 'react';
import { StyleSheet, SafeAreaView, Button } from 'react-native';
import SharpSports from 'sharpsports-mobile-link';
import { Props }  from './App';
import { openLoadingScreen, closeLoadingScreen } from './LoadingScreen';

const internalId = 'fd-refresh-tn'
const SSpublicKey = 'a4e27d45042947e7967146c26973bbd4a4e27d45'
const SSprivateKey = '433b0432d117a4c9ae338bd2e8467175d67af829'
const sharpsports = new SharpSports(internalId,SSpublicKey,SSprivateKey)

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

    const onClickInternal = () => {
        sharpsports.Refresh({})
    }

    const onClickBettor = () => {
        sharpsports.Refresh({bettorId: 'BTTR_ec4f0aec303a4984a297b412a6929088'})
    }

    const onClickBettorAccount = () => {
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
            onLoadingDismiss: _onLoadingDismiss
        })}
        <Button
            onPress={() => onClickInternal()}
            title="Refresh Bettor by InternalID"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
        />
        <Button
            onPress={() => onClickBettor()}
            title="Refresh Bettor by BettorID"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
        />
        <Button
            onPress={() => onClickBettorAccount()}
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
