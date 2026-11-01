// @pca:start
// @id(backend.service_identity.main.java.com.cremeco.identity.repository.rolerepository)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (RoleRepository.java))
// @pca:end
package com.cremeco.identity.repository;

import com.cremeco.identity.model.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, String> {
}
