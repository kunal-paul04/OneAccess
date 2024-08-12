docker build . -f Dockerfile -t oneccess_backend:1.0


docker run -d --name oneccess_backend -p 8000:8000 -v /Applications/Dic_projects/projects/fast-sso/backend:/app oneccess_backend:1.0