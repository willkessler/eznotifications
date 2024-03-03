# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory in the container
WORKDIR /app

# Copy the top-level yarn.lock into the container
COPY yarn.lock .

# Copy the package.json (and possibly package-lock.json) of the API package
COPY packages/api/package.json ./

# Install dependencies
RUN yarn install --frozen-lockfile

# Copy the rest of the API package into the container
COPY packages/api ./

# Build the application (if necessary)
RUN yarn run build

# Inject the clerk jwt issuer to the environment
ARG CLERK_JWT_ISSUER
ENV CLERK_JWT_ISSUER=${CLERK_JWT_ISSUER}

# Expose the port the app runs on
EXPOSE 8080

# Command to run the application
CMD [ "npm", "run",  "start:prod" ]


