import { RADIO_CONFIG } from '@/constants/radioConfig';
import RadioService from '@/services/radioService';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface RadioPlayerProps {
  stationName?: string;
  stationDescription?: string;
  autoPlay?: boolean;
}

export default function RadioPlayer({ 
  stationName = "Radio Central 91.9", 
  stationDescription = RADIO_CONFIG.STATION_DESCRIPTION.replace("Radio Central 91.9 (", "").replace(")", ""),
  autoPlay = false
}: RadioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    // Configurar modo de áudio para reprodução de streaming
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      // Limpar recursos quando o componente for desmontado
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  // Auto-play quando autoPlay prop for true
  useEffect(() => {
    if (autoPlay && !sound && !isLoading) {
      loadStream(true);
    }
  }, [autoPlay]);

  const loadStream = async (shouldPlay = false) => {
    try {
      setIsLoading(true);
      setError(null);

      // Buscar URL do stream
      const url = await RadioService.getRadioCentralUrl();
      setStreamUrl(url);

      // Carregar o áudio
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay }
      );

      setSound(newSound);

      // Configurar listeners
      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });

      if (shouldPlay) {
        Alert.alert('Sucesso', 'Rádio iniciada automaticamente!');
      } else {
        Alert.alert('Sucesso', 'Stream carregado! Toque no botão play para reproduzir.');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      Alert.alert('Erro', `Não foi possível carregar o stream: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const playPause = async () => {
    if (!sound) {
      await loadStream();
      return;
    }

    try {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reproduzir áudio';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    }
  };

  const stop = async () => {
    if (sound) {
      try {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setStreamUrl(null);
      } catch (err) {
        console.error('Erro ao parar áudio:', err);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.playerContainer}>
        <Text style={styles.title}>{stationName}</Text>
        <Text style={styles.description}>{stationDescription}</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.controlsContainer}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={playPause}
              disabled={isLoading}
            >
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="white"
              />
            </TouchableOpacity>
          )}

          {sound && (
            <TouchableOpacity
              style={[styles.controlButton, styles.stopButton]}
              onPress={stop}
            >
              <Ionicons name="stop" size={24} color="white" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isLoading 
              ? 'Carregando stream...' 
              : isPlaying 
                ? 'Reproduzindo' 
                : streamUrl 
                  ? 'Pausado' 
                  : 'Pronto para carregar'
            }
          </Text>
        </View>

        {!streamUrl && !isLoading && (
          <TouchableOpacity
            style={styles.loadButton}
            onPress={() => loadStream()}
          >
            <Text style={styles.loadButtonText}>Carregar Stream</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  playButton: {
    backgroundColor: '#007AFF',
  },
  stopButton: {
    backgroundColor: '#FF3B30',
  },
  statusContainer: {
    marginBottom: 20,
    minHeight: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadButton: {
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#C62828',
    fontSize: 14,
    textAlign: 'center',
  },
});
