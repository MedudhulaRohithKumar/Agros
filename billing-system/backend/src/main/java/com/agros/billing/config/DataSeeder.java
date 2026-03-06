package com.agros.billing.config;

import com.agros.billing.entity.Role;
import com.agros.billing.entity.User;
import com.agros.billing.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            userRepository.save(User.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("password123"))
                    .role(Role.ROLE_ADMIN)
                    .build());

            userRepository.save(User.builder()
                    .username("cashier")
                    .password(passwordEncoder.encode("cashier123"))
                    .role(Role.ROLE_CASHIER)
                    .build());
            
            System.out.println("Seeded Admin and Cashier users.");
        }
    }
}
