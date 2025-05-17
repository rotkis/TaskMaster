import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { Card, Button, Avatar, ProgressBar } from "react-native-paper";
import { collection, query, where, getDocs } from "firebase/firestore";
import firebase from "../config/config"; // Importe a configuração do Firebase

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState({
    name: "Usuário",
    points: 0,
    level: 1,
    completedTasks: 0,
  });
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  // Busca os dados do usuário e conquistas no Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Simulação: Substitua pelo ID do usuário logado
        const userId = "user123";

        // Busca tarefas concluídas
        const tasksQuery = query(
          collection(firebase, "tasks"),
          where("userId", "==", userId),
          where("completed", "==", true),
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const completedTasks = tasksSnapshot.size;

        // Atualiza o estado
        setUser({
          name: "João Silva",
          points: completedTasks * 10, // 10 pontos por tarefa
          level: Math.floor(completedTasks / 5) + 1, // 5 tarefas = 1 nível
          completedTasks,
        });

        // Busca conquistas (exemplo)
        setAchievements([
          {
            id: "1",
            title: "Iniciante",
            description: "Completou 1 tarefa",
            unlocked: completedTasks >= 1,
          },
          {
            id: "2",
            title: "Produtivo",
            description: "Completou 5 tarefas",
            unlocked: completedTasks >= 5,
          },
          {
            id: "3",
            title: "Mestre",
            description: "Completou 10 tarefas",
            unlocked: completedTasks >= 10,
          },
        ]);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar os dados.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho do Perfil */}
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text
            size={80}
            label={user.name.charAt(0)}
            style={styles.avatar}
          />
          <View style={styles.profileText}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userLevel}>Nível {user.level}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Progresso (Barra de Nível) */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Progresso</Text>
          <View style={styles.progressContainer}>
            <Text style={styles.pointsText}>🪙 {user.points} pontos</Text>
            <ProgressBar
              progress={(user.completedTasks % 5) / 5}
              color="#4CAF50"
              style={styles.progressBar}
            />
            <Text style={styles.tasksText}>
              ✅ {user.completedTasks} tarefas concluídas
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Conquistas */}
      <Card style={styles.achievementsCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Conquistas</Text>
          {achievements.map((achievement) => (
            <View
              key={achievement.id}
              style={[
                styles.achievementItem,
                { opacity: achievement.unlocked ? 1 : 0.5 },
              ]}
            >
              <Text style={styles.achievementTitle}>
                {achievement.unlocked ? "🏆" : "🔒"} {achievement.title}
              </Text>
              <Text style={styles.achievementDesc}>
                {achievement.description}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Botão para a Loja */}
      <Button
        mode="contained"
        onPress={() => navigation.navigate("RewardsShop")}
        style={styles.shopButton}
      >
        Ir para a Loja de Recompensas
      </Button>
    </ScrollView>
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
  profileCard: {
    marginBottom: 16,
  },
  profileContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    backgroundColor: "#6200EE",
    marginRight: 16,
  },
  profileText: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  userLevel: {
    fontSize: 16,
    color: "#757575",
  },
  statsCard: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  progressContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 10,
    borderRadius: 5,
    marginVertical: 8,
  },
  pointsText: {
    fontSize: 16,
    color: "#FFC107",
    fontWeight: "bold",
  },
  tasksText: {
    fontSize: 14,
    color: "#616161",
  },
  achievementsCard: {
    marginBottom: 16,
  },
  achievementItem: {
    marginVertical: 8,
    padding: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  achievementDesc: {
    fontSize: 14,
    color: "#616161",
  },
  shopButton: {
    marginTop: 8,
    marginBottom: 24,
  },
});
