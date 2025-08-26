// Battle System Module
class BattleSystem {
    constructor() {
        this.gameState = {
            round: 1,
            playerHP: 100,
            enemyHP: 100,
            playerWins: 0,
            enemyWins: 0,
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
        this.gameState = {
            round: 1,
            playerHP: this.config.MAX_HP || 100,
            enemyHP: this.config.MAX_HP || 100,
            playerWins: 0,
            enemyWins: 0,
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
        
        // 仕草を選択
        this.gameState.currentTell = window.csvLoader.getRandomTell();
        
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
                this.gameState.exposureLevel = Math.min(5, this.gameState.exposureLevel + 1);
                this.gameState.dominanceLevel = Math.max(0, this.gameState.dominanceLevel - 1);
                this.gameState.lastEnemyWin = enemyHand;
                roundResult.damage = damage;
                roundResult.message = `彩人の勝利！${this.handNames[enemyHand]}が${this.handNames[playerHand]}を破った！`;
                break;
                
            case 'draw':
                roundResult.message = `引き分け！両者${this.handNames[playerHand]}！`;
                break;
        }

        // 読み直しペナルティをリセット
        if (isRewind) {
            this.gameState.rewindPenalty = true;
        } else {
            this.gameState.rewindPenalty = false;
        }

        // ラウンド進行
        this.gameState.round++;
        this.gameState.isRoundActive = false;

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
        return { ...this.gameState };
    }
}

// グローバル変数として公開
window.battleSystem = new BattleSystem();