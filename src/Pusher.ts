import Pusher from 'pusher-js/react-native'
import { hashVals } from './helpers';
import { sendLogin, sendBets } from './SharpSportsApi';
import { fdSession, fdBets, fdWallet } from './FanduelApi';
import DataDogJsonLogger from './datadog';
import UserAgent from 'user-agents';
const logger = new DataDogJsonLogger

export const initPusher = (internalId: string, publicKey: string, privateKey: string) => {

  const pusher = new Pusher('e68a810e3cf33be9dd8d', {
    cluster: 'mt1',
    authEndpoint: `https://api.sharpsports.io/v1/pusher/auth`,
    auth: {
      headers: {
        "Authorization": `Token ${publicKey}`
      },
      params: {
        bettorToken: hashVals(internalId,privateKey)
      }
    }
  });

  logger.info("Pusher Initialized",{internalId:internalId})

  return pusher
}

//Pusher recieve message handler
export const onRecieveMessage = async(message: any) => {

  var start = Date.now()

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
    startTime: start
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
    userId: message["userId"],
    metadata: {}
  }
  logger.info("Invoke",extras)
  const userAgent = new UserAgent().toString();

  var response;
  response = await fetch('https://account.nj.sportsbook.fanduel.com/login', OPTS).catch((err) => {
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    extras["fdApiCall"] = 'Login'
    logger.error("LoginError",extras)
    return;
  })

  var cookies = response?.headers.get('set-cookie') || ''
  response = await fdSession(cookies, username, password,region,userAgent).catch((err) => {
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    extras["fdApiCall"] = 'Session'
    logger.error('LoginError',extras)
    return;
  })

  let status = response?.status
  logger.info(`Fanduel session response - ${response?.status}`,extras)

  switch(status){

    case 401: //if 401 send unauthorized to SS API
      loginArgs.status = "LoginBadPass"
      sendLogin(loginArgs)
      logger.warn("LoginBadPass",extras)
      return;

    case 201:
      var data = {} as any;
      try {
        data = await response?.json();
      } catch (err: any) {
        extras["error"] = err.toString()
        logger.error('LoginError',extras)    
      }


      let authToken = data["sessions"][0]["id"]
      loginArgs.bookAccountId = data["users"][0]["id"]

      //Retrieve playable sportsbook balance
      let walletData;
      let walletResponse = await fdWallet(authToken,region,cookies,userAgent)
      loginArgs.balance = null;
      if (walletResponse.status != 200){
        extras["walletResponse"] = JSON.stringify(walletResponse)
        logger.error('Error Getting Balance',extras)
      } else {
        try{
          walletData = await walletResponse.json()
          const balances = walletData.wallet_balances 
          loginArgs.balance = balances.find((x: any) => x.account_type === "SPORTSBOOK_PLAYABLE").balance * 100
        } catch (err: any){
          extras["error"] = err.toString()
          extras["walletResponseStatus"] = walletResponse.status
          logger.error('Error Getting Balance',extras) 
        }
      }

      loginArgs.status = "LoginSuccess"
      sendLogin(loginArgs)
      extras["metadata"]["runtime"] = Date.now() - start
      logger.info("LoginSuccess",extras)
      let bets;
      try {
        bets = await fdBets(authToken,region,cookies,userAgent)
        extras["metadata"]["runtime"] = Date.now() - start
        extras["metadata"]["count"] = bets.length
        logger.info("GetRawBetsSuccess",extras)
      } catch (err: any){
        extras["error"] = err.toString()
        extras["fdApiCall"] = 'Bets'
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

