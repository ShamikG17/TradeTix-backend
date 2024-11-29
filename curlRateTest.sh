#!/bin/bash

# URL of the endpoint to hit
URL="http://localhost:3000/api/health"

# Number of times to send the request
COUNT=1000

for i in $(seq 1 $COUNT); do
  echo "Request #$i"
  
  # Perform the curl request and capture both the response body and status code
  RESPONSE=$(curl -s -w "%{http_code}" -o /dev/null $URL)

  # Output the status code and response body (the response body is printed before status code)
  RESPONSE_BODY=$(curl -s $URL)

  # Print response and status code
  echo "Response: $RESPONSE_BODY"
  echo "Status Code: $RESPONSE"
done

echo "Completed $COUNT requests."