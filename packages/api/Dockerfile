# Use the official Node.js image as the base image
#FROM node:18-alpine
FROM node:20.9

# Set the working directory in the container
WORKDIR /app

# Copy the top-level yarn.lock into the container
COPY yarn.lock packages/api/package.json ./

# Copy the package.json (and possibly package-lock.json) of the API package
COPY packages/api/package.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the API package into the container
COPY packages/api ./

# Build the application (if necessary)
RUN yarn run build

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
#CMD [ "ls", "-lR", "node_modules"]
#CMD ["node", "dist/main"]
CMD [ "npm", "run",  "start:prod" ]


