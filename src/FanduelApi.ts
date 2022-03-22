//import fetch from 'node-fetch';
//import { HeadersInit, BodyInit, RequestInit } from 'node-fetch';

//starts authenticated session
export const fdSession = async(cookie: string, username: string, password: string, region: string, userAgent: string) => {

  const HEADERS = {
    "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6",
    "User-Agent": userAgent,
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

  let body = JSON.stringify(form)

  const OPTS = {
    method: "POST",
    headers: HEADERS,
    body: body
  }

  return fetch("https://api.fanduel.com/sessions",OPTS)
}

export const fdWallet = async(authToken: string, region: string, cookies: string, userAgent: string) => {

  const HEADERS = {
    Accept: "application/json",
    Referer: `https://${region}.sportsbook.fanduel.com/`,
    "User-Agent": userAgent,
    "X-Auth-Token": authToken,
    "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6",
    "X-Brand":"Fanduel",
    "X-Currency": "USD",
    cookie: cookies
  };

  const OPTS = {
    method: "GET",
    headers: HEADERS
  }

  return fetch("https://api.fanduel.com/account/wallet",OPTS)
  
}

//gets bets of a certain type
const fdBetsType = async(authToken: string, settled: boolean,region: string, cookies: string, userAgent: string) => {

  const HEADERS = {
    Accept: "application/json",
    Referer: `https://${region}.sportsbook.fanduel.com/`,
    "User-Agent": userAgent,
    'X-Authentication': authToken,
    cookie: cookies
  };

  const OPTS = {
    headers: HEADERS,
    method: 'GET',
  };

  const urlBase = `https://sbapi.${region}.sportsbook.fanduel.com/api/my-bets?locale=en_US&sortDir=DESC&isSettled=${settled}&sortParam=SETTLEMENT_DATE&_ak=FhMFpcPWXMeyZxOx`;

  var bets = [] as any;
  var x = 1;
  while (x < 1000) {
    const url = urlBase.concat(`&fromRecord=${x}&toRecord=${x + 19}`);
    const result = await fetch(url, OPTS).catch((err) => console.error(`Error getting gets - ${err}`));
    var data = {} as any;
    try {
      data = await result?.json();
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
export const fdBets = async(authToken: string, region: string, cookies: string, userAgent: string) => {
  const SETTLED_BETS = await fdBetsType(authToken, true, region, cookies,userAgent);
  const OPEN_BETS = await fdBetsType(authToken, false, region,cookies,userAgent);
  return OPEN_BETS.concat(SETTLED_BETS);
}