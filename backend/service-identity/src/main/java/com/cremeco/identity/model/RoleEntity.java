// @pca:start
// @id(backend.service_identity.main.java.com.cremeco.identity.model.roleentity)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (RoleEntity.java))
// @pca:end
package com.cremeco.identity.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoleEntity {

    @Id
    @Column(length = 50)
    private String id; // ADMIN_GENERAL, JEFE_COCINA, CAJERO_MOSTRADOR, CLIENTE

    @Column(nullable = false, length = 100)
    private String nombre;

    @Column(columnDefinition = "TEXT")
    private String permisos; // CSV de permisos
}
