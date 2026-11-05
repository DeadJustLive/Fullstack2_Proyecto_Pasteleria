package com.cremeco.catalog.service;

import com.cremeco.catalog.model.CategoryEntity;
import com.cremeco.catalog.model.ProductEntity;
import com.cremeco.catalog.repository.CategoryRepository;
import com.cremeco.catalog.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CatalogService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Cacheable(value = "catalog_products", key = "(#categoria != null ? #categoria : 'all') + '-' + (#enOferta != null ? #enOferta : 'all') + '-' + (#destacado != null ? #destacado : 'all')")
    public List<ProductEntity> getProducts(String categoria, Boolean enOferta, Boolean destacado) {
        log.info("Consultando BD de productos (cache miss o primera consulta): categoria={}, enOferta={}, destacado={}",
                categoria, enOferta, destacado);
        if (categoria != null && !categoria.isBlank()) {
            return productRepository.findByCategoriaIgnoreCase(categoria);
        }
        if (Boolean.TRUE.equals(enOferta)) {
            return productRepository.findByEnOfertaTrue();
        }
        if (Boolean.TRUE.equals(destacado)) {
            return productRepository.findByDestacadoTrue();
        }
        return productRepository.findAll();
    }

    @Cacheable(value = "catalog_offers", key = "'all'")
    public List<ProductEntity> getOffers() {
        log.info("Consultando BD de productos en oferta (cache miss o primera consulta)");
        return productRepository.findByEnOfertaTrue();
    }

    @Cacheable(value = "catalog_categories", key = "'all'")
    public List<CategoryEntity> getCategories() {
        log.info("Consultando BD de categorias (cache miss o primera consulta)");
        return categoryRepository.findAll();
    }

    @CacheEvict(value = {"catalog_products", "catalog_offers"}, allEntries = true)
    public ProductEntity createProduct(ProductEntity product) {
        log.info("Creando producto e invalidando cache de productos y ofertas: {}", product.getNombre());
        return productRepository.save(product);
    }

    @CacheEvict(value = {"catalog_products", "catalog_offers"}, allEntries = true)
    public ProductEntity updateProduct(ProductEntity product) {
        log.info("Actualizando producto e invalidando cache de productos y ofertas ID: {}", product.getId());
        return productRepository.save(product);
    }

    @CacheEvict(value = {"catalog_products", "catalog_offers"}, allEntries = true)
    public void deleteProduct(ProductEntity product) {
        log.info("Eliminando producto e invalidando cache de productos y ofertas ID: {}", product.getId());
        productRepository.delete(product);
    }

    @CacheEvict(value = "catalog_categories", allEntries = true)
    public CategoryEntity createCategory(CategoryEntity category) {
        log.info("Creando categoria e invalidando cache de categorias: {}", category.getNombre());
        return categoryRepository.save(category);
    }

    @CacheEvict(value = "catalog_categories", allEntries = true)
    public CategoryEntity updateCategory(CategoryEntity category) {
        log.info("Actualizando categoria e invalidando cache de categorias ID: {}", category.getId());
        return categoryRepository.save(category);
    }

    @CacheEvict(value = "catalog_categories", allEntries = true)
    public void deleteCategory(CategoryEntity category) {
        log.info("Eliminando categoria e invalidando cache de categorias ID: {}", category.getId());
        categoryRepository.delete(category);
    }

    @CacheEvict(value = {"catalog_products", "catalog_offers"}, allEntries = true)
    public void evictAllCache() {
        log.info("Invalidacion manual de cache Redis de productos y ofertas");
    }

    @CacheEvict(value = {"catalog_products", "catalog_offers"}, allEntries = true)
    public ProductEntity deductStock(Long productId, int quantity) {
        log.info("Descontando stock en service-catalog para producto ID {}: cantidad={}", productId, quantity);
        ProductEntity prod = productRepository.findById(productId)
                .orElseThrow(() -> new IllegalArgumentException("Producto no encontrado con ID: " + productId));
        if (prod.getStock() == null) prod.setStock(0);
        if (prod.getStock() < quantity) {
            throw new IllegalStateException("Stock insuficiente para '" + prod.getNombre() + "'. Disponible: " + prod.getStock() + ", solicitado: " + quantity);
        }
        prod.setStock(Math.max(0, prod.getStock() - quantity));
        prod.setVentasHistoricas((prod.getVentasHistoricas() != null ? prod.getVentasHistoricas() : 0) + quantity);
        return productRepository.save(prod);
    }
}
