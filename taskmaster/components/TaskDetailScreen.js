import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native";
import { Button, Card, IconButton } from "react-native-paper";
import * as Haptics from "expo-haptics";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import firebase from "../config/config"; // Importe a configuração do Firebase

export default function TaskDetailScreen({ route, navigation }) {
  const { task = {} } = route.params; // Recebe a tarefa passada pela navegação
  const [completed, setCompleted] = useState(task.completed);
  const [imageUri, setImageUri] = useState(task.imageUri || null);

  // Atualiza o status da tarefa no Firebase e vibra ao concluir
  const toggleComplete = async () => {
    if (!task.id) {
      // Se for nova tarefa
      Alert.alert("Aviso", "Salve a tarefa primeiro!");
      return;
    }
    try {
      const taskRef = doc(firebase, "tasks", task.id);
      await updateDoc(taskRef, { completed: !completed });
      setCompleted(!completed);
      if (!completed) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("🎉 Parabéns!", `Você ganhou ${task.points} pontos!`);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível atualizar a tarefa.");
    }
  };
  const handleSave = async () => {
    try {
      const newTaskRef = await addDoc(collection(firebase, "tasks"), {
        title: "Nova Tarefa",
        completed: false,
        userId: "user123",
      });
      navigation.navigate("TaskDetail", {
        task: { id: newTaskRef.id, ...newTaskRef.data() },
      });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível criar a tarefa.");
    }
  };
  // Deleta a tarefa
  const handleDelete = async () => {
    try {
      await deleteDoc(doc(firebase, "tasks", task.id));
      navigation.goBack(); // Volta para a tela anterior após deletar
    } catch (error) {
      Alert.alert("Erro", "Não foi possível deletar a tarefa.");
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={task.title}
          subtitle={`${task.points} pontos`}
          right={() => (
            <IconButton
              icon={completed ? "check-circle" : "circle-outline"}
              color={completed ? "#4CAF50" : "#757575"}
              onPress={toggleComplete}
            />
          )}
        />

        <Card.Content>
          <Text style={styles.description}>
            {task.description || "Nenhuma descrição fornecida."}
          </Text>

          {/* Exibe a imagem da tarefa (se existir) */}
          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.image}
              resizeMode="cover"
            />
          )}

          <Text style={styles.date}>
            📅 Prazo: {task.dueDate || "Sem prazo definido"}
          </Text>
        </Card.Content>

        <Card.Actions style={styles.actions}>
          <Button
            mode="contained"
            onPress={toggleComplete}
            style={styles.button}
          >
            {completed ? "Desmarcar" : "Concluir"}
          </Button>

          <Button
            mode="outlined"
            onPress={handleDelete}
            style={styles.button}
            textColor="#FF3D00"
          >
            Deletar
          </Button>
        </Card.Actions>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  card: {
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    marginVertical: 8,
    color: "#424242",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginVertical: 12,
  },
  date: {
    fontSize: 14,
    color: "#616161",
    marginTop: 8,
  },
  actions: {
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    marginHorizontal: 4,
    flex: 1,
  },
});
