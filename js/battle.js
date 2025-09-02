// Battle System Module
class BattleSystem {
    constructor() {
        this.gameState = {
            round: 1,
            playerHP: 100,
            enemyHP: 100,
            playerWins: 0,
            enemyWins: 0,
            drawCount: 0,
            exposureLevel: 1,
            dominanceLevel: 0,
            provokeCount: 3,
            rewindCount: 1,
            lastEnemyWin: null,
            isProvoked: false,
            provokedHand: null,
            currentTell: null,
            rewindPenalty: false,
            selectedPlayerHand: null,
            isRoundActive: false,
            wasFake: false,
            stats: {
                tellHits: 0,
                provokeHits: 0,
                fakeCount: 0
            }
        };
        
        this.config = {};
        this.handNames = {
            stone: '石拳',
            scissors: '剪刀',
            paper: '布掌'
        };
    }

    // 初期化
    init(config) {
        this.config = config;
        this.resetGame();
    }

    // ゲームリセット
    resetGame() {
        // 栗之助用の追加状態
        this.kurinosukeStoneCount = 0; // 石を出した回数
        this.kurinosukeInStonePattern = false; // 石3回パターン中か
        this.gameState = {
            round: 1,
            playerHP: this.config.MAX_HP || 100,
            enemyHP: this.config.MAX_HP || 100,
            playerWins: 0,
            enemyWins: 0,
            drawCount: 0,
            exposureLevel: 1,
            dominanceLevel: 0,
            provokeCount: this.config.PROVOKE_USES || 3,
            rewindCount: this.config.REWIND_TOKENS || 1,
            lastEnemyWin: null,
            isProvoked: false,
            provokedHand: null,
            currentTell: null,
            rewindPenalty: false,
            selectedPlayerHand: null,
            isRoundActive: false,
            wasFake: false,
            stats: {
                tellHits: 0,
                provokeHits: 0,
                fakeCount: 0
            }
        };
    }

    // 新ラウンド開始
    startNewRound() {
        this.gameState.isRoundActive = true;
        this.gameState.selectedPlayerHand = null;
        this.gameState.isProvoked = false;
        this.gameState.provokedHand = null;
        this.gameState.wasFake = false;
        
        // 栗之助の場合は仕草なし
        if (this.enemyData && this.enemyData.id === 'kurinosuke') {
            this.gameState.currentTell = null;
        } else {
            // 仕草を選択
            this.gameState.currentTell = window.csvLoader.getRandomTell();
        }
        
        return this.gameState.currentTell;
    }

    // プレイヤーの手を選択
    selectPlayerHand(hand) {
        if (!this.gameState.isRoundActive) return false;
        this.gameState.selectedPlayerHand = hand;
        return true;
    }

    // 挑発
    useProvoke() {
        // 栗之助には挑発無効
        if (this.enemyData && this.enemyData.id === 'kurinosuke') {
            return { success: false, message: '栗之助は仕事一筋で挑発に動じない...' };
        }
        
        if (this.gameState.provokeCount <= 0) return { success: false, message: '挑発の使用回数がありません' };
        if (!this.gameState.lastEnemyWin) return { success: false, message: '前回の彩人の勝利手がありません' };
        if (this.gameState.isProvoked) return { success: false, message: 'すでに挑発済みです' };
        
        this.gameState.provokeCount--;
        
        // 75%の確率で成功
        if (Math.random() < this.config.PROVOKE_SUCCESS) {
            this.gameState.isProvoked = true;
            this.gameState.provokedHand = this.gameState.lastEnemyWin;
            this.gameState.stats.provokeHits++;
            return {
                success: true,
                message: `挑発成功！彩人は${this.handNames[this.gameState.lastEnemyWin]}を出しやすくなった！`,
                targetHand: this.gameState.lastEnemyWin
            };
        } else {
            return {
                success: true,
                message: '挑発失敗...彩人は冷静だ',
                targetHand: null
            };
        }
    }

    // 彩人の手を決定
    decideEnemyHand() {
        // 栗之助の特殊パターン処理
        if (this.enemyData && this.enemyData.id === 'kurinosuke') {
            return this.decideKurinosukeHand();
        }
        
        const ayatoData = window.csvLoader.getAyatoData();
        let probs = {
            stone: ayatoData.base_stone || 0.33,
            scissors: ayatoData.base_scissors || 0.34,
            paper: ayatoData.base_paper || 0.33
        };

        // 仕草効果
        if (this.gameState.currentTell) {
            const tellTarget = this.gameState.currentTell.target;
            
            // フェイク判定（5%）
            if (Math.random() < this.config.FAKE_RATE) {
                // フェイク：別の手を強化
                const otherHands = ['stone', 'scissors', 'paper'].filter(h => h !== tellTarget);
                const fakeTarget = otherHands[Math.floor(Math.random() * otherHands.length)];
                probs[fakeTarget] += this.config.TELL_BIAS || 0.20;
                this.gameState.wasFake = true;
                this.gameState.stats.fakeCount++;
            } else {
                // 通常：仕草通りの手を強化
                probs[tellTarget] += this.config.TELL_BIAS || 0.20;
            }
        }

        // 挑発効果
        if (this.gameState.isProvoked && this.gameState.provokedHand) {
            probs[this.gameState.provokedHand] += this.config.PROVOKE_BIAS || 0.20;
        }

        // 確率を正規化
        const total = Object.values(probs).reduce((a, b) => a + b, 0);
        Object.keys(probs).forEach(key => {
            probs[key] /= total;
        });

        // 手を選択
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [hand, prob] of Object.entries(probs)) {
            cumulative += prob;
            if (rand <= cumulative) {
                return hand;
            }
        }
        
        return 'stone'; // フォールバック
    }

    // 勝敗判定
    judgeRound(playerHand, enemyHand) {
        const wins = {
            stone: 'scissors',
            scissors: 'paper',
            paper: 'stone'
        };

        if (wins[playerHand] === enemyHand) {
            return 'player_win';
        } else if (wins[enemyHand] === playerHand) {
            return 'enemy_win';
        } else {
            return 'draw';
        }
    }

    // ラウンド結果処理
    // ラウンド結果処理
    processRoundResult(playerHand, enemyHand, isRewind = false) {
        const result = this.judgeRound(playerHand, enemyHand);
        let damage = this.config.BASE_DAMAGE || 20;
        
        // 読み直しペナルティ
        if (this.gameState.rewindPenalty && result === 'enemy_win') {
            damage += this.config.REWIND_PENALTY || 5;
        }
        
        const roundResult = {
            playerHand: playerHand,
            enemyHand: enemyHand,
            result: result,
            damage: 0,
            wasFake: this.gameState.wasFake,
            wasProvoked: this.gameState.isProvoked,
            currentTell: this.gameState.currentTell,
            message: ''
        };

        // 結果に応じて処理
        switch (result) {
            case 'player_win':
                this.gameState.enemyHP = Math.max(0, this.gameState.enemyHP - damage);
                this.gameState.playerWins++;
                this.gameState.dominanceLevel = Math.min(3, this.gameState.dominanceLevel + 1);
                roundResult.damage = damage;
                roundResult.message = `プレイヤーの勝利！${this.handNames[playerHand]}が${this.handNames[enemyHand]}を破った！`;
                
                // 仕草的中判定
                if (this.gameState.currentTell && !this.gameState.wasFake &&
                    this.gameState.currentTell.target === enemyHand) {
                    this.gameState.stats.tellHits++;
                }
                break;
                
            case 'enemy_win':
                this.gameState.playerHP = Math.max(0, this.gameState.playerHP - damage);
                this.gameState.enemyWins++;
                // this.gameState.exposureLevel = Math.min(5, this.gameState.exposureLevel + 1); // POVで手動変更するためコメントアウト
                this.gameState.dominanceLevel = Math.max(0, this.gameState.dominanceLevel - 1);
                this.gameState.lastEnemyWin = enemyHand;
                roundResult.damage = damage;
                roundResult.message = `彩人の勝利！${this.handNames[enemyHand]}が${this.handNames[playerHand]}を破った！`;
                break;
                
            case 'draw':
                this.gameState.drawCount++;
                console.log('引き分け発生！現在の引き分け数:', this.gameState.drawCount);
                roundResult.message = `引き分け！両者${this.handNames[playerHand]}！`;
                break;
        }

        // 読み直しペナルティをリセット
        if (isRewind) {
            this.gameState.rewindPenalty = true;
        } else {
            this.gameState.rewindPenalty = false;
        }

        // ラウンド進行前のデバッグログ
        console.log(`[ラウンド${this.gameState.round}終了] 結果: ${result}`);
        console.log(`カウント状況 - 勝:${this.gameState.playerWins} 敗:${this.gameState.enemyWins} 引:${this.gameState.drawCount}`);
        console.log(`合計: ${this.gameState.playerWins + this.gameState.enemyWins + this.gameState.drawCount} (ラウンド: ${this.gameState.round})`);

        // ラウンド進行
        this.gameState.round++;
        this.gameState.isRoundActive = false;
        
        console.log(`→ 次はラウンド${this.gameState.round}`);

        return roundResult;
    }

    // 読み直し使用
    useRewind() {
        if (this.gameState.rewindCount <= 0) {
            return { success: false, message: '読み直しトークンがありません' };
        }

        this.gameState.rewindCount--;
        this.gameState.rewindPenalty = true;
        
        return { 
            success: true, 
            message: '読み直し発動！次に負けた場合ダメージ+5' 
        };
    }

    // ゲーム終了判定
    checkGameEnd() {
        // HP0で終了（最優先）
        if (this.gameState.playerHP <= 0) {
            // 露出度5でHP0の場合は特殊敗北
            if (this.gameState.exposureLevel >= 5) {
                return { 
                    ended: true, 
                    winner: 'enemy_special',
                    reason: '限界露出でのHP枯渇敗北'
                };
            }
            return { 
                ended: true, 
                winner: 'enemy',
                reason: 'HP枯渇'
            };
        }
        if (this.gameState.enemyHP <= 0) {
            return { 
                ended: true, 
                winner: 'player',
                reason: 'HP枯渇'
            };
        }

        // 5勝達成での終了
        const winRequirement = 5;
        if (this.gameState.playerWins >= winRequirement) {
            return { 
                ended: true, 
                winner: 'player',
                reason: `${winRequirement}勝達成`
            };
        }
        if (this.gameState.enemyWins >= winRequirement) {
            // 露出度5で5敗の場合は特殊敗北
            if (this.gameState.exposureLevel >= 5) {
                return { 
                    ended: true, 
                    winner: 'enemy_special',
                    reason: '限界露出での5敗'
                };
            }
            return { 
                ended: true, 
                winner: 'enemy',
                reason: `${winRequirement}勝達成`
            };
        }

        // 10ラウンド終了時の判定
        if (this.gameState.round > this.config.MAX_ROUNDS) {
            // 露出度5の場合は特殊処理
            if (this.gameState.exposureLevel >= 5) {
                if (this.gameState.enemyWins > this.gameState.playerWins) {
                    return { 
                        ended: true, 
                        winner: 'enemy_special',
                        reason: '限界露出での判定敗北'
                    };
                } else if (this.gameState.playerWins > this.gameState.enemyWins) {
                    return { 
                        ended: true, 
                        winner: 'player_special',
                        reason: '限界露出からの逆転勝利'
                    };
                } else {
                    // 引き分けでも露出度5なら屈辱的
                    return { 
                        ended: true, 
                        winner: 'enemy_special',
                        reason: '限界露出での引き分け（屈辱）'
                    };
                }
            }
            
            // 通常の10ラウンド終了判定
            if (this.gameState.playerWins > this.gameState.enemyWins) {
                return { 
                    ended: true, 
                    winner: 'player',
                    reason: `勝利数優位（${this.gameState.playerWins}勝${this.gameState.enemyWins}敗）`
                };
            } else if (this.gameState.enemyWins > this.gameState.playerWins) {
                return { 
                    ended: true, 
                    winner: 'enemy',
                    reason: `勝利数劣勢（${this.gameState.playerWins}勝${this.gameState.enemyWins}敗）`
                };
            } else {
                // 勝利数が同じ場合はHP判定
                if (this.gameState.playerHP > this.gameState.enemyHP) {
                    return { 
                        ended: true, 
                        winner: 'player',
                        reason: `HP優位（${this.gameState.playerHP} vs ${this.gameState.enemyHP}）`
                    };
                } else if (this.gameState.enemyHP > this.gameState.playerHP) {
                    return { 
                        ended: true, 
                        winner: 'enemy',
                        reason: `HP劣勢（${this.gameState.playerHP} vs ${this.gameState.enemyHP}）`
                    };
                } else {
                    return { 
                        ended: true, 
                        winner: 'draw',
                        reason: '完全引き分け'
                    };
                }
            }
        }

        return { ended: false };
    }

    // 現在の状態を取得
    getState() {
        console.log('BattleSystem getState - drawCount:', this.gameState.drawCount);
        return { ...this.gameState };
    }
    
    // 露出レベルを設定（POVシステムから使用）
    setExposureLevel(level) {
        this.gameState.exposureLevel = level;
        console.log('BattleSystem - 露出レベル設定:', level);
    }

    // 栗之助の手を決定する特殊ロジック
    // 栗之助の手を決定する特殊ロジック
    decideKurinosukeHand() {
        const kuriData = this.enemyData;
        
        // パニックモード（HP40%以下）
        if (this.gameState.enemyHP <= 40) {
            // 完全ランダム
            const hands = ['stone', 'scissors', 'paper'];
            return hands[Math.floor(Math.random() * hands.length)];
        }
        
        // 最初の3回は必ず石
        if (this.gameState.round <= 3) {
            return 'stone';
        }
        
        // 固定パターン処理（4回目以降の石3回パターン）
        if (this.kurinosukeInStonePattern) {
            // 石3回パターン中
            if (this.kurinosukeStoneCount >= 3) {
                // 3回出し終わった、パターン解除
                this.kurinosukeInStonePattern = false;
                this.kurinosukeStoneCount = 0;
                // 通常の確率処理へ続く（下のコードへ）
            } else {
                // まだ3回に達していないので石を出す
                this.kurinosukeStoneCount++;
                return 'stone';
            }
        }
        
        // 通常の確率処理
        let probs = {
            stone: kuriData.base_stone || 0.80,
            scissors: kuriData.base_scissors || 0.10,
            paper: kuriData.base_paper || 0.10
        };
        
        // 手を選択
        const rand = Math.random();
        let cumulative = 0;
        
        for (const [hand, prob] of Object.entries(probs)) {
            cumulative += prob;
            if (rand <= cumulative) {
                // 石が出たら3回パターン開始
                if (hand === 'stone' && !this.kurinosukeInStonePattern) {
                    this.kurinosukeInStonePattern = true;
                    this.kurinosukeStoneCount = 1;
                }
                return hand;
            }
        }
        
        return 'stone'; // フォールバック
    }
    
    // 幽霊を切り替える
    switchGhost(ghostId) {
        let ghostData = null;
        if (ghostId === 'kurinosuke') {
            ghostData = window.csvLoader.getKurinosukeData();
        } else if (ghostId === 'ayato') {
            ghostData = window.csvLoader.getAyatoData();
        }
        
        if (ghostData) {
            this.enemyData = ghostData;
            // 栗之助パターン用変数リセット
            this.kurinosukeStoneCount = 0;
            this.kurinosukeInStonePattern = false;
            console.log(`幽霊を${ghostData.name}に切り替えました`);
        } else {
            console.error('幽霊データが見つかりません:', ghostId);
        }
    }
}

// グローバル変数として公開
window.battleSystem = new BattleSystem();

// POV演出システム
class POVSystem {
    constructor() {
        this.currentPOV = 'suzune'; // suzune, ayato, tension
        this.isTransitioning = false;
        this.battleScreen = document.querySelector('.battle-screen');
        this.povIndicator = document.getElementById('pov-indicator');
        this.povOverlay = document.getElementById('pov-overlay');
        this.mindText = document.getElementById('mind-text');
        
        this.povTexts = {
            suzune: '鈴音の視点',
            ayato: '彩人の視点', 
            tension: '緊張の瞬間'
        };
        
        this.mindTexts = {
            provoke: {
                success: '（こいつ、挑発にのってきた...！）',
                fail: '（挑発が効かない...警戒されている）'
            },
            fake: '（フフフ...この仕草に騙されるがよい...）',
            crisis_ayato: '（まずい...このままでは負けてしまう...！）',
            crisis_suzune: '（集中...彩人の動きを読まなければ...）',
            final_round: '（これで最後...全てが決まる）'
        };
    }

    // POV切り替えメイン関数
    changePOV(newPOV, options = {}) {
        if (this.isTransitioning || this.currentPOV === newPOV) return;
        
        this.isTransitioning = true;
        const duration = options.duration || 1200;
        const showMindText = options.mindText;
        
        // 切り替え開始演出
        this.battleScreen.classList.add('pov-transitioning');
        if (options.showOverlay) {
            this.povOverlay.classList.add('active');
        }
        
        setTimeout(() => {
            // POVクラス変更
            this.battleScreen.classList.remove(`pov-${this.currentPOV}`);
            this.battleScreen.classList.add(`pov-${newPOV}`);
            this.currentPOV = newPOV;
            
            // インジケーター更新
            this.updatePOVIndicator(newPOV);
            
            // 心理テキスト表示
            if (showMindText) {
                this.showMindText(showMindText);
            }
        }, duration / 2);
        
        setTimeout(() => {
            // 切り替え終了
            this.battleScreen.classList.remove('pov-transitioning');
            this.povOverlay.classList.remove('active');
            this.isTransitioning = false;
        }, duration);
    }

    // POVインジケーター更新
    updatePOVIndicator(pov) {
        this.povIndicator.textContent = this.povTexts[pov];
        this.povIndicator.classList.remove('visible');
        
        setTimeout(() => {
            this.povIndicator.classList.add('visible');
        }, 100);
        
        setTimeout(() => {
            this.povIndicator.classList.remove('visible');
        }, 3000);
    }

    // 心理描写テキスト表示
    showMindText(textKey, customText = null) {
        let text = customText;
        
        if (!text) {
            // ネストしたキーへのアクセス対応 (例: 'provoke.success')
            if (textKey.includes('.')) {
                const keys = textKey.split('.');
                text = this.mindTexts[keys[0]][keys[1]];
            } else {
                text = this.mindTexts[textKey];
            }
        }
        
        if (!text) return;
        
        this.mindText.textContent = text;
        this.mindText.classList.add('show');
        
        setTimeout(() => {
            this.mindText.classList.remove('show');
        }, 3000);
    }

    // 自動POV判定と切り替え
    autoChangePOV(gameState, event) {
        const { round, playerHP, enemyHP, exposureLevel } = gameState;
        
        switch (event) {
            case 'provoke_success':
                this.changePOV('ayato', {
                    duration: 1000,
                    mindText: 'provoke.success',
                    showOverlay: true
                });
                break;
                
            case 'provoke_fail':
                this.changePOV('ayato', {
                    duration: 800,
                    mindText: 'provoke.fail'
                });
                break;
                
            case 'fake_tell':
                this.changePOV('ayato', {
                    duration: 1200,
                    mindText: 'fake',
                    showOverlay: true
                });
                setTimeout(() => this.changePOV('suzune'), 3500);
                break;
                
            case 'ayato_crisis':
                if (enemyHP <= 30) {
                    this.changePOV('ayato', {
                        duration: 1000,
                        mindText: 'crisis_ayato'
                    });
                }
                break;
                
            case 'suzune_crisis':
                if (playerHP <= 30) {
                    this.changePOV('suzune', {
                        duration: 800,
                        mindText: 'crisis_suzune'
                    });
                }
                break;
                
            case 'final_round':
                if (round === 10) {
                    this.changePOV('tension', {
                        duration: 1500,
                        mindText: 'final_round',
                        showOverlay: true
                    });
                }
                break;
                
            case 'exposure_change':
                if (exposureLevel >= 3) {
                    this.changePOV('tension', {
                        duration: 1000,
                        showOverlay: true
                    });
                    setTimeout(() => this.changePOV('suzune'), 2500);
                }
                break;
                
            case 'round_start':
                // 通常視点に戻す（特殊条件でない限り）
                if (this.currentPOV !== 'suzune' && round < 10) {
                    setTimeout(() => this.changePOV('suzune'), 500);
                }
                break;
        }
    }

    // デバッグ用：手動POV切り替え
    debugChangePOV(pov) {
        this.changePOV(pov, { duration: 800 });
    }
    
    // 現在のPOV取得
    getCurrentPOV() {
        return this.currentPOV;
    }
}

// POVシステムをグローバル変数として公開
window.povSystem = new POVSystem();

// 敗北時POV演出システム
class DefeatPOVSystem {
    constructor() {
        this.isActive = false;
        this.povMode = null;
        this.ghostHand = null;
        this.suzuneExpression = null;
        this.povInstruction = null;
        this.povExitBtn = null;
        this.isInitialized = false;
        
        this.expressions = {
            1: '困った顔',
            2: '少し赤面',
            3: '恥ずかしそう',
            4: '涙目',
            5: '項垂れ'
        };
    }
    
    // DOM要素を初期化
    initializeDOM() {
        if (this.isInitialized) return true;
        
        this.povMode = document.getElementById('pov-mode');
        this.ghostHand = document.getElementById('ghost-hand');
        this.suzuneExpression = document.getElementById('suzune-expression');
        this.povInstruction = document.getElementById('pov-instruction');
        this.povExitBtn = document.getElementById('pov-exit-btn');
        
        if (!this.povMode || !this.ghostHand || !this.suzuneExpression || !this.povInstruction || !this.povExitBtn) {
            console.error('POV要素が見つかりません:', {
                povMode: !!this.povMode,
                ghostHand: !!this.ghostHand,
                suzuneExpression: !!this.suzuneExpression,
                povInstruction: !!this.povInstruction,
                povExitBtn: !!this.povExitBtn
            });
            return false;
        }
        
        this.setupEventListeners();
        this.isInitialized = true;
        console.log('POVシステムが正常に初期化されました');
        return true;
    }
    
    setupEventListeners() {
        // 服のクリックエリア
        const clothingArea = document.getElementById('clothing-click-area');
        if (clothingArea) {
            clothingArea.addEventListener('click', () => {
                if (this.isActive) {
                    this.onClothingClick();
                }
            });
        }
        
        // 幽霊の手クリック（非推奨だが残しておく）
        this.ghostHand.addEventListener('click', () => {
            if (this.isActive) {
                this.onHandClick();
            }
        });
        
        // 戻るボタン
        this.povExitBtn.addEventListener('click', () => {
            this.exitPOVMode();
        });
        
        // ESCキーで終了
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isActive) {
                this.exitPOVMode();
            }
        });
    }
    
    // POV演出開始
    enterPOVMode(currentExposureLevel = 1, nextExposureLevel = null) {
        console.log('enterPOVMode呼び出し - 現在の露出レベル:', currentExposureLevel);
        console.log('掴んだ後の露出レベル:', nextExposureLevel);
        
        // DOM要素を初期化
        if (!this.initializeDOM()) {
            console.error('DOM初期化に失敗しました');
            return;
        }
        
        console.log('DOM初期化成功');
        
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentExposureLevel = currentExposureLevel;
        this.nextExposureLevel = nextExposureLevel || currentExposureLevel + 1;
        
        // 表情を現在のレベルで更新
        this.suzuneExpression.textContent = this.expressions[currentExposureLevel] || this.expressions[1];
        
        // 服装を現在の露出レベルで表示（敗北前の状態）
        this.updateClothing(currentExposureLevel);
        
        // POVモード表示
        this.povMode.style.display = 'block';
        this.povMode.classList.add('show');
        
        // 指示テキスト更新
        this.povInstruction.textContent = '服をクリックして操作してください';
        
        console.log('POV演出開始 - 露出レベル:', exposureLevel);
    }
    
    // 服装を露出レベルに応じて更新
    updateClothing(exposureLevel) {
        const clothing = document.getElementById('suzune-clothing');
        if (!clothing) return;
        
        // CSVデータから露出レベルに応じた服装を取得
        if (window.csvLoader) {
            const exposureData = window.csvLoader.getExposureLevel(exposureLevel);
            if (exposureData && exposureData.player_image) {
                clothing.textContent = exposureData.player_image;
                console.log('POV服装更新:', exposureLevel, '->', exposureData.player_image);
            } else {
                // フォールバック：レベルに応じたデフォルト服装
                const defaultClothing = {
                    1: '👘', // 完全装備
                    2: '🎽', // 上着脱衣
                    3: '👙', // 軽装
                    4: '💋', // 肌露出
                    5: '❤️'  // 限界露出
                };
                clothing.textContent = defaultClothing[exposureLevel] || '👘';
                console.log('POV服装更新（フォールバック）:', exposureLevel, '->', defaultClothing[exposureLevel]);
            }
        } else {
            console.error('csvLoaderが見つかりません');
        }
    }
    
    // 服クリック時の処理（推奨）
    onClothingClick() {
        if (!this.isActive || !this.initializeDOM()) return;
        
        // 手の絵文字を開いた手から掴んだ手に変更
        const handEmoji = document.querySelector('.hand-emoji');
        if (handEmoji) {
            handEmoji.textContent = '👊';
        }
        
        // 手が服を掴む動作
        this.ghostHand.classList.add('grabbing');
        
        // 服の反応（引っ張られる感じ）
        const clothing = document.getElementById('suzune-clothing');
        if (clothing) {
            clothing.style.transform = 'scale(0.98) rotate(-3deg) translateX(-2px)';
            clothing.style.filter = 'brightness(0.95)';
        }
        
        setTimeout(() => {
            // 服を次の露出レベルに変更
            this.updateClothing(this.nextExposureLevel);
            
            // 表情も次のレベルに更新
            this.suzuneExpression.textContent = this.expressions[this.nextExposureLevel] || this.expressions[1];
            
            // バトルシステムの露出レベルを実際に更新
            if (window.battleSystem) {
                window.battleSystem.setExposureLevel(this.nextExposureLevel);
                console.log('露出レベル更新:', this.currentExposureLevel, '→', this.nextExposureLevel);
            }
            
            this.ghostHand.classList.remove('grabbing');
            if (clothing) {
                clothing.style.transform = 'scale(1) rotate(0deg) translateX(0px)';
                clothing.style.filter = 'brightness(1)';
            }
            // 手を元に戻す
            if (handEmoji) {
                handEmoji.textContent = '✊';
            }
        }, 800);
        
        // 指示テキスト更新
        this.povInstruction.textContent = '服を掴みました！戻るボタンを押してください';
        
        console.log('服がクリックされました - 掴む動作実行');
    }
    
    // 手クリック時の処理（従来版）
    onHandClick() {
        if (!this.isActive || !this.initializeDOM()) return;
        
        // クリックアニメーション
        this.ghostHand.classList.add('clicking');
        setTimeout(() => {
            this.ghostHand.classList.remove('clicking');
        }, 300);
        
        // 指示テキスト更新
        this.povInstruction.textContent = '操作完了！戻るボタンを押してください';
        
        console.log('幽霊の手がクリックされました');
    }
    
    // POV演出終了
    exitPOVMode() {
        if (!this.isActive || !this.initializeDOM()) return;
        
        this.povMode.classList.remove('show');
        this.povMode.classList.add('hide');
        
        setTimeout(() => {
            this.povMode.style.display = 'none';
            this.povMode.classList.remove('hide');
            this.isActive = false;
            
            // POV終了後にpendingModalがあれば表示
            if (window.gameController && window.gameController.pendingModal) {
                window.gameController.elements.resultModal.classList.remove('hidden');
                window.gameController.pendingModal = false;
                // モーダル表示時はUI更新をスキップ（ゲーム終了状態を維持）
            } else {
                // 戦闘画面のUIを更新（露出レベル変更を反映）
                if (window.gameController) {
                    window.gameController.updateUI();
                    console.log('POV終了 - 戦闘画面UI更新完了');
                }
            }
            
            console.log('POV演出終了');
        }, 500);
    }
    
    // 現在の状態を取得
    isActivePOV() {
        return this.isActive;
    }
}

// 体験版終了画面システム
class DemoEndingSystem {
    constructor() {
        this.isActive = false;
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.typewriterTimer = null;
        this.isTyping = false;
        
        this.endingTexts = [
            "『体験版をお楽しみいただけましたか？』",
            "",
            "製品版の淫霊たちは、もっと... 激しく求めてきます。",
            "",
            "地下階段を降りるにつれて、",
            "独特な嗜好を持っている淫霊達が..",
            "",
            "個性あふれる特殊攻撃や癖を駆使して、",
            "鈴音の「すべて」を奪おうとしてくるでしょう。",
            "",
            "そして最深部のボスに至っては、",
            "負けた者を「永遠の愛玩人形」にすると言われています。",
            "",
            "果たして鈴音は、純潔...いえ、",
            "淫術士としての誇りを守り抜けるのか。",
            "",
            "それとも、快楽...ではなく、",
            "淫霊たちの虜になってしまうのか。",
            "",
            "『その結末は、あなた次第です』",
            "",
            "── 製品版で、完全決着 ──"
        ];
    }
    
    // 体験版終了画面を開始
    startDemoEnding() {
        console.log('体験版終了画面開始');
        
        const demoScreen = document.getElementById('demo-ending-screen');
        const endingText = document.getElementById('ending-text');
        const endingControls = document.getElementById('ending-controls');
        
        if (!demoScreen || !endingText) {
            console.error('体験版終了画面の要素が見つかりません');
            return;
        }
        
        // 画面を表示
        demoScreen.style.display = 'block';
        this.isActive = true;
        
        // テキストクリア
        endingText.innerHTML = '';
        endingControls.style.display = 'none';
        
        // タイプライター開始
        this.currentTextIndex = 0;
        this.currentCharIndex = 0;
        this.startTypewriter();
        
        // イベントリスナー設定
        this.setupEventListeners();
    }
    
    // タイプライター演出開始
    startTypewriter() {
        if (this.currentTextIndex >= this.endingTexts.length) {
            // 全テキスト終了、ボタンを表示
            this.showControls();
            return;
        }
        
        this.isTyping = true;
        const currentText = this.endingTexts[this.currentTextIndex];
        
        if (currentText === "") {
            // 空行の場合はすぐに次へ
            this.addTextLine("");
            this.currentTextIndex++;
            setTimeout(() => this.startTypewriter(), 500);
            return;
        }
        
        this.currentCharIndex = 0;
        this.typeNextChar();
    }
    
    // 次の文字をタイプ
    typeNextChar() {
        if (!this.isActive) return;
        
        const currentText = this.endingTexts[this.currentTextIndex];
        
        if (this.currentCharIndex >= currentText.length) {
            // 現在行終了
            this.isTyping = false;
            this.currentTextIndex++;
            
            // 次の行まで少し待機
            setTimeout(() => {
                this.startTypewriter();
            }, 800);
            return;
        }
        
        // 現在の行を更新
        const displayText = currentText.substring(0, this.currentCharIndex + 1);
        this.updateCurrentLine(displayText);
        
        this.currentCharIndex++;
        
        // 次の文字まで待機（文字によって速度調整）
        const char = currentText[this.currentCharIndex - 1];
        let delay = 50; // 基本速度
        
        if (char === '。' || char === '！' || char === '？') {
            delay = 300; // 句読点で長めの停止
        } else if (char === '、' || char === '，') {
            delay = 150; // 読点で短い停止
        } else if (char === '『' || char === '』' || char === '「' || char === '」') {
            delay = 100; // 括弧で少し停止
        }
        
        this.typewriterTimer = setTimeout(() => this.typeNextChar(), delay);
    }
    
    // 現在行を更新
    updateCurrentLine(text) {
        const endingText = document.getElementById('ending-text');
        if (!endingText) return;
        
        // 既存の行を取得
        const lines = endingText.querySelectorAll('.ending-line');
        
        if (lines.length === 0 || lines[lines.length - 1].classList.contains('complete')) {
            // 新しい行を追加
            this.addTextLine(text);
        } else {
            // 最後の行を更新
            lines[lines.length - 1].textContent = text;
        }
    }
    
    // テキスト行を追加
    addTextLine(text) {
        const endingText = document.getElementById('ending-text');
        if (!endingText) return;
        
        const line = document.createElement('div');
        line.className = 'ending-line';
        line.textContent = text;
        
        // 空行の場合は高さを調整
        if (text === "") {
            line.style.height = '0.5em';
        }
        
        endingText.appendChild(line);
        
        // 行が完成した場合はマーク
        if (!this.isTyping || this.currentCharIndex >= this.endingTexts[this.currentTextIndex].length) {
            line.classList.add('complete');
        }
        
        // スクロール調整
        line.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    
    // コントロールボタンを表示
    showControls() {
        const endingControls = document.getElementById('ending-controls');
        if (endingControls) {
            setTimeout(() => {
                endingControls.style.display = 'block';
                endingControls.style.opacity = '0';
                endingControls.style.transition = 'opacity 1s ease-in';
                
                setTimeout(() => {
                    endingControls.style.opacity = '1';
                }, 100);
            }, 1000);
        }
    }
    
    // イベントリスナー設定
    setupEventListeners() {
        const restartBtn = document.getElementById('restart-demo');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                this.restartDemo();
            });
        }
        
        // スキップ機能（スペースキー）
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.isActive) {
                this.skipTypewriter();
            }
        });
        
        // クリックでスキップ
        const demoScreen = document.getElementById('demo-ending-screen');
        if (demoScreen) {
            demoScreen.addEventListener('click', () => {
                if (this.isActive && this.isTyping) {
                    this.skipTypewriter();
                }
            });
        }
    }
    
    // タイプライターをスキップ
    skipTypewriter() {
        if (!this.isTyping) return;
        
        // タイマーをクリア
        if (this.typewriterTimer) {
            clearTimeout(this.typewriterTimer);
        }
        
        // 全テキストを即座に表示
        const endingText = document.getElementById('ending-text');
        if (endingText) {
            endingText.innerHTML = '';
            
            this.endingTexts.forEach(text => {
                this.addTextLine(text);
            });
        }
        
        this.isTyping = false;
        this.showControls();
    }
    
    // 体験版を再開
    restartDemo() {
        // 終了画面を隠す
        const demoScreen = document.getElementById('demo-ending-screen');
        if (demoScreen) {
            demoScreen.style.display = 'none';
        }
        
        this.isActive = false;
        
        // ゲームを最初から再開
        if (window.gameController) {
            // 彩人戦に戻る
            window.gameController.currentGhost = 'ayato';
            window.battleSystem.switchGhost('ayato');
            window.gameController.updateGhostUI();
            window.gameController.restartGame();
        }
    }
    
    // 現在の状態を取得
    isActiveEnding() {
        return this.isActive;
    }
}

// グローバル変数として公開
window.demoEndingSystem = new DemoEndingSystem();

// 敗北時POVシステムをグローバル変数として公開
window.defeatPOVSystem = new DefeatPOVSystem();