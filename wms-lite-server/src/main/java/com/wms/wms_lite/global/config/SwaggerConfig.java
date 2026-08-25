package com.wms.wms_lite.global.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!prod")
public class SwaggerConfig {

        private static final String SECURITY_SCHEME_NAME = "BearerAuthentication";

        @Bean
        public OpenAPI openAPI() {
                return new OpenAPI()
                                .info(new Info()
                                                .title("WMS Lite REST API Documentation")
                                                .description("창고 관리 시스템 (WMS Lite) 백엔드 핵심 API 명세서")
                                                .version("v1.0.0"))
                                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                                .components(new Components()
                                                .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                                                .name(SECURITY_SCHEME_NAME)
                                                                .type(SecurityScheme.Type.HTTP)
                                                                .scheme("bearer")
                                                                .bearerFormat("JWT")
                                                                .description("JWT Access Token을 입력해 주세요. (예: Bearer 생략 가능)")));
        }
}
