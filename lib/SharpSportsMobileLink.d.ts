import * as React from 'react';
import { ViewStyle, TextStyle } from 'react-native';
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
    textAlign: 'center' | 'left' | 'right | justify';
    onLoading?: () => void;
    onLoadingDismiss?: () => void;
    onError?: () => void;
    presentWebView: (webView: JSX.Element) => void;
    dismissWebView: () => void;
    buttonStyle: ViewStyle;
    buttonTextStyle: TextStyle;
}
declare class SharpSportsMobileLink extends React.Component<Props> {
    render(): JSX.Element;
}
export default SharpSportsMobileLink;
