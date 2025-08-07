const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const crypto = require('crypto');
const fs = require('fs');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const os = require('os');

class FastVanityGenerator {
    constructor(searchTerms, options = {}) {
        // Support multiple search terms
        this.searchTerms = Array.isArray(searchTerms) 
            ? searchTerms.map(term => options.caseSensitive ? term : term.toLowerCase())
            : [options.caseSensitive ? searchTerms : searchTerms.toLowerCase()];
        
        this.caseSensitive = options.caseSensitive || false;
        this.workers = options.workers || (options.maxSpeed ? os.cpus().length * 2 : os.cpus().length);
        this.maxResults = options.maxResults || Infinity;
        this.batchSize = options.batchSize || (options.maxSpeed ? 100000 : 50000);
        this.outputFile = options.outputFile || `vanity-${Date.now()}.json`;
        this.maxSpeed = options.maxSpeed || false;
        
        this.results = [];
        this.startTime = Date.now();
        this.totalAttempts = 0;
        this.rates = [];
        
        this.initOutput();
    }

    initOutput() {
        const data = {
            searchTerms: this.searchTerms,
            startTime: new Date().toISOString(),
            results: [],
            stats: { found: 0, attempts: 0, rate: 0 }
        };
        fs.writeFileSync(this.outputFile, JSON.stringify(data, null, 2));
        
        console.log(`🚀 Searching for: ${this.searchTerms.join(', ')}`);
        console.log(`⚡ Workers: ${this.workers} | Batch: ${this.batchSize.toLocaleString()}`);
        console.log(`🔥 Max speed mode: ${this.maxSpeed ? 'ON' : 'OFF'}`);
        console.log('━'.repeat(60));
    }

    async start() {
        return new Promise((resolve) => {
            const workers = [];
            let isRunning = true;

            // Graceful shutdown
            process.on('SIGINT', () => {
                isRunning = false;
                workers.forEach(w => w.terminate());
                this.showFinalStats();
                process.exit(0);
            });

            // Spawn workers
            for (let i = 0; i < this.workers; i++) {
                const worker = new Worker(__filename, {
                    workerData: {
                        searchTerms: this.searchTerms,
                        caseSensitive: this.caseSensitive,
                        batchSize: this.batchSize,
                        workerId: i,
                        maxSpeed: this.maxSpeed
                    }
                });

                worker.on('message', (msg) => {
                    if (!isRunning) return;

                    if (msg.found) {
                        this.handleResult(msg);
                        if (this.results.length >= this.maxResults) {
                            isRunning = false;
                            workers.forEach(w => w.terminate());
                            resolve(this.results);
                        }
                    } else {
                        this.totalAttempts += msg.attempts;
                        this.updateProgress();
                    }
                });

                workers.push(worker);
            }
        });
    }

    handleResult(result) {
        const data = {
            id: this.results.length + 1,
            publicKey: result.publicKey,
            privateKey: result.privateKey,
            matchedTerm: result.matchedTerm,
            quality: this.getQuality(result.publicKey),
            timestamp: new Date().toISOString(),
            attempts: this.totalAttempts
        };

        this.results.push(data);
        this.updateFile(data);
        
        console.log(`\n🎉 FOUND #${data.id}: ${result.publicKey}`);
        console.log(`🔑 Private: ${result.privateKey}`);
        console.log(`🎯 Term: "${result.matchedTerm}" | Quality: ${data.quality}`);
    }

    getQuality(address) {
        let score = 0;
        const addr = this.caseSensitive ? address : address.toLowerCase();
        
        for (const term of this.searchTerms) {
            if (addr.includes(term)) {
                score += 10;
                if (addr.startsWith(term)) score += 20;
                if (addr.endsWith(term)) score += 15;
                const matches = (addr.match(new RegExp(term, 'g')) || []).length;
                score += (matches - 1) * 5;
            }
        }
        return score;
    }

    updateFile(newResult) {
        try {
            const data = JSON.parse(fs.readFileSync(this.outputFile, 'utf8'));
            data.results.push(newResult);
            data.stats = {
                found: this.results.length,
                attempts: this.totalAttempts,
                rate: Math.round(this.totalAttempts / ((Date.now() - this.startTime) / 1000))
            };
            fs.writeFileSync(this.outputFile, JSON.stringify(data, null, 2));
        } catch (e) {}
    }

    updateProgress() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const rate = Math.round(this.totalAttempts / elapsed);
        
        this.rates.push(rate);
        if (this.rates.length > 5) this.rates.shift();
        
        const avgRate = Math.round(this.rates.reduce((a, b) => a + b) / this.rates.length);
        const time = elapsed > 3600 ? `${Math.floor(elapsed/3600)}h${Math.floor((elapsed%3600)/60)}m` 
                    : elapsed > 60 ? `${Math.floor(elapsed/60)}m${Math.floor(elapsed%60)}s` 
                    : `${Math.floor(elapsed)}s`;
        
        process.stdout.write(`\r⚡ ${this.totalAttempts.toLocaleString()} attempts | ${avgRate.toLocaleString()}/s | Found: ${this.results.length} | ${time}     `);
    }

    showFinalStats() {
        const elapsed = (Date.now() - this.startTime) / 1000;
        const avgRate = Math.round(this.totalAttempts / elapsed);
        
        console.log('\n🏁 FINAL STATS');
        console.log(`📊 Found: ${this.results.length} | Attempts: ${this.totalAttempts.toLocaleString()}`);
        console.log(`⚡ Average rate: ${avgRate.toLocaleString()}/s | Time: ${Math.floor(elapsed)}s`);
        console.log(`📁 Results: ${this.outputFile}`);
    }
}

// Ultra-fast worker implementation
if (!isMainThread) {
    const { searchTerms, caseSensitive, batchSize, workerId, maxSpeed } = workerData;
    
    // Pre-allocate buffers for max speed
    const seedBuffer = maxSpeed ? new Uint8Array(32) : null;
    
    const fastGenerate = () => {
        let seed;
        if (maxSpeed && seedBuffer) {
            crypto.getRandomValues(seedBuffer);
            seed = seedBuffer;
        } else {
            seed = crypto.randomBytes(32);
        }
        
        const keypair = Keypair.fromSeed(seed);
        const publicKey = keypair.publicKey.toBase58();
        const checkAddr = caseSensitive ? publicKey : publicKey.toLowerCase();
        
        // Check all search terms at once
        for (const term of searchTerms) {
            if (checkAddr.includes(term)) {
                return {
                    found: true,
                    publicKey,
                    privateKey: bs58.encode(keypair.secretKey),
                    matchedTerm: term,
                    workerId
                };
            }
        }
        return null;
    };

    let attempts = 0;
    const runBatch = () => {
        for (let i = 0; i < batchSize; i++) {
            attempts++;
            const result = fastGenerate();
            if (result) {
                parentPort.postMessage(result);
                attempts = 0;
            }
        }
        
        parentPort.postMessage({ attempts, workerId });
        attempts = 0;
        setImmediate(runBatch);
    };
    
    runBatch();
}

// Main execution
if (isMainThread && require.main === module) {
    const args = process.argv.slice(2);
    
    if (!args.length) {
        console.log('🎯 Fast Solana Vanity Generator');
        console.log('Usage: node vanity.js <word1> [word2] [word3] [options]');
        console.log('\nOptions:');
        console.log('  --case            Case sensitive');
        console.log('  --max-speed       Maximum performance mode');
        console.log('  --workers=N       Number of workers');
        console.log('  --batch=N         Batch size');
        console.log('  --limit=N         Stop after N results');
        console.log('  --output=file     Output filename');
        console.log('\nExamples:');
        console.log('  node vanity.js moon');
        console.log('  node vanity.js moon doge pump --max-speed');
        console.log('  node vanity.js Moon --case --limit=5');
        process.exit(1);
    }
    
    const searchTerms = [];
    const options = {};
    
    for (const arg of args) {
        if (arg.startsWith('--')) {
            const [key, value] = arg.slice(2).split('=');
            switch (key) {
                case 'case': options.caseSensitive = true; break;
                case 'max-speed': options.maxSpeed = true; break;
                case 'workers': options.workers = parseInt(value); break;
                case 'batch': options.batchSize = parseInt(value); break;
                case 'limit': options.maxResults = parseInt(value); break;
                case 'output': options.outputFile = value; break;
            }
        } else {
            searchTerms.push(arg);
        }
    }
    
    const generator = new FastVanityGenerator(searchTerms, options);
    generator.start().catch(console.error);
}

module.exports = FastVanityGenerator;