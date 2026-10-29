package com.cremeco.identity.seeder;

import com.cremeco.identity.model.RoleEntity;
import com.cremeco.identity.model.UserEntity;
import com.cremeco.identity.repository.RoleRepository;
import com.cremeco.identity.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class IdentityDataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) {
        seedRoles();
        seedUsers();
    }

    private void seedRoles() {
        if (roleRepository.count() == 0) {
            log.info("Sembrando roles iniciales en cremeco_db...");
            roleRepository.saveAll(List.of(
                    new RoleEntity("ADMIN_GENERAL", "Administrador Total", "ALL,DASHBOARD,CATALOG,ORDERS,INVENTORY,POS,USERS,REPORTS"),
                    new RoleEntity("JEFE_COCINA", "Jefe de Cocina", "ORDERS_STATUS,INVENTORY_MERMA,CATALOG_VIEW"),
                    new RoleEntity("CAJERO_MOSTRADOR", "Cajero POS", "POS_SALE,ORDERS_VIEW,ORDERS_STATUS"),
                    new RoleEntity("CLIENTE", "Cliente Tienda", "ORDER_CREATE,PROFILE_EDIT,ORDER_TRACKING")
            ));
        }
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            log.info("Sembrando usuarios iniciales con contraseñas BCrypt en cremeco_db...");

            String hashAdmin = passwordEncoder.encode("Admin2026!");
            String hashUser = passwordEncoder.encode("Pasteleria2026!");

            userRepository.saveAll(List.of(
                    UserEntity.builder()
                            .nombre("Camila")
                            .apellidos("Silva")
                            .rut("11.111.111-1")
                            .email("admin@cremeco.cl")
                            .passwordHash(hashAdmin)
                            .telefono("+56 9 8765 4321")
                            .calle("Av. Providencia 1234")
                            .departamento("Depto 402")
                            .region("RM")
                            .comuna("Providencia")
                            .rol("ADMIN_GENERAL")
                            .estado("ACTIVO")
                            .createdAt(LocalDateTime.now())
                            .ultimoAcceso(LocalDateTime.now())
                            .build(),

                    UserEntity.builder()
                            .nombre("Rodrigo")
                            .apellidos("Tapia")
                            .rut("12.222.222-2")
                            .email("pastelero@cremeco.cl")
                            .passwordHash(hashUser)
                            .telefono("+56 9 7654 3210")
                            .calle("Av. Las Condes 567")
                            .departamento("")
                            .region("RM")
                            .comuna("Las Condes")
                            .rol("JEFE_COCINA")
                            .estado("ACTIVO")
                            .createdAt(LocalDateTime.now())
                            .ultimoAcceso(LocalDateTime.now())
                            .build(),

                    UserEntity.builder()
                            .nombre("Francisca")
                            .apellidos("Morales")
                            .rut("13.333.333-3")
                            .email("ventas@cremeco.cl")
                            .passwordHash(hashUser)
                            .telefono("+56 9 6543 2109")
                            .calle("Av. Vitacura 890")
                            .departamento("Local 12")
                            .region("RM")
                            .comuna("Vitacura")
                            .rol("CAJERO_MOSTRADOR")
                            .estado("ACTIVO")
                            .createdAt(LocalDateTime.now())
                            .ultimoAcceso(LocalDateTime.now())
                            .build(),

                    UserEntity.builder()
                            .nombre("Constanza")
                            .apellidos("Gómez")
                            .rut("14.444.444-4")
                            .email("cliente@cremeco.cl")
                            .passwordHash(hashUser)
                            .telefono("+56 9 5432 1098")
                            .calle("Av. Pocuro 2100")
                            .departamento("Casa B")
                            .region("RM")
                            .comuna("Providencia")
                            .rol("CLIENTE")
                            .estado("ACTIVO")
                            .createdAt(LocalDateTime.now())
                            .ultimoAcceso(LocalDateTime.now())
                            .build(),

                    UserEntity.builder()
                            .nombre("María")
                            .apellidos("González Pérez")
                            .rut("12.345.678-5")
                            .email("maria.gonzalez@email.com")
                            .passwordHash(hashUser)
                            .telefono("+56 9 1234 5678")
                            .calle("Av. Providencia 1234")
                            .departamento("Depto 501")
                            .region("RM")
                            .comuna("Providencia")
                            .rol("CLIENTE")
                            .estado("ACTIVO")
                            .createdAt(LocalDateTime.now().minusMonths(6))
                            .ultimoAcceso(LocalDateTime.now())
                            .build()
            ));
            log.info("5 usuarios de prueba creados exitosamente en MySQL.");
        }
    }
}
