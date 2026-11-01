// @pca:start
// @id(backend.service_order.main.java.com.cremeco.order.repository.customquoterepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (CustomQuoteRepository.java))
// @pca:end
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
