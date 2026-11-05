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
