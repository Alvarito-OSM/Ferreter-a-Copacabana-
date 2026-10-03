package com.ferreteria.copacabana;

import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashGeneratorTest {

    @Test
    public void generarHash() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String contrasena = "admin123";
        String hash = encoder.encode(contrasena);

        System.out.println("=========================================");
        System.out.println("CONTRASEÑA: " + contrasena);
        System.out.println("HASH:");
        System.out.println(hash);
        System.out.println("=========================================");
        System.out.println("¿Coincide? " + encoder.matches(contrasena, hash));
        System.out.println("=========================================");
    }
}