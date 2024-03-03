# Stage 1: Build the React application. Use the official Node.js image as the base image
FROM node:latest as build-stage

WORKDIR /app

# Copy the root package.json and yarn.lock
COPY yarn.lock ./

# Copy the package.json (and possibly package-lock.json) of the dashboard package
COPY packages/dashboard/package.json .

# Install dependencies at the root level, respecting workspaces
RUN yarn install --frozen-lockfile

# Copy the rest of your application's source code
COPY packages/dashboard .

# Make sure these env vars are available at build time
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}
ARG VITE_API_TARGET
ENV VITE_API_TARGET=${VITE_API_TARGET}

# RUN echo "VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}"

# Build your application
RUN yarn run build

# Stage 2: Set up Nginx to serve the application
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy a custom nginx configuration (if needed)
COPY packages/dashboard/nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the Docker host, so we can access it from the outside.
EXPOSE 80

# The default command to run when starting the container
CMD ["nginx", "-g", "daemon off;"]

# For debugging only
#CMD [ "/bin/sh" ]
