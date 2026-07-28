package com.outfast;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Clase principal de arranque de Spring Boot.
 *
 * La anotación @SpringBootApplication combina tres anotaciones:
 *   - @Configuration:     Indica que esta clase puede definir beans de Spring.
 *   - @EnableAutoConfiguration: Spring Boot configura automáticamente dependencias
 *                               (ej. detecta PostgreSQL y configura JPA solo).
 *   - @ComponentScan:     Escanea este paquete (com.outfast) y sub-paquetes buscando
 *                         clases anotadas con @Controller, @Service, @Repository, etc.
 */
@SpringBootApplication
public class OutfastApplication {

    public static void main(String[] args) {
        SpringApplication.run(OutfastApplication.class, args);
    }
}
