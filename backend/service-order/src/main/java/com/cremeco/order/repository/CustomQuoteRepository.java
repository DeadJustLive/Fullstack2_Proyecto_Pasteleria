package com.cremeco.order.repository;

import com.cremeco.order.model.CustomQuoteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomQuoteRepository extends JpaRepository<CustomQuoteEntity, Long> {
    List<CustomQuoteEntity> findByEmailIgnoreCaseOrderByFechaDesc(String email);
    List<CustomQuoteEntity> findAllByOrderByFechaDesc();
}
