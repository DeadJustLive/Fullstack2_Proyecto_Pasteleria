package com.cremeco.catalog.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "blog_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BlogPostEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 200)
    private String titulo;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String extracto;

    @Column(name = "contenido_json", columnDefinition = "LONGTEXT", nullable = false)
    private String contenidoJson; // Párrafos separados por |||

    @Column(nullable = false, length = 100)
    private String autor;

    @Column(nullable = false, length = 50)
    private String categoria;

    @Column(nullable = false, length = 255)
    private String imagen;

    @Column(name = "tiempo_lectura", length = 30)
    private String tiempoLectura;

    @Column(length = 30)
    private String fecha;
}
