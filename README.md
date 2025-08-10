# InsurCheck - Professional Insurance Management Platform

A multi-tenant SaaS application built with React frontends and Node.js backend for insurance document processing and management.

## 📋 Project Overview

InsurCheck is organized as a monorepo containing:
- **client-admin**: React app for Super Admins and Tenant Admins (Port 3000)
- **client-user**: React app for Tenant Users (Port 3001)  
- **server**: Express.js backend API (Port 5000)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn package manager

### Environment Setup

1. **Clone and install dependencies:**
```bash
# Install server dependencies
cd server
npm install

# Install admin client dependencies
cd ../client-admin
npm install

# Install user client dependencies
cd ../client-user
npm install
