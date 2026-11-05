package com.cremeco.catalog.repository;

import com.cremeco.catalog.model.BlogPostEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BlogPostRepository extends JpaRepository<BlogPostEntity, Long> {
    Optional<BlogPostEntity> findBySlugIgnoreCase(String slug);
}
