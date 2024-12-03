pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_PATH = "./docker-compose.yml"
        CERTIFICATES_PATH = "./certificates"
    }

    stages {
        stage('Checkout code') {
            steps {
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[url: 'https://github.com/Zidane-Aboukhalid/APP_3D_Blazor']],
                    cleanBeforeCheckout: true
                ])
                sh 'git log -1 --oneline' // Vérification du commit récupéré
            }
        }

        stage('Generate SSL Certificates') {
            steps {
                script {
                    sh "mkdir -p $CERTIFICATES_PATH"
                    sh """
                        openssl req -x509 -newkey rsa:4096 -keyout $CERTIFICATES_PATH/private.key \
                        -out $CERTIFICATES_PATH/certificate.crt -days 365 -nodes \
                        -subj "/C=US/ST=State/L=City/O=Company/CN=example.com"
                    """
                }
            }
        }

        stage('Deploy Docker Compose') {
            steps {
                // Arrêter uniquement les conteneurs liés à ce projet
                sh "docker-compose -f $DOCKER_COMPOSE_PATH down || true"

                // Reconstruire les images Docker et déployer
                sh "docker-compose -f $DOCKER_COMPOSE_PATH up --build -d"
            }
        }

        stage('Check Running Containers') {
            steps {
                sh 'docker ps'
            }
        }
    }

    post {
        always {
            // Logs des conteneurs pour vérifier leur état
            sh 'docker-compose logs || true'
        }
        success {
            echo "Application déployée avec succès et reste active sur le serveur."
        }
    }
}
