docker build . -f Dockerfile -t oneccess_backend:1.0

[//]: # (for mac)
docker run -d --name oneccess_backend -p 8000:8000 -v /Applications/Dic_projects/projects/fast-sso/backend:/app oneccess_backend:1.0

[//]: # (for windows)
docker run -d --name oneccess_backend -p 8000:8000 -v F:\Web_Development\wamp64\www\Github Projects\fast-sso\backend:/app oneccess_backend:1.0