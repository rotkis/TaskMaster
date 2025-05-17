import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./components/HomeScreen";
import TaskDetailScreen from "./components/TaskDetailScreen";

const Stack = createStackNavigator();

class App extends React.Component {
  render() {
    return (
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home">
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: "Lista de Tarefas",
              headerStyle: {
                backgroundColor: "#4CAF50",
              },
              headerTintColor: "#fff",
            }}
          />
          <Stack.Screen
            name="TaskDetail"
            component={TaskDetailScreen}
            options={({ route }) => ({
              title: route.params?.task ? "Editar Tarefa" : "Nova Tarefa",
              headerStyle: {
                backgroundColor: "#2196F3",
              },
              headerTintColor: "#fff",
            })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
}

export default App;
