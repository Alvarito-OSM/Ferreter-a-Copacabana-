package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.Administrador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdministradorRepository extends JpaRepository<Administrador, Integer> {

    Optional<Administrador> findByUsuario(String usuario);
}