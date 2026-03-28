import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function TemporadaScreen() {
  const router = useRouter();
  const [seasons, setSeasons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSeasons();
  }, []);

  const fetchSeasons = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/seasons`);
      setSeasons(response.data);
    } catch (error) {
      console.error('Erro ao buscar temporadas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeasonIcon = (name) => {
    const icons = {
      natal: 'pine-tree',
      pascoa: 'egg-easter',
      verao: 'white-balance-sunny',
      inverno: 'snowflake',
      junina: 'campfire',
      carnaval: 'party-popper',
    };
    return icons[name.toLowerCase()] || 'star';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Temporadas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.loadingText}>Carregando temporadas...</Text>
          </View>
        ) : seasons.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-star" size={80} color="#CCCCCC" />
            <Text style={styles.emptyText}>
              Nenhuma temporada ativa no momento.{'\n'}
              Fique de olho nas datas comemorativas!
            </Text>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin')}
            >
              <Text style={styles.adminButtonText}>Painel Admin</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.seasonsContainer}>
            {seasons.map((season) => (
              <TouchableOpacity
                key={season.id}
                style={styles.seasonCard}
                onPress={() => {
                  // Navegar para produtos da temporada
                  alert(`Visualizando produtos de ${season.title}`);
                }}
              >
                {season.bannerImage ? (
                  <Image
                    source={{ uri: season.bannerImage }}
                    style={styles.seasonBanner}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.seasonBannerPlaceholder}>
                    <MaterialCommunityIcons
                      name={getSeasonIcon(season.name)}
                      size={60}
                      color="#FFFFFF"
                    />
                  </View>
                )}
                <View style={styles.seasonOverlay}>
                  <View style={styles.seasonIconBadge}>
                    <MaterialCommunityIcons
                      name={getSeasonIcon(season.name)}
                      size={24}
                      color="#FFFFFF"
                    />
                  </View>
                  <Text style={styles.seasonTitle}>{season.title}</Text>
                  <Text style={styles.seasonDescription} numberOfLines={2}>
                    {season.description}
                  </Text>
                  <View style={styles.seasonFooter}>
                    <View style={styles.dateContainer}>
                      <Ionicons name="calendar" size={14} color="#FFFFFF" />
                      <Text style={styles.dateText}>
                        {new Date(season.startDate).toLocaleDateString()} -{' '}
                        {new Date(season.endDate).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.seeMoreButton}>
                      <Text style={styles.seeMoreText}>Ver Produtos</Text>
                      <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    marginTop: 24,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  adminButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  adminButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  seasonsContainer: {
    padding: 16,
  },
  seasonCard: {
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    height: 250,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  seasonBanner: {
    width: '100%',
    height: '100%',
  },
  seasonBannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FF6F00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seasonOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 16,
  },
  seasonIconBadge: {
    position: 'absolute',
    top: -20,
    right: 16,
    backgroundColor: '#4CAF50',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  seasonTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  seasonDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 12,
  },
  seasonFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  seeMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  seeMoreText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
});
