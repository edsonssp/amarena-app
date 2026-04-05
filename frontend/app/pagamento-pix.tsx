import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import axios from 'axios';
import { useCart } from '../contexts/CartContext';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function PagamentoPixScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clearCart } = useCart();
  const [copied, setCopied] = useState(false);
  const [checking, setChecking] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');

  const { qrCode, qrCodeBase64, ticketUrl, paymentId, total, orderId } = params;

  useEffect(() => {
    // Verificar status do pagamento a cada 5 segundos
    const interval = setInterval(async () => {
      if (paymentStatus === 'approved') return;
      try {
        setChecking(true);
        const response = await axios.get(`${API_URL}/api/payment/status/${paymentId}`);
        if (response.data.status === 'approved') {
          setPaymentStatus('approved');
          clearCart();
          Alert.alert(
            'Pagamento Confirmado! 🎉',
            'Seu pagamento PIX foi aprovado! Seu pedido está sendo preparado.',
            [{ text: 'OK', onPress: () => router.push('/') }]
          );
        }
        setChecking(false);
      } catch (error) {
        setChecking(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [paymentStatus]);

  const copyPixCode = async () => {
    if (qrCode) {
      await Clipboard.setStringAsync(String(qrCode));
      setCopied(true);
      Alert.alert('Copiado!', 'Código PIX copiado. Cole no app do seu banco.');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pagamento PIX</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        {/* Valor */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Valor do Pedido</Text>
          <Text style={styles.totalValue}>R$ {Number(total).toFixed(2)}</Text>
        </View>

        {/* QR Code */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>Escaneie o QR Code</Text>
          <View style={styles.qrContainer}>
            {qrCodeBase64 ? (
              <Image
                source={{ uri: `data:image/png;base64,${qrCodeBase64}` }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.qrPlaceholder}>
                <MaterialCommunityIcons name="qrcode" size={120} color="#333" />
              </View>
            )}
          </View>
        </View>

        {/* Código Copia e Cola */}
        <View style={styles.copySection}>
          <Text style={styles.copyTitle}>Ou copie o código PIX</Text>
          <TouchableOpacity
            style={[styles.copyButton, copied && styles.copyButtonCopied]}
            onPress={copyPixCode}
          >
            <MaterialCommunityIcons
              name={copied ? 'check-circle' : 'content-copy'}
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.copyButtonText}>
              {copied ? 'Código Copiado!' : 'Copiar Código PIX'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          {checking && (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#FF9800" />
              <Text style={styles.statusText}>Verificando pagamento...</Text>
            </View>
          )}
          {paymentStatus === 'pending' && !checking && (
            <View style={styles.statusRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#FF9800" />
              <Text style={styles.statusText}>Aguardando pagamento...</Text>
            </View>
          )}
          {paymentStatus === 'approved' && (
            <View style={styles.statusRow}>
              <MaterialCommunityIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={[styles.statusText, { color: '#4CAF50' }]}>Pagamento aprovado!</Text>
            </View>
          )}
        </View>

        {/* Instrução */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Como pagar:</Text>
          <Text style={styles.instructionStep}>1. Abra o app do seu banco</Text>
          <Text style={styles.instructionStep}>2. Escolha pagar com PIX</Text>
          <Text style={styles.instructionStep}>3. Escaneie o QR Code ou cole o código</Text>
          <Text style={styles.instructionStep}>4. Confirme o pagamento</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#E53935',
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
    padding: 16,
  },
  totalCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginTop: 4,
  },
  qrSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  qrPlaceholder: {
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  copySection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  copyTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1976D2',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  copyButtonCopied: {
    backgroundColor: '#4CAF50',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#FF9800',
    fontWeight: '500',
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  instructionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionStep: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
    paddingLeft: 4,
  },
});
