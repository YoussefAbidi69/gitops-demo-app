pipeline {

    agent {
        kubernetes {
            yamlFile 'jenkins/kaniko-pod.yaml'
            defaultContainer 'kaniko'
        }
    }

    environment {
    IMAGE_NAME = "youssefabidi1/gitops-demo"
    IMAGE_TAG = "${BUILD_NUMBER}"
    IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"
    }

    stages {

        stage('Checkout Source') {
            steps {
                echo 'Checking out source code...'
                checkout scm
            }
        }

        stage('Build & Push Image') {
            steps {
                container('kaniko') {

                    sh '''
                    /kaniko/executor \
                      --context=$WORKSPACE \
                      --dockerfile=$WORKSPACE/Dockerfile \
                      --destination=$IMAGE
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'Image built and pushed successfully!'
        }

        failure {
            echo 'Pipeline failed!'
        }
    }
}
