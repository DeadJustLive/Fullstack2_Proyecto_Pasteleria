// @pca:start
// @id(backend.service_inventory.main.java.com.cremeco.inventory.repository.kardexmovementrepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (KardexMovementRepository.java))
// @pca:end
package com.cremeco.inventory.repository;

import com.cremeco.inventory.model.KardexMovementEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KardexMovementRepository extends JpaRepository<KardexMovementEntity, Long> {
    List<KardexMovementEntity> findAllByOrderByFechaDesc();
    List<KardexMovementEntity> findByProductoIdOrderByFechaDesc(Long productoId);
}
