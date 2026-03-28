import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const ACAI_SIZES = [
  { size: '300ml', price: 25.90, type: 'copo', verdes: 3, laranjas: 0 },
  { size: '400ml', price: 30.90, type: 'copo', verdes: 3, laranjas: 0 },
  { size: '500ml', price: 36.90, type: 'copo', verdes: 3, laranjas: 0 },
  { size: '700ml', price: 44.90, type: 'copo', verdes: 3, laranjas: 0 },
  { size: 'M (500ml)', price: 39.90, type: 'tigela', verdes: 3, laranjas: 2 },
  { size: 'G (800ml)', price: 48.90, type: 'tigela', verdes: 3, laranjas: 2 },
];

const ADICIONAIS_VERDES = [
  'Abacaxi', 'Banana', 'Beijinho cremoso', 'Cobertura de Chocolate',
  'Cobertura de Morango', 'Granola', 'Leite condensado', 'Leite em Pó',
  'Mel', 'Paçoca', 'Polpa de morango', 'Salada de frutas',
  'Sorvete de Creme', 'Sorvete de Morango', 'Sorvete de Chocolate',
  'Sorvete de Cupuaçu', 'Sucrilhos', 'Uva', 'Chantilly'
];

const ADICIONAIS_LARANJAS = [
  'Bolacha oreo triturada', 'Bombom Ouro branco', 'Bombom Sonho de valsa',
  'Castanha de caju', 'Cereja', 'Disquete', 'Gotas de Chocolate',
  'Kiwi', 'Morango', 'Musse de Chocolate', 'Musse de Maracujá',
  'Musse de Ninho', 'OvoMaltine', 'Power Boll'
];

const ADICIONAIS_PAGOS = [
  { name: 'Creme de ninho', price: 5.20 },
  { name: 'Creme de Pistache', price: 5.78 },
  { name: 'Kinder Bueno', price: 6.36 },
  { name: 'Creme de Valsa', price: 5.20 },
  { name: 'Kit Kat', price: 5.78 },
  { name: 'Nutella', price: 5.78 },
];

export default function AcaiScreen() {
  const router = useRouter();
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedVerdes, setSelectedVerdes] = useState([]);
  const [selectedLaranjas, setSelectedLaranjas] = useState([]);
  const [selectedPagos, setSelectedPagos] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const toggleVerde = (item) => {
    if (!selectedSize) return;
    const maxVerdes = selectedSize.verdes;
    
    if (selectedVerdes.includes(item)) {
      setSelectedVerdes(selectedVerdes.filter(i => i !== item));
    } else if (selectedVerdes.length < maxVerdes) {
      setSelectedVerdes([...selectedVerdes, item]);
    }
  };

  const toggleLaranja = (item) => {
    if (!selectedSize || selectedSize.type !== 'tigela') return;
    const maxLaranjas = selectedSize.laranjas;
    
    if (selectedLaranjas.includes(item)) {
      setSelectedLaranjas(selectedLaranjas.filter(i => i !== item));
    } else if (selectedLaranjas.length < maxLaranjas) {
      setSelectedLaranjas([...selectedLaranjas, item]);
    }
  };

  const togglePago = (item) => {
    if (selectedPagos.find(p => p.name === item.name)) {
      setSelectedPagos(selectedPagos.filter(p => p.name !== item.name));
    } else {
      setSelectedPagos([...selectedPagos, item]);
    }
  };

  const calculateTotal = () => {
    if (!selectedSize) return 0;
    const pagosTotal = selectedPagos.reduce((sum, item) => sum + item.price, 0);
    return selectedSize.price + pagosTotal;
  };

  const addToCart = () => {
    // Aqui você adicionaria ao carrinho
    alert('Açaí adicionado ao carrinho!');
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Açaí</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Escolha o tamanho */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Escolha o Tamanho</Text>
          <View style={styles.sizesGrid}>
            {ACAI_SIZES.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.sizeCard,
                  selectedSize?.size === item.size && styles.sizeCardSelected
                ]}
                onPress={() => {
                  setSelectedSize(item);
                  setSelectedVerdes([]);
                  setSelectedLaranjas([]);
                }}
              >
                <MaterialCommunityIcons
                  name={item.type === 'tigela' ? 'bowl-mix' : 'cup'}
                  size={32}
                  color={selectedSize?.size === item.size ? '#FFFFFF' : '#7B1FA2'}
                />
                <Text style={[
                  styles.sizeText,
                  selectedSize?.size === item.size && styles.sizeTextSelected
                ]}>
                  {item.size}
                </Text>
                <Text style={[
                  styles.priceText,
                  selectedSize?.size === item.size && styles.priceTextSelected
                ]}>
                  R$ {item.price.toFixed(2)}
                </Text>
                <Text style={[
                  styles.includesText,
                  selectedSize?.size === item.size && styles.includesTextSelected
                ]}>
                  {item.verdes} verdes
                  {item.laranjas > 0 && ` + ${item.laranjas} laranjas`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {selectedSize && (
          <>
            {/* Adicionais Verdes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Adicionais Verdes ({selectedVerdes.length}/{selectedSize.verdes})
              </Text>
              <View style={styles.addonsGrid}>
                {ADICIONAIS_VERDES.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.addonChip,
                      selectedVerdes.includes(item) && styles.addonChipSelected
                    ]}
                    onPress={() => toggleVerde(item)}
                  >
                    <Text style={[
                      styles.addonText,
                      selectedVerdes.includes(item) && styles.addonTextSelected
                    ]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Adicionais Laranjas (apenas para tigela) */}
            {selectedSize.type === 'tigela' && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  Adicionais Laranjas ({selectedLaranjas.length}/{selectedSize.laranjas})
                </Text>
                <View style={styles.addonsGrid}>
                  {ADICIONAIS_LARANJAS.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.addonChip,
                        styles.addonChipOrange,
                        selectedLaranjas.includes(item) && styles.addonChipOrangeSelected
                      ]}
                      onPress={() => toggleLaranja(item)}
                    >
                      <Text style={[
                        styles.addonText,
                        selectedLaranjas.includes(item) && styles.addonTextSelected
                      ]}>
                        {item}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Adicionais Pagos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Adicionais à Parte (Pagos)</Text>
              <View style={styles.paidAddonsGrid}>
                {ADICIONAIS_PAGOS.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.paidAddonCard,
                      selectedPagos.find(p => p.name === item.name) && styles.paidAddonCardSelected
                    ]}
                    onPress={() => togglePago(item)}
                  >
                    <Text style={[
                      styles.paidAddonName,
                      selectedPagos.find(p => p.name === item.name) && styles.paidAddonNameSelected
                    ]}>
                      {item.name}
                    </Text>
                    <Text style={[
                      styles.paidAddonPrice,
                      selectedPagos.find(p => p.name === item.name) && styles.paidAddonPriceSelected
                    ]}>
                      +R$ {item.price.toFixed(2)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Footer com total e botão */}
      {selectedSize && (
        <View style={styles.footer}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>R$ {calculateTotal().toFixed(2)}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={addToCart}
          >
            <Text style={styles.addButtonText}>Adicionar ao Carrinho</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#7B1FA2',
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
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  sizesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sizeCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  sizeCardSelected: {
    backgroundColor: '#7B1FA2',
    borderColor: '#7B1FA2',
  },
  sizeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  sizeTextSelected: {
    color: '#FFFFFF',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7B1FA2',
    marginTop: 4,
  },
  priceTextSelected: {
    color: '#FFFFFF',
  },
  includesText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  includesTextSelected: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  addonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addonChip: {
    backgroundColor: '#E8F5E9',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E8F5E9',
  },
  addonChipSelected: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  addonChipOrange: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FFF3E0',
  },
  addonChipOrangeSelected: {
    backgroundColor: '#FF9800',
    borderColor: '#FF9800',
  },
  addonText: {
    fontSize: 14,
    color: '#333333',
  },
  addonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  paidAddonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paidAddonCard: {
    width: '48%',
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#FFF3E0',
  },
  paidAddonCardSelected: {
    backgroundColor: '#FF6F00',
    borderColor: '#FF6F00',
  },
  paidAddonName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  paidAddonNameSelected: {
    color: '#FFFFFF',
  },
  paidAddonPrice: {
    fontSize: 14,
    color: '#FF6F00',
    marginTop: 4,
    fontWeight: 'bold',
  },
  paidAddonPriceSelected: {
    color: '#FFFFFF',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    paddingBottom: 24,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#7B1FA2',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
