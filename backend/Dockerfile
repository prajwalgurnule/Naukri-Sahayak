# Use an official Node.js runtime as a parent image
FROM node:22

# Install Python (required for feedback_model.py) and related tools
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv && apt-get clean

# Set the working directory inside the container
WORKDIR /backend

# Copy package.json and package-lock.json for installing Node.js dependencies
COPY package.json package-lock.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code into the container
COPY . .

# Create and activate a virtual environment for Python dependencies
RUN python3 -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Install Python dependencies inside the virtual environment
RUN pip install --upgrade pip && pip install -r requirements.txt

# Expose the port your server runs on (5000)
EXPOSE 5000

# Start the backend server
CMD ["node", "server.js"]