docker build . -f Dockerfile -t oneccess_backend:1.0


docker run -d --name oneccess_backend -p 8088:8088 -v /Applications/Dic_projects/projects/fast-sso/backend:/app oneccess_backend:1.0