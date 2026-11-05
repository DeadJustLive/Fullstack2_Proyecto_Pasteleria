package com.cremeco.notification.seeder;

import com.cremeco.notification.model.ContactMessageEntity;
import com.cremeco.notification.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationDataSeeder implements CommandLineRunner {

    private final ContactMessageRepository contactMessageRepository;

    @Override
    public void run(String... args) {
        if (contactMessageRepository.count() > 0) {
            log.info("NotificationDataSeeder: Mensajes de contacto ya existen. Omitiendo seed.");
            return;
        }

        log.info("NotificationDataSeeder: Insertando mensajes de contacto de prueba en cremeco_db...");

        List<ContactMessageEntity> mensajes = List.of(
                ContactMessageEntity.builder()
                        .nombre("Gonzalo Valenzuela")
                        .email("gonzalo.v@example.cl")
                        .telefono("+56 9 8812 3456")
                        .motivo("Evento corporativo")
                        .mensaje("Hola equipo de Crème & Co, quisiéramos cotizar coffee break para 45 personas el próximo mes.")
                        .leido(false)
                        .fecha(LocalDateTime.now().minusDays(1))
                        .build(),
                ContactMessageEntity.builder()
                        .nombre("Francisca Morales")
                        .email("francisca.m@example.cl")
                        .telefono("+56 9 7723 9081")
                        .motivo("Consulta general")
                        .mensaje("¿Tienen opciones de tortas veganas para retiro en su sucursal de Providencia?")
                        .leido(true)
                        .fecha(LocalDateTime.now().minusDays(3))
                        .build()
        );

        contactMessageRepository.saveAll(mensajes);
        log.info("NotificationDataSeeder: 2 mensajes de contacto inicializados con éxito.");
    }
}
