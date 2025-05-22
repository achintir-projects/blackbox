const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testWrite() {
  try {
    const testWallet = await prisma.wallet.create({
      data: {
        address: '0xTestAddress' + Date.now(),
        publicKey: 'TestPublicKey',
        encryptedPrivateKey: 'TestPrivateKey',
      },
    });
    console.log('Test wallet created:', testWallet);
  } catch (error) {
    console.error('Error creating test wallet:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testWrite();
