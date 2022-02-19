import * as React from 'react';
import Pusher from 'pusher-js/react-native'
import {initPusher, onRecieveMessage} from "./Pusher"
import { refreshRequestInternalId, refreshRequestBettorId, refreshRequestBettorAccountId, postContext} from './SharpSportsApi';
import { WebView, WebViewNavigation } from 'react-native-webview';
import DataDogJsonLogger from './datadog';
import SharpSportsMobileLink from './SharpSportsMobileLink'
const logger = new DataDogJsonLogger


export interface RefreshArgs {
  bettorId?: string,
  bettorAccountId?: string
}

export interface ButtonArgs {
  buttonText: string;
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
  presentWebView: (webView: JSX.Element) => void;
  dismissWebView: () => void;
}

class SharpSports {
  internalId: string;
  publicKey: string;
  privateKey: string;
  pusher: Pusher | null;
  isPusherInit: boolean;
 
  constructor(internalId: string, publicKey: string, privateKey: string) {
    this.internalId = internalId;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.isPusherInit = false;
    this.pusher = null;
  }

  LinkButton(args: ButtonArgs) {

    //After click sharpsports button: set up pusher subscription and present webview
    const _fetchIntegration = () => {
      args.onLoading?.();
      
      //only init pusher on fetching of integration
      if (!this.isPusherInit){
        this.pusher = initPusher(this.internalId, this.publicKey, this.privateKey)
        this.isPusherInit = true;
      }

      const channel = this.pusher?.subscribe(`private-${this.publicKey}-${this.internalId}`); //subscribe to channel if not already
      channel?.unbind();  // unbind all channel events to ensure no duplicate message handling
      channel?.bind('verify', onRecieveMessage) //set up handler for recieving of credentials bookLink UI
      channel?.bind('refresh', onRecieveMessage) //set up handler for recieving of credentials through account management wigit
      postContext(`https://api.sharpsports.io/v1/context`, this.internalId, this.publicKey, this.privateKey)
      .then(data => {
          console.log("FETCHED INTEGRATION")
          //const webView = PusherWebView(props,data.cid)
          args.onLoadingDismiss?.();
          args.presentWebView(
              <WebView
                  source={{uri: `https://ui.sharpsports.io/link/${data.cid}`}}
                  style={{justifyContent: "center"}}
                  onNavigationStateChange={ (newNavState: WebViewNavigation) =>
                      handleWebViewNavigationStateChange(args.dismissWebView,newNavState)
                  }
              />
          )
      })
      .catch(error => {
          logger.error(`Error occurred posting context: ${error}`,{internalId:this.internalId})
      })
    }

    //dismiss webview when done in url
    const handleWebViewNavigationStateChange = (dismissWebView: () => void, newNavState: WebViewNavigation) => {
      const { url } = newNavState;
      if (url.includes('/done')) {
          dismissWebView();
      }
    }

    return (
      <SharpSportsMobileLink 
        internalId={this.internalId}
        publicKey={this.publicKey}
        privateKey={this.privateKey}
        buttonText={args.buttonText}
        paddingVertical={args.paddingVertical}
        paddingHorizontal={args.paddingHorizontal}
        backgroundColor={args.backgroundColor}
        buttonColor={args.buttonColor}
        borderRadius={args.borderRadius}
        fontFamily={args.fontFamily}
        fontSize={args.fontSize}
        textAlign={args.textAlign}
        fetchIntegration={_fetchIntegration}
      />
    )
  }
 
  Refresh(args: RefreshArgs) {

    //only init pusher if it hasn't alrady been initialized
    if (!this.isPusherInit){
      this.pusher = initPusher(this.internalId, this.publicKey, this.privateKey)
      this.isPusherInit = true;
    }

    const channel = this.pusher?.subscribe(`private-${this.publicKey}-${this.internalId}`); //subscribe to channel if not already
    channel?.unbind(); // unbind all channel events to ensure no duplicate message handling, could do this on webview dismiss
    channel?.bind('refresh', onRecieveMessage) //set up handler for recieving of credentials

    if (args.bettorId && args.bettorAccountId){
      throw 'You cannot input both a bettorId and a bettorAccountId'
    } else if (args.bettorId){
      return refreshRequestBettorId(args.bettorId, this.internalId, this.publicKey, this.privateKey)
    } else if (args.bettorAccountId){
      return refreshRequestBettorAccountId(args.bettorAccountId, this.internalId, this.publicKey, this.privateKey)
    } else {
      return refreshRequestInternalId(this.internalId, this.publicKey, this.privateKey)
    }
  }
}

export default SharpSports;
