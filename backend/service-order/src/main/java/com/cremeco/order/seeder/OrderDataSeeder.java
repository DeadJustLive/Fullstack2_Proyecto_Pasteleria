package com.cremeco.order.seeder;

import com.cremeco.order.model.CustomQuoteEntity;
import com.cremeco.order.model.OrderEntity;
import com.cremeco.order.model.OrderItemEntity;
import com.cremeco.order.repository.CustomQuoteRepository;
import com.cremeco.order.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderDataSeeder implements CommandLineRunner {

    private final OrderRepository orderRepository;
    private final CustomQuoteRepository customQuoteRepository;

    @Override
    public void run(String... args) {
        if (orderRepository.count() > 0) {
            log.info("OrderDataSeeder: Datos de órdenes ya existen en MySQL cremeco_db. Omitiendo seed.");
            return;
        }

        log.info("OrderDataSeeder: Poblando órdenes y cotizaciones de prueba en MySQL cremeco_db...");

        // Pedido 1: Camila Silva
        OrderEntity o1 = OrderEntity.builder()
                .trackingCode("CC-1001")
                .userId(null)
                .cliente("Camila Silva")
                .email("camila@example.cl")
                .telefono("+56 9 8765 4321")
                .rut("18.432.198-7")
                .tipoEntrega("DELIVERY")
                .direccion("Av. Providencia 1234")
                .departamento("Depto 502")
                .region("Metropolitana de Santiago")
                .comuna("Providencia")
                .indicaciones("Dejar en conserjería si no respondo")
                .subtotal(46980L)
                .descuento(0L)
                .costoEnvio(0L)
                .iva(7501L) // 19%
                .total(46980L)
                .estado("EN_PREPARACION")
                .metodoPago("FLOW_WEBPAY")
                .flowOrder("FLOW-9001")
                .paymentToken("tok_sandbox_9001")
                .fecha(LocalDateTime.now().minusHours(3))
                .fechaEntregaEstimada("Hoy 17:00")
                .notas("Cliente solicita velitas de cumpleaños")
                .build();

        o1.addItem(OrderItemEntity.builder()
                .productId(1L)
                .nombre("Torta Ópera Francesa")
                .cantidad(1)
                .precio(24990L)
                .subtotal(24990L)
                .imagen("/imagen/Torta-Opera-Francesa.webp")
                .variacion("12-15 porciones")
                .build());

        o1.addItem(OrderItemEntity.builder()
                .productId(2L)
                .nombre("Cheesecake de Frutos Rojos")
                .cantidad(1)
                .precio(21990L)
                .subtotal(21990L)
                .imagen("/imagen/Cheesecake-de-Frutos-Rojos.webp")
                .variacion("10-12 porciones")
                .build());

        orderRepository.save(o1);

        // Pedido 2: Rodrigo Tapia (Retiro en tienda)
        OrderEntity o2 = OrderEntity.builder()
                .trackingCode("CC-1002")
                .userId(null)
                .cliente("Rodrigo Tapia")
                .email("rodrigo@example.cl")
                .telefono("+56 9 7654 3210")
                .rut("17.890.123-4")
                .tipoEntrega("RETIRO")
                .personaRetiroNombre("Rodrigo Tapia")
                .personaRetiroRut("17.890.123-4")
                .personaRetiroTelefono("+56 9 7654 3210")
                .subtotal(23990L)
                .descuento(0L)
                .costoEnvio(0L)
                .iva(3830L)
                .total(23990L)
                .estado("LISTO_RETIRO")
                .metodoPago("FLOW_SERVIPAG")
                .flowOrder("FLOW-9002")
                .paymentToken("tok_sandbox_9002")
                .fecha(LocalDateTime.now().minusHours(5))
                .fechaEntregaEstimada("Disponible inmediatamente")
                .build();

        o2.addItem(OrderItemEntity.builder()
                .productId(3L)
                .nombre("Torta Selva Negra Tradicional")
                .cantidad(1)
                .precio(23990L)
                .subtotal(23990L)
                .imagen("/imagen/Torta-Selva-Negra-Tradicional.webp")
                .variacion("12 porciones")
                .build());

        orderRepository.save(o2);

        // Pedido 3: María González (Cliente registrado con historial de compras)
        OrderEntity o3 = OrderEntity.builder()
                .trackingCode("CC-2025-001234")
                .userId(4L)
                .cliente("María González")
                .email("cliente@cremeco.cl")
                .telefono("+56 9 9123 4567")
                .rut("19.876.543-2")
                .tipoEntrega("DELIVERY")
                .direccion("Av. Providencia 1234")
                .departamento("Depto 402")
                .region("Metropolitana de Santiago")
                .comuna("Providencia")
                .indicaciones("Timbre 402, conserje don Juan")
                .subtotal(43980L)
                .descuento(4398L) // 10% cupón DULCE10
                .costoEnvio(0L)
                .iva(6320L)
                .total(39582L)
                .estado("ENTREGADO")
                .metodoPago("FLOW_WEBPAY")
                .flowOrder("FLOW-9003")
                .paymentToken("tok_sandbox_9003")
                .fecha(LocalDateTime.now().minusDays(5))
                .fechaEntregaEstimada("Entregado con éxito")
                .notas("Pedido para aniversario")
                .build();

        o3.addItem(OrderItemEntity.builder()
                .productId(1L)
                .nombre("Torta Ópera Francesa")
                .cantidad(1)
                .precio(24990L)
                .subtotal(24990L)
                .imagen("/imagen/Torta-Opera-Francesa.webp")
                .variacion("15 porciones")
                .build());

        o3.addItem(OrderItemEntity.builder()
                .productId(4L)
                .nombre("Tarta de Limón y Merengue")
                .cantidad(1)
                .precio(18990L)
                .subtotal(18990L)
                .imagen("/imagen/Tarta-de-Limon-y-Merengue.webp")
                .variacion("8-10 porciones")
                .build());

        orderRepository.save(o3);

        // Pedido 4: María González (En curso)
        OrderEntity o4 = OrderEntity.builder()
                .trackingCode("CC-2025-005678")
                .userId(4L)
                .cliente("María González")
                .email("cliente@cremeco.cl")
                .telefono("+56 9 9123 4567")
                .rut("19.876.543-2")
                .tipoEntrega("DELIVERY")
                .direccion("Av. Providencia 1234")
                .departamento("Depto 402")
                .region("Metropolitana de Santiago")
                .comuna("Providencia")
                .indicaciones("Llamar al llegar")
                .subtotal(21990L)
                .descuento(0L)
                .costoEnvio(0L)
                .iva(3511L)
                .total(21990L)
                .estado("EN_PREPARACION")
                .metodoPago("FLOW_WEBPAY")
                .flowOrder("FLOW-9004")
                .paymentToken("tok_sandbox_9004")
                .fecha(LocalDateTime.now().minusHours(1))
                .fechaEntregaEstimada("Hoy 18:30")
                .build();

        o4.addItem(OrderItemEntity.builder()
                .productId(2L)
                .nombre("Cheesecake de Frutos Rojos")
                .cantidad(1)
                .precio(21990L)
                .subtotal(21990L)
                .imagen("/imagen/Cheesecake-de-Frutos-Rojos.webp")
                .variacion("10-12 porciones")
                .build());

        orderRepository.save(o4);

        // Cotización personalizada de prueba
        CustomQuoteEntity q1 = CustomQuoteEntity.builder()
                .clienteNombre("María González")
                .email("cliente@cremeco.cl")
                .telefono("+56 9 9123 4567")
                .tipoEvento("Cumpleaños Infantil")
                .porciones(30)
                .saborBizcocho("Vainilla y Manjar")
                .relleno("Frambuesa natural y crema diplomática")
                .cubierta("Buttercream suizo degradé")
                .tematica("Bosque Encantado")
                .detalles("Sin frutos secos por alergia de una invitada")
                .fechaEvento("2026-11-15")
                .estado("PRESUPUESTADA")
                .montoEstimado(65000L)
                .fecha(LocalDateTime.now().minusDays(2))
                .build();

        customQuoteRepository.save(q1);

        log.info("OrderDataSeeder: 4 pedidos y 1 cotización inicializados correctamente.");
    }
}
