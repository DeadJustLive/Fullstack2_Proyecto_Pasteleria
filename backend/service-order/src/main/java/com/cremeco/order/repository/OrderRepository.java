// @pca:start
// @id(backend.service_order.main.java.com.cremeco.order.repository.orderrepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (OrderRepository.java))
// @pca:end
package com.cremeco.order.repository;

import com.cremeco.order.model.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    Optional<OrderEntity> findByTrackingCodeIgnoreCase(String trackingCode);
    List<OrderEntity> findByEmailIgnoreCaseOrderByFechaDesc(String email);
    List<OrderEntity> findByUserIdOrderByFechaDesc(Long userId);
    List<OrderEntity> findAllByOrderByFechaDesc();
    boolean existsByTrackingCodeIgnoreCase(String trackingCode);
}
