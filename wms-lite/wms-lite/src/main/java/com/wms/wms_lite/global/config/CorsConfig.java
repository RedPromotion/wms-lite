package com.wms.wms_lite.global.config;

import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // 허용할 프론트엔드 출처(Origin)
        config.setAllowedOriginPatterns(List.of(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:3000",
            "http://127.0.0.1:5173"
        ));
        
        // 허용할 HTTP 메서드
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        
        // 허용할 요청 헤더 (Authorization, Content-Type 등)
        config.setAllowedHeaders(List.of("*"));
        
        // 노출할 응답 헤더
        config.setExposedHeaders(List.of("Authorization", "Content-Disposition"));
        
        // 자격 증명(쿠키, Authorization 헤더) 허용
        config.setAllowCredentials(true);
        
        // Preflight 응답 캐싱 시간 (1시간)
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
