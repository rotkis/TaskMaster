import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableHighlight,
  Alert,
} from "react-native";
import firebase from "../config/config";

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      loading: true,
    };
  }

  componentDidMount() {
    this.loadTasks();
  }

  loadTasks = () => {
    this.tasksRef = firebase.database().ref("/tasks");
    this.tasksRef.on("value", (snapshot) => {
      const tasks = [];
      snapshot.forEach((childSnapshot) => {
        tasks.push({
          id: childSnapshot.key,
          ...childSnapshot.val(),
        });
      });
      this.setState({ tasks, loading: false });
    });
  };

  componentWillUnmount() {
    this.tasksRef.off();
  }

  deleteTask = (taskId) => {
    firebase
      .database()
      .ref(`/tasks/${taskId}`)
      .remove()
      .then(() => Alert.alert("Sucesso!", "Tarefa excluída!"))
      .catch((error) => Alert.alert("Erro", error.message));
  };

  renderItem = ({ item }) => (
    <TouchableHighlight
      style={styles.item}
      onPress={() =>
        this.props.navigation.navigate("TaskDetail", { task: item })
      }
    >
      <View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.description}</Text>
        <TouchableHighlight
          style={styles.deleteButton}
          onPress={() => this.deleteTask(item.id)}
        >
          <Text style={styles.deleteText}>Excluir</Text>
        </TouchableHighlight>
      </View>
    </TouchableHighlight>
  );

  render() {
    return (
      <View style={styles.container}>
        <TouchableHighlight
          style={styles.addButton}
          onPress={() => this.props.navigation.navigate("TaskDetail")}
        >
          <Text style={styles.addText}>+ Nova Tarefa</Text>
        </TouchableHighlight>

        <FlatList
          data={this.state.tasks}
          renderItem={this.renderItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.empty}>Nenhuma tarefa cadastrada</Text>
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  item: {
    backgroundColor: "#f8f8f8",
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  addText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "#ff4444",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignSelf: "flex-start",
  },
  deleteText: {
    color: "white",
  },
  empty: {
    textAlign: "center",
    marginTop: 20,
    color: "#999",
  },
});

export default HomeScreen;
