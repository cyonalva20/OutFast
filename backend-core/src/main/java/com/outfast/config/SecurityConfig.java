package com.outfast.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Configuración de Spring Security.
 *
 * Para el MVP, deshabilitamos CSRF (no usamos sesiones basadas en cookies)
 * y permitimos todas las peticiones. Cuando integremos Supabase Auth,
 * aquí se agregarán los filtros JWT para validar tokens.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // Desactivar CSRF (usamos tokens JWT, no cookies de sesión)
            .csrf(csrf -> csrf.disable())

            // No crear sesiones HTTP (API stateless)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // Configurar qué rutas son públicas y cuáles requieren auth
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos (health check, login)
                .requestMatchers("/health", "/api/auth/**").permitAll()
                // TODO: Proteger el resto cuando integremos JWT
                .anyRequest().permitAll()
            );

        return http.build();
    }
}
