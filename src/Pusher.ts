import Pusher from 'pusher-js/react-native'
import { hashVals } from './helpers';
import { sendLogin, sendBets } from './SharpSportsApi';
import { fdSession, fdBets } from './FanduelApi';
import DataDogJsonLogger from './datadog';
import UserAgent from 'user-agents';
const logger = new DataDogJsonLogger

export const initPusher = (internalId: string, publicKey: string, privateKey: string) => {

  const pusher = new Pusher('55c103c6264bba876169', {
    cluster: 'mt1',
    authEndpoint: `https://api.stg.sharpsports.io/v1/pusher/auth`,
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

  let username = message["bettorAccount"]["username"]
  let password = message["bettorAccount"]["password"]
  let region = message["bettorAccount"]["bookRegion"]["abbr"]

  console.log("RECIEVED MESSAGE OF TYPE", message["type"])
  console.log("USERNAME",username)
  console.log("PASSWORD",password)

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
  const userAgent = new UserAgent().toString();
  console.log("USERAGENT",userAgent)

  var response;
  response = await fetch('https://account.nj.sportsbook.fanduel.com/login', OPTS).catch((err) => {
    console.log("GOT HERE LOGIN ERROR INITIAL",err)
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    logger.error("LoginError",extras)
    return;
  })

  let cookies = response?.headers.get('set-cookie')
  response = await fdSession(cookies, username, password,region,userAgent).catch((err) => {
    console.log("GOT HERE LOGIN ERROR SESSION",err)
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    logger.error('LoginError',extras)
    return;
  })

  let status = response?.status
  console.log(`Fanduel session response - ${response?.status}`)
  logger.info(`Fanduel session response - ${response?.status}`,extras)

  switch(status){

    case 401: //if 401 send unauthorized to SS API
      loginArgs.status = "LoginBadPass"
      sendLogin(loginArgs)
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
        bets = await fdBets(authToken,region,cookies,userAgent)
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

