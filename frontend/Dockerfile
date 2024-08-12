## Use an official Node runtime as a parent image
#FROM node:16
#
## Set the working directory to /app
#WORKDIR /app
#
## Copy the package.json and package-lock.json to the working directory
#COPY package*.json ./
#
## Install the dependencies
#RUN npm install
#
## Copy the remaining application files to the working directory
#COPY . .
#
## Build the application for production
#RUN npm run build
#
## Expose port 3000 for the application
#EXPOSE 3000
#
## Serve the application using a static server like 'serve'
#RUN npm install -g serve
#
## Start the application using the built production files
#CMD [ "serve", "-s", "build", "-l", "3000" ]

# .........................FOR DEVELOPMENT
# Use an official Node runtime as a parent image
FROM node:16

# Set the working directory to /app
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy the remaining application files
COPY . .

# Expose port 3000 to be accessible outside the container
EXPOSE 3000

# Start the app using npm run start
CMD ["npm", "start"]
