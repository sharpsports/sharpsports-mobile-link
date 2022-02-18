import React from 'react';
import { StyleSheet, SafeAreaView, Button } from 'react-native';
//import SharpSportsMobileLink from 'sharpsports-mobile-link';
import SharpSportsMobileLink from '/Users/samuelcoolidge/Desktop/sports/sharpsports-mobile-link/src/SharpSportsMobileLink';
import { Refresh } from '/Users/samuelcoolidge/Desktop/sports/sharpsports-mobile-link/src/Refresh';

import { Props }  from './App';
import { openLoadingScreen, closeLoadingScreen } from './LoadingScreen';

export default function Main ({ navigation }: Props) {

    const internalId = 'fd-refresh-tn'
    const SSpublicKey = 'a4e27d45042947e7967146c26973bbd4a4e27d45'
    const SSprivateKey = '433b0432d117a4c9ae338bd2e8467175d67af829'

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
        Refresh({
            internalId: internalId, 
            publicKey: SSpublicKey,
            privateKey: SSprivateKey
        })
    }

    const onClickBettor = () => {
        Refresh({
            internalId: internalId,
            bettorId: 'BTTR_af0e025bc6164185bc7e0a3beee0f9cb',  
            publicKey: SSpublicKey,
            privateKey: SSprivateKey
        })
    }

    const onClickBettorAccount = () => {
        Refresh({
            internalId: internalId,
            bettorAccountId: 'BACT_32f4806700e34decb5e91a091dd0fe92',  
            publicKey: SSpublicKey,
            privateKey: SSprivateKey
        })
    }

    return (
    <SafeAreaView style={styles.container}>
        <SharpSportsMobileLink 
        internalId={internalId}
        publicKey={SSpublicKey}
        privateKey={SSprivateKey}
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
