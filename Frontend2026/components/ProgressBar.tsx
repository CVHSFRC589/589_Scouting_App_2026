import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";

interface ProgressBarProps {
  currentStep: "Pre" | "Auto" | "Tele" | "Post";
}

const steps = ["Pre", "Auto", "Tele", "Post"];
const screenWidth = Dimensions.get("window").width;

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep }) => {
  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const isActive = step === currentStep;
        const isCompleted = index < steps.indexOf(currentStep) || (isActive && currentStep === step);

        return (
          <View key={step} style={styles.stepContainer}>
            {/* Line before the circle (except for the first step) */}
            {index !== 0 && (
              <View
                style={[styles.line, isCompleted && styles.activeLine, { width: screenWidth * 0.25 }]}
              />
            )}

            {/* Step Circle */}
            <View style={[styles.circle, isCompleted && styles.completedCircle, isActive && styles.activeCircle]} />

            {/* Step Label */}
            <Text style={[styles.label, isCompleted && styles.completedLabel, isActive && styles.activeLabel]}>
              {step}
            </Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: screenWidth * 1.1,
    alignSelf: "center",
  },
  stepContainer: {
    flexDirection: "column",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  line: {
    position: "absolute",
    height: 2,
    backgroundColor: "#ccc",
    width: screenWidth * 0.3,
    top: 7,
    left: "-45%",
    zIndex: -1,
  },
  activeLine: {
    backgroundColor: "#000000",
  },
  circle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ccc",
  },
  completedCircle: {
    backgroundColor: "#000000", // Black for completed steps
  },
  activeCircle: {
    backgroundColor: "#000000", // Black for the active step
  },
  label: {
    marginTop: 5,
    fontSize: 12,
    color: "#ccc",
  },
  completedLabel: {
    color: "#000000", // Black for completed text
  },
  activeLabel: {
    fontWeight: "bold",
    color: "#000000", // Active step text is also black
  },
});

export default ProgressBar;