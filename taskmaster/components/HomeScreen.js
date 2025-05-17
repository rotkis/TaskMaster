import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet, FlatList, Alert } from "react-native";
import {
  Text,
  Button,
  Searchbar,
  FAB,
  ActivityIndicator,
} from "react-native-paper";
import firebase from "../config/config";
import { useIsFocused } from "@react-navigation/native";
import TaskCard from "../components/TaskCard";

export default function HomeScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const isFocused = useIsFocused();

  // Busca tarefas no Firebase
  useEffect(() => {
    if (!isFocused) return;

    setLoading(true);
    const userId = "user123"; // Substituir pelo ID do usuário logado

    let query = firebase
      .firestore()
      .collection("tasks")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc");

    if (filter === "completed") {
      query = query.where("completed", "==", true);
    } else if (filter === "pending") {
      query = query.where("completed", "==", false);
    }

    const unsubscribe = query.onSnapshot(
      (snapshot) => {
        const tasksData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksData);
        setLoading(false);
      },
      (error) => {
        Alert.alert("Erro", "Não foi possível carregar as tarefas");
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [isFocused, filter]);

  // Filtra tarefas localmente pela busca
  const filteredTasks = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(lowerQuery) ||
        task.description?.toLowerCase().includes(lowerQuery),
    );
  }, [tasks, searchQuery]);

  // Alterna status da tarefa
  const toggleComplete = useCallback(
    async (taskId) => {
      try {
        const taskRef = firebase.collection("tasks").doc(taskId);
        await taskRef.update({
          completed: !tasks.find((t) => t.id === taskId).completed,
        });
      } catch (error) {
        Alert.alert("Erro", "Não foi possível atualizar a tarefa");
      }
    },
    [tasks],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" animating={true} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Minhas Tarefas
        </Text>
        <Button
          icon="account"
          mode="text"
          onPress={() => navigation.navigate("Profile")}
        >
          Perfil
        </Button>
      </View>

      {/* Barra de busca */}
      <Searchbar
        placeholder="Buscar tarefas..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Filtros */}
      <View style={styles.filterContainer}>
        {["all", "pending", "completed"].map((f) => (
          <Button
            key={f}
            mode={filter === f ? "contained" : "outlined"}
            onPress={() => setFilter(f)}
            style={styles.filterButton}
          >
            {f === "all" && "Todas"}
            {f === "pending" && "Pendentes"}
            {f === "completed" && "Concluídas"}
          </Button>
        ))}
      </View>

      {/* Lista de tarefas */}
      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={() => navigation.navigate("TaskDetail", { task: item })}
            onComplete={() => toggleComplete(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchQuery
                ? "Nenhuma tarefa encontrada"
                : "Nenhuma tarefa cadastrada"}
            </Text>
            <Button
              mode="contained"
              onPress={() => navigation.navigate("TaskDetail", { task: null })}
            >
              Criar Primeira Tarefa
            </Button>
          </View>
        }
        contentContainerStyle={styles.listContent}
        initialNumToRender={10}
      />

      {/* Botão flutuante */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate("TaskDetail", { task: null })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f5f5f5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontWeight: "bold",
    fontSize: 24,
  },
  searchBar: {
    marginBottom: 16,
    borderRadius: 8,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 80,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    gap: 16,
  },
  emptyText: {
    fontSize: 16,
    color: "#757575",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: "#6200EE",
  },
});
