// Game Controller Module
class GameController {
    constructor() {
        this.elements = {};
        this.currentEnemyHand = null;
        this.isRevealPhase = false;
        this.currentGhost = 'ayato'; // 現在の淫霊を追跡
        this.isOpeningScreen = true; // オープニング画面フラグ
        this.isTutorialScreen = false; // チュートリアル画面フラグ
        this.isStoryScreen = false; // ストーリー画面フラグ
        this.isAyatoInfoScreen = false; // 彩人特徴説明画面フラグ
        this.isKurinosukeInfoScreen = false; // 栗之助特徴説明画面フラグ
        this.isTaroStory = false; // 太郎戦ストーリー画面フラグ
        this.isTaroInfoScreen = false; // 太郎特徴説明画面フラグ
        this.currentStoryScene = 0; // 現在のストーリーシーン
        
        // ストーリーシーンデータ
        this.storyScenes = [
            {
                background: 'shrine',
                text: `淫術師・鈴音のもとに一つの依頼が舞い込んだ。

「街外れの屋敷に棲みつく淫霊たちを退治してほしい」

依頼主の老人は震え声で語る。
「あの屋敷に入った者は皆、淫らな夢に囚われ、
魂を奪われてしまうのです...」

鈴音は静かに頷いた。
「分かりました。必ずや成仏させてみせます」

しかし、この依頼が己の運命を大きく変えることになるとは、
この時の鈴音はまだ知らなかった...`
            },
            {
                background: 'mansion_exterior',
                text: `呪われし屋敷の前に立つ。

重厚な扉が軋みを上げて開く。
冷たい空気が鈴音の肌を撫でた。

「ここが...噂の屋敷」

淫術師の本能が危険を告げている。
しかし、鈴音は迷わず一歩を踏み出した。`
            },
            {
                background: 'mansion_hall',
                text: `薄暗いホールに足を踏み入れた瞬間―

<span class="dialogue">ようこそ、美しき淫術師よ</span>

声の主は、透けた体を持つ青年の霊だった。

<span class="dialogue">私は<span class="character-name">彩人</span>。この屋敷の最初の番人</span>
<span class="dialogue">君のような美しい巫女を待っていたよ</span>

彩人の瞳が妖しく光る。`
            },
            {
                background: 'mansion_hall',
                text: `<span class="dialogue">さあ、始めようか。淫術拳とやらを見せてもらおう</span>

<span class="dialogue">もし君が負ければ...その清らかな体は我々のものだ</span>

鈴音は構えを取った。
<span class="dialogue">望むところです。成仏させてあげましょう</span>

かくして、運命の三手心理戦が始まった―`
            }
        ];
        
        // 太郎戦用ストーリーシーン
        // 栗之助戦イベントシーン
        this.kurinosukeStoryScenes = [
            {
                background: 'mansion_hall',
                text: `<span class="dialogue">「見事だよ、鈴音」</span>
<span class="dialogue">「この屋敷の掟を教えてあげる」</span>
<span class="dialogue">「地下に行くほど、淫霊は強く...淫らになる」</span>
<span class="dialogue">「負けた時のエロい代償も下の階ほど大きくなる」</span>
<span class="dialogue">「次は栗之助...冷徹なビジネスマンだ」</span>
<span class="dialogue">「君との三手勝負楽しかった...ありがとう...」</span>
彩人の姿が薄れ、消滅していく。`
            },
            {
                background: 'mansion_stairs',
                text: `地下への階段...
うっ...淫気が一気に濃くなったみたいだ。
ここが地下1階...なんだか、オフィスのようだ。`
            },
            {
                background: 'mansion_basement',
                text: `書類を持った男性が現れる。
<span class="dialogue">「定刻通りですね、鈴音さん」</span>
<span class="dialogue">「私は栗之助。元大企業の営業部長です」</span>
<span class="dialogue">「あなたも淫霊ね。成仏させてあげる」</span>
<span class="dialogue">「その前に、私の話を聞いてください」</span>`
            },
            {
                background: 'mansion_basement',
                text: `<span class="dialogue">「重要な商談で『三手で決めよう』と言われ...」</span>
<span class="dialogue">「プレッシャーから同じ手を3回出して惨敗」</span>
<span class="dialogue">「会社は倒産、私は過労死しました」</span>
<span class="dialogue">「データを開示します」</span>
<span class="dialogue">「私は石拳を80%の確率で出します」</span>
<span class="dialogue">「これは私のトラウマ...同じ手を出し続ける癖です」</span>`
            },
            {
                background: 'mansion_basement',
                text: `<span class="dialogue">「自分の手の内を明かすの？」</span>
<span class="dialogue">「ビジネスは透明性が大切です」</span>
<span class="dialogue">「ただし20%は違う手も出します」</span>
<span class="dialogue">「さあ、契約を開始しましょう」</span>`
            },
            {
                background: 'mansion_basement',
                text: `<span class="dialogue">「契約内容は単純です」</span>
<span class="dialogue">「私が勝てばあなたの服を一枚」</span>
<span class="dialogue">「あなたが勝てば私は成仏」</span>
<span class="dialogue">「準備はよろしいですか？」</span>
<span class="dialogue">「望むところよ！」</span>
<span class="dialogue">「あなたのトラウマも浄化してあげる！」</span>`
            }
        ];

        this.taroStoryScenes = [
            {
                background: 'mansion_hall',
                text: `栗之助の声が響く。

<span class="dialogue">...地下の奴に気をつけろ。あいつは俺よりもずっと...歪んでいる</span>

栗之助の姿が薄れていく。鈴音は既に服装がはだけてきている。

重い扉の向こう、地下へ続く階段が見えた。`
            },
            {
                background: 'basement_stairs',
                text: `地下階段を降りる。

壁には無数の写真——少年たちが三手で遊ぶ写真だが、一人だけ顔が黒く塗りつぶされている。

階段を降りるごとに気温が下がる。息が白い。

<span class="dialogue">何かが...下にいる</span>`
            },
            {
                background: 'basement_room',
                text: `薄暗い地下室。

<span class="dialogue">くくく...また来たか</span>

振り返ると、学生風の姿をした淫霊がいる。

<span class="dialogue">私は<span class="character-name">太郎</span>。</span><span class="dialogue">親友に裏切られて死んだ。三手でな</span>`
            },
            {
                background: 'basement_room',
                text: `<span class="dialogue">三手で...？</span>鈴音が問う。

<span class="dialogue">あいつは俺の手を全部読んでた。友情なんて嘘だった</span>

太郎の瞳に深い憎悪が宿る。

<span class="dialogue">俺は相手の逆を突く。親友にやられたようにな</span>

テーブルの上にあるノートの最後には『太郎、ごめん』と書かれている。

<span class="dialogue">さあ始めようか。お前の考えなんて全部お見通しだ</span>

<span class="dialogue">いいでしょう、…成仏してもらいます！</span>鈴音が構えを取った。`
            }
        ];
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
            nextGhostBtn: document.getElementById('next-ghost'),
            
            // オープニング画面
            openingScreen: document.getElementById('opening-screen'),
            battleScreen: document.getElementById('battle-screen'),
            startGameBtn: document.getElementById('start-game-btn'),
            
            // チュートリアル画面
            tutorialScreen: document.getElementById('tutorial-screen'),
            tutorialStartBtn: document.getElementById('tutorial-start-btn'),
            
            // ストーリー画面
            storyScreen: document.getElementById('story-screen'),
            storyBackground: document.getElementById('story-background'),
            storyText: document.getElementById('story-text'),
            storyNextBtn: document.getElementById('story-next-btn'),
            progressCurrent: document.querySelector('.progress-current'),
            progressTotal: document.querySelector('.progress-total'),
            
            // 彩人特徴説明画面
            ayatoInfoScreen: document.getElementById('ayato-info-screen'),
            ayatoBattleBtn: document.getElementById('ayato-battle-btn'),
            
            // 栗之助特徴説明画面
            kurinosukeInfoScreen: document.getElementById('kurinosuke-info-screen'),
            kurinosukeBattleBtn: document.getElementById('kurinosuke-battle-btn')
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
            // オープニング画面でのENTERキー処理
            if (e.key === 'Enter' && this.isOpeningScreen) {
                this.showTutorial();
                return;
            }
            
            // チュートリアル画面でのSPACEキー処理
            if (e.key === ' ' && this.isTutorialScreen) {
                e.preventDefault();
                this.showStory();
                return;
            }
            
            // ストーリー画面でのSPACEキー処理
            if (e.key === ' ' && this.isStoryScreen) {
                e.preventDefault();
                this.nextStoryScene();
                return;
            }
            
            // 特徴説明画面でのSPACEキー処理
            if (e.key === ' ' && (this.isAyatoInfoScreen || this.isTaroInfoScreen || this.isKurinosukeInfoScreen)) {
                e.preventDefault();
                if (this.isKurinosukeInfoScreen) {
                    this.startKurinosukeBattle();
                } else {
                    this.startBattle();
                }
                return;
            }
            
            // ゲーム中のキー処理
            if (!this.isOpeningScreen && !this.isTutorialScreen && !this.isStoryScreen && !this.isAyatoInfoScreen && !this.isTaroInfoScreen) {
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
                    case 'Enter':
                        if (!this.elements.revealBtn.disabled) {
                            this.reveal();
                        }
                        break;
                }
            }
        });

        // アクションボタン
        this.elements.provokeBtn.addEventListener('click', () => this.useProvoke());
        this.elements.revealBtn.addEventListener('click', () => this.reveal());
        this.elements.rewindBtn.addEventListener('click', () => this.useRewind());
        
        // 読み直しボタンの構造を強制修正
        this.fixRewindButtonStructure();
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
        
        // オープニング画面のスタートボタン
        if (this.elements.startGameBtn) {
            this.elements.startGameBtn.addEventListener('click', () => {
                this.showTutorial();
            });
        }
        
        // チュートリアル画面のスタートボタン
        if (this.elements.tutorialStartBtn) {
            this.elements.tutorialStartBtn.addEventListener('click', () => {
                this.showStory();
            });
        }
        
        // ストーリー画面の次へボタン
        if (this.elements.storyNextBtn) {
            this.elements.storyNextBtn.addEventListener('click', () => {
                this.nextStoryScene();
            });
        }
        
        // 彩人特徴説明画面の戦闘開始ボタン
        if (this.elements.ayatoBattleBtn) {
            this.elements.ayatoBattleBtn.addEventListener('click', () => {
                this.startBattle();
            });
        }
        
        // 栗之助特徴説明画面の契約開始ボタン
        if (this.elements.kurinosukeBattleBtn) {
            this.elements.kurinosukeBattleBtn.addEventListener('click', () => {
                this.startBattle();
            });
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

    // 読み直しボタンの構造修正
    fixRewindButtonStructure() {
        const rewindBtn = this.elements.rewindBtn;
        rewindBtn.innerHTML = 'R: 読み直し (<span id="rewind-count">1</span>)';
        // 要素参照を再取得
        this.elements.rewindCount = document.getElementById('rewind-count');
        console.log('読み直しボタンの構造を修正しました:', rewindBtn.innerHTML);
    }

    // 服装変化時の対話セリフを追加
    addExposureDialogue(oldLevel, newLevel) {
        // 既に表示済みかチェック（各レベル1回のみ）
        if (!this.exposureDialogueShown) {
            this.exposureDialogueShown = {};
        }
        
        const dialogueKey = `${oldLevel}-${newLevel}`;
        if (this.exposureDialogueShown[dialogueKey]) {
            return; // 既に表示済み
        }
        
        // 鈴音のセリフ（敵キャラクターごとに異なる）
        let suzuneDialogues = {};
        let enemyDialogues = {};
        let enemyName = '';
        
        if (this.currentGhost === 'taro') {
            // 太郎戦の鈴音のセリフ
            suzuneDialogues = {
                '1-2': '「あっ...上着取られちゃった...」',
                '2-3': '「やだ...見ないで...恥ずかしいよ...」',
                '3-4': '「もう...これ以上は本当に...」',
                '4-5': '「ひどいよ...こんなの...」',
                '5-defeat': '「全部...取られちゃった...」'
            };
            // 太郎のセリフ
            enemyName = '太郎';
            enemyDialogues = {
                '1-2': '「ご、ごめん！でもルールだから...」',
                '2-3': '「うわ...本当にごめん...でも三手の掟は...」',
                '3-4': '「もうやめたいけど...でも...」',
                '4-5': '「あと少しで...ごめん...」',
                '5-defeat': '「終わった...本当にごめん...でも君が負けたから...」'
            };
        } else if (this.currentGhost === 'kurinosuke') {
            // 栗之助戦の鈴音のセリフ
            suzuneDialogues = {
                '1-2': '「く...負けた...上着が...」',
                '2-3': '「これ以上は...ダメ...！」',
                '3-4': '「お願い...もう許して...」',
                '4-5': '「恥ずかしくて...死にそう...」',
                '5-defeat': '「完全に...負けた...」'
            };
            // 栗之助のセリフ
            enemyName = '栗之助';
            enemyDialogues = {
                '1-2': '「契約は絶対だ。一枚目、確かに受け取った」',
                '2-3': '「ビジネスに情けは不要。次の契約履行を」',
                '3-4': '「残り僅かだな。もう諦めたらどうだ？」',
                '4-5': '「あと一歩で契約完了だ」',
                '5-defeat': '「契約満了。君の完敗だ」'
            };
        } else {
            // 彩人戦の鈴音のセリフ（デフォルト）
            suzuneDialogues = {
                '1-2': '「きゃっ...！上着が...」',
                '2-3': '「やだ...スカートまで...恥ずかしい...」',
                '3-4': '「そんな...もうやめて...！」',
                '4-5': '「いや...こんな姿...」',
                '5-defeat': '「ああ...もう...全部...」'
            };
            // 彩人のセリフ
            enemyName = '彩人';
            enemyDialogues = {
                '1-2': '「美しい...その乱れた姿も芸術だ」',
                '2-3': '「いいね...恥じらう表情が最高だよ」',
                '3-4': '「もう少しで完成だ...僕の作品が」',
                '4-5': '「素晴らしい...これぞ敗北の美学」',
                '5-defeat': '「完璧だ...君は最高の芸術品になった」'
            };
        }
        
        const suzuneText = suzuneDialogues[dialogueKey];
        const enemyText = enemyDialogues[dialogueKey];
        
        if (suzuneText && enemyText) {
            // 鈴音のセリフを先に表示
            this.addLog(`鈴音: ${suzuneText}`, 'special');
            
            // 少し遅らせて敵のセリフを表示
            setTimeout(() => {
                this.addLog(`${enemyName}: ${enemyText}`, 'enemy');
            }, 1500);
            
            // 表示済みフラグを設定
            this.exposureDialogueShown[dialogueKey] = true;
        }
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
        
        // 敌の名前を動的に取得
        const enemyName = this.currentGhost === 'kurinosuke' ? '栗之助' : 
                         this.currentGhost === 'taro' ? '太郎' : '彩人';
        this.addLog(`鈴音: ${handNames[state.selectedPlayerHand]} vs ${enemyName}: ${handNames[this.currentEnemyHand]}`, 'system');
        
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
        
        // 栗之助の場合は特別な表示
        if (this.currentGhost === 'kurinosuke') {
            // HP40%以下でパニックモード
            if (state.enemyHP <= 40) {
                this.elements.currentTell.textContent = 'パニックになり手がランダム';
                this.addLog('栗之助はパニック状態...手がランダムになった！', 'system');
            } else {
                this.elements.currentTell.textContent = '正直すぎて仕草を出さない';
                this.addLog('栗之助は正直すぎて仕草を見せない...', 'system');
            }
        } else if (this.currentGhost === 'taro') {
            // 太郎の場合は通常の仕草表示（彩人と同じ）
            if (tell) {
                const handNames = {
                    stone: '石拳',
                    scissors: '剪刀',
                    paper: '布掌'
                };
                
                this.elements.currentTell.textContent = 
                    `仕草: ${tell.name} ${tell.icon} → ${handNames[tell.target]} +20%/フェイク10%`;
                this.addLog(`太郎の仕草: ${tell.name} - ${tell.desc}`, 'system');
            } else {
                this.elements.currentTell.textContent = '仕草なし（完全ランダム）';
                this.addLog('太郎は仕草を見せない...完全ランダム', 'system');
            }
        } else {
            // 彩人の場合は通常の仕草表示
            if (tell) {
                const handNames = {
                    stone: '石拳',
                    scissors: '剪刀',
                    paper: '布掌'
                };
                
                this.elements.currentTell.textContent = 
                    `仕草: ${tell.name} ${tell.icon} → ${handNames[tell.target]} +20%/フェイク15%`;
                this.addLog(`彩人の仕草: ${tell.name} - ${tell.desc}`, 'system');
            } else {
                this.elements.currentTell.textContent = '仕草なし（完全ランダム）';
                this.addLog('彩人は仕草を見せない...完全ランダム', 'system');
            }
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
        
        // ラウンド情報更新（完了した試合数 + 1 を表示）
        // 実際にプレイした試合数 = 勝 + 負 + 引分
        const totalPlayed = state.playerWins + state.enemyWins + (state.drawCount || 0);
        const currentRound = totalPlayed + 1; // 現在進行中のラウンド
        console.log(`UI更新 - ラウンド表示: ${currentRound} (勝:${state.playerWins} 敗:${state.enemyWins} 引:${state.drawCount})`);
        this.elements.currentRound.textContent = currentRound;
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
            if (exposureData.special_event === 'ending_branch' && state.exposureLevel === 5) {
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
            const enemyName = this.currentGhost === 'kurinosuke' ? '栗之助' : 
                             this.currentGhost === 'taro' ? '太郎' : '彩人';
            this.elements.resultText.textContent = `限界状態から逆転勝利！鈴音の気迫が${enemyName}を圧倒した！`;
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
                const enemyName = this.currentGhost === 'kurinosuke' ? '栗之助' : 
                             this.currentGhost === 'taro' ? '太郎' : '彩人';
                this.elements.resultText.textContent = `${enemyName}に敗れた...（${result.reason}）`;
            }, 100);
        } else if (result.winner === 'enemy_special') {
            console.log('敵特殊勝利処理');
            
            // 完全敗北時の対話セリフを追加
            this.addExposureDialogue('5', 'defeat');
            
            this.elements.resultTitle.textContent = '屈辱的敗北...';
            const enemyName = this.currentGhost === 'kurinosuke' ? '栗之助' : 
                             this.currentGhost === 'taro' ? '太郎' : '彩人';
            this.elements.resultText.textContent = `限界露出で敗北...鈴音は恥ずかしい格奿のまま${enemyName}に屈服した...`;
            
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
        const enemyName = this.currentGhost === 'kurinosuke' ? '栗之助' : 
                         this.currentGhost === 'taro' ? '太郎' : '彩人';
        
        switch (victoryType) {
            case 'perfect_victory':
                this.elements.resultTitle.textContent = '完璧勝利！';
                this.elements.resultText.textContent = `無傷で${enemyName}を圧倒！完璧な心理戦だった！（${reason}）`;
                this.addVictoryBonus('perfect_victory');
                break;
            case 'pure_victory':
                this.elements.resultTitle.textContent = '清廉勝利！';
                this.elements.resultText.textContent = `服装を全く乱されることなく勝利！鈴音の威厳は保たれた！（${reason}）`;
                this.addVictoryBonus('pure_victory');
                break;
            default:
                this.elements.resultTitle.textContent = '勝利！';
                this.elements.resultText.textContent = `見事${enemyName}を退けた！（${reason}）`;
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
        
        // モーダルに特殊ボタンを追加する準備（既存ボタンがあれば追加しない）
        const modalContent = this.elements.resultModal.querySelector('.modal-content');
        if (!modalContent) {
            console.error('modalContentが見つかりません');
            return;
        }
        
        // すでに特殊ボタンが存在するか確認
        const existingButton = modalContent.querySelector('.special-defeat-btn');
        if (existingButton) {
            return; // すでに存在する場合は何もしない
        }
        
        const specialButton = document.createElement('button');
        specialButton.className = 'special-defeat-btn';
        specialButton.textContent = '続きを見る...';
        specialButton.style.display = 'none'; // 現在は非表示
        specialButton.addEventListener('click', () => {
            // 将来的にここで特殊イベントシーンに遷移
            alert('特殊イベントは今後実装予定です！');
        });
        
        // result-buttonsの中に挿入（エラーハンドリング強化）
        try {
            const buttonsContainer = modalContent.querySelector('.result-buttons');
            if (buttonsContainer) {
                const restartBtn = buttonsContainer.querySelector('#restart');
                if (restartBtn && restartBtn.parentNode === buttonsContainer) {
                    buttonsContainer.insertBefore(specialButton, restartBtn);
                } else {
                    buttonsContainer.appendChild(specialButton);
                }
            } else {
                // フォールバック：モーダルコンテンツの最後に追加
                modalContent.appendChild(specialButton);
            }
        } catch (error) {
            console.error('特殊ボタン追加でエラー:', error);
            // エラーが発生してもゲームを継続させるため、ボタン追加をスキップ
        }
    }
    
    // オープニング画面からチュートリアル画面へ
    showTutorial() {
        console.log('チュートリアル画面表示');
        
        // オープニング画面を非表示
        if (this.elements.openingScreen) {
            this.elements.openingScreen.style.display = 'none';
        }
        
        // チュートリアル画面を表示
        if (this.elements.tutorialScreen) {
            this.elements.tutorialScreen.style.display = 'flex';
        }
        
        // フラグ更新
        this.isOpeningScreen = false;
        this.isTutorialScreen = true;
        
        console.log('オープニング画面からチュートリアル画面に遷移完了');
    }
    
    // チュートリアル画面からストーリーシーンへ
    showStory() {
        console.log('ストーリーシーン開始');
        
        // チュートリアル画面を非表示
        if (this.elements.tutorialScreen) {
            this.elements.tutorialScreen.style.display = 'none';
        }
        
        // ストーリー画面を表示
        if (this.elements.storyScreen) {
            this.elements.storyScreen.style.display = 'flex';
        }
        
        // フラグ更新
        this.isTutorialScreen = false;
        this.isStoryScreen = true;
        this.currentStoryScene = 0;
        
        // プログレス表示更新
        if (this.elements.progressTotal) {
            this.elements.progressTotal.textContent = this.storyScenes.length;
        }
        
        // 最初のシーン表示
        this.displayStoryScene();
        
        console.log('チュートリアル画面からストーリーシーンに遷移完了');
    }
    
    // 栗之助戦ストーリー表示
    showKurinosukeStory() {
        console.log('栗之助戦ストーリー開始');
        
        // 画面状態の設定
        this.isKurinosukeStoryScreen = true;
        this.currentKurinosukeStoryIndex = 0;
        
        // 他の画面フラグをリセット
        this.isOpeningScreen = false;
        this.isTutorialScreen = false;
        this.isStoryScreen = false;
        this.isAyatoInfoScreen = false;
        this.isTaroInfoScreen = false;
        this.isKurinosukeInfoScreen = false;
        
        // 画面の表示/非表示
        this.elements.battleScreen.style.display = 'none';
        if (this.elements.openingScreen) {
            this.elements.openingScreen.style.display = 'none';
        }
        this.elements.storyScreen.style.display = 'flex'; // 太郎戦と同じくflexに
        
        // 最初のシーンを表示
        this.displayKurinosukeScene(0);
    }
    
    // 栗之助戦ストーリーシーンを表示
    displayKurinosukeScene(index) {
        if (index >= this.kurinosukeStoryScenes.length) {
            this.showKurinosukeInfo();
            return;
        }
        
        const scene = this.kurinosukeStoryScenes[index];
        
        // 背景設定
        this.elements.storyScreen.className = 'story-screen story-' + scene.background;
        
        // 太郎戦と同じ形式でタイプライター効果を使用
        this.typewriterEffect(scene.text);
        
        console.log(`栗之助戦シーン ${index + 1} 表示完了`);
    }
    
    // 栗之助戦ストーリーの次のシーン
    nextKurinosukeStoryScene() {
        this.currentKurinosukeStoryIndex++;
        this.displayKurinosukeScene(this.currentKurinosukeStoryIndex);
    }
    
    
    
    // 栗之助戦開始
    startKurinosukeBattle() {
        console.log('栗之助戦開始処理');
        
        // フラグ更新
        this.isKurinosukeInfoScreen = false;
        
        // 画面切り替え
        if (this.elements.kurinosukeInfoScreen) {
            this.elements.kurinosukeInfoScreen.style.display = 'none';
        }
        if (this.elements.battleScreen) {
            this.elements.battleScreen.style.display = 'block';
        }
        
        // ゲーム状態をリセット
        if (window.battleSystem) {
            window.battleSystem.resetGame();
        }
        
        // 露出度ダイアログフラグもリセット
        this.exposureDialogueShown = {};
        
        // 栗之助戦用のログ表示（特徴説明削除）
        this.elements.logContent.innerHTML = '<p class="log-entry system">栗之助との心理戦開始...</p>';
        
        // UI更新とラウンド開始
        this.updateUI();
        this.startNewRound();
        
        console.log('栗之助戦開始完了');
    }

    // 太郎戦用ストーリー表示
    showTaroStory() {
        console.log('太郎戦ストーリーシーン開始');
        
        // バトル画面を非表示
        if (this.elements.battleScreen) {
            this.elements.battleScreen.style.display = 'none';
        }
        
        // ストーリー画面を表示
        if (this.elements.storyScreen) {
            this.elements.storyScreen.style.display = 'flex';
        }
        
        // フラグ更新
        this.isStoryScreen = true;
        this.isTaroStory = true;
        this.currentStoryScene = 0;
        
        // プログレス表示更新
        if (this.elements.progressTotal) {
            this.elements.progressTotal.textContent = this.taroStoryScenes.length;
        }
        
        // 最初のシーン表示
        this.displayTaroStoryScene();
        
        console.log('太郎戦ストーリーシーン表示完了');
    }
    
    // 太郎戦用ストーリーシーン表示
    displayTaroStoryScene() {
        const scene = this.taroStoryScenes[this.currentStoryScene];
        if (!scene) return;
        
        // プログレス表示更新
        if (this.elements.progressCurrent) {
            this.elements.progressCurrent.textContent = this.currentStoryScene + 1;
        }
        
        // 背景変更（太郎戦用背景追加）
        if (this.elements.storyBackground) {
            const backgroundImages = {
                shrine: 'url("../images/shrine_background.jpg")',
                mansion_exterior: 'url("../images/mansion_exterior_background.jpg")',
                mansion_hall: 'url("../images/mansion_hall_background.jpg")',
                basement_stairs: 'url("../images/basement_stairs_background.jpg")', // 新背景
                basement_room: 'url("../images/basement_room_background.jpg")' // 新背景
            };
            
            const bgImage = backgroundImages[scene.background];
            if (bgImage) {
                this.elements.storyBackground.style.backgroundImage = bgImage;
            } else {
                // フォールバック: 既存の背景を使用
                const fallbackBg = scene.background.includes('basement') ? 
                    'url("../images/mansion_hall_background.jpg")' : 
                    backgroundImages['mansion_hall'];
                this.elements.storyBackground.style.backgroundImage = fallbackBg;
            }
        }
        
        // タイプライター効果でテキスト表示
        this.typewriterEffect(scene.text);
        
        console.log(`太郎戦ストーリーシーン ${this.currentStoryScene + 1} 表示`);
    }
    
    // ストーリーシーン表示
    displayStoryScene() {
        const scene = this.storyScenes[this.currentStoryScene];
        if (!scene) return;
        
        // プログレス表示更新
        if (this.elements.progressCurrent) {
            this.elements.progressCurrent.textContent = this.currentStoryScene + 1;
        }
        
        // 背景変更（画像対応）
        if (this.elements.storyBackground) {
            const backgroundImages = {
                shrine: 'url("../images/shrine_background.jpg")',
                mansion_exterior: 'url("../images/mansion_exterior_background.jpg")',
                mansion_hall: 'url("../images/mansion_hall_background.jpg")'
            };
            
            const bgImage = backgroundImages[scene.background];
            if (bgImage) {
                this.elements.storyBackground.style.backgroundImage = bgImage;
            }
        }
        
        // タイプライター効果でテキスト表示
        this.typewriterEffect(scene.text);
    }
    
    // タイプライター効果（話者別表示）
    typewriterEffect(text) {
        const textElement = this.elements.storyText;
        if (!textElement) return;
        
        // ボタンを無効化
        if (this.elements.storyNextBtn) {
            this.elements.storyNextBtn.disabled = true;
        }
        
        textElement.innerHTML = '';
        textElement.classList.add('typing');
        
        // テキストを解析して話者と台詞に分ける
        const dialogues = this.parseDialogues(text);
        let currentDialogueIndex = 0;
        
        const showNextDialogue = () => {
            if (currentDialogueIndex >= dialogues.length) {
                // 全て完了
                textElement.classList.remove('typing');
                if (this.elements.storyNextBtn) {
                    this.elements.storyNextBtn.disabled = false;
                }
                return;
            }
            
            const dialogue = dialogues[currentDialogueIndex];
            this.displayDialogue(dialogue, () => {
                currentDialogueIndex++;
                // 次の台詞まで少し待機
                setTimeout(showNextDialogue, 1200);
            });
        };
        
        showNextDialogue();
    }
    
    // テキストを話者と台詞に解析
    parseDialogues(text) {
        const dialogues = [];
        const lines = text.split('\n').filter(line => line.trim() !== '');
        
        // 複数行にわたる台詞を結合する処理
        const mergedLines = [];
        let currentMergedLine = '';
        let inQuote = false;
        let inDialogueSpan = false;
        
        for (const line of lines) {
            const trimmed = line.trim();
            
            // HTMLタグの台詞の判定
            if (trimmed.includes('<span class="dialogue">') && !trimmed.includes('</span>')) {
                inDialogueSpan = true;
                currentMergedLine = trimmed;
            }
            else if (inDialogueSpan && trimmed.includes('</span>')) {
                currentMergedLine += ' ' + trimmed;
                mergedLines.push(currentMergedLine);
                currentMergedLine = '';
                inDialogueSpan = false;
            }
            else if (inDialogueSpan) {
                currentMergedLine += ' ' + trimmed;
            }
            // 括弧開始の判定
            else if (trimmed.includes('「') && !trimmed.includes('」')) {
                inQuote = true;
                currentMergedLine = trimmed;
            }
            // 括弧終了の判定
            else if (inQuote && trimmed.includes('」')) {
                currentMergedLine += ' ' + trimmed;
                mergedLines.push(currentMergedLine);
                currentMergedLine = '';
                inQuote = false;
            }
            // 括弧内の継続行
            else if (inQuote) {
                currentMergedLine += ' ' + trimmed;
            }
            // 通常の行
            else {
                mergedLines.push(trimmed);
            }
        }
        
        // 残った行があれば追加
        if (currentMergedLine) {
            mergedLines.push(currentMergedLine);
        }
        
        for (const line of mergedLines) {
            let trimmed = line.trim();
            
            // HTMLタグを含む台詞の処理
            if (trimmed.includes('<span class="dialogue">')) {
                // 先に地の文を処理してから台詞を処理する
                let workingText = trimmed;
                
                // dialogue spanを抽出
                const dialogueMatches = trimmed.match(/<span class="dialogue">(.*?)<\/span>/g);
                
                if (dialogueMatches) {
                    // 各台詞を処理
                    dialogueMatches.forEach(match => {
                        // HTMLタグを完全に除去してテキストのみ抽出
                        let cleanText = match.replace(/<span class="dialogue">(.*?)<\/span>/, '$1');
                        // 全てのHTMLタグを除去（ネストしたものも含む）
                        cleanText = cleanText.replace(/<[^>]*>/g, '');
                        // HTMLエンティティもデコード
                        cleanText = cleanText.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
                        
                        if (cleanText.trim()) {
                            // 先頭の丸や余分な記号を削除（より広範囲に対応）
                            cleanText = cleanText.replace(/^[•・○◦●◯]\s*/, '').trim();
                            // 特定の文字列の先頭記号も削除
                            cleanText = cleanText.replace(/^。\s*/, '').trim();
                            // 「」記号を削除
                            cleanText = cleanText.replace(/「|」/g, '').trim();
                            
                            // 話者判定 - デフォルトはナレーション
                            let speaker = 'ナレーション';
                            
                            console.log('話者判定中 - テキスト:', cleanText);
                            
                            // 栗之助の台詞判定を最優先に
                            if (cleanText.includes('定刻通りですね') ||
                                cleanText.includes('私は栗之助') ||
                                cleanText.includes('元大企業の営業部長です') ||
                                cleanText.includes('その前に、私の話を聞いてください') ||
                                cleanText.includes('私の話を聞いてください') ||
                                cleanText.includes('重要な商談で') ||
                                cleanText.includes('三手で決めよう') ||
                                cleanText.includes('プレッシャーから') ||
                                cleanText.includes('同じ手を3回出して') ||
                                cleanText.includes('会社は倒産') ||
                                cleanText.includes('過労死しました') ||
                                cleanText.includes('データを開示します') ||
                                cleanText.includes('石拳を80%の確率で') ||
                                cleanText.includes('これは私のトラウマ') ||
                                cleanText.includes('同じ手を出し続ける癖です') ||
                                cleanText.includes('ビジネスは透明性が大切です') ||
                                cleanText.includes('ただし20%は違う手も') ||
                                cleanText.includes('契約を開始しましょう') ||
                                cleanText.includes('契約内容は単純です') ||
                                cleanText.includes('私が勝てばあなたの服を') ||
                                cleanText.includes('あなたが勝てば私は成仏') ||
                                cleanText.includes('準備はよろしいですか') ||
                                cleanText.includes('地下の奴に気をつけろ') ||
                                cleanText.includes('あいつは俺よりもずっと') ||
                                cleanText.includes('歪んでいる')) {
                                speaker = '栗之助';
                                console.log('→ 栗之助として判定');
                            } 
                            // 鈴音の台詞判定
                            else if (cleanText.includes('何かが...下にいる') ||
                                      cleanText.includes('三手で...？') ||
                                      cleanText.includes('望むところです') || 
                                      cleanText.includes('成仏させて') || 
                                      cleanText.includes('分かりました') ||
                                      cleanText.includes('必ずや') ||
                                      cleanText.includes('いいでしょう') ||
                                      cleanText.includes('あなたも淫霊ね') ||
                                      cleanText.includes('自分の手の内を明かすの') ||
                                      cleanText.includes('望むところよ') ||
                                      cleanText.includes('あなたのトラウマも浄化してあげる')) {
                                speaker = '鈴音';
                                console.log('→ 鈴音として判定');
                            } 
                            // 太郎の台詞判定
                            else if ((cleanText.includes('くくく') ||
                                      cleanText.includes('また来たか') ||
                                      cleanText.includes('私は太郎') ||
                                      cleanText.includes('親友に裏切られて死んだ') ||
                                      cleanText.includes('三手でな') ||
                                      cleanText.includes('あいつは俺の手を全部読んでた') ||
                                      cleanText.includes('友情なんて嘘だった') ||
                                      cleanText.includes('俺は相手の逆を突く') ||
                                      cleanText.includes('さあ始めようか') ||
                                      cleanText.includes('お前の考えなんて全部お見通しだ')) &&
                                      !cleanText.includes('太郎、ごめん') &&
                                      !cleanText.includes('テーブルの上にあるノート') &&
                                      !cleanText.includes('最後のページに')) {
                                speaker = '太郎';
                                console.log('→ 太郎として判定');
                            }
                            // 彩人の台詞判定
                            else if (cleanText.includes('美しい') ||
                                cleanText.includes('芸術') ||
                                cleanText.includes('この世で最も') ||
                                cleanText.includes('今こそ真の') ||
                                cleanText.includes('淫術拳') ||
                                cleanText.includes('見事だよ、鈴音') ||
                                cleanText.includes('この屋敷の掟を教えてあげる') ||
                                cleanText.includes('地下に行くほど、淫霊は強く...淫らになる') ||
                                cleanText.includes('負けた時のエロい代償も') ||
                                cleanText.includes('次は栗之助...冷徹なビジネスマン') ||
                                cleanText.includes('君との三手勝負楽しかった')) {
                                speaker = '彩人';
                                console.log('→ 彩人として判定');
                            }
                            // ナレーション判定（特定のフレーズを含む場合）
                            else if (cleanText.includes('彩人の姿が薄れ') ||
                                cleanText.includes('地下への階段') ||
                                cleanText.includes('うっ...淫気が一気に') ||
                                cleanText.includes('ここが地下1階') ||
                                cleanText.includes('書類を持った男性が現れる') ||
                                cleanText.includes('オフィスのようだ')) {
                                speaker = 'ナレーション';
                                console.log('→ ナレーションとして判定（特定フレーズ）');
                            } else {
                                console.log('→ デフォルト（ナレーション）:', speaker);
                            }
                            
                            if (cleanText) {
                                dialogues.push({ speaker: speaker, text: cleanText });
                            }
                        }
                        
                        // 処理済みの台詞をworkingTextから削除
                        workingText = workingText.replace(match, '');
                    });
                }
                
                // 残った部分（地の文）を処理
                let narrativeText = workingText.trim();
                // 地の文からもHTMLタグを除去
                narrativeText = narrativeText.replace(/<[^>]*>/g, '');
                // 先頭の丸や余分な記号を削除（より広範囲に対応）
                narrativeText = narrativeText.replace(/^[•・○◦●◯]\s*/, '').trim();
                narrativeText = narrativeText.replace(/^。\s*/, '').trim();
                if (narrativeText) {
                    dialogues.push({ speaker: 'ナレーション', text: narrativeText });
                }
            } 
            // 通常の括弧での台詞
            else if (trimmed.includes('「') || trimmed.includes('」')) {
                const quoteMatches = trimmed.match(/「(.*?)」/g);
                
                if (quoteMatches) {
                    quoteMatches.forEach(quote => {
                        let cleanQuote = quote.replace(/[「」]/g, '');
                        // 先頭の丸や余分な記号を削除（より広範囲に対応）
                        cleanQuote = cleanQuote.replace(/^[•・○◦●◯]\s*/, '').trim();
                        cleanQuote = cleanQuote.replace(/^。\s*/, '').trim();
                        
                        if (cleanQuote) {
                            // 話者判定
                            let speaker = 'ナレーション';
                            
                            // 台詞内容で判定
                            if (cleanQuote.includes('分かりました') || 
                                cleanQuote.includes('必ずや') || 
                                cleanQuote.includes('成仏させて') ||
                                cleanQuote.includes('ここが...噂の屋敷') ||
                                cleanQuote.includes('望むところです')) {
                                speaker = '鈴音';
                            } else if (cleanQuote.includes('街外れの屋敷') || 
                                      cleanQuote.includes('あの屋敷に入った者') ||
                                      cleanQuote.includes('魂を奪われて')) {
                                speaker = '老人';
                            } else if (trimmed.includes('鈴音')) {
                                speaker = '鈴音';
                            } else {
                                // デフォルトは前の話者を継続
                                speaker = dialogues.length > 0 && dialogues[dialogues.length - 1].speaker !== 'ナレーション' 
                                        ? dialogues[dialogues.length - 1].speaker : 'ナレーション';
                            }
                            
                            dialogues.push({ speaker: speaker, text: cleanQuote });
                        }
                    });
                }
                
                // 括弧以外の地の文
                let withoutQuotes = trimmed.replace(/「.*?」/g, '').trim();
                // 先頭の丸や余分な記号を削除（より広範囲に対応）
                withoutQuotes = withoutQuotes.replace(/^[•・○◦●◯]\s*/, '').trim();
                withoutQuotes = withoutQuotes.replace(/^。\s*/, '').trim();
                if (withoutQuotes) {
                    dialogues.push({ speaker: 'ナレーション', text: withoutQuotes });
                }
            } 
            // 地の文のみ
            else {
                let narrativeOnly = trimmed.replace(/^[•・○◦●◯]\s*/, '').trim();
                narrativeOnly = narrativeOnly.replace(/^。\s*/, '').trim();
                if (narrativeOnly) {
                    dialogues.push({ speaker: 'ナレーション', text: narrativeOnly });
                }
            }
        }
        
        return dialogues;
    }
    
    // 句読点を適切に追加する関数
    addPunctuation(text) {
        // 既に句読点がある場合はそのまま返す
        if (text.match(/[。！？…―]$/)) {
            return text;
        }
        
        // 特殊な終わり方（句読点を追加しない）
        if (text.endsWith('―') || text.endsWith('...') || text.endsWith('…') || 
            text.endsWith('、') || text.endsWith('。、')) {
            return text.replace(/。、$/, '。'); // 重複した句読点を修正
        }
        
        // 疑問文の判定
        if (text.includes('ですか') || text.includes('でしょうか') || text.includes('だろうか') ||
            (text.endsWith('か') && (text.includes('どう') || text.includes('何') || text.includes('いつ') || text.includes('どこ') || text.includes('誰')))) {
            return text + '？';
        }
        
        // 感嘆文の判定（「淫術拳」は感嘆符なしに）
        if (text.includes('ようこそ') || 
            (text.endsWith('よ') && !text.includes('淫術拳')) || 
            text.endsWith('ぞ') || text.endsWith('な')) {
            return text + '！';
        }
        
        // 通常の文
        if (text.endsWith('だった') || text.endsWith('である') || text.endsWith('です') || 
            text.endsWith('だ') || text.endsWith('ます') ||
            text.endsWith('た') || text.endsWith('る') || text.endsWith('う') ||
            text.includes('淫術拳')) {
            return text + '。';
        }
        
        // デフォルトは句点
        return text + '。';
    }
    
    // 個別の台詞を表示
    displayDialogue(dialogue, callback) {
        const textElement = this.elements.storyText;
        
        // 前の内容をクリア
        textElement.innerHTML = '';
        
        // 話者名の日本語表示
        const speakerNames = {
            '鈴音': '鈴音',
            '彩人': '彩人',
            '太郎': '太郎',
            '栗之助': '栗之助',
            '老人': '老人',
            'ナレーション': 'ナレーション'
        };
        
        // 話者名を作成
        const speakerDiv = document.createElement('div');
        speakerDiv.className = 'speaker-name';
        speakerDiv.textContent = speakerNames[dialogue.speaker] + '：';
        
        // 台詞部分を作成
        const dialogueDiv = document.createElement('div');
        dialogueDiv.className = 'dialogue-text';
        
        textElement.appendChild(speakerDiv);
        textElement.appendChild(dialogueDiv);
        
        // 句読点を追加したテキストを取得
        const textWithPunctuation = this.addPunctuation(dialogue.text);
        
        // 台詞を一文字ずつ表示
        let charIndex = 0;
        const charSpeed = 60; // 速度を遅く（40→60）
        
        const typeChar = () => {
            if (charIndex < textWithPunctuation.length) {
                dialogueDiv.textContent = textWithPunctuation.slice(0, charIndex + 1);
                charIndex++;
                setTimeout(typeChar, charSpeed);
            } else {
                // この台詞完了
                setTimeout(callback, 600);
            }
        };
        
        typeChar();
    }
    
    // 次のストーリーシーン
    nextStoryScene() {
        if (this.isKurinosukeStoryScreen) {
            // 栗之助戦ストーリーの場合
            this.nextKurinosukeStoryScene();
            return;
        }
        
        this.currentStoryScene++;
        
        if (this.isTaroStory) {
            // 太郎戦ストーリーの場合
            if (this.currentStoryScene >= this.taroStoryScenes.length) {
                // 太郎戦ストーリー終了、太郎特徴説明画面へ
                this.showTaroInfo();
            } else {
                // 次のシーン表示
                this.displayTaroStoryScene();
            }
        } else {
            // 通常（彩人戦）ストーリーの場合
            if (this.currentStoryScene >= this.storyScenes.length) {
                // ストーリー終了、彩人特徴説明画面へ
                this.showAyatoInfo();
            } else {
                // 次のシーン表示
                this.displayStoryScene();
            }
        }
    }
    
    // 彩人特徴説明画面を表示
    showAyatoInfo() {
        // フラグ更新
        this.isStoryScreen = false;
        this.isAyatoInfoScreen = true;
        
        // 画面切り替え
        this.elements.storyScreen.style.display = 'none';
        this.elements.ayatoInfoScreen.style.display = 'block';
        
        console.log('彩人特徴説明画面を表示');
    }
    
    // 栗之助特徴説明画面を表示
    showKurinosukeInfo() {
        // フラグ更新
        this.isStoryScreen = false;
        this.isKurinosukeInfoScreen = true;
        
        // 画面切り替え
        this.elements.storyScreen.style.display = 'none';
        this.elements.kurinosukeInfoScreen.style.display = 'block';
        
        console.log('栗之助特徴説明画面を表示');
    }
    
    // 太郎特徴説明画面を表示
    showTaroInfo() {
        console.log('=== 太郎特徴説明画面表示開始 ===');
        
        // フラグ更新
        this.isStoryScreen = false;
        this.isTaroStory = false;
        this.isTaroInfoScreen = true;
        
        // 彩人用の画面を太郎用にカスタマイズして表示
        this.elements.storyScreen.style.display = 'none';
        this.elements.ayatoInfoScreen.style.display = 'block';
        
        // 画面全体を太郎用に更新
        
        // 1. タイトルを「第三淫霊：太郎」に変更
        const titleElement = this.elements.ayatoInfoScreen.querySelector('.ayato-name');
        if (titleElement) {
            titleElement.textContent = '第三淫霊：太郎（たろう）';
        }
        
        // 2. 基本性能セクションを更新 (最初の.info-section)
        const infoSections = this.elements.ayatoInfoScreen.querySelectorAll('.info-section');
        console.log('太郎info画面 - info-sectionの数:', infoSections.length);
        if (infoSections[0]) {
            console.log('基本性能セクション更新中');
            infoSections[0].querySelector('.section-content').innerHTML = `
                <p><strong>手の確率:</strong> プレイヤーの前回の手に60%の確率でカウンター、40%でランダム</p>
                <p><strong>適応型AI:</strong> プレイヤーの手を読んで対抗</p>
            `;
        } else {
            console.error('基本性能セクションが見つかりません');
        }
        
        // 3. キャラクター設定セクションを更新 (2番目の.info-section)
        if (infoSections[1]) {
            console.log('キャラクター設定セクション更新中');
            infoSections[1].querySelector('.section-content').innerHTML = `
                <p><strong>元学生淫霊:</strong> 親友に裏切られてゼミの地下室で死亡</p>
                <p><strong>心理戦重視:</strong> 相手の手を読み、逆を突く戦術</p>
                <p><strong>難易度:</strong> ★★★☆☆</p>
            `;
        } else {
            console.error('キャラクター設定セクションが見つかりません');
        }
        
        // 4. 戦闘の特徴セクションを更新 (3番目の.info-section)
        if (infoSections[2]) {
            console.log('戦闘の特徴セクション更新中');
            infoSections[2].querySelector('.section-content').innerHTML = `
                <p><strong>仕草システム:</strong> 30%の確率で仕草表示（通常より高確率）</p>
                <p><strong>フェイク:</strong> 約10%の確率で仕草と違う手を出す</p>
                <p><strong>挑発対応:</strong> プレイヤーの挑発に80%で反応</p>
                <p><strong>特殊パターン:</strong> 3連敗すると完全ランダムに切り替わり</p>
            `;
        } else {
            console.error('戦闘の特徴セクションが見つかりません');
        }
        
        // 5. 右側のキャラクター名とサブタイトル
        const characterName = this.elements.ayatoInfoScreen.querySelector('.ayato-name-display');
        if (characterName) {
            characterName.textContent = '太郎';
        }
        
        const characterSubtitle = this.elements.ayatoInfoScreen.querySelector('.ayato-subtitle');
        if (characterSubtitle) {
            characterSubtitle.textContent = '元学生淫霊';
        }
        
        // 6. 従来の特徴説明も更新（フォールバック用）
        const characterDesc = this.elements.ayatoInfoScreen.querySelector('.character-description');
        if (characterDesc) {
            characterDesc.innerHTML = `
                <div class="character-trait">
                    <span class="trait-icon">👤</span>
                    <span class="trait-text">親友に裏切られて死んだ学生霊</span>
                </div>
                <div class="character-trait">
                    <span class="trait-icon">🎭</span>
                    <span class="trait-text">仕草率: 30%（栗之助より高頻度）</span>
                </div>
                <div class="character-trait">
                    <span class="trait-icon">🎪</span>
                    <span class="trait-text">フェイク率: 10%（時々嘘の仕草）</span>
                </div>
                <div class="character-trait">
                    <span class="trait-icon">🧠</span>
                    <span class="trait-text">適応型AI: プレイヤーの手を学習・対応</span>
                </div>
                <div class="character-trait">
                    <span class="trait-icon">💔</span>
                    <span class="trait-text">友情モード: 同じ手を出すと親友を思い出す</span>
                </div>
            `;
        }
        
        console.log('太郎特徴説明画面表示完了');
    }
    
    // 特徴説明画面からバトル開始
    startBattle() {
        // フラグ更新
        this.isAyatoInfoScreen = false;
        this.isKurinosukeInfoScreen = false;
        this.isTaroInfoScreen = false;
        
        // 画面切り替え
        this.elements.ayatoInfoScreen.style.display = 'none';
        if (this.elements.kurinosukeInfoScreen) {
            this.elements.kurinosukeInfoScreen.style.display = 'none';
        }
        
        if (this.currentGhost === 'kurinosuke') {
            console.log('栗之助特徴説明画面からバトル開始');
            // 栗之助戦の場合は直接戦闘開始
            this.startKurinosukeBattle();
        } else if (this.currentGhost === 'taro') {
            console.log('太郎特徴説明画面からバトル開始');
            // 太郎戦の場合は直接戦闘開始
            this.startTaroBattle();
        } else {
            console.log('彩人特徴説明画面からバトル開始');
            // 元のstartGame処理を呼び出し
            this.startGame();
        }
    }
    
    // 太郎戦開始
    startTaroBattle() {
        console.log('太郎戦開始処理');
        
        // バトル画面を表示
        if (this.elements.battleScreen) {
            this.elements.battleScreen.style.display = 'block';
        }
        
        // ゲーム状態をリセット
        if (window.battleSystem) {
            window.battleSystem.resetGame();
        }
        
        // 露出度ダイアログフラグもリセット
        this.exposureDialogueShown = {};
        
        // 太郎戦用のログ表示（特徴説明削除）
        this.elements.logContent.innerHTML = '<p class="log-entry system">太郎との心理戦開始...</p>';
        
        // UI更新とラウンド開始
        this.updateUI();
        this.startNewRound();
        
        console.log('太郎戦開始完了');
    }
    
    // ストーリー終了からゲーム開始
    startGame() {
        console.log('ゲーム開始処理開始');
        
        // ストーリー画面を非表示
        if (this.elements.storyScreen) {
            this.elements.storyScreen.style.display = 'none';
        }
        
        // バトル画面を表示
        if (this.elements.battleScreen) {
            this.elements.battleScreen.style.display = 'block';
        }
        
        // フラグ更新
        this.isStoryScreen = false;
        
        console.log('ストーリーシーンからバトル画面に遷移完了');
    }

    // ゲーム再開
    restartGame() {
        window.battleSystem.resetGame();
        this.elements.resultModal.classList.add('hidden');
        const enemyName = this.currentGhost === 'kurinosuke' ? '栗之助' : 
                         this.currentGhost === 'taro' ? '太郎' : '彩人';
        this.elements.logContent.innerHTML = `<p class="log-entry system">${enemyName}との心理戦開始...</p>`;
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
        this.fixRewindButtonStructure(); // 読み直しボタンの構造を修正
        this.startNewRound();
    }
    
    // 次の淫霊に進む
    nextGhost() {
        console.log('=== nextGhost() メソッド実行開始 ===');
        
        // モーダルを閉じる
        this.elements.resultModal.classList.add('hidden');
        
        console.log('▼ 条件分岐前の状態確認');
        console.log('this.currentGhost の値:', this.currentGhost);
        console.log('this.currentGhost の型:', typeof this.currentGhost);
        console.log('this.currentGhost === "kurinosuke" ?', this.currentGhost === 'kurinosuke');
        
        // 現在栗之助戦かどうかをチェック
        if (this.currentGhost === 'kurinosuke') {
            console.log('>>> 栗之助戦判定: TRUE - 太郎戦ストーリーに遷移');
            // 栗之助戦後は太郎戦ストーリーへ遷移
            this.currentGhost = 'taro';
            window.battleSystem.switchGhost('taro');
            this.updateGhostUI();
            
            // HPのみリセット、ラウンドカウントは継続
            window.battleSystem.gameState.enemyHP = 100;
            
            // 戦闘状態のみリセット（ラウンドは継続）
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
            
            // 太郎戦ストーリー表示
            this.showTaroStory();
            return;
        } else if (this.currentGhost === 'taro') {
            console.log('>>> 太郎戦判定: TRUE - 現在は彩人戦に戻る（将来的には次の淫霊へ）');
            // 太郎戦後は彩人戦に戻る（将来的には次の淫霊戦へ）
            this.currentGhost = 'ayato';
            window.battleSystem.switchGhost('ayato');
            this.updateGhostUI();
            
            // ログをクリア
            this.elements.logContent.innerHTML = '<p class="log-entry system">彩人との心理戦開始...</p>';
            
            // HPのみリセット、ラウンドカウントは継続
            window.battleSystem.gameState.enemyHP = 100;
            
            // 戦闘状態のみリセット（ラウンドは継続）
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
            return;
        } else {
            console.log('>>> 彩人戦判定 - 栗之助戦イベントに遷移');
        }
        
        // 彩人戦後は栗之助戦イベントへ
        console.log('彩人戦後 - 栗之助戦イベントを開始');
        this.currentGhost = 'kurinosuke';
        console.log('淫霊を栗之助に変更:', this.currentGhost);
        window.battleSystem.switchGhost('kurinosuke');
        this.updateGhostUI();
        
        // 栗之助戦イベント表示
        this.showKurinosukeStory();
        return;
        
        // ログをクリア
        this.elements.logContent.innerHTML = '<p class="log-entry system">栗之助との心理戦開始...</p>';
        
        // HPのみリセット、ラウンドカウントは継続
        window.battleSystem.gameState.enemyHP = 100;
        
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
        console.log('=== nextGhost() 終了 ===');
    }

    // 淫霊UIを更新
    updateGhostUI() {
        let ghostData = null;
        if (this.currentGhost === 'kurinosuke') {
            ghostData = window.csvLoader.getKurinosukeData();
        } else if (this.currentGhost === 'ayato') {
            ghostData = window.csvLoader.getAyatoData();
        } else if (this.currentGhost === 'taro') {
            ghostData = window.csvLoader.getTaroData();
        }
        
        if (ghostData) {
            // 敵の名前を更新（右側の淫霊の名前のみ）
            const enemyNameElements = document.querySelectorAll('.enemy-section .character-name');
            enemyNameElements.forEach(elem => {
                elem.textContent = ghostData.name;
            });
            
            // HP表示の名前を更新
            const hpLabel = document.querySelector('.enemy-hp .hp-label');
            if (hpLabel) {
                hpLabel.textContent = `${ghostData.name}（淫霊）`;
            }
            
            // 勝利カウントの名前を更新（カウント値は保持）
            const enemyWinsLabel = document.querySelector('.enemy-wins');
            const enemyWinsSpan = document.getElementById('enemy-wins');
            if (enemyWinsLabel && enemyWinsSpan) {
                const currentWins = enemyWinsSpan.textContent;
                enemyWinsLabel.innerHTML = `${ghostData.name}: <span id="enemy-wins">${currentWins}</span>勝`;
                // 新しい要素の参照を更新
                this.elements.enemyWins = document.getElementById('enemy-wins');
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
        
        // 開発者用URLパラメータチェック
        const urlParams = new URLSearchParams(window.location.search);
        const directStart = urlParams.get('battle');
        
        if (directStart) {
            console.log('開発者用直接スタート:', directStart);
            this.startDirectBattle(directStart);
        } else {
            // 通常のゲーム開始
            this.updateUI();
            this.startNewRound();
        }
        
        console.log('startNewRound完了');
        console.log('Game initialized successfully');
        
        // グローバルにゲームインスタンスを公開
        window.gameInstance = this;
    }
    
    // 開発者用：直接戦闘開始
    startDirectBattle(ghostId) {
        console.log('=== startDirectBattle開始 ===', ghostId);
        // オープニング画面を非表示、バトル画面を表示
        if (this.elements.openingScreen) {
            console.log('オープニング画面を非表示');
            this.elements.openingScreen.style.display = 'none';
        }
        if (this.elements.battleScreen) {
            console.log('バトル画面を表示');
            this.elements.battleScreen.style.display = 'block';
        }
        
        // フラグ更新
        this.isOpeningScreen = false;
        this.isTutorialScreen = false;
        this.isStoryScreen = false;
        this.isAyatoInfoScreen = false;
        
        // 指定された敵に切り替え
        if (ghostId === 'taro' || ghostId === 'kurinosuke' || ghostId === 'ayato') {
            this.currentGhost = ghostId;
            
            // 開発用：初期化してからスタート
            window.battleSystem.resetGame();
            window.battleSystem.switchGhost(ghostId);
            this.updateGhostUI();
            
            // ログをクリア
            const enemyName = ghostId === 'kurinosuke' ? '栗之助' : 
                             ghostId === 'taro' ? '太郎' : '彩人';
            this.elements.logContent.innerHTML = `<p class="log-entry system">${enemyName}との心理戦開始...</p>`;
            
            console.log(`直接${enemyName}戦を開始`);
        } else if (ghostId === 'taro-story') {
            // 太郎戦ストーリーから開始
            this.currentGhost = 'taro';
            window.battleSystem.resetGame();
            window.battleSystem.switchGhost('taro');
            this.updateGhostUI();
            
            // HPのみリセット
            window.battleSystem.gameState.enemyHP = 100;
            
            // 太郎戦ストーリー表示
            this.showTaroStory();
            console.log('直接太郎戦ストーリーを開始');
            return; // ここでreturnしてstartNewRoundを呼ばない
        } else if (ghostId === 'kurinosuke-story') {
            // 栗之助戦ストーリーから開始
            this.currentGhost = 'kurinosuke';
            window.battleSystem.resetGame();
            window.battleSystem.switchGhost('kurinosuke');
            this.updateGhostUI();
            
            // HPのみリセット
            window.battleSystem.gameState.enemyHP = 100;
            
            // 栗之助戦ストーリー表示
            this.showKurinosukeStory();
            console.log('直接栗之助戦ストーリーを開始');
            return; // ここでreturnしてstartNewRoundを呼ばない
        }
        
        // ゲーム開始
        this.updateUI();
        this.startNewRound();
        console.log('=== startDirectBattle完了 ===');
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