import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface ApiConfigErrorProps {
  errorMessage: string;
  onRetry?: () => void | Promise<void>;
}

/**
 * Componente que exibe um erro visual bonito quando a configuração da API está incorreta
 */
export default function ApiConfigError({ errorMessage, onRetry }: ApiConfigErrorProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry) return;
    
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="warning" size={70} color="#ef4444" />
        </View>
        
        <ThemedText style={styles.title}>
          ⚠️ Erro de Configuração
        </ThemedText>
        
        <ThemedText style={styles.message}>
          {errorMessage}
        </ThemedText>
        
        <View style={styles.instructionsContainer}>
          <ThemedText style={styles.instructionsTitle}>
            Como corrigir:
          </ThemedText>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>1</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Abra o arquivo <ThemedText style={styles.code}>constants/radioConfig.ts</ThemedText>
            </ThemedText>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>2</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Verifique se a <ThemedText style={styles.code}>API_KEY</ThemedText> está configurada corretamente
            </ThemedText>
          </View>
          
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>3</ThemedText>
            </View>
            <ThemedText style={styles.stepText}>
              Salve o arquivo e recarregue o aplicativo
            </ThemedText>
          </View>
        </View>
        
        <View style={styles.warningBox}>
          <Ionicons name="information-circle" size={18} color="#0097A7" style={styles.warningIcon} />
          <ThemedText style={styles.warningText}>
            Sem uma API Key válida, o aplicativo não conseguirá carregar os dados da API.
          </ThemedText>
        </View>

        {/* Botão de Retry */}
        {onRetry && (
          <TouchableOpacity
            style={[styles.retryButton, isRetrying && styles.retryButtonDisabled]}
            onPress={handleRetry}
            disabled={isRetrying}
            activeOpacity={0.8}
          >
            {isRetrying ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <ThemedText style={styles.retryButtonText}>
                  Verificando...
                </ThemedText>
              </>
            ) : (
              <>
                <Ionicons name="refresh" size={18} color="white" />
                <ThemedText style={styles.retryButtonText}>
                  Tentar Novamente
                </ThemedText>
              </>
            )}
          </TouchableOpacity>
        )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: Platform.OS === 'ios' ? 60 : 40,
  },
  content: {
    paddingHorizontal: 20,
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  message: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
    paddingHorizontal: 8,
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  instructionsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0097A7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    paddingTop: 2,
    flexWrap: 'wrap',
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    fontSize: 12,
    color: '#0097A7',
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#e0f2fe',
    padding: 14,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0097A7',
    gap: 10,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  warningIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#0c4a6e',
    lineHeight: 19,
    flexWrap: 'wrap',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0097A7',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    marginBottom: 10,
  },
  retryButtonDisabled: {
    backgroundColor: '#9ca3af',
    opacity: 0.7,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
});

