# @pca:start
# @id(backend.service-inventory.dockerfile)
# @kind(config)
# @limit(lines: 50)
# @desc(Dockerfile de produccion para microservicio service-inventory)
# @pca:end

FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

ENV TZ=America/Santiago

ARG SERVICE_NAME=service-inventory
ARG JAR_FILE=${SERVICE_NAME}/target/${SERVICE_NAME}-1.0.0-SNAPSHOT.jar

COPY ${JAR_FILE} app.jar

EXPOSE 8085

ENTRYPOINT ["java", "-Duser.timezone=America/Santiago", "-Xms64m", "-Xmx256m", "-jar", "app.jar"]
