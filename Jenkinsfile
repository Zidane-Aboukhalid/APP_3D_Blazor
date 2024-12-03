pipeline {
  agent any
  stages {
    stage('checkout code ') {
      steps {
        git(url: 'https://github.com/Zidane-Aboukhalid/Project-MMC', branch: 'main')
      }
    }

    stage('adds logs') {
      steps {
        sh 'ls -la'
      }
    }

    stage('Run Docker Compose') {
      steps {
        sh 'docker-compose up -d'
      }
    }

  }
}
