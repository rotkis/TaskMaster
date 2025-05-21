import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableHighlight,
  Alert,
  Vibration,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import firebase from "../config/config";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Paleta de cores harmonizada
const colors = {
  primary: "#6C63FF",
  secondary: "#FF6584",
  background: "#F8F9FA",
  text: "#2D3436",
  success: "#00B894",
  white: "#FFFFFF",
  border: "#E0E0E0",
};

class TaskDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    const task = props.route.params?.task || {};
    this.state = {
      id: task.id || null,
      title: task.title || "",
      description: task.description || "",
      points: task.points || 100,
      scaleAnim: new Animated.Value(1),
    };
  }

  animateButton = () => {
    Animated.sequence([
      Animated.timing(this.state.scaleAnim, {
        toValue: 0.95,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(this.state.scaleAnim, {
        toValue: 1,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  handleSave = () => {
    Vibration.vibrate(50);
    this.animateButton();

    const userId = firebase.auth().currentUser?.uid;
    if (!userId) {
      Alert.alert("Erro", "Faça login para continuar");
      return;
    }

    if (!this.state.title.trim()) {
      Alert.alert("Atenção", "Dê um título para sua tarefa");
      return;
    }

    if (isNaN(this.state.points) || this.state.points < 0) {
      Alert.alert("Valor inválido", "Os pontos devem ser um número positivo");
      return;
    }

    const taskData = {
      title: this.state.title.trim(),
      description: this.state.description.trim(),
      points: Number(this.state.points),
      createdAt: firebase.database.ServerValue.TIMESTAMP,
    };

    const taskRef = this.state.id
      ? firebase.database().ref(`/tasks/${userId}/${this.state.id}`)
      : firebase.database().ref(`/tasks/${userId}`).push();

    taskRef
      .set(taskData)
      .then(() => {
        Alert.alert("Sucesso!", "Tarefa salva com sucesso!");
        this.props.navigation.goBack();
      })
      .catch((error) => Alert.alert("Erro", error.message));
  };

  render() {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Icon
            name={this.state.id ? "clipboard-edit" : "clipboard-plus"}
            size={72}
            color={colors.primary}
            style={styles.headerIcon}
          />
          <Text style={styles.title}>
            {this.state.id ? "Editar Tarefa" : "Nova Tarefa"}
          </Text>
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Icon
              name="format-title"
              size={24}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Título da Tarefa"
              placeholderTextColor="#888"
              value={this.state.title}
              onChangeText={(text) => this.setState({ title: text })}
              maxLength={50}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon
              name="text-subject"
              size={24}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Descrição (opcional)"
              placeholderTextColor="#888"
              multiline
              numberOfLines={4}
              value={this.state.description}
              onChangeText={(text) => this.setState({ description: text })}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Icon
              name="coin"
              size={24}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Pontos de recompensa"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={String(this.state.points)}
              onChangeText={(text) =>
                this.setState({ points: text.replace(/[^0-9]/g, "") })
              }
            />
          </View>
        </View>

        <Animated.View style={{ transform: [{ scale: this.state.scaleAnim }] }}>
          <TouchableHighlight
            style={styles.saveButton}
            onPress={this.handleSave}
            underlayColor={colors.primary}
          >
            <View style={styles.buttonContent}>
              <Icon
                name={this.state.id ? "content-save-edit" : "content-save"}
                size={24}
                color={colors.white}
              />
              <Text style={styles.buttonText}>
                {this.state.id ? "Atualizar Tarefa" : "Criar Tarefa"}
              </Text>
            </View>
          </TouchableHighlight>
        </Animated.View>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  headerIcon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 20,
    backgroundColor: colors.white,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    paddingVertical: 18,
  },
  multiline: {
    height: 100,
    textAlignVertical: "top",
    paddingTop: 16,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});

export default TaskDetailScreen;
