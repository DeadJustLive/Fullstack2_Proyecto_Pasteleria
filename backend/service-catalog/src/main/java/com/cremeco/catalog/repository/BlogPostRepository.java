// @pca:start
// @id(backend.service_catalog.main.java.com.cremeco.catalog.repository.blogpostrepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (BlogPostRepository.java))
// @pca:end
package com.cremeco.catalog.repository;

import com.cremeco.catalog.model.BlogPostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPostEntity, Long> {
    Optional<BlogPostEntity> findBySlugIgnoreCase(String slug);
}
