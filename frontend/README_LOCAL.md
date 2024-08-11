docker build . -f Dockerfile -t oneccess_frontend:latest

docker run -d --name oneccess_frontend -p 3000:3000 oneccess_frontend:latest 


docker run -d --name oneccess_frontend -p 5173:5173 -v /Applications/Dic_projects/projects/fast-sso/frontend:/app oneccess_frontend:1.0