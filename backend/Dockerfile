FROM python:3.12

LABEL maintainer="Kunal Kanti Paul"
LABEL version="1.0"
ENV TZ="Asia/Kolkata"

WORKDIR /app

# Copy and install dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Set environment variables for Python
ENV PYTHONDONTWRITEBYTECODE 1  # Prevent Python from writing .pyc files to disk
ENV PYTHONUNBUFFERED 1  # Force Python to output to stdout and stderr without buffering

# Copy the rest of the application code
COPY . .

# Command to run the FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8088", "--reload"]