// Game Controller Module
class GameController {
    constructor() {
        this.elements = {};
        this.currentEnemyHand = null;
        this.isRevealPhase = false;
        this.currentGhost = 'ayato'; // 現在の幽霊を追跡
    }
    // ヘルパー関数
    getHandName(hand) {
        const handNames = {
            stone: '石拳',
            scissors: '剪刀',
            paper: '布掌'
        };
        return handNames[hand] || hand;
    }

    // DOM要素をキャッシュ
    cacheElements() {
        this.elements = {
            // HP関連
            playerHP: document.getElementById('player-hp'),
            enemyHP: document.getElementById('enemy-hp'),
            playerHPBar: document.getElementById('player-hp-bar'),
            enemyHPBar: document.getElementById('enemy-hp-bar'),
            
            // ラウンド関連
            currentRound: document.getElementById('current-round'),
            playerWins: document.getElementById('player-wins'),
            drawCount: document.getElementById('draw-count'),
            enemyWins: document.getElementById('enemy-wins'),
            
            // ゲージ関連
            exposureDots: document.getElementById('exposure-dots'),
            
            // 服装表示関連
            playerImage: document.getElementById('player-image'),
            exposureName: document.getElementById('exposure-name'),
            exposureDesc: document.getElementById('exposure-desc'),
            
            // 仕草関連
            currentTell: document.getElementById('current-tell'),
            provokeEffect: document.getElementById('provoke-effect'),
            
            // 手選択ボタン
            handButtons: document.querySelectorAll('.hand-btn'),
            stoneBtn: document.getElementById('stone'),
            scissorsBtn: document.getElementById('scissors'),
            paperBtn: document.getElementById('paper'),
            selectedHandDisplay: document.getElementById('selected-hand-display'),
            
            // アクションボタン
            provokeBtn: document.getElementById('provoke'),
            revealBtn: document.getElementById('reveal'),
            rewindBtn: document.getElementById('rewind'),
            provokeCount: document.getElementById('provoke-count'),
            rewindCount: document.getElementById('rewind-count'),
            
            // ログ
            logContent: document.querySelector('.log-content-compact') || document.getElementById('log-content'),
            
            // モーダル
            resultModal: document.getElementById('result-modal'),
            resultTitle: document.getElementById('result-title'),
            resultText: document.getElementById('result-text'),
            tellHits: document.getElementById('tell-hits'),
            provokeHits: document.getElementById('provoke-hits'),
            fakeCount: document.getElementById('fake-count'),
            restartBtn: document.getElementById('restart'),
            nextGhostBtn: document.getElementById('next-ghost')
        };
    }

    // イベントリスナーを設定
    setupEventListeners() {
        // 手選択ボタン
        this.elements.handButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.selectHand(btn.dataset.hand);
            });
        });

        // キーボード入力
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case '1':
                    this.selectHand('stone');
                    break;
                case '2':
                    this.selectHand('scissors');
                    break;
                case '3':
                    this.selectHand('paper');
                    break;
                case 'p':
                case 'P':
                    this.useProvoke();
                    break;
                case 'r':
                case 'R':
                    if (this.isRevealPhase) {
                        this.useRewind();
                    }
                    break;
            }
        });

        // アクションボタン
        this.elements.provokeBtn.addEventListener('click', () => this.useProvoke());
        this.elements.revealBtn.addEventListener('click', () => this.reveal());
        this.elements.rewindBtn.addEventListener('click', () => this.useRewind());
        this.elements.restartBtn.addEventListener('click', () => this.restartGame());
        
        // next-ghostボタンの存在確認とイベントリスナー追加
        console.log('nextGhostBtn要素:', this.elements.nextGhostBtn);
        if (this.elements.nextGhostBtn) {
            this.elements.nextGhostBtn.addEventListener('click', () => {
                console.log('次に進むボタンがクリックされました');
                this.nextGhost();
            });
        } else {
            console.error('next-ghostボタンが見つかりません');
        }
        
        // テスト用POVボタン
        const testPovBtn = document.getElementById('test-pov');
        if (testPovBtn) {
            testPovBtn.addEventListener('click', () => {
                console.log('POVテストボタンがクリックされました');
                window.defeatPOVSystem.enterPOVMode(2);
            });
        }
    }

    // 手を選択
    selectHand(hand) {
        console.log('手選択:', hand);
        console.log('battleSystem:', window.battleSystem);
        console.log('isRevealPhase:', this.isRevealPhase);
        if (this.isRevealPhase) return;
        
        const success = window.battleSystem.selectPlayerHand(hand);
        console.log('手選択結果:', success);
        if (!success) return;

        // UIを更新
        this.elements.handButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        
        document.getElementById(hand).classList.add('selected');
        
        const handNames = {
            stone: '石拳',
            scissors: '剪刀',
            paper: '布掌'
        };
        
        this.elements.selectedHandDisplay.textContent = `選択: ${handNames[hand]}`;
    }

    // 挑発
    useProvoke() {
        if (this.isRevealPhase) return;
        
        const result = window.battleSystem.useProvoke();
        
        if (result.success) {
            this.addLog(result.message, result.targetHand ? 'special' : 'system');
            
            if (result.targetHand) {
                this.elements.provokeEffect.textContent = result.message;
                this.elements.provokeEffect.classList.add('active');
                
                // POV演出: 挑発成功
                // window.povSystem.autoChangePOV(window.battleSystem.getState(), 'provoke_success');
                
                setTimeout(() => {
                    this.elements.provokeEffect.classList.remove('active');
                    this.elements.provokeEffect.textContent = '';
                }, 3000);
            } else {
                // POV演出: 挑発失敗
                // window.povSystem.autoChangePOV(window.battleSystem.getState(), 'provoke_fail');
            }
        } else {
            // 挑発使用不可時のログ
            this.addLog(result.message, 'system');
        }
        
        this.updateUI();
    }

    // 公開
    reveal() {
        const state = window.battleSystem.getState();
        console.log('公開時の状態:', state);
        if (!state.selectedPlayerHand) {
            this.addLog('先に手を選択してください！', 'system');
            return;
        }
        
        if (this.isRevealPhase) return;
        
        // 彩人の手を決定
        this.currentEnemyHand = window.battleSystem.decideEnemyHand();
        
        // 一旦結果を表示
        const handNames = {
            stone: '石拳',
            scissors: '剪刀',
            paper: '布掌'
        };
        
        this.addLog(`鈴音: ${handNames[state.selectedPlayerHand]} vs 彩人: ${handNames[this.currentEnemyHand]}`, 'system');
        
        // 読み直しフェーズへ
        this.isRevealPhase = true;
        this.elements.rewindBtn.style.display = 'inline-block';
        this.elements.revealBtn.disabled = true;
        
        // 1秒後に自動で結果処理（読み直しがなければ）
        setTimeout(() => {
            if (this.isRevealPhase) {
                this.processRound(false);
            }
        }, 2000);
    }

    // 読み直し
    useRewind() {
        if (!this.isRevealPhase) return;
        
        const result = window.battleSystem.useRewind();
        
        if (result.success) {
            this.addLog('【読み直し発動】手を変更します', 'special');
            this.addLog('警告: 次に負けた場合、ダメージが+5されます', 'damage');
            
            // 手を選び直せるように
            this.isRevealPhase = false;
            this.elements.rewindBtn.style.display = 'none';
            this.elements.revealBtn.disabled = false;
            
            // 手選択をリセット
            this.elements.handButtons.forEach(btn => {
                btn.classList.remove('selected');
            });
            this.elements.selectedHandDisplay.textContent = '選択: なし';
            
            // 読み直し中の視覚的フィードバック
            this.elements.selectedHandDisplay.innerHTML = '選択: なし <span style="color: #ff6b6b;">（読み直し中）</span>';
            
            // 新しい手を選択させる
            this.addLog('新しい手を選択して再度「公開」を押してください', 'system');
            
            // 選択を待つ
            const checkInterval = setInterval(() => {
                const state = window.battleSystem.getState();
                if (state.selectedPlayerHand) {
                    clearInterval(checkInterval);
                    this.elements.selectedHandDisplay.textContent = `選択: ${this.getHandName(state.selectedPlayerHand)} （読み直し済み）`;
                    this.addLog('読み直し完了！公開ボタンで確定してください', 'special');
                }
            }, 100);
        }
        
        this.updateUI();
    }

    // ラウンド結果処理
    processRound(isRewind) {
        const state = window.battleSystem.getState();
        const result = window.battleSystem.processRoundResult(
            state.selectedPlayerHand,
            this.currentEnemyHand,
            isRewind
        );
        
        console.log('processRound結果:', result);
        console.log('結果タイプ:', result.result);
        console.log('引き分け判定:', result.result === 'draw');
        if (result.result === 'enemy_win') {
            console.log('このラウンドで敗北！プレイヤーHP:', result.newPlayerHP);
            
            // ラウンド敗北時にPOV演出を表示（少し遅らせる）
            // 現在の露出レベルを保存（POVで表示用）
            const currentExposureLevel = window.battleSystem.getState().exposureLevel;
            const nextExposureLevel = Math.min(currentExposureLevel + 1, 5); // 最大レベル5
            
            setTimeout(() => {
                if (window.defeatPOVSystem) {
                    // 現在の状態でPOV開始、服を掴んだ時に次のレベルに変更
                    window.defeatPOVSystem.enterPOVMode(currentExposureLevel, nextExposureLevel);
                    console.log('POV開始 - 現在:', currentExposureLevel, '→掴んだ後:', nextExposureLevel);
                } else {
                    console.error('defeatPOVSystemが見つかりません');
                }
            }, 2000); // 2秒遅延
        }
        
        const currentState = window.battleSystem.getState();
        console.log('現在の状態 - HP:', currentState.playerHP, '勝数:', currentState.playerWins, '敗数:', currentState.enemyWins, 'ラウンド:', currentState.round);
        
        // 結果をログに追加
        this.addLog(result.message, result.result === 'player_win' ? 'player-action' : 
                                    result.result === 'enemy_win' ? 'enemy-action' : 'system');
        
        if (result.damage > 0) {
            this.addLog(`ダメージ: ${result.damage}`, 'damage');
        }
        
        if (result.wasFake) {
            this.addLog('フェイクだった！仕草とは違う手を出した！', 'special');
            // POV演出: フェイク仕草発動
            // window.povSystem.autoChangePOV(window.battleSystem.getState(), 'fake_tell');
        }
        
        // リセット
        this.isRevealPhase = false;
        this.elements.rewindBtn.style.display = 'none';
        this.elements.revealBtn.disabled = false;
        this.elements.handButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        this.elements.selectedHandDisplay.textContent = '選択: なし';
        
        // UI更新（一度だけ呼ぶ）
        setTimeout(() => {
            this.updateUI();
        }, 100);
        
        // ゲーム終了判定
        const endResult = window.battleSystem.checkGameEnd();
        console.log('ゲーム終了判定結果:', endResult);
        console.log('endResult.ended:', endResult.ended);
        console.log('endResult.winner:', endResult.winner);
        if (endResult.ended) {
            console.log('ゲーム終了 - showResult呼び出し');
            this.showResult(endResult);
        } else {
            // 次のラウンドを開始
            setTimeout(() => {
                this.startNewRound();
            }, 1500);
        }
    }

    // 新ラウンド開始
    startNewRound() {
        const tell = window.battleSystem.startNewRound();
        const state = window.battleSystem.getState();
        
        // POV演出: ラウンド開始時の自動判定
        // if (state.round === 10) {
        //     // 最終ラウンド開始
        //     window.povSystem.autoChangePOV(state, 'final_round');
        // } else {
        //     // 通常ラウンド開始
        //     window.povSystem.autoChangePOV(state, 'round_start');
        // }
        
        // 仕草を表示
        console.log('新しい仕草:', tell);
        if (tell) {
            const handNames = {
                stone: '石拳',
                scissors: '剪刀',
                paper: '布掌'
            };
            
            this.elements.currentTell.textContent = 
                `仕草: ${tell.name} ${tell.icon} → ${handNames[tell.target]} +20%/フェイク5%`;
            this.addLog(`彩人の仕草: ${tell.name} - ${tell.desc}`, 'system');
        } else {
            this.elements.currentTell.textContent = '仕草なし（完全ランダム）';
            this.addLog('彩人は仕草を見せない...完全ランダム', 'system');
        }
        
        this.updateUI();
    }

    // UI更新
    updateUI() {
        const state = window.battleSystem.getState();
        console.log('GameController updateUI - 受信した状態:', state);
        console.log('GameController updateUI - drawCount値:', state.drawCount);
        
        // HP更新
        this.elements.playerHP.textContent = state.playerHP;
        this.elements.enemyHP.textContent = state.enemyHP;
        this.elements.playerHPBar.style.width = `${state.playerHP}%`;
        this.elements.enemyHPBar.style.width = `${state.enemyHP}%`;
        
        // POV演出: HP危機時の判定
        // if (state.playerHP <= 30 && state.playerHP > 0) {
        //     window.povSystem.autoChangePOV(state, 'suzune_crisis');
        // } else if (state.enemyHP <= 30 && state.enemyHP > 0) {
        //     window.povSystem.autoChangePOV(state, 'ayato_crisis');
        // }
        
        // ラウンド情報更新（最大10で固定）
        const displayRound = Math.min(state.round, 10);
        this.elements.currentRound.textContent = displayRound;
        this.elements.playerWins.textContent = state.playerWins;
        this.elements.drawCount.textContent = state.drawCount || 0;
        this.elements.enemyWins.textContent = state.enemyWins;
        console.log('UI更新 - 引き分け数設定:', state.drawCount);
        console.log('DOM要素に設定後の値:', this.elements.drawCount.textContent);
        
        // ゲージ更新
        const exposureDots = '●'.repeat(state.exposureLevel - 1) + 
                            '○'.repeat(5 - state.exposureLevel);
        this.elements.exposureDots.textContent = exposureDots;
        
        // 服装変化の表示更新
        const exposureData = window.csvLoader.getExposureLevel(state.exposureLevel);
        console.log('露出レベル更新:', state.exposureLevel, exposureData);
        if (exposureData) {
            // 画像対応：背景画像とクラスを更新
            this.updatePlayerImage(state.exposureLevel);
            
            // 絵文字も更新（フォールバック用）
            const emojiSpan = this.elements.playerImage.querySelector('.character-emoji');
            if (emojiSpan) {
                emojiSpan.textContent = exposureData.player_image;
            }
            
            this.elements.exposureName.textContent = exposureData.name;
            this.elements.exposureDesc.textContent = exposureData.description;
            
            // 特殊イベントチェック
            if (exposureData.special_event === 'special_dialogue' && state.exposureLevel === 4) {
                this.addLog('鈴音「こ、こんな格好で戦うなんて...！」', 'special');
            } else if (exposureData.special_event === 'ending_branch' && state.exposureLevel === 5) {
                this.addLog('限界露出！これ以上負けたら...', 'damage');
            }
            
            // POV演出: 露出度変化時
            // if (state.exposureLevel >= 3) {
            //     window.povSystem.autoChangePOV(state, 'exposure_change');
            // }
        }
        
        
        // アクションボタン更新
        this.elements.provokeCount.textContent = state.provokeCount;
        this.elements.rewindCount.textContent = state.rewindCount;
        
        // ボタンの有効/無効
        this.elements.provokeBtn.disabled = state.provokeCount <= 0 || !state.lastEnemyWin;
        this.elements.rewindBtn.disabled = state.rewindCount <= 0;
    }

    // ログ追加
    addLog(message, type = 'system') {
        const entry = document.createElement('p');
        entry.className = `log-entry ${type} new-entry`;
        entry.textContent = `[R${window.battleSystem.getState().round}] ${message}`;
        
        // 最新ログを先頭に挿入（column-reverseで下に表示）
        this.elements.logContent.insertBefore(entry, this.elements.logContent.firstChild);
        
        // 新着ハイライト効果（1秒後に消去）
        setTimeout(() => {
            entry.classList.remove('new-entry');
        }, 1000);
        
        // ログが多すぎる場合は古いものを削除（最大15行に制限）
        const logEntries = this.elements.logContent.querySelectorAll('.log-entry');
        if (logEntries.length > 15) {
            logEntries[logEntries.length - 1].remove();
        }
    }

    // 結果表示
    showResult(result) {
        console.log('showResult呼び出し - result:', result);
        console.log('result.winner:', result.winner);
        console.log('result.reason:', result.reason);
        const state = window.battleSystem.getState();
        
        if (result.winner === 'player') {
            console.log('プレイヤー勝利処理');
            // 勝利の種類を判定
            const victoryType = this.determineVictoryType(state);
            this.handlePlayerVictory(victoryType, state, result.reason);
        } else if (result.winner === 'player_special') {
            console.log('プレイヤー特殊勝利処理');
            this.elements.resultTitle.textContent = '奇跡の勝利！';
            this.elements.resultText.textContent = `限界状態から逆転勝利！鈴音の気迫が彩人を圧倒した！`;
            this.addVictoryBonus('comeback_victory');
        } else if (result.winner === 'enemy') {
            console.log('敵勝利処理 - POV演出開始予定');
            // 敗北時POV演出を開始
            const currentExposureLevel = state.exposureLevel;
            console.log('敗北検出 - POV演出開始を試みます。露出レベル:', currentExposureLevel);
            console.log('defeatPOVSystem確認:', window.defeatPOVSystem);
            
            // POV演出を先に表示してから結果を表示
            if (window.defeatPOVSystem) {
                console.log('POV演出開始を試みます...');
                window.defeatPOVSystem.enterPOVMode(currentExposureLevel);
            } else {
                console.error('defeatPOVSystemが見つかりません');
            }
            
            // 結果表示を少し遅らせる
            setTimeout(() => {
                this.elements.resultTitle.textContent = '敗北...';
                this.elements.resultText.textContent = `彩人に敗れた...（${result.reason}）`;
            }, 100);
        } else if (result.winner === 'enemy_special') {
            console.log('敵特殊勝利処理');
            this.elements.resultTitle.textContent = '屈辱的敗北...';
            this.elements.resultText.textContent = `限界露出で敗北...鈴音は恥ずかしい格好のまま彩人に屈服した...`;
            
            // 屈辱的敗北の場合、特殊処理フラグを設定
            this.handleSpecialDefeat(state);
        } else {
            console.log('引き分けまたは不明な結果:', result.winner);
            this.elements.resultTitle.textContent = '引き分け';
            this.elements.resultText.textContent = '勝負がつかなかった...';
        }
        
        // 統計表示
        this.elements.tellHits.textContent = state.stats.tellHits;
        this.elements.provokeHits.textContent = state.stats.provokeHits;
        this.elements.fakeCount.textContent = state.stats.fakeCount;
        
        // モーダル表示（POVモード中でなければ表示）
        if (!window.defeatPOVSystem.isActivePOV()) {
            this.elements.resultModal.classList.remove('hidden');
        } else {
            // POVモードが終了したらモーダルを表示するためのフラグをセット
            this.pendingModal = true;
        }
    }

    // 勝利タイプを判定
    determineVictoryType(state) {
        if (state.playerHP >= 80) {
            return 'perfect_victory';
        } else if (state.exposureLevel === 1) {
            return 'pure_victory';
        } else {
            return 'normal_victory';
        }
    }

    // プレイヤー勝利処理
    handlePlayerVictory(victoryType, state, reason) {
        switch (victoryType) {
            case 'perfect_victory':
                this.elements.resultTitle.textContent = '完璧勝利！';
                this.elements.resultText.textContent = `無傷で彩人を圧倒！完璧な心理戦だった！（${reason}）`;
                this.addVictoryBonus('perfect_victory');
                break;
            case 'pure_victory':
                this.elements.resultTitle.textContent = '清廉勝利！';
                this.elements.resultText.textContent = `服装を全く乱されることなく勝利！鈴音の威厳は保たれた！（${reason}）`;
                this.addVictoryBonus('pure_victory');
                break;
            default:
                this.elements.resultTitle.textContent = '勝利！';
                this.elements.resultText.textContent = `見事彩人を退けた！（${reason}）`;
                this.addVictoryBonus('normal_victory');
                break;
        }
    }

    // 勝利ボーナス表示
    addVictoryBonus(victoryType) {
        const modal = this.elements.resultModal;
        const modalContent = modal.querySelector('.modal-content');
        
        // 既存のボーナス表示を削除
        const existingBonus = modalContent.querySelector('.victory-bonus');
        if (existingBonus) {
            existingBonus.remove();
        }
        
        // 新しいボーナス表示を追加
        const bonusDiv = document.createElement('div');
        bonusDiv.className = 'victory-bonus';
        
        let bonusText = '';
        switch (victoryType) {
            case 'perfect_victory':
                bonusText = '🏆 完璧勝利ボーナス！次回の心理戦で有利になります';
                break;
            case 'pure_victory':
                bonusText = '✨ 清廉勝利ボーナス！鈴音の評判が大幅上昇';
                break;
            case 'comeback_victory':
                bonusText = '💫 奇跡勝利ボーナス！不屈の精神力を獲得';
                break;
            default:
                bonusText = '⭐ 勝利ボーナス！経験値を獲得しました';
                break;
        }
        
        bonusDiv.innerHTML = `<p style="color: #ffcc00; font-weight: bold; margin: 15px 0;">${bonusText}</p>`;
        
        // 統計表示の後に挿入
        const statsDisplay = modalContent.querySelector('.stats-display');
        modalContent.insertBefore(bonusDiv, statsDisplay.nextSibling);
    }

    // 屈辱的敗北の特殊処理
    handleSpecialDefeat(state) {
        // 将来的にここで敗北後のイベント分岐を実装
        // 現在は基礎フレームワークのみ
        console.log('屈辱的敗北イベント発生:', {
            exposureLevel: state.exposureLevel,
            finalHP: state.playerHP,
            defeatReason: '限界露出'
        });
        
        // モーダルに特殊ボタンを追加する準備
        const modalContent = this.elements.resultModal.querySelector('.modal-content');
        const specialButton = document.createElement('button');
        specialButton.className = 'special-defeat-btn';
        specialButton.textContent = '続きを見る...';
        specialButton.style.display = 'none'; // 現在は非表示
        specialButton.addEventListener('click', () => {
            // 将来的にここで特殊イベントシーンに遷移
            alert('特殊イベントは今後実装予定です！');
        });
        
        // リスタートボタンの前に挿入
        const restartBtn = modalContent.querySelector('#restart');
        modalContent.insertBefore(specialButton, restartBtn);
    }

    // ゲーム再開
    restartGame() {
        window.battleSystem.resetGame();
        this.elements.resultModal.classList.add('hidden');
        this.elements.logContent.innerHTML = '<p class="log-entry system">彩人との心理戦開始...</p>';
        this.isRevealPhase = false;
        this.currentEnemyHand = null;
        
        // UI初期化
        this.elements.handButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        this.elements.selectedHandDisplay.textContent = '選択: なし';
        this.elements.provokeEffect.textContent = '';
        this.elements.provokeEffect.classList.remove('active');
        this.elements.rewindBtn.style.display = 'none';
        this.elements.revealBtn.disabled = false;
        
        this.updateUI();
        this.startNewRound();
    }
    
    // 次の幽霊に進む
    nextGhost() {
        console.log('nextGhost()メソッドが呼び出されました');
        
        // モーダルを閉じる
        this.elements.resultModal.classList.add('hidden');
        
        this.currentGhost = 'kurinosuke';
        console.log('幽霊を栗之助に変更:', this.currentGhost);
        window.battleSystem.switchGhost('kurinosuke');
        this.updateGhostUI();
        
        // ログをクリア
        this.elements.logContent.innerHTML = '<p class="log-entry system">栗之助との心理戦開始...</p>';
        
        // 完全なゲーム状態リセット
        window.battleSystem.resetGame();
        
        // ラウンド情報を強制的に1にリセット
        window.battleSystem.gameState.round = 1;
        window.battleSystem.gameState.playerWins = 0;
        window.battleSystem.gameState.enemyWins = 0;
        window.battleSystem.gameState.drawCount = 0;
        
        this.isRevealPhase = false;
        this.currentEnemyHand = null;
        
        // UI初期化
        this.elements.handButtons.forEach(btn => {
            btn.classList.remove('selected');
        });
        this.elements.selectedHandDisplay.textContent = '選択: なし';
        this.elements.provokeEffect.classList.remove('active');
        this.elements.rewindBtn.style.display = 'none';
        this.elements.revealBtn.disabled = false;
        
        this.updateUI();
        this.startNewRound();
    }

    // 幽霊UIを更新
    updateGhostUI() {
        let ghostData = null;
        if (this.currentGhost === 'kurinosuke') {
            ghostData = window.csvLoader.getKurinosukeData();
        } else if (this.currentGhost === 'ayato') {
            ghostData = window.csvLoader.getAyatoData();
        }
        
        if (ghostData) {
            // 敵の名前を更新（右側の幽霊の名前のみ）
            const enemyNameElements = document.querySelectorAll('.enemy-section .character-name');
            enemyNameElements.forEach(elem => {
                elem.textContent = ghostData.name;
            });
            
            // HP表示の名前を更新
            const hpLabel = document.querySelector('.enemy-hp .hp-label');
            if (hpLabel) {
                hpLabel.textContent = `${ghostData.name}（幽霊）`;
            }
            
            // 勝利カウントの名前を更新
            const enemyWinsLabel = document.querySelector('.enemy-wins');
            if (enemyWinsLabel) {
                enemyWinsLabel.innerHTML = `${ghostData.name}: <span id="enemy-wins">0</span>勝`;
            }
        }
    }

    // 初期化
    async init() {
        this.cacheElements();
        this.setupEventListeners();
        
        // CSVデータ読み込み
        const csvData = await window.csvLoader.init();
        if (!csvData) {
            console.error('Failed to load CSV data');
            return;
        }
        
        // バトルシステム初期化
        console.log('battleSystem初期化開始, csvData.config:', csvData.config);
        window.battleSystem.init(csvData.config);
        console.log('battleSystem初期化完了');
        
        // ゲーム開始
        this.updateUI();
        this.startNewRound();
        console.log('startNewRound完了');
        
        console.log('Game initialized successfully');
    }
    
    // プレイヤー画像を露出レベルに応じて更新
    updatePlayerImage(level) {
        const playerImage = this.elements.playerImage;
        if (!playerImage) return;
        
        // 既存のレベルクラスを削除
        playerImage.classList.remove('lv1', 'lv2', 'lv3', 'lv4', 'lv5');
        
        // 新しいレベルクラスを追加
        playerImage.classList.add(`lv${level}`);
        
        console.log('プレイヤー画像クラス更新:', `lv${level}`);
    }
}

// ページ読み込み完了時に初期化
document.addEventListener('DOMContentLoaded', () => {
    const gameController = new GameController();
    window.gameController = gameController;  // グローバル変数として公開
    gameController.init();
});