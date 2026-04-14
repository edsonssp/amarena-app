import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useCart } from '../contexts/CartContext';

const MILKSHAKE_SIZES = [
  { size: '300ml', price: 21.90 },
  { size: '400ml', price: 25.90 },
  { size: '500ml', price: 28.90 },
  { size: '700ml', price: 35.90 },
];

const ADICIONAIS_PAGOS = [
  { name: 'Chantilly', price: 2.00 },
  { name: 'Creme de Ninho', price: 4.00 },
  { name: 'Nutella', price: 5.00 },
  { name: 'Ovomaltine', price: 3.50 },
];

export default function MilkshakeScreen() {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);

  const toggleExtra = (extra: any) => {
    if (selectedExtras.find(e => e.name === extra.name)) {
      setSelectedExtras(selectedExtras.filter(e => e.name !== extra.name));
    } else {
      setSelectedExtras([...selectedExtras, extra]);
    }
  };

  const calculateTotal = () => {
    if (!selectedSize) return 0;
    const extrasTotal = selectedExtras.reduce((sum, e) => sum + e.price, 0);
    return selectedSize.price + extrasTotal;
  };

  const addToCart = () => {
    if (!selectedSize) return;

    let detalhes = '';
    if (selectedExtras.length > 0) {
      detalhes = `Extras: ${selectedExtras.map(e => `${e.name} (+R$${e.price.toFixed(2)})`).join(', ')}`;
    }

    addItem({
      id: `milkshake-${selectedSize.size}-${Date.now()}`,
      productId: `milkshake-${selectedSize.size}`,
      productName: `Milkshake ${selectedSize.size}`,
      quantity: 1,
      price: calculateTotal(),
      description: detalhes,
    });
    alert('Milkshake adicionado ao carrinho! ✅');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Milkshake</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Banner */}
        <View style={styles.banner}>
          <MaterialCommunityIcons name="cup" size={50} color="#FFFFFF" />
          <Text style={styles.bannerTitle}>Milkshake Amarena</Text>
          <Text style={styles.bannerSubtitle}>Cremoso e irresistível!</Text>
        </View>

        {/* Tamanhos */}
        <Text style={styles.sectionTitle}>Escolha o Tamanho</Text>
        <View style={styles.sizesGrid}>
          {MILKSHAKE_SIZES.map((size) => (
            <TouchableOpacity
              key={size.size}
              style={[
                styles.sizeCard,
                selectedSize?.size === size.size && styles.sizeCardSelected,
              ]}
              onPress={() => setSelectedSize(size)}
            >
              <MaterialCommunityIcons
                name="cup"
                size={36}
                color={selectedSize?.size === size.size ? '#FFFFFF' : '#9C27B0'}
              />
              <Text style={[
                styles.sizeText,
                selectedSize?.size === size.size && styles.sizeTextSelected,
              ]}>{size.size}</Text>
              <Text style={[
                styles.sizePrice,
                selectedSize?.size === size.size && styles.sizePriceSelected,
              ]}>R$ {size.price.toFixed(2)}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Adicionais Pagos */}
        <Text style={styles.sectionTitle}>Adicionais (opcional)</Text>
        <Text style={styles.sectionSubtitle}>Valores cobrados a parte</Text>

        {ADICIONAIS_PAGOS.map((extra) => {
          const isSelected = selectedExtras.find(e => e.name === extra.name);
          return (
            <TouchableOpacity
              key={extra.name}
              style={[styles.extraCard, isSelected && styles.extraCardSelected]}
              onPress={() => toggleExtra(extra)}
            >
              <View style={styles.extraInfo}>
                <MaterialCommunityIcons
                  name={isSelected ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={24}
                  color={isSelected ? '#FFFFFF' : '#9C27B0'}
                />
                <Text style={[
                  styles.extraName,
                  isSelected && styles.extraNameSelected,
                ]}>{extra.name}</Text>
              </View>
              <Text style={[
                styles.extraPrice,
                isSelected && styles.extraPriceSelected,
              ]}>+ R$ {extra.price.toFixed(2)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalValue}>R$ {calculateTotal().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, !selectedSize && styles.addButtonDisabled]}
          onPress={addToCart}
          disabled={!selectedSize}
        >
          <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
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
    backgroundColor: '#9C27B0',
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
    fontSize: 22,
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
  banner: {
    backgroundColor: '#9C27B0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 12,
  },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 12,
  },
  sizeCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    elevation: 1,
  },
  sizeCardSelected: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  sizeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  sizeTextSelected: {
    color: '#FFFFFF',
  },
  sizePrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9C27B0',
    marginTop: 4,
  },
  sizePriceSelected: {
    color: '#FFFFFF',
  },
  extraCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  extraCardSelected: {
    backgroundColor: '#9C27B0',
    borderColor: '#9C27B0',
  },
  extraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 12,
  },
  extraNameSelected: {
    color: '#FFFFFF',
  },
  extraPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  extraPriceSelected: {
    color: '#FFFFFF',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    paddingBottom: 28,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9C27B0',
  },
  addButton: {
    backgroundColor: '#9C27B0',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
