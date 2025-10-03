import { Stack } from "expo-router";
import React from "react";

const RootLayout = () => {
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
