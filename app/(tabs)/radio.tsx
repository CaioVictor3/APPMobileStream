import ApiConfigError from '@/components/ApiConfigError';
import RadioPlayer from '@/components/RadioPlayer';
import StreamSelector from '@/components/StreamSelector';
import { ThemedText } from '@/components/themed-text';
import { validateApiConfig } from '@/constants/radioConfig';
import RadioService, { RadioUrl } from '@/services/radioService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
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
  const [configError, setConfigError] = useState<string | null>(null);
  
  // Ref para controlar se é a primeira carga
  const isFirstLoad = React.useRef(true);

  const handleStreamSelect = (stream: RadioUrl) => {
    setSelectedStream(stream);
  };

  const loadStreams = async () => {
    try {
      const radioStreams = await RadioService.getRadioStreams();
      setStreams(radioStreams);
      
      // Seleciona a primeira estação apenas na primeira carga
      if (radioStreams.length > 0 && isFirstLoad.current) {
        setSelectedStream(radioStreams[0]);
        isFirstLoad.current = false;
      }
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

  // Valida configuração e carrega streams ao montar o componente
  useEffect(() => {
    const validation = validateApiConfig();
    if (!validation.isValid) {
      setConfigError(validation.error || 'Erro de configuração');
      setLoading(false);
      return;
    }
    
    // Só carrega streams se a configuração estiver válida
    loadStreams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Exibe erro de configuração se houver
  if (configError) {
    return <ApiConfigError errorMessage={configError} />;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0097A7" />
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
          colors={['#0097A7']}
          tintColor="#0097A7"
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
                <Ionicons name="play-circle" size={24} color="#0097A7" />
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
    backgroundColor: '#0097A7',
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
    lineHeight: 18,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  playerSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  playerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    minHeight: 400,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0097A7',
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
