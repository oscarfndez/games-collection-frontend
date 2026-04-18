pipeline {
  agent {
    kubernetes {
      cloud 'kubernetes'
      defaultContainer 'node'
      yaml '''
apiVersion: v1
kind: Pod
spec:
  serviceAccountName: jenkins
  containers:
    - name: node
      image: node:20-alpine
      command:
        - cat
      tty: true
    - name: kaniko
      image: gcr.io/kaniko-project/executor:debug
      command:
        - /busybox/cat
      tty: true
      volumeMounts:
        - name: docker-config
          mountPath: /kaniko/.docker
  volumes:
    - name: docker-config
      secret:
        secretName: dockerhub-config
        items:
          - key: config.json
            path: config.json
'''
    }
  }

  environment {
    REGISTRY = 'docker.io/oscarfndez'
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
        container('node') {
          sh 'node -v'
          sh 'npm -v'
          sh 'npm ci'
          sh 'npm run build'
        }
      }
    }

    stage('Build and Push Image') {
      steps {
        container('kaniko') {
          sh '''
            /kaniko/executor \
              --context "${WORKSPACE}" \
              --dockerfile "${WORKSPACE}/Dockerfile" \
              --destination "${FULL_IMAGE}"
          '''
        }
      }
    }
  }
}