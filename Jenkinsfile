pipeline {
  agent any

  environment {
    // Définir des variables d'environnement globales si nécessaire
    DOCKER_COMPOSE_PATH = "./docker-compose.yml"
  }

  stages {
    stage('Checkout code') {
      steps {
        // Cloner ton repo GitHub
        git(url: 'https://github.com/Zidane-Aboukhalid/APP_3D_Blazor', branch: 'master')
      }
    }

    stage('List Files and Add Logs') {
      steps {
        // Lister les fichiers dans le répertoire de travail pour vérifier si docker-compose.yml est présent
        sh 'ls -la'
      }
    }

    stage('Build and Run Docker Compose') {
      steps {
        // Construire et démarrer tous les services définis dans docker-compose.yml
        sh 'docker-compose -f $DOCKER_COMPOSE_PATH up -d'
      }
    }

    stage('Check Running Containers') {
      steps {
        // Vérifier les conteneurs en cours d'exécution
        sh 'docker ps'
      }
    }

    stage('Test Application') {
      steps {
        // Teste ton application ou effectue des vérifications
        sh 'curl http://195.26.245.107:80'  // Exemple de test pour vérifier si l'application fonctionne sur le port 5000
      }
    }

    stage('Clean Up') {
      steps {
        // Arrêter et supprimer les conteneurs une fois les tests terminés
        sh 'docker-compose -f $DOCKER_COMPOSE_PATH down'
      }
    }
  }
}
