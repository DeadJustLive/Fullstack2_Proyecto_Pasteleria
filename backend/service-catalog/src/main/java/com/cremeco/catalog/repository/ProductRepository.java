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
