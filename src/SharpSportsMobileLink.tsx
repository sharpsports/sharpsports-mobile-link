
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Pusher from 'pusher-js/react-native'
import DataDogJsonLogger from './datadog';
import {initPusher, onRecieveMessage} from "./Pusher"
import { postContext } from './SharpSportsApi';
const logger = new DataDogJsonLogger

export interface Props {
    internalId: string;
    buttonText: string;
    publicKey: string;
    privateKey: string;
    paddingVertical: number;
    paddingHorizontal: number;
    backgroundColor: string;
    buttonColor: string;
    borderRadius: number;
    fontFamily: string;
    fontSize: number;
    textAlign: 'center' | 'left' | 'right | justify'
    onLoading?: () => void;
    onLoadingDismiss?: () => void;
    onError?: () => void;
    presentWebView: (webView: JSX.Element) => void;
    dismissWebView: () => void;
}

class SharpSportsMobileLink extends React.Component<Props> {
    render() {
        const {
            backgroundColor,
            paddingVertical,
            paddingHorizontal,
            borderRadius,
            textAlign,
            buttonColor,
            fontSize,
            fontFamily
        } = this.props;

        const buttonStyle = {
            backgroundColor,
            paddingVertical,
            paddingHorizontal,
            borderRadius,
            textAlign
        }

        const buttonTextStyle = {
            color: buttonColor,
            fontSize,
            fontFamily
        }

        const pusher = initPusher(this.props.internalId, this.props.publicKey, this.props.privateKey)

        return (
            <TouchableOpacity onPress={() => fetchIntegration(this.props,pusher)} style={{justifyContent: "center" }}>
                <View style={{ ...buttonStyle }}>
                    <Text style={{ ...buttonTextStyle }}>
                        { this.props.buttonText }
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

//After click sharpsports button: set up pusher subscription and present webview
const fetchIntegration = (props: Props, pusher: Pusher) => {
    const { internalId, publicKey, privateKey} = props;
    props.onLoading?.();
    const channel = pusher.subscribe(`private-${publicKey}-${internalId}`); //subscribe to channel if not already
    channel.unbind(); // unbind all channel events to ensure no duplicate message handling, could do this on webview dismiss
    channel.bind('verify', onRecieveMessage) //set up handler for recieving of credentials
    postContext(`http://localhost:8000/v1/context`, internalId, publicKey, privateKey)
    .then(data => {
        props.onLoadingDismiss?.();
        props.presentWebView(
            <WebView
              source={{uri: `http://localhost:3006/link/${data.cid}`}}
              style={{justifyContent: "center"}}
              onNavigationStateChange={ (newNavState: WebViewNavigation) =>
                  handleWebViewNavigationStateChange(props, newNavState)
              }
            />
        )
    })
    .catch(error => {
        logger.error(`Error occurred posting context: ${error}`,{internalId:internalId})
        props.onError?.()
    })
}

//dismiss webview when done in url
const handleWebViewNavigationStateChange = (props: Props, newNavState: WebViewNavigation) => {
  const { url } = newNavState;
  if (url.includes('/done')) {
      props.dismissWebView();
  }
}


export default SharpSportsMobileLink;

