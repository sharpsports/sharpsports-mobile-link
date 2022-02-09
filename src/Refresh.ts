import { refreshRequest } from './SharpSportsApi';
import {initPusher, onRecieveMessage} from "./Pusher"

export const RefreshBettor = (internalId: string, publicKey: string, privateKey: string) => {
  const pusher = initPusher(internalId, publicKey, privateKey)
  const channel = pusher.subscribe(`private-${publicKey}-${internalId}`); //subscribe to channel if not already
  channel.unbind(); // unbind all channel events to ensure no duplicate message handling, could do this on webview dismiss
  channel.bind('refresh', onRecieveMessage) //set up handler for recieving of credentials
  refreshRequest(internalId, publicKey, privateKey)
}
