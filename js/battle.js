// Battle System Module
class BattleSystem {
    constructor() {
        this.gameState = {
            round: 1,  // 1から開始（現在のラウンド番号）
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
        
        // 太郎の適応型AI用変数
        this.taroLastPlayerHand = null;  // プレイヤーの前回の手
        this.taroConsecutiveLosses = 0;  // プレイヤーの連敗数
        this.taroFriendshipMode = false; // 友情モード
        this.gameState = {
            round: 1,  // 1から開始（現在のラウンド番号）
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
        // 新しいラウンドの開始
        this.gameState.isRoundActive = true;
        this.gameState.selectedPlayerHand = null;
        this.gameState.isProvoked = false;
        this.gameState.provokedHand = null;
        this.gameState.wasFake = false;
        
        // 敵データのデバッグログ
        console.log('prepareRound - enemyData:', this.enemyData);
        
        // 栗之助の場合は仕草なし
        if (this.enemyData && this.enemyData.id === 'kurinosuke') {
            this.gameState.currentTell = null;
        } else if (this.enemyData && this.enemyData.id === 'taro') {
            // 太郎の場合は30%の確率で仕草あり
            console.log('太郎の仕草判定開始 - 30%の確率');
            if (Math.random() < 0.30) {
                const tells = window.csvLoader.getTells();
                if (tells.length > 0) {
                    const randomIndex = Math.floor(Math.random() * tells.length);
                    this.gameState.currentTell = tells[randomIndex];
                }
            } else {
                this.gameState.currentTell = null;
            }
        } else {
            // 仕草を選択（通常の確率）
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
            const ghostName = this.enemyData?.name || '相手';
            return {
                success: true,
                message: `挑発成功！${ghostName}は${this.handNames[this.gameState.lastEnemyWin]}を出しやすくなった！`,
                targetHand: this.gameState.lastEnemyWin
            };
        } else {
            const ghostName = this.enemyData?.name || '相手';
            return {
                success: true,
                message: `挑発失敗...${ghostName}は冷静だ`,
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
        
        // 太郎の適応型AI処理
        if (this.enemyData && this.enemyData.id === 'taro') {
            const taroHand = this.decideTaroHand();
            console.log(`太郎の手決定: ${taroHand}`);
            return taroHand;
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
            
            // フェイク判定（太郎は10%、他は5%）
            const fakeRate = (this.enemyData && this.enemyData.id === 'taro') ? 0.10 : (this.config.FAKE_RATE || 0.05);
            if (Math.random() < fakeRate) {
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
        console.log(`勝負判定: プレイヤー=${playerHand} vs 敵=${enemyHand} → 結果=${result}`);
        switch (result) {
            case 'player_win':
                this.gameState.enemyHP = Math.max(0, this.gameState.enemyHP - damage);
                this.gameState.playerWins++;
                console.log(`プレイヤー勝利！勝数更新: ${this.gameState.playerWins}`);
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
                console.log(`敵勝利！敗数更新: ${this.gameState.enemyWins}`);
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

        // 太郎の適応型AI用状態更新
        console.log('processRoundResult - currentGhost:', this.gameState.currentGhost, 'enemyData.id:', this.enemyData?.id);
        if (this.gameState.currentGhost === 'taro') {
            // プレイヤーの手を記録（次回の適応AI用）
            console.log(`太郎戦: プレイヤーの手を記録 ${playerHand} (次回の適応AI用)`);
            this.taroLastPlayerHand = playerHand;
            
            // 連敗カウント更新
            if (result === 'enemy_win') {
                this.taroConsecutiveLosses++;
                console.log(`太郎戦: プレイヤー連敗数 ${this.taroConsecutiveLosses}`);
                
                // 3連敗で友情モード発動
                if (this.taroConsecutiveLosses >= 3 && !this.taroFriendshipMode) {
                    this.taroFriendshipMode = true;
                    console.log('太郎戦: 友情モード発動！');
                }
            } else if (result === 'player_win') {
                // プレイヤーが勝ったら連敗カウントリセット
                this.taroConsecutiveLosses = 0;
            }
            // 引き分けの場合は連敗カウントそのまま
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
        const oldLevel = this.gameState.exposureLevel;
        this.gameState.exposureLevel = level;
        console.log('BattleSystem - 露出レベル設定:', oldLevel, '→', level);
        
        // 服装変化時の対話セリフを追加（game.jsのメソッドを呼び出し）
        if (window.gameInstance && oldLevel !== level) {
            window.gameInstance.addExposureDialogue(oldLevel, level);
        }
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
    
    // 太郎の手を決定する適応型AIロジック
    decideTaroHand() {
        console.log(`太郎AI: 友情モード=${this.taroFriendshipMode}, 前回手=${this.taroLastPlayerHand}, ラウンド=${this.gameState.round}`);
        
        // 友情モード: 3連敗後は完全ランダム
        if (this.taroFriendshipMode) {
            const hands = ['stone', 'scissors', 'paper'];
            const hand = hands[Math.floor(Math.random() * hands.length)];
            console.log(`太郎AI: 友情モード - ${hand}選択`);
            return hand;
        }
        
        // 1ラウンド目またはプレイヤーの前の手がない場合は完全ランダム
        if (!this.taroLastPlayerHand || this.gameState.round === 1) {
            const hands = ['stone', 'scissors', 'paper'];
            const hand = hands[Math.floor(Math.random() * hands.length)];
            console.log(`太郎AI: 初回ランダム - ${hand}選択`);
            return hand;
        }
        
        // プレイヤーの前の手に勝つ手を決定
        const counterHands = {
            stone: 'paper',    // 石拳に勝つのは布掌
            scissors: 'stone', // 剪刀に勝つのは石拳
            paper: 'scissors'  // 布掌に勝つのは剪刀
        };
        
        const counterHand = counterHands[this.taroLastPlayerHand];
        
        // 60%の確率でカウンター手を選択
        if (Math.random() < 0.60) {
            return counterHand;
        } else {
            // 残り40%は他の手を20%ずつ
            const otherHands = ['stone', 'scissors', 'paper'].filter(hand => hand !== counterHand);
            return otherHands[Math.floor(Math.random() * otherHands.length)];
        }
    }
    
    // 幽霊を切り替える
    switchGhost(ghostId) {
        let ghostData = null;
        if (ghostId === 'kurinosuke') {
            ghostData = window.csvLoader.getKurinosukeData();
        } else if (ghostId === 'ayato') {
            ghostData = window.csvLoader.getAyatoData();
        } else if (ghostId === 'taro') {
            ghostData = window.csvLoader.getTaroData();
        }
        
        if (ghostData) {
            this.enemyData = ghostData;
            this.gameState.currentGhost = ghostId;  // currentGhostを設定
            // 栗之助パターン用変数リセット
            this.kurinosukeStoneCount = 0;
            this.kurinosukeInStonePattern = false;
            console.log(`淫霊を${ghostData.name}に切り替えました`);
        } else {
            console.error('淫霊データが見つかりません:', ghostId);
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


// 敗北時POVシステムをグローバル変数として公開
window.defeatPOVSystem = new DefeatPOVSystem();