import { Tabs } from 'expo-router';
import React from 'react';
import { Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#0071BC' }}>
      <Tabs.Screen
        name="RobotDisplay"
        options={{
          title: 'Robot',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require("../../../../../assets/images/diver-helmetMenu.png")} // replace with your own image path
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? color : 'gray',  // Set gray when inactive
              }}
            />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="MatchData"
        options={{
          title: 'Match',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require("../../../../../assets/images/coralMatch.png")} // replace with your own image path
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? color : 'gray',  // Set gray when inactive
              }}
            />
          ),
          headerShown: false,
        }}
      />
       <Tabs.Screen
        name="QualData"
        options={{
          title: 'Qual',
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require("../../../../../assets/images/game-controller.png")} // replace with your own image path
              style={{
                width: 28,
                height: 28,
                tintColor: focused ? color : 'gray',  // Set gray when inactive
              }}
            />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

