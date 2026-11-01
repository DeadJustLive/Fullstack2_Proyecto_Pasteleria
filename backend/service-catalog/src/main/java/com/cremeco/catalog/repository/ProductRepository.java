// @pca:start
// @id(backend.service_catalog.main.java.com.cremeco.catalog.repository.productrepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (ProductRepository.java))
// @pca:end
package com.cremeco.catalog.repository;

import com.cremeco.catalog.model.ProductEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<ProductEntity, Long> {
    List<ProductEntity> findByCategoriaIgnoreCase(String categoria);
    List<ProductEntity> findByEnOfertaTrue();
    List<ProductEntity> findByDestacadoTrue();
    List<ProductEntity> findByStockLessThanEqual(Integer stockUmbral);
}
