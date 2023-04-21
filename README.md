# Links

[DockerHub](https://hub.docker.com/repository/docker/ivanivanivan1234/movies/general).

## How to run application

create .env file with data from .env.example

then run commands:

```bash
cd server
npm i
npm start

```

## How to create docker image

Go to the directory that has your Dockerfile

```bash
docker build . -t <your username>/movies
```

Run the image

```bash
 docker run -p 8050:8000 -d <your username>/movies
```

Print output of app

```bash
 docker ps 
 docker logs <container id>
```

To shut down app

```bash
 docker kill <container id>
```
