pipeline {
  agent any

  environment {
    REGISTRY = 'docker.io/TU_USUARIO_DOCKERHUB'
    IMAGE_NAME = 'game-collection-frontend'
    IMAGE_TAG = "build-${env.BUILD_NUMBER}"
    FULL_IMAGE = "${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}"
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build Angular') {
      steps {
        sh 'node -v'
        sh 'npm -v'
        sh 'npm ci'
        sh 'npm run build'
      }
    }
  }
}