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
  streamUrl?: string;
}

export default function RadioPlayer({ 
  stationName = "Rádio Online", 
  stationDescription = "Transmissão ao vivo",
  autoPlay = false,
  streamUrl
}: RadioPlayerProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStreamUrl, setCurrentStreamUrl] = useState<string | null>(null);
  
  // Ref para controlar se o autoPlay já foi executado
  const hasAutoPlayed = React.useRef(false);

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

  // Auto-play quando autoPlay prop for true (apenas uma vez)
  useEffect(() => {
    if (autoPlay && !hasAutoPlayed.current) {
      hasAutoPlayed.current = true;
      loadStream(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStream = async (shouldPlay = false) => {
    try {
      setIsLoading(true);
      setError(null);


      let url: string;
      if (streamUrl) {
        url = streamUrl;
        setCurrentStreamUrl(streamUrl);
      } else {
        url = await RadioService.getRadioCentralUrl();
        setCurrentStreamUrl(url);
      }


      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay }
      );

      setSound(newSound);


      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setIsPlaying(status.isPlaying);
        }
      });

      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      Alert.alert('Erro', `Não foi possível carregar o stream: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const play = async () => {
    if (!sound) {
      await loadStream(true);
      return;
    }

    try {
      await sound.playAsync();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao reproduzir áudio';
      setError(errorMessage);
      Alert.alert('Erro', errorMessage);
    }
  };

  const stop = async () => {
    if (sound) {
      try {
        await sound.unloadAsync();
        setSound(null);
        setIsPlaying(false);
        setCurrentStreamUrl(null);
      } catch (err) {
        console.error('Erro ao descarregar o áudio:', err);
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
            <ActivityIndicator size="large" color="#0097A7" />
          ) : (
            <>
              {/* Botão Play */}
              <TouchableOpacity
                style={[
                  styles.controlButton, 
                  styles.playButton,
                  isPlaying && styles.disabledButton
                ]}
                onPress={play}
                disabled={isLoading || isPlaying}
              >
                <Ionicons
                  name="play"
                  size={32}
                  color="white"
                />
              </TouchableOpacity>

              {/* Botão Stop */}
              <TouchableOpacity
                style={[
                  styles.controlButton, 
                  styles.stopButton,
                  !sound && styles.disabledButton
                ]}
                onPress={stop}
                disabled={!sound}
              >
                <Ionicons 
                  name="stop" 
                  size={28} 
                  color="white" 
                />
              </TouchableOpacity>
            </>
          )}
        </View>

        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            {isLoading 
              ? 'Carregando stream...' 
              : isPlaying 
                ? 'Reproduzindo ao vivo' 
                : 'Pronto para reproduzir'
            }
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  playerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 24,
    textAlign: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 20,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButton: {
    backgroundColor: '#10b981',
  },
  stopButton: {
    backgroundColor: '#ef4444',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
    opacity: 0.5,
  },
  statusContainer: {
    marginBottom: 20,
    minHeight: 24,
  },
  statusText: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
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
