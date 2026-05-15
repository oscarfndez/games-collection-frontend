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

  parameters {
    booleanParam(name: 'RUN_SMOKE_TESTS', defaultValue: false, description: 'Run Selenium/Cucumber smoke tests against the deployed application')
    string(name: 'SMOKE_BASE_URL', defaultValue: 'http://oscarfndez.eu/gamescollection', description: 'Base URL used by the smoke test suite')
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

    stage('Smoke Tests') {
      when {
        expression { return params.RUN_SMOKE_TESTS }
      }
      steps {
        container('node') {
          sh 'apk add --no-cache chromium'
          sh '''
            E2E_BASE_URL="${SMOKE_BASE_URL}" \
            E2E_CHROME_BINARY=/usr/bin/chromium-browser \
            E2E_HEADLESS=true \
            npm run e2e:smoke
          '''
        }
      }
      post {
        always {
          archiveArtifacts artifacts: 'e2e/reports/**', allowEmptyArchive: true
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
