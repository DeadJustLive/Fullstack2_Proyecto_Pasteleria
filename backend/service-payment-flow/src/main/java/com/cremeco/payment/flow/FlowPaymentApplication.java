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
