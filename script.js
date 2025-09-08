// ===================================================================================
//
// Application Main Logic
//
// ===================================================================================
const App = {
    // ---------------------------------------------------------------------------
    // CONFIG: 全ての設定データ（テンプレート、ボタン構成など）
    // ---------------------------------------------------------------------------
    CONFIG: {
        holidays: [
            '2025-07-21', '2025-08-11', '2025-09-15', '2025-09-23',
            '2025-10-13', '2025-11-03', '2025-11-23', '2025-11-24', '2025-12-31',
            '2026-01-01', '2026-01-02', '2026-01-12', '2026-02-11', '2026-02-23',
            '2026-03-20', '2026-04-29', '2026-05-03', '2026-05-04', '2026-05-05',
            '2026-05-06', '2026-07-20', '2026-08-11', '2026-09-21', '2026-09-22',
            '2026-09-23', '2026-10-12', '2026-11-03', '2026-11-23', '2026-12-31'
        ],
        commonTemplates: {
            xNotifyText: `Youtube動画用のX告知文を、全角125文字ぴったりで作成してください。この文章を見て動画のURLをクリックしたくなるようなものにしてください。内容について触れても構わないが、動画の視聴意欲がなくならないように、動画の結論や最も重要な内容は告知文に書かないでください。文章末尾に検索されやすいようにハッシュタグも必ず付与し、出典の記述、カッコ、番号は一切入れないでください。`,
            voiceNote: `\n# 最重要ルール\n・生成する音声の長さは、必ず{{audioLength}}の間に厳密に収めてください。\n\n# 要約の指示\n・詳細なデータや背景情報は大幅に省略し、結論と主要な根拠に絞って構成してください。\n\n# その他ルール\n・この音声では、元の資料やソース、レポート、出典などの存在に一切触れず、内容のみを自然な解説としてまとめてください。ただし、決算資料のみ決算資料であることに触れて構いません。`,
            gaiyoNote: `YouTube動画の概要欄を、10行程度＋ハッシュタグ1行で作成してください。ただし、次の点を守ってください。\n・結論や分析の最終的な評価・見通し、最大の注目ポイントは書かない\n・視聴者が『どの事実・データ・話題に触れるのか』『どんな観点・エピソードが登場するか』を分かるように、具体的な話題やポイント、視点、議論の流れ（例：部門別の業績動向、地域ごとの売上変化、投資家の関心事項など）を紹介する\n・どのような人やニーズに合う動画かも1行程度で記載\n・本編で明かす重要な分析結果やインサイトには言及しない\n・特に動画への期待や「ぜひご視聴ください」といった視聴アクションにつなげる締め文を入れる\n・出典やカッコ番号は不要\n・テンプレート文として、備考欄の最後に2行改行し、\n\n本動画にはAI生成コンテンツが含まれています。\n迅速な解説と、内容の可視化（図解・イラスト化）を実現するため、ナレーションや資料作成のプロセスに生成AIを積極的に活用しています。\nAIの特性上、音声のイントネーションや資料の細部に不自然な点が生じる場合があります。\nつきましては、表現上の細かな点に関するご指摘は、どうかご容赦いただけますようお願い申し上げます。\nまた、内容の正確性には十分配慮しておりますが、事実確認や最終的な判断はご自身でお願いいたします。\n\nと記載してください。`,
            thumbnail: `YouTube動画を作成します。\nサムネイル用に、その日の相場を表す短文を考えてください。\n1行あたり「全角6～8文字」×3行で配置します。\n各行にふさわしい全角6～8文字の文章を生成してください。`,
            titleBf: `YouTube動画を作成します。\n見たくなるようなYouTubeタイトル案を5パターン考えてください。\n※「株価下落の真相は？」「今後どうなる？」「意外な理由が…」など、視聴者に疑問や興味を持たせる内容にしてください。`,
            titleAf: "\n※出典・カッコ・番号などは入れず、文章だけを提示してください。",
            reportKk: `YouTube動画を作成するので、投影資料を作成するための根拠資料を8000文字以上で作成してください\n・根拠資料として使用するため、引用やカッコつきの番号は記載しないでください`,
            reportSs: `YouTube動画を作成するので、動画内で使用する投影資料を作成してください。\n・表紙は、表題と、内容を4行程度の文章でまとめてください。\nただし、「この資料は」などとプレゼン資料自体の事を書かないでください\nまた、資料・動画の視聴意欲がなくならないように、結論や最も重要な内容は書かないでください。\n・最後のページは「まとめ」のページにしてください\n・目次、企業概要のスライドは作成しないでください`,
            reportGc: `\n・決算の結果、業績予想は大きな数字のレイアウトで作成してください\n数字の単位（百万円など）は数字の後ろに付けず、見出し（売上高、営業利益など）の後ろに付加し「売上高(百万円)」の形式で表示してください\n・グラフに使用する金額はドルではなく数値扱いとしてください\n・前年と比較するグラフを作成する場合は、前年の率ではなく金額と比較するグラフにしてください\n・業績予想の修正をした場合は、表で前回発表、今回修正、増減額、増減率をまとめてください`,
            upDownCorrectionNote: `\n・日付は「今日」「昨日」と言わず、必ず「8月5日」のように具体的な日付で話してください。特定の日付に続く「前日」などの表現は問題ありません。\n# 最重要ルール：応答の原則\n以下の個別ルールを適用するにあたり、下記の3つの原則を応答の最初から最後まで、常に厳守してください。\n1. 静かなルール適用:\n    すべてのルールは、会話の裏側で静かに適用してください。ルールの適用過程や、「〇〇というルールに従い、」のような前置きは一切不要です。\n2. 自然な発話（繰り返し厳禁）:\n    特定の単語や数値を不自然に繰り返す癖があります。（例：「上期、上期は」「4500万円。4500万円」）。すべての発言は、自然な人間の会話のように、一度だけ行ってください。\n3. 一貫性と自己チェック:\n    指示されたルールは、応答の途中で忘れることなく、最後まで一貫して適用してください。応答を終える前に、すべての指示が守られているか必ず自己チェックする習慣をつけてください。\n---\n### 個別ルール\n---\n# 1. 固有名詞・専門用語の読み方\n- 上期: かみき\n- 下期: しもき\n- EBITDA: イービットディーエー\n- IFRS: イファース\n- 終値: おわりね\n- 初値: はつね\n- 老舗: しにせ\n# 2. 用語の厳密な定義（上方修正・下方修正）\n- 上方修正: 数値が【上がる】・状況が【良くなる】こと。\n- 下方修正: 数値が【下がる】・状況が【悪くなる】こと。\n- 覚え方: 「増えたら上方、減ったら下方」\n# 3. ビジネス数値の読み替え\n「〇百万円」という表記は、計算・変換後の数値で読むこと。\n例）\n- 「45百万円」→「4500万円」（読み方：よんせんごひゃくまんえん）\n- 「120百万円」→「1億2000万円」（読み方：いちおくにせんまんえん）\n- 「5678百万円」→「56億7800万円」（読み方：ごじゅうろくおくななせんはっぴゃくまんえん）\n- 「203百万円」→「2億300万円」（読み方：におくさんびゃくまんえん）`,
        },
        // 各分析カテゴリごとの設定
        analysisSettings: {
            market_todayjp: {
                intro: "今日の東京株式市場を振り返る",
                audioLength: "6分から9分",
                ui: { sections: [], inputs: [], checkboxes: [] },
                buttonData: [
                    { category: "【分析】", services: [{ service: "gemini", buttons: [{ label: "TOP10理由・ニュース", copyId: "text026" }] }] },
                    { category: "【音声生成前】", services: [{ service: "notebookLM", buttons: [{ label: "URLコピー", copyId: "text001" }, { label: "音声生成", copyId: "text002" }, { label: "根拠資料生成", copyId: "text004" }] }] },
                    { category: "【プレゼン資料】", services: [{ service: "gamma", buttons: [{ label: "プレゼン生成", copyId: "text100" }] }] },
                    { category: "【音声生成後】", services: [{ service: "notebookLM", buttons: [{ label: "サムネイル", copyId: "text200" }, { label: "動画タイトル", copyId: "text201" }, { label: "概要欄", copyId: "text202" }, { label: "X告知", copyId: "text203" }] }] }
                ],
                copyTexts: {
                    text001: `https://quote.nomura.co.jp/nomura/cgi-bin/quote.cgi?template=nomura_tp_index_01\nhttps://s.kabutan.jp/warnings/nk225_contrib/?direction=desc&order=contrib_price\nhttps://s.kabutan.jp/warnings/nk225_contrib/?direction=asc&order=contrib_price\nhttps://kabutan.jp/warning/?mode=2_1&market=1&dispmode=normal\nhttps://kabutan.jp/warning/?mode=2_2&market=1&dispmode=normal\nhttps://s.kabutan.jp/warnings/sector_stocks_ranking/\nhttps://s.kabutan.jp/warnings/sector_stocks_ranking/?direction=asc&order=prev_price_ratio\nhttp://kabutan.jp/warning/trading_value_ranking`,
                    text026: `１．上昇率・下落率ランキングTOP5の銘柄について、変動率が高かった具体的な理由を、各銘柄のコードや企業名で個別に調査し、以下の要因を含めて確認できた場合のみ記載してください。\n・企業のプレスリリース（新製品、提携、M&A、業績修正など）\n・決算発表\n・証券会社による投資判断や目標株価の変更\n・大株主の大量保有報告書や保有目的の変更\n・関連市場や業界全体に影響を与える重要なニュース\n・ランキングは以下のURLから取得すること。\nhttps://kabutan.jp/warning/?mode=2_1&market=1&dispmode=normal\nhttps://kabutan.jp/warning/?mode=2_2&market=1&dispmode=normal\n・変動理由が「具体的なニュース・決算発表等」で**確認できた銘柄のみ**を掲載すること。  \n・理由が未確認、あるいは{{today}}から一週間以上前の材料しかない場合は、**一切表示しない**。  \n・理由は{{today}}の15:29までに発表されたものに限定すること。\n・「理由が見つからない」「市場全体の調整」などの曖昧な記載は**禁止**。  \n・除外した銘柄は名前やコードも含めて**一切報告しない**。\n・ニュースは日本語・英語いずれでも構いません。\n・レポート形式ではなく、以下の形式でまとめてください。以下に記載のない余計な文章や表などは追加しないでください。\n\n急騰・急落銘柄の材料\n----\nトヨタ自動車（7203）：-10.15％\n理由となる出来事：〇〇〇〇〇〇\n日付：YYYY/M/D\n詳細：XXXXXXXXXXXXX\n----\nソニー（7211）：+9.15％\n理由となる出来事：〇〇〇〇〇〇\n日付：YYYY/M/D\n詳細：XXXXXXXXXXXXX\n----\n２．{{today}}の東京株式市場に大きく影響を与えたニュースをまとめて\n個別株や指数の値動きについての記載はせず、ニュースの内容に文字数を割いて\n{{prevBizDay}}の15時30分から{{today}}の15時29分の間に発表されたニュースのみ記載して\nニュースの数は任せるが、多くても５～６個まで\n・個別株の値動きのまとめや個別株の決算は除く、ただし複数銘柄に影響を与えたニュースは可\n・日本株の指数の値動きに関するまとめは除く\n・レポート形式ではなく、以下の形式でまとめてください。以下に記載のない余計な文章や表などは追加しないでください。\n\n{{prevBizDay}}の15時30分から{{today}}の15時29分の間に発表された東京株式市場に影響を及ぼしたニュース\n----\n概要：〇〇〇〇〇〇\n日付：YYYY/M/D\n詳細：XXXXXXXXXXXXX\n----\n概要：〇〇〇〇〇〇\n日付：YYYY/M/D\n詳細：XXXXXXXXXXXXX\n----\n\n・記載するのは上記１と２の内容のみにしてください。上記以外の内容（分析やまとめなど）は不要です。`,
                    text002: `各ランキングや指数動向を総合して、今日の東証相場を振り返り、特徴や投資家心理、市場の注目ポイントを分析してください。{{voiceNote}}\n・ニュース、変動の大きかった理由は分析の材料に使用し、指数や株価のランキングのデータをメインに使用し、ニュースや個別銘柄の解説に時間を割きすぎないようにして`,
                    text004: `資料作成用に指数、各ランキングなどをまとめて\n・ニュース→見出し＋内容２行以内の形式の、一覧で（テキストの資料から取得し、株探からは取得しない）\n・指数は銘柄名、株価、前日比（日経平均、TOPIX、東証スタンダード、東証グロース）\n・各市場（プライム、スタンダード、グロース）の出来高・時価総額\n・寄与度ランキング（トップ、ワースト）は銘柄名、証券コード、寄与度\n・業種別ランキング（トップ、ワースト）は業種名、変動率、PER\n・売買代金ランキングは銘柄名、証券コード、株価、前日比、売買代金\n・株価上昇率／株価下落率ランキングは銘柄名、証券コード、株価、前日比\n※前日比は「変動幅（変動率）」形式、ランキングは上位5位まで\n※ランキングや指数はいつ時点の情報かを記述しない\n・まとめ→今日の東証相場を振り返り、特徴や投資家心理、市場の注目ポイントのまとめ\n・ニュースは株探から抽出しないでください。\n・ニュースには、個別株の変動理由を記載しないでください。`,
                    text100: `以下の流れで資料を作成して\n表紙\n国内主要株価指数\n株価上昇率ランキング\n株価下落率ランキング\n日経平均プラス寄与度ランキング\n日経平均マイナス寄与度ランキング\n売買代金ランキング\n業種別変動率ランキング（上位）\n業種別変動率ランキング（下位）\nニュース\nまとめ\n\n・指数はTopレイアウトでカードレイアウト（大きな数字）でまとめ、画像を右側に表示して\n・ランキングは表形式にし、見出し行をつけ、上位5位まで記載して。前日比を記述する場合は「変動幅（変動率）」の形式で記述して\n・寄与度ランキングは左にプラス寄与、右にマイナス寄与で１ページにして\n・業種別ランキングは左に上位、右に下位で１ページにして\n・ランキングのタイトルは上記に記載の通りとし、後ろに日付を付けたりしないで\n・表紙は、表題と、内容を4行程度の文章でまとめてください。\nただし、「この資料は」などとプレゼン資料自体の事を書かないでください\nまた、資料・動画の視聴意欲がなくならないように、結論や最も重要な内容は書かないでください。`,
                    text200: "{{intro}}{{thumbnail}}",
                    text201: "{{intro}}{{titleBf}}後ろに「【{{today}}東証マーケット振り返り】｜AI市場分析」をつけてください。{{titleAf}}",
                    text202: `{{intro}}{{gaiyoNote}}`,
                    text203: "{{intro}}{{xNotifyText}}",
                }
            },
            market_term_rank: {
                intro: "東証プライム市場の週間・月間{{termDirectionLabel}}率ランキングから１週間の相場を振り返り、{{strategy}}で注目すべき銘柄を分析",
                audioLength: "8分から12分",
                ui: { sections: ['term-direction-area', 'textbox-area'], inputs: [], checkboxes: [] },
                buttonData: [
                    { category: "【分析】", services: [{ service: "gemini", buttons: [{ label: "注目銘柄分析", copyId: "text026" }, { label: "銘柄分析(ランクNG)", copyId: "text027" }] }] },
                    { category: "【音声生成前】", services: [{ service: "notebookLM", buttons: [{ label: "URLコピー", copyId: "text001" }, { label: "音声生成", copyId: "text002" }, { label: "根拠資料生成", copyId: "text004" }] }] },
                    { category: "【プレゼン資料】（スライド：6+銘柄数）", services: [{ service: "gamma", buttons: [{ label: "*プレゼン生成", copyId: "text100" }] }] },
                    { category: "【音声生成後】", services: [{ service: "notebookLM", buttons: [{ label: "サムネイル", copyId: "text200" }, { label: "動画タイトル", copyId: "text201" }, { label: "*概要欄", copyId: "text202" }, { label: "X告知", copyId: "text203" }] }] }
                ],
                copyTexts: {
                    text001: `{{weeklyRankUrl}}\n{{monthlyRankUrl}}`,
                    text026: `以下の手順と情報源を基に、日本の株式市場に関する包括的な分析レポートを作成してください。このレポートは、後ほど人間が注目銘柄を選定するための判断材料として使用します。**記載するのは以下の手順で指定された内容のみとし、それ以外の文章（冒頭の挨拶や結びの言葉など）は一切含めないでください。**テキストをコピーして使用するため、引用元に関する引用番号は記載しないでください。**株式会社の表記は省略してください**\n\n**手順1: 市場全体の動向を把握**\n* **指数の値動き**: **先週末（{{lastWeekFriday}}）から今週末（{{thisWeekFriday}}）まで**の期間について、以下の形式で主要指数の動きをまとめてください。\n    ----\n    【指数の週間動向（{{lastWeekFriday}}～{{thisWeekFriday}}）】\n    ・日経平均株価: 先週末（{{lastWeekFriday}}）終値 XXXX円 → 今週末（{{thisWeekFriday}}）終値 YYYY円 (前週比 ZZZ円, A.B%)\n    ・TOPIX: 先週末（{{lastWeekFriday}}）終値 XXXX → 今週末（{{thisWeekFriday}}）終値 YYYY (前週比 ZZZ, A.B%)\n    ----\n* **主要経済ニュース**: 先週末（{{lastWeekFriday}}）の15:30から今週末（{{thisWeekFriday}}）の15:29に日本の株式市場に影響を与えたと考えられる主要な経済ニュースやイベントを3～5つ、以下の形式で挙げてください。\n    ----\n    【今週の主要ニュース】\n    概要：〇〇〇〇〇〇\n    日付：YYYY年M月D日\n    詳細：XXXXXXXXXXXXX\n    ----\n\n**手順2: ランキング上位銘柄の分析**\n\n分析対象リストの作成手順:\n以下の手順を厳格に実行し、分析対象となる銘柄の最終リストを作成してください。\n\n週間ランキングの取得: 以下のURLから「週間{{termDirectionLabel}}率ランキング」の上位10銘柄をリストアップする。\n週間{{termDirectionLabel}}率ランキング: {{weeklyRankUrl}}\n\n月間ランキングの取得: 以下のURLから「月間{{termDirectionLabel}}率ランキング」の上位10銘柄をリストアップする。\n月間{{termDirectionLabel}}率ランキング: {{monthlyRankUrl}}\n\n最終リストの作成:\n和集合の作成: 上記2つのリストに含まれる全ての銘柄を合わせたリストを作成する。この際、重複する銘柄は1つにまとめること。（数学的な集合演算における「和集合」を作成する）\nこのリストを「最終分析リスト」とする。この手順により、週間・月間のどちらか一方のランキングにしか含まれない銘柄も、必ず最終分析リストに含まれるようにすること。\n\n分析の実行:\n作成した「最終分析リスト」に含まれるすべての銘柄について、漏れなく詳細な分析を行ってください。\n\n**分析の観点（{{strategy}}）**:\n* **{{termDirectionLabel}}要因の特定**: 株価{{termDirectionLabel}}の直接的な原因となった出来事（例：好決算、新製品発表、M&Aなど）を具体的に特定し、その日付も記載してください。\n* **{{strategy_analysis_point_title}}**: {{strategy_analysis_point_detail}}\n\n**【最重要ルール】ランキング順位に関する厳格な指示**\nルール1: 情報源の絶対化\n「ランキング状況」に記載する順位は、上記2つのURLに表示されている情報のみを唯一絶対の正解とします。いかなる理由があっても、ニュース記事、他のWebサイト、AIの知識など、指定URL以外の情報源から順位を引用、類推、補完することを固く禁じます。\nルール2: 機械的な転記作業の徹底\n各銘柄の分析を開始する前に、まず上記URLにアクセスし、そこに表示されている「順位の数字（例: 1位、2位…）」を寸分違わず機械的に転記してください。「週間 上位」「急騰銘柄」といった曖昧な表現は一切使用せず、必ず「X位」または「ランク外」のどちらかで記述してください。\nルール3: 自己検証の義務化\n最終的なレポートを生成する直前に、全銘柄の「ランキング状況」に記載した順位が、再度アクセスした指定URLの表示と完全に一致しているか、必ず自己検証を行ってください。\n\n**出力形式**:\n---\n**【銘柄分析】 {{銘柄名}}（{{証券コード}}）**\n* **ランキング状況**: 週間 X位 / 月間 Y位 （※上記ルールに基づき、指定URLの情報を機械的に転記すること。片方が10位以下なら必ず「ランク外」と記載すること）\n* **{{termDirectionLabel}}要因**: （ここに具体的な要因を記述）\n* **{{strategy_suggestion_title}}**: （ここに考察を記述）\n---\n（これを分析対象となる全銘柄分、繰り返してください）`,
                    text027: `以下の手順と情報源を基に、日本の株式市場に関する包括的な分析レポートを作成してください。このレポートは、後ほど人間が注目銘柄を選定するための判断材料として使用します。**記載するのは以下の手順で指定された内容のみとし、それ以外の文章（冒頭の挨拶や結びの言葉など）は一切含めないでください。**テキストをコピーして使用するため、引用元に関する引用番号は記載しないでください。**株式会社の表記は省略してください**\n\n**手順1: 市場全体の動向を把握**\n* **指数の値動き**: **先週末（{{lastWeekFriday}}）から今週末（{{thisWeekFriday}}）まで**の期間について、以下の形式で主要指数の動きをまとめてください。\n    ----\n    【指数の週間動向（{{lastWeekFriday}}～{{thisWeekFriday}}）】\n    ・日経平均株価: 先週末（{{lastWeekFriday}}）終値 XXXX円 → 今週末（{{thisWeekFriday}}）終値 YYYY円 (前週比 ZZZ円, A.B%)\n    ・TOPIX: 先週末（{{lastWeekFriday}}）終値 XXXX → 今週末（{{thisWeekFriday}}）終値 YYYY (前週比 ZZZ, A.B%)\n    ----\n* **主要経済ニュース**: 先週末（{{lastWeekFriday}}）の15:30から今週末（{{thisWeekFriday}}）の15:29に日本の株式市場に影響を与えたと考えられる主要な経済ニュースやイベントを3～5つ、以下の形式で挙げてください。\n    ----\n    【今週の主要ニュース】\n    概要：〇〇〇〇〇〇\n    日付：YYYY年M月D日\n    詳細：XXXXXXXXXXXXX\n    ----\n\n**手順2: ランキング上位銘柄の分析**\n\n分析対象リスト:\n{{textbox}}\n\n最終リストの作成:\n和集合の作成: 分析対象リストに含まれる全ての銘柄を合わせたリストを作成する。この際、重複する銘柄は1つにまとめること。（数学的な集合演算における「和集合」を作成する）\nこのリストを「最終分析リスト」とする。この手順により、週間・月間のどちらか一方のランキングにしか含まれない銘柄も、必ず最終分析リストに含まれるようにすること。\n\n分析の実行:\n作成した「最終分析リスト」に含まれるすべての銘柄について、漏れなく詳細な分析を行ってください。\n\n**分析の観点（{{strategy}}）**:\n* **{{termDirectionLabel}}要因の特定**: 株価{{termDirectionLabel}}の直接的な原因となった出来事（例：好決算、新製品発表、M&Aなど）を具体的に特定し、その日付も記載してください。\n* **{{strategy_analysis_point_title}}**: {{strategy_analysis_point_detail}}\n\n**【最重要ルール】ランキング順位に関する厳格な指示**\nルール1: 情報源の絶対化\n「ランキング状況」に記載する順位は、上記2つのURLに表示されている情報のみを唯一絶対の正解とします。いかなる理由があっても、ニュース記事、他のWebサイト、AIの知識など、指定URL以外の情報源から順位を引用、類推、補完することを固く禁じます。\nルール2: 機械的な転記作業の徹底\n各銘柄の分析を開始する前に、まず上記URLにアクセスし、そこに表示されている「順位の数字（例: 1位、2位…）」を寸分違わず機械的に転記してください。「週間 上位」「急騰銘柄」といった曖昧な表現は一切使用せず、必ず「X位」または「ランク外」のどちらかで記述してください。\nルール3: 自己検証の義務化\n最終的なレポートを生成する直前に、全銘柄の「ランキング状況」に記載した順位が、再度アクセスした指定URLの表示と完全に一致しているか、必ず自己検証を行ってください。\n\n**出力形式**:\n---\n**【銘柄分析】 {{銘柄名}}（{{証券コード}}）**\n* **ランキング状況**: 週間 X位 / 月間 Y位 （※上記ルールに基づき、指定URLの情報を機械的に転記すること。片方が10位以下なら必ず「ランク外」と記載すること）\n* **{{termDirectionLabel}}要因**: （ここに具体的な要因を記述）\n* **{{strategy_suggestion_title}}**: （ここに考察を記述）\n---\n（これを分析対象となる全銘柄分、繰り返してください）`,
                    text002: `以下の流れで、今週の株式市場を振り返る動画のナレーションを作成してください。\n1. **今週の指数の値動き**: 日経平均やTOPIXなどの主要な指数の週間での動きを簡潔に手短にまとめてください。\n2. **今週の主な経済ニュース**: 市場全体に影響を与えた重要な経済ニュースやイベントを取り上げ、その影響を簡潔に手短にまとめてください。\n3. **週間・月間ランキングの分析**: {{termDirectionLabel}}率の週間ランキングTOP10と月間ランキングTOP10の中から、両方にランクインしている銘柄や、特徴的な動きをした銘柄を数銘柄ピックアップして、株価の{{termDirectionLabel}}理由のみを簡潔に紹介してください。ランキング上位の全銘柄を読み上げる必要はありません。\n4. **注目銘柄の深掘り**: 株価の上昇が期待できる銘柄を2～4銘柄選び、「なぜ注目すべきか」を解説してください。株価の上昇が期待できると判断した銘柄以外を取り上げる必要はありません。\n{{voiceNote}}\n・この動画のメインを「4.注目銘柄の深掘り」にしたいので、それ以外に割く時間を少なくしてください。`,
                    text004: `以下の構成で、動画制作用の根拠資料を作成してください。\n・レポート形式ではなく、以下の形式でまとめてください。以下に記載のない余計な文章や表などは追加しないでください。\n    1. 今週の主要指数: 指数の情報を以下の形式でまとめてください。\n出力形式：\n-\n【指数の週間動向（{{lastWeekFriday}}～{{thisWeekFriday}}）】\n・日経平均株価: 先週末（{{lastWeekFriday}}）終値 XXXX円 → 今週末（{{thisWeekFriday}}）終値 YYYY円 (前週比 ZZZ円, A.B%)\n・TOPIX: 先週末（{{lastWeekFriday}}）終値 XXXX → 今週末（{{thisWeekFriday}}）終値 YYYY (前週比 ZZZ, A.B%)\n-\n    2. 今週の主要経済ニュース: 市場に影響を与えたニュースを5つ程度、概要と日付を記載してください。\n出力形式：\n-\n【今週の主要ニュース】\n概要：〇〇〇〇〇〇\n日付：YYYY年M月D日\n詳細：XXXXXXXXXXXXX\n-\n    3. 週間{{termDirectionLabel}}率ランキング: 上位10銘柄の「銘柄名」「コード」「1週間前比」をリストアップしてください。\n    4. 月間{{termDirectionLabel}}率ランキング: 上位10銘柄の「銘柄名」「コード」「1ヵ月前比」をリストアップしてください。\n    5. 注目銘柄の分析データ: 個別銘柄の分析内容を全銘柄記載してください。\n出力形式:\n-\n【銘柄分析】 {{銘柄名}}（{{証券コード}}）\n    ランキング状況: 週間 X位 / 月間 Y位 （※上記ルールに基づき、指定URLの情報を機械的に転記すること。片方が10位以下なら必ず「ランク外」と記載すること）\n    変動率: 週間 A.BB% / 月間 A.BB% （週間、月間のうち、ランクインした方のみ記載してください。両方にランクインした場合は両方記載してください。）\n    {{termDirectionLabel}}要因: （ここに具体的な要因を記述）\n    {{strategy_suggestion_title}}: （ここに考察を記述）\n-`,
                    text100: `以下の構成で、YouTube動画用の投影資料を作成してください。\n表紙（1ページ）\n株式指数: 日経平均、TOPIXの動きを記載（1ページ）\n・大きな数字で指数を表示、説明に前週比（変動率）を表記\n今週の主な経済ニュース:重要なニュースを数点、簡潔にまとめる（1ページ）\n{{termDirectionLabel}}率ランキング:上位10銘柄を表形式で表示（週間1ページ、月間1ページ）\n・ランキングはコード、銘柄名、変動率（週間or月間）、{{termDirectionLabel}}理由（簡潔に）の順で記載\n注目銘柄:注目銘柄を1ページに1銘柄ずつ以下の内容を記載（注目銘柄：{{textbox}}）\n・銘柄名と証券コード\n・月間、週間ランキング（ランクと変動率）\n・{{termDirectionLabel}}理由\n・ポイント（投資を判断する材料、注目する理由）\nまとめ（1ページ）\n・表紙は、表題と、内容を4行程度の文章でまとめてください。\nただし、「この資料は」などとプレゼン資料自体の事を書かないでください\nまた、資料・動画の視聴意欲がなくならないように、結論や最も重要な内容は書かないでください。`,
                    text200: "{{intro}}{{thumbnail}}",
                    text201: `{{intro}}{{titleBf}}後ろに「【{{strategy_title_suffix}}】｜AI市場分析」をつけてください。{{titleAf}}`,
                    text202: `{{intro}}。{{strategy_gaiyo_intro}}。{{gaiyoNote}}\n・各ランキングの上位5位までの銘柄名と{{textbox}}もハッシュタグにして`,
                    text203: `{{intro}}{{xNotifyText}}`
                }
            },
            market_stock: {
                intro: () => {
                    const period = App.dom.inputPeriod.value;
                    return (period.trim() !== '')
                        ? "{{name}}（{{ticker}}）の株価が{{period}}{{direction}}理由と今後の見通し"
                        : "{{name}}（{{ticker}}）の{{today}}の株価が{{afterHours}}{{direction}}理由と今後の見通し";
                },
                audioLength: "6分から10分",
                ui: { sections: ['input-area', 'stock-direction-area'], inputs: ['ticker-name-area', 'earnings-market-area', 'period-input-container'], searchBtns: ['ir', 'kabutan'], checkboxes:[] },
                buttonData: [
                    { category: "【分析】", services: [{ service: "gemini", buttons: [{ label: "分析用", copyId: "text020" }] }] },
                    { category: "【音声生成前】", services: [{ service: "notebookLM", buttons: [{ label: "URLコピー", copyId: "text001" }, { label: "音声生成", copyId: "text002" }, { label: "根拠資料生成", copyId: "text004" }, { label: "根拠資料生成(決算のみ)", copyId: "text005" }] }] },
                    { category: "【プレゼン資料】", services: [{ service: "gamma", buttons: [{ label: "プレゼン生成", copyId: "text100" }, { label: "プレゼン生成(決算のみ)", copyId: "text101" }] }] },
                    { category: "【音声生成後】", services: [{ service: "notebookLM", buttons: [{ label: "サムネイル", copyId: "text200" }, { label: "動画タイトル", copyId: "text201" }, { label: "概要欄", copyId: "text202" }, { label: "X告知", copyId: "text203" }] }] }
                ],
                copyTexts: {
                    text001: (vars) => vars.emarket === 'jp' ? `https://kabutan.jp/stock/chart?code=${vars.ticker}\nhttps://kabutan.jp/stock/finance?code=${vars.ticker}` : `https://us.kabutan.jp/stocks/${vars.ticker}/\nhttps://us.kabutan.jp/stocks/${vars.ticker}/finance`,
                    text020: "{{intro}}を分析して",
                    text002: `{{intro}}を分析してください。{{voiceNote}}\n・レポートと株探や資料で情報が異なる場合は、株探、会社発表の資料の情報を正としてください。`,
                    text004: `{{intro}}についての{{reportKk}}\n・レポートと株探や資料で情報が異なる場合は、株探、会社発表の資料の情報を正としてください`,
                    text005: `{{name}}（{{ticker}}）の決算資料を分析する{{reportKk}}\n・レポートと株探や資料で情報が異なる場合は、株探、会社発表の資料の情報を正としてください`,
                    text100: "{{intro}}についての{{reportSs}}{{reportGc}}",
                    text101: "{{name}}（{{ticker}}）の決算資料を分析する{{reportSs}}{{reportGc}}",
                    text200: "{{intro}}についての{{thumbnail}}",
                    text201: "{{intro}}についての{{titleBf}}先頭に「【{{name}}({{ticker}})】」、後ろに「｜AI市場分析」をつけてください。{{titleAf}}",
                    text202: `{{intro}}についての{{gaiyoNote}}`,
                    text203: "{{intro}}についての{{xNotifyText}}",
                }
            },
            market_buy_analysis: {
                intro: () => {
                    const period = App.dom.inputPeriod.value;
                    const direction = App.dom.stockDirection.value || '下落した';
                    const baseSentence = `{{name}}（{{ticker}}）の株価が{{period}}${direction}`;
                    const buyOpportunityType = (direction === '上昇した') ? 'どこまで上昇するか' : '底値がどこになるか';
                    return `${baseSentence}が、${buyOpportunityType}分析`;
                },
                audioLength: "8分から12分",
                ui: { 
                    sections: ['input-area', 'stock-direction-area'], 
                    inputs: ['ticker-name-area', 'earnings-market-area', 'period-input-container'],
                    searchBtns: ['ir', 'kabutan'],
                    directionOptions: { hide: ['s-high', 's-low', 'after-hours', 'no-price', 'none'], default: '下落した' }
                },
                buttonData: [
                     { category: "【分析】", services: [{ service: "gemini", buttons: [{ label: "分析用", copyId: "text020" }] }] },
                    { category: "【音声生成前】", services: [{ service: "notebookLM", buttons: [{ label: "URLコピー", copyId: "text001" }, { label: "音声生成", copyId: "text002" }, { label: "根拠資料生成", copyId: "text004" }, { label: "根拠資料生成(決算のみ)", copyId: "text005" }] }] },
                    { category: "【プレゼン資料】", services: [{ service: "gamma", buttons: [{ label: "プレゼン生成", copyId: "text100" }, { label: "プレゼン生成(決算のみ)", copyId: "text101" }] }] },
                    { category: "【音声生成後】", services: [{ service: "notebookLM", buttons: [{ label: "サムネイル", copyId: "text200" }, { label: "動画タイトル", copyId: "text201" }, { label: "概要欄", copyId: "text202" }, { label: "X告知", copyId: "text203" }] }] }
                ],
                copyTexts: {
                    corePromptTemplate: `# 命令書\n\n## あなたの役割\nあなたは、分析対象の企業ごとに、最も合理的で重要な分析項目や指標を自ら選定できる、トップクラスの株式アナリストです。あなたの仕事は、短期的な株価の動きを追うだけでなく、その背景にある企業の永続的な競争力や経営の質といった、本質的な価値を見抜くことです。\n\n## 私の目的\n株価が {{period}}{現在のトレンド} している {{name}}（{{ticker}}） について、12ヶ月（1年）程度の時間軸を基本とし、投資家が「{投資家のゴール}」を自己判断するための、客観的で深い洞察に満ちた分析レポートを作成すること。\n\n## 分析における重要な視点\nレポート全体の分析は、以下のマクロな視点を必ず考慮に入れてください。\n* マクロ経済環境: 現在の金利、景気動向、金融政策などが、この企業にどう影響するか。\n* 業界トレンド: 当該銘柄が属する業界全体の成長性、技術革新、規制の変更などの追い風・向かい風。\n* 競合他社の動向: 競合他社と比較して、この企業の業績や株価パフォーマンスはどのような位置づけにあるか。\n\n## 分析における「3つの必須回答項目」\n分析のアプローチや構成は全てあなたに一任しますが、レポートには以下の 3つの問いに対する明確な答え を必ず含めてください。\n\n1.  なぜ{現在のトレンド}しているのか？（企業の永続的な強さ、あるいは弱さはあるか？）\n    * 現在の株価{現在のトレンド}を牽引している要因を特定するだけでなく、その背景にある「企業の永続的な強さ・弱さ」についても分析してください。具体的には、競合他社に対する競争優位性（事業のMoat）と、経営陣の能力や信頼性についても評価に含めてください。\n\n2.  どこまで{現在のトレンド}する可能性があるのか？\n    * 今後の{将来のポテンシャル}について、具体的な目標株価を複数のシナリオとして提示してください。\n\n3.  トレンドの転換点（{転換点の意味}）を判断するための「株価以外のモノサシ」は何か？\n    * 多くの投資家がトレンドの転換点を判断する際に使うであろう、この銘柄に特有の、株価以外の定量的な判断材料を複数特定してください。そして、その指標が「どのくらいの数値」になったら転換の可能性が高まるか、具体的な目安を示してください。\n\n## レポートの構成\n・上記の「3つの必須回答項目」に対する答えを、以下の大きな枠組みの中で、あなたが最適と判断する構成（小見出しなど）で記述してください。\n・レポートに出典番号は記載しないでください。\n\n---\n\n### {{name}}（{{ticker}}）株価分析レポート：{分析タイトル}\n\n#### 1. 企業の基本情報\n（分析の前提となる、客観的な現在のデータを共有します。現在の株価、時価総額、PER、PBR、配当利回りなどを、簡潔な表や箇条書きで提示してください。）\n\n#### 2. 現状分析：{現在のトレンド}の要因と企業の本質的価値\n（このセクションでは、必須回答項目1「なぜ{現在のトレンド}しているのか？」に対する答えを、詳細かつ論理的に記述してください。株価が動く短期的な要因だけでなく、その背景にある事業の質（競争優位性）や経営陣の評価といった、企業の長期的・本質的な価値についても深く掘り下げてください。）\n\n#### 3. 将来予測：市場コンセンサスと独自のポテンシャル分析\n（このセクションでは、必須回答項目2と3に対する答えを記述します。\nまず、市場のコンセンサスとしてアナリストのレーティングや目標株価平均を提示してください。\nその上で、あなた独自の分析による「どこまで{現在のトレンド}する可能性があるのか？」と「トレンドの転換点を判断するための『株価以外のモノサシ』は何か？」に対する答えを、市場コンセンサスとの比較も交えながら具体的かつ分かりやすく記述してください。）\n\n#### 4. シナリオとリスク\n（分析の前提となるシナリオと、投資家が注意すべき最大のリスク、つまり「{リスクシナリオ}」について具体的に記述してください。）`,
                    analysisModes: {
                        up: { '{分析タイトル}': '上昇の持続性と天井のサイン', '{現在のトレンド}': '上昇', '{将来のポテンシャル}': '上値余地', '{転換点の意味}': '天井圏（上昇トレンドの終焉）', '{投資家のゴール}': '利確・損切りポイントの特定', '{リスクシナリオ}': '上昇トレンドが崩れ、下落に転じるリスク' },
                        down: { '{分析タイトル}': '下落の要因と底値のサイン', '{現在のトレンド}': '下落', '{将来のポテンシャル}': '下値余地', '{転換点の意味}': '底値圏（下落トレンドの終焉と反転）', '{投資家のゴール}': '買いポイントの特定', '{リスクシナリオ}': '底打ちと判断して買ったが、さらに下落が続くリスク' }
                    },
                    text001: (vars) => vars.emarket === 'jp' ? `https://kabutan.jp/stock/chart?code=${vars.ticker}` : `https://us.kabutan.jp/stocks/${vars.ticker}/`,
                    text002: "{{intro}}してください。{{voiceNote}}\n・レポートと株探や資料で情報が異なる場合は、株探、会社発表の資料の情報を正としてください。",
                    text004: `{{intro}}する{{reportKk}}\n・レポートと株探や資料で情報が異なる場合は、株探、会社発表の資料の情報を正としてください`,
                    text005: `{{name}}（{{ticker}}）の決算資料を分析する{{reportKk}}\n・レポートと株探や資料で情報が異なる場合は、株探、会社発表の資料の情報を正としてください`,
                    text100: "{{intro}}する{{reportSs}}",
                    text101: "{{name}}（{{ticker}}）の決算資料を分析する{{reportSs}}{{reportGc}}",
                    text200: "{{intro}}する{{thumbnail}}",
                    text201: "{{intro}}する{{titleBf}}先頭に「【{{name}}({{ticker}})】」、後ろに「｜AI株価分析」をつけてください。{{titleAf}}",
                    text202: `{{intro}}する{{gaiyoNote}}`,
                    text203: "{{intro}}する{{xNotifyText}}",
                }
            },
            market_earnings: {
                intro: () => {
                    const direction = App.dom.stockDirection.value || '';
                    const isAfterHours = App.dom.afterHoursCheck.checked;
                    if (direction === '') {
                        return "{{formattedEarningsDate}}{{timing}}に発表された{{name}}（{{ticker}}）の決算資料を分析し、今後の見通しを考察";
                    }
                    if (isAfterHours) {
                        return "{{formattedEarningsDate}}{{timing}}に発表された決算資料を分析し、{{name}}（{{ticker}}）の株価が{{formattedEarningsDate}}の{{afterHours}}" + direction + "理由と今後の見通しを考察";
                    }
                    return "{{formattedEarningsDate}}{{timing}}に発表された決算資料を分析し、{{name}}（{{ticker}}）の{{today}}の株価が" + direction + "理由と今後の見通しを考察";
                },
                audioLength: "8分から12分",
                ui: { sections: ['input-area', 'stock-direction-area', 'earnings-timing-area'], inputs: ['ticker-name-area', 'earnings-market-area'], searchBtns: ['ir', 'kabutan'] },
                buttonData: [
                    { category: "【音声生成前】", services: [{ service: "notebookLM", buttons: [{ label: "URLコピー", copyId: "text001" }, { label: "音声生成", copyId: "text002" }, { label: "根拠資料生成", copyId: "text004" }, { label: "根拠資料生成(決算のみ)", copyId: "text005" }] }] },
                    { category: "【プレゼン資料】", services: [{ service: "gamma", buttons: [{ label: "プレゼン生成", copyId: "text100" }, { label: "プレゼン生成(決算のみ)", copyId: "text101" }] }] },
                    { category: "【音声生成後】", services: [{ service: "notebookLM", buttons: [{ label: "サムネイル", copyId: "text200" }, { label: "動画タイトル", copyId: "text201" }, { label: "概要欄", copyId: "text202" }, { label: "X告知", copyId: "text203" }] }] }
                ],
                copyTexts: {
                     text001: (vars) => vars.emarket === 'jp' ? `https://kabutan.jp/stock/chart?code=${vars.ticker}\nhttps://kabutan.jp/stock/finance?code=${vars.ticker}` : `https://us.kabutan.jp/stocks/${vars.ticker}/\nhttps://us.kabutan.jp/stocks/${vars.ticker}/finance`,
                    text002: "{{intro}}してください。{{voiceNote}}",
                    text004: `{{intro}}する{{reportKk}}`,
                    text005: `{{name}}（{{ticker}}）の決算資料を分析する{{reportKk}}`,
                    text100: "{{intro}}する{{reportSs}}{{reportGc}}",
                    text101: "{{name}}（{{ticker}}）の決算資料を分析する{{reportSs}}{{reportGc}}",
                    text200: "{{intro}}する{{thumbnail}}",
                    text201: "{{formattedEarningsDate}}に発表された{{name}}（{{ticker}}）の決算資料を分析し、今後の見通しを考察する{{titleBf}}先頭に「【{{name}}({{ticker}})】」、後ろに「｜AI決算分析」をつけてください。{{titleAf}}",
                    text202: `{{formattedEarningsDate}}に発表された{{name}}（{{ticker}}）の決算資料を分析し、今後の見通しを考察する{{gaiyoNote}}`,
                    text203: "{{intro}}する{{xNotifyText}}"
                }
            },
            ipo: {
                intro: "{{name}}（{{ticker}}）のIPOに関する資料・レポートを基にIPO上場後の初値予想について解説",
                audioLength: "9分から12分",
                 ui: { sections: ['input-area'], inputs: ['ticker-name-area', 'earnings-market-area'], searchBtns: ['jpx'] },
                buttonData: [
                    { category: "【分析】（上場時資料から4ファイル+企業ページの業績予想を読み込む）", services: [{ service: "gemini", buttons: [{ label: "分析用", copyId: "text_ipo_analysis" }] }] },
                    { category: "【音声生成前】", services: [{ service: "notebookLM", buttons: [{ label: "音声生成", copyId: "text_ipo_voice" }] }] },
                    { category: "【プレゼン資料】(レポートを使用/スライド：20)", services: [{ service: "gamma", buttons: [{ label: "プレゼン生成", copyId: "text_ipo_gamma" }] }] },
                    { category: "【音声生成後】", services: [{ service: "notebookLM", buttons: [{ label: "サムネイル", copyId: "text200" }, { label: "動画タイトル", copyId: "text201" }, { label: "概要欄", copyId: "text202" }, { label: "X告知", copyId: "text203" }] }] }
                ],
                copyTexts: {
                    text_ipo_analysis: `あなたはIPO市場を専門とするリサーチャーです。\n上場予定の「{{name}}({{ticker}})」について、後述する【投資評価の基準】に基づいて、最終的な投資判断レポートを【レポートフォーマット】に厳密に従って作成してください。\n・根拠資料として使用するため、引用やカッコつきの番号は記載しないでください\n・参考資料はアップロードした添付資料を基本とし、投資評価の判断に必要な情報が不足する場合のみインターネット上から情報を集めてください。\n・アナリスト、主要サイトの初値予想については、参考程度にし、重要な指標として用いないでください\n・以下のフォーマットに記載がなく、IPOの投資判断に必要な特出すべき内容がある場合には「IPOの基本情報とスケジュール」の後ろに章を追加し、記載してください。\n---\n\n### 【投資評価の基準】\n\n最終的な投資妙味（★評価）は、以下の初値上昇率の期待値を基準として5段階で評価してください。\n\n* **★★★★★ (星5つ)**: 初値が公募価格の**2倍以上 (+100%以上)**となる可能性が非常に高い。\n* **★★★★☆ (星4つ)**: 初値が公募価格の**1.5倍〜2倍未満 (+50%〜+100%)**となる可能性が高い。\n* **★★★☆☆ (星3つ)**: 初値が公募価格の**1.1倍〜1.5倍未満 (+10%〜+50%)**のリターンが期待できる。\n* **★★☆☆☆ (星2つ)**: 初値が公募価格近辺**（-10%〜+10%）**に留まる可能性がある。\n* **★☆☆☆☆ (星1つ)**: 公募割れ**（-10%以下）**となるリスクが相応にある。\n\n---\n### **IPO分析レポートフォーマット**\n\nこのフォーマットは、上場承認日に公開される「新規上場申請のための有価証券報告書（Ⅰの部）」と、同時に発表される各種資料を基に、ブックビルディング参加を判断するために作成するものです。\n\n### **1. 事業内容と市場の将来性**\n* **企業名**: {{name}}\n* **証券コード**: {{ticker}}\n* **事業内容**:\n    * （企業のビジネスモデルを図解などを交えて分かりやすく解説できる内容を記載）\n* **市場・テーマ性**:\n    * （その企業が属する市場全体の成長性や、競合と比較した際の独自性・強みについて記載）\n* **市場シェアと具体的な競合優位性**:\n    * （例：業界No.1のシェア、独自のビジネスモデル、特許技術など、客観的なデータや事実を基にした強みを記載）\n\n### **2. 業績**\n* **業績推移**:\n    * YYYY年MM期：売上高 〇〇円、営業利益 〇〇円、経常利益 〇〇円、純利益 〇〇円\n    * （過去数期分のデータを記載）\n* **最新の決算**:\n    * 売上高、営業利益、経常利益、純利益の金額と前期比(率)\n* **来期の業績予想（会社予想）**:\n    * 売上高 〇〇円（前期比+〇〇%）、営業利益 〇〇円（前期比+〇〇%）など\n    * （将来の成長性を測る上で最も重要な指標。これを基に予想PERを算出する）\n* **財務状況**:\n    * （自己資本比率、有利子負債、営業キャッシュフローなど、投資を判断するうえで必要な内容を記述）\n\n### **3. 需給環境**\n* **吸収金額（想定）**: 約〇〇億円\n    * **オーバーアロットメント**: 〇〇株\n    * （金額の大小は初値に最も影響する要素の一つ。10億円未満は小型、100億円以上は大型など規模感を記載）\n* **公募・売出の内訳とオファリング・レシオ**:\n    * **公募株数**: 〇〇株\n    * **売出株数**: 〇〇株 （放出元：〇〇など）\n    * **オファリング・レシオ**: 〇〇%\n    * （売出、特にVCの比率が高いと警戒されやすい。オファリング・レシオは市場への放出割合を示し、高いと需給が緩む懸念）\n* **主要株主の状況とロックアップ条件**:\n    * （例：創業者一族で過半数を保有。VCの保有比率は〇〇%。主要株主には上場後180日間のロックアップあり。VCには90日間かつ公開価格の1.5倍でロックアップ解除の条件あり、など）\n* **ストックオプション（新株予約権）の詳細**:\n    * **発行済株式総数に対する比率**: 〇〇%\n    * **行使価格**: 〇〇円～〇〇円\n    * **行使期間**: YYYY/MM/DD～\n    * （将来の潜在的な売り圧力となるため、比率、価格、期間を必ず確認）\n* **同日上場企業の有無**:\n    * （例: なし / 〇社あり（株式会社〇〇、株式会社△△））\n\n### **4. 株価の妥当性（類似企業との比較）**\n* **想定価格**: 〇〇円\n* **予想PER（会社予想ベース）**: 0.00倍\n* **想定PBR**: 0.00倍\n* **想定PSR**: 0.00倍\n* **類似企業とその株価指標**:\n    * 社名: 株式会社〇〇、PER: 〇〇倍、PBR: 〇〇倍、PSR: 〇〇倍\n    * （赤字の成長企業など、PERで評価しにくい場合はPSRも比較対象とする）\n\n### **5. IPOの基本情報とスケジュール**\n* **IPOスケジュール**:\n    * 仮条件決定日: YYYY/MM/DD\n    * ブックビルディング期間: YYYY/MM/DD ～ YYYY/MM/DD\n    * 公募価格決定日: YYYY/MM/DD\n    * 購入期間: YYYY/MM/DD ～ YYYY/MM/DD\n    * 上場予定日: YYYY/MM/DD\n* **引受証券会社**:\n    * （例：主幹事：〇〇証券 / 引受団：△△証券、□□証券など）\n\n### **6. 分析のまとめ：投資家が考えるべき視点**\n* **総合評価**:（例：★★★☆☆ 公募価格の**1.1倍〜1.5倍未満）\n    * （5段階評価などでブックビルディングへの参加スタンスを記載）\n    * 初値予想：0,000円（想定価格+0.00%）\n* **評価のポイント**:\n    * **ポジティブ要因**: （箇条書きで要約）\n    * **ネガティブ要因**: （箇条書きで要約）\n\n---`,
                    text_ipo_voice: `{{intro}}してください。\nIPOに参加するかを判断する参考情報にするつもりです。\nなお、解説は必ず以下の【構成】の流れに沿って行ってください。\n仮条件・公募価格発表前の場合は、想定価格を用いてIPOに参加すべきか判断してください。\n## **【構成】**\n\n1. 事業と市場\n事業内容、市場の将来性、競合優位性\n\n2. 業績・財務状況\n業績の推移と現状、財務状況の分析\n\n3. 需給環境\n需給に関するプラス要因とマイナス要因\n\n4. 株価の妥当性\n類似企業比較による価格の割安・割高の評価\n（PERやPBR、PSRの算出方法について説明する必要はありません。想定の各指標で他社と比較してください）\n\n5. 基本情報\nIPOの基本データと主要スケジュール\n\n6. 結論\n分析の総括と最終的な評価・投資スタンス\n{{voiceNote}}\n## 最重要命令：実行の最終確認\n上記すべての指示を踏まえた上で、以下の点を絶対に守ってください。\n構成のテーマを完全遵守: 「# 構成」で指定された7つのテーマの内容を、記述通りの順番で、省略せずに必ず解説してください。ただし、スクリプト内では「4. 需給環境」のように番号や見出し自体を読み上げるのではなく、自然な話し言葉で次のテーマに移ってください。`,
                    text_ipo_gamma: `{{name}}（{{ticker}}）の上場時の初値予想する動画に使用する投影資料を作成してください
・表紙:
表題と、内容を4行程度の文章
「この資料は」などとプレゼン資料自体の事を書かない
結論や最も重要な内容は書かない
・業績（直近実績、累積実績、次期予想）:
大きな数字のレイアウトで作成
「売上高(百万円)」の形式で表示(数字の単位（百万円など）を見出し（売上高、営業利益など）の後ろに付加)
見出しは「〇〇年〇〇期業績」形式で記述
・業績推移:棒グラフ、カラムタイプは数値
・需給環境:①（吸収金額、公募売出内訳、オファリングレシオ、同日上場）②（ストックオプション、ロックアップ）
・IPOの基本情報:スケジュール、主幹事・引受団など
・投資判断:総合評価、初値予想、説明
・株価の妥当性:想定価格、予想PER、予想PBR、類似企業との比較表
・スライド構成:
表紙、企業概要、事業内容、企業の特長・強み、市場の将来性、業績（直近実績）、業績（累積実績）、業績（次期予想）、業績推移、財務状況、需給環境、株価の妥当性、IPOの基本情報、投資判断、ポジティブ要因、ネガティブ要因、まとめ`,
                    text200: "{{intro}}についての{{thumbnail}}",
                    text201: `{{intro}}するYouTube動画を作成します。\n見たくなるようなYouTubeタイトル案を5パターン考えてください。\nターゲットは{{name}}（{{ticker}}）のIPOに参加するか迷っている人です。\n※「株価下落の真相は？」「今後どうなる？」「意外な理由が…」など、視聴者に疑問や興味を持たせる内容にしてください。先頭に「【{{name}}（{{ticker}}）】」、後ろに「｜AI初値分析」をつけてください。\n※企業の特徴と「ついに上場」のような文章を加えるのがいいと思います。\n※出典・カッコ・番号などは入れず、文章だけを提示してください。`,
                    text202: `{{intro}}する{{gaiyoNote}}`,
                    text203: "{{intro}}する{{xNotifyText}}",
                }
            },
            theme_analysis: {
                intro: "{{theme}}について分析",
                audioLength: "6分から10分",
                ui: { sections: ['input-area', 'textbox-area', 'theme-input-section'], inputs: ['earnings-market-area'], searchBtns: [] },
                 buttonData: [
                    { category: "【分析】", services: [{ service: "gemini", buttons: [{ label: "分析用", copyId: "analysis" }] }] },
                    { category: "【音声生成前】", services: [{ service: "notebookLM", buttons: [{ label: "URLコピー", copyId: "text_theme_url" }, { label: "音声生成", copyId: "text002" }, { label: "根拠資料生成", copyId: "text004" }] }] },
                    { category: "【プレゼン資料】", services: [{ service: "gamma", buttons: [{ label: "プレゼン生成", copyId: "text100" }] }] },
                    { category: "【音声生成後】", services: [{ service: "notebookLM", buttons: [{ label: "サムネイル", copyId: "text200" }, { label: "動画タイトル", copyId: "text201" }, { label: "概要欄", copyId: "text202" }, { label: "X告知", copyId: "text203" }] }] }
                ],
                copyTexts: {
                    text_theme_url: (vars) => {
                         const codes = vars.textbox.split('\n').map(line => line.trim()).filter(line => line !== '');
                         return vars.emarket === 'jp'
                            ? codes.map(code => `https://kabutan.jp/stock/chart?code=${code}\nhttps://kabutan.jp/stock/finance?code=${code}`).join('\n')
                            : codes.map(code => `https://us.kabutan.jp/stocks/${code}/\nhttps://us.kabutan.jp/stocks/${code}/finance`).join('\n');
                    },
                    analysis: "{{theme}}について分析してください。",
                    text002: "{{theme}}について分析してください。{{voiceNote}}",
                    text004: `{{theme}}について分析する{{reportKk}}`,
                    text100: "{{theme}}について分析する{{reportSs}}",
                    text200: "{{theme}}について分析する{{thumbnail}}",
                    text201: "{{theme}}について分析する{{titleBf}}先頭に「【{{name}}({{ticker}})】」、後ろに「｜AIニュース分析」をつけてください。{{titleAf}}",
                    text202: `{{theme}}について分析する{{gaiyoNote}}`,
                    text203: "{{theme}}について分析する{{xNotifyText}}"
                }
            },
            news: {
                 intro: () => {
                     // 1. Get news-related inputs
                     const newsDateVal = App.dom.newsDate.value;
                     const newsTimeVal = App.dom.newsTime.value.trim();
                     const noDate = App.dom.newsNoDateCheck.checked;
                     const source = App.dom.newsSource.value.trim();
                     const content = App.dom.newsContent.value.trim();

                     // 2. Build date/time string
                     let dateTimeString = '';
                     if (!noDate && newsDateVal) {
                         const dateObj = new Date(newsDateVal + 'T00:00:00Z');
                         dateTimeString = `${dateObj.getUTCFullYear()}年${dateObj.getUTCMonth() + 1}月${dateObj.getUTCDate()}日`;
                         if (newsTimeVal) {
                             dateTimeString += ` ${newsTimeVal}に`;
                         }
                     }

                     // 3. Build source string
                     const sourceString = source ? `${source}が` : '';

                     // 4. Build content part
                     let contentPart = '';
                     const prefix = [sourceString, dateTimeString].filter(Boolean).join(' ');
                     if (prefix) {
                         contentPart = `${prefix}報じた「${content}」のニュースの詳細と、`;
                     } else {
                         contentPart = `「${content}」のニュースの詳細と、`;
                     }

                     // 5. Build analysis part
                     const reasonCheck = App.dom.newsReasonCheck.checked;
                     const stockPriceCheck = App.dom.newsStockPriceCheck.checked;
                     const performanceCheck = App.dom.newsPerformanceCheck.checked;
                     const direction = document.querySelector('input[name="stock-direction"]:checked')?.value || '';

                     let reasonPart = '';
                     if (reasonCheck && direction) {
                         const name = App.dom.inputName.value.trim();
                         const ticker = App.dom.inputTicker.value.trim();
                         const period = App.dom.inputPeriod.value.trim();

                         const brand = (name && ticker) ? `${name}（${ticker}）の株価が` : '';
                         const brandInfo = (name && ticker) ? `${name}（${ticker}）の株価が` : '';
                         const dateText = period || App.state.today;
                         const dateSuffix = period ? '' : 'に';
                         
                         const afterHours = App.dom.afterHoursCheck.checked;
                         const emarket = document.querySelector('input[name="emarket"]:checked')?.value || 'jp';
                         const afterHoursText = afterHours ? (emarket === 'jp' ? 'PTSで' : '時間外取引で') : '';
                         
                         reasonPart = `${brandInfo}${dateText}${dateSuffix}${afterHoursText}${direction}理由と、${brand}`;
                     }

                     let analysisPart = '';
                     if (stockPriceCheck && performanceCheck) {
                         analysisPart = '株価や業績への今後の影響を分析';
                     } else if (stockPriceCheck) {
                         analysisPart = '株価への今後の影響を分析';
                     } else if (performanceCheck) {
                         analysisPart = '業績への今後の影響を分析';
                     } else {
                         analysisPart = '今後の影響を分析';
                     }
                     
                     return [contentPart, reasonPart, analysisPart].filter(Boolean).join(' ');
                 },
                 audioLength: "8分から10分",
                 ui: { sections: ['input-area', 'news-input-section', 'stock-direction-area'], inputs: ['ticker-name-area', 'earnings-market-area'], searchBtns: ['ir', 'kabutan'] },
                 buttonData: [
                    { category: "【分析】", services: [{ service: "gemini", buttons: [{ label: "分析用", copyId: "text020" }] }] },
                    { category: "【音声生成前】", services: [{ service: "notebookLM", buttons: [{ label: "URLコピー", copyId: "text001" }, { label: "音声生成", copyId: "text002" }, { label: "根拠資料生成", copyId: "text004" }] }] },
                    { category: "【プレゼン資料】", services: [{ service: "gamma", buttons: [{ label: "プレゼン生成", copyId: "text100" }] }] },
                    { category: "【音声生成後】", services: [{ service: "notebookLM", buttons: [{ label: "サムネイル", copyId: "text200" }, { label: "動画タイトル", copyId: "text201" }, { label: "概要欄", copyId: "text202" }, { label: "X告知", copyId: "text203" }] }] }
                 ],
                 copyTexts: {
                     text001: (vars) => vars.emarket === 'jp' ? `https://kabutan.jp/stock/chart?code=${vars.ticker}\nhttps://kabutan.jp/stock/finance?code=${vars.ticker}` : `https://us.kabutan.jp/stocks/${vars.ticker}/\nhttps://us.kabutan.jp/stocks/${vars.ticker}/finance`,
                     text020: "{{intro}}して",
                     text002: `{{intro}}ください。{{voiceNote}}\n・レポートと株探や資料で情報が異なる場合は、株探、会社発表の資料の情報を正としてください。`,
                     text004: `{{intro}}する{{reportKk}}\n・レポートと株探や資料で情報が異なる場合は、株探、会社発表の資料の情報を正としてください`,
                     text100: "{{intro}}する{{reportSs}}{{reportGc}}",
                     text200: "{{intro}}する{{thumbnail}}",
                     text201: "{{intro}}する{{titleBf}}先頭に「【{{name}}({{ticker}})】」、後ろに「｜AIニュース分析」をつけてください。{{titleAf}}",
                     text202: `{{intro}}する{{gaiyoNote}}`,
                     text203: "{{intro}}する{{xNotifyText}}",
                 }
            },
        }
    },

    // ---------------------------------------------------------------------------
    // DOM Elements Cache
    // ---------------------------------------------------------------------------
    dom: {},

    // ---------------------------------------------------------------------------
    // Application State
    // ---------------------------------------------------------------------------
    state: {
        today: '',
        prevBizDay: '',
        thisWeekFriday: '',
        lastWeekFriday: ''
    },

    // ---------------------------------------------------------------------------
    // Initialization
    // ---------------------------------------------------------------------------
    init: function() {
        this.cacheDom();
        this.bindEvents();
        this.updateDates();
        
        const firstRadio = this.dom.analysisRadios[0];
        if(firstRadio) {
            firstRadio.checked = true;
            this.handleAnalysisChange();
        }
    },

    cacheDom: function() {
        this.dom = {
            // Inputs & Controls
            baseDateInput: document.getElementById('base-date-input'),
            analysisRadios: document.querySelectorAll('input[name="analysis"]'),
            inputTicker: document.getElementById('input-ticker'),
            inputName: document.getElementById('input-name'),
            inputReading: document.getElementById('input-reading'),
            inputTheme: document.getElementById('input-theme'),
            inputPeriod: document.getElementById('input-period'),
            earningsDate: document.getElementById('earnings-date'),
            largeTextbox: document.getElementById('large-textbox1'),
            emarket: document.querySelector('input[name="emarket"]:checked'),
            termDirection: document.querySelector('input[name="term-direction"]:checked'),
            stockDirection: document.querySelector('input[name="stock-direction"]:checked'),
            afterHoursCheck: document.getElementById('after-hours-check'),
            noPriceCheck: document.getElementById('no-price-check'),
            
            // News Inputs
            newsInputSection: document.getElementById('news-input-section'),
            newsDate: document.getElementById('news-date'),
            newsTime: document.getElementById('news-time'),
            newsNoDateCheck: document.getElementById('news-no-date-check'),
            newsSource: document.getElementById('news-source'),
            newsContent: document.getElementById('news-content'),
            newsReasonCheck: document.getElementById('news-reason-check'),
            newsStockPriceCheck: document.getElementById('news-stock-price-check'),
            newsPerformanceCheck: document.getElementById('news-performance-check'),

            // Areas & Sections
            dateArea: document.getElementById('date-area'),
            buttonArea: document.getElementById('button-area'),
            allSections: document.querySelectorAll('.control-section'),
            
            // Search Buttons
            irSearchBtn: document.getElementById('ir-search-btn'),
            kabutanSearchBtn: document.getElementById('kabutan-search-btn'),
            jpxSearchBtn: document.getElementById('jpx-search-btn'),

             // Dynamic UI elements
            directionLabels: {
                's-high': document.getElementById('direction-s-high-label'),
                's-low': document.getElementById('direction-s-low-label'),
                'after-hours': document.getElementById('direction-after-hours-label'),
                'no-price': document.getElementById('direction-no-price-label'),
                'none': document.getElementById('direction-none-label'),
            }
        };
    },

    bindEvents: function() {
        this.dom.baseDateInput.addEventListener('change', (e) => this.updateDates(e.target.value));
        this.dom.analysisRadios.forEach(radio => radio.addEventListener('change', () => this.handleAnalysisChange()));
        
        this.dom.irSearchBtn.addEventListener('click', () => this.openSearchWindow('ir'));
        this.dom.kabutanSearchBtn.addEventListener('click', () => this.openSearchWindow('kabutan'));
        this.dom.jpxSearchBtn.addEventListener('click', () => this.openSearchWindow('jpx'));
    },
    
    // ---------------------------------------------------------------------------
    // UI Update Logic
    // ---------------------------------------------------------------------------
    handleAnalysisChange: function() {
        this.updateUiVisibility();
        this.renderButtons();
    },

    updateUiVisibility: function() {
        const selectedAnalysis = document.querySelector('input[name="analysis"]:checked')?.value;
        if (!selectedAnalysis) return;

        const settings = this.CONFIG.analysisSettings[selectedAnalysis];
        if (!settings) {
            // 'other' のような特殊なケース
            this.dom.allSections.forEach(el => el.classList.add('hidden'));
            document.getElementById('input-area').classList.remove('hidden');
            document.getElementById('ticker-name-area').classList.remove('hidden');
            document.getElementById('textbox-area').classList.remove('hidden');
            return;
        };
        const uiConfig = settings.ui;

        // 全てのコントロールセクションを一旦非表示に
        this.dom.allSections.forEach(el => el.classList.add('hidden'));

        // 表示すべきセクションを表示
        uiConfig.sections.forEach(id => document.getElementById(id).classList.remove('hidden'));
        
        // input-area 内の要素の表示制御
        const inputArea = document.getElementById('input-area');
        if (uiConfig.sections.includes('input-area')) {
            inputArea.classList.remove('hidden');
            // input-area内の全要素を一旦非表示に
            Array.from(inputArea.children).forEach(child => {
                if(child.classList) child.classList.add('hidden');
            });
            // 表示すべき要素を表示
            uiConfig.inputs.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.remove('hidden');
            });
        }

        // 検索ボタンの表示制御
        this.dom.irSearchBtn.style.display = 'none';
        this.dom.kabutanSearchBtn.style.display = 'none';
        this.dom.jpxSearchBtn.style.display = 'none';
        if (uiConfig.searchBtns) {
            uiConfig.searchBtns.forEach(btn => {
                if (btn === 'ir') this.dom.irSearchBtn.style.display = 'inline-block';
                if (btn === 'kabutan') this.dom.kabutanSearchBtn.style.display = 'inline-block';
                if (btn === 'jpx') this.dom.jpxSearchBtn.style.display = 'inline-block';
            });
        }
        
        // stock-direction-area内のオプション制御
        if (uiConfig.directionOptions) {
            Object.values(this.dom.directionLabels).forEach(label => label.style.display = 'inline-flex');
            uiConfig.directionOptions.hide.forEach(key => {
                if (this.dom.directionLabels[key]) {
                    this.dom.directionLabels[key].style.display = 'none';
                }
            });
            document.querySelector(`input[name="stock-direction"][value="${uiConfig.directionOptions.default}"]`).checked = true;
        } else if (!document.getElementById('stock-direction-area').classList.contains('hidden')) {
             Object.values(this.dom.directionLabels).forEach(label => label.style.display = 'inline-flex');
             document.querySelector('input[name="stock-direction"][value=""]').checked = true;
        }
    },

    renderButtons: function() {
        const selectedAnalysis = document.querySelector('input[name="analysis"]:checked')?.value;
        this.dom.buttonArea.innerHTML = '';
        if (!selectedAnalysis) return;

        const buttonData = this.CONFIG.analysisSettings[selectedAnalysis]?.buttonData;
        if (!buttonData) return;
        
        buttonData.forEach(group => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'service-group';

            const title = document.createElement('div');
            title.className = 'category-title';
            title.textContent = group.category;
            groupDiv.appendChild(title);

            group.services.forEach(svc => {
                const svcDiv = document.createElement('div');
                svcDiv.className = 'service-name';
                svcDiv.textContent = svc.service;
                groupDiv.appendChild(svcDiv);

                svc.buttons.forEach(btnInfo => {
                    const button = document.createElement('button');
                    button.textContent = btnInfo.label;
                    button.onclick = () => this.handleButtonClick(selectedAnalysis, btnInfo.copyId);
                    groupDiv.appendChild(button);
                });
            });
            this.dom.buttonArea.appendChild(groupDiv);
        });
    },

    // ---------------------------------------------------------------------------
    // Event Handlers & Core Logic
    // ---------------------------------------------------------------------------
    handleButtonClick: function(analysisKey, copyId) {
        const settings = this.CONFIG.analysisSettings[analysisKey];
        if (!settings) return;

        const variables = this.getTemplateVariables(analysisKey);
        let textTemplate = settings.copyTexts[copyId] || '';

        // 動的プロンプトの処理 (株価分析)
        if (analysisKey === 'market_buy_analysis' && copyId === 'text020') {
            const mode = variables.direction === '上昇した' ? 'up' : 'down';
            const modeVariables = settings.copyTexts.analysisModes[mode];
            textTemplate = this.replaceVariables(settings.copyTexts.corePromptTemplate, modeVariables);
        }
        
        // 関数ベースのテンプレートの処理 (URLなど)
        if (typeof textTemplate === 'function') {
            textTemplate = textTemplate(variables);
        }

        let finalText = this.replaceVariables(textTemplate, variables);
        
        // 特殊条件の追加テキスト
        if (['market_stock', 'market_earnings', 'market_buy_analysis', 'ipo', 'news'].includes(analysisKey)) {
             if ((copyId === 'text002') && variables.noPriceChecked) {
                 finalText += '\n・株価の具体的な数字は発言しないでください。ただし、上昇や下落、ストップ高、ストップ安、大幅などという表現であれば可。';
             }
             if ((copyId === 'text004' || copyId === 'text005') && variables.noPriceChecked) {
                 finalText += '\n・株価の情報（具体的な数字や変動率）は記載しないでください。';
             }
        }
        
        this.copyToClipboard(finalText);
    },

    getTemplateVariables: function(analysisKey) {
        const settings = this.CONFIG.analysisSettings[analysisKey];
        const form = {
            name: this.dom.inputName.value,
            ticker: this.dom.inputTicker.value,
            reading: this.dom.inputReading.value,
            theme: this.dom.inputTheme.value,
            period: this.dom.inputPeriod.value,
            direction: document.querySelector('input[name="stock-direction"]:checked')?.value || '',
            termDirection: document.querySelector('input[name="term-direction"]:checked')?.value || 'up',
            emarket: document.querySelector('input[name="emarket"]:checked')?.value || 'jp',
            textbox: this.dom.largeTextbox.value,
            afterHoursChecked: this.dom.afterHoursCheck.checked,
            noPriceChecked: this.dom.noPriceCheck.checked,
            earningsDate: this.dom.earningsDate.value,
            earningsTiming: document.querySelector('input[name="earnings-timing"]:checked')?.value || '',
        };
        
        const introFn = settings.intro;
        const introText = (typeof introFn === 'function') ? introFn() : introFn;
        
        const audioLength = settings.audioLength || '5分から7分';
        let voiceNote = this.replaceVariables(this.CONFIG.commonTemplates.voiceNote, { audioLength });
        if (['market_stock', 'market_earnings', 'ipo', 'market_buy_analysis', 'news'].includes(analysisKey)) {
             voiceNote += this.CONFIG.commonTemplates.upDownCorrectionNote;
             if (form.reading.trim() !== '') {
                 voiceNote += `\n・銘柄名「${form.name}」は「${form.reading}」と読みます。読み間違いに注意してください。`;
             }
        }

        let formattedEarningsDate = '';
        if (form.earningsDate) {
            const dateObj = new Date(form.earningsDate + 'T00:00:00Z');
            formattedEarningsDate = `${dateObj.getUTCFullYear()}年${dateObj.getUTCMonth() + 1}月${dateObj.getUTCDate()}日`;
        }

        const afterHours = form.afterHoursChecked ? (form.emarket === 'jp' ? 'PTSで' : '時間外取引で') : '';
        
        const baseVars = {
            ...this.state,
            ...form,
            ...this.CONFIG.commonTemplates,
            intro: introText,
            voiceNote,
            audioLength,
            formattedEarningsDate,
            timing: form.earningsTiming,
            afterHours,
        };
        
        // 週間ランキング用の動的変数
        if (analysisKey === 'market_term_rank') {
            const termDirectionLabel = form.termDirection === 'up' ? '上昇' : '下落';
            const strategy = form.termDirection === 'up' ? '順張り' : '逆張り';
            Object.assign(baseVars, {
                termDirectionLabel,
                strategy,
                weeklyRankUrl: form.termDirection === 'up' ? 'https://kabutan.jp/warning/?mode=11_13&market=1&dispmode=normal' : 'https://kabutan.jp/warning/?mode=11_14&market=1&dispmode=normal',
                monthlyRankUrl: form.termDirection === 'up' ? 'https://kabutan.jp/warning/?mode=11_17&market=1&dispmode=normal' : 'https://kabutan.jp/warning/?mode=11_18&market=1&dispmode=normal',
                strategy_analysis_point_title: form.termDirection === 'up' ? "トレンドの持続性評価" : "反発可能性の評価",
                strategy_analysis_point_detail: form.termDirection === 'up' ? "この上昇トレンドが今後も続くと考えられるか、追加の上昇材料（今後の決算期待、業界の追い風など）やテクニカル指標（移動平均線の形、出来高など）から考察してください。" : "この下落が行き過ぎであり、今後反発する可能性があるか、企業のファンダメンタルズ（業績、財務状況）やテクニカル指標（RSIの売られすぎサイン、支持線など）から考察してください。",
                strategy_suggestion_title: form.termDirection === 'up' ? "順張り戦略への示唆（トレンド持続性の評価）" : "逆張り戦略への示唆（反発可能性の評価）",
                strategy_title_suffix: form.termDirection === 'up' ? "順張り注目株" : "逆張り注目株",
                strategy_gaiyo_intro: form.termDirection === 'up' ? "順張り派の投資家必見の注目銘柄を深掘りします" : "逆張り派の投資家必見の注目銘柄を深掘りします",
                strategy_x_hint: form.termDirection === 'up' ? "上昇トレンドに乗る" : "底値を探る",
            });
        }
        
        // intro内の変数を最終的に置換
        baseVars.intro = this.replaceVariables(baseVars.intro, baseVars);

        return baseVars;
    },

    openSearchWindow: function(type) {
        const name = this.dom.inputName.value.trim();
        const ticker = this.dom.inputTicker.value.trim();
        let url;

        switch(type) {
            case 'ir':
                if (name) url = `https://www.google.com/search?q=${encodeURIComponent(name + ' IR')}`;
                break;
            case 'kabutan':
                 if (ticker) {
                     const emarket = document.querySelector('input[name="emarket"]:checked')?.value || 'jp';
                     url = (emarket === "jp") 
                         ? `https://kabutan.jp/stock/news?code=${ticker}` 
                         : `https://us.kabutan.jp/stocks/${ticker}/news`;
                }
                break;
            case 'jpx':
                url = "https://www.jpx.co.jp/listing/stocks/new/index.html";
                break;
        }

        if (url) {
            window.open(url, "_blank");
        } else {
            console.log("検索に必要な情報が入力されていません。");
        }
    },

    // ---------------------------------------------------------------------------
    // Utilities
    // ---------------------------------------------------------------------------
    updateDates: function(baseDateStr = null) {
        const baseDate = baseDateStr ? new Date(baseDateStr + 'T00:00:00') : new Date();
        const todayDate = this.getMostRecentBusinessDay(baseDate);
        const prevBizDate = this.getPreviousBusinessDay(todayDate);

        let thisWeekFridayDate = new Date(todayDate);
        thisWeekFridayDate.setDate(thisWeekFridayDate.getDate() + (5 - thisWeekFridayDate.getDay()));
        thisWeekFridayDate = this.getMostRecentBusinessDay(thisWeekFridayDate);

        let lastWeekFridayDate = new Date(thisWeekFridayDate);
        lastWeekFridayDate.setDate(lastWeekFridayDate.getDate() - 7);
        lastWeekFridayDate = this.getMostRecentBusinessDay(lastWeekFridayDate);

        this.state.today = this.formatDate(todayDate);
        this.state.prevBizDay = this.formatDate(prevBizDate);
        this.state.thisWeekFriday = this.formatDate(thisWeekFridayDate);
        this.state.lastWeekFriday = this.formatDate(lastWeekFridayDate);

        this.dom.dateArea.innerHTML = `<b>基準日:</b> ${this.state.today}<br><b>分析期間:</b> ${this.state.lastWeekFriday} ～ ${this.state.thisWeekFriday}`;
        this.dom.earningsDate.value = todayDate.toISOString().slice(0, 10);
        this.dom.newsDate.value = todayDate.toISOString().slice(0, 10);
    },
    
    isBusinessDay: function(date) {
        const day = date.getDay();
        if (day === 0 || day === 6) return false;
        const dateString = date.toISOString().slice(0, 10);
        return !this.CONFIG.holidays.includes(dateString);
    },

    getMostRecentBusinessDay: function(date) {
        let d = new Date(date);
        while (!this.isBusinessDay(d)) {
            d.setDate(d.getDate() - 1);
        }
        return d;
    },

    getPreviousBusinessDay: function(date) {
        let d = new Date(date);
        d.setDate(d.getDate() - 1);
        while (!this.isBusinessDay(d)) {
            d.setDate(d.getDate() - 1);
        }
        return d;
    },
    
    formatDate: function(date) {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    },
    
    replaceVariables: function(text, vars) {
        if (typeof text !== 'string') return '';
        let processedText = text;
        processedText = processedText.replace(/{{(.*?)}}/g, (match, key) => {
            const varName = key.trim();
            return vars[varName] !== undefined ? vars[varName] : match;
        });
         processedText = processedText.replace(/{([^{}]+)}/g, (match, key) => {
            const varName = `{${key.trim()}}`;
            return vars[varName] !== undefined ? vars[varName] : match;
        });
        return processedText;
    },

    copyToClipboard: function(text) {
        const dummy = document.createElement("textarea");
        document.body.appendChild(dummy);
        dummy.value = text;
        dummy.select();
        try {
            document.execCommand("copy");
            console.log("クリップボードにコピーしました。");
        } catch (err) {
            console.error('コピーに失敗しました。', err);
        }
        document.body.removeChild(dummy);
    }
};

// ===================================================================================
// Start Application
// ===================================================================================
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
