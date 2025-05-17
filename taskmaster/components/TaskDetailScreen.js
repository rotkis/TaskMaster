import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableHighlight,
  Alert,
} from "react-native";
import firebase from "../config/config";

class TaskDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    const task = props.route.params?.task || {};
    this.state = {
      id: task.id || null,
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate || "",
    };
  }

  handleSave = () => {
    if (!this.state.title) {
      Alert.alert("Atenção", "Preencha o título da tarefa");
      return;
    }

    const taskRef = this.state.id
      ? firebase.database().ref(`/tasks/${this.state.id}`)
      : firebase.database().ref("/tasks").push();

    taskRef
      .set({
        title: this.state.title,
        description: this.state.description,
        dueDate: this.state.dueDate,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
      })
      .then(() => {
        Alert.alert("Sucesso!", "Tarefa salva com sucesso!");
        this.props.navigation.goBack();
      })
      .catch((error) => Alert.alert("Erro", error.message));
  };

  render() {
    return (
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Título da Tarefa"
          value={this.state.title}
          onChangeText={(text) => this.setState({ title: text })}
        />

        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Descrição"
          multiline
          value={this.state.description}
          onChangeText={(text) => this.setState({ description: text })}
        />

        <TextInput
          style={styles.input}
          placeholder="Data Limite (DD/MM/AAAA)"
          value={this.state.dueDate}
          onChangeText={(text) => this.setState({ dueDate: text })}
        />

        <TouchableHighlight style={styles.saveButton} onPress={this.handleSave}>
          <Text style={styles.buttonText}>
            {this.state.id ? "Atualizar" : "Salvar"}
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
  },
  saveButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    textAlign: "center",
  },
});

export default TaskDetailScreen;
