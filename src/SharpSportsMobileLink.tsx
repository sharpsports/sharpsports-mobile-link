import * as React from 'react';
import { View, Text, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';

export interface Props {
  internalId: string;
  token: string;
  buttonText: string;
  logoUrl: string;
  paddingVertical: number;
  paddingHorizontal: number;
  backgroundColor: string;
  buttonColor: string;
  borderRadius: number;
  fontFamily: string;
  fontSize: number;
  textAlign: 'center' | 'left' | 'right | justify'
  onLoading?: () => void;
  onLoadingDismiss?: () => void;
  onError?: () => void;
  presentWebView: (webView: JSX.Element) => void;
  dismissWebView: () => void;
  buttonStyle: ViewStyle;
  buttonTextStyle: TextStyle
}

class SharpSportsMobileLink extends React.Component<Props> {
  render() {
    const {
      backgroundColor,
      paddingVertical,
      paddingHorizontal,
      borderRadius,
      textAlign,
      buttonColor,
      fontSize,
      fontFamily,
      buttonStyle,
      buttonTextStyle
    } = this.props;

    const buttonStyles = [
      {
        backgroundColor,
        paddingVertical,
        paddingHorizontal,
        borderRadius,
        textAlign,
      },
      buttonStyle,
    ]

    const buttonTextStyles = [
      {
        color: buttonColor,
        fontSize,
        fontFamily,
      },
      buttonTextStyle,
    ]

    return (
        <TouchableOpacity onPress={() => fetchIntegration(this.props)} style={{justifyContent: "center" }}>
          <View style={buttonStyles}>
            <Text style={buttonTextStyles}>
              { this.props.buttonText }
            </Text>
          </View>
        </TouchableOpacity>
    )
  }
}

const buildURL = (data: any, logoUrl: string) => {
  return logoUrl ? `https://ui.sharpsports.io/link/${data.cid}?user_logo=${logoUrl}` : `https://ui.sharpsports.io/link/${data.cid}`;
}

const fetchIntegration = (props: Props) => {
  const { internalId, token, logoUrl } = props;
  props.onLoading?.();
  postContext('https://api.sharpsports.io/v1/context', {internalId: internalId}, token)
      .then(data => {
        props.onLoadingDismiss?.();
        props.presentWebView(
            <WebView
                source={{uri: buildURL(data, logoUrl)}}
                style={{justifyContent: "center"}}
                onNavigationStateChange={ (newNavState: WebViewNavigation) =>
                    handleWebViewNavigationStateChange(props, newNavState)
                }
            />
        )
      })
      .catch(error => {
        console.log(`Error occurred: ${error}`)
        props.onError?.()
      })
}

const postContext = async(url: string, data = {}, token: string) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
}

const handleWebViewNavigationStateChange = (props: Props, newNavState: WebViewNavigation) => {
  const { url } = newNavState;
  if (url.includes('/done')) {
    props.dismissWebView();
  }
}

export default SharpSportsMobileLink;