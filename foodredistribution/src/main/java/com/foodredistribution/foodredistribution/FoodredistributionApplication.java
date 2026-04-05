package com.foodredistribution.foodredistribution;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class FoodredistributionApplication {

	public static void main(String[] args) {
		SpringApplication.run(FoodredistributionApplication.class, args);
	}

}
