import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image, ScrollView, Alert } from "react-native";
import { Card, Button, Chip } from "react-native-paper";
import { collection, doc, updateDoc, getDoc } from "firebase/firestore";
import firebase from "../config/config";
import * as Haptics from "expo-haptics";

export default function RewardsShopScreen({ navigation }) {
  const [rewards, setRewards] = useState([
    {
      id: "1",
      name: "Tema Escuro",
      description: "Desbloqueie o tema escuro do app",
      price: 100,
      purchased: false,
      type: "theme",
    },
    {
      id: "2",
      name: "Tema Azul",
      description: "Desbloqueie o tema azul do app",
      price: 150,
      purchased: false,
      type: "theme",
    },
    {
      id: "3",
      name: "Ícone Premium",
      description: "Ícone especial no seu perfil",
      price: 200,
      purchased: false,
      type: "badge",
    },
    {
      id: "4",
      name: "Animação Especial",
      description: "Animação ao completar tarefas",
      price: 250,
      purchased: false,
      type: "animation",
    },
  ]);
  const [userPoints, setUserPoints] = useState(0);
  const [loading, setLoading] = useState(true);

  // Busca os pontos do usuário no Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Substitua pelo ID do usuário logado
        const userId = "user123";
        const userRef = doc(firebase, "users", userId);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserPoints(userSnap.data().points || 0);
        }
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar seus pontos.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Compra uma recompensa
  const purchaseReward = async (reward) => {
    if (userPoints < reward.price) {
      Alert.alert(
        "Pontos insuficientes",
        "Você não tem pontos suficientes para esta recompensa.",
      );
      return;
    }

    try {
      // Atualiza os pontos do usuário no Firebase
      const userId = "user123";
      const userRef = doc(firebase, "users", userId);
      await updateDoc(userRef, {
        points: userPoints - reward.price,
      });

      // Atualiza o estado local
      setUserPoints(userPoints - reward.price);

      // Marca a recompensa como comprada
      const updatedRewards = rewards.map((r) =>
        r.id === reward.id ? { ...r, purchased: true } : r,
      );
      setRewards(updatedRewards);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sucesso!", `Você adquiriu: ${reward.name}`);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível completar a compra.");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Cabeçalho com pontos */}
      <Card style={styles.pointsCard}>
        <Card.Content style={styles.pointsContent}>
          <Text style={styles.pointsTitle}>Seus Pontos</Text>
          <View style={styles.pointsContainer}>
            <Image
              source={require("../assets/coin.png")}
              style={styles.coinIcon}
            />
            <Text style={styles.pointsValue}>{userPoints}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Lista de recompensas */}
      <Text style={styles.sectionTitle}>Recompensas Disponíveis</Text>

      {rewards.map((reward) => (
        <Card key={reward.id} style={styles.rewardCard}>
          <Card.Content>
            <View style={styles.rewardHeader}>
              <Text style={styles.rewardName}>{reward.name}</Text>
              <Chip
                icon={reward.purchased ? "check" : "star"}
                mode="outlined"
                style={styles.priceChip}
                textStyle={styles.priceText}
              >
                {reward.purchased ? "Adquirido" : `${reward.price} pts`}
              </Chip>
            </View>

            <Text style={styles.rewardDescription}>{reward.description}</Text>

            {!reward.purchased && (
              <Button
                mode="contained"
                onPress={() => purchaseReward(reward)}
                style={styles.buyButton}
                disabled={userPoints < reward.price}
              >
                Comprar
              </Button>
            )}
          </Card.Content>
        </Card>
      ))}
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
  pointsCard: {
    marginBottom: 24,
    backgroundColor: "#6200EE",
  },
  pointsContent: {
    alignItems: "center",
  },
  pointsTitle: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  pointsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  pointsValue: {
    color: "white",
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#424242",
  },
  rewardCard: {
    marginBottom: 16,
  },
  rewardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  priceChip: {
    backgroundColor: "white",
    borderColor: "#FFC107",
  },
  priceText: {
    color: "#FFC107",
  },
  rewardDescription: {
    color: "#616161",
    marginBottom: 12,
  },
  buyButton: {
    marginTop: 8,
    backgroundColor: "#4CAF50",
  },
});
