import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

export default function AdminDashboardScreen() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const [showAddPromotion, setShowAddPromotion] = useState(false);
  const [showPromotionsList, setShowPromotionsList] = useState(false);
  const [showAddSeason, setShowAddSeason] = useState(false);
  const [showSeasonsList, setShowSeasonsList] = useState(false);
  const [showDeliveryFee, setShowDeliveryFee] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [products, setProducts] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [orders, setOrders] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState({ weekdayFee: '5.00', weekendFee: '8.00' });
  const [editingProduct, setEditingProduct] = useState(null);
  const [token, setToken] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'sorvetes',
    price: '',
    description: '',
    subcategory: 'frutas',
    isLaunch: false,
    image: '',
  });
  const [newPromotion, setNewPromotion] = useState({
    title: '',
    description: '',
    discount: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });
  const [newSeason, setNewSeason] = useState({
    name: '',
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    bannerImage: '',
    isActive: true,
  });

  useEffect(() => {
    checkAuth();
    fetchStats();
  }, []);

  const checkAuth = async () => {
    const adminToken = await AsyncStorage.getItem('adminToken');
    if (!adminToken) {
      router.replace('/admin');
      return;
    }
    setToken(adminToken);
  };

  const fetchStats = async () => {
    try {
      const adminToken = await AsyncStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const adminToken = await AsyncStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/products?active_only=false`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchPromotions = async () => {
    try {
      const adminToken = await AsyncStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/promotions?active_only=false`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setPromotions(response.data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    }
  };

  const fetchSeasons = async () => {
    try {
      const adminToken = await AsyncStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/seasons?active_only=false`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setSeasons(response.data);
    } catch (error) {
      console.error('Error fetching seasons:', error);
    }
  };

  const handleAddPromotion = async () => {
    if (!newPromotion.title || !newPromotion.discount) {
      Alert.alert('Erro', 'Preencha pelo menos título e desconto');
      return;
    }
    try {
      await axios.post(
        `${API_URL}/api/promotions`,
        { ...newPromotion, discount: parseFloat(newPromotion.discount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sucesso', 'Promoção criada com sucesso!');
      setShowAddPromotion(false);
      setNewPromotion({ title: '', description: '', discount: '', startDate: '', endDate: '', isActive: true });
      fetchStats();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a promoção');
    }
  };

  const handleDeletePromotion = async (promoId) => {
    Alert.alert('Confirmar', 'Excluir esta promoção?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/promotions/${promoId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Sucesso', 'Promoção excluída!');
            fetchPromotions();
            fetchStats();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir');
          }
        },
      },
    ]);
  };

  const handleAddSeason = async () => {
    if (!newSeason.name || !newSeason.title) {
      Alert.alert('Erro', 'Preencha pelo menos nome e título');
      return;
    }
    try {
      await axios.post(
        `${API_URL}/api/seasons`,
        newSeason,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sucesso', 'Temporada criada com sucesso!');
      setShowAddSeason(false);
      setNewSeason({ name: '', title: '', description: '', startDate: '', endDate: '', bannerImage: '', isActive: true });
      fetchStats();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a temporada');
    }
  };

  const handleDeleteSeason = async (seasonId) => {
    Alert.alert('Confirmar', 'Excluir esta temporada?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await axios.delete(`${API_URL}/api/seasons/${seasonId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            Alert.alert('Sucesso', 'Temporada excluída!');
            fetchSeasons();
            fetchStats();
          } catch (error) {
            Alert.alert('Erro', 'Não foi possível excluir');
          }
        },
      },
    ]);
  };

  const fetchDeliveryFee = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/delivery-fee`);
      setDeliveryFee({
        weekdayFee: String(response.data.weekdayFee),
        weekendFee: String(response.data.weekendFee),
      });
    } catch (error) {
      console.error('Error fetching delivery fee:', error);
    }
  };

  const handleSaveDeliveryFee = async () => {
    try {
      await axios.put(
        `${API_URL}/api/admin/delivery-fee`,
        {
          weekdayFee: parseFloat(deliveryFee.weekdayFee) || 0,
          weekendFee: parseFloat(deliveryFee.weekendFee) || 0,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Sucesso', 'Taxa de entrega atualizada!');
      setShowDeliveryFee(false);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar a taxa');
    }
  };

  const fetchOrders = async () => {
    try {
      const adminToken = await AsyncStorage.getItem('adminToken');
      const response = await axios.get(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await axios.put(
        `${API_URL}/api/orders/${orderId}/status?status=${newStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o status');
    }
  };

  const printOrderTicket = async (order: any) => {
    const paymentLabels: Record<string, string> = {
      pix: 'PIX',
      cartao: 'Cartao Credito/Debito',
      entrega: 'Pagar na Entrega',
    };

    const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '';
    const time = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

    const orderItems = order.items || [];
    const itemsHTML = orderItems.map((item: any) => `
      <tr>
        <td style="text-align:left;padding:2px 0;">${item.quantity || 1}x ${item.productName || ''}</td>
        <td style="text-align:right;padding:2px 0;white-space:nowrap;">R$ ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = orderItems.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0);
    const deliveryValue = (order.total || 0) - subtotal;

    const html = `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page { margin: 0; size: 80mm auto; }
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 8px; width: 76mm; color: #000; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .line { border-top: 1px dashed #000; margin: 6px 0; }
            .double-line { border-top: 2px solid #000; margin: 6px 0; }
            table { width: 100%; border-collapse: collapse; }
            .total-row td { font-size: 16px; font-weight: bold; padding-top: 4px; }
            .header { font-size: 16px; font-weight: bold; }
            .sub-header { font-size: 10px; }
          </style>
        </head>
        <body>
          <div class="center">
            <div class="header">AMARENA SORVETES</div>
            <div class="sub-header">Rua Dois de Novembro - Centro</div>
            <div class="sub-header">Passos - MG | (35) 9 7509-9179</div>
          </div>
          <div class="double-line"></div>
          <div class="center bold">CUPOM DE PEDIDO</div>
          <div class="center sub-header">Pedido #${(order.id || '').slice(-6).toUpperCase()}</div>
          <div class="center sub-header">${date} - ${time}</div>
          <div class="line"></div>
          <div class="bold">CLIENTE</div>
          <div>${order.customerName || ''}</div>
          ${order.customerPhone ? `<div>Tel: ${order.customerPhone}</div>` : ''}
          <div class="line"></div>
          <div class="bold">ENDERECO DE ENTREGA</div>
          <div>${order.customerAddress || ''}</div>
          <div class="line"></div>
          <div class="bold">ITENS DO PEDIDO</div>
          <table>${itemsHTML}</table>
          <div class="line"></div>
          <table>
            <tr>
              <td>Subtotal:</td>
              <td style="text-align:right;">R$ ${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Taxa de Entrega:</td>
              <td style="text-align:right;">R$ ${deliveryValue > 0 ? deliveryValue.toFixed(2) : '0.00'}</td>
            </tr>
          </table>
          <div class="double-line"></div>
          <table>
            <tr class="total-row">
              <td>TOTAL:</td>
              <td style="text-align:right;">R$ ${(order.total || 0).toFixed(2)}</td>
            </tr>
          </table>
          <div class="line"></div>
          <div class="bold">PAGAMENTO</div>
          <div>${paymentLabels[order.paymentMethod] || order.paymentMethod || ''}</div>
          ${order.observation ? `<div class="line"></div><div class="bold">OBSERVACOES</div><div>${order.observation}</div>` : ''}
          <div class="double-line"></div>
          <div class="center sub-header">Obrigado pela preferencia!</div>
          <div class="center sub-header">@amarena.passos</div>
          <div class="center sub-header" style="margin-top:8px;">.</div>
        </body>
      </html>
    `;

    try {
      await Print.printAsync({ html, width: 302 });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível imprimir. Verifique a impressora.');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('adminToken');
    await AsyncStorage.removeItem('adminUsername');
    router.replace('/admin');
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!permissionResult.granted) {
      Alert.alert('Permissão Negada', 'Precisamos de permissão para acessar suas fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3, // Reduzir qualidade para 30% para evitar imagens muito grandes
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      
      // Verificar tamanho aproximado (base64 é ~1.37x maior que o original)
      const sizeInBytes = base64Image.length;
      const sizeInMB = sizeInBytes / (1024 * 1024);
      
      if (sizeInMB > 10) {
        Alert.alert('Imagem muito grande', 'Por favor, escolha uma imagem menor (máximo 10MB)');
        return;
      }
      
      if (editingProduct) {
        setEditingProduct({ ...editingProduct, image: base64Image });
      } else {
        setNewProduct({ ...newProduct, image: base64Image });
      }
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      Alert.alert('Erro', 'Preencha pelo menos nome e preço');
      return;
    }

    try {
      await axios.post(
        `${API_URL}/api/products`,
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Sucesso', 'Produto adicionado com sucesso!');
      setShowAddProduct(false);
      setNewProduct({
        name: '',
        category: 'sorvetes',
        price: '',
        description: '',
        subcategory: 'frutas',
        isLaunch: false,
        image: '',
      });
      fetchStats();
      fetchProducts();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível adicionar o produto');
      console.error('Error adding product:', error);
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct.name || !editingProduct.price) {
      Alert.alert('Erro', 'Preencha pelo menos nome e preço');
      return;
    }

    try {
      await axios.put(
        `${API_URL}/api/products/${editingProduct.id}`,
        {
          name: editingProduct.name,
          category: editingProduct.category,
          price: parseFloat(editingProduct.price),
          description: editingProduct.description,
          image: editingProduct.image,
          isLaunch: editingProduct.isLaunch,
          isActive: editingProduct.isActive,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Alert.alert('Sucesso', 'Produto atualizado com sucesso!');
      setEditingProduct(null);
      fetchStats();
      fetchProducts();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o produto');
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    Alert.alert(
      'Confirmar Exclusão',
      'Tem certeza que deseja excluir este produto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_URL}/api/products/${productId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              Alert.alert('Sucesso', 'Produto excluído com sucesso!');
              fetchStats();
              fetchProducts();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir o produto');
            }
          },
        },
      ]
    );
  };

  const openEditProduct = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      description: product.description || '',
      image: product.image || '',
      isLaunch: product.isLaunch || false,
      isActive: product.isActive !== false,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Painel Admin</Text>
          <Text style={styles.headerSubtitle}>Bem-vindo!</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <MaterialCommunityIcons name="logout" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        {stats && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="ice-cream" size={32} color="#E53935" />
              <Text style={styles.statNumber}>{stats.totalProducts}</Text>
              <Text style={styles.statLabel}>Produtos</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialCommunityIcons name="cart" size={32} color="#4CAF50" />
              <Text style={styles.statNumber}>{stats.totalOrders}</Text>
              <Text style={styles.statLabel}>Pedidos</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-alert" size={32} color="#FF9800" />
              <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialCommunityIcons name="cash" size={32} color="#2196F3" />
              <Text style={styles.statNumber}>R$ {stats.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Faturamento</Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAddProduct(true)}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Adicionar Produto</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              fetchProducts();
              setShowProductsList(true);
            }}
          >
            <MaterialCommunityIcons name="view-list" size={24} color="#2196F3" />
            <Text style={styles.actionText}>Gerenciar Produtos</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAddPromotion(true)}
          >
            <MaterialCommunityIcons name="tag-plus" size={24} color="#E53935" />
            <Text style={styles.actionText}>Criar Promoção</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              fetchPromotions();
              setShowPromotionsList(true);
            }}
          >
            <MaterialCommunityIcons name="tag-multiple" size={24} color="#E53935" />
            <Text style={styles.actionText}>Ver Promoções</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setShowAddSeason(true)}
          >
            <MaterialCommunityIcons name="calendar-star" size={24} color="#FF9800" />
            <Text style={styles.actionText}>Criar Temporada</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              fetchSeasons();
              setShowSeasonsList(true);
            }}
          >
            <MaterialCommunityIcons name="calendar-multiple" size={24} color="#FF9800" />
            <Text style={styles.actionText}>Ver Temporadas</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              fetchDeliveryFee();
              setShowDeliveryFee(true);
            }}
          >
            <MaterialCommunityIcons name="moped" size={24} color="#4CAF50" />
            <Text style={styles.actionText}>Taxa de Entrega</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { borderColor: '#1976D2', borderWidth: 2 }]}
            onPress={() => {
              fetchOrders();
              setShowOrders(true);
            }}
          >
            <MaterialCommunityIcons name="receipt" size={24} color="#1976D2" />
            <Text style={[styles.actionText, { color: '#1976D2' }]}>Ver Pedidos</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.backToAppButton}
          onPress={() => router.push('/')}
        >
          <Text style={styles.backToAppText}>Voltar ao App</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Products List Modal */}
      <Modal
        visible={showProductsList}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciar Produtos</Text>
              <TouchableOpacity onPress={() => setShowProductsList(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.productsListScroll}>
              {products.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum produto cadastrado</Text>
              ) : (
                products.map((product) => (
                  <View key={product.id} style={styles.productItemCard}>
                    {product.image && (
                      <Image
                        source={{ uri: product.image }}
                        style={styles.productItemImage}
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.productItemInfo}>
                      <Text style={styles.productItemName}>{product.name}</Text>
                      <Text style={styles.productItemCategory}>{product.category}</Text>
                      <Text style={styles.productItemPrice}>R$ {product.price.toFixed(2)}</Text>
                    </View>
                    <View style={styles.productItemActions}>
                      <TouchableOpacity
                        style={styles.editIconButton}
                        onPress={() => {
                          setShowProductsList(false);
                          openEditProduct(product);
                        }}
                      >
                        <MaterialCommunityIcons name="pencil" size={20} color="#2196F3" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.deleteIconButton}
                        onPress={() => handleDeleteProduct(product.id)}
                      >
                        <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        visible={editingProduct !== null}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Editar Produto</Text>
              <TouchableOpacity onPress={() => setEditingProduct(null)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            {editingProduct && (
              <ScrollView style={styles.modalForm}>
                <Text style={styles.inputLabel}>Imagem do Produto</Text>
                <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                  {editingProduct.image ? (
                    <Image source={{ uri: editingProduct.image }} style={styles.productImagePreview} resizeMode="cover" />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <MaterialCommunityIcons name="camera-plus" size={48} color="#999999" />
                      <Text style={styles.imagePlaceholderText}>Toque para adicionar foto</Text>
                    </View>
                  )}
                </TouchableOpacity>
                {editingProduct.image && (
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => setEditingProduct({ ...editingProduct, image: '' })}
                  >
                    <Text style={styles.removeImageText}>Remover Imagem</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.inputLabel}>Nome do Produto</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingProduct.name}
                  onChangeText={(text) => setEditingProduct({ ...editingProduct, name: text })}
                  placeholder="Ex: Sorvete de Morango"
                />

                <Text style={styles.inputLabel}>Categoria</Text>
                <View style={styles.categoryButtons}>
                  {['sorvetes', 'acai', 'picoles'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryButton,
                        editingProduct.category === cat && styles.categoryButtonActive,
                      ]}
                      onPress={() => setEditingProduct({ ...editingProduct, category: cat })}
                    >
                      <Text
                        style={[
                          styles.categoryButtonText,
                          editingProduct.category === cat && styles.categoryButtonTextActive,
                        ]}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Preço (R$)</Text>
                <TextInput
                  style={styles.textInput}
                  value={editingProduct.price}
                  onChangeText={(text) => setEditingProduct({ ...editingProduct, price: text })}
                  placeholder="0.00"
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Descrição (opcional)</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={editingProduct.description}
                  onChangeText={(text) => setEditingProduct({ ...editingProduct, description: text })}
                  placeholder="Descrição do produto..."
                  multiline
                  numberOfLines={3}
                />

                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleEditProduct}
                >
                  <Text style={styles.submitButtonText}>Salvar Alterações</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Product Modal */}
      <Modal
        visible={showAddProduct}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Adicionar Produto</Text>
              <TouchableOpacity onPress={() => setShowAddProduct(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Imagem do Produto</Text>
              <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
                {newProduct.image ? (
                  <Image source={{ uri: newProduct.image }} style={styles.productImagePreview} resizeMode="cover" />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <MaterialCommunityIcons name="camera-plus" size={48} color="#999999" />
                    <Text style={styles.imagePlaceholderText}>Toque para adicionar foto</Text>
                  </View>
                )}
              </TouchableOpacity>
              {newProduct.image && (
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => setNewProduct({ ...newProduct, image: '' })}
                >
                  <Text style={styles.removeImageText}>Remover Imagem</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.inputLabel}>Nome do Produto</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.name}
                onChangeText={(text) => setNewProduct({ ...newProduct, name: text })}
                placeholder="Ex: Sorvete de Morango"
              />

              <Text style={styles.inputLabel}>Categoria</Text>
              <View style={styles.categoryButtons}>
                {['sorvetes', 'acai', 'picoles'].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      newProduct.category === cat && styles.categoryButtonActive,
                    ]}
                    onPress={() => setNewProduct({ ...newProduct, category: cat })}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        newProduct.category === cat && styles.categoryButtonTextActive,
                      ]}
                    >
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.inputLabel}>Preço (R$)</Text>
              <TextInput
                style={styles.textInput}
                value={newProduct.price}
                onChangeText={(text) => setNewProduct({ ...newProduct, price: text })}
                placeholder="0.00"
                keyboardType="numeric"
              />

              <Text style={styles.inputLabel}>Descrição (opcional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newProduct.description}
                onChangeText={(text) => setNewProduct({ ...newProduct, description: text })}
                placeholder="Descrição do produto..."
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddProduct}
              >
                <Text style={styles.submitButtonText}>Adicionar Produto</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Add Promotion Modal */}
      <Modal visible={showAddPromotion} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Promoção</Text>
              <TouchableOpacity onPress={() => setShowAddPromotion(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Título da Promoção *</Text>
              <TextInput
                style={styles.textInput}
                value={newPromotion.title}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, title: text })}
                placeholder="Ex: Promoção de Verão"
              />
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newPromotion.description}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, description: text })}
                placeholder="Descrição da promoção..."
                multiline
                numberOfLines={3}
              />
              <Text style={styles.inputLabel}>Desconto (%) *</Text>
              <TextInput
                style={styles.textInput}
                value={newPromotion.discount}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, discount: text })}
                placeholder="Ex: 20"
                keyboardType="numeric"
              />
              <Text style={styles.inputLabel}>Data Início (DD/MM/AAAA)</Text>
              <TextInput
                style={styles.textInput}
                value={newPromotion.startDate}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, startDate: text })}
                placeholder="01/06/2025"
              />
              <Text style={styles.inputLabel}>Data Fim (DD/MM/AAAA)</Text>
              <TextInput
                style={styles.textInput}
                value={newPromotion.endDate}
                onChangeText={(text) => setNewPromotion({ ...newPromotion, endDate: text })}
                placeholder="30/06/2025"
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleAddPromotion}>
                <Text style={styles.submitButtonText}>Criar Promoção</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Promotions List Modal */}
      <Modal visible={showPromotionsList} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Promoções</Text>
              <TouchableOpacity onPress={() => setShowPromotionsList(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.productsListScroll}>
              {promotions.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma promoção cadastrada</Text>
              ) : (
                promotions.map((promo) => (
                  <View key={promo.id} style={styles.productItemCard}>
                    <View style={[styles.promoBadge, { backgroundColor: promo.isActive ? '#4CAF50' : '#999' }]}>
                      <Text style={styles.promoBadgeText}>{promo.discount}%</Text>
                    </View>
                    <View style={styles.productItemInfo}>
                      <Text style={styles.productItemName}>{promo.title}</Text>
                      <Text style={styles.productItemCategory}>{promo.description}</Text>
                      <Text style={styles.productItemCategory}>
                        {promo.startDate} — {promo.endDate}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteIconButton}
                      onPress={() => handleDeletePromotion(promo.id)}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Season Modal */}
      <Modal visible={showAddSeason} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Criar Temporada</Text>
              <TouchableOpacity onPress={() => setShowAddSeason(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <Text style={styles.inputLabel}>Nome da Temporada *</Text>
              <View style={styles.categoryButtons}>
                {[
                  { key: 'pascoa', label: 'Páscoa' },
                  { key: 'junina', label: 'Festa Junina' },
                  { key: 'natal', label: 'Natal' },
                  { key: 'carnaval', label: 'Carnaval' },
                  { key: 'maes', label: 'Dia das Mães' },
                  { key: 'verao', label: 'Verão' },
                ].map((season) => (
                  <TouchableOpacity
                    key={season.key}
                    style={[
                      styles.seasonChip,
                      newSeason.name === season.key && styles.seasonChipActive,
                    ]}
                    onPress={() => setNewSeason({ ...newSeason, name: season.key })}
                  >
                    <Text style={[
                      styles.seasonChipText,
                      newSeason.name === season.key && styles.seasonChipTextActive,
                    ]}>{season.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.inputLabel}>Título *</Text>
              <TextInput
                style={styles.textInput}
                value={newSeason.title}
                onChangeText={(text) => setNewSeason({ ...newSeason, title: text })}
                placeholder="Ex: Especial de Natal 2025"
              />
              <Text style={styles.inputLabel}>Descrição</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newSeason.description}
                onChangeText={(text) => setNewSeason({ ...newSeason, description: text })}
                placeholder="Descrição da temporada..."
                multiline
                numberOfLines={3}
              />
              <Text style={styles.inputLabel}>Data Início (DD/MM/AAAA)</Text>
              <TextInput
                style={styles.textInput}
                value={newSeason.startDate}
                onChangeText={(text) => setNewSeason({ ...newSeason, startDate: text })}
                placeholder="01/12/2025"
              />
              <Text style={styles.inputLabel}>Data Fim (DD/MM/AAAA)</Text>
              <TextInput
                style={styles.textInput}
                value={newSeason.endDate}
                onChangeText={(text) => setNewSeason({ ...newSeason, endDate: text })}
                placeholder="31/12/2025"
              />
              <TouchableOpacity style={styles.submitButton} onPress={handleAddSeason}>
                <Text style={styles.submitButtonText}>Criar Temporada</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Seasons List Modal */}
      <Modal visible={showSeasonsList} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Temporadas</Text>
              <TouchableOpacity onPress={() => setShowSeasonsList(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.productsListScroll}>
              {seasons.length === 0 ? (
                <Text style={styles.emptyText}>Nenhuma temporada cadastrada</Text>
              ) : (
                seasons.map((season) => (
                  <View key={season.id} style={styles.productItemCard}>
                    <View style={[styles.promoBadge, { backgroundColor: season.isActive ? '#FF9800' : '#999' }]}>
                      <MaterialCommunityIcons name="calendar-star" size={20} color="#FFFFFF" />
                    </View>
                    <View style={styles.productItemInfo}>
                      <Text style={styles.productItemName}>{season.title}</Text>
                      <Text style={styles.productItemCategory}>{season.name}</Text>
                      <Text style={styles.productItemCategory}>
                        {season.startDate} — {season.endDate}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.deleteIconButton}
                      onPress={() => handleDeleteSeason(season.id)}
                    >
                      <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      {/* Orders Modal */}
      <Modal visible={showOrders} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '95%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pedidos</Text>
              <TouchableOpacity onPress={() => setShowOrders(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={fetchOrders}
            >
              <MaterialCommunityIcons name="refresh" size={18} color="#1976D2" />
              <Text style={styles.refreshText}>Atualizar Pedidos</Text>
            </TouchableOpacity>
            <ScrollView style={styles.productsListScroll}>
              {orders.length === 0 ? (
                <Text style={styles.emptyText}>Nenhum pedido recebido</Text>
              ) : (
                orders.map((order: any) => {
                  const statusColors: Record<string, string> = {
                    pending: '#FF9800',
                    paid: '#4CAF50',
                    preparing: '#1976D2',
                    delivered: '#4CAF50',
                    cancelled: '#F44336',
                  };
                  const statusLabels: Record<string, string> = {
                    pending: 'Pendente',
                    paid: 'Pago',
                    preparing: 'Preparando',
                    delivered: 'Entregue',
                    cancelled: 'Cancelado',
                  };
                  const payLabels: Record<string, string> = {
                    pix: 'PIX',
                    cartao: 'Cartao',
                    entrega: 'Na Entrega',
                  };
                  const date = order.createdAt ? new Date(order.createdAt).toLocaleDateString('pt-BR') : '';
                  const time = order.createdAt ? new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';

                  return (
                    <View key={order.id} style={styles.orderCard}>
                      {/* Header do pedido */}
                      <View style={styles.orderCardHeader}>
                        <View>
                          <Text style={styles.orderNumber}>Pedido #{(order.id || '').slice(-6).toUpperCase()}</Text>
                          <Text style={styles.orderDate}>{date} - {time}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: statusColors[order.status] || '#999' }]}>
                          <Text style={styles.statusText}>{statusLabels[order.status] || order.status}</Text>
                        </View>
                      </View>

                      {/* Cliente */}
                      <View style={styles.orderDetail}>
                        <MaterialCommunityIcons name="account" size={16} color="#666" />
                        <Text style={styles.orderDetailText}>{order.customerName || ''}</Text>
                      </View>
                      {order.customerPhone ? (
                        <View style={styles.orderDetail}>
                          <MaterialCommunityIcons name="phone" size={16} color="#666" />
                          <Text style={styles.orderDetailText}>{order.customerPhone}</Text>
                        </View>
                      ) : null}
                      <View style={styles.orderDetail}>
                        <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                        <Text style={styles.orderDetailText} numberOfLines={2}>{order.customerAddress || ''}</Text>
                      </View>

                      {/* Itens */}
                      <View style={styles.orderItemsList}>
                        {(order.items || []).map((item: any, idx: number) => (
                          <Text key={idx} style={styles.orderItemText}>
                            {item.quantity || 1}x {item.productName} — R$ {((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </Text>
                        ))}
                      </View>

                      {/* Total e pagamento */}
                      <View style={styles.orderFooter}>
                        <View>
                          <Text style={styles.orderTotal}>R$ {(order.total || 0).toFixed(2)}</Text>
                          <Text style={styles.orderPayment}>{payLabels[order.paymentMethod] || order.paymentMethod}</Text>
                        </View>
                      </View>

                      {order.observation ? (
                        <Text style={styles.orderObs}>Obs: {order.observation}</Text>
                      ) : null}

                      {/* Ações */}
                      <View style={styles.orderActions}>
                        <TouchableOpacity
                          style={styles.printTicketBtn}
                          onPress={() => printOrderTicket(order)}
                        >
                          <MaterialCommunityIcons name="printer" size={18} color="#FFF" />
                          <Text style={styles.printTicketText}>Imprimir</Text>
                        </TouchableOpacity>

                        {order.status === 'pending' && (
                          <TouchableOpacity
                            style={[styles.statusBtn, { backgroundColor: '#1976D2' }]}
                            onPress={() => updateOrderStatus(order.id, 'preparing')}
                          >
                            <Text style={styles.statusBtnText}>Preparando</Text>
                          </TouchableOpacity>
                        )}
                        {order.status === 'preparing' && (
                          <TouchableOpacity
                            style={[styles.statusBtn, { backgroundColor: '#4CAF50' }]}
                            onPress={() => updateOrderStatus(order.id, 'delivered')}
                          >
                            <Text style={styles.statusBtnText}>Entregue</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Delivery Fee Modal */}
      <Modal visible={showDeliveryFee} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Taxa de Entrega</Text>
              <TouchableOpacity onPress={() => setShowDeliveryFee(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#333333" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalForm}>
              <View style={styles.deliveryCard}>
                <MaterialCommunityIcons name="calendar-week" size={32} color="#4CAF50" />
                <Text style={styles.deliveryLabel}>Seg a Sex (Dia de Semana)</Text>
                <View style={styles.deliveryInputRow}>
                  <Text style={styles.deliveryCurrency}>R$</Text>
                  <TextInput
                    style={styles.deliveryInput}
                    value={deliveryFee.weekdayFee}
                    onChangeText={(text) => setDeliveryFee({ ...deliveryFee, weekdayFee: text })}
                    keyboardType="numeric"
                    placeholder="5.00"
                  />
                </View>
              </View>

              <View style={styles.deliveryCard}>
                <MaterialCommunityIcons name="calendar-weekend" size={32} color="#FF9800" />
                <Text style={styles.deliveryLabel}>Sáb e Dom (Fim de Semana)</Text>
                <View style={styles.deliveryInputRow}>
                  <Text style={styles.deliveryCurrency}>R$</Text>
                  <TextInput
                    style={styles.deliveryInput}
                    value={deliveryFee.weekendFee}
                    onChangeText={(text) => setDeliveryFee({ ...deliveryFee, weekendFee: text })}
                    keyboardType="numeric"
                    placeholder="8.00"
                  />
                </View>
              </View>

              <TouchableOpacity style={styles.submitButton} onPress={handleSaveDeliveryFee}>
                <Text style={styles.submitButtonText}>Salvar Taxa de Entrega</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    fontWeight: '500',
  },
  backToAppButton: {
    margin: 16,
    padding: 16,
    alignItems: 'center',
  },
  backToAppText: {
    color: '#666666',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalForm: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryButton: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: '#E53935',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  categoryButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePickerButton: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  productImagePreview: {
    width: '100%',
    height: 200,
  },
  imagePlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  imagePlaceholderText: {
    marginTop: 12,
    fontSize: 14,
    color: '#999999',
  },
  removeImageButton: {
    backgroundColor: '#FF5252',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  productsListScroll: {
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 16,
    marginTop: 40,
  },
  productItemCard: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  productItemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
  },
  productItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  productItemCategory: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  productItemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E53935',
    marginTop: 4,
  },
  productItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editIconButton: {
    padding: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  deleteIconButton: {
    padding: 8,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
  },
  promoBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  promoBadgeText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  seasonChip: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  seasonChipActive: {
    backgroundColor: '#FF9800',
  },
  seasonChipText: {
    fontSize: 13,
    color: '#666666',
  },
  seasonChipTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  deliveryCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  deliveryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 8,
    marginBottom: 12,
  },
  deliveryInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  deliveryCurrency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  deliveryInput: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    paddingVertical: 12,
    flex: 1,
    textAlign: 'center',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
  },
  refreshText: {
    color: '#1976D2',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#E53935',
    elevation: 1,
  },
  orderCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  orderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  orderDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  orderDetailText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 8,
    flex: 1,
  },
  orderItemsList: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  orderItemText: {
    fontSize: 12,
    color: '#333',
    marginBottom: 3,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E53935',
  },
  orderPayment: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  orderObs: {
    fontSize: 12,
    color: '#FF9800',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  orderActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  printTicketBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  printTicketText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  statusBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  statusBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
