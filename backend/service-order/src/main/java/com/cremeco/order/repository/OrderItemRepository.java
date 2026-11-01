// @pca:start
// @id(backend.service_order.main.java.com.cremeco.order.repository.orderitemrepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (OrderItemRepository.java))
// @pca:end
package com.cremeco.order.repository;

import com.cremeco.order.model.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrderId(Long orderId);
}
