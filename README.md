# Wallet dApp

A modern web3 wallet application built with Next.js, Prisma, and Ethereum.

## Features

- Create and import Ethereum wallets
- View and manage tokens
- Send and receive transactions
- Modern, responsive UI with dark theme
- Secure key management
- Real-time transaction updates

## Tech Stack

- Next.js 14
- TypeScript
- Prisma (PostgreSQL)
- Ethers.js
- Tailwind CSS
- shadcn/ui Components

## Prerequisites

- Node.js >= 18
- PostgreSQL
- Ethereum wallet/provider (e.g., MetaMask)

## Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd wallet-dapp
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Database URL for Prisma
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/wallet_db?schema=public"

# Ethereum Network Configuration
NEXT_PUBLIC_NETWORK_NAME="sepolia"
NEXT_PUBLIC_RPC_URL="https://sepolia.infura.io/v3/your-infura-id"
NEXT_PUBLIC_CHAIN_ID="11155111"

# Contract Addresses
NEXT_PUBLIC_USDT_CONTRACT="0xYourUSDTContractAddress"

# API Configuration
NEXT_PUBLIC_API_URL="http://localhost:8000"

# Security
JWT_SECRET="your-jwt-secret-key"

# Port Configuration
PORT=8000
```

4. Initialize the database:
```bash
npx prisma generate
npx prisma db push
```

## Development

Run the development server:
```bash
npm run dev
```

## Deployment

### Heroku

1. Create a new Heroku app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

3. Set environment variables:
```bash
heroku config:set NEXT_PUBLIC_NETWORK_NAME=sepolia
heroku config:set NEXT_PUBLIC_RPC_URL=your-infura-url
heroku config:set NEXT_PUBLIC_CHAIN_ID=11155111
heroku config:set NEXT_PUBLIC_USDT_CONTRACT=your-contract-address
heroku config:set JWT_SECRET=your-jwt-secret
```

4. Deploy:
```bash
git push heroku main
```

### Vercel

1. Import your GitHub repository in Vercel
2. Configure environment variables in the Vercel dashboard
3. Deploy

## Production Considerations

1. **Database Migration**: Always run migrations before deploying:
```bash
npx prisma migrate deploy
```

2. **Environment Variables**: Ensure all required environment variables are set in your deployment platform.

3. **Security**:
   - Use secure JWT secrets
   - Enable HTTPS
   - Implement rate limiting
   - Regular security audits

4. **Monitoring**:
   - Set up error tracking (e.g., Sentry)
   - Monitor API endpoints
   - Track transaction success rates

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
