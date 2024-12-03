pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_PATH = "./docker-compose.yml"
        CERTIFICATES_PATH = "./certificates"
    }

    stages {
        stage('Checkout code') {
            steps {
                git(url: 'https://github.com/Zidane-Aboukhalid/APP_3D_Blazor', branch: 'master')
            }
        }

        stage('Generate SSL Certificates') {
            steps {
                script {
                    sh "mkdir -p $CERTIFICATES_PATH"
                    sh """
                        openssl req -x509 -newkey rsa:4096 -keyout $CERTIFICATES_PATH/private.key -out $CERTIFICATES_PATH/certificate.crt -days 365 -nodes -subj "/C=US/ST=State/L=City/O=Company/CN=example.com"
                    """
                }
            }
        }

        stage('Build and Run Docker Compose') {
            steps {
                sh "docker-compose -f $DOCKER_COMPOSE_PATH up -d"
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }

        stage('Clean Up') {
            steps {
                sh "docker-compose -f $DOCKER_COMPOSE_PATH down"
            }
        }
    }
}
