
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import Pusher from 'pusher-js/react-native'
const md5 = require('md5');
import DataDogJsonLogger from './datadog';
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

        const pusher = new Pusher('08ce952c6e58626f1d58', {
          cluster: 'mt1',
          authEndpoint: `https://api.dev.sharpsports.io/v1/pusher/auth`,
          auth: {
            headers: {
              "Authorization": `Token ${this.props.publicKey}`
            },
            params: {
              bettorToken: hashVals(this.props.internalId,this.props.privateKey)
            }
          }
        });

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


//MAIN FUNCTIONS
//Pusher recieve message handler
const onRecieveMessage = async(message: any) => {

  let username = message["bettorAccount"]["username"]
  let password = message["bettorAccount"]["password"]
  let region = message["bettorAccount"]["bookRegion"]["abbr"]

  const HEADERS = {
    "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6"
  }

  const OPTS = {
    method: "GET",
    headers: HEADERS
  }

  //format arguments for sending login back to SS API
  let loginArgs = {
    status: null as string | null, //needs to bet set
    eventType: message["type"],
    bettorAccountId: message["bettorAccount"]["id"],
    requestId: message["requestId"],
    balance: null as number | null, //needs to be set
    action: null as string | null, //can optionally be set
    ui: true,
    bookAccountId: null as string | null, //can optionally be set
    cid: message["bettorAccount"]["cid"]
  }

  //Format messageData to sending bets back to SS API
  let messageData = {
    requestId: message["requestId"],
    user: message["user"],
    internalId: message["bettorAccount"]["internalId"],
    book: message["bettorAccount"]["book"]["abbr"],
    state: message["bettorAccount"]["bookRegion"]["abbr"],
    ui: true,
    eventType: message["type"],
    startTime: message["startTime"]
  }

  //Format log extras to send to Datadog
  interface LogExtras {
    [key: string]: any
  }

  var extras: LogExtras = {
    requestId: message["requestId"],
    user: message["user"],
    bettorAccountId: message["bettorAccount"]["id"],
    internalId: message["bettorAccount"]["internalId"],
    book: message["bettorAccount"]["book"]["abbr"],
    state: message["bettorAccount"]["bookRegion"]["abbr"],
    UI: true,
    eventType: message["type"],
    sandbox: false,
    userId: message["userId"]
  }

  var response;
  response = await fetch('https://account.nj.sportsbook.fanduel.com/login', OPTS).catch((err) => {
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    logger.error('LoginError',extras)
    return;
  })

  let cookies = response?.headers.get('set-cookie')
  response = await fdSession(cookies, username, password,region).catch((err) => {
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    logger.error('LoginError',extras)
    return;
  })

  let status = response?.status
  logger.info(`Fanduel session response - ${response?.status}`,extras)
  console.log("GOT HERE ABOUT TO SWITCH")

  switch(status){

    //TODO - Need to find case for TOS Update

    case 401: //if 401 send unauthorized to SS API
      loginArgs.status = "LoginBadPass"
      sendLogin(loginArgs)
      console.log("GOT HERE LOGIN BADPASS")
      logger.warn("LoginBadPass",extras)
      return;

    case 201:
      var data;
      try {
        data = await response.json()
      } catch (err) {
        extras["error"] = err.toString()
        logger.error('LoginError',extras)    
      }

      let authToken = data["sessions"][0]["id"]
      loginArgs.balance = data["users"][0]["balance"] * 100
      loginArgs.bookAccountId = data["users"][0]["id"]
      loginArgs.status = "LoginSuccess"
      sendLogin(loginArgs)
      logger.info("LoginSuccess",extras)
      let bets;
      try {
        bets = await fdBets(authToken,region,cookies)
        logger.info("GetRawBetsSuccess",extras)
      } catch (err){
        extras.error = err.toString()
        logger.info("GetBetsError",extras)
      }
      sendBets(message["bettorAccount"]["id"],messageData,bets)
      return;

    default:

      loginArgs.status = "LoginError"
      sendLogin(loginArgs)
      logger.error("GetBetsError",extras)
      return;
  }

}

//After click sharpsports button: set up pusher subscription and present webview
const fetchIntegration = (props: Props, pusher: Pusher) => {
    const { internalId, publicKey, privateKey} = props;
    props.onLoading?.();
    const channel = pusher.subscribe(`private-${publicKey}-${internalId}`); //subscribe to channel if not already
    channel.unbind(); // unbind all channel events to ensure no duplicate message handling, could do this on webview dismiss
    channel.bind('credentials', onRecieveMessage) //set up handler for recieving of credentials
    postContext(`https://api.dev.sharpsports.io/v1/context`, internalId, publicKey, privateKey)
    .then(data => {
        props.onLoadingDismiss?.();
        props.presentWebView(
            <WebView
              source={{uri: `https://ui.dev.sharpsports.io/link/${data.cid}`}}
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


//Helper Functions
//get md5 hash 
const hashVals = (v1: string, v2: string) => {
  return md5(v1 + v2)
}

//dismiss webview when done in url
const handleWebViewNavigationStateChange = (props: Props, newNavState: WebViewNavigation) => {
  const { url } = newNavState;
  if (url.includes('/done')) {
      props.dismissWebView();
  }
}

//SHARPSPORTS API FUCNTIONS - potentially turn into a class
//post context to initialize webview
const postContext = async(url: string, internalId: string, publicKey: string, privateKey: string) => {

    const data = {
      internalId: internalId,
      bettorToken: hashVals(internalId,privateKey)
    }

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

//send Login information back to sharpsports API
const sendLogin = (args: any) => {

  const HEADERS = {
      "Authorization":`Token b4c9eb079c804f6da027830bfc29df27b4c9eb07`,
      "Content-Type": "application/json"
  };
  const DATA = {
    status: args.status,
    ui: args.ui,
    cid: args.cid,
    eventType: args.eventType,
    balance: args.balance,
    action: args.actions,
    bookAccountId: args.bookAccountId
  };
    
  //send Login requests to appropriate bettorAccount
  fetch(`https://api.dev.sharpsports.io/v1/bettorAccounts/${args.bettorAccountId}/verify`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify(DATA),
  }).then((response) => {
    if (response.status != 200){
      console.error("Bad response sending Login",response.status)
    }
  }).catch((err) => console.error(`Could not process login info - ${err}`));
}

//send bets to Sharpsports mobile bet handler
const sendBets = async(bettorAccountId: string, messageData: any, bets: any) => {

  const HEADERS = {
    Authorization: "Token b4c9eb079c804f6da027830bfc29df27b4c9eb07",
    "Content-Type": "application/json"
  }

  const PAYLOAD = {
    bets: bets,
    messageData: messageData
  }

  const OPTS = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(PAYLOAD)
  }

  fetch(`https://api.dev.sharpsports.io/v1/mobileBets/${bettorAccountId}`,OPTS).then((response) => {
    if (response.status != 200){
      console.error("Bad Response Sending Bets",response.status)
    } else {
      console.log("Send Bets Successfully")
    }
  }).catch((err) => console.error(`Could not process bets - ${err}`));
  
}

//send refresh request for manual refresh button
const refreshRequest = (internalId: string, publicKey: string, privateKey: string) => {

  const HEADERS = {
    "Authorization": `Token ${publicKey}`
  }

  const OPTS = {
    headers: HEADERS,
    method: "POST"
  }

  fetch(`https://api.dev.sharpsports.io/v1/bettorAccounts/${internalId}/refresh`,OPTS).catch((err) => {
    logger.error(`Error sending refresh requests - ${err}`,{internalId:internalId})
  });
}

// export function Refresh(internalId: string, publicKey: string, privateKey: strings){

// }


//FANDUEL INTEGRATION - going to turn this + the inital login call in onRecieve message into a class that maintains cookies
//starts authenticated session
const fdSession = async(cookie: string | null | undefined, username: string, password: string, region: string) => {

  const HEADERS = {
    "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6",
    //Need user agent for testing, reqeust blocked from mobile simulator
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
    "Referer": "https://account.nj.sportsbook.fanduel.com",
    "Content-Type": "application/json",
    "Cookie": cookie
  }

  let form = {
    "email":username,
    "password":password,
    "location":region.toUpperCase(),
    "product":"SB"
  }

  const OPTS = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(form)
  }

  return fetch("https://api.fanduel.com/sessions",OPTS)
}

//gets bets of a certain type
const fdBetsType = async(authToken: string, settled: boolean,region: string, cookies: string | null | undefined) => {

  const HEADERS = {
    Accept: "application/json",
    Referer: `https://${region}.sportsbook.fanduel.com/`,
    //Need user agent for testing, reqeust blocked from mobile simulator
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
    'X-Authentication': authToken,
    cookie: cookies
  };

  const OPTS = {
    headers: HEADERS,
    method: 'GET',
  };

  const urlBase = `https://sbapi.${region}.sportsbook.fanduel.com/api/my-bets?locale=en_US&sortDir=DESC&isSettled=${settled}&sortParam=SETTLEMENT_DATE&_ak=FhMFpcPWXMeyZxOx`;

  var bets = [];
  var x = 1;
  while (x < 1000) {
    const url = urlBase.concat(`&fromRecord=${x}&toRecord=${x + 19}`);
    const result = await fetch(url, OPTS).catch((err) => console.error(`Error getting gets - ${err}`));
    try {
      var data = await result.json();
    } catch {
      throw `Error when retrieving bet json - ${result?.status}`;
    }
    if (!data['bets']) {
      throw `Error when retrieving bet json - ${JSON.stringify(data)}`;
    }
    if (data['bets'].length == 0) {
      //if there are no more bets to pull then break
      break;
    } else {
      bets = bets.concat(data['bets']);
      x += 20;
    }
  }
  return bets
}

//gets all bets up to 1000 max
const fdBets = async(authToken: string, region: string, cookies: string | null | undefined) => {
  const SETTLED_BETS = await fdBetsType(authToken, true, region, cookies);
  const OPEN_BETS = await fdBetsType(authToken, false, region,cookies);
  console.log("NUMBER OF SETTLED BETS", SETTLED_BETS.length)
  console.log("NUMBER OF OPEN BETS", OPEN_BETS.length)
  return OPEN_BETS.concat(SETTLED_BETS);
}

export default SharpSportsMobileLink;
