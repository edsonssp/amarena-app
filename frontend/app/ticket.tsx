import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function TicketScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [printing, setPrinting] = useState(false);

  const {
    orderId = '',
    customerName = '',
    customerPhone = '',
    customerAddress = '',
    items = '[]',
    subtotal = '0',
    deliveryFee = '0',
    totalFinal = '0',
    paymentMethod = '',
    observation = '',
  } = params;

  let parsedItems: any[] = [];
  try {
    parsedItems = JSON.parse(String(items));
  } catch (e) {
    parsedItems = [];
  }

  const paymentLabels: Record<string, string> = {
    pix: 'PIX',
    cartao: 'Cartão de Crédito/Débito',
    entrega: 'Pagar na Entrega',
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const generateTicketHTML = () => {
    const itemsHTML = parsedItems.map((item: any) => {
      let itemLine = `
        <tr>
          <td style="text-align:left;padding:2px 0;">${item.quantity}x ${item.productName}</td>
          <td style="text-align:right;padding:2px 0;">R$ ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `;
      if (item.description) {
        itemLine += `
          <tr>
            <td colspan="2" style="font-size:10px;color:#666;padding:0 0 4px 12px;">${item.description.replace(/\n/g, '<br/>')}</td>
          </tr>
        `;
      }
      return itemLine;
    }).join('');

    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            @page { margin: 0; size: 80mm auto; }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              margin: 0;
              padding: 8px;
              width: 76mm;
              color: #000;
            }
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
          <div class="center sub-header">Pedido #${String(orderId).slice(-6).toUpperCase()}</div>
          <div class="center sub-header">${dateStr} - ${timeStr}</div>
          
          <div class="line"></div>
          
          <div class="bold">CLIENTE</div>
          <div>${String(customerName)}</div>
          ${String(customerPhone) ? `<div>Tel: ${String(customerPhone)}</div>` : ''}
          
          <div class="line"></div>
          
          <div class="bold">ENDERECO DE ENTREGA</div>
          <div>${String(customerAddress)}</div>
          
          <div class="line"></div>
          
          <div class="bold">ITENS DO PEDIDO</div>
          <table>
            ${itemsHTML}
          </table>
          
          <div class="line"></div>
          
          <table>
            <tr>
              <td style="text-align:left;">Subtotal:</td>
              <td style="text-align:right;">R$ ${Number(subtotal).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="text-align:left;">Taxa de Entrega:</td>
              <td style="text-align:right;">R$ ${Number(deliveryFee).toFixed(2)}</td>
            </tr>
          </table>
          
          <div class="double-line"></div>
          
          <table>
            <tr class="total-row">
              <td style="text-align:left;">TOTAL:</td>
              <td style="text-align:right;">R$ ${Number(totalFinal).toFixed(2)}</td>
            </tr>
          </table>
          
          <div class="line"></div>
          
          <div class="bold">PAGAMENTO</div>
          <div>${paymentLabels[String(paymentMethod)] || String(paymentMethod)}</div>
          
          ${String(observation) ? `
            <div class="line"></div>
            <div class="bold">OBSERVACOES</div>
            <div>${String(observation)}</div>
          ` : ''}
          
          <div class="double-line"></div>
          
          <div class="center sub-header">Obrigado pela preferencia!</div>
          <div class="center sub-header">@amarena.passos</div>
          <div class="center sub-header" style="margin-top:8px;">.</div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const html = generateTicketHTML();
      await Print.printAsync({
        html,
        width: 302, // 80mm em pontos (80 * 3.78)
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível imprimir. Verifique se a impressora está conectada.');
    }
    setPrinting(false);
  };

  const handleShare = async () => {
    try {
      const html = generateTicketHTML();
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível compartilhar o ticket.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ticket do Pedido</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Preview do Ticket */}
        <View style={styles.ticketCard}>
          {/* Header da loja */}
          <View style={styles.ticketHeader}>
            <Text style={styles.ticketStoreName}>AMARENA SORVETES</Text>
            <Text style={styles.ticketStoreInfo}>Rua Dois de Novembro - Centro</Text>
            <Text style={styles.ticketStoreInfo}>Passos - MG | (35) 9 7509-9179</Text>
          </View>

          <View style={styles.ticketDivider} />

          {/* Pedido */}
          <Text style={styles.ticketTitle}>CUPOM DE PEDIDO</Text>
          <Text style={styles.ticketOrderId}>Pedido #{String(orderId).slice(-6).toUpperCase()}</Text>
          <Text style={styles.ticketDate}>{dateStr} - {timeStr}</Text>

          <View style={styles.ticketDividerDashed} />

          {/* Cliente */}
          <Text style={styles.ticketSectionTitle}>CLIENTE</Text>
          <Text style={styles.ticketText}>{String(customerName)}</Text>
          {String(customerPhone) ? <Text style={styles.ticketText}>Tel: {String(customerPhone)}</Text> : null}

          <View style={styles.ticketDividerDashed} />

          {/* Endereço */}
          <Text style={styles.ticketSectionTitle}>ENDEREÇO DE ENTREGA</Text>
          <Text style={styles.ticketText}>{String(customerAddress)}</Text>

          <View style={styles.ticketDividerDashed} />

          {/* Itens */}
          <Text style={styles.ticketSectionTitle}>ITENS DO PEDIDO</Text>
          {parsedItems.map((item: any, index: number) => (
            <View key={index} style={styles.ticketItem}>
              <View style={styles.ticketItemRow}>
                <Text style={styles.ticketItemName}>{item.quantity}x {item.productName}</Text>
                <Text style={styles.ticketItemPrice}>R$ {(item.price * item.quantity).toFixed(2)}</Text>
              </View>
              {item.description ? (
                <Text style={styles.ticketItemDesc}>{item.description}</Text>
              ) : null}
            </View>
          ))}

          <View style={styles.ticketDividerDashed} />

          {/* Totais */}
          <View style={styles.ticketTotalRow}>
            <Text style={styles.ticketText}>Subtotal:</Text>
            <Text style={styles.ticketText}>R$ {Number(subtotal).toFixed(2)}</Text>
          </View>
          <View style={styles.ticketTotalRow}>
            <Text style={styles.ticketText}>Taxa de Entrega:</Text>
            <Text style={styles.ticketText}>R$ {Number(deliveryFee).toFixed(2)}</Text>
          </View>

          <View style={styles.ticketDivider} />

          <View style={styles.ticketTotalRow}>
            <Text style={styles.ticketTotalText}>TOTAL:</Text>
            <Text style={styles.ticketTotalText}>R$ {Number(totalFinal).toFixed(2)}</Text>
          </View>

          <View style={styles.ticketDividerDashed} />

          {/* Pagamento */}
          <Text style={styles.ticketSectionTitle}>PAGAMENTO</Text>
          <Text style={styles.ticketText}>{paymentLabels[String(paymentMethod)] || String(paymentMethod)}</Text>

          {/* Observações */}
          {String(observation) ? (
            <>
              <View style={styles.ticketDividerDashed} />
              <Text style={styles.ticketSectionTitle}>OBSERVAÇÕES</Text>
              <Text style={styles.ticketText}>{String(observation)}</Text>
            </>
          ) : null}

          <View style={styles.ticketDivider} />
          <Text style={styles.ticketFooter}>Obrigado pela preferência!</Text>
          <Text style={styles.ticketFooter}>@amarena.passos</Text>
        </View>
      </ScrollView>

      {/* Botões */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.printButton}
          onPress={handlePrint}
          disabled={printing}
        >
          {printing ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialCommunityIcons name="printer" size={22} color="#FFFFFF" />
          )}
          <Text style={styles.printButtonText}>
            {printing ? 'Imprimindo...' : 'Imprimir Ticket'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={22} color="#E53935" />
          <Text style={styles.shareButtonText}>Compartilhar</Text>
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
    padding: 16,
  },
  ticketCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  ticketHeader: {
    alignItems: 'center',
    marginBottom: 4,
  },
  ticketStoreName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'monospace',
  },
  ticketStoreInfo: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'monospace',
  },
  ticketDivider: {
    borderTopWidth: 2,
    borderTopColor: '#000',
    marginVertical: 8,
  },
  ticketDividerDashed: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: '#999',
    marginVertical: 8,
  },
  ticketTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000',
    fontFamily: 'monospace',
  },
  ticketOrderId: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'monospace',
  },
  ticketDate: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'monospace',
  },
  ticketSectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  ticketText: {
    fontSize: 12,
    color: '#333',
    fontFamily: 'monospace',
  },
  ticketItem: {
    marginBottom: 4,
  },
  ticketItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ticketItemName: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'monospace',
    flex: 1,
  },
  ticketItemPrice: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  ticketItemDesc: {
    fontSize: 10,
    color: '#666',
    fontFamily: 'monospace',
    paddingLeft: 12,
    marginTop: 2,
  },
  ticketTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  ticketTotalText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'monospace',
  },
  ticketFooter: {
    fontSize: 11,
    textAlign: 'center',
    color: '#666',
    fontFamily: 'monospace',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    padding: 16,
    paddingBottom: 28,
    flexDirection: 'row',
    gap: 12,
  },
  printButton: {
    flex: 2,
    backgroundColor: '#E53935',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  printButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E53935',
  },
  shareButtonText: {
    color: '#E53935',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
});
