import { API_BASE_URL } from '@/url';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class NotificationService {
    constructor() {
        this.stompClient = null;
        this.connected = false;
        this.subscriptions = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect(userId, onNotification) {
        // console.log("Connecting to WebSocket...");
        
        // Create SockJS socket with proper error handling
        const socket = new SockJS(`${API_BASE_URL}/api/ws`, null, {
            transports: ['websocket', 'xhr-streaming', 'xhr-polling']
        });

        this.stompClient = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log('STOMP: ' + str),
            
            onConnect: (frame) => {
                // console.log('🔌 Connected to WebSocket:', frame);
                this.connected = true;
                this.reconnectAttempts = 0;
                
                // Subscribe to user-specific notifications
                const subscription = this.stompClient.subscribe(
                    `/queue/notifications`, 
                    (message) => {
                        try {
                            const notification = JSON.parse(message.body);
                            // console.log('📢 Received notification:', notification);
                            onNotification(notification);
                        } catch (error) {
                            console.error('Error parsing notification:', error);
                        }
                    }
                );
                
                this.subscriptions.set(userId, subscription);
                
                // Send a test message to confirm connection
                this.sendConnectionTest(userId);
            },
            
            onDisconnect: (frame) => {
                // console.log('🔌 Disconnected from WebSocket:', frame);
                this.connected = false;
                this.subscriptions.clear();
                
                // Attempt to reconnect
                this.attemptReconnect(userId, onNotification);
            },
            
            onStompError: (frame) => {
                console.error('❌ STOMP error:', frame);
                console.error('Error details:', frame.headers);
                console.error('Error body:', frame.body);
            },

            onWebSocketError: (error) => {
                console.error('❌ WebSocket error:', error);
            },

            onWebSocketClose: (event) => {
                console.log('🔌 WebSocket closed:', event);
            }
        });

        // Set reconnect delay
        this.stompClient.reconnectDelay = 5000;
        
        try {
            this.stompClient.activate();
        } catch (error) {
            console.error('Failed to activate STOMP client:', error);
        }
    }

    attemptReconnect(userId, onNotification) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`🔄 Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            
            setTimeout(() => {
                this.connect(userId, onNotification);
            }, 3000 * this.reconnectAttempts); // Exponential backoff
        } else {
            console.error('❌ Max reconnection attempts reached');
        }
    }

    sendConnectionTest(userId) {
        if (this.connected && this.stompClient) {
            // console.log('📤 Sending connection test message');
            this.stompClient.publish({
                destination: '/app/test',
                body: JSON.stringify({
                    userId: userId,
                    message: 'Connection test',
                    timestamp: new Date().toISOString()
                })
            });
        }
    }

    disconnect() {
        if (this.stompClient) {
            console.log('🔌 Manually disconnecting WebSocket');
            this.subscriptions.forEach(sub => sub.unsubscribe());
            this.subscriptions.clear();
            this.stompClient.deactivate();
            this.connected = false;
            this.reconnectAttempts = 0;
        }
    }

    // Send notification (for testing)
    sendTestNotification(userId, message) {
        if (this.connected && this.stompClient) {
            this.stompClient.publish({
                destination: '/app/notify',
                body: JSON.stringify({
                    userId: userId,
                    message: message,
                    type: 'APPOINTMENT_CONFIRMATION',
                    timestamp: new Date().toISOString()
                })
            });
        } else {
            console.warn('⚠️ Cannot send notification: WebSocket not connected');
        }
    }

    showBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(notification.title, {
                body: notification.message,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                console.log('🔔 Notification permission:', permission);
            });
        }
    }

    // Check connection status
    isConnected() {
        return this.connected && this.stompClient && this.stompClient.connected;
    }
}

export default new NotificationService();