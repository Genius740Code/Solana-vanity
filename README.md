# 🚀 Fast Solana Vanity Generator

A high-performance, multi-threaded Solana vanity address generator that can search for custom patterns in wallet addresses.

## ⚠️ **SECURITY WARNING**

**CRITICAL SECURITY NOTICES:**
- **Keep private keys secure**: Never share your private keys with anyone
- **Verify addresses**: Always verify generated addresses before sending funds
- **Phishing protection**: Vanity addresses can be used for phishing - always verify you're interacting with legitimate services
- **This tool is for educational/personal use only**
- **You are responsible for the security of your generated wallets**

## ✨ Features

- 🔥 **Ultra-fast generation** with multi-threading support
- 🎯 **Multiple search terms** - search for several patterns simultaneously
- ⚡ **Max speed mode** for maximum performance
- 📊 **Real-time statistics** and progress tracking
- 💾 **Auto-save results** to JSON file
- 🔧 **Configurable workers** and batch sizes
- 📝 **Quality scoring** for matched addresses

## 🛠️ Installation

### Prerequisites
- Node.js 14+ 
- npm or yarn

### Install Dependencies
```bash
npm install @solana/web3.js bs58
```

### Download
```bash
git clone https://github.com/Genius740Code/Solana-vanity.git
cd fast-solana-vanity-generator
npm install
```

## 🚀 Usage

### Basic Usage
```bash
# Search for addresses containing "moon"
node vanity.js moon

# Search for multiple terms
node vanity.js moon doge pump

# Case sensitive search
node vanity.js Moon --case

# Maximum speed mode (uses more CPU)
node vanity.js moon --max-speed
```

### Advanced Options
```bash
# Custom worker count
node vanity.js moon --workers=8

# Custom batch size (higher = more memory, potentially faster)
node vanity.js moon --batch=100000

# Limit results (stop after finding N addresses)
node vanity.js moon --limit=5

# Custom output file
node vanity.js moon --output=my-addresses.json
```

### Complete Example
```bash
node vanity.js sol pump moon --max-speed --workers=12 --limit=10 --output=my-vanity.json
```

## ⚙️ Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `--case` | Case sensitive search | false |
| `--max-speed` | Maximum performance mode | false |
| `--workers=N` | Number of worker threads | CPU cores |
| `--batch=N` | Addresses per batch | 50,000 (100,000 in max-speed) |
| `--limit=N` | Stop after N results | ∞ |
| `--output=file` | Output filename | `vanity-{timestamp}.json` |

## 📈 Performance

### Expected Rates
- **Standard mode**: ~50,000-200,000 addresses/second
- **Max speed mode**: ~100,000-500,000 addresses/second
- **Performance varies by**: CPU cores, search term difficulty, system resources

### Optimization Tips
- Use `--max-speed` for maximum performance
- Increase `--workers` for more CPU cores
- Increase `--batch` size for better throughput (uses more RAM)
- Shorter search terms = faster results
- Case-insensitive search is faster

## 📊 Output Format

Results are saved to JSON file:
```json
{
  "searchTerms": ["moon"],
  "startTime": "2024-01-01T12:00:00.000Z",
  "results": [
    {
      "id": 1,
      "publicKey": "MoonXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      "privateKey": "[PRIVATE_KEY_BASE58]",
      "matchedTerm": "moon",
      "quality": 30,
      "timestamp": "2024-01-01T12:05:30.000Z",
      "attempts": 1234567
    }
  ],
  "stats": {
    "found": 1,
    "attempts": 1234567,
    "rate": 125000
  }
}
```

## 🔒 Security Best Practices

### For Users
1. **Never share private keys** - They control your wallet completely
2. **Store keys securely** - Use hardware wallets or encrypted storage
3. **Verify addresses** - Always double-check before sending funds
4. **Use offline** - Run on air-gapped systems for maximum security
5. **Delete when done** - Remove private keys from the system after use

### For Developers
1. **Audit before use** - Review the code for any security issues
2. **Secure entropy** - Uses crypto.randomBytes() for cryptographic randomness
3. **No network calls** - Fully offline operation
4. **Memory handling** - Private keys are not unnecessarily duplicated

## 🚨 Important Warnings

- **Vanity addresses are NOT more secure** - They have the same security as regular addresses
- **Beware of phishing** - Scammers may create similar-looking addresses
- **Computational cost** - Longer/more specific patterns take exponentially longer
- **No guarantee** - Some patterns may take years to find
- **Resource intensive** - Will use significant CPU and electricity

## 🧮 Probability & Time Estimates

Rough estimates for finding patterns:
- 3 characters: ~1-10 minutes
- 4 characters: ~1-6 hours  
- 5 characters: ~1-7 days
- 6 characters: ~2-12 months
- 7+ characters: Years to decades

*Estimates vary greatly based on pattern, hardware, and luck*

## 🛡️ Security Audit Checklist

- ✅ Uses cryptographically secure random number generation
- ✅ No network communication (fully offline)
- ✅ No hardcoded secrets or backdoors
- ✅ Standard Solana key generation process
- ✅ Private keys properly encoded with bs58
- ✅ No logging of private keys to console (except results)
- ✅ Graceful shutdown handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## ⚖️ License

MIT License - see [LICENSE](LICENSE) file for details.

## 🚫 Disclaimer

**This software is provided "as is" without warranty of any kind. Use at your own risk.**

- Not responsible for lost funds or security breaches
- Cryptocurrency investments carry inherent risks
- Always verify addresses and transactions
- Keep private keys secure and private
- This tool is for educational and personal use only

## 📞 Support

- Open an issue for bugs or feature requests
- Check existing issues before creating new ones
- Provide system info and error details for bug reports

---

**⚠️ Remember: With great private keys comes great responsibility!**