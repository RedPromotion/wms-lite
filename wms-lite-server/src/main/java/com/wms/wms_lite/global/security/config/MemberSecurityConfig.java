package com.wms.wms_lite.global.security.config;

import com.wms.wms_lite.global.security.handler.CustomAccessDeniedHandler;
import com.wms.wms_lite.global.security.handler.CustomAuthenticationEntryPoint;
import com.wms.wms_lite.global.security.jwt.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * Member 전용 보안 설정.
 * - JWT 기반 Stateless 인증 사용
 * - CORS 허용
 * - CSRF 비활성화 (REST API 용)
 * - 폼 로그인/세션 사용 안함
 */
@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
@Order(2)
public class MemberSecurityConfig {

        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final CustomAuthenticationEntryPoint authenticationEntryPoint;
        private final CustomAccessDeniedHandler accessDeniedHandler;
        private final CorsConfigurationSource corsConfigurationSource;

        @Bean
        public SecurityFilterChain memberFilterChain(HttpSecurity http) throws Exception {
                return http
                                .securityMatcher("/api/members/**", "/api/**")
                                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                                .csrf(csrf -> csrf.disable())
                                .formLogin(form -> form.disable())
                                .httpBasic(httpBasic -> httpBasic.disable())
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .exceptionHandling(eh -> eh
                                                .authenticationEntryPoint(authenticationEntryPoint)
                                                .accessDeniedHandler(accessDeniedHandler))
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll() // Preflight 요청 전면 허용
                                                .requestMatchers("/actuator/health", "/h2-console/**",
                                                                "/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html")
                                                .permitAll()
                                                .requestMatchers("/api/members/login", "/api/members/reissue")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .addFilterBefore(new org.springframework.web.filter.CorsFilter(corsConfigurationSource),
                                                UsernamePasswordAuthenticationFilter.class)
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .build();
        }
}
