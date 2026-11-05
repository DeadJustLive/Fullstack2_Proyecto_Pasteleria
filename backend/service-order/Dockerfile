FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

ENV TZ=America/Santiago

ARG SERVICE_NAME=service-order
ARG JAR_FILE=${SERVICE_NAME}/target/${SERVICE_NAME}-1.0.0-SNAPSHOT.jar

COPY ${JAR_FILE} app.jar

EXPOSE 8083

ENTRYPOINT ["java", "-Duser.timezone=America/Santiago", "-Xms64m", "-Xmx256m", "-jar", "app.jar"]
