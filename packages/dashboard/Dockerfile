# Stage 1: Build the React application
#FROM node:latest as build-stage
FROM node:20.9 as build-stage

WORKDIR /app

# Copy package.json and package-lock.json (if available) to the container
#COPY package*.json ./
COPY yarn.lock .
#COPY packages/dashboard/package.json .

# Copy the rest of your application's source code
COPY packages/dashboard .

# Install dependencies
#RUN npm install
RUN yarn install --frozen-lockfile

# Make sure these env vars are available at build time
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}

RUN echo "VITE_CLERK_PUBLISHABLE_KEY=${VITE_CLERK_PUBLISHABLE_KEY}"

# Build your application
#RUN npm run build
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
