
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Pusher from 'pusher-js/react-native';
var md5 = require('md5');

export interface Props {
    internalId: string;
    publicKey: string;
    privateKey: string;
    buttonText: string;
    logoUrl: string;
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

        return (
            <TouchableOpacity onPress={() => fetchIntegration(this.props)} style={{justifyContent: "center" }}>
                <View style={{ ...buttonStyle }}>
                    <Text style={{ ...buttonTextStyle }}>
                        { this.props.buttonText }
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

const buildURL = (data: any, logoUrl: string) => {
    return logoUrl ? `http://localhost:3006/link/${data.cid}?user_logo=${logoUrl}` : `http://localhost:3006/link/${data.cid}`;
}

const fetchIntegration = (props: Props) => {
    const { internalId, publicKey, privateKey, logoUrl } = props;
    props.onLoading?.();
    postContext('http://localhost:8000/v1/context', internalId, publicKey, privateKey)
    .then(data => {
        console.log(data)
        setUpPusher(internalId,publicKey,privateKey)
        props.onLoadingDismiss?.();
        props.presentWebView(
            <WebView
              source={{uri: buildURL(data, logoUrl)}}
              style={{justifyContent: "center"}}
              onNavigationStateChange={ (newNavState: WebViewNavigation) =>
                  handleWebViewNavigationStateChange(props, newNavState)
              }
            />
        )
    })
    .catch(error => {
        console.log(`Error occurred: ${error}`)
        props.onError?.()
    })
}

const hashVals = (v1: string, v2: string) => {
  return md5(v1 + v2)
}

const postContext = async(url: string, internalId: string, publicKey: string, privateKey: string) => {

    const data = {
      internalId: internalId,
      bettorToken: hashVals(internalId,privateKey)
    }

    console.log(data)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${publicKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
}

const handleWebViewNavigationStateChange = (props: Props, newNavState: WebViewNavigation) => {
    const { url } = newNavState;
    if (url.includes('/done')) {
        props.dismissWebView();
    }
}

const setUpPusher = (internalId: string, publicKey: string, privateKey: string) => {
    var pusher = new Pusher('08ce952c6e58626f1d58', {
      cluster: 'mt1',
      authEndpoint: "http://localhost:8000/v1/pusher/auth",
      auth: {
        headers: {
          "Authorization": `Token ${publicKey}`
        },
        params: {
          bettorToken: hashVals(internalId,privateKey)
        }
      }
    });
    const channelName = `private-${publicKey}-${internalId}`
    var channel = pusher.subscribe(channelName);
    channel.bind('verify', function(data: any) {
        onRecieveMessage(data);
    });
  }
  
  const fdSession = (cookie: string, username: string, password: string) => {
  
    const HEADERS = {
      "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
      "Referer": "https://account.nj.sportsbook.fanduel.com",
      "Content-Type": "application/json",
      "Cookie": cookie
    }
  
    let form = {
      "email":username,
      "password":password,
      "location":"NJ",
      "product":"SB"
    }
  
    const OPTS = {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify(form)
    }
  
    return fetch("https://api.fanduel.com/sessions",OPTS)
  }
  
  const onRecieveMessage = (message: any) => {

    let username = message['bettorAccount']['username']
    let password = message['bettorAccount']['password']
    let cid = message['bettorAccount']['cid']

    console.log("USERNAME",username)
    console.log("PASSWORD",password)
    
    const HEADERS = {
      "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6"
    }
  
    const OPTS = {
      method: "GET",
      headers: HEADERS
    }
  
    fetch('https://account.nj.sportsbook.fanduel.com/login', opts=OPTS)
      .then((response) => {
        let cookies = response.headers.get('set-cookie')
        let session = fdSession(cookies, username, password)
        session.then((response) => {
          if (response.status == 401){
            //if 401 send unauthorized to SS API (look for TOS stuff)
            console.log("UNAUTHORIZED")
            sendLogin(message["bettorAccount"]["id"],"LoginBadPass",true,cid)
          } else if (response.status != 201){
              //if error to SS API
              console.log("UNKNOWN STATUS CODE")        
          } else {
            response.json().then((data) => {
            let loginToken = data["sessions"][0]["login_token"]
            console.log("RETRIEVED LOGIN DATA")
            sendLogin(message["bettorAccount"]["id"],"LoginSuccess",true,cid)
          }).catch((err) => {
            console.error("RESPONSE NOT IN JSON FORMAT",err)
            //send error to SS API
          })}
        }).catch((err) => {
        //send error back to SS API
        console.error(err)
      })
    })
  }

  const sendLogin = (
    bettorAccountId: string, 
    status: string,
    ui: Boolean,
    cid: string
    ) => {
        const HEADERS = {
            "Authorization":`Token 9ad101a3a6c9a18c992484b252681bee09eeec67`,
            "Content-Type": "application/json"
        };
        const DATA = {
          status: status,
          ui: ui,
          cid: cid
        };
      
        //send Login requests to appropriate bettorAccount
        fetch(`http://localhost:8000/v1/bettorAccounts/${bettorAccountId}/verify`, {
          method: 'PUT',
          headers: HEADERS,
          body: JSON.stringify(DATA),
        }).catch((err) => console.error(err));
  }


export default SharpSportsMobileLink;
