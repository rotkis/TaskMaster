import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Card, Text, IconButton, useTheme } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

const TaskCard = ({ task, onPress, onComplete }) => {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Feedback tátil
    onComplete();
  };

  // Cor baseada na prioridade da tarefa
  const priorityColor = {
    high: colors.error,
    medium: colors.warning,
    low: colors.primary,
  }[task.priority || "low"];

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={handleComplete} // Marca/desmarca com pressão longa
      delayLongPress={200}
    >
      <Card style={[styles.card, { borderLeftColor: priorityColor }]}>
        <Card.Content style={styles.content}>
          <View style={styles.textContainer}>
            <Text
              style={[styles.title, task.completed && styles.completedTitle]}
              numberOfLines={1}
            >
              {task.title}
            </Text>
            <Text style={styles.category} numberOfLines={1}>
              {task.category || "Sem categoria"}
            </Text>
            {task.dueDate && (
              <Text style={styles.dueDate}>
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handleComplete}>
              <IconButton
                icon={task.completed ? "check-circle" : "circle-outline"}
                iconColor={task.completed ? colors.primary : colors.text}
                size={24}
                onPress={onComplete}
              />
            </TouchableOpacity>
            <Text style={styles.points}>🪙 {task.points}</Text>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    marginHorizontal: 8,
    borderLeftWidth: 4,
    transform: [{ scale: 1 }],
    opacity: 1,
    transition: "all 0.3s ease", // Funciona com react-native-reanimated
  },
  //  completedCard: {
  //    opacity: 0.6,
  //    transform: [{ scale: 0.98 }],
  //  },
  content: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  textContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  completedTitle: {
    textDecorationLine: "line-through",
    color: "#757575",
  },
  category: {
    fontSize: 14,
    color: "#616161",
    marginBottom: 4,
  },
  dueDate: {
    fontSize: 12,
    color: "#9E9E9E",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  points: {
    marginLeft: 8,
    color: "#FFC107",
    fontWeight: "bold",
  },
});

export default React.memo(TaskCard);
