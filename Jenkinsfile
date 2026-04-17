pipeline {
  agent { label 'docker' }

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

    stage('Build Docker image') {
      steps {
        sh 'docker version'
        sh "docker build -t ${FULL_IMAGE} ."
      }
    }

    stage('Push Docker image') {
      steps {
        withCredentials([usernamePassword(
          credentialsId: 'dockerhub-credentials',
          usernameVariable: 'DOCKER_USER',
          passwordVariable: 'DOCKER_PASS'
        )]) {
          sh '''
            echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
            docker push ${FULL_IMAGE}
          '''
        }
      }
    }
  }
}