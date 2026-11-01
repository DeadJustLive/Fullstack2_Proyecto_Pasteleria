// @pca:start
// @id(backend.service_catalog.main.java.com.cremeco.catalog.repository.promotionrepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (PromotionRepository.java))
// @pca:end
package com.cremeco.catalog.repository;

import com.cremeco.catalog.model.PromotionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PromotionRepository extends JpaRepository<PromotionEntity, Long> {
    Optional<PromotionEntity> findByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCase(String codigo);
}
