DROP TABLE IF EXISTS pago CASCADE;
DROP TABLE IF EXISTS detalle_venta CASCADE;
DROP TABLE IF EXISTS venta CASCADE;
DROP TABLE IF EXISTS detalle_compra CASCADE;
DROP TABLE IF EXISTS compra CASCADE;
DROP TABLE IF EXISTS inventario CASCADE;
DROP TABLE IF EXISTS producto CASCADE;
DROP TABLE IF EXISTS categoria CASCADE;
DROP TABLE IF EXISTS proveedor CASCADE;
DROP TABLE IF EXISTS cliente CASCADE;
DROP TABLE IF EXISTS empleado CASCADE;
DROP TABLE IF EXISTS administrador CASCADE;

CREATE TABLE administrador (
    id_administrador    SERIAL PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    apellido            VARCHAR(100)    NOT NULL,
    cedula              VARCHAR(20)     NOT NULL UNIQUE,
    telefono            VARCHAR(20),
    email               VARCHAR(150)    NOT NULL UNIQUE,
    usuario             VARCHAR(50)     NOT NULL UNIQUE,
    contrasena          VARCHAR(255)    NOT NULL,
    estado              BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE empleado (
    id_empleado         SERIAL PRIMARY KEY,
    id_administrador    INT             NOT NULL,
    nombre              VARCHAR(100)    NOT NULL,
    apellido            VARCHAR(100)    NOT NULL,
    cedula              VARCHAR(20)     NOT NULL UNIQUE,
    cargo               VARCHAR(50)     NOT NULL,
    telefono            VARCHAR(20),
    email               VARCHAR(150),
    usuario             VARCHAR(50)     NOT NULL UNIQUE,
    contrasena          VARCHAR(255)    NOT NULL,
    fecha_ingreso       DATE            NOT NULL DEFAULT CURRENT_DATE,
    estado              BOOLEAN         NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_empleado_admin
        FOREIGN KEY (id_administrador)
        REFERENCES administrador(id_administrador)
);

CREATE TABLE cliente (
    id_cliente          SERIAL PRIMARY KEY,
    nombre              VARCHAR(100)    NOT NULL,
    apellido            VARCHAR(100),
    cedula_nit          VARCHAR(20)     NOT NULL UNIQUE,
    telefono            VARCHAR(20),
    email               VARCHAR(150),
    direccion           VARCHAR(255),
    fecha_registro      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado              BOOLEAN         NOT NULL DEFAULT TRUE
);

CREATE TABLE proveedor (
    id_proveedor        SERIAL PRIMARY KEY,
    razon_social        VARCHAR(150)    NOT NULL,
    nit                 VARCHAR(20)     NOT NULL UNIQUE,
    contacto            VARCHAR(100),
    telefono            VARCHAR(20),
    email               VARCHAR(150),
    direccion           VARCHAR(255),
    estado              BOOLEAN         NOT NULL DEFAULT TRUE
);

CREATE TABLE categoria (
    id_categoria        SERIAL PRIMARY KEY,
    nombre              VARCHAR(80)     NOT NULL UNIQUE,
    descripcion         VARCHAR(255)
);

CREATE TABLE producto (
    id_producto         SERIAL PRIMARY KEY,
    id_categoria        INT             NOT NULL,
    id_administrador    INT             NOT NULL,
    codigo_barras       VARCHAR(50)     NOT NULL UNIQUE,
    nombre              VARCHAR(150)    NOT NULL,
    descripcion         VARCHAR(255),
    unidad_medida       VARCHAR(20)     NOT NULL DEFAULT 'UNIDAD',
    precio_compra       DECIMAL(10,2)   NOT NULL DEFAULT 0,
    precio_venta        DECIMAL(10,2)   NOT NULL DEFAULT 0,
    estado              BOOLEAN         NOT NULL DEFAULT TRUE,
    fecha_creacion      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_producto_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categoria(id_categoria),
    CONSTRAINT fk_producto_admin
        FOREIGN KEY (id_administrador)
        REFERENCES administrador(id_administrador)
);

CREATE TABLE inventario (
    id_inventario       SERIAL PRIMARY KEY,
    id_producto         INT             NOT NULL UNIQUE,
    id_administrador    INT             NOT NULL,
    stock_actual        INT             NOT NULL DEFAULT 0,
    stock_minimo        INT             NOT NULL DEFAULT 5,
    ubicacion           VARCHAR(50),
    fecha_actualizacion TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inventario_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto),
    CONSTRAINT fk_inventario_admin
        FOREIGN KEY (id_administrador)
        REFERENCES administrador(id_administrador)
);

CREATE TABLE compra (
    id_compra           SERIAL PRIMARY KEY,
    id_proveedor        INT             NOT NULL,
    id_administrador    INT             NOT NULL,
    fecha               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal            DECIMAL(10,2)   NOT NULL DEFAULT 0,
    iva                 DECIMAL(10,2)   NOT NULL DEFAULT 0,
    total               DECIMAL(10,2)   NOT NULL DEFAULT 0,
    estado              VARCHAR(20)     NOT NULL DEFAULT 'COMPLETADA',
    CONSTRAINT fk_compra_proveedor
        FOREIGN KEY (id_proveedor)
        REFERENCES proveedor(id_proveedor),
    CONSTRAINT fk_compra_admin
        FOREIGN KEY (id_administrador)
        REFERENCES administrador(id_administrador)
);

CREATE TABLE detalle_compra (
    id_detalle_compra   SERIAL PRIMARY KEY,
    id_compra           INT             NOT NULL,
    id_producto         INT             NOT NULL,
    cantidad            INT             NOT NULL CHECK (cantidad > 0),
    precio_unitario     DECIMAL(10,2)   NOT NULL,
    descuento           DECIMAL(10,2)   NOT NULL DEFAULT 0,
    subtotal            DECIMAL(10,2)   NOT NULL,
    lote                VARCHAR(50),
    fecha_vencimiento   DATE,
    CONSTRAINT fk_detalle_compra_compra
        FOREIGN KEY (id_compra)
        REFERENCES compra(id_compra) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_compra_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
);

CREATE TABLE venta (
    id_venta            SERIAL PRIMARY KEY,
    id_cliente          INT             NOT NULL,
    id_empleado         INT             NOT NULL,
    fecha               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal            DECIMAL(10,2)   NOT NULL DEFAULT 0,
    iva                 DECIMAL(10,2)   NOT NULL DEFAULT 0,
    descuento           DECIMAL(10,2)   NOT NULL DEFAULT 0,
    total               DECIMAL(10,2)   NOT NULL DEFAULT 0,
    estado              VARCHAR(20)     NOT NULL DEFAULT 'COMPLETADA',
    CONSTRAINT fk_venta_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES cliente(id_cliente),
    CONSTRAINT fk_venta_empleado
        FOREIGN KEY (id_empleado)
        REFERENCES empleado(id_empleado)
);

CREATE TABLE detalle_venta (
    id_detalle_venta    SERIAL PRIMARY KEY,
    id_venta            INT             NOT NULL,
    id_producto         INT             NOT NULL,
    cantidad            INT             NOT NULL CHECK (cantidad > 0),
    precio_unitario     DECIMAL(10,2)   NOT NULL,
    descuento           DECIMAL(10,2)   NOT NULL DEFAULT 0,
    subtotal            DECIMAL(10,2)   NOT NULL,
    CONSTRAINT fk_detalle_venta_venta
        FOREIGN KEY (id_venta)
        REFERENCES venta(id_venta) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_venta_producto
        FOREIGN KEY (id_producto)
        REFERENCES producto(id_producto)
);

CREATE TABLE pago (
    id_pago             SERIAL PRIMARY KEY,
    id_venta            INT             NOT NULL,
    metodo              VARCHAR(30)     NOT NULL,
    monto               DECIMAL(10,2)   NOT NULL CHECK (monto > 0),
    fecha               TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pago_venta
        FOREIGN KEY (id_venta)
        REFERENCES venta(id_venta) ON DELETE CASCADE,
    CONSTRAINT chk_pago_metodo
        CHECK (metodo IN ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'MIXTO'))
);

CREATE INDEX idx_producto_categoria    ON producto(id_categoria);
CREATE INDEX idx_producto_codigo       ON producto(codigo_barras);
CREATE INDEX idx_venta_fecha           ON venta(fecha);
CREATE INDEX idx_venta_cliente         ON venta(id_cliente);
CREATE INDEX idx_compra_fecha          ON compra(fecha);
CREATE INDEX idx_compra_proveedor      ON compra(id_proveedor);
CREATE INDEX idx_pago_venta            ON pago(id_venta);
CREATE INDEX idx_pago_fecha            ON pago(fecha);
