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
