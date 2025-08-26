// CSV Loader Module
class CSVLoader {
    constructor() {
        this.data = {
            config: {},
            ayato: {},
            tells: [],
            exposureLevels: []
        };
    }

    // CSVファイルを読み込む
    async loadCSV(filename) {
        try {
            const response = await fetch(`data/${filename}`);
            const text = await response.text();
            return this.parseCSV(text);
        } catch (error) {
            console.error(`Error loading CSV file ${filename}:`, error);
            return null;
        }
    }

    // CSV文字列を解析
    parseCSV(text) {
        // BOMを除去
        text = text.replace(/^\uFEFF/, '');
        
        const lines = text.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const rows = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            
            headers.forEach((header, index) => {
                let value = values[index];
                
                // 数値に変換可能な場合は変換
                if (!isNaN(value) && value !== '') {
                    value = parseFloat(value);
                }
                
                row[header] = value;
            });
            
            rows.push(row);
        }

        return rows;
    }

    // 全CSVファイルを読み込んで初期化
    async init() {
        try {
            // config.csv読み込み
            const configData = await this.loadCSV('config.csv');
            if (configData) {
                configData.forEach(row => {
                    this.data.config[row.key] = row.value;
                });
            }

            // ayato.csv読み込み
            const ayatoData = await this.loadCSV('ayato.csv');
            if (ayatoData && ayatoData.length > 0) {
                this.data.ayato = ayatoData[0];
            }

            // tells.csv読み込み
            const tellsData = await this.loadCSV('tells.csv');
            if (tellsData) {
                this.data.tells = tellsData;
            }

            // exposure_levels.csv読み込み
            const exposureData = await this.loadCSV('exposure_levels.csv');
            if (exposureData) {
                this.data.exposureLevels = exposureData;
            }

            console.log('CSV data loaded successfully:', this.data);
            return this.data;

        } catch (error) {
            console.error('Error initializing CSV data:', error);
            return null;
        }
    }

    // 設定値を取得
    getConfig(key) {
        return this.data.config[key] || null;
    }

    // 彩人データを取得
    getAyatoData() {
        return this.data.ayato;
    }

    // 仕草データを取得
    getTells() {
        return this.data.tells;
    }

    // ランダムに仕草を選択
    getRandomTell() {
        // 20%の確率で仕草なし
        if (Math.random() < this.getConfig('NO_TELL_RATE')) {
            return null;
        }

        const tells = this.getTells();
        if (tells.length === 0) return null;

        const randomIndex = Math.floor(Math.random() * tells.length);
        return tells[randomIndex];
    }

    // 露出レベルデータを取得
    getExposureLevel(level) {
        const levels = this.data.exposureLevels;
        return levels.find(l => l.level == level) || null;
    }
}

// グローバル変数として公開
window.csvLoader = new CSVLoader();