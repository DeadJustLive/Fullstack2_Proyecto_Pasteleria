package com.cremeco.notification.controller;

import com.cremeco.notification.model.ContactMessageEntity;
import com.cremeco.notification.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class NotificationController {

    private final ContactMessageRepository contactMessageRepository;

    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> data) {
        log.info("Notificación enviada a: {} | Asunto: {}", data.get("email"), data.get("asunto"));
        return ResponseEntity.ok(Map.of(
                "estado", "ENVIADO",
                "destinatario", data.get("email"),
                "asunto", data.get("asunto"),
                "fecha", LocalDateTime.now().toString()
        ));
    }

    @PostMapping("/contact")
    public ResponseEntity<?> createContactMessage(@RequestBody ContactMessageEntity contactMessage) {
        if (contactMessage.getFecha() == null) {
            contactMessage.setFecha(LocalDateTime.now());
        }
        if (contactMessage.getLeido() == null) {
            contactMessage.setLeido(false);
        }

        ContactMessageEntity saved = contactMessageRepository.save(contactMessage);
        log.info("Nuevo mensaje de contacto recibido de: {} ({})", saved.getNombre(), saved.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/contact")
    public ResponseEntity<List<ContactMessageEntity>> listContactMessages() {
        return ResponseEntity.ok(contactMessageRepository.findAllByOrderByFechaDesc());
    }

    @PutMapping("/contact/{id}/read")
    public ResponseEntity<?> markMessageAsRead(@PathVariable Long id) {
        return contactMessageRepository.findById(id).<ResponseEntity<?>>map(msg -> {
            msg.setLeido(true);
            ContactMessageEntity updated = contactMessageRepository.save(msg);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Mensaje no encontrado")));
    }
}
