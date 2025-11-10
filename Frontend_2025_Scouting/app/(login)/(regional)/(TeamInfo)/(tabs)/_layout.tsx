import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { AppFooter } from '@/components/AppFooter';

export default function TabLayout() {
  return (
    <View style={styles.container}>
      <View style={styles.tabsContainer}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#0071BC',
            tabBarInactiveTintColor: 'gray',
            tabBarLabelPosition: 'beside-icon',
            tabBarStyle: {
              height: 60,
              paddingHorizontal: 10,
              paddingTop: 10,
              paddingBottom: 10,
              backgroundColor: '#E6F4FF',
              borderTopWidth: 2,
              borderTopColor: '#0071BC',
              elevation: 0,
            },
            tabBarItemStyle: {
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              borderRightWidth: 2,
              borderRightColor: '#0071BC',
              paddingHorizontal: 15,
              gap: 8,
              flex: 1,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: 'bold',
              marginLeft: 0,
              width: 'auto',
            },
            tabBarIconStyle: {
              width: 24,
              height: 24,
              marginRight: 0,
            },
          }}
        >
          <Tabs.Screen
            name="RobotDisplay"
            options={{
              title: 'Robot',
              tabBarIcon: ({ color, focused }) => (
                <Image
                  source={require("../../../../../assets/images/diver-helmetMenu.png")}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? color : 'gray',
                  }}
                />
              ),
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="MatchData"
            options={{
              title: 'Total',
              tabBarIcon: ({ color, focused }) => (
                <Image
                  source={require("../../../../../assets/images/coralMatch.png")}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? color : 'gray',
                  }}
                />
              ),
              headerShown: false,
            }}
          />
           <Tabs.Screen
            name="QualData"
            options={{
              title: 'Match',
              tabBarIcon: ({ color, focused }) => (
                <Image
                  source={require("../../../../../assets/images/game-controller.png")}
                  style={{
                    width: 24,
                    height: 24,
                    tintColor: focused ? color : 'gray',
                  }}
                />
              ),
              headerShown: false,
              tabBarItemStyle: {
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                borderRightWidth: 0,
                paddingHorizontal: 15,
                gap: 8,
                flex: 1,
              },
            }}
          />
        </Tabs>
      </View>
      <AppFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flex: 1,
  },
});

