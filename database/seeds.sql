INSERT INTO administrador (nombre, apellido, cedula, telefono, email, usuario, contrasena)
VALUES ('Admin', 'Principal', '12345678', '70000000', 'admin@ferreteria.com', 'admin', 'admin123');

INSERT INTO categoria (nombre, descripcion) VALUES
                                                ('Herramientas', 'Herramientas manuales y eléctricas'),
                                                ('Plomeria', 'Tuberias, llaves y accesorios'),
                                                ('Electrico', 'Cables, tomacorrientes e interruptores'),
                                                ('Pintura', 'Pinturas, brochas y rodillos'),
                                                ('Tornilleria', 'Tornillos, tuercas y clavos');

INSERT INTO proveedor (razon_social, nit, contacto, telefono, email, direccion) VALUES
    ('Distribuidora El Tornillo S.A.', '900123456-1', 'Juan Perez', '3100000000', 'ventas@eltornillo.com', 'Calle 10 #20-30');

INSERT INTO producto (id_categoria, id_administrador, codigo_barras, nombre, unidad_medida, precio_compra, precio_venta) VALUES
                                                                                                                             (1, 1, '7501234567890', 'Martillo de acero 16oz', 'UNIDAD', 15000, 25000),
                                                                                                                             (1, 1, '7501234567891', 'Destornillador estrella', 'UNIDAD', 5000, 9000),
                                                                                                                             (5, 1, '7501234567892', 'Tornillo 1/2 pulgada', 'UNIDAD', 200, 500),
                                                                                                                             (2, 1, '7501234567893', 'Tubo PVC 1/2 pulgada', 'METRO', 3000, 5500),
                                                                                                                             (3, 1, '7501234567894', 'Cable electrico calibre 12', 'METRO', 1500, 2800);

INSERT INTO inventario (id_producto, id_administrador, stock_actual, stock_minimo, ubicacion) VALUES
                                                                                                  (1, 1, 20, 5, 'Estante A1'),
                                                                                                  (2, 1, 50, 10, 'Estante A2'),
                                                                                                  (3, 1, 500, 100, 'Caja B1'),
                                                                                                  (4, 1, 30, 10, 'Estante C1'),
                                                                                                  (5, 1, 100, 20, 'Estante C2');