// ============================================
// KAFKA TERMINALS - Consolas Producer/Consumer
// ============================================
class KafkaTerminals {
    constructor() {
        this.producerTerminal = document.getElementById('producerTerminal');
        this.consumerTerminal = document.getElementById('consumerTerminal');
        this.maxLines = 50;
    }

    getTimestamp() {
        const now = new Date();
        return `[${now.toLocaleTimeString()}]`;
    }

    logProducer(topic, partition, key, event, data) {
        const line = document.createElement('div');
        line.className = 'terminal-line';

        line.innerHTML = `
            <span class="terminal-timestamp">${this.getTimestamp()}</span>
            <span class="terminal-producer">▶ PRODUCE</span>
            <span class="terminal-arrow">→</span>
            <span class="terminal-topic">${topic}</span>
            <span class="terminal-partition">[P${partition}]</span>
            <span class="terminal-key">key=${key}</span>
        `;

        this.producerTerminal.appendChild(line);

        const dataLine = document.createElement('div');
        dataLine.className = 'terminal-line';
        dataLine.innerHTML = `
            <span class="terminal-data">└─ event: <span class="terminal-event">${event}</span> | orderId: ${data.orderId}</span>
        `;
        this.producerTerminal.appendChild(dataLine);

        this.scrollToBottom(this.producerTerminal);
        this.trimLines(this.producerTerminal);
    }

    logConsumer(topic, partition, consumerGroup, event, data) {
        const line = document.createElement('div');
        line.className = 'terminal-line';

        line.innerHTML = `
            <span class="terminal-timestamp">${this.getTimestamp()}</span>
            <span class="terminal-consumer">◀ CONSUME</span>
            <span class="terminal-arrow">←</span>
            <span class="terminal-topic">${topic}</span>
            <span class="terminal-partition">[P${partition}]</span>
            <span style="color: #ce9178;">${consumerGroup}</span>
        `;

        this.consumerTerminal.appendChild(line);

        const dataLine = document.createElement('div');
        dataLine.className = 'terminal-line';
        dataLine.innerHTML = `
            <span class="terminal-data">└─ event: <span class="terminal-event">${event}</span> | orderId: ${data.orderId}</span>
        `;
        this.consumerTerminal.appendChild(dataLine);

        this.scrollToBottom(this.consumerTerminal);
        this.trimLines(this.consumerTerminal);
    }

    scrollToBottom(terminal) {
        terminal.scrollTop = terminal.scrollHeight;
    }

    trimLines(terminal) {
        while (terminal.children.length > this.maxLines * 2) {
            terminal.removeChild(terminal.firstChild);
        }
    }

    clearProducer() {
        this.producerTerminal.innerHTML = `
            <div class="terminal-line">
                <span class="terminal-timestamp">${this.getTimestamp()}</span>
                <span class="terminal-producer">▶</span> Kafka Producer iniciado
            </div>
            <div class="terminal-line">
                <span class="terminal-timestamp">${this.getTimestamp()}</span>
                <span style="color: #858585;">└─ Conectado a: localhost:9092</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-timestamp">${this.getTimestamp()}</span>
                <span style="color: #858585;">└─ Esperando mensajes...</span>
            </div>
        `;
    }

    clearConsumer() {
        this.consumerTerminal.innerHTML = `
            <div class="terminal-line">
                <span class="terminal-timestamp">${this.getTimestamp()}</span>
                <span class="terminal-consumer">◀</span> Kafka Consumer iniciado
            </div>
            <div class="terminal-line">
                <span class="terminal-timestamp">${this.getTimestamp()}</span>
                <span style="color: #858585;">└─ Grupos: inventory-group, payment-group, shipping-group, notif-group</span>
            </div>
            <div class="terminal-line">
                <span class="terminal-timestamp">${this.getTimestamp()}</span>
                <span style="color: #858585;">└─ Escuchando tópicos...</span>
            </div>
        `;
    }
}

// ============================================
// VISUALIZACIÓN DE ARQUITECTURA CON KAFKA
// ============================================
class ArchitectureVisualizer {
    constructor() {
        this.messageCounters = {
            inventory: 0,
            payment: 0,
            shipping: 0,
            notification: 0
        };
        this.partitionMessages = {
            orders: [[], [], []],
            payments: [[], [], []],
            shipping: [[], [], []],
            notifications: [[], [], []]
        };
        this.traceId = 0;
        this.orderColors = {};
        this.kafkaTerminals = new KafkaTerminals();
    }

    getOrderColor(orderId) {
        if (!this.orderColors[orderId]) {
            const colors = ['#ff6b6b', '#51cf66', '#4dabf7', '#ffd43b', '#ff8787', '#9775fa', '#20c997'];
            this.orderColors[orderId] = colors[Object.keys(this.orderColors).length % colors.length];
        }
        return this.orderColors[orderId];
    }

    drawTrace(fromX, fromY, toX, toY, color, orderId) {
        // Dibujar en el SVG original
        this.drawTraceInSVG('architectureDiagram', fromX, fromY, toX, toY, color, orderId);

        // Dibujar en el SVG del modal si está visible
        const modal = document.getElementById('fullscreenModal');
        if (modal && modal.classList.contains('active')) {
            this.drawTraceInSVG('modalDiagram', fromX, fromY, toX, toY, color, orderId);
        }
    }

    drawTraceInSVG(svgId, fromX, fromY, toX, toY, color, orderId) {
        const svg = document.getElementById(svgId);
        if (!svg) return;

        const traceLayer = svg.querySelector('#traceLayer');
        if (!traceLayer) return;

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = `M ${fromX} ${fromY} L ${toX} ${toY}`;
        path.setAttribute('d', d);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('opacity', '0.3');
        path.setAttribute('stroke-dasharray', '5,5');
        path.setAttribute('data-order', orderId);

        traceLayer.appendChild(path);

        setTimeout(() => {
            if (path.parentNode) {
                path.style.transition = 'opacity 2s';
                path.setAttribute('opacity', '0.05');
            }
        }, 2000);
    }

    animateMessage(fromX, fromY, toX, toY, color, label, orderId) {
        this.drawTrace(fromX, fromY, toX, toY, color, orderId);

        // Animar en el SVG original
        this.animateMessageInSVG('architectureDiagram', fromX, fromY, toX, toY, color, label, orderId);

        // Animar en el SVG del modal si está visible
        const modal = document.getElementById('fullscreenModal');
        if (modal && modal.classList.contains('active')) {
            this.animateMessageInSVG('modalDiagram', fromX, fromY, toX, toY, color, label, orderId);
        }
    }

    animateMessageInSVG(svgId, fromX, fromY, toX, toY, color, label, orderId) {
        const svg = document.getElementById(svgId);
        if (!svg) return;

        const animationLayer = svg.querySelector('#animationLayer');
        if (!animationLayer) return;

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

        // Crear sobre/mensaje
        const envelope = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        envelope.setAttribute('filter', 'url(#shadow)');

        // Fondo del sobre
        const envRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        envRect.setAttribute('x', '-12');
        envRect.setAttribute('y', '-9');
        envRect.setAttribute('width', '24');
        envRect.setAttribute('height', '18');
        envRect.setAttribute('rx', '2');
        envRect.setAttribute('fill', 'white');
        envRect.setAttribute('stroke', color);
        envRect.setAttribute('stroke-width', '2');

        // Solapa del sobre
        const envFlap = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        envFlap.setAttribute('d', 'M -12 -9 L 0 0 L 12 -9');
        envFlap.setAttribute('fill', 'none');
        envFlap.setAttribute('stroke', color);
        envFlap.setAttribute('stroke-width', '2');
        envFlap.setAttribute('stroke-linejoin', 'round');

        // Líneas decorativas del sobre
        const line1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line1.setAttribute('x1', '-12');
        line1.setAttribute('y1', '9');
        line1.setAttribute('x2', '-3');
        line1.setAttribute('y2', '0');
        line1.setAttribute('stroke', color);
        line1.setAttribute('stroke-width', '2');

        const line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line2.setAttribute('x1', '12');
        line2.setAttribute('y1', '9');
        line2.setAttribute('x2', '3');
        line2.setAttribute('y2', '0');
        line2.setAttribute('stroke', color);
        line2.setAttribute('stroke-width', '2');

        envelope.appendChild(envRect);
        envelope.appendChild(envFlap);
        envelope.appendChild(line1);
        envelope.appendChild(line2);

        // Badge con el ID del pedido
        const badge = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        const badgeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        badgeCircle.setAttribute('cx', '10');
        badgeCircle.setAttribute('cy', '-10');
        badgeCircle.setAttribute('r', '8');
        badgeCircle.setAttribute('fill', color);
        badgeCircle.setAttribute('stroke', 'white');
        badgeCircle.setAttribute('stroke-width', '2');

        const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badgeText.setAttribute('x', '10');
        badgeText.setAttribute('y', '-7');
        badgeText.setAttribute('fill', 'white');
        badgeText.setAttribute('font-size', '9');
        badgeText.setAttribute('font-weight', 'bold');
        badgeText.setAttribute('text-anchor', 'middle');
        badgeText.textContent = label;

        badge.appendChild(badgeCircle);
        badge.appendChild(badgeText);

        group.appendChild(envelope);
        group.appendChild(badge);

        const animateX = document.createElementNS('http://www.w3.org/2000/svg', 'animateTransform');
        animateX.setAttribute('attributeName', 'transform');
        animateX.setAttribute('type', 'translate');
        animateX.setAttribute('from', `${fromX} ${fromY}`);
        animateX.setAttribute('to', `${toX} ${toY}`);
        animateX.setAttribute('dur', '1.2s');
        animateX.setAttribute('fill', 'freeze');

        group.appendChild(animateX);
        animationLayer.appendChild(group);

        setTimeout(() => {
            if (group.parentNode) {
                animationLayer.removeChild(group);
            }
        }, 1200);
    }

    addMessageToPartition(topic, orderId, eventType) {
        const partition = Math.floor(Math.random() * 3);
        const color = this.getOrderColor(orderId);

        // Agregar en el SVG original
        this.addMessageToPartitionInSVG('architectureDiagram', topic, partition, orderId, eventType, color);

        // Agregar en el SVG del modal si está visible
        const modal = document.getElementById('fullscreenModal');
        if (modal && modal.classList.contains('active')) {
            this.addMessageToPartitionInSVG('modalDiagram', topic, partition, orderId, eventType, color);
        }

        return { partition, x: this.getPartitionX(topic, partition), y: this.getPartitionY(topic, partition) };
    }

    addMessageToPartitionInSVG(svgId, topic, partition, orderId, eventType, color) {
        const svg = document.getElementById(svgId);
        if (!svg) return;

        const messageGroup = svg.querySelector(`#${topic}P${partition}Messages`);
        if (!messageGroup) return;

        const messages = this.partitionMessages[topic][partition];

        if (messages.length >= 4) {
            const oldMsg = messageGroup.firstChild;
            if (oldMsg) messageGroup.removeChild(oldMsg);
            if (svgId === 'architectureDiagram') {
                messages.shift();
            }
        }

        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '0');
        rect.setAttribute('y', messages.length * 7);
        rect.setAttribute('width', '38');
        rect.setAttribute('height', '5');
        rect.setAttribute('rx', '1');
        rect.setAttribute('fill', color);
        rect.setAttribute('opacity', '0.9');

        const title = document.createElementNS('http://www.w3.org/2000/svg', 'title');
        title.textContent = `${orderId} - ${eventType}`;
        rect.appendChild(title);

        messageGroup.appendChild(rect);

        if (svgId === 'architectureDiagram') {
            messages.push({ orderId, eventType, element: rect });
        }

        setTimeout(() => {
            if (rect.parentNode) {
                rect.setAttribute('opacity', '0.3');
            }
        }, 3000);
    }

    getPartitionX(topic, partition) {
        const topicPositions = {
            orders: { x: 430, y: 237 },
            payments: { x: 620, y: 237 },
            shipping: { x: 430, y: 352 },
            notifications: { x: 620, y: 352 }
        };
        return topicPositions[topic].x + (partition * 50) + 19;
    }

    getPartitionY(topic, partition) {
        const topicPositions = {
            orders: { x: 430, y: 237 },
            payments: { x: 620, y: 237 },
            shipping: { x: 430, y: 352 },
            notifications: { x: 620, y: 352 }
        };
        return topicPositions[topic].y;
    }

    publishToKafka(topic, orderId, eventType) {
        const color = this.getOrderColor(orderId);
        const label = orderId.split('-')[1].slice(-3);

        const partitionInfo = this.addMessageToPartition(topic, orderId, eventType);

        // Log en terminal de Producer
        this.kafkaTerminals.logProducer(topic, partitionInfo.partition, orderId, eventType, { orderId });

        this.animateMessage(600, 90, partitionInfo.x, partitionInfo.y, color, label, orderId);

        return partitionInfo;
    }

    consumeFromKafka(topic, service, orderId, eventType) {
        const color = this.getOrderColor(orderId);
        const label = orderId.split('-')[1].slice(-3);

        const servicePositions = {
            inventory: { x: 120, y: 540 },
            payment: { x: 330, y: 540 },
            shipping: { x: 870, y: 540 },
            notification: { x: 1080, y: 540 }
        };

        const consumerGroups = {
            inventory: 'inventory-group',
            payment: 'payment-group',
            shipping: 'shipping-group',
            notification: 'notif-group'
        };

        const topicCenters = {
            orders: { x: 505, y: 237 },
            payments: { x: 695, y: 237 },
            shipping: { x: 505, y: 352 },
            notifications: { x: 695, y: 352 }
        };

        const from = topicCenters[topic];
        const to = servicePositions[service];

        // Log en terminal de Consumer
        const partition = Math.floor(Math.random() * 3);
        this.kafkaTerminals.logConsumer(topic, partition, consumerGroups[service], eventType || 'EVENT', { orderId });

        this.animateMessage(from.x, from.y, to.x, to.y, color, label, orderId);

        this.messageCounters[service]++;
        const counter = document.getElementById(`${service}Count`);
        if (counter) {
            counter.textContent = `${this.messageCounters[service]} msgs`;
        }

        setTimeout(() => {
            this.messageCounters[service] = Math.max(0, this.messageCounters[service] - 1);
            if (counter) {
                counter.textContent = `${this.messageCounters[service]} msgs`;
            }
        }, 2000);
    }
}

// ============================================
// EVENT BUS - Sistema de publicación/suscripción
// ============================================
class EventBus {
    constructor() {
        this.subscribers = {};
        this.eventHistory = [];
        this.visualizer = new ArchitectureVisualizer();
    }

    subscribe(eventType, callback) {
        if (!this.subscribers[eventType]) {
            this.subscribers[eventType] = [];
        }
        this.subscribers[eventType].push(callback);
        this.log(`Suscripción registrada para evento: ${eventType}`, 'info');
    }

    publish(eventType, data) {
        const event = {
            type: eventType,
            data: data,
            timestamp: new Date()
        };

        this.eventHistory.push(event);
        this.log(`📢 Evento publicado: ${eventType}`, 'info', data);

        const topicMapping = {
            'CHECK_INVENTORY': 'orders',
            'INVENTORY_AVAILABLE': 'orders',
            'INVENTORY_UNAVAILABLE': 'orders',
            'RESERVE_INVENTORY': 'orders',
            'INVENTORY_RESERVED': 'orders',
            'RELEASE_INVENTORY': 'orders',
            'INVENTORY_RELEASED': 'orders',
            'PROCESS_PAYMENT': 'payments',
            'PAYMENT_PROCESSED': 'payments',
            'PAYMENT_FAILED': 'payments',
            'REFUND_PAYMENT': 'payments',
            'PAYMENT_REFUNDED': 'payments',
            'SCHEDULE_SHIPPING': 'shipping',
            'SHIPPING_SCHEDULED': 'shipping',
            'CANCEL_SHIPPING': 'shipping',
            'SHIPPING_CANCELLED': 'shipping',
            'ORDER_COMPLETED': 'notifications',
            'ORDER_FAILED': 'notifications'
        };

        const serviceMapping = {
            'CHECK_INVENTORY': 'inventory',
            'RESERVE_INVENTORY': 'inventory',
            'RELEASE_INVENTORY': 'inventory',
            'PROCESS_PAYMENT': 'payment',
            'REFUND_PAYMENT': 'payment',
            'SCHEDULE_SHIPPING': 'shipping',
            'CANCEL_SHIPPING': 'shipping',
            'ORDER_COMPLETED': 'notification',
            'ORDER_FAILED': 'notification',
            'SHIPPING_SCHEDULED': 'notification'
        };

        const topic = topicMapping[eventType];
        const targetService = serviceMapping[eventType];

        if (topic && data.orderId) {
            this.visualizer.publishToKafka(topic, data.orderId, eventType);
        }

        if (this.subscribers[eventType]) {
            this.subscribers[eventType].forEach(callback => {
                setTimeout(() => {
                    callback(event);
                    if (targetService && data.orderId) {
                        this.visualizer.consumeFromKafka(topic, targetService, data.orderId, eventType);
                    }
                }, Math.random() * 500 + 500);
            });
        }
    }

    log(message, type = 'info', data = null) {
        const eventLog = document.getElementById('eventLog');
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${type}`;

        const time = new Date().toLocaleTimeString();
        let content = `<span class="event-time">${time}</span><span class="event-type">${message}</span>`;

        if (data) {
            content += `<br><small>${JSON.stringify(data, null, 2)}</small>`;
        }

        eventItem.innerHTML = content;
        eventLog.insertBefore(eventItem, eventLog.firstChild);

        if (eventLog.children.length > 50) {
            eventLog.removeChild(eventLog.lastChild);
        }
    }

    getEventHistory() {
        return this.eventHistory;
    }
}

// ============================================
// SERVICIOS INDEPENDIENTES
// ============================================

class InventoryService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.inventory = {
            laptop: 10,
            smartphone: 15,
            tablet: 8,
            headphones: 20
        };

        this.eventBus.subscribe('CHECK_INVENTORY', this.checkInventory.bind(this));
        this.eventBus.subscribe('RESERVE_INVENTORY', this.reserveInventory.bind(this));
        this.eventBus.subscribe('RELEASE_INVENTORY', this.releaseInventory.bind(this));
    }

    checkInventory(event) {
        const { orderId, product, quantity } = event.data;
        this.eventBus.log(`📦 [Inventario] Verificando disponibilidad para pedido ${orderId}`, 'info');

        setTimeout(() => {
            const available = this.inventory[product] >= quantity;

            if (available) {
                this.eventBus.publish('INVENTORY_AVAILABLE', {
                    orderId,
                    product,
                    quantity,
                    currentStock: this.inventory[product]
                });
                this.eventBus.log(`✅ [Inventario] Stock disponible para pedido ${orderId}`, 'success');
            } else {
                this.eventBus.publish('INVENTORY_UNAVAILABLE', {
                    orderId,
                    product,
                    quantity,
                    currentStock: this.inventory[product]
                });
                this.eventBus.log(`❌ [Inventario] Stock insuficiente para pedido ${orderId}`, 'error');
            }
        }, 800);
    }

    reserveInventory(event) {
        const { orderId, product, quantity } = event.data;
        this.eventBus.log(`📦 [Inventario] Reservando stock para pedido ${orderId}`, 'info');

        setTimeout(() => {
            this.inventory[product] -= quantity;
            this.eventBus.publish('INVENTORY_RESERVED', {
                orderId,
                product,
                quantity,
                remainingStock: this.inventory[product]
            });
            this.eventBus.log(`✅ [Inventario] Stock reservado para pedido ${orderId}`, 'success');
        }, 600);
    }

    releaseInventory(event) {
        const { orderId, product, quantity } = event.data;
        this.eventBus.log(`📦 [Inventario] Liberando stock para pedido ${orderId}`, 'warning');

        setTimeout(() => {
            this.inventory[product] += quantity;
            this.eventBus.publish('INVENTORY_RELEASED', {
                orderId,
                product,
                quantity
            });
            this.eventBus.log(`⚠️ [Inventario] Stock liberado (compensación) para pedido ${orderId}`, 'warning');
        }, 500);
    }
}

class PaymentService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.eventBus.subscribe('PROCESS_PAYMENT', this.processPayment.bind(this));
        this.eventBus.subscribe('REFUND_PAYMENT', this.refundPayment.bind(this));
    }

    processPayment(event) {
        const { orderId, amount, customerName } = event.data;
        this.eventBus.log(`💳 [Pagos] Procesando pago de $${amount} para pedido ${orderId}`, 'info');

        setTimeout(() => {
            const success = Math.random() > 0.2;

            if (success) {
                const transactionId = `TXN-${Date.now()}`;
                this.eventBus.publish('PAYMENT_PROCESSED', {
                    orderId,
                    transactionId,
                    amount,
                    customerName
                });
                this.eventBus.log(`✅ [Pagos] Pago exitoso para pedido ${orderId} (${transactionId})`, 'success');
            } else {
                this.eventBus.publish('PAYMENT_FAILED', {
                    orderId,
                    reason: 'Tarjeta rechazada',
                    amount
                });
                this.eventBus.log(`❌ [Pagos] Pago rechazado para pedido ${orderId}`, 'error');
            }
        }, 1000);
    }

    refundPayment(event) {
        const { orderId, transactionId, amount } = event.data;
        this.eventBus.log(`💳 [Pagos] Procesando reembolso para pedido ${orderId}`, 'warning');

        setTimeout(() => {
            this.eventBus.publish('PAYMENT_REFUNDED', {
                orderId,
                transactionId,
                amount
            });
            this.eventBus.log(`⚠️ [Pagos] Reembolso completado (compensación) para pedido ${orderId}`, 'warning');
        }, 700);
    }
}

class ShippingService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.eventBus.subscribe('SCHEDULE_SHIPPING', this.scheduleShipping.bind(this));
        this.eventBus.subscribe('CANCEL_SHIPPING', this.cancelShipping.bind(this));
    }

    scheduleShipping(event) {
        const { orderId, address, product } = event.data;
        this.eventBus.log(`🚚 [Envíos] Programando envío para pedido ${orderId}`, 'info');

        setTimeout(() => {
            const trackingNumber = `TRACK-${Date.now()}`;
            const estimatedDate = new Date();
            estimatedDate.setDate(estimatedDate.getDate() + 3);

            this.eventBus.publish('SHIPPING_SCHEDULED', {
                orderId,
                trackingNumber,
                address,
                estimatedDelivery: estimatedDate.toLocaleDateString()
            });
            this.eventBus.log(`✅ [Envíos] Envío programado para pedido ${orderId} (${trackingNumber})`, 'success');
        }, 900);
    }

    cancelShipping(event) {
        const { orderId, trackingNumber } = event.data;
        this.eventBus.log(`🚚 [Envíos] Cancelando envío para pedido ${orderId}`, 'warning');

        setTimeout(() => {
            this.eventBus.publish('SHIPPING_CANCELLED', {
                orderId,
                trackingNumber
            });
            this.eventBus.log(`⚠️ [Envíos] Envío cancelado (compensación) para pedido ${orderId}`, 'warning');
        }, 600);
    }
}

class NotificationService {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.eventBus.subscribe('ORDER_COMPLETED', this.sendOrderConfirmation.bind(this));
        this.eventBus.subscribe('ORDER_FAILED', this.sendOrderFailure.bind(this));
        this.eventBus.subscribe('SHIPPING_SCHEDULED', this.sendShippingNotification.bind(this));
    }

    sendOrderConfirmation(event) {
        const { orderId, customerName } = event.data;
        this.eventBus.log(`📧 [Notificaciones] Enviando confirmación a ${customerName}`, 'info');

        setTimeout(() => {
            this.eventBus.log(`✅ [Notificaciones] Email de confirmación enviado para pedido ${orderId}`, 'success');
        }, 500);
    }

    sendOrderFailure(event) {
        const { orderId, customerName, reason } = event.data;
        this.eventBus.log(`📧 [Notificaciones] Enviando notificación de fallo a ${customerName}`, 'info');

        setTimeout(() => {
            this.eventBus.log(`⚠️ [Notificaciones] Email de fallo enviado para pedido ${orderId}: ${reason}`, 'warning');
        }, 500);
    }

    sendShippingNotification(event) {
        const { orderId, trackingNumber } = event.data;
        this.eventBus.log(`📧 [Notificaciones] Enviando información de tracking ${trackingNumber}`, 'info');

        setTimeout(() => {
            this.eventBus.log(`✅ [Notificaciones] Email de envío enviado para pedido ${orderId}`, 'success');
        }, 500);
    }
}

// ============================================
// ORQUESTADOR DE PEDIDOS
// ============================================
class OrderOrchestrator {
    constructor(eventBus) {
        this.eventBus = eventBus;
        this.orders = new Map();

        this.setupEventHandlers();
    }

    setupEventHandlers() {
        this.eventBus.subscribe('INVENTORY_AVAILABLE', this.handleInventoryAvailable.bind(this));
        this.eventBus.subscribe('INVENTORY_UNAVAILABLE', this.handleInventoryUnavailable.bind(this));
        this.eventBus.subscribe('INVENTORY_RESERVED', this.handleInventoryReserved.bind(this));
        this.eventBus.subscribe('PAYMENT_PROCESSED', this.handlePaymentProcessed.bind(this));
        this.eventBus.subscribe('PAYMENT_FAILED', this.handlePaymentFailed.bind(this));
        this.eventBus.subscribe('SHIPPING_SCHEDULED', this.handleShippingScheduled.bind(this));
    }

    createOrder(orderData) {
        const orderId = `ORD-${Date.now()}`;
        const order = {
            id: orderId,
            ...orderData,
            status: 'CREATED',
            createdAt: new Date()
        };

        this.orders.set(orderId, order);
        this.eventBus.log(`🎯 [Orquestador] Nuevo pedido creado: ${orderId}`, 'info', orderData);

        this.startOrderProcessing(order);
        return orderId;
    }

    startOrderProcessing(order) {
        this.eventBus.log(`🎯 [Orquestador] Iniciando procesamiento del pedido ${order.id}`, 'info');

        this.updateOrderStatus(order.id, 'CHECKING_INVENTORY');
        this.eventBus.publish('CHECK_INVENTORY', {
            orderId: order.id,
            product: order.product,
            quantity: order.quantity
        });
    }

    handleInventoryAvailable(event) {
        const { orderId } = event.data;
        const order = this.orders.get(orderId);

        this.eventBus.log(`🎯 [Orquestador] Inventario disponible, reservando para pedido ${orderId}`, 'info');
        this.updateOrderStatus(orderId, 'RESERVING_INVENTORY');

        this.eventBus.publish('RESERVE_INVENTORY', {
            orderId: order.id,
            product: order.product,
            quantity: order.quantity
        });
    }

    handleInventoryUnavailable(event) {
        const { orderId } = event.data;

        this.eventBus.log(`🎯 [Orquestador] Pedido ${orderId} fallido: sin inventario`, 'error');
        this.updateOrderStatus(orderId, 'FAILED');

        this.eventBus.publish('ORDER_FAILED', {
            orderId,
            customerName: this.orders.get(orderId).customerName,
            reason: 'Inventario insuficiente'
        });
    }

    handleInventoryReserved(event) {
        const { orderId } = event.data;
        const order = this.orders.get(orderId);

        this.eventBus.log(`🎯 [Orquestador] Inventario reservado, procesando pago para pedido ${orderId}`, 'info');
        this.updateOrderStatus(orderId, 'PROCESSING_PAYMENT');

        const prices = { laptop: 1200, smartphone: 800, tablet: 500, headphones: 150 };
        const amount = prices[order.product] * order.quantity;

        this.eventBus.publish('PROCESS_PAYMENT', {
            orderId: order.id,
            amount,
            customerName: order.customerName
        });
    }

    handlePaymentProcessed(event) {
        const { orderId, transactionId } = event.data;
        const order = this.orders.get(orderId);
        order.transactionId = transactionId;

        this.eventBus.log(`🎯 [Orquestador] Pago procesado, programando envío para pedido ${orderId}`, 'info');
        this.updateOrderStatus(orderId, 'SCHEDULING_SHIPPING');

        this.eventBus.publish('SCHEDULE_SHIPPING', {
            orderId: order.id,
            address: order.address,
            product: order.product
        });
    }

    handlePaymentFailed(event) {
        const { orderId } = event.data;
        const order = this.orders.get(orderId);

        this.eventBus.log(`🎯 [Orquestador] Pago fallido, iniciando compensación para pedido ${orderId}`, 'error');
        this.updateOrderStatus(orderId, 'COMPENSATING');

        this.eventBus.publish('RELEASE_INVENTORY', {
            orderId: order.id,
            product: order.product,
            quantity: order.quantity
        });

        setTimeout(() => {
            this.updateOrderStatus(orderId, 'FAILED');
            this.eventBus.publish('ORDER_FAILED', {
                orderId,
                customerName: order.customerName,
                reason: 'Pago rechazado'
            });
        }, 1000);
    }

    handleShippingScheduled(event) {
        const { orderId, trackingNumber } = event.data;
        const order = this.orders.get(orderId);
        order.trackingNumber = trackingNumber;

        this.eventBus.log(`🎯 [Orquestador] Envío programado, pedido ${orderId} completado exitosamente`, 'success');
        this.updateOrderStatus(orderId, 'COMPLETED');

        this.eventBus.publish('ORDER_COMPLETED', {
            orderId,
            customerName: order.customerName,
            trackingNumber
        });
    }

    updateOrderStatus(orderId, status) {
        const order = this.orders.get(orderId);
        if (order) {
            order.status = status;
            order.lastUpdated = new Date();
        }
    }

    getOrder(orderId) {
        return this.orders.get(orderId);
    }

    getAllOrders() {
        return Array.from(this.orders.values());
    }
}

// ============================================
// CHOREOGRAPHY MODE - Servicios se coordinan entre sí
// ============================================
class ChoreographyCoordinator {
    constructor(eventBus, inventoryService, paymentService, shippingService, notificationService) {
        this.eventBus = eventBus;
        this.inventoryService = inventoryService;
        this.paymentService = paymentService;
        this.shippingService = shippingService;
        this.notificationService = notificationService;
        this.orders = new Map();

        this.setupChoreography();
    }

    setupChoreography() {
        // En coreografía, cada servicio decide qué hacer cuando escucha un evento
        this.eventBus.subscribe('INVENTORY_AVAILABLE', (event) => {
            const { orderId } = event.data;
            const order = this.orders.get(orderId);
            if (order) {
                this.eventBus.log(`💃 [Coreografía] Inventario disponible, procediendo a reservar`, 'info');
                this.eventBus.publish('RESERVE_INVENTORY', {
                    orderId: order.id,
                    product: order.product,
                    quantity: order.quantity
                });
            }
        });

        this.eventBus.subscribe('INVENTORY_RESERVED', (event) => {
            const { orderId } = event.data;
            const order = this.orders.get(orderId);
            if (order) {
                this.eventBus.log(`💃 [Coreografía] Inventario reservado, Pagos toma la iniciativa`, 'info');
                const prices = { laptop: 1200, smartphone: 800, tablet: 500, headphones: 150 };
                const amount = prices[order.product] * order.quantity;

                this.eventBus.publish('PROCESS_PAYMENT', {
                    orderId: order.id,
                    amount,
                    customerName: order.customerName
                });
            } else {
                this.eventBus.log(`⚠️ [Coreografía] No se encontró orden ${orderId} para INVENTORY_RESERVED`, 'warning');
            }
        });

        this.eventBus.subscribe('PAYMENT_PROCESSED', (event) => {
            const { orderId } = event.data;
            const order = this.orders.get(orderId);
            if (order) {
                this.eventBus.log(`💃 [Coreografía] Pago procesado, Envíos toma la iniciativa`, 'info');
                this.eventBus.publish('SCHEDULE_SHIPPING', {
                    orderId: order.id,
                    address: order.address,
                    product: order.product
                });
            } else {
                this.eventBus.log(`⚠️ [Coreografía] No se encontró orden ${orderId} para PAYMENT_PROCESSED`, 'warning');
            }
        });

        this.eventBus.subscribe('SHIPPING_SCHEDULED', (event) => {
            const { orderId } = event.data;
            const order = this.orders.get(orderId);
            if (order) {
                this.eventBus.log(`💃 [Coreografía] Envío programado, proceso completado`, 'success');
                this.eventBus.publish('ORDER_COMPLETED', {
                    orderId,
                    customerName: order.customerName,
                    trackingNumber: event.data.trackingNumber
                });
            } else {
                this.eventBus.log(`⚠️ [Coreografía] No se encontró orden ${orderId} para SHIPPING_SCHEDULED`, 'warning');
            }
        });

        this.eventBus.subscribe('PAYMENT_FAILED', (event) => {
            const { orderId } = event.data;
            const order = this.orders.get(orderId);
            if (order) {
                this.eventBus.log(`💃 [Coreografía] Pago fallido, Inventario compensa`, 'error');
                this.eventBus.publish('RELEASE_INVENTORY', {
                    orderId: order.id,
                    product: order.product,
                    quantity: order.quantity
                });

                setTimeout(() => {
                    this.eventBus.publish('ORDER_FAILED', {
                        orderId,
                        customerName: order.customerName,
                        reason: 'Pago rechazado'
                    });
                }, 1000);
            }
        });

        this.eventBus.subscribe('INVENTORY_UNAVAILABLE', (event) => {
            const { orderId } = event.data;
            const order = this.orders.get(orderId);
            if (order) {
                this.eventBus.log(`💃 [Coreografía] Inventario no disponible, pedido fallido`, 'error');
                this.eventBus.publish('ORDER_FAILED', {
                    orderId,
                    customerName: order.customerName,
                    reason: 'Inventario insuficiente'
                });
            }
        });
    }

    createOrder(orderData) {
        const orderId = `ORD-${Date.now()}`;
        const order = {
            id: orderId,
            ...orderData,
            status: 'CREATED',
            createdAt: new Date()
        };

        this.orders.set(orderId, order);
        this.eventBus.log(`💃 [Coreografía] Nuevo pedido creado: ${orderId}`, 'info', orderData);

        this.eventBus.publish('CHECK_INVENTORY', {
            orderId: order.id,
            product: order.product,
            quantity: order.quantity
        });

        return orderId;
    }
}

// ============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ============================================
let currentMode = 'orchestration';

const eventBus = new EventBus();
const inventoryService = new InventoryService(eventBus);
const paymentService = new PaymentService(eventBus);
const shippingService = new ShippingService(eventBus);
const notificationService = new NotificationService(eventBus);
const orderOrchestrator = new OrderOrchestrator(eventBus);
const choreographyCoordinator = new ChoreographyCoordinator(eventBus, inventoryService, paymentService, shippingService, notificationService);

eventBus.log('🚀 Sistema iniciado - Todos los servicios están activos', 'success');

// Toggle entre modos
document.getElementById('orchestrationBtn').addEventListener('click', function() {
    currentMode = 'orchestration';
    document.getElementById('orchestrationBtn').classList.add('active');
    document.getElementById('choreographyBtn').classList.remove('active');

    document.getElementById('orchestrator').style.display = 'block';
    document.getElementById('orchestrationConnections').style.display = 'block';
    document.getElementById('choreographyConnections').style.display = 'none';

    document.getElementById('patternInfo').innerHTML = `
        <h3><span>🎯</span> Patrón de Orquestación</h3>
        <p>Un componente central (Orquestador) coordina todo el flujo del proceso. Conoce y controla el orden de ejecución de cada servicio.</p>
        <ul>
            <li class="pros">✅ Flujo fácil de entender y seguir</li>
            <li class="pros">✅ Lógica de compensación centralizada</li>
            <li class="pros">✅ Control total del estado del proceso</li>
            <li class="cons">❌ Punto central de fallo</li>
            <li class="cons">❌ Puede convertirse en monolito distribuido</li>
        </ul>
    `;

    eventBus.log('🔄 Modo cambiado a: ORQUESTACIÓN', 'info');
});

document.getElementById('choreographyBtn').addEventListener('click', function() {
    currentMode = 'choreography';
    document.getElementById('choreographyBtn').classList.add('active');
    document.getElementById('orchestrationBtn').classList.remove('active');

    document.getElementById('orchestrator').style.display = 'none';
    document.getElementById('orchestrationConnections').style.display = 'none';
    document.getElementById('choreographyConnections').style.display = 'block';

    document.getElementById('patternInfo').innerHTML = `
        <h3><span>💃</span> Patrón de Coreografía</h3>
        <p>Los servicios se coordinan entre sí mediante eventos. Cada servicio decide qué hacer cuando escucha un evento, sin un coordinador central.</p>
        <ul>
            <li class="pros">✅ Totalmente distribuido, sin punto central de fallo</li>
            <li class="pros">✅ Servicios completamente desacoplados</li>
            <li class="pros">✅ Mayor escalabilidad y resiliencia</li>
            <li class="cons">❌ Flujo más difícil de entender y seguir</li>
            <li class="cons">❌ Compensaciones más complejas de implementar</li>
        </ul>
    `;

    eventBus.log('🔄 Modo cambiado a: COREOGRAFÍA', 'info');
});

document.getElementById('orderForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const orderData = {
        customerName: document.getElementById('customerName').value,
        product: document.getElementById('product').value,
        quantity: parseInt(document.getElementById('quantity').value),
        address: document.getElementById('address').value
    };

    let orderId;
    if (currentMode === 'orchestration') {
        orderId = orderOrchestrator.createOrder(orderData);
    } else {
        orderId = choreographyCoordinator.createOrder(orderData);
    }

    e.target.reset();

    eventBus.log(`✨ Nuevo pedido recibido: ${orderId}`, 'info');
});

// Event listeners para los botones de limpiar terminales
document.getElementById('clearProducerBtn').addEventListener('click', function() {
    eventBus.visualizer.kafkaTerminals.clearProducer();
});

document.getElementById('clearConsumerBtn').addEventListener('click', function() {
    eventBus.visualizer.kafkaTerminals.clearConsumer();
});

// Event listener para el botón de limpiar registro de eventos
document.getElementById('clearEventsBtn').addEventListener('click', function() {
    const eventLog = document.getElementById('eventLog');
    eventLog.innerHTML = '';
    eventBus.eventHistory = [];
});

// Event listeners para el modal de pantalla completa
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenModal = document.getElementById('fullscreenModal');
const closeModal = document.getElementById('closeModal');
const originalDiagram = document.getElementById('architectureDiagram');
const modalDiagram = document.getElementById('modalDiagram');
const diagramTitle = document.getElementById('diagramTitle');
const modalTitle = document.getElementById('modalTitle');

fullscreenBtn.addEventListener('click', function() {
    // Clonar el contenido del SVG original al modal
    modalDiagram.innerHTML = originalDiagram.innerHTML;

    // Copiar atributos importantes del SVG original
    modalDiagram.setAttribute('viewBox', originalDiagram.getAttribute('viewBox'));
    modalDiagram.style.background = originalDiagram.style.background;
    modalDiagram.style.borderRadius = '5px';
    modalDiagram.style.border = '3px solid #667eea';

    // Copiar el título
    modalTitle.textContent = diagramTitle.textContent + ' - Vista Ampliada';

    // Mostrar el modal
    fullscreenModal.classList.add('active');
});

closeModal.addEventListener('click', function() {
    fullscreenModal.classList.remove('active');
});

// Cerrar el modal al hacer clic fuera del contenido
fullscreenModal.addEventListener('click', function(e) {
    if (e.target === fullscreenModal) {
        fullscreenModal.classList.remove('active');
    }
});

// Cerrar el modal con la tecla ESC
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && fullscreenModal.classList.contains('active')) {
        fullscreenModal.classList.remove('active');
    }
});