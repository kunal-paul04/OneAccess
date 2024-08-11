docker build . -f Dockerfile -t oneccess_frontend:1.0


docker run -d --name oneccess_frontend -p 5173:5173 -v /Applications/Dic_projects/projects/fast-sso/frontend:/app oneccess_frontend:1.0