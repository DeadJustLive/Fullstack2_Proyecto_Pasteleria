// @pca:start
// @id(backend.service_inventory.main.java.com.cremeco.inventory.repository.inventoryitemrepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (InventoryItemRepository.java))
// @pca:end
package com.cremeco.inventory.repository;

import com.cremeco.inventory.model.InventoryItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItemEntity, Long> {
    Optional<InventoryItemEntity> findByProductoId(Long productoId);
    List<InventoryItemEntity> findByEstadoSemaforo(String estadoSemaforo);
    List<InventoryItemEntity> findByStockActualLessThanEqual(Integer umbral);
}
