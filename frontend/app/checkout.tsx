import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

type PaymentMethod = 'pix' | 'cartao' | 'entrega' | null;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCart();
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerStreet, setCustomerStreet] = useState('');
  const [customerNumber, setCustomerNumber] = useState('');
  const [customerNeighborhood, setCustomerNeighborhood] = useState('');
  const [customerComplement, setCustomerComplement] = useState('');
  const [observation, setObservation] = useState('');
  const [loading, setLoading] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [isWeekend, setIsWeekend] = useState(false);

  const total = getTotalPrice();
  const totalWithDelivery = total + deliveryFee;

  useEffect(() => {
    const fetchDeliveryFee = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/delivery-fee`);
        setDeliveryFee(response.data.currentFee);
        setIsWeekend(response.data.isWeekend);
      } catch (error) {
        console.error('Error fetching delivery fee:', error);
        setDeliveryFee(5);
      }
    };
    fetchDeliveryFee();
  }, []);

  const buildOrderMessage = () => {
    let message = `🍦 *PEDIDO AMARENA SORVETES*\n\n`;
    if (customerName) message += `👤 *Cliente:* ${customerName}\n`;
    if (customerPhone) message += `📱 *Telefone:* ${customerPhone}\n`;
    
    // Endereço de entrega
    const addressParts = [customerStreet, customerNumber, customerComplement, customerNeighborhood].filter(p => p.trim());
    if (addressParts.length > 0) {
      message += `\n📍 *Endereço de Entrega:*\n`;
      message += `  ${customerStreet}`;
      if (customerNumber) message += `, ${customerNumber}`;
      message += `\n`;
      if (customerComplement) message += `  ${customerComplement}\n`;
      if (customerNeighborhood) message += `  ${customerNeighborhood} - Passos/MG\n`;
    }
    message += `\n📋 *Itens do Pedido:*\n`;
    items.forEach((item) => {
      message += `  • ${item.productName} x${item.quantity} — R$ ${(item.price * item.quantity).toFixed(2)}\n`;
      if (item.description) {
        message += `    ${item.description}\n`;
      }
    });
    message += `\n💰 *Total: R$ ${totalWithDelivery.toFixed(2)}*\n`;
    message += `  (Produtos: R$ ${total.toFixed(2)} + Entrega: R$ ${deliveryFee.toFixed(2)})\n`;
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

  const createOrder = async () => {
    const addressParts = [customerStreet, customerNumber, customerComplement, customerNeighborhood].filter(p => p.trim());
    const address = addressParts.join(', ') + ' - Passos/MG';

    const orderData = {
      items: items.map(item => ({
        productId: item.productId,
        productName: item.productName + (item.description ? ` (${item.description})` : ''),
        quantity: item.quantity,
        price: item.price,
      })),
      total: totalWithDelivery,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: address,
      observation: observation.trim(),
      paymentMethod: selectedPayment,
    };

    console.log('Creating order...', API_URL);
    const response = await axios.post(`${API_URL}/api/orders`, orderData);
    console.log('Order response:', JSON.stringify(response.data));
    const oid = response.data.orderId;
    if (!oid) {
      throw new Error('orderId não retornado pelo servidor');
    }
    return oid;
  };

  const sendWhatsAppNotification = (orderId: string) => {
    const message = buildOrderMessage();
    const phoneNumber = '5535997509179';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {});
  };

  const navigateToTicket = (orderId: string) => {
    const ticketItems = items.map(item => ({
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      description: item.description || '',
    }));

    const addressParts = [customerStreet, customerNumber, customerComplement, customerNeighborhood].filter(p => p.trim());
    const address = addressParts.join(', ') + ' - Passos/MG';

    router.push({
      pathname: '/ticket',
      params: {
        orderId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: address,
        items: JSON.stringify(ticketItems),
        subtotal: String(total),
        deliveryFee: String(deliveryFee),
        totalFinal: String(totalWithDelivery),
        paymentMethod: String(selectedPayment),
        observation: observation.trim(),
      },
    });
  };

  const handleFinalize = async () => {
    if (!selectedPayment) {
      Alert.alert('Atenção', 'Selecione uma forma de pagamento!');
      return;
    }
    if (!customerName.trim()) {
      Alert.alert('Atenção', 'Digite seu nome para o pedido!');
      return;
    }
    if (!customerStreet.trim()) {
      Alert.alert('Atenção', 'Digite a rua para entrega!');
      return;
    }
    if (!customerNumber.trim()) {
      Alert.alert('Atenção', 'Digite o número da casa/apto!');
      return;
    }
    if (!customerNeighborhood.trim()) {
      Alert.alert('Atenção', 'Digite o bairro para entrega!');
      return;
    }

    setLoading(true);

    try {
      // 1. Salvar pedido no banco
      const orderId = await createOrder();

      if (selectedPayment === 'pix') {
        // 2a. PIX com chave CNPJ da Amarena
        setLoading(false);
        router.push({
          pathname: '/pagamento-pix',
          params: {
            total: String(totalWithDelivery),
            orderId: orderId,
          },
        });
      } else if (selectedPayment === 'cartao') {
        // 2b. Gerar link de pagamento via Mercado Pago
        const cardResponse = await axios.post(
          `${API_URL}/api/payment/card?order_id=${orderId}&total=${totalWithDelivery}`
        );
        const cardData = cardResponse.data;
        setLoading(false);

        // Abrir Mercado Pago no navegador
        await Linking.openURL(cardData.initPoint);
        clearCart();
        navigateToTicket(orderId);

      } else {
        // 2c. Pagar na entrega - enviar via WhatsApp
        setLoading(false);
        const message = buildOrderMessage();
        const phoneNumber = '5535997509179';
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        await Linking.openURL(url);
        clearCart();
        navigateToTicket(orderId);
      }
    } catch (error: any) {
      setLoading(false);
      console.error('Payment error:', error);
      const errorMsg = error?.response?.data?.detail || error?.message || 'Erro desconhecido';
      Alert.alert(
        'Erro no Pagamento',
        `Não foi possível processar: ${errorMsg}\n\nTente novamente ou escolha outra forma de pagamento.`
      );
    }
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
            <Text style={styles.subtotalLabel}>Subtotal:</Text>
            <Text style={styles.subtotalValue}>R$ {total.toFixed(2)}</Text>
          </View>
          <View style={styles.deliveryRow}>
            <View style={styles.deliveryInfo}>
              <MaterialCommunityIcons name="moped" size={18} color="#4CAF50" />
              <Text style={styles.deliveryLabel}>Entrega {isWeekend ? '(Fim de Semana)' : '(Dia de Semana)'}:</Text>
            </View>
            <Text style={styles.deliveryValue}>R$ {deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.totalFinalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {totalWithDelivery.toFixed(2)}</Text>
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
            placeholder="Seu telefone *"
            placeholderTextColor="#999"
            value={customerPhone}
            onChangeText={setCustomerPhone}
            keyboardType="phone-pad"
          />
        </View>

        {/* Endereço de Entrega */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={22} color="#E53935" />
            <Text style={styles.sectionTitle}> Endereço de Entrega</Text>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Rua / Avenida *"
            placeholderTextColor="#999"
            value={customerStreet}
            onChangeText={setCustomerStreet}
          />
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Número *"
              placeholderTextColor="#999"
              value={customerNumber}
              onChangeText={setCustomerNumber}
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.inputHalf]}
              placeholder="Complemento"
              placeholderTextColor="#999"
              value={customerComplement}
              onChangeText={setCustomerComplement}
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Bairro *"
            placeholderTextColor="#999"
            value={customerNeighborhood}
            onChangeText={setCustomerNeighborhood}
          />
          <View style={styles.cityRow}>
            <Ionicons name="navigate" size={16} color="#4CAF50" />
            <Text style={styles.cityText}>Passos - MG</Text>
          </View>
        </View>

        {/* Observações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Observações</Text>
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
          <Text style={styles.footerTotalValue}>R$ {totalWithDelivery.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.finalizeButton,
            (!selectedPayment || loading) && styles.finalizeButtonDisabled,
          ]}
          onPress={handleFinalize}
          activeOpacity={0.8}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              {selectedPayment === 'pix' ? (
                <MaterialCommunityIcons name="qrcode" size={22} color="#FFFFFF" />
              ) : selectedPayment === 'cartao' ? (
                <Ionicons name="card" size={22} color="#FFFFFF" />
              ) : (
                <MaterialCommunityIcons name="whatsapp" size={22} color="#FFFFFF" />
              )}
            </>
          )}
          <Text style={styles.finalizeButtonText}>
            {loading ? 'Processando...' :
              selectedPayment === 'pix' ? 'Gerar PIX' :
              selectedPayment === 'cartao' ? 'Pagar com Cartão' :
              'Enviar Pedido via WhatsApp'}
          </Text>
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
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subtotalLabel: {
    fontSize: 15,
    color: '#666',
  },
  subtotalValue: {
    fontSize: 15,
    color: '#666',
  },
  deliveryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryLabel: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
  },
  deliveryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  totalFinalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputHalf: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
  },
  cityText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
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
