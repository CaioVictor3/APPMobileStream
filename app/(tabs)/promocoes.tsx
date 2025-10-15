import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PromotionItem, promoService } from "@/services/promoService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

export default function PromocoesScreen() {
  const [promotions, setPromotions] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadPromotions = async () => {
    try {
      // Usando stationId padrão 1, você pode ajustar conforme necessário
      const data = await promoService.getPromotions(1);
      
      // Ordena as promoções por data de criação (mais recentes primeiro)
      const sortedData = data.sort((a, b) => {
        if (!a.createdAt && !b.createdAt) return 0;
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      
      setPromotions(sortedData);
      if (sortedData.length === 0) {
        Alert.alert("Aviso", "Nenhuma promoção foi encontrada.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível carregar as promoções.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadPromotions();
  };

  const openExternal = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert("Erro", "Não foi possível abrir o link da promoção.");
      });
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return null;
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <ThemedText style={styles.loadingText}>Carregando promoções...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.headerTitle}>Promoções</ThemedText>

      <FlatList
        data={promotions}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6366f1"]}
            tintColor="#6366f1"
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => openExternal(item.externalUrl)}
          >
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholder}>
                <ThemedText style={styles.placeholderText}>Sem imagem</ThemedText>
              </View>
            )}
            <View style={styles.infoContainer}>
              <ThemedText style={styles.title}>{item.title}</ThemedText>
              <ThemedText style={styles.description}>{item.description}</ThemedText>
              {item.validUntil && (
                <ThemedText style={styles.validUntil}>
                  Válido até: {formatDate(item.validUntil)}
                </ThemedText>
              )}
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>Nenhuma promoção disponível</ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    color: "#1f2937",
    marginBottom: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#64748b",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  image: {
    width: "100%",
    height: 180,
  },
  placeholder: {
    width: "100%",
    height: 180,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#6b7280",
  },
  infoContainer: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#374151",
  },
  validUntil: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
  },
});
