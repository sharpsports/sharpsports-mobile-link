import { hashVals } from "./helpers";
import { version } from './version'

export const postContext = async(url: string, internalId: string, publicKey: string, privateKey: string) => {

  const data = {
    internalId: internalId,
    bettorToken: hashVals(internalId,privateKey)
  }

  url = url.concat(`?service=sharpsports-mobile-rn_${version}`)

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
  let url = `https://api.sharpsports.io/v1/bettors/${internalId}/refresh?auth=${auth}&service=sharpsports-mobile-rn_${version}`
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
  let url = `https://api.sharpsports.io/v1/bettors/${bettorId}/refresh?auth=${auth}&service=sharpsports-mobile-rn_${version}`
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
  let url = `https://api.sharpsports.io/v1/bettorAccounts/${bettorAccountId}/refresh?auth=${auth}&service=sharpsports-mobile-rn_${version}`
  if (reverify){
    url = url.concat('&reverify=true')
  }
  return fetch(url,OPTS)
}

//need to align version - get rid of hardcoded 1.0.0. Currently 2.x.x would result in iOS code being loaded
export const loadCode = async() => {
  let response = await fetch(`https://api.sharpsports.io/v1/mobileCode?version=1.0.0&service=sharpsports-mobile-rn_${version}`,
    {
      headers: {
        "Authorization": "Token b4c9eb079c804f6da027830bfc29df27b4c9eb07"
      },
      method: "GET"
    }
  );
  const data = await response.json()
  return data['detail']
}