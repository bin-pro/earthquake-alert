package com.example.earthquakealertspring.service;

import com.example.earthquakealertspring.dto.EarthquakeResponse;
import com.example.earthquakealertspring.dto.EarthquakeDto;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.example.earthquakealertspring.repository.FCMTokenRepository;
import com.example.earthquakealertspring.entity.FCMTokenEntity;
import org.springframework.beans.factory.annotation.Value;
import java.util.List;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.Collections;
import java.util.Arrays;
import org.springframework.beans.factory.annotation.Autowired;
import org.slf4j.LoggerFactory;
import org.slf4j.Logger;
import reactor.core.publisher.Mono;
import org.springframework.web.util.UriComponents;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class EarthquakePushService {
    private final WebClient webClient;
    private final FCMTokenService fcmTokenService;
    private final FCMTokenRepository fcmTokenRepository;
    private final String serviceKey;
    private EarthquakeDto lastSentData;
    private static final Logger logger = LoggerFactory.getLogger(EarthquakePushService.class);

    @Autowired
    public EarthquakePushService(WebClient webClient, @Value("${api.earthquake-api.service-key}") String serviceKey, FCMTokenService fcmTokenService, FCMTokenRepository fcmTokenRepository) {
        this.webClient = webClient;
        this.serviceKey = serviceKey;
        this.fcmTokenService = fcmTokenService;
        this.fcmTokenRepository = fcmTokenRepository;
    }

    @Scheduled(fixedRate = 60000)
    public void sendPushNotification() {
        try {
            String currentDate = new SimpleDateFormat("yyyyMMdd").format(new Date());
            String yesterdayDate = new SimpleDateFormat("yyyyMMdd").format(new Date(System.currentTimeMillis() - (1000 * 60 * 60 * 24)));

            UriComponents uriComponents = UriComponentsBuilder
                    .fromHttpUrl("https://apis.data.go.kr/1360000/EqkInfoService/getEqkMsg")
                    .queryParam("serviceKey", serviceKey)
                    .queryParam("dataType", "JSON")
                    .queryParam("numOfRows", "10")
                    .queryParam("pageNo", "1")
                    .queryParam("fromTmFc", yesterdayDate)
                    .queryParam("toTmFc", currentDate)
                    .build(true);

            webClient.get()
                    .uri(uriComponents.toUri())
                    .retrieve()
                    .bodyToMono(EarthquakeResponse.class)
                    .subscribe(this::processResponse, error -> logger.error("Exception occurred in sendPushNotification: ", error));
        } catch (Exception e) {
            logger.error("Exception occurred in sendPushNotification: ", e);
        }
    }

    private void processResponse(EarthquakeResponse response) {
        // resultCode 조건을 추가합니다.
        if (!"00".equals(response.getResponse().getHeader().getResultCode())) {
            logger.info("resultCode is not 00. resultCode: " + response.getResponse().getHeader().getResultCode());
            return;
        }
        
        List<EarthquakeDto> earthquakeDtos = response.getResponse().getBody().getItems().getItem();
        logger.info("earthquakeDtos: " + earthquakeDtos.toString());

        // 가장 최근의 EarthquakeDto만 가져옵니다.
        if (!earthquakeDtos.isEmpty()) {
            EarthquakeDto newEarthquakeDto = earthquakeDtos.get(0);
            logger.info("newEarthquakeDto: " + newEarthquakeDto.toString());
            // null 검사를 실시합니다.
            if (newEarthquakeDto != null) {
                sendFCMPushNotification(newEarthquakeDto);
            } else {
                logger.info("No new earthquake data found.");
            }
        }
    }

    private void sendFCMPushNotification(EarthquakeDto earthquakeDto) {
        List<FCMTokenEntity> tokens = fcmTokenRepository.findAll();

        for (FCMTokenEntity fcmTokenEntity : tokens) {
            String title = "지진알리미";
            String body = String.format("규모 %s 지진이 발생했습니다. 위치: %s\n인근에 계신 분들은 빠르게 대피하십시오.", earthquakeDto.getMt(), earthquakeDto.getLoc(), earthquakeDto.getLat(), earthquakeDto.getLon());
            fcmTokenService.sendMessage(fcmTokenEntity.getFCMToken(), title, body, earthquakeDto.getMt(), earthquakeDto.getLoc(), earthquakeDto.getLat(), earthquakeDto.getLon(), earthquakeDto.getTmEqk());
            logger.info("FCM message sent to {}", fcmTokenEntity.getFCMToken());
        }
    }
}
