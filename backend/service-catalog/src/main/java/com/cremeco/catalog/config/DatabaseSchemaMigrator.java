// @pca:start
// @id(backend.service_catalog.config.database_migrator)
// @kind(component)
// @limit(lines: 80)
// @desc(Asegura que la columna products.imagen sea MEDIUMTEXT en bases de datos existentes)
// @pca:end
package com.cremeco.catalog.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseSchemaMigrator {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void ensureImageColumnType() {
        try {
            String checkSql = "SELECT COLUMN_TYPE FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'imagen'";
            List<String> types = jdbcTemplate.query(checkSql, (rs, rowNum) -> rs.getString("COLUMN_TYPE"));
            if (!types.isEmpty()) {
                String currentType = types.get(0).toLowerCase();
                if (!currentType.contains("mediumtext") && !currentType.contains("longtext")) {
                    log.info("Migrando columna products.imagen de {} a MEDIUMTEXT...", currentType);
                    jdbcTemplate.execute("ALTER TABLE products MODIFY imagen MEDIUMTEXT NOT NULL");
                    log.info("Migración de columna products.imagen a MEDIUMTEXT completada con éxito.");
                }
            }
        } catch (Exception e) {
            log.warn("No se pudo verificar/migrar la columna products.imagen automáticamente: {}", e.getMessage());
        }
    }
}
