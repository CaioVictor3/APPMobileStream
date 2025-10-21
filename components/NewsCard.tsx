import { NewsItem } from '@/services/newsService';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NewsCardProps {
  newsItem: NewsItem;
  onPress?: () => void;
  index?: number;
}

export default function NewsCard({ newsItem, onPress, index = 0 }: NewsCardProps) {
  const handlePress = async () => {
    if (onPress) {
      onPress();
    }
    
    // Abrir link da notícia
    try {
      await Linking.openURL(newsItem.link);
    } catch (error) {
      console.error('Erro ao abrir link:', error);
    }
  };

  // Determina a cor do badge baseado no índice
  const getBadgeColor = (index: number) => {
    const colors = ['#0097A7', '#0097A7', '#ec4899', '#f59e0b', '#10b981'];
    return colors[index % colors.length];
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={2}>
            {newsItem.title}
          </Text>
        </View>
        
        <Text style={styles.description} numberOfLines={3}>
          {newsItem.description}
        </Text>
        

        <View style={styles.footer}>

          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>Ler mais</Text>
            <Ionicons name="arrow-forward-circle" size={20} color="#0097A7" />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
    overflow: 'hidden',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 1,
  },
  badgeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    padding: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    lineHeight: 22,
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  linkText: {
    fontSize: 13,
    color: '#0097A7',
    fontWeight: '600',
  },
});
