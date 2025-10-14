import RadioPlayer from '@/components/RadioPlayer';
import StreamSelector from '@/components/StreamSelector';
import { ThemedText } from '@/components/themed-text';
import RadioService, { RadioUrl } from '@/services/radioService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

export default function RadioScreen() {
  const [streams, setStreams] = useState<RadioUrl[]>([]);
  const [selectedStream, setSelectedStream] = useState<RadioUrl | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStreams = async () => {
    try {
      console.log('Carregando streams de rádio...');
      const radioStreams = await RadioService.getRadioStreams();
      setStreams(radioStreams);
      
      // Seleciona o primeiro stream por padrão
      if (radioStreams.length > 0 && !selectedStream) {
        setSelectedStream(radioStreams[0]);
      }
      
      console.log(`${radioStreams.length} streams carregados`);
    } catch (error) {
      console.error('Erro ao carregar streams:', error);
      Alert.alert(
        'Erro',
        'Não foi possível carregar as estações de rádio. Verifique sua conexão.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadStreams();
  };

  const handleStreamSelect = (stream: RadioUrl) => {
    setSelectedStream(stream);
    console.log(`Stream selecionado: ${stream.description}`);
  };

  useEffect(() => {
    loadStreams();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
        <ThemedText style={styles.loadingText}>Carregando estações...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh}
          colors={['#6366f1']}
          tintColor="#6366f1"
        />
      }
    >
      {/* Header com gradiente */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Ionicons name="radio" size={32} color="white" />
            <View>
              <ThemedText style={styles.headerTitle}>Rádio Online</ThemedText>
              <ThemedText style={styles.headerSubtitle}>
                Escolha sua estação favorita
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Seletor de Streams */}
      {streams.length > 0 ? (
        <View style={styles.content}>
          <StreamSelector
            streams={streams}
            selectedStream={selectedStream}
            onStreamSelect={handleStreamSelect}
          />
          
          {/* Player de Rádio */}
          {selectedStream && (
            <View style={styles.playerSection}>
              <View style={styles.playerHeader}>
                <Ionicons name="play-circle" size={24} color="#6366f1" />
                <ThemedText style={styles.playerTitle}>Player de Rádio</ThemedText>
              </View>
              <RadioPlayer 
                autoPlay={false} 
                streamUrl={selectedStream.url}
                stationName={selectedStream.description}
              />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="radio-outline" size={80} color="#d1d5db" />
          </View>
          <ThemedText style={styles.emptyText}>
            Nenhuma estação encontrada
          </ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Puxe para baixo para atualizar
          </ThemedText>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Ionicons name="refresh" size={20} color="white" />
            <ThemedText style={styles.refreshButtonText}>Atualizar</ThemedText>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  header: {
    backgroundColor: '#6366f1',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  playerSection: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  playerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
