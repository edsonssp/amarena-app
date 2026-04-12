import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useCart } from '../contexts/CartContext';

const PIX_KEY = '45057040000108';
const PIX_KEY_FORMATTED = '45.057.040/0001-08';
const PIX_NOME = 'AMARENA SORVETES';

export default function PagamentoPixScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { clearCart } = useCart();
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedValue, setCopiedValue] = useState(false);

  const { total, orderId } = params;
  const totalValue = Number(total).toFixed(2);

  const copyPixKey = async () => {
    await Clipboard.setStringAsync(PIX_KEY);
    setCopiedKey(true);
    Alert.alert('Copiado!', 'Chave PIX copiada. Cole no app do seu banco.');
    setTimeout(() => setCopiedKey(false), 3000);
  };

  const copyValue = async () => {
    await Clipboard.setStringAsync(totalValue);
    setCopiedValue(true);
    Alert.alert('Copiado!', 'Valor copiado. Cole no campo de valor.');
    setTimeout(() => setCopiedValue(false), 3000);
  };

  const handleConfirm = () => {
    clearCart();
    Alert.alert(
      'Pedido Confirmado! 🎉',
      'Após o pagamento, seu pedido será preparado e enviado!',
      [{ text: 'OK', onPress: () => router.push('/') }]
    );
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

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Valor */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Valor a Pagar</Text>
          <Text style={styles.totalValue}>R$ {totalValue}</Text>
          <TouchableOpacity
            style={[styles.copyValueBtn, copiedValue && styles.copyValueBtnCopied]}
            onPress={copyValue}
          >
            <MaterialCommunityIcons
              name={copiedValue ? 'check' : 'content-copy'}
              size={16}
              color="#FFFFFF"
            />
            <Text style={styles.copyValueText}>
              {copiedValue ? 'Valor Copiado!' : 'Copiar Valor'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dados do PIX */}
        <View style={styles.pixCard}>
          <View style={styles.pixIconRow}>
            <MaterialCommunityIcons name="qrcode" size={40} color="#4CAF50" />
            <Text style={styles.pixTitle}>PIX - Chave CNPJ</Text>
          </View>

          <View style={styles.pixInfoBox}>
            <Text style={styles.pixLabel}>Chave PIX (CNPJ):</Text>
            <Text style={styles.pixKey}>{PIX_KEY_FORMATTED}</Text>
          </View>

          <View style={styles.pixInfoBox}>
            <Text style={styles.pixLabel}>Favorecido:</Text>
            <Text style={styles.pixNome}>{PIX_NOME}</Text>
          </View>

          <View style={styles.pixInfoBox}>
            <Text style={styles.pixLabel}>Valor:</Text>
            <Text style={styles.pixValor}>R$ {totalValue}</Text>
          </View>

          <TouchableOpacity
            style={[styles.copyButton, copiedKey && styles.copyButtonCopied]}
            onPress={copyPixKey}
          >
            <MaterialCommunityIcons
              name={copiedKey ? 'check-circle' : 'content-copy'}
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.copyButtonText}>
              {copiedKey ? 'Chave PIX Copiada!' : 'Copiar Chave PIX'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instruções */}
        <View style={styles.instructionCard}>
          <Text style={styles.instructionTitle}>Como pagar:</Text>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>1</Text></View>
            <Text style={styles.stepText}>Abra o app do seu banco</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>2</Text></View>
            <Text style={styles.stepText}>Escolha pagar com PIX</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>3</Text></View>
            <Text style={styles.stepText}>Cole a chave CNPJ copiada</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>4</Text></View>
            <Text style={styles.stepText}>Digite o valor: R$ {totalValue}</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>5</Text></View>
            <Text style={styles.stepText}>Confira se aparece AMARENA SORVETES</Text>
          </View>
          <View style={styles.step}>
            <View style={styles.stepNumber}><Text style={styles.stepNumberText}>6</Text></View>
            <Text style={styles.stepText}>Confirme o pagamento</Text>
          </View>
        </View>

        {/* Aviso */}
        <View style={styles.warningCard}>
          <MaterialCommunityIcons name="information" size={20} color="#FF9800" />
          <Text style={styles.warningText}>
            Confira sempre se o nome do favorecido é AMARENA SORVETES antes de confirmar o pagamento.
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
          <MaterialCommunityIcons name="check-circle" size={22} color="#FFFFFF" />
          <Text style={styles.confirmButtonText}>Já Fiz o Pagamento</Text>
        </TouchableOpacity>
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
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  totalCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
  },
  totalValue: {
    color: '#FFFFFF',
    fontSize: 40,
    fontWeight: 'bold',
    marginTop: 4,
  },
  copyValueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 10,
  },
  copyValueBtnCopied: {
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  copyValueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  pixCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
  },
  pixIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  pixTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 12,
  },
  pixInfoBox: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  pixLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  pixKey: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    letterSpacing: 1,
  },
  pixNome: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  pixValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53935',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1976D2',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 6,
  },
  copyButtonCopied: {
    backgroundColor: '#4CAF50',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  instructionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 14,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    fontSize: 14,
    color: '#555',
    flex: 1,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 13,
    color: '#E65100',
    marginLeft: 10,
    flex: 1,
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    paddingBottom: 28,
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
