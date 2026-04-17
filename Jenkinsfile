pipeline {
  agent {
    kubernetes {
      defaultContainer 'node'
      yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: node
      image: node:20-alpine
      command:
        - cat
      tty: true
'''
    }
  }

  stages {
    stage('Test') {
      steps {
        container('node') {
          sh 'node -v'
          sh 'npm -v'
        }
      }
    }
  }
}