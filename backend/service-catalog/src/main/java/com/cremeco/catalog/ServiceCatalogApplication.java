// @pca:start
// @id(backend.service_catalog.main.java.com.cremeco.catalog.servicecatalogapplication)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (ServiceCatalogApplication.java))
// @pca:end
package com.cremeco.catalog;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ServiceCatalogApplication {
    public static void main(String[] args) {
        SpringApplication.run(ServiceCatalogApplication.class, args);
    }
}
