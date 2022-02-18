
import * as React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export interface Props {
    internalId: string;
    buttonText: string;
    publicKey: string;
    privateKey: string;
    paddingVertical: number;
    paddingHorizontal: number;
    backgroundColor: string;
    buttonColor: string;
    borderRadius: number;
    fontFamily: string;
    fontSize: number;
    textAlign: 'center' | 'left' | 'right | justify'
    fetchIntegration: () => void;
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
            fontFamily
        } = this.props;

        const buttonStyle = {
            backgroundColor,
            paddingVertical,
            paddingHorizontal,
            borderRadius,
            textAlign
        }

        const buttonTextStyle = {
            color: buttonColor,
            fontSize,
            fontFamily
        }

        return (
            <TouchableOpacity onPress={() => this.props.fetchIntegration()} style={{justifyContent: "center" }}>
                <View style={{ ...buttonStyle }}>
                    <Text style={{ ...buttonTextStyle }}>
                        { this.props.buttonText }
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }
}

export default SharpSportsMobileLink;

