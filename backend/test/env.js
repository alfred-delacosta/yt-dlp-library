process.env.ACCESS_TOKEN_SECRET ||= "test-access-secret-value-with-enough-length";
process.env.JWT_SECRET ||= "test-refresh-secret-value-with-enough-length";
process.env.ARGON2_SECRET ||= "test-pepper-value";
process.env.JWT_NUMBER_OF_DAYS_EXPIRATION ||= "7";
process.env.ACCESS_TOKEN_NUMBER_OF_MINUTES_EXPIRATION ||= "15";
process.env.ENVIRONMENT ||= "test";
