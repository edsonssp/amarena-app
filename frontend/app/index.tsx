import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

const logoAmarena = require('../assets/images/logo-amarena.jpeg');

export default function HomeScreen() {
  const router = useRouter();
  const { getTotalItems } = useCart();
  const totalItems = getTotalItems();

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
      icon: 'ice-pop',
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
      {/* Header com logo à esquerda e carrinho à direita */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          {/* Logo circular à esquerda */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={logoAmarena} style={styles.logoImage} resizeMode="cover" />
            </View>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>Amarena</Text>
              <Text style={styles.logoSubtitle}>SORVETES</Text>
              <Text style={styles.logoLocation}>Passos - MG</Text>
            </View>
          </View>

          {/* Carrinho à direita */}
          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => router.push('/carrinho')}
            activeOpacity={0.7}
          >
            <Ionicons name="cart" size={28} color="#FFFFFF" />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
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

          <TouchableOpacity 
            style={styles.infoCard}
            onPress={() => Linking.openURL('https://www.instagram.com/amarena.passos')}
          >
            <Ionicons name="logo-instagram" size={20} color="#E1306C" />
            <Text style={styles.infoText}>
              @amarena.passos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Link secreto admin - toque longo */}
        <TouchableOpacity
          onLongPress={() => router.push('/admin')}
          delayLongPress={2000}
          activeOpacity={1}
          style={styles.secretFooter}
        >
          <Text style={styles.secretFooterText}>© 2025 Amarena Sorvetes - Passos/MG</Text>
        </TouchableOpacity>
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
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoCircle: {
    width: 95,
    height: 95,
    borderRadius: 48,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  logoImage: {
    width: 89,
    height: 89,
    borderRadius: 45,
  },
  logoTextContainer: {
    flex: 1,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
    letterSpacing: 2,
  },
  logoLocation: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  cartButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#E53935',
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
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
    width: '47%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
  secretFooter: {
    alignItems: 'center',
    paddingVertical: 20,
    marginTop: 8,
  },
  secretFooterText: {
    fontSize: 11,
    color: '#CCCCCC',
  },
});
