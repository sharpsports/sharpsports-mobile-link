import Pusher from 'pusher-js/react-native'
import { hashVals } from './helpers';
import { sendLogin, sendBets } from './SharpSportsApi';
import { fdSession, fdBets } from './FanduelApi';
import DataDogJsonLogger from './datadog';
const logger = new DataDogJsonLogger

export const initPusher = (internalId: string, publicKey: string, privateKey: string) => {

  const pusher = new Pusher('08ce952c6e58626f1d58', {
    cluster: 'mt1',
    authEndpoint: `http://localhost:8000/v1/pusher/auth`,
    auth: {
      headers: {
        "Authorization": `Token ${publicKey}`
      },
      params: {
        bettorToken: hashVals(internalId,privateKey)
      }
    }
  });
  return pusher
}

//Pusher recieve message handler
export const onRecieveMessage = async(message: any) => {

  console.log("RECIEVED MESSAGE")

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
  logger.info("Invoke",extras)

  var response;
  response = await fetch('https://account.nj.sportsbook.fanduel.com/login', OPTS).catch((err) => {
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    logger.error("LoginError",extras)
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

