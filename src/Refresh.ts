import { refreshRequestInternalId, refreshRequestBettorId, refreshRequestBettorAccountId} from './SharpSportsApi';
import {initPusher, onRecieveMessage} from "./Pusher"


export interface RefreshArgs {
  internalId: string,
  publicKey: string,
  privateKey: string,
  bettorId?: string,
  bettorAccountId?: string
}

export const Refresh = (args: RefreshArgs) => {
  const pusher = initPusher(args.internalId, args.publicKey, args.privateKey)
  const channel = pusher.subscribe(`private-encrypted-${args.publicKey}-${args.internalId}`); //subscribe to channel if not already
  channel.unbind(); // unbind all channel events to ensure no duplicate message handling, could do this on webview dismiss
  channel.bind('refresh', onRecieveMessage) //set up handler for recieving of credentials

  if (args.bettorId && args.bettorAccountId){
    throw 'You cannot input both a bettorId and a bettorAccountId'
  } else if (args.bettorId){
    return refreshRequestBettorId(args.internalId, args.bettorId, args.publicKey, args.privateKey)
  } else if (args.bettorAccountId){
    return refreshRequestBettorAccountId(args.internalId, args.bettorAccountId, args.publicKey, args.privateKey)
  } else {
    return refreshRequestInternalId(args.internalId, args.publicKey, args.privateKey)
  }
}

export default Refresh;


