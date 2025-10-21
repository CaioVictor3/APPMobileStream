import { RadioUrl } from '@/services/radioService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface StreamSelectorProps {
  streams: RadioUrl[];
  selectedStream: RadioUrl | null;
  onStreamSelect: (stream: RadioUrl) => void;
}

export default function StreamSelector({ streams, selectedStream, onStreamSelect }: StreamSelectorProps) {
  const getStreamIcon = (typeId: number) => {
    switch (typeId) {
      case 1:
        return 'radio';
      case 12:
        return 'musical-notes';
      default:
        return 'radio';
    }
  };

  const getStreamColor = (typeId: number) => {
    switch (typeId) {
      case 1:
        return '#0097A7';
      case 12:
        return '#0097A7';
      default:
        return '#0097A7';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="radio" size={24} color="#0097A7" />
        <Text style={styles.headerTitle}>Escolha uma Estação</Text>
      </View>
      
      <View style={styles.streamsList}>
        {streams.map((stream) => (
          <TouchableOpacity
            key={stream.id}
            style={[
              styles.streamItem,
              selectedStream?.id === stream.id && styles.selectedStream
            ]}
            onPress={() => onStreamSelect(stream)}
            activeOpacity={0.7}
          >
            <View style={styles.streamContent}>
              <View style={[styles.streamIcon, { backgroundColor: getStreamColor(stream.typeId) }]}>
                <Ionicons 
                  name={getStreamIcon(stream.typeId)} 
                  size={24} 
                  color="white" 
                />
              </View>
              
              <View style={styles.streamInfo}>
                <Text style={styles.streamName}>{stream.description}</Text>
                <Text style={styles.streamType}>
                  {stream.typeId === 1 ? 'Rádio AM/FM' : 'Stream Online'}
                </Text>
              </View>
              
              {selectedStream?.id === stream.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
    paddingHorizontal: 2,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1f2937',
  },
  streamsList: {
    gap: 10,
  },
  streamItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedStream: {
    borderColor: '#0097A7',
    elevation: 4,
    shadowOpacity: 0.15,
  },
  streamContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  streamIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  streamInfo: {
    flex: 1,
    marginRight: 8,
  },
  streamName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 3,
    flexShrink: 1,
  },
  streamType: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
  },
  selectedIndicator: {
    marginLeft: 4,
  },
});
