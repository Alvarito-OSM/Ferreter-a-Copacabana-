package com.ferreteria.copacabana.repository;

import com.ferreteria.copacabana.model.categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface categoriaRepository extends JpaRepository<categoria, Integer> {
}