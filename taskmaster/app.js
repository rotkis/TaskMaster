import * as React from "react";
import {
  Text,
  View,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { createStackNavigator } from "@react-navigation/stack";
import firebase from "./config/config";
import HomeScreen from "./components/HomeScreen";
import TaskDetailScreen from "./components/TaskDetailScreen";

const NavegacaoPrincipal = createBottomTabNavigator();
const NavegacaoStack = createStackNavigator();

// Cores do tema
const colors = {
  primary: "#2A2D43",
  secondary: "#FF6B6B",
  background: "#F7FFF7",
  text: "#2A2D43",
  white: "#FFFFFF",
};

function MainAppStack() {
  const Stack = createStackNavigator();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
    </Stack.Navigator>
  );
}

export default class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <NavegacaoStack.Navigator>
          <NavegacaoStack.Screen
            name="Auth"
            component={NavTab}
            options={{ headerShown: false }}
          />
          <NavegacaoStack.Screen
            name="MainApp"
            component={MainAppStack}
            options={{ headerShown: false }}
          />
        </NavegacaoStack.Navigator>
      </NavigationContainer>
    );
  }
}

class NavTab extends React.Component {
  render() {
    return (
      <NavegacaoPrincipal.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.secondary,
          tabBarInactiveTintColor: colors.text,
          tabBarStyle: {
            backgroundColor: colors.white,
            borderTopWidth: 0,
            elevation: 8,
            shadowOpacity: 0.1,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <NavegacaoPrincipal.Screen
          name="Login"
          component={Principal}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="login" size={24} color={color} />
            ),
          }}
        />
        <NavegacaoPrincipal.Screen
          name="Cadastro"
          component={Cadastro}
          options={{
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons
                name="account-plus"
                size={24}
                color={color}
              />
            ),
          }}
        />
      </NavegacaoPrincipal.Navigator>
    );
  }
}

class Principal extends React.Component {
  state = {
    usuario: "",
    senha: "",
  };

  ler = () => {
    const { usuario, senha } = this.state;
    if (!usuario || !senha) {
      Alert.alert("Atenção", "Preencha todos os campos");
      return;
    }

    firebase
      .auth()
      .signInWithEmailAndPassword(usuario.toLowerCase(), senha)
      .then(() => {
        this.props.navigation.replace("MainApp");
      })
      .catch((error) => {
        this.handleAuthError(error);
      });
  };

  handleAuthError = (error) => {
    const errorCode = error.code;
    const errors = {
      "auth/invalid-email": "Email inválido",
      "auth/user-not-found": "Usuário não encontrado",
      "auth/wrong-password": "Senha incorreta",
      "auth/too-many-requests": "Muitas tentativas. Tente mais tarde",
    };
    Alert.alert("Erro", errors[errorCode] || "Erro ao fazer login");
  };

  render() {
    return (
      <ScrollView
        contentContainerStyle={estilos.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.header}>
          <MaterialCommunityIcons
            name="shield-account"
            size={80}
            color={colors.primary}
          />
          <Text style={estilos.titulo}>Bem-vindo de volta</Text>
          <Text style={estilos.subtitulo}>Faça login para continuar</Text>
        </View>

        <View style={estilos.formContainer}>
          <TextInput
            style={estilos.input}
            placeholder="Email"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={this.state.usuario}
            onChangeText={(usuario) => this.setState({ usuario })}
          />

          <TextInput
            style={estilos.input}
            placeholder="Senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={this.state.senha}
            onChangeText={(senha) => this.setState({ senha })}
          />

          <TouchableOpacity style={estilos.botaoPrimario} onPress={this.ler}>
            <Text style={estilos.textoBotao}>Entrar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.linkContainer}
            onPress={() => this.props.navigation.navigate("Cadastro")}
          >
            <Text style={estilos.texto}>Não tem conta? </Text>
            <Text style={estilos.linkTexto}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

class Cadastro extends React.Component {
  state = {
    user: "",
    password: "",
    confirmPassword: "",
  };

  gravar = () => {
    const { user, password, confirmPassword } = this.state;

    if (password !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem");
      return;
    }

    firebase
      .auth()
      .createUserWithEmailAndPassword(user.toLowerCase(), password)
      .then(() => {
        Alert.alert("Sucesso", "Conta criada com sucesso!");
        this.props.navigation.navigate("Login");
      })
      .catch((error) => {
        this.handleSignupError(error);
      });
  };

  handleSignupError = (error) => {
    const errorCode = error.code;
    const errors = {
      "auth/email-already-in-use": "Email já cadastrado",
      "auth/weak-password": "Senha deve ter pelo menos 6 caracteres",
      "auth/invalid-email": "Email inválido",
    };
    Alert.alert("Erro", errors[errorCode] || "Erro ao cadastrar");
  };

  render() {
    return (
      <ScrollView
        contentContainerStyle={estilos.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={estilos.header}>
          <MaterialCommunityIcons
            name="account-plus"
            size={80}
            color={colors.primary}
          />
          <Text style={estilos.titulo}>Crie sua conta</Text>
          <Text style={estilos.subtitulo}>Preencha os dados abaixo</Text>
        </View>

        <View style={estilos.formContainer}>
          <TextInput
            style={estilos.input}
            placeholder="Email"
            placeholderTextColor="#888"
            autoCapitalize="none"
            keyboardType="email-address"
            value={this.state.user}
            onChangeText={(user) => this.setState({ user })}
          />

          <TextInput
            style={estilos.input}
            placeholder="Senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={this.state.password}
            onChangeText={(password) => this.setState({ password })}
          />

          <TextInput
            style={estilos.input}
            placeholder="Confirmar Senha"
            placeholderTextColor="#888"
            secureTextEntry
            value={this.state.confirmPassword}
            onChangeText={(confirmPassword) =>
              this.setState({ confirmPassword })
            }
          />

          <TouchableOpacity style={estilos.botaoPrimario} onPress={this.gravar}>
            <Text style={estilos.textoBotao}>Criar Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={estilos.linkContainer}
            onPress={() => this.props.navigation.navigate("Login")}
          >
            <Text style={estilos.texto}>Já tem conta? </Text>
            <Text style={estilos.linkTexto}>Faça login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }
}

const estilos = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    paddingVertical: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 16,
  },
  subtitulo: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  formContainer: {
    marginTop: 20,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  botaoPrimario: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
    }),
  },
  textoBotao: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  texto: {
    color: colors.text,
    fontSize: 15,
  },
  linkTexto: {
    color: colors.secondary,
    fontSize: 15,
    fontWeight: "600",
  },
});
