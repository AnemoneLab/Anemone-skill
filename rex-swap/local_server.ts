import * as crypto from 'crypto';
import express from 'express';
import cors from 'cors';
import { Buffer } from 'buffer';
import { swapTokens } from './swap';
import { log } from 'console';

// 生成RSA密钥对
const generateKeyPair = (): { publicKey: string, privateKey: string } => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem'
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem'
    }
  });
  
  return { publicKey, privateKey };
};

// 解密SUI私钥
const decryptKey = (encryptedKey: string, privateKey: string): string => {
  const buffer = Buffer.from(encryptedKey, 'base64');
  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256'
    },
    buffer
  );
  
  return decrypted.toString();
};

// 生成密钥对
const keys = generateKeyPair();

// 打印公钥供远程服务器使用
console.log('================ PUBLIC KEY ================');
console.log(keys.publicKey);
console.log('===========================================');

// 创建Express应用
const app = express();
app.use(express.json());
app.use(cors());

// API端点接收加密的SUI私钥和swap参数
app.post('/swap', async (req, res) => {
  try {
    const { encryptedKey, fromToken, toToken, amount, slippage } = req.body;
    
    if (!encryptedKey || !fromToken || !toToken || !amount) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    console.log('收到swap请求');
    console.log(`从 ${fromToken} 到 ${toToken}，数量: ${amount}`);

    console.log(encryptedKey);
    
    // 解密SUI私钥
    const suiPrivateKey = decryptKey(encryptedKey, keys.privateKey);
    console.log('SUI私钥已解密');
    
    // 执行swap
    const result = await swapTokens(
      suiPrivateKey,
      fromToken,
      toToken,
      amount,
      slippage || 0.01
    );
    
    res.json({
      success: true,
      transactionDigest: result.digest,
      message: '交易成功完成'
    });
  } catch (error) {
    console.error('Swap处理错误:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// 启动服务器
const PORT = 3456;
app.listen(PORT, () => {
  console.log(`安全Swap服务器已启动，监听端口 ${PORT}`);
  console.log(`测试命令: curl -X POST http://localhost:${PORT}/swap -H "Content-Type: application/json" -d '{"encryptedKey":"加密的私钥","fromToken":"源代币地址","toToken":"目标代币地址","amount":"数量"}'`);
}); 