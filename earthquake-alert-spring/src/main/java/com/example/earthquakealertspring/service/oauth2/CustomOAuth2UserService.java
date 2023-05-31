package com.example.earthquakealertspring.service.oauth2;

import com.example.earthquakealertspring.entity.User;
import com.example.earthquakealertspring.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {
    @Autowired
    private UserRepository userRepository;

    public CustomOAuth2UserService() {
        super();
    }

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        final OAuth2User oAuth2User = super.loadUser(userRequest);
        try {
            log.info("OAuth2User attributes {} ", new ObjectMapper().writeValueAsString(oAuth2User.getAttributes()));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
        final String authProvider = userRequest.getClientRegistration().getClientName();
        final String email;
        final String name;

        switch (authProvider.toLowerCase()) {
            case "google":
                log.info("Auth provider: {}", authProvider);
                email = (String) oAuth2User.getAttributes().get("email");
                name  = (String) oAuth2User.getAttributes().get("name");
                break;
            case "kakao":
                log.info("Auth provider: {}", authProvider);
                Map<String, String> kakaoAccount = (HashMap<String, String>) oAuth2User.getAttributes().get("kakao_account");
                email = (String) kakaoAccount.get("email");
                Map<String, String> properties = (HashMap<String, String>) oAuth2User.getAttributes().get("properties");
                name  = (String) properties.get("nickname");
                break;
            case "naver":
                log.info("Auth provider: {}", authProvider);
                Map<String, String> response = (HashMap<String, String>) oAuth2User.getAttributes().get("response");
                email = (String) response.get("id");
                name  = (String) response.get("name");
                break;
            default:
                throw new IllegalArgumentException("Unsupported auth provider: " + authProvider);
        }

        User user = null;
        if (!userRepository.existsByEmail(email)) {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .authProvider(authProvider)
                    .build();
            userRepository.save(user);
        } else {
            user = userRepository.findByEmail(email);
            if (user.getAuthProvider().toLowerCase() != authProvider.toLowerCase()) {
                user.setAuthProvider(authProvider);
                userRepository.save(user);
            }
        }
        log.info("Successfully pulled user info email {} name {} authProvider {} ", user.getEmail(), user.getName(), user.getAuthProvider());
        return new CustomOAuth2User(Long.toString(user.getUserId()), oAuth2User.getAttributes());
    }
}

