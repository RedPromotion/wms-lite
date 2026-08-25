package com.wms.wms_lite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;

@EnableRetry
@SpringBootApplication
public class WmsLiteApplication {

	public static void main(String[] args) {
		SpringApplication.run(WmsLiteApplication.class, args);
	}

}
