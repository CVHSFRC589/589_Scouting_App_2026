import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Button, Image, Text, View, StyleSheet } from "react-native";
import { useFonts } from 'expo-font';
import React from "react";

type backButtonProps = {
    //providing image source isn't working, and its unnecessary since we only want one image for the back button. 
    buttonName: string;
  };
  
const StateBackButton = (props: backButtonProps) => {
    let imageUrl: string;
    const router = useRouter();
    
    const handleBack = () => {
        // Navigate back and set the 'returned' parameter to 'true'
        router.back();
        router.setParams({ returned: 'true' });
    };

    return (
        <Pressable 
                style={styles.backButton}
                onPress={() => {
                    handleBack();
                }}
                >
                <Image style = {styles.backButtonIcon} source={require('./../assets/images/back_arrow.png')} />
        </Pressable>
    )
};

const styles = StyleSheet.create({
backButton: {
    borderRadius: 4,
    //backgroundColor: 'rgba(0, 130, 190, 255)', //removing background color so we can use an image. 
    //borderWidth: 1,                            //removing border for same reason as above
    borderColor: 'white',
    width: 20,
    height: 20,
    marginBottom: 15,
    marginTop: 25,
},
backButtonIcon: {
    width: 20,
    height: 20,
}
});

export default StateBackButton;