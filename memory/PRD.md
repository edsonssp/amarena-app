# AMARENA.PASSOS - App de Vendas da Sorveteria

## Problema Original
Criar um app Android para vendas da sorveteria AMARENA.PASSOS em Passos, MG.

## Requisitos do Produto
- Database: MongoDB (Atlas em produção)
- Banner de promoção
- Localização no centro de Passos, MG
- Opção para Milkshake
- Cardápio com efeitos e interface moderna/divertida
- Cores: Vermelho com letras verde alecrim, imagem redonda
- Botões principais: Açaí, Sorvetes, Picolés, Promoções, WhatsApp, Milkshake
- Integração com Mercado Pago
- Painel Admin para adicionar/editar produtos com fotos

## Arquitetura
- **Frontend**: Expo (React Native) com expo-router
- **Backend**: FastAPI + PyMongo
- **Database**: MongoDB (local dev / Atlas produção)
- **Hospedagem**: Render.com (Docker)

## URLs de Produção
- Backend: https://amarena-backend.onrender.com
- GitHub: https://github.com/edsonssp/amarena-backend

## Credenciais
- Admin: admin / admin123

## Status Atual

### ✅ Concluído
- App completo com Home, Açaí, Sorvetes, Picolés, Promoções, WhatsApp, Milkshake
- Carrinho, Checkout (entrega e retirada), Pagamento (PIX, Cartão MP, Na entrega)
- Painel Admin (CRUD produtos, pedidos, delivery config, ticket)
- Correções de bugs no Milkshake (teclado/estilo)
- Deploy do backend no Render.com com Docker ✅ (17/04/2026)
- Correção SSL MongoDB Atlas (certifi + Network Access 0.0.0.0/0)

### 🔜 Próximas Tarefas (P1)
- Conectar app Expo ao backend do Render (EXPO_PUBLIC_BACKEND_URL)
- Gerar APK/AAB via EAS Build para Play Store
- Cadastrar produtos pelo painel Admin

### 📋 Backlog (P2)
- Verificar integração Mercado Pago em produção
- Push notifications para pedidos
- Relatórios de vendas no Admin
- Melhorias de UX e performance

## Integrações 3rd Party
- Mercado Pago (Pagamentos)
- MongoDB Atlas (Database)
- Render.com (Hospedagem)

## Schema do Banco
- products: { name, category, price, description, image }
- orders: { items, total, status, paymentMethod, deliveryMode, customerName, address, deliveryFee }
