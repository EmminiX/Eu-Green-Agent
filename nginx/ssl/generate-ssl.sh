#!/bin/bash
# Generate self-signed SSL certificates for local development
# For production, use Let's Encrypt or your certificate authority

echo "Generating self-signed SSL certificates for local development..."

# Create SSL directory if it doesn't exist
mkdir -p /etc/nginx/ssl

# Generate private key
openssl genrsa -out /etc/nginx/ssl/key.pem 2048

# Generate certificate signing request
openssl req -new -key /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.csr -subj "/C=EU/ST=Europe/L=Brussels/O=EU Green Policies/OU=Chatbot/CN=localhost"

# Generate self-signed certificate
openssl x509 -req -days 365 -in /etc/nginx/ssl/cert.csr -signkey /etc/nginx/ssl/key.pem -out /etc/nginx/ssl/cert.pem

# Set appropriate permissions
chmod 600 /etc/nginx/ssl/key.pem
chmod 644 /etc/nginx/ssl/cert.pem

# Clean up
rm /etc/nginx/ssl/cert.csr

echo "SSL certificates generated successfully!"
echo "Certificate: /etc/nginx/ssl/cert.pem"
echo "Private Key: /etc/nginx/ssl/key.pem"
echo ""
echo "Note: These are self-signed certificates for development only."
echo "For production, use Let's Encrypt or certificates from a trusted CA."