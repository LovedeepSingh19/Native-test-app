import React from 'react'
import { StyleSheet } from 'react-native'
import { Button as PaperButton } from 'react-native-paper'
import { theme } from '../core/theme'
export enum ButtonMode {
    Text = 'text',
    Outlined = 'outlined',
    Contained = 'contained',
    Elevated = 'elevated',
    ContainedTonal = 'contained-tonal'
}

// Define type for mode prop
type ModeType = ButtonMode | undefined;

interface ButtonProps {
    mode: ModeType;
    style?: any;
    onPress: () => void;
    children: string; // Adjust type for children
}

export default function Button({ mode, style, onPress, children }: ButtonProps) {
    return (
        <PaperButton
            mode={mode}
            onPress={onPress}
            style={[
                styles.button,
                mode === ButtonMode.Outlined && { backgroundColor: theme.colors.surface },
                style,
            ]}
            labelStyle={styles.text}
        >
            {children}
        </PaperButton>
    );
}


const styles = StyleSheet.create({
  button: {
    width: '100%',
    marginVertical: 10,
    paddingVertical: 2,
  },
  text: {
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 26,
  },
})
