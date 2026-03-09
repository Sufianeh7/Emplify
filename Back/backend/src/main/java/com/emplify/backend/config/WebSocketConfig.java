package com.emplify.backend.config;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Este es el "puerto de entrada" al que se conectará la app de Ionic
        // setAllowedOriginPatterns("*") permite que el frontend se conecte sin problemas de CORS
        registry.addEndpoint("/ws-endpoint").setAllowedOriginPatterns("*").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // Prefijo para los mensajes que el backend ENVÍA a los clientes (Ionic)
        registry.enableSimpleBroker("/topic");

        // Prefijo para los mensajes que el cliente (Ionic) ENVÍA al backend
        registry.setApplicationDestinationPrefixes("/app");
    }
}