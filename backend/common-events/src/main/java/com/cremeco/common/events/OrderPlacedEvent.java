// @pca:start
// @id(backend.common_events.main.java.com.cremeco.common.events.orderplacedevent)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (OrderPlacedEvent.java))
// @pca:end
package com.cremeco.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderPlacedEvent implements Serializable {
    private Long orderId;
    private String orderNumber; // Ej: #CC-2025-001234
    private Long customerId;
    private String customerEmail;
    private String customerName;
    private String customerRut;
    private Long totalAmountClp;
    private List<OrderItemDetail> items;
    private LocalDateTime placedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDetail implements Serializable {
        private Long productId;
        private String productName;
        private Integer quantity;
        private String portion;
        private Long unitPriceClp;
        private Long subtotalClp;
    }
}
