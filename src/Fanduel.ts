 import UserAgent from 'user-agents';

class Fanduel {
  region: string;
  username: string;
  password: string;
  cookies: string | null;
  authToken: string | null;
  userAgent: string | null;
  otp: string | null;
 
  constructor(region: string, username: string, password: string) {
    this.region = region;
    this.username = username;
    this.password = password;
    this.userAgent = new UserAgent().toString();
    this.cookies = null;
    this.authToken = null;
    this.otp = null;
  }

  async setCookies() {

    const HEADERS = {
      "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6"
    };

    const OPTS = {
      method: "GET",
      headers: HEADERS
    };

    const response = await fetch(`https://account.${this.region}.sportsbook.fanduel.com/login`, OPTS);
    this.cookies = response?.headers.get('set-cookie') || '';
  }

  async session(challengeToken?: string) {
    const HEADERS = {
      "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6",
      "User-Agent": this.userAgent,
      "Referer": `https://account.${this.region}.sportsbook.fanduel.com`,
      "Content-Type": "application/json",
      "Cookie": this.cookies
    };

    let form;
    if (!challengeToken) {

      form = {
        "email":this.username,
        "password":this.password,
        "location":this.region.toUpperCase(),
        "product":"SB"
      };

    } else {

      form = {
        "challenge_token": challengeToken,
        "code": this.otp,
        "location":this.region.toUpperCase(),
        "product":"SB"     
      }
    }

    const body = JSON.stringify(form);

    const OPTS = {
      method: "POST",
      headers: HEADERS,
      body: body
    }

    return fetch("https://api.fanduel.com/sessions",OPTS)
  }

  async getBalance() {

    const HEADERS = {
      Accept: "application/json",
      Referer: `https://${this.region}.sportsbook.fanduel.com/`,
      "User-Agent": this.userAgent,
      "X-Auth-Token": this.authToken,
      "Authorization": "Basic ZWJlMzQ0ZTcwZWJmNzJhM2UzZjE4ZTNkZGM2OWM3ZDY6",
      "X-Brand":"Fanduel",
      "X-Currency": "USD",
      cookie: this.cookies
    };
  
    const OPTS = {
      method: "GET",
      headers: HEADERS
    }
    const walletResponse = await fetch("https://api.fanduel.com/account/wallet",OPTS)
    if (walletResponse.status != 200){
      throw new Error(`Error Getting Balance - ${walletResponse.status}`)
    }
    const walletData = await walletResponse.json()
    const balances = walletData.wallet_balances
    return balances.find((x: any) => x.account_type === "SPORTSBOOK_PLAYABLE").balance * 100
  }

  async betsType(settled: boolean) {

    const HEADERS = {
      Accept: "application/json",
      Referer: `https://${this.region}.sportsbook.fanduel.com/`,
      "User-Agent": this.userAgent,
      'X-Authentication': this.authToken,
      cookie: this.cookies
    };
  
    const OPTS = {
      headers: HEADERS,
      method: 'GET',
    };
  
    const urlBase = `https://sbapi.${this.region}.sportsbook.fanduel.com/api/my-bets?locale=en_US&sortDir=DESC&isSettled=${settled}&sortParam=SETTLEMENT_DATE&_ak=FhMFpcPWXMeyZxOx`;
  
    var bets = [] as any;
    var x = 1;
    while (x < 1000) {
      const url = urlBase.concat(`&fromRecord=${x}&toRecord=${x + 19}`);
      const result = await fetch(url, OPTS)
      var data = {} as any;
      try {
        data = await result.json();
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

  async getBets(){
    const SETTLED_BETS = await this.betsType(true);
    const OPEN_BETS = await this.betsType(false);
    return OPEN_BETS.concat(SETTLED_BETS);
  }
}

export default Fanduel;