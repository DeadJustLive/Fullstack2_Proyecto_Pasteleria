package com.cremeco.catalog.controller;

import com.cremeco.catalog.model.BlogPostEntity;
import com.cremeco.catalog.model.CategoryEntity;
import com.cremeco.catalog.model.ProductEntity;
import com.cremeco.catalog.model.PromotionEntity;
import com.cremeco.catalog.repository.BlogPostRepository;
import com.cremeco.catalog.repository.CategoryRepository;
import com.cremeco.catalog.repository.ProductRepository;
import com.cremeco.catalog.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PromotionRepository promotionRepository;
    private final BlogPostRepository blogPostRepository;

    // ==========================================
    // PRODUCTOS
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<List<ProductEntity>> listProducts(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) Boolean enOferta,
            @RequestParam(required = false) Boolean destacado
    ) {
        if (categoria != null && !categoria.isBlank()) {
            return ResponseEntity.ok(productRepository.findByCategoriaIgnoreCase(categoria));
        }
        if (Boolean.TRUE.equals(enOferta)) {
            return ResponseEntity.ok(productRepository.findByEnOfertaTrue());
        }
        if (Boolean.TRUE.equals(destacado)) {
            return ResponseEntity.ok(productRepository.findByDestacadoTrue());
        }
        return ResponseEntity.ok(productRepository.findAll());
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "NOT_FOUND", "mensaje", "Producto no encontrado con ID: " + id)));
    }

    @GetMapping("/products/critical")
    public ResponseEntity<List<ProductEntity>> listCriticalProducts() {
        // Retorna productos cuyo stock es menor o igual a su stock mínimo
        List<ProductEntity> all = productRepository.findAll();
        List<ProductEntity> criticos = all.stream()
                .filter(p -> p.getStock() <= (p.getStockMinimo() != null ? p.getStockMinimo() : 5))
                .toList();
        return ResponseEntity.ok(criticos);
    }

    @GetMapping("/products/offers")
    public ResponseEntity<List<ProductEntity>> listOffers() {
        return ResponseEntity.ok(productRepository.findByEnOfertaTrue());
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody ProductEntity product) {
        if (product.getVentasHistoricas() == null) product.setVentasHistoricas(0);
        if (product.getDisponible() == null) product.setDisponible(true);
        if (product.getDestacado() == null) product.setDestacado(false);
        if (product.getEnOferta() == null) product.setEnOferta(false);
        if (product.getStockMinimo() == null) product.setStockMinimo(5);
        if (product.getStock() == null) product.setStock(0);

        ProductEntity saved = productRepository.save(product);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody ProductEntity product) {
        return productRepository.findById(id).<ResponseEntity<?>>map(existing -> {
            if (product.getNombre() != null) existing.setNombre(product.getNombre());
            if (product.getDescripcion() != null) existing.setDescripcion(product.getDescripcion());
            if (product.getPrecio() != null) existing.setPrecio(product.getPrecio());
            if (product.getPrecioAnterior() != null) existing.setPrecioAnterior(product.getPrecioAnterior());
            if (product.getEnOferta() != null) existing.setEnOferta(product.getEnOferta());
            if (product.getCategoria() != null) existing.setCategoria(product.getCategoria());
            if (product.getCategoriasCsv() != null) existing.setCategoriasCsv(product.getCategoriasCsv());
            if (product.getVariacionesCsv() != null) existing.setVariacionesCsv(product.getVariacionesCsv());
            if (product.getPorciones() != null) existing.setPorciones(product.getPorciones());
            if (product.getImagen() != null) existing.setImagen(product.getImagen());
            if (product.getBadge() != null) existing.setBadge(product.getBadge());
            if (product.getDestacado() != null) existing.setDestacado(product.getDestacado());
            if (product.getDisponible() != null) existing.setDisponible(product.getDisponible());
            if (product.getStock() != null) existing.setStock(product.getStock());
            if (product.getStockMinimo() != null) existing.setStockMinimo(product.getStockMinimo());

            ProductEntity updated = productRepository.save(existing);
            return ResponseEntity.ok(updated);
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Producto no encontrado")));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        Optional<ProductEntity> opt = productRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "NOT_FOUND", "mensaje", "Producto no encontrado"));
        }

        ProductEntity p = opt.get();
        int ventas = p.getVentasHistoricas() != null ? p.getVentasHistoricas() : 0;

        // Regla dura de negocio: No se pueden eliminar productos con ventas históricas
        if (ventas > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "INTEGRIDAD_REFERENCIAL",
                    "mensaje", "No es posible eliminar productos con ventas históricas registradas (" + ventas + " ventas). Puedes pausar su disponibilidad en su lugar."
            ));
        }

        productRepository.delete(p);
        return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado correctamente", "id", id));
    }

    // ==========================================
    // CATEGORÍAS
    // ==========================================

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryEntity>> listCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/categories/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id) {
        return categoryRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "NOT_FOUND", "mensaje", "Categoría no encontrada")));
    }

    @GetMapping("/categories/slug/{slug}")
    public ResponseEntity<?> getCategoryBySlug(@PathVariable String slug) {
        return categoryRepository.findBySlugIgnoreCase(slug)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "NOT_FOUND", "mensaje", "Categoría no encontrada para slug: " + slug)));
    }

    @PostMapping("/categories")
    public ResponseEntity<?> createCategory(@RequestBody CategoryEntity category) {
        if (categoryRepository.existsBySlugIgnoreCase(category.getSlug())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "SLUG_DUPLICADO", "mensaje", "Ya existe una categoría con el slug: " + category.getSlug()));
        }
        if (category.getActivo() == null) category.setActivo(true);
        CategoryEntity saved = categoryRepository.save(category);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryEntity category) {
        return categoryRepository.findById(id).<ResponseEntity<?>>map(existing -> {
            if (category.getNombre() != null) existing.setNombre(category.getNombre());
            if (category.getSlug() != null) existing.setSlug(category.getSlug());
            if (category.getDescripcion() != null) existing.setDescripcion(category.getDescripcion());
            if (category.getImagen() != null) existing.setImagen(category.getImagen());
            if (category.getActivo() != null) existing.setActivo(category.getActivo());
            return ResponseEntity.ok(categoryRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Categoría no encontrada")));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).<ResponseEntity<?>>map(existing -> {
            categoryRepository.delete(existing);
            return ResponseEntity.ok(Map.of("mensaje", "Categoría eliminada", "id", id));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Categoría no encontrada")));
    }

    // ==========================================
    // PROMOCIONES
    // ==========================================

    @GetMapping("/promotions")
    public ResponseEntity<List<PromotionEntity>> listPromotions() {
        return ResponseEntity.ok(promotionRepository.findAll());
    }

    @PostMapping("/promotions")
    public ResponseEntity<?> createPromotion(@RequestBody PromotionEntity promotion) {
        if (promotion.getCodigo() != null && promotionRepository.existsByCodigoIgnoreCase(promotion.getCodigo())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "CODIGO_DUPLICADO", "mensaje", "Ya existe una promoción con ese código"));
        }
        if (promotion.getUsosActuales() == null) promotion.setUsosActuales(0);
        if (promotion.getActivo() == null) promotion.setActivo(true);
        PromotionEntity saved = promotionRepository.save(promotion);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // ==========================================
    // BLOGS
    // ==========================================

    @GetMapping("/blogs")
    public ResponseEntity<List<BlogPostEntity>> listBlogs() {
        return ResponseEntity.ok(blogPostRepository.findAll());
    }

    @GetMapping("/blogs/{id}")
    public ResponseEntity<?> getBlogById(@PathVariable Long id) {
        return blogPostRepository.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "NOT_FOUND", "mensaje", "Artículo no encontrado")));
    }

    @GetMapping("/blogs/slug/{slug}")
    public ResponseEntity<?> getBlogBySlug(@PathVariable String slug) {
        return blogPostRepository.findBySlugIgnoreCase(slug)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("error", "NOT_FOUND", "mensaje", "Artículo no encontrado para slug: " + slug)));
    }

    @PostMapping("/blogs")
    public ResponseEntity<?> createBlog(@RequestBody BlogPostEntity blog) {
        BlogPostEntity saved = blogPostRepository.save(blog);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
