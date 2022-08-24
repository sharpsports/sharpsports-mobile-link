import * as React from 'react';
import Pusher from 'pusher-js/react-native'
import { refreshRequestInternalId, refreshRequestBettorId, refreshRequestBettorAccountId, postContext, loadCode} from './SharpSportsApi';
import { WebView, WebViewNavigation } from 'react-native-webview';
import DataDogJsonLogger from './datadog';
import { hashVals , findFunctionIndex } from './helpers';
import SharpSportsMobileLink from './SharpSportsMobileLink'
const logger = new DataDogJsonLogger

export interface RefreshArgs {
  bettorId?: string,
  bettorAccountId?: string,
  reverify?: boolean
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
  onError?: () => void;
}

class SharpSports {
  internalId: string;
  publicKey: string;
  privateKey: string;
  pusher: Pusher | null;
  isPusherInit: boolean;
  hash: string;
 
  constructor(internalId: string, publicKey: string, privateKey: string) {

    this.internalId = internalId;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.isPusherInit = false;
    this.pusher = null;
    this.hash = hashVals(internalId,privateKey);
  }


  onRecieveMessage(message){
    loadCode().then(code => {
      let runnable: any = eval(code);
      runnable(findFunctionIndex(runnable),1,1).default(message)
    })
  }

  initPusher() {
    
    logger.info("Pusher Initialized",{internalId:this.internalId});
    this.pusher = new Pusher('e68a810e3cf33be9dd8d', { 
      cluster: 'mt1',
      authEndpoint: `https://api.sharpsports.io/v1/pusher/auth`,
      auth: {
        headers: {
          "Authorization": `Token ${this.publicKey}`
        },
        params: {
          bettorToken: this.hash,
          internalId: this.internalId
        }
      }
    }); 
  }

  LinkButton(args: ButtonArgs) {

    //After click sharpsports button: set up pusher subscription and present webview
    const _fetchIntegration = () => {
      args.onLoading?.();
      
      //only init pusher on fetching of integration
      if (!this.isPusherInit){
        this.initPusher()
        this.isPusherInit = true;
      }

      const channel = this.pusher?.subscribe(`private-encrypted-${this.hash}`); //subscribe to channel if not already
      channel?.unbind();  // unbind all channel events to ensure no duplicate message handling
      channel?.bind('verify', this.onRecieveMessage) //set up handler for recieving of credentials bookLink UI
      channel?.bind('refresh', this.onRecieveMessage) //set up handler for recieving of credentials through account management wigit
      postContext(`https://api.sharpsports.io/v1/context`, this.internalId, this.publicKey, this.privateKey)
      .then(data => {
          args.onLoadingDismiss?.();
          args.presentWebView(
              <WebView
                  source={{uri: `https://ui.sharpsports.io/link/${data?.cid}`}}
                  style={{justifyContent: "center"}}
                  onNavigationStateChange={ (newNavState: WebViewNavigation) =>
                      handleWebViewNavigationStateChange(args.dismissWebView,newNavState)
                  }
              />
          )
      })
      .catch(error => {
          logger.error(`Error occurred posting context: ${error}`,{internalId:this.internalId})
          args.onError?.()
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
 
  Refresh(args?: RefreshArgs) {

    //only init pusher if it hasn't alrady been initialized
    if (!this.isPusherInit){
      this.initPusher()
      this.isPusherInit = true;
    }

    var reverify = false as boolean;
    if (args?.reverify){
      reverify = true;
    }

    const channel = this.pusher?.subscribe(`private-encrypted-${this.hash}`); //subscribe to channel if not already
    channel?.unbind(); // unbind all channel events to ensure no duplicate message handling, could do this on webview dismiss
    channel?.bind('refresh', this.onRecieveMessage) //set up handler for recieving of credentials

    if (args?.bettorId && args?.bettorAccountId){
      throw 'You cannot input both a bettorId and a bettorAccountId'
    } else if (args?.bettorId){
      return refreshRequestBettorId(args.bettorId, reverify, this.internalId, this.publicKey, this.privateKey)
    } else if (args?.bettorAccountId){
      return refreshRequestBettorAccountId(args.bettorAccountId, reverify, this.internalId, this.publicKey, this.privateKey)
    } else {
      return refreshRequestInternalId(reverify, this.internalId, this.publicKey, this.privateKey)
    }
  }
}

export default SharpSports;
