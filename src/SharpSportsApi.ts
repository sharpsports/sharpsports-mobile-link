import { hashVals, delay } from "./helpers";
import DataDogJsonLogger from './datadog';
const logger = new DataDogJsonLogger

export const postContext = async(url: string, internalId: string, publicKey: string, privateKey: string) => {

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
export const sendLogin = (args: any) => {

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
    action: args.action,
    bookAccountId: args.bookAccountId,
    requestId: args.requestId
  };
    
  //send Login requests to appropriate bettorAccount
  fetch(`https://api.sharpsports.io/v1/bettorAccounts/${args.bettorAccountId}/verify`, {
    method: 'PUT',
    headers: HEADERS,
    body: JSON.stringify(DATA),
  }).then((response) => {
    if (response.status != 200){
      logger.error(`Bad response sending Login - ${response.status}`,{})
    }
  }).catch((err) => logger.error(`Could not process login info - ${err}`,{}));
}

//send bets to Sharpsports mobile bet handler
export const sendBets = async(messageData: any, bets: any, error: boolean) => {

  const HEADERS = {
    Authorization: "Token b4c9eb079c804f6da027830bfc29df27b4c9eb07",
    "Content-Type": "application/json"
  }

  let status = error ? "GetBetsError" : null

  const PAYLOAD = {
    status: status,
    bets: bets,
    messageData: messageData,
    requestId: messageData["requestId"]
  }

  const OPTS = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(PAYLOAD)
  }

  fetch(`https://api.sharpsports.io/v1/mobileBets/${messageData.bettorAccountId}`,OPTS).then((response) => {
    if (response.status != 200){
      logger.error(`Bad Response Sending Bets - ${response.status}`,{})
    } else {
      console.log("Send Bets Successfully")
    }
  }).catch((err) => logger.error(`Could not process bets - ${err}`,{}));
}

//send refresh request for manual refresh button using internalId as param
export const refreshRequestInternalId = (reverify: boolean, internalId: string, publicKey: string, privateKey: string) => {

  const HEADERS = {
    "Authorization": `Token ${publicKey}`
  }

  const OPTS = {
    headers: HEADERS,
    method: "POST"
  }

  const auth = hashVals(internalId,privateKey)
  let url = `https://api.sharpsports.io/v1/bettors/${internalId}/refresh?auth=${auth}`
  if (reverify){
    url = url.concat('&reverify=true')
  }
  return fetch(url,OPTS)
}

//send refresh request for manual refresh button using BettorID as param
export const refreshRequestBettorId = (bettorId: string, reverify: boolean, internalId: string, publicKey: string, privateKey: string) => {

  const HEADERS = {
    "Authorization": `Token ${publicKey}`
  }

  const OPTS = {
    headers: HEADERS,
    method: "POST"
  }

  const auth = hashVals(internalId,privateKey)
  let url = `https://api.sharpsports.io/v1/bettors/${bettorId}/refresh?auth=${auth}`
  if (reverify){
    url = url.concat('&reverify=true')
  }
  return fetch(url,OPTS)
}

//send refresh request for manual refresh button using bettorAccountID as param
export const refreshRequestBettorAccountId = (bettorAccountId: string, reverify: boolean, internalId: string, publicKey: string, privateKey: string) => {

  const HEADERS = {
    "Authorization": `Token ${publicKey}`
  }

  const OPTS = {
    headers: HEADERS,
    method: "POST"
  }

  const auth = hashVals(internalId,privateKey)
  let url = `https://api.sharpsports.io/v1/bettorAccounts/${bettorAccountId}/refresh?auth=${auth}`
  if (reverify){
    url = url.concat('&reverify=true')
  }
  return fetch(url,OPTS)
}

export const sendStatusToContext = async(status: string, action: string, cid: string, requestId: string) => {
  //initialize
  var apiBase = 'https://api.sharpsports.io/v1';
  var headers = {
    "Authorization": "Token b4c9eb079c804f6da027830bfc29df27b4c9eb07",
    "Content-Type": "application/json"
  };

  var data = (data = { status: status, requestId: requestId, action: action });
  let r = await fetch(
    `${apiBase}/context/?cid=${cid}`,
    { method: 'PUT', headers: headers, body: JSON.stringify(data) }
  );
  return r;
}

export const pollForOTP = async(cid: string, bettorAccountId: string, pollingStartTime: number) => 
{

  console.log("--------")
  console.log("POLLING",Number(Date.now()) - pollingStartTime)
  
  //if there hasn't been a cid passed through this is the same
  //as timing out with no OTP input at all
  //This happens if account turns of 2FA for the first time after linking
  if (!cid) {
    throw("OTP Timeout")
  }

  const response = await fetch(
    `https://api.sharpsports.io/v1/contexts/${cid}`,
    {
      headers: {
        Authorization: `Token b4c9eb079c804f6da027830bfc29df27b4c9eb07`
      }
    }
  )

  let contextError = false;
  try {
    var data = await response.json();
  } catch(e) {
    console.log("RESPONSE", response.status)
    console.log("ERROR", e)
    contextError = true
    //throw("OTP: Context Response Failure")
  }

  //in case of 500 response from context just try again
  if (contextError){
    console.log("GOT HERE CONTEXT ERROR")
    await delay(2000)
    return await pollForOTP(cid, bettorAccountId,pollingStartTime)  
  }

  let otp = null;
  if (data['otp']){
    otp = data['otp'][bettorAccountId]
  }
  console.log("OTP", otp)

  if(otp !== null){
    // TODO: Set context status to NULL?
    // The API should update the context w/ whatever the resulting status is and stop the UI from polling
    return otp
  } else if (Number(Date.now()) - pollingStartTime > 60000) {
    console.error("OTP Request Timed Out")
    throw("OTP Timeout")
  } else {
    await delay(2000)
    return await pollForOTP(cid, bettorAccountId,pollingStartTime)
  }
}