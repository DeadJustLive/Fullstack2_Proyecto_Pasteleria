// @pca:start
// @id(backend.service_payment_flow.main.java.com.cremeco.payment.flow.flowpaymentapplication)
// @kind(component)
// @limit(lines: 200)
// @desc(Archivo component auto-registrado por FIDA/OPL bootstrap (FlowPaymentApplication.java))
// @pca:end
package com.cremeco.payment.flow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.kafka.annotation.EnableKafka;

@EnableKafka
@SpringBootApplication
public class FlowPaymentApplication {
    public static void main(String[] args) {
        SpringApplication.run(FlowPaymentApplication.class, args);
    }
}
