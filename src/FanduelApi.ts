//starts authenticated session
export const fdSession = async(cookie: string | null | undefined, username: string, password: string, region: string, userAgent: string) => {

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

  const OPTS = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(form)
  }

  return fetch("https://api.fanduel.com/sessions",OPTS)
}

//gets bets of a certain type
const fdBetsType = async(authToken: string, settled: boolean,region: string, cookies: string | null | undefined, userAgent: string) => {

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
export const fdBets = async(authToken: string, region: string, cookies: string | null | undefined, userAgent: string) => {
  const SETTLED_BETS = await fdBetsType(authToken, true, region, cookies,userAgent);
  const OPEN_BETS = await fdBetsType(authToken, false, region,cookies,userAgent);
  console.log("NUMBER OF SETTLED BETS", SETTLED_BETS.length)
  console.log("NUMBER OF OPEN BETS", OPEN_BETS.length)
  return OPEN_BETS.concat(SETTLED_BETS);
}