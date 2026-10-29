package com.cremeco.inventory.seeder;

import com.cremeco.inventory.model.InventoryItemEntity;
import com.cremeco.inventory.model.KardexMovementEntity;
import com.cremeco.inventory.repository.InventoryItemRepository;
import com.cremeco.inventory.repository.KardexMovementRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InventoryDataSeeder implements CommandLineRunner {

    private final InventoryItemRepository inventoryItemRepository;
    private final KardexMovementRepository kardexMovementRepository;

    @Override
    public void run(String... args) {
        if (inventoryItemRepository.count() > 0) {
            log.info("InventoryDataSeeder: Datos de inventario ya existen en MySQL. Omitiendo seed.");
            return;
        }

        log.info("InventoryDataSeeder: Poblando inventario base y movimientos Kardex en cremeco_db...");

        List<InventoryItemEntity> items = List.of(
                InventoryItemEntity.builder()
                        .productoId(1L)
                        .nombre("Torta Ópera Francesa")
                        .categoria("tortas")
                        .stockActual(8)
                        .stockMinimo(5)
                        .unidadMedida("unidades")
                        .build(),
                InventoryItemEntity.builder()
                        .productoId(2L)
                        .nombre("Cheesecake de Frutos Rojos")
                        .categoria("tortas")
                        .stockActual(12)
                        .stockMinimo(5)
                        .unidadMedida("unidades")
                        .build(),
                InventoryItemEntity.builder()
                        .productoId(3L)
                        .nombre("Torta Selva Negra Tradicional")
                        .categoria("tortas")
                        .stockActual(3)
                        .stockMinimo(5)
                        .unidadMedida("unidades")
                        .build(),
                InventoryItemEntity.builder()
                        .productoId(4L)
                        .nombre("Tarta de Limón y Merengue")
                        .categoria("tartas")
                        .stockActual(15)
                        .stockMinimo(6)
                        .unidadMedida("unidades")
                        .build(),
                InventoryItemEntity.builder()
                        .productoId(5L)
                        .nombre("Croissant de Mantequilla")
                        .categoria("bolleria")
                        .stockActual(25)
                        .stockMinimo(10)
                        .unidadMedida("unidades")
                        .build(),
                InventoryItemEntity.builder()
                        .productoId(6L)
                        .nombre("Torta Milhojas Manjar Nuez")
                        .categoria("tortas")
                        .stockActual(1)
                        .stockMinimo(4)
                        .unidadMedida("unidades")
                        .build(),
                InventoryItemEntity.builder()
                        .productoId(7L)
                        .nombre("Galletas Craqueladas de Chocolate")
                        .categoria("bolleria")
                        .stockActual(0)
                        .stockMinimo(10)
                        .unidadMedida("bolsas")
                        .build()
        );

        items.forEach(inventoryItemRepository::save);

        // Movimientos Kardex iniciales
        List<KardexMovementEntity> movimientos = List.of(
                KardexMovementEntity.builder()
                        .productoId(1L)
                        .productoNombre("Torta Ópera Francesa")
                        .tipo("INGRESO_COCINA")
                        .cantidad(10)
                        .saldo(10)
                        .motivo("Horneado de lote matutino")
                        .usuario("cocina@cremeco.cl")
                        .fecha(LocalDateTime.now().minusHours(8))
                        .build(),
                KardexMovementEntity.builder()
                        .productoId(1L)
                        .productoNombre("Torta Ópera Francesa")
                        .tipo("VENTA_ONLINE")
                        .cantidad(-1)
                        .saldo(9)
                        .motivo("Pedido web #CC-1001")
                        .usuario("sistema")
                        .fecha(LocalDateTime.now().minusHours(3))
                        .build(),
                KardexMovementEntity.builder()
                        .productoId(1L)
                        .productoNombre("Torta Ópera Francesa")
                        .tipo("VENTA_POS")
                        .cantidad(-1)
                        .saldo(8)
                        .motivo("Venta en local Mostrador")
                        .usuario("pasteleria@cremeco.cl")
                        .boleta("B-883912A0")
                        .fecha(LocalDateTime.now().minusHours(2))
                        .build(),
                KardexMovementEntity.builder()
                        .productoId(5L)
                        .productoNombre("Croissant de Mantequilla")
                        .tipo("MERMA")
                        .cantidad(-2)
                        .saldo(25)
                        .motivo("Quebrado en horneado")
                        .usuario("cocina@cremeco.cl")
                        .fecha(LocalDateTime.now().minusHours(4))
                        .build(),
                KardexMovementEntity.builder()
                        .productoId(6L)
                        .productoNombre("Torta Milhojas Manjar Nuez")
                        .tipo("VENTA_POS")
                        .cantidad(-3)
                        .saldo(1)
                        .motivo("Venta mesa salón de té")
                        .usuario("pasteleria@cremeco.cl")
                        .boleta("B-1290EF45")
                        .fecha(LocalDateTime.now().minusHours(1))
                        .build()
        );

        kardexMovementRepository.saveAll(movimientos);

        log.info("InventoryDataSeeder: 7 ítems de inventario y 5 movimientos de Kardex insertados.");
    }
}
