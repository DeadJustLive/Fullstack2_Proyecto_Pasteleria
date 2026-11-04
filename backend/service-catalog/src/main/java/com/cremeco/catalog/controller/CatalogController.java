// @pca:start
// @id(backend.service_catalog.main.java.com.cremeco.catalog.controller.catalogcontroller)
// @kind(controller)
// @limit(lines: 350)
// @relates(backend.service_catalog.service.catalogservice)
// @desc(Controlador REST del catalogo con endpoints publicos, administracion y diagnostico de Redis)
// @pca:end
package com.cremeco.catalog.controller;

import com.cremeco.catalog.model.BlogPostEntity;
import com.cremeco.catalog.model.CategoryEntity;
import com.cremeco.catalog.model.ProductEntity;
import com.cremeco.catalog.model.PromotionEntity;
import com.cremeco.catalog.repository.BlogPostRepository;
import com.cremeco.catalog.repository.CategoryRepository;
import com.cremeco.catalog.repository.ProductRepository;
import com.cremeco.catalog.repository.PromotionRepository;
import com.cremeco.catalog.service.CatalogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Slf4j
@RestController
@RequestMapping("/api/catalog")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CatalogController {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PromotionRepository promotionRepository;
    private final BlogPostRepository blogPostRepository;
    private final CatalogService catalogService;
    private final RedisTemplate<String, Object> redisTemplate;

    @Value("${spring.data.redis.host:localhost}")
    private String redisHost;

    @Value("${spring.data.redis.port:6379}")
    private int redisPort;

    // ==========================================
    // DIAGNÓSTICO REDIS (:6379)
    // ==========================================

    @GetMapping("/health/redis")
    public ResponseEntity<Map<String, Object>> checkRedisHealth() {
        Map<String, Object> resp = new LinkedHashMap<>();
        resp.put("host", redisHost);
        resp.put("port", redisPort);
        try {
            if (redisTemplate != null && redisTemplate.getConnectionFactory() != null) {
                String ping = redisTemplate.getConnectionFactory().getConnection().ping();
                boolean isUp = "PONG".equalsIgnoreCase(ping);
                resp.put("redis", isUp ? "UP" : "DOWN");
                resp.put("ping", ping);
                return ResponseEntity.status(isUp ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(resp);
            } else {
                resp.put("redis", "DOWN");
                resp.put("error", "RedisTemplate o ConnectionFactory no disponible");
                return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(resp);
            }
        } catch (Exception e) {
            log.warn("Fallo comprobacion de salud Redis en service-catalog: {}", e.getMessage());
            resp.put("redis", "DOWN");
            resp.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(resp);
        }
    }

    // ==========================================
    // PRODUCTOS (CON CACHÉ REDIS ACTIVA)
    // ==========================================

    @GetMapping("/products")
    public ResponseEntity<List<ProductEntity>> listProducts(
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) Boolean enOferta,
            @RequestParam(required = false) Boolean destacado
    ) {
        return ResponseEntity.ok(catalogService.getProducts(categoria, enOferta, destacado));
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
        List<ProductEntity> all = productRepository.findAll();
        List<ProductEntity> criticos = all.stream()
                .filter(p -> p.getStock() <= (p.getStockMinimo() != null ? p.getStockMinimo() : 5))
                .toList();
        return ResponseEntity.ok(criticos);
    }

    @GetMapping("/products/offers")
    public ResponseEntity<List<ProductEntity>> listOffers() {
        return ResponseEntity.ok(catalogService.getOffers());
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody ProductEntity product) {
        if (product.getVentasHistoricas() == null) product.setVentasHistoricas(0);
        if (product.getDisponible() == null) product.setDisponible(true);
        if (product.getDestacado() == null) product.setDestacado(false);
        if (product.getEnOferta() == null) product.setEnOferta(false);
        if (product.getStockMinimo() == null) product.setStockMinimo(5);
        if (product.getStock() == null) product.setStock(0);

        ProductEntity saved = catalogService.createProduct(product);
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

            ProductEntity updated = catalogService.updateProduct(existing);
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
        if (ventas > 0) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "error", "INTEGRIDAD_REFERENCIAL",
                    "mensaje", "No es posible eliminar productos con ventas históricas registradas (" + ventas + " ventas). Puedes pausar su disponibilidad en su lugar."
            ));
        }

        catalogService.deleteProduct(p);
        return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado correctamente", "id", id));
    }

    @PostMapping("/products/{id}/deduct-stock")
    public ResponseEntity<?> deductStock(@PathVariable Long id, @RequestParam(defaultValue = "1") int cantidad) {
        try {
            ProductEntity updated = catalogService.deductStock(id, cantidad);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "NOT_FOUND", "mensaje", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "STOCK_INSUFICIENTE", "mensaje", e.getMessage()));
        }
    }

    @PostMapping("/cache/evict")
    public ResponseEntity<?> evictCache() {
        catalogService.evictAllCache();
        return ResponseEntity.ok(Map.of("status", "OK", "mensaje", "Caché Redis de catálogo invalidada exitosamente"));
    }

    // ==========================================
    // CATEGORÍAS (CON CACHÉ REDIS ACTIVA)
    // ==========================================

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryEntity>> listCategories() {
        return ResponseEntity.ok(catalogService.getCategories());
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
        CategoryEntity saved = catalogService.createCategory(category);
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
            return ResponseEntity.ok(catalogService.updateCategory(existing));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Categoría no encontrada")));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id) {
        return categoryRepository.findById(id).<ResponseEntity<?>>map(existing -> {
            catalogService.deleteCategory(existing);
            return ResponseEntity.ok(Map.of("mensaje", "Categoría eliminada", "id", id));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Categoría no encontrada")));
    }

    // ==========================================
    // PROMOCIONES Y BLOGS
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

    @PutMapping("/promotions/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @RequestBody PromotionEntity promotion) {
        return promotionRepository.findById(id).<ResponseEntity<?>>map(existing -> {
            if (promotion.getCodigo() != null) existing.setCodigo(promotion.getCodigo());
            if (promotion.getTipo() != null) existing.setTipo(promotion.getTipo());
            if (promotion.getDescuentoPorcentaje() != null) existing.setDescuentoPorcentaje(promotion.getDescuentoPorcentaje());
            if (promotion.getValor() != null) existing.setValor(promotion.getValor());
            if (promotion.getMinimoCompra() != null) existing.setMinimoCompra(promotion.getMinimoCompra());
            if (promotion.getUsosActuales() != null) existing.setUsosActuales(promotion.getUsosActuales());
            if (promotion.getLimiteUsos() != null) existing.setLimiteUsos(promotion.getLimiteUsos());
            if (promotion.getExpira() != null) existing.setExpira(promotion.getExpira());
            if (promotion.getActivo() != null) existing.setActivo(promotion.getActivo());
            if (promotion.getDescripcion() != null) existing.setDescripcion(promotion.getDescripcion());
            return ResponseEntity.ok(promotionRepository.save(existing));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Promoción no encontrada")));
    }

    @DeleteMapping("/promotions/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        return promotionRepository.findById(id).<ResponseEntity<?>>map(existing -> {
            promotionRepository.delete(existing);
            return ResponseEntity.ok(Map.of("mensaje", "Promoción eliminada", "id", id));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "NOT_FOUND", "mensaje", "Promoción no encontrada")));
    }

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
