import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  delay?: number; // Optional delay before animation starts
}

export default function AnimatedView({ children, style, delay = 0 }: Props) {
  const fadeAnim = useRef(new Animated.Value(0)).current;  // Start invisible
  const slideAnim = useRef(new Animated.Value(50)).current; // Start 50px down

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: delay,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
        delay: delay,
      })
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}