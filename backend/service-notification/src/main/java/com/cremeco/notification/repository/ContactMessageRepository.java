// @pca:start
// @id(backend.service_notification.main.java.com.cremeco.notification.repository.contactmessagerepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (ContactMessageRepository.java))
// @pca:end
package com.cremeco.notification.repository;

import com.cremeco.notification.model.ContactMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessageEntity, Long> {
    List<ContactMessageEntity> findAllByOrderByFechaDesc();
    List<ContactMessageEntity> findByLeidoFalseOrderByFechaDesc();
}
