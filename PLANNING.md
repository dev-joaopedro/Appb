# Planejamento do Sistema: BarberShop Express (MVP)

## 1. Visão Geral do Produto
O **BarberShop Express** é uma plataforma focada na agilidade. Diferente dos concorrentes que exigem cadastro, login e verificação de e-mail, nosso app remove todas as barreiras de entrada para o cliente final. O objetivo é converter a intenção de corte em agendamento no menor tempo possível (menos de 30 segundos).

## 2. Funcionalidades Detalhadas

### 📱 Módulo Cliente (Público - Sem Login)
*   **Landing Screen (Home):**
    *   Botão de ação principal: "Agendar Agora".
    *   Carrossel visual com os serviços e preços.
    *   Endereço e Link para Google Maps.
*   **Fluxo de Agendamento:**
    1.  **Seleção de Serviço:** Lista com Nome, Preço e Duração. Permite múltipla seleção (ex: Barba + Cabelo).
    2.  **Seleção de Profissional (Opcional):** "Qualquer um disponível" ou barbeiro específico.
    3.  **Seleção de Data/Hora:** Calendário visual mostrando apenas slots livres.
    4.  **Identificação:** Campos simples: Nome, WhatsApp e Observações.
    5.  **Revisão e Confirmação:** Resumo do pedido e botão "Confirmar".
*   **Pós-Agendamento:**
    *   Tela de "Sucesso" com animação.
    *   Botão "Adicionar ao Calendário".
    *   Recebimento de notificação via WhatsApp (automático).

### ✂️ Módulo Barbeiro/Admin (Privado - Com Login)
*   **Dashboard:**
    *   Visão geral do dia (timeline vertical).
    *   Indicadores rápidos: Faturamento do dia, total de cortes.
*   **Gestão de Agenda:**
    *   Bloquear horários (almoço, folga).
    *   Cancelar agendamento (dispara aviso ao cliente).
    *   Marcar como "Concluído" (check-in/check-out).
*   **Gestão de Catálogo:**
    *   CRUD de Serviços (Nome, Preço, Duração Estimada).
*   **Configurações:**
    *   Definir horário de funcionamento da barbearia.

---

## 3. Arquitetura e Stack Tecnológica Recomendada

Considerando que você está em um ambiente **Go** (`.../Go/App`) e precisa de performance e tipagem forte, esta é a stack ideal:

### A. Frontend (Mobile & Web)
*   **Framework:** **Flutter**.
    *   *Por que?* Permite compilar para Android, iOS e Web a partir de um único código (Dart). A performance é nativa e a criação de interfaces personalizadas é superior ao React Native.
    *   *Gerenciamento de Estado:* Riverpod ou Provider.

### B. Backend (API REST)
*   **Linguagem:** **Go (Golang)**.
    *   *Por que?* Extremamente rápido, baixo consumo de memória e fácil de escalar.
*   **Framework Web:** **Gin Gonic** ou **Echo**.
    *   *Por que?* Minimalistas e performáticos para criar rotas API.
*   **Autenticação (Admin):** JWT (JSON Web Tokens).

### C. Banco de Dados
*   **SGBD:** **PostgreSQL**.
    *   *Por que?* Dados relacionais (agendamentos x horários x serviços) exigem integridade ACID. O Postgres lida muito bem com datas e concorrência.
*   **ORM/Query Builder:** **GORM** ou **SQLC**.

### D. Integrações Externas
*   **WhatsApp:** **Twilio API** (Solução Enterprise) ou **Evolution API** (Solução Open Source/Self-hosted).
    *   *MVP:* Usar deep link `https://wa.me/number?text=...` para o cliente iniciar conversa, e API para o sistema enviar confirmação.
*   **Push Notifications:** **OneSignal** (Melhor custo-benefício e SDK excelente para Flutter).

---

## 4. Estrutura do Banco de Dados (Esquema Simplificado)

```sql
-- Tabela de Usuários Administrativos (Barbeiros)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    phone VARCHAR(20),
    password_hash VARCHAR(255),
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de Serviços
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    price DECIMAL(10, 2),
    duration_minutes INT, -- Ex: 30, 60
    active BOOLEAN DEFAULT TRUE
);

-- Tabela de Agendamentos
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    client_name VARCHAR(100),
    client_phone VARCHAR(20),
    service_id INT REFERENCES services(id),
    barber_id INT REFERENCES users(id), -- Opcional se for "qualquer um"
    appointment_time TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, CANCELED, DONE
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 5. Fluxo de Navegação (User Flow)

### Fluxo do Cliente
1.  **Splash Screen** (Logo da Barbearia)
2.  **Home:** Clica em "Agendar".
3.  **Modal Serviços:** Seleciona "Corte de Cabelo (R$ 50,00)".
4.  **Modal Calendário:** O sistema busca no Backend horários disponíveis (exclui os já ocupados na tabela `appointments`). Cliente clica em "15:30".
5.  **Modal Dados:** Digita nome e WhatsApp.
6.  **Confirmação:** Envia POST para API.
7.  **Sucesso:** Mostra mensagem e botão "Ir para WhatsApp" para receber comprovante.

### Fluxo do Barbeiro
1.  **Login:** E-mail/Senha.
2.  **Dashboard (Agenda):** Vê uma lista cronológica dos agendamentos do dia.
3.  **Ação:** Clica em um agendamento -> Abre detalhes -> Clica em "Finalizar Serviço".

---

## 6. Próximos Passos para Desenvolvimento

1.  **Setup do Ambiente Go:** Inicializar módulo (`go mod init barber-app`) e instalar Gin e Gorm.
2.  **Setup do Banco:** Subir um container Docker com PostgreSQL.
3.  **Backend - Fase 1:** Criar rotas de CRUD de Serviços e a rota pública de "Listar Horários Disponíveis" (Lógica crítica: verificar colisão de horários).
4.  **Frontend - Fase 1:** Criar telas do Flutter (Home, Form de Agendamento).
5.  **Integração:** Conectar App ao Backend.
6.  **Polimento:** Adicionar notificações.
