docker build . -f Dockerfile -t OneAccess_local:1.0


docker run -d --name OneAccess_local -p 8088:8088 -v /Applications/Dic_projects/projects/fast-sso/backend :/app OneAccess_local:1.0