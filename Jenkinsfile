kkpipeline {

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

        stage('Clone GitOps Repository') {
            steps {
                container('kaniko') {
                    dir('gitops-config') {

                        git(
                            branch: 'main',
                            credentialsId: 'github-creds',
                            url: 'https://github.com/YoussefAbidi69/gitops-demo-config.git'
                        )

                        sh '''
                            echo "Repository cloned successfully!"
                            pwd
                            ls -la
                            ls -la gitops-demo
                        '''
                    }
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
