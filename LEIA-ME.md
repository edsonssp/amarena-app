# 🍦 AMARENA SORVETES - Guia de Instalação Local

## 📦 Conteúdo do Projeto

### **Backend (FastAPI + MongoDB)**
- Python 3.11
- FastAPI
- MongoDB
- Mercado Pago integrado
- JWT Authentication

### **Frontend (Expo/React Native)**
- React Native
- Expo Router
- TypeScript
- React Navigation
- Axios

---

## 🚀 Como Rodar Localmente

### **Pré-requisitos:**
```
- Node.js 18+ (você já tem!)
- Python 3.11+
- MongoDB instalado e rodando
- Yarn ou npm
```

---

## 📱 FRONTEND (Expo)

### **1. Instalar Dependências:**
```bash
cd frontend
yarn install
# ou
npm install
```

### **2. Configurar Variáveis de Ambiente:**
Crie/edite o arquivo `frontend/.env`:
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

### **3. Rodar o App:**
```bash
yarn start
# ou
npm start
```

### **4. Abrir no Celular:**
- Instale o app **Expo Go** no seu celular
- Escaneie o QR code que aparece no terminal
- Ou pressione `w` para abrir no navegador (web)

---

## 🔧 BACKEND (FastAPI)

### **1. Criar Ambiente Virtual:**
```bash
cd backend
python -m venv venv

# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate
```

### **2. Instalar Dependências:**
```bash
pip install -r requirements.txt
```

### **3. Configurar Variáveis de Ambiente:**
O arquivo `backend/.env` já está configurado:
```env
MONGO_URL="mongodb://localhost:27017"
DB_NAME="amarena_db"
MERCADO_PAGO_ACCESS_TOKEN="APP_USR-6656971746839751-032807-d9891ba7993aee38736fec982dc51fce-113778776"
MERCADO_PAGO_PUBLIC_KEY="APP_USR-5eae8c60-1449-4595-9c87-1a5e2270c31c"
JWT_SECRET="amarena_secret_key_2025"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

**⚠️ IMPORTANTE:** Certifique-se que o MongoDB está rodando em `localhost:27017`

### **4. Rodar o Backend:**
```bash
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

O backend estará rodando em: `http://localhost:8001`

### **5. Testar API:**
Abra no navegador: `http://localhost:8001/api/health`

Deve retornar:
```json
{"status":"ok","database":"connected"}
```

---

## 🗄️ MongoDB

### **Instalar MongoDB (se não tiver):**

**Windows:**
- Baixe: https://www.mongodb.com/try/download/community
- Instale e rode como serviço

**Mac (Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb
```

### **Verificar se MongoDB está rodando:**
```bash
mongosh
# ou
mongo
```

---

## 📋 Estrutura do Projeto

```
amarena-sorvetes/
├── frontend/               # App Mobile (Expo)
│   ├── app/               # Telas do app
│   │   ├── index.tsx      # Tela inicial
│   │   ├── acai.tsx       # Página de açaí (com colunas)
│   │   ├── sorvetes.tsx   # Página de sorvetes
│   │   ├── picoles.tsx    # Página de picolés
│   │   ├── promocoes.tsx  # Promoções
│   │   ├── temporada.tsx  # Temporadas
│   │   ├── whatsapp.tsx   # Contato WhatsApp
│   │   └── admin/         # Painel Admin
│   │       ├── index.tsx  # Login admin
│   │       └── dashboard.tsx  # Dashboard + Gerenciar produtos
│   ├── assets/            # Imagens e fontes
│   ├── package.json       # Dependências
│   └── .env              # Configurações
│
└── backend/               # API (FastAPI)
    ├── server.py          # API completa
    ├── requirements.txt   # Dependências Python
    └── .env              # Configurações
```

---

## 🔑 Credenciais

### **Admin:**
- Usuário: `admin`
- Senha: `admin123`

### **Mercado Pago:**
- As credenciais já estão configuradas no `.env`

---

## 🧪 Testar o App

### **1. Rodar Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### **2. Rodar Frontend:**
```bash
cd frontend
yarn start
```

### **3. Acessar no celular:**
- Abra Expo Go
- Escaneie o QR code
- Ou pressione `w` para web

### **4. Fazer Login no Admin:**
- Navegue para `/admin`
- Login: `admin` / `admin123`
- Adicione produtos com fotos!

---

## 📝 Funcionalidades Implementadas

### **App Cliente:**
- ✅ Tela inicial com 6 botões
- ✅ Página de Açaí com colunas (verde + laranja) para TODOS os tamanhos
- ✅ Páginas de Sorvetes, Picolés
- ✅ Promoções e Temporadas
- ✅ Contato WhatsApp

### **Painel Admin:**
- ✅ Login seguro
- ✅ Dashboard com estatísticas
- ✅ **Adicionar Produto** com upload de imagem
- ✅ **Gerenciar Produtos** (listar todos)
- ✅ **Editar Produto** (nome, preço, foto, categoria)
- ✅ **Deletar Produto**
- ✅ Criar Promoções
- ✅ Criar Temporadas

### **Backend:**
- ✅ API REST completa
- ✅ Autenticação JWT
- ✅ Integração Mercado Pago
- ✅ CRUD de Produtos, Promoções, Temporadas, Pedidos

---

## 🛠️ Comandos Úteis

### **Frontend:**
```bash
yarn start          # Iniciar Expo
yarn android        # Rodar no Android
yarn ios            # Rodar no iOS
yarn web            # Rodar no navegador
```

### **Backend:**
```bash
uvicorn server:app --reload    # Modo desenvolvimento
python -m pytest               # Rodar testes (se tiver)
```

---

## 📞 Suporte

Se tiver dúvidas:
1. Verifique se MongoDB está rodando
2. Verifique se as portas 3000 e 8001 estão livres
3. Confira os logs no terminal

---

## 🎯 Próximos Passos Sugeridos

1. ✅ Adicionar produtos pelo admin
2. ✅ Testar fluxo de pedidos
3. ✅ Personalizar número do WhatsApp
4. Adicionar carrinho de compras funcional
5. Implementar checkout completo com Mercado Pago
6. Adicionar notificações push

---

## 📦 Download do Projeto

O arquivo `amarena-sorvetes-backup.zip` contém:
- Todo o código frontend
- Todo o código backend
- Arquivos de configuração
- **NÃO INCLUI:** node_modules (instale com `yarn install`)

---

Desenvolvido com ❤️ para AMARENA.PASSOS - Passos, MG
