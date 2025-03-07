pipeline {
    agent any

    tools {
        nodejs '23.5.0'
        dockerTool 'docker'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Cloning the repository...'
                checkout scm
            }
        }

        stage('Set Environment Variable') {
            steps {
                script {
                    // Write the .env file with the provided environment variables
                    writeFile file: '.env', text: """
                    AUTH_SECRET=${AUTH_SECRET}
                    DATABASE_URL=${DATABASE_URL}
                    NEXTAUTH_URL=${NEXTAUTH_URL}
                    AUTH_DISCORD_ID=${AUTH_DISCORD_ID}
                    AUTH_DISCORD_SECRET=${AUTH_DISCORD_SECRET}
                    """
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing dependencies...'
                sh 'npm install'
            }
        }

        stage('Build Database') {
            steps {
                echo 'Building the database...'
                // sh "npx prisma migrate deploy DATABASE_URL=${DATABASE_URL}"
                sh "npx prisma db push"
            }
        }

        stage('Build Next.js Project') {
            steps {
                echo 'Building the project...'
                sh 'npm run build'
            }
        }

        stage('Docker Build, Push, and Deploy') {
            steps {
                script {
                    // Configurable dynamic variables
                    def registryUrl = '192.168.1.204:6500'
                    def remoteDockerHost = '192.168.1.204'
                    def remoteDockerPort = '2375'
                    def imageName = 'gementar-team-tools'
                    def tag = 'latest'
                    def containerName = 'gementar-team-tools'
                    def exposedPort = '3000/tcp'
                    def hostPort = '3008'

                    def fullImage = "${registryUrl}/${imageName}:${tag}"
                    def dockerApiUrl = "http://${remoteDockerHost}:${remoteDockerPort}"

                    echo 'Removing unused Docker images and build cache...'
                    sh "docker image prune -f"

                    echo 'Building Docker image...'
                    sh "docker build -t ${imageName}:${tag} ."
                    sh "docker tag ${imageName}:${tag} ${fullImage}"

                    echo 'Pushing Docker image...'
                    sh "docker push ${fullImage}"

                    echo 'Verifying image exists in registry...'
                    def checkImageCmd = "curl -s -o /dev/null -w '%{http_code}' http://${registryUrl}/v2/${imageName}/manifests/${tag}"
                    def result = sh(script: checkImageCmd, returnStdout: true).trim()

                    if (result != '200') {
                        error "Image ${fullImage} is not available in the registry."
                    } else {
                        echo "Image ${fullImage} is available in the registry."
                    }

                    echo 'Deploying image on remote server...'
                    // Pull image on the remote server
                    sh """
                    curl -X POST ${dockerApiUrl}/images/create?fromImage=${fullImage}
                    """

                    // Stop and remove existing container
                    sh """
                    curl -X POST ${dockerApiUrl}/containers/${containerName}/stop || true
                    curl -X DELETE ${dockerApiUrl}/containers/${containerName} || true
                    """

                    // Run new container
                    sh """
                    curl -X POST -d '{
                        \"Image\": \"${fullImage}\",
                        \"HostConfig\": {
                            \"PortBindings\": {
                                \"${exposedPort}/tcp\": [{\"HostPort\": \"${hostPort}\"}]
                            }
                        },
                        \"ExposedPorts\": {\"${exposedPort}/tcp\": {}}
                    }' \
                    -H "Content-Type: application/json" \
                    ${dockerApiUrl}/containers/create?name=${containerName}
                    """

                    // Start the new container
                    sh """
                    curl -X POST ${dockerApiUrl}/containers/${containerName}/start
                    """

                    sh """
                    curl -X GET http://${remoteDockerHost}:${remoteDockerPort}/containers/${containerName}/json
                    """

                    echo 'Deployment successful!'
                }
            }
        }
    }

    post {
        always {
            echo 'Pipeline finished.'
        }
        success {
            echo 'Deployment succeeded.'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}