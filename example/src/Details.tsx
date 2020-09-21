import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';

import { Props }  from './App';

export default function Details ({ route }: Props) {
    const { webView } = route.params;
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