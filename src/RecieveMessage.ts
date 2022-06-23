import { sendLogin, sendBets, sendStatusToContext, pollForOTP } from './SharpSportsApi';
import DataDogJsonLogger from './datadog';
import Fanduel from './Fanduel';
const logger = new DataDogJsonLogger

interface loginArgs {
  status: string | null,
  eventType: string,
  bettorAccountId: string,
  requestId: string,
  balance: number | null,
  action: string | null,
  ui: boolean,
  bookAccountId: string | null,
  cid: string
}

interface messageData {
  requestId: string,
  user: string,
  bettorAccountId: string,
  internalId: string,
  book: string,
  state: string,
  ui: boolean,
  eventType: string,
  startTime: number
}

interface logExtras {
  requestId: string,
  user: string,
  bettorAccountId: string,
  internalId: string,
  book: string,
  state: string,
  UI: boolean,
  eventType: string,
  sandbox: boolean,
  userId: number,
  metadata: {
    [key: string]: any
  }
}

export const handleSessionResponse = async(
  response: any,
  extras: logExtras,
  messageData: messageData,
  loginArgs: loginArgs,
  fanduel:Fanduel,
  start:number) => {

  let status = response?.status
  logger.info(`Fanduel session response - ${response?.status}`,extras)

  let sessionData;
  try {
     sessionData = await response?.json();
  } catch (err: any) {
    extras["error"] = err.toString()
    extras["fdApiCall"] = "Session"
    logger.error('Login Data not in JSON format', extras)
    logger.error('LoginError',extras)
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)  
    throw new Error(err)
  }

  extras["sessionResponse"] = sessionData
  console.log("GOT HERE SESSION DATA")
  console.log(sessionData)

  switch(status){

     
    case 401: //if 401 send unauthorized to SS API

      let loginSummary = null;
      let errorObject = null;
      if (sessionData['errors']) errorObject = sessionData['errors'][0]
      else if (sessionData['error']) errorObject = sessionData['error']

      loginSummary = errorObject['summary']

      if (loginSummary && loginSummary == 'Authentication code required') { //2FA case

        const challengeToken = errorObject['details']['challenge_token']

        //update context with OTP status
        sendStatusToContext("otp", null, loginArgs.cid, loginArgs.requestId)

        //poll for OTP -> set this.OTP -> session w/ challenge -> call handleSessionResponse
        let pollingStartTime = Number(Date.now());
        try {
          fanduel.otp = await pollForOTP(loginArgs.cid, loginArgs.bettorAccountId,pollingStartTime)
        } catch (err:any) {
          if (err.toString() == "OTP Timeout") {
            loginArgs.status = "LoginBadPass"
            loginArgs.action = "NOOTP"
            sendLogin(loginArgs)
            logger.error("LoginBadPass",extras)
            return;
          }
          else {
            loginArgs.status = "LoginError"
            sendLogin(loginArgs)
            extras["error"] = err.toString()
            logger.error("LoginError",extras)
            return;
          }
        }
        //call new fanduel session with challenge and OTP
        let newSessionResponse;
        try{
          newSessionResponse = await fanduel.session(challengeToken)
        } catch (err: any) {
          loginArgs.status = "LoginError"
          sendLogin(loginArgs)
          extras["error"] = err.toString()
          extras["fdApiCall"] = "Session"
          logger.error("LoginError",extras)
          return;
        }

        handleSessionResponse(newSessionResponse,extras,messageData,loginArgs,fanduel,start)

      } else { 
        
        loginArgs.status = "LoginBadPass"
        loginArgs.action = fanduel.otp ? "BADOTP" : "BADCREDS"
        sendLogin(loginArgs)
        logger.warn("LoginBadPass",extras)
      }

      break;

    case 201:

      fanduel.authToken = sessionData["sessions"][0]["id"]
      loginArgs.bookAccountId = sessionData["users"][0]["id"]

      //Retrieve playable sportsbook balance
      try {
        loginArgs.balance = await fanduel.getBalance()
      } catch (err: any) {
        extras["error"] = err.toString()
        extras["fdApiCall"] = 'Wallet'
        logger.error('Error Getting Balance',extras) 
      }

      loginArgs.status = "LoginSuccess"
      loginArgs.action = fanduel.otp ? "2FA" : null //send 2FA action on success so we can set attribute on bettorAccount
      sendLogin(loginArgs)
      extras["metadata"]["runtime"] = Date.now() - start
      logger.info("LoginSuccess",extras)
      let bets;
      try {
        bets = await fanduel.getBets()
        extras["metadata"]["runtime"] = Date.now() - start
        extras["metadata"]["count"] = bets.length
        logger.info("GetRawBetsSuccess",extras)
      } catch (err: any){
        extras["error"] = err.toString()
        extras["fdApiCall"] = 'Bets'
        logger.info("GetBetsError",extras)
        sendBets(messageData,[],true)
      }
      sendBets(messageData,bets,false)
      break;

    default:

      loginArgs.status = "LoginError"
      sendLogin(loginArgs)
      logger.error("LoginError",extras)
  }

}

//Pusher recieve message handler
export const onRecieveMessage = async(message: any) => {

  console.log("--Recieved Pusher Message--")

  var start = Date.now()

  const username = message["bettorAccount"]["username"]
  const password = message["bettorAccount"]["password"]
  const region = message["bettorAccount"]["bookRegion"]["abbr"]

  const UI = message['UI'] ? true : false

  //format arguments for sending login back to SS API
  let loginArgs: loginArgs = {
    status: null, //needs to bet set
    eventType: message["type"],
    bettorAccountId: message["bettorAccount"]["id"],
    requestId: message["requestId"],
    balance: null, //will be set on successful login
    action: null, //can optionally be set
    ui: UI,
    bookAccountId: null, //will be set on successful login
    cid: message["bettorAccount"]["cid"]
  }

  //Format messageData to sending bets back to SS API
  let messageData: messageData = {
    requestId: message["requestId"],
    user: message["user"],
    bettorAccountId: message["bettorAccount"]["id"],
    internalId: message["bettorAccount"]["internalId"],
    book: message["bettorAccount"]["book"]["abbr"],
    state: message["bettorAccount"]["bookRegion"]["abbr"],
    ui: UI,
    eventType: message["type"],
    startTime: start
  }

  //Format log extras to send to Datadog
  var extras: logExtras = {
    requestId: message["requestId"],
    user: message["user"],
    bettorAccountId: message["bettorAccount"]["id"],
    internalId: message["bettorAccount"]["internalId"],
    book: message["bettorAccount"]["book"]["abbr"],
    state: message["bettorAccount"]["bookRegion"]["abbr"],
    UI: UI,
    eventType: message["type"],
    sandbox: false,
    userId: message["userId"],
    metadata: {}
  }
  logger.info("Invoke",extras)

  const fanduel = new Fanduel(region, username, password)  

  try{
    fanduel.setCookies()
  } catch (err: any) {
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    extras["fdApiCall"] = "Login"
    logger.error("LoginError",extras)
    return;
  }

  let response;
  try{
    response = await fanduel.session()
  } catch (err: any) {
    loginArgs.status = "LoginError"
    sendLogin(loginArgs)
    extras["error"] = err.toString()
    extras["fdApiCall"] = "Session"
    logger.error("LoginError",extras)
    return;
  }

  handleSessionResponse(response,extras,messageData,loginArgs,fanduel,start)
  return;

}

