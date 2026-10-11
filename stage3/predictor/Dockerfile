FROM golang:1.23-bookworm AS builder
WORKDIR /app
COPY main.go .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o predictor main.go

FROM alpine:latest
RUN apk --no-cache add ca-certificates curl
WORKDIR /app
COPY --from=builder /app/predictor .
EXPOSE 8080
ENV PORT=8080
ENTRYPOINT ["/app/predictor"]
