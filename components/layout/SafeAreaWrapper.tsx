import React from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  ViewStyle,
  View,
  Platform,
} from 'react-native';
import Colors from '../../constants/Colors';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
}

export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  backgroundColor = Colors.white,
}) => {
  // Web doesn't need SafeAreaView, so we render View instead
  const Container = Platform.OS === 'web' ? View : SafeAreaView;

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={backgroundColor}
        translucent={Platform.OS === 'android'}
      />
      <Container
        style={[styles.container, { backgroundColor }, style]}
      >
        {children}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeAreaWrapper;