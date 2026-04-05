import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

type PaymentMethod = 'pix' | 'cartao' | 'entrega' | null;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [observation, setObservation] = useState('');

  const total = getTotalPrice();

  const buildOrderMessage = () => {
    let message = `🍦 *PEDIDO AMARENA SORVETES*\n\n`;
    if (customerName) message += `👤 *Cliente:* ${customerName}\n`;
    if (customerPhone) message += `📱 *Telefone:* ${customerPhone}\n`;
    message += `\n📋 *Itens do Pedido:*\n`;
    items.forEach((item) => {
      message += `  • ${item.productName} x${item.quantity} — R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      if (item.description) {
        message += `    ${item.description}\n`;
      }
    });
    message += `\n💰 *Total: R$ ${total.toFixed(2)}*\n`;
    if (selectedPayment) {
      const paymentLabels: Record<string, string> = {
        pix: 'PIX',
        cartao: 'Cartão de Crédito/Débito',
        entrega: 'Pagar na Entrega',
      };
      message += `💳 *Pagamento:* ${paymentLabels[selectedPayment]}\n`;
    }
    if (observation) message += `\n📝 *Observação:* ${observation}\n`;
    message += `\n_Pedido enviado pelo App Amarena_ ✅`;
    return message;
  };

  const handleFinalize = () => {
    if (!selectedPayment) {
      Alert.alert('Atenção', 'Selecione uma forma de pagamento!');
      return;
    }
    if (!customerName.trim()) {
      Alert.alert('Atenção', 'Digite seu nome para o pedido!');
      return;
    }

    const message = buildOrderMessage();
    const phoneNumber = '5535997509179';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    Linking.openURL(url)
      .then(() => {
        clearCart();
        Alert.alert(
          'Pedido Enviado! 🎉',
          'Seu pedido foi enviado para o WhatsApp da Amarena. Aguarde a confirmação!',
          [{ text: 'OK', onPress: () => router.push('/') }]
        );
      })
      .catch(() => {
        Alert.alert(
          'Erro',
          'Não foi possível abrir o WhatsApp. Verifique se está instalado.'
        );
      });
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Finalizar Pedido</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="cart-off" size={80} color="#CCCCCC" />
          <Text style={styles.emptyText}>Seu carrinho está vazio!</Text>
          <TouchableOpacity style={styles.backHomeBtn} onPress={() => router.push('/')}>
            <Text style={styles.backHomeBtnText}>Ver Produtos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finalizar Pedido</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Resumo do Pedido */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <Text style={styles.orderItemName} numberOfLines={2}>{item.productName}</Text>
                {item.description ? (
                  <Text style={styles.orderItemDesc}>{item.description}</Text>
                ) : null}
                <Text style={styles.orderItemQty}>Qtd: {item.quantity}</Text>
              </View>
              <Text style={styles.orderItemPrice}>
                R$ {(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Dados do Cliente */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Seus Dados</Text>
          <TextInput
            style={styles.input}
            placeholder="Seu nome *"
            placeholderTextColor="#999"
            value={customerName}
            onChangeText={setCustomerName}
          />
          <TextInput
            style={styles.input}
            placeholder="Seu telefone"
            placeholderTextColor="#999"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observações (opcional)"
            placeholderTextColor="#999"
            value={observation}
            onChangeText={setObservation}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Forma de Pagamento */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Forma de Pagamento</Text>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'pix' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('pix')}
          >
            <View style={styles.paymentIcon}>
              <MaterialCommunityIcons
                name="qrcode"
                size={28}
                color={selectedPayment === 'pix' ? '#FFFFFF' : '#4CAF50'}
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle,
                selectedPayment === 'pix' && styles.paymentTitleSelected,
              ]}>PIX</Text>
              <Text style={[
                styles.paymentDesc,
                selectedPayment === 'pix' && styles.paymentDescSelected,
              ]}>Pagamento instantâneo</Text>
            </View>
            {selectedPayment === 'pix' && (
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'cartao' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('cartao')}
          >
            <View style={styles.paymentIcon}>
              <Ionicons
                name="card"
                size={28}
                color={selectedPayment === 'cartao' ? '#FFFFFF' : '#1976D2'}
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle,
                selectedPayment === 'cartao' && styles.paymentTitleSelected,
              ]}>Cartão de Crédito / Débito</Text>
              <Text style={[
                styles.paymentDesc,
                selectedPayment === 'cartao' && styles.paymentDescSelected,
              ]}>Pague na hora da entrega</Text>
            </View>
            {selectedPayment === 'cartao' && (
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.paymentOption,
              selectedPayment === 'entrega' && styles.paymentOptionSelected,
            ]}
            onPress={() => setSelectedPayment('entrega')}
          >
            <View style={styles.paymentIcon}>
              <MaterialCommunityIcons
                name="cash"
                size={28}
                color={selectedPayment === 'entrega' ? '#FFFFFF' : '#FF6F00'}
              />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[
                styles.paymentTitle,
                selectedPayment === 'entrega' && styles.paymentTitleSelected,
              ]}>Pagar na Entrega</Text>
              <Text style={[
                styles.paymentDesc,
                selectedPayment === 'entrega' && styles.paymentDescSelected,
              ]}>Dinheiro ou cartão na entrega</Text>
            </View>
            {selectedPayment === 'entrega' && (
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerTotal}>
          <Text style={styles.footerTotalLabel}>Total:</Text>
          <Text style={styles.footerTotalValue}>R$ {total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.finalizeButton,
            !selectedPayment && styles.finalizeButtonDisabled,
          ]}
          onPress={handleFinalize}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="whatsapp" size={22} color="#FFFFFF" />
          <Text style={styles.finalizeButtonText}>Enviar Pedido via WhatsApp</Text>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  backHomeBtn: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  backHomeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  orderItemLeft: {
    flex: 1,
    marginRight: 12,
  },
  orderItemName: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  orderItemQty: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  orderItemDesc: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    lineHeight: 18,
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E53935',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 2,
    borderTopColor: '#E53935',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E53935',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  paymentOptionSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  paymentTitleSelected: {
    color: '#FFFFFF',
  },
  paymentDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  paymentDescSelected: {
    color: 'rgba(255,255,255,0.8)',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    paddingBottom: 28,
  },
  footerTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  footerTotalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  footerTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E53935',
  },
  finalizeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalizeButtonDisabled: {
    opacity: 0.6,
  },
  finalizeButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});
