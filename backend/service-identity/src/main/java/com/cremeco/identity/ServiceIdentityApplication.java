// @pca:start
// @id(backend.service_identity.main.java.com.cremeco.identity.serviceidentityapplication)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (ServiceIdentityApplication.java))
// @pca:end
package com.cremeco.identity;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServiceIdentityApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceIdentityApplication.class, args);
    }
}
