"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __importStar(require("react"));
const react_native_1 = require("react-native");
const react_native_webview_1 = require("react-native-webview");
class SharpSportsMobileLink extends React.Component {
    render() {
        const { backgroundColor, paddingVertical, paddingHorizontal, borderRadius, textAlign, buttonColor, fontSize, fontFamily, buttonStyle, buttonTextStyle } = this.props;
        const buttonStyles = [
            {
                backgroundColor,
                paddingVertical,
                paddingHorizontal,
                borderRadius,
                textAlign,
            },
            buttonStyle,
        ];
        const buttonTextStyles = [
            {
                color: buttonColor,
                fontSize,
                fontFamily,
            },
            buttonTextStyle,
        ];
        return (<react_native_1.TouchableOpacity onPress={() => fetchIntegration(this.props)} style={{ justifyContent: "center" }}>
                <react_native_1.View style={buttonStyles}>
                    <react_native_1.Text style={buttonTextStyles}>
                        {this.props.buttonText}
                    </react_native_1.Text>
                </react_native_1.View>
            </react_native_1.TouchableOpacity>);
    }
}
const buildURL = (data, logoUrl) => {
    return logoUrl ? `https://ui.sharpsports.io/link/${data.cid}?user_logo=${logoUrl}` : `https://ui.sharpsports.io/link/${data.cid}`;
};
const fetchIntegration = (props) => {
    const { internalId, token, logoUrl } = props;
    props.onLoading?.();
    postContext('https://api.sharpsports.io/v1/context', { internalId: internalId }, token)
        .then(data => {
        props.onLoadingDismiss?.();
        props.presentWebView(<react_native_webview_1.WebView source={{ uri: buildURL(data, logoUrl) }} style={{ justifyContent: "center" }} onNavigationStateChange={(newNavState) => handleWebViewNavigationStateChange(props, newNavState)}/>);
    })
        .catch(error => {
        console.log(`Error occurred: ${error}`);
        props.onError?.();
    });
};
const postContext = async (url, data = {}, token) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    return response.json();
};
const handleWebViewNavigationStateChange = (props, newNavState) => {
    const { url } = newNavState;
    if (url.includes('/done')) {
        props.dismissWebView();
    }
};
exports.default = SharpSportsMobileLink;
//# sourceMappingURL=SharpSportsMobileLink.js.map