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
