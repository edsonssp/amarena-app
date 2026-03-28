import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const menuButtons = [
    {
      title: 'Sorvetes',
      icon: 'ice-cream',
      route: '/sorvetes',
      color: '#E53935',
    },
    {
      title: 'Açaí',
      icon: 'bowl-mix',
      route: '/acai',
      color: '#4CAF50',
    },
    {
      title: 'Picolés',
      icon: 'popsicle',
      route: '/picoles',
      color: '#E53935',
    },
    {
      title: 'Promoções',
      icon: 'bullhorn',
      route: '/promocoes',
      color: '#E53935',
    },
    {
      title: 'Temporada',
      icon: 'gift',
      route: '/temporada',
      color: '#4CAF50',
    },
    {
      title: 'WhatsApp',
      icon: 'whatsapp',
      route: '/whatsapp',
      color: '#4CAF50',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header com logo */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="ice-cream" size={40} color="#E53935" />
          </View>
          <View style={styles.logoTextContainer}>
            <Text style={styles.logoTitle}>Amarena</Text>
            <Text style={styles.logoSubtitle}>SORVETES</Text>
            <Text style={styles.logoLocation}>Passos - MG</Text>
          </View>
        </View>
      </View>

      {/* Menu de navegação */}
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={styles.menuGrid}>
          {menuButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuButton,
                { backgroundColor: button.color }
              ]}
              onPress={() => router.push(button.route)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons
                name={button.icon}
                size={32}
                color="#FFFFFF"
                style={styles.menuIcon}
              />
              <Text style={styles.menuButtonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Informações da loja */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Ionicons name="location" size={20} color="#E53935" />
            <Text style={styles.infoText}>
              Rua Dois de Novembro{'\n'}Centro - Passos, MG
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.infoCard}
            onPress={() => router.push('/whatsapp')}
          >
            <MaterialCommunityIcons name="whatsapp" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>
              Fale conosco no WhatsApp
            </Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: '#E53935',
    paddingVertical: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  logoTextContainer: {
    flex: 1,
  },
  logoTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    letterSpacing: 2,
  },
  logoLocation: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuButton: {
    width: (width - 56) / 2,
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    marginBottom: 8,
  },
  menuButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  infoSection: {
    marginTop: 8,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
});
