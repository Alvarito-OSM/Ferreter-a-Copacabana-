package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Categoria;
import com.ferreteria.copacabana.repository.CategoriaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service
public class CategoriaService {

    @Autowired
    private CategoriaRepository categoriaRepository;

    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    public Optional<Categoria> buscarPorId(Integer id) {
        return categoriaRepository.findById(id);
    }

    public Categoria guardar(Categoria categoria) {
        return categoriaRepository.save(categoria);
    }

    public void eliminar(Integer id) {
        categoriaRepository.deleteById(id);
    }
    
    public List<Categoria> buscarPorNombre(String nombre) {
        return categoriaRepository
                .findByNombreContainingIgnoreCase(nombre);
    }

    public Categoria crearValidado(Categoria categoria) {
        validarNombre(categoria);

        if (categoriaRepository.existsByNombreIgnoreCase(
                categoria.getNombre())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una categoría con ese nombre"
            );
        }

        categoria.setIdCategoria(null);
        return categoriaRepository.save(categoria);
    }

    public Categoria actualizarValidado(
            Integer id,
            Categoria categoria
    ) {
        if (!categoriaRepository.existsById(id)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Categoría no encontrada"
            );
        }

        validarNombre(categoria);

        if (categoriaRepository
                .existsByNombreIgnoreCaseAndIdCategoriaNot(
                        categoria.getNombre(), id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Ya existe una categoría con ese nombre"
            );
        }

        categoria.setIdCategoria(id);
        return categoriaRepository.save(categoria);
    }

    private void validarNombre(Categoria categoria) {
        if (categoria.getNombre() == null ||
                categoria.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre es obligatorio"
            );
        }

        categoria.setNombre(categoria.getNombre().trim());

        if (categoria.getNombre().length() > 80) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre no puede superar 80 caracteres"
            );
        }
    }

}