#!/usr/bin/env node

/**
 * Generate environment.prod.ts from environment variables
 * This script replaces placeholders in environment.prod.ts with actual environment variables
 */

const fs = require('fs');
const path = require('path');

// Define environment variables with fallback defaults
const config = {
  API_URL: process.env.API_URL || 'http://localhost:8010',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:4200',
  IDP_AUTHORITY: process.env.IDP_AUTHORITY || 'https://localhost:9009',
  AZURE_B2C_CLIENT_ID: process.env.AZURE_B2C_CLIENT_ID || 'd0dafab9-cae6-426d-a516-eab88853767c',
  AZURE_B2C_AUTHORITY: process.env.AZURE_B2C_AUTHORITY || 'https://nexttechuit.b2clogin.com/nexttechuit.onmicrosoft.com/B2C_1_SignInSignUp/v2.0/',
  AZURE_B2C_KNOWN_AUTHORITY: process.env.AZURE_B2C_KNOWN_AUTHORITY || 'nexttechuit.b2clogin.com',
  AZURE_B2C_REDIRECT_URI: process.env.AZURE_B2C_REDIRECT_URI || process.env.CLIENT_URL || 'http://localhost:4200',
  AZURE_B2C_POST_LOGOUT_REDIRECT_URI: process.env.AZURE_B2C_POST_LOGOUT_REDIRECT_URI || process.env.CLIENT_URL || 'http://localhost:4200'
};

console.log('\n========================================');
console.log('Generating environment.prod.ts');
console.log('========================================');
console.log('\nEnvironment variables found:');
console.log('- API_URL:', process.env.API_URL ? '✓ SET' : '✗ NOT SET (using default)');
console.log('- CLIENT_URL:', process.env.CLIENT_URL ? '✓ SET' : '✗ NOT SET (using default)');
console.log('- IDP_AUTHORITY:', process.env.IDP_AUTHORITY ? '✓ SET' : '✗ NOT SET (using default)');
console.log('- AZURE_B2C_REDIRECT_URI:', process.env.AZURE_B2C_REDIRECT_URI ? '✓ SET' : '✗ NOT SET (using default)');
console.log('- AZURE_B2C_POST_LOGOUT_REDIRECT_URI:', process.env.AZURE_B2C_POST_LOGOUT_REDIRECT_URI ? '✓ SET' : '✗ NOT SET (using default)');

console.log('\nFinal configuration:');
console.log(JSON.stringify(config, null, 2));

// Read the template file
const templatePath = path.join(__dirname, 'src', 'environments', 'environment.prod.ts');
console.log('\nReading template from:', templatePath);

let template = fs.readFileSync(templatePath, 'utf8');
console.log('Template loaded, length:', template.length);

// Replace placeholders with actual values
let replacementCount = 0;
Object.keys(config).forEach(key => {
  const placeholder = `\${${key}}`;
  const value = config[key];
  const beforeLength = template.length;
  template = template.split(placeholder).join(value);
  const afterLength = template.length;
  if (beforeLength !== afterLength) {
    replacementCount++;
    console.log(`✓ Replaced: ${placeholder} → ${value}`);
  } else {
    console.log(`✗ Not found: ${placeholder}`);
  }
});

console.log(`\nTotal replacements made: ${replacementCount}`);

// Write the generated file
fs.writeFileSync(templatePath, template, 'utf8');
console.log('✓ Environment file written successfully to:', templatePath);

// Verify the file contains correct values
const verification = fs.readFileSync(templatePath, 'utf8');
console.log('\nVerification (first occurrence of apiUrl):');
const apiUrlMatch = verification.match(/apiUrl:\s*'([^']+)'/);
if (apiUrlMatch) {
  console.log('  apiUrl:', apiUrlMatch[1]);
}

console.log('\n========================================');
console.log('Done!\n');
