package com.taskflow.security.jwt;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filtro para validar el token JWT en cada solicitud.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        log.info("========================================");
        log.info("Request URI: {} Method: {}", request.getRequestURI(), request.getMethod());
        log.info("Authorization Header: {}", authHeader != null ? "Bearer ***" : "NULL");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("No Authorization header or not Bearer token");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);
        log.info("JWT Token: {}...", jwt.substring(0, Math.min(20, jwt.length())));
        
        try {
            userEmail = jwtService.extractUsername(jwt);
            log.info("Extracted username from token: {}", userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                log.info("User loaded: {} with authorities: {}", userEmail, userDetails.getAuthorities());
                
                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("✓ User {} authenticated successfully with authorities: {}", userEmail, userDetails.getAuthorities());
                } else {
                    log.error("✗ Token is NOT VALID for user: {}", userEmail);
                }
            } else if (userEmail == null) {
                log.error("✗ Could not extract username from token");
            } else {
                log.info("User {} already authenticated", userEmail);
            }
        } catch (Exception e) {
            log.error("✗ Error processing JWT token: {} - {}", e.getClass().getSimpleName(), e.getMessage());
            e.printStackTrace();
        }
        
        log.info("========================================");
        filterChain.doFilter(request, response);
    }
}
