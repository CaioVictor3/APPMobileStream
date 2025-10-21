import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PromotionItem, promocoesRadioService } from "@/services/promocoesRadioService";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function PromocoesScreen() {
  const [ads, setAds] = useState<PromotionItem[]>([]);
  const [filteredAds, setFilteredAds] = useState<PromotionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAd, setSelectedAd] = useState<PromotionItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const loadAds = async () => {
    try {
      setLoading(true);
      const data = await promocoesRadioService.getAllAds();
      
      if (data.length === 0) {
        Alert.alert(
          "Aviso", 
          "Nenhuma promoção ativa foi encontrada."
        );
      }

      setAds(data);
      setFilteredAds(data);
      setTotalPages(promocoesRadioService.getTotalPages(data.length, entriesPerPage));
    } catch (error) {
      console.error("Erro ao carregar promoções:", error);
      Alert.alert("Erro", "Não foi possível carregar as promoções. Verifique sua conexão e tente novamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  useEffect(() => {

    const filtered = promocoesRadioService.filterPromotions(ads, searchTerm);
    setFilteredAds(filtered);
    setCurrentPage(1);
    setTotalPages(promocoesRadioService.getTotalPages(filtered.length, entriesPerPage));
  }, [searchTerm, ads]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAds();
  };

  const showAdModal = (adItem: PromotionItem) => {
    setSelectedAd(adItem);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAd(null);
  };

  const openAdLink = async (url?: string) => {
    if (url) {
      try {
        await Linking.openURL(url);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível abrir o link da publicidade.");
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "Data inválida";
    }
  };

  const getCurrentPageData = () => {
    return promocoesRadioService.paginatePromotions(filteredAds, currentPage, entriesPerPage);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPagination = () => {
    const pages = [];
    
    // Botão anterior (baseado no script JavaScript)
    pages.push(
      <TouchableOpacity
        key="prev"
        style={[styles.paginationButton, currentPage === 1 && styles.paginationButtonDisabled]}
        onPress={() => goToPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ThemedText style={[styles.paginationButtonText, currentPage === 1 && styles.paginationButtonTextDisabled]}>
          «
        </ThemedText>
      </TouchableOpacity>
    );

    // Páginas numeradas (baseado no script JavaScript)
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          style={[styles.paginationButton, i === currentPage && styles.paginationButtonActive]}
          onPress={() => goToPage(i)}
        >
          <ThemedText style={[styles.paginationButtonText, i === currentPage && styles.paginationButtonTextActive]}>
            {i}
          </ThemedText>
        </TouchableOpacity>
      );
    }

    // Botão próximo (baseado no script JavaScript)
    pages.push(
      <TouchableOpacity
        key="next"
        style={[styles.paginationButton, currentPage === totalPages && styles.paginationButtonDisabled]}
        onPress={() => goToPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ThemedText style={[styles.paginationButtonText, currentPage === totalPages && styles.paginationButtonTextDisabled]}>
          »
        </ThemedText>
      </TouchableOpacity>
    );

    return pages;
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0097A7" />
        <ThemedText style={styles.loadingText}>Carregando promoções...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.headerTitle}>Promoções da Rádio</ThemedText>

      {/* Barra de busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar promoções..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#9ca3af"
        />
      </View>

      {/* Informações de paginação */}
      <View style={styles.paginationInfo}>
        <ThemedText style={styles.paginationInfoText}>
          Página {currentPage} de {totalPages} ({filteredAds.length} promoções)
        </ThemedText>
      </View>

      <FlatList
        data={getCurrentPageData()}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#0097A7"]}
            tintColor="#0097A7"
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.9}
            onPress={() => showAdModal(item)}
          >
            <View style={styles.cardContent}>
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
                
                <View style={styles.metaContainer}>
                  <ThemedText style={[styles.category, item.isActive ? styles.activeStatus : styles.inactiveStatus]}>
                    {item.isActive ? "🟢 Ativa" : "🔴 Inativa"}
                  </ThemedText>
                  {item.isAd && <ThemedText style={styles.adBadge}>📢 Publicidade</ThemedText>}
                </View>
                
                <ThemedText style={styles.publishedAt}>
                  Início: {formatDate(item.startDate)}
                </ThemedText>
                
                <ThemedText style={styles.publishedAt}>
                  Fim: {formatDate(item.endDate)}
                </ThemedText>
                
                <ThemedText style={styles.description} numberOfLines={3}>
                  {item.description}
                </ThemedText>
                
                <View style={styles.viewButton}>
                  <ThemedText style={styles.viewButtonText}>Ver detalhes →</ThemedText>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              {searchTerm ? "Nenhuma promoção encontrada para sua busca." : "Nenhuma promoção ativa disponível"}
            </ThemedText>
          </View>
        }
      />

      {/* Paginação (baseada no script JavaScript) */}
      {totalPages > 1 && (
        <View style={styles.paginationContainer}>
          {renderPagination()}
        </View>
      )}

      {/* Modal de descrição */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <ThemedView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Detalhes da Promoção</ThemedText>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </TouchableOpacity>
          </View>
          
          {selectedAd && (
            <ScrollView style={styles.modalContent}>
              {selectedAd.imageUrl && (
                <Image
                  source={{ uri: selectedAd.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              )}
              
              <ThemedText style={styles.modalNewsTitle}>{selectedAd.title}</ThemedText>
              
              <View style={styles.modalMetaContainer}>
                <ThemedText style={[styles.modalCategory, selectedAd.isActive ? styles.activeStatus : styles.inactiveStatus]}>
                  Status: {selectedAd.isActive ? "Ativa 🟢" : "Inativa 🔴"}
                </ThemedText>
                {selectedAd.isAd && <ThemedText style={styles.adBadge}>📢 Publicidade</ThemedText>}
              </View>
              
              <ThemedText style={styles.modalPublishedAt}>
                Início: {formatDate(selectedAd.startDate)}
              </ThemedText>
              
              <ThemedText style={styles.modalPublishedAt}>
                Término: {formatDate(selectedAd.endDate)}
              </ThemedText>
              
              {selectedAd.dateUndefined && (
                <ThemedText style={styles.modalPublishedAt}>
                  ⏰ Data indefinida
                </ThemedText>
              )}
              
              <ThemedText style={styles.modalDescription}>
                {selectedAd.description}
              </ThemedText>
              
              {selectedAd.isAuto && (
                <View style={styles.autoPromoInfo}>
                  <ThemedText style={styles.autoPromoText}>
                    🎲 Sorteio automático
                  </ThemedText>
                  {selectedAd.lastRaffle && (
                    <ThemedText style={styles.autoPromoText}>
                      Último sorteio: {formatDate(selectedAd.lastRaffle)}
                    </ThemedText>
                  )}
                </View>
              )}
              
              {selectedAd.externalUrl && (
                <TouchableOpacity 
                  style={styles.linkButton}
                  onPress={() => openAdLink(selectedAd.externalUrl)}
                >
                  <ThemedText style={styles.linkButtonText}>
                    Acessar link externo →
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ScrollView>
          )}
        </ThemedView>
      </Modal>
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
    marginBottom: 16,
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
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  paginationInfo: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  paginationInfoText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
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
  cardContent: {
    flexDirection: "row",
  },
  image: {
    width: 120,
    height: 120,
  },
  placeholder: {
    width: 120,
    height: 120,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#6b7280",
    fontSize: 12,
  },
  infoContainer: {
    flex: 1,
    padding: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
    lineHeight: 20,
  },
  metaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  author: {
    fontSize: 12,
    color: "#6b7280",
    flex: 1,
  },
  category: {
    fontSize: 12,
    color: "#3b82f6",
    fontWeight: "600",
  },
  activeStatus: {
    color: "#10b981",
  },
  inactiveStatus: {
    color: "#ef4444",
  },
  adBadge: {
    fontSize: 12,
    color: "#f59e0b",
    fontWeight: "600",
  },
  publishedAt: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
    fontStyle: "italic",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 8,
  },
  viewButton: {
    alignSelf: "flex-end",
  },
  viewButtonText: {
    fontSize: 14,
    color: "#0097A7",
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexWrap: "wrap",
  },
  paginationButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    minWidth: 40,
    alignItems: "center",
  },
  paginationButtonActive: {
    backgroundColor: "#0097A7",
  },
  paginationButtonDisabled: {
    backgroundColor: "#f9fafb",
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  paginationButtonTextActive: {
    color: "white",
  },
  paginationButtonTextDisabled: {
    color: "#d1d5db",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "white",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1f2937",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    color: "#6b7280",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  modalImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginVertical: 16,
  },
  modalNewsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
    lineHeight: 26,
  },
  modalMetaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  modalAuthor: {
    fontSize: 14,
    color: "#6b7280",
    flex: 1,
  },
  modalCategory: {
    fontSize: 14,
    color: "#3b82f6",
    fontWeight: "600",
  },
  modalPublishedAt: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 16,
    fontStyle: "italic",
  },
  modalDescription: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginBottom: 20,
  },
  linkButton: {
    backgroundColor: "#0097A7",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  linkButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  autoPromoInfo: {
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
  },
  autoPromoText: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
});

