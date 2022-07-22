import { version } from './version'

export default class DataDogJsonLogger {
  constructor() {
  }

  info(message: string, extras: {[key: string]: any}) {
    let jsonLog = this.format(message,extras)
    jsonLog["level"] = "INFO"
    this.sendToDD(jsonLog)
  }

  warn(message: string, extras: {[key: string]: any}) {
    let jsonLog = this.format(message,extras)
    jsonLog["level"] = "WARN"
    this.sendToDD(jsonLog)
  }

  error(message: string, extras: {[key: string]: any}) {
    let jsonLog = this.format(message,extras)
    jsonLog["level"] = "ERROR"
    this.sendToDD(jsonLog)
  }

	format(message : string, extras: {[key: string]: any}) {
    let jsonLog: {[key: string]: any } = {
      "message":message
    }

    //set extra json values
    for (const [key,val] of Object.entries(extras)){
      jsonLog[key] = val
    }

    //set datadog specific logs
    jsonLog["ddsource"] = `sharpsports-mobile-${version}`,
    jsonLog["ddtags"] = `env:prod`
    jsonLog["service"] = "sharpsports-mobile"

    return jsonLog
	}

  sendToDD(jsonLog: {[key: string]: any}){
    const url = "https://http-intake.logs.datadoghq.com/api/v2/logs";
    fetch(url, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        "DD-API-KEY": "54baed1f96dd31e6cc7db952f0ab15a1"
      },
      body: JSON.stringify(jsonLog)
    })
  }
}

