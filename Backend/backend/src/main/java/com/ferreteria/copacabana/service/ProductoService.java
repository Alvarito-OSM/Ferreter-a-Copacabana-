package com.ferreteria.copacabana.service;

import com.ferreteria.copacabana.model.Producto;
import com.ferreteria.copacabana.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public Optional<Producto> buscarPorId(Integer id) {
        return productoRepository.findById(id);
    }

    public List<Producto> buscarPorCategoria(Integer idCategoria) {
        return productoRepository.findByCategoriaIdCategoria(idCategoria);
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    public Producto guardar(Producto producto) {
        return productoRepository.save(producto);
    }

    public void eliminar(Integer id) {
        productoRepository.deleteById(id);
    }
    
    public Producto guardarValidado(Producto producto) {

        if (producto.getNombre() == null ||
                producto.getNombre().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El nombre del producto es obligatorio"
            );
        }

        if (producto.getCodigoBarras() == null ||
                producto.getCodigoBarras().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El código de barras es obligatorio"
            );
        }

        if (producto.getCategoria() == null ||
                producto.getCategoria().getIdCategoria() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe seleccionar una categoría"
            );
        }

        if (producto.getAdministrador() == null ||
                producto.getAdministrador().getIdAdministrador() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe asignar un administrador"
            );
        }

        if (producto.getPrecioCompra() == null ||
                producto.getPrecioCompra().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El precio de compra no puede ser negativo"
            );
        }

        if (producto.getPrecioVenta() == null ||
                producto.getPrecioVenta().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El precio de venta no puede ser negativo"
            );
        }

        producto.setNombre(producto.getNombre().trim());
        producto.setCodigoBarras(producto.getCodigoBarras().trim());

        return productoRepository.save(producto);
    }

}