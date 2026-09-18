package com.omnitask.auth;

public record TokenResponse(String accessToken, String tokenType, long expiresIn) {}
