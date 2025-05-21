import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableHighlight,
  Alert,
  ScrollView,
  ActivityIndicator,
  Vibration,
  Image,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import firebase from '../config/config';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Paleta de cores moderna
const colors = {
  primary: '#6C63FF',
  secondary: '#FF6584',
  background: '#F8F9FA',
  text: '#2D3436',
  success: '#00B894',
  warning: '#FDCB6E',
  white: '#FFFFFF',
  gray: '#A4A4A4',
  lightGray: '#E0E0E0',
};

class HomeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tasks: [],
      loading: true,
      totalPoints: 0,
      scaleAnim: new Animated.Value(1),
      bounceValue: new Animated.Value(1),
    };
  }

  componentDidMount() {
    this.loadTasks();
    this.props.navigation.setOptions({
      headerRight: () => (
        <TouchableHighlight
          onPress={() => {
            Vibration.vibrate(50);
            this.props.navigation.navigate('Profile');
          }}
          underlayColor="transparent"
          style={styles.profileButton}>
          <Icon name="account-circle" size={32} color={colors.white} />
        </TouchableHighlight>
      ),
    });
  }

  loadTasks = () => {
    const userId = firebase.auth().currentUser?.uid;
    if (!userId) return;

    this.tasksRef = firebase.database().ref(`/tasks/${userId}`);
    this.tasksRef.on('value', (snapshot) => {
      const tasks = [];
      let total = 0;

      snapshot.forEach((childSnapshot) => {
        const task = {
          id: childSnapshot.key,
          ...childSnapshot.val(),
        };
        tasks.push(task);

        if (task.completed) {
          total += task.points || 0;
        }
      });

      // Ordena tarefas: não completadas primeiro
      tasks.sort((a, b) =>
        a.completed === b.completed ? 0 : a.completed ? 1 : -1
      );

      this.setState(
        {
          tasks,
          totalPoints: total,
          loading: false,
        },
        this.animatePoints
      );
    });
  };

  animatePoints = () => {
    Animated.spring(this.state.bounceValue, {
      toValue: 1.2,
      friction: 4,
      tension: 40,
      useNativeDriver: true,
    }).start(() => {
      Animated.spring(this.state.bounceValue, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
    });
  };

  componentWillUnmount() {
    if (this.tasksRef) {
      this.tasksRef.off();
    }
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

  toggleComplete = (taskId, currentStatus) => {
    Vibration.vibrate(50);
    this.animateButton();

    const userId = firebase.auth().currentUser?.uid;
    firebase
      .database()
      .ref(`/tasks/${userId}/${taskId}`)
      .update({
        completed: !currentStatus,
        completedAt: !currentStatus
          ? firebase.database.ServerValue.TIMESTAMP
          : null,
      })
      .catch((error) => Alert.alert('Erro', error.message));
  };

  deleteTask = (taskId) => {
    Vibration.vibrate(100);

    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir esta tarefa?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => Vibration.vibrate(10),
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            Vibration.vibrate(50);
            const userId = firebase.auth().currentUser?.uid;
            firebase
              .database()
              .ref(`/tasks/${userId}/${taskId}`)
              .remove()
              .catch((error) => Alert.alert('Erro', error.message));
          },
        },
      ]
    );
  };

  renderTaskItem = ({ item }) => (
    <Animated.View
      style={[
        styles.itemContainer,
        { transform: [{ scale: this.state.scaleAnim }] },
      ]}>
      <TouchableHighlight
        style={[styles.item, item.completed && styles.completedItem]}
        underlayColor={colors.lightGray}
        onPress={() => {
          Vibration.vibrate(10);
          this.props.navigation.navigate('TaskDetail', {
            task: item,
            onGoBack: () => this.loadTasks(),
          });
        }}>
        <View style={styles.itemContent}>
          <TouchableHighlight
            onPress={() => this.toggleComplete(item.id, item.completed)}
            style={styles.checkButton}
            underlayColor={colors.lightGray}>
            <View style={styles.checkContainer}>
              {item.completed ? (
                <Icon name="check-circle" size={28} color={colors.success} />
              ) : (
                <View style={styles.uncheckedCircle} />
              )}
            </View>
          </TouchableHighlight>

          <View style={styles.taskInfo}>
            <Text
              numberOfLines={2}
              style={[styles.title, item.completed && styles.completedText]}>
              {item.title}
            </Text>

            {item.description ? (
              <Text
                numberOfLines={1}
                style={[
                  styles.description,
                  item.completed && styles.completedText,
                ]}>
                {item.description}
              </Text>
            ) : null}

            <View style={styles.taskFooter}>
              <View style={styles.pointsContainer}>
                <Image
                  source={require('../assets/coin.png')}
                  style={styles.coinIcon}
                />
                <Text style={styles.pointsText}>{item.points}</Text>
              </View>

              {item.completed && (
                <Text style={styles.completedDate}>
                  {new Date(item.completedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>

          <TouchableHighlight
            style={styles.deleteButton}
            onPress={() => this.deleteTask(item.id)}
            underlayColor={colors.lightGray}>
            <Icon name="trash-can-outline" size={24} color={colors.secondary} />
          </TouchableHighlight>
        </View>
      </TouchableHighlight>
    </Animated.View>
  );

  render() {
    if (this.state.loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Carregando tarefas...</Text>
        </View>
      );
    }

    return (
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greetingText}>Olá,</Text>
              <Text style={styles.headerTitle}>Suas Tarefas</Text>
            </View>

            <Animated.View
              style={[
                styles.totalPointsContainer,
                { transform: [{ scale: this.state.bounceValue }] },
              ]}>
              <Image
                source={require('../assets/coin.png')}
                style={styles.coinIconLarge}
              />
              <Text style={styles.totalPointsText}>
                {this.state.totalPoints}
              </Text>
            </Animated.View>
          </View>

          {/* Lista */}
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}>
            <FlatList
              data={this.state.tasks}
              renderItem={this.renderTaskItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon
                    name="clipboard-list-outline" // você pode trocar por outro se quiser
                    size={72}
                    color={colors.gray}
                    style={{ marginBottom: 16 }}
                  />
                  <Text style={styles.emptyTitle}>Nada por aqui</Text>
                  <Text style={styles.emptyText}>
                    Adicione sua primeira tarefa!
                  </Text>
                </View>
              }
            />
          </ScrollView>

          {/* Botão de Nova Tarefa */}
          <TouchableHighlight
            style={styles.addButton}
            onPress={() => {
              Vibration.vibrate(50);
              this.props.navigation.navigate('TaskDetail', {
                onGoBack: () => this.loadTasks(),
              });
            }}
            underlayColor={colors.primary}>
            <View style={styles.addButtonContent}>
              <Icon name="plus" size={24} color={colors.white} />
              <Text style={styles.addText}>Nova Tarefa</Text>
            </View>
          </TouchableHighlight>
        </View>
      </TouchableWithoutFeedback>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: 24,
    paddingTop: 50,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    elevation: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    color: colors.white + 'CC',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
    marginTop: 4,
  },
  profileButton: {
    marginRight: 16,
    padding: 4,
    borderRadius: 20,
  },
  totalPointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white + '30',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  totalPointsText: {
    color: colors.white,
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  coinIcon: {
    width: 20,
    height: 20,
    marginRight: 6,
  },
  coinIconLarge: {
    width: 28,
    height: 28,
  },
  itemContainer: {
    marginBottom: 12,
  },
  item: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  completedItem: {
    opacity: 0.8,
    backgroundColor: colors.white + 'CC',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkButton: {
    borderRadius: 20,
    padding: 4,
  },
  checkContainer: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  uncheckedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gray,
  },
  taskInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  title: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 8,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '700',
  },
  completedDate: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  addButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: colors.primary,
    borderRadius: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 16,
    marginHorizontal: 16,
    elevation: 2,
  },
  emptyImage: {
    width: 150,
    height: 150,
    opacity: 0.7,
    marginBottom: 16,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyText: {
    color: colors.gray,
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    color: colors.text,
    fontSize: 16,
  },
});

export default HomeScreen;
