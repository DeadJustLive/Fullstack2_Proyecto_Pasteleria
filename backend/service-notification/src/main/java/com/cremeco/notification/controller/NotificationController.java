package com.cremeco.notification.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    @PostMapping("/send")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, Object> data) {
        return ResponseEntity.ok(Map.of(
                "estado", "ENVIADO",
                "destinatario", data.get("email"),
                "asunto", data.get("asunto")
        ));
    }
}
