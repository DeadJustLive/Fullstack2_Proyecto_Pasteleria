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
