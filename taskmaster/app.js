import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

// Import das telas (você criará essas pastas/components depois)
import HomeScreen from "./components/HomeScreen";
import TaskDetailScreen from "./components/TaskDetailScreen";
import ProfileScreen from "./components/ProfileScreen";
import RewardsShopScreen from "./components/RewardsShopScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <SafeAreaView style={styles.container}>
        <Stack.Navigator initialRouteName="Home">
          {/* Telas do app */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "TaskMaster" }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={{ title: "Detalhes da Tarefa" }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{ title: "Meu Perfil" }}
          />
          <Stack.Screen
            name="RewardsShop"
            component={RewardsShopScreen}
            options={{ title: "Loja de Recompensas" }}
          />
        </Stack.Navigator>
      </SafeAreaView>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Cor de fundo neutra
  },
});
