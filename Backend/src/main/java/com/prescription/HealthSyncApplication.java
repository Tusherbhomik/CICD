package com.prescription;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class HealthSyncApplication {

	public static void main(String[] args) {
		SpringApplication.run(HealthSyncApplication.class, args);
	}

}


//docker run -d `
//		--name prescription-postgres `
//		-e POSTGRES_DB=prescription_system `
//		-e POSTGRES_USER=prescription_user `
//		-e POSTGRES_PASSWORD=prescription_password `
//		-p 5432:5432 `
//postgres:latest

//docker run -d --name prescription-postgres -e POSTGRES_DB=prescription_system -e POSTGRES_USER=prescription_user -e POSTGRES_PASSWORD=prescription_password -p 5432:5432 postgres:latest