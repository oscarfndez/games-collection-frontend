pipeline {
  agent any

  environment {
    REGISTRY = 'docker.io/TU_USUARIO_DOCKERHUB'
    IMAGE_NAME = 'game-collection-frontend'
    IMAGE_TAG = "build-${env.BUILD_NUMBER}"
    FULL_IMAGE = "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
  }

  options {
    timestamps()
    disableConcurrentBuilds()
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Angular') {
      agent {
        docker {
          image 'node:20-alpine'
          reuseNode true
        }
      }
      steps {
        sh 'npm ci'
        sh 'npm run build'
      }
    }

    stage('Build Docker image') {
      steps {
        script {
          dockerImage = docker.build("${FULL_IMAGE}")
        }
      }
    }

    stage('Push Docker image') {
      steps {
        script {
          docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
            dockerImage.push()
          }
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
  }
}