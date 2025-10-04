import { Stack } from "expo-router";
import React, { useEffect } from "react";
import { LogBox } from "react-native";

const RootLayout = () => {
    useEffect(() => {
        // Disable all LogBox warnings and errors for demo mode
        LogBox.ignoreAllLogs(true);
    }, []);

    return (
        <Stack screenOptions = {{headerShown: false, contentStyle:{
        },
        }}>
            <Stack.Screen
                name = "index"
                options = {{
                    headerShown: false,
                    headerTitle: "Welcome Page"
                }}
            />
        </Stack>
    )
}

export default RootLayout;
