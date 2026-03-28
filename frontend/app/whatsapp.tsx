import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function WhatsAppScreen() {
  const router = useRouter();
  const phoneNumber = '5535999999999'; // Substitua pelo número real

  const openWhatsApp = () => {
    const message = 'Olá! Gostaria de fazer um pedido na Amarena Sorvetes! 🍦';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(url);
        } else {
          // Fallback para web WhatsApp
          const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
          return Linking.openURL(webUrl);
        }
      })
      .catch((err) => console.error('Erro ao abrir WhatsApp:', err));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>WhatsApp</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons name="ice-cream" size={80} color="#E53935" />
          </View>
        </View>

        <Text style={styles.title}>Precisa de ajuda?</Text>
        <Text style={styles.subtitle}>
          Vamos conversar no WhatsApp!
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            🍦 Tire suas dúvidas{'\n'}
            📦 Acompanhe seu pedido{'\n'}
            🎉 Conheça nossas promoções{'\n'}
            📍 Saiba nossa localização
          </Text>
        </View>

        <TouchableOpacity style={styles.whatsappButton} onPress={openWhatsApp}>
          <MaterialCommunityIcons name="whatsapp" size={24} color="#FFFFFF" />
          <Text style={styles.whatsappButtonText}>Enviar Mensagem</Text>
        </TouchableOpacity>

        <View style={styles.contactInfo}>
          <View style={styles.contactItem}>
            <Ionicons name="location" size={20} color="#E53935" />
            <Text style={styles.contactText}>
              Rua Dois de Novembro{'\n'}Centro - Passos, MG
            </Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="time" size={20} color="#E53935" />
            <Text style={styles.contactText}>
              Seg-Dom: 10h às 22h
            </Text>
          </View>
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
  contentContainer: {
    padding: 24,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  iconCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
  },
  infoText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 28,
  },
  whatsappButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 32,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  whatsappButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  contactInfo: {
    width: '100%',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#333333',
    flex: 1,
  },
});
