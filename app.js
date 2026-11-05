'use strict';
const CASES=[
{id:'going',name:'Going Soon',tag:'作品から、誘う。',steps:['観たい作品から始める','GIFTと候補日を選ぶ','招待を仕上げる','LINEで招待が届く','一緒に観る日を相談'],ctas:['この映画で友人を誘う','招待メッセージを書く','招待を送る','予定を相談する','この予定で相談する']},
{id:'negi',name:'ねぎらい予約GIFT',tag:'今の私から、未来の私へ。',steps:['何を頑張る自分へ？','GIFTを使う日を決める','未来の自分に書く','映画GIFTを事前購入','未来の自分へ贈りました','指定日にメールが届く','映画GIFTを使う'],ctas:['この自分を、ねぎらう','未来の自分への言葉を書く','映画GIFTの購入確認へ','映画GIFTを購入して贈る（デモ）','予約当日を体験する','今日、映画GIFTを使う','ムビチケ購入を体験する']},
{id:'ochi',name:'落ち着いたら行こう',tag:'ふたりの余裕が重なるころに。',steps:['自分が落ち着く目安','急がない誘いを贈る','相手の目安も聞く','ふたりの目安を合わせる','候補日から相談する'],ctas:['急がない誘いを書く','行こう券を送る','この目安で返信する','日程の候補へ','この候補を送る']},
{id:'fukyo',name:'布教券',tag:'この好き、あなたにも。',steps:['おすすめの作品を選ぶ','自分の言葉で書く','カラーと名前を決める','できあがりを確認する','画像を書き出す'],ctas:['おすすめの理由を書く','デザインを選ぶ','布教券をつくる','PNG画像を保存する','もう一枚つくる']},
{id:'dota',name:'ごめんねGIFT',tag:'まず、ちゃんと謝る。',steps:['おわびの言葉を整える','添えるかどうかを選ぶ','手紙を確認する','LINEでおわびが届く','相手のペースで使う'],ctas:['言葉に添えるものを選ぶ','手紙を確認する','LINEでおわびを届ける（デモ）','添えられたGIFTを見る','自分のペースで映画へ']}
];

const FILMS=['月の向こうで','土曜日の喫茶室','星をつなぐ夜','走れ、明日へ','週末は大騒ぎ','深夜0時のアリバイ'];
const FUKYO_EXAMPLES=[
 {film:'月の向こうで',actor:'佐倉凪',staff:'あかり',colour:'pink',tag:'出演者',message:'佐倉凪さんの、振り返る一瞬の目線が好き。\n言葉にしない気持ちまで伝わってきて、\nこの表情をスクリーンで観てほしい。'},
 {film:'走れ、明日へ',actor:'真野航',staff:'ゆう',colour:'blue',tag:'出演者',message:'真野航さんが走り出す瞬間の、息づかいと目つき！\n全身で役を演じるアクションに引き込まれた。\nこの熱量は、大画面で浴びてほしい。'},
 {film:'深夜0時のアリバイ',actor:'高瀬澪',staff:'まこ',colour:'purple',tag:'出演者',message:'高瀬澪さんの、やさしい笑顔と冷たい目の演じ分け。\n一瞬の表情で、場面の空気が変わる。\n最後まで、彼女の顔から目を離さないで。'}
];
const GOING_GENRES=[['romance','ラブストーリー','月の向こうで'],['action','アクション','走れ、明日へ'],['comedy','コメディ','週末は大騒ぎ'],['mystery','ミステリー','深夜0時のアリバイ']];
let negiMode='send';
const defaults={
going:{film:FILMS[0],to:'みさき',amount:2000,date:'2026-12-26',date2:'2026-12-27',message:'この映画、一緒に観に行かない？\n映画GIFTを添えて、誘います。',pick:'土曜の午後'},
negi:{date:'2026-12-20',original:'2026-12-20',occasion:'大きな仕事',occasionType:'大きな仕事',occasionOther:'',amount:2000,message:'ここまで、よく頑張りました。\n今日は、自分のために映画を選ぼう。',agree:false,paid:false,timeMode:'before',used:false,moved:false,film:FILMS[1],time:'18:20',reason:'体調がすぐれない'},
ochi:{mine:'2026-12-01',theirs:'2026-12-07',to:'みさき',amount:2000,message:'落ち着いたら、映画に行こう。\n今は日程を決めなくて大丈夫。',remind:'目安の3日前',pick:'12月12日（土）午後'},
fukyo:{...FUKYO_EXAMPLES[0],to:'みさき',amount:100,spoiler:'なし',saved:false,actorVersion:14},
dota:{to:'みさき',situation:'急なキャンセル',message:'急な予定変更で、ごめんなさい。\n時間を空けてくれて、ありがとう。\n今日は会えなくなってしまったけれど、\nその気持ちだけは、きちんと伝えたくて。',amount:1000,opened:false}
};
let current='going',step=-1,error='';
let state={};
try{state=JSON.parse(localStorage.getItem('eiga-gift-v4')||'{}')}catch{}
for(const k of Object.keys(defaults))state[k]=Object.assign({},defaults[k],state[k]||{});
if(!state.fukyo.actorVersion)state.fukyo={...defaults.fukyo};state.fukyo.amount=100;
const OCCASIONS=['試験','大きな仕事','育休','保育園','結婚式','その他'];
if(!OCCASIONS.includes(state.negi.occasion)&&state.negi.occasion!=='大きな仕事が終わる日'){state.negi.occasionType='その他';state.negi.occasionOther=state.negi.occasion||'';}
if(!OCCASIONS.includes(state.negi.occasionType))state.negi.occasionType=OCCASIONS.includes(state.negi.occasion)?state.negi.occasion:'その他';
if(state.negi.occasionType==='その他'&&!state.negi.occasionOther)state.negi.occasionOther=state.negi.occasion||'';

const $=s=>document.querySelector(s);
const esc=v=>String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const yen=v=>Number(v).toLocaleString('ja-JP')+'円';
const day=v=>{const a=String(v).split('-');return Number(a[1])+'月'+Number(a[2])+'日';};
const nowDate=()=>new Date().toLocaleDateString('sv-SE');
const giftDay=s=>s.timeMode==='day'||nowDate()===s.date;
const persist=()=>{try{localStorage.setItem('eiga-gift-v4',JSON.stringify(state))}catch{}};
const input=(key,value,type='text',extra='')=>'<input id="field-'+key+'" data-field="'+key+'" type="'+type+'" value="'+esc(value)+'" '+extra+'>';
const label=(text,html)=>{const k=html.match(/data-field="([^"]+)/)?.[1];return '<label class="field"'+(k?' for="field-'+k+'"':'')+'>'+text+'</label>'+html;};
const area=(key,value,max=240)=>'<textarea id="field-'+key+'" data-field="'+key+'" maxlength="'+max+'">'+esc(value)+'</textarea>';
const amounts=(none=false)=>'<div class="row">'+(none?[0,1000,2000]:[1000,2000]).map(v=>'<button class="option '+(state[current].amount===v?'selected':'')+'" data-action="amount" data-value="'+v+'">'+(v?yen(v):'言葉だけ')+'</button>').join('')+'</div>';
const choose=(key,values)=>'<div class="chips">'+values.map(v=>'<button class="chip '+(state[current][key]===v?'selected':'')+'" data-action="choose" data-key="'+key+'" data-value="'+esc(v)+'">'+esc(v)+'</button>').join('')+'</div>';
const ticket=(title,message,amount,overline='映画GIFT')=>'<div class="ticket"><div class="overline">'+overline+'</div><div class="ticket-title">'+esc(title)+'</div><div class="ticket-copy">'+esc(message)+'</div>'+(amount!==null?'<div class="amount-line"><span>映画GIFT</span><b>'+yen(amount)+'</b></div>':'')+'</div>';
const share=()=>'<button class="text-link" data-action="share">受取画面のデモリンクをコピー</button>';
const guide=()=>'<div class="return-guide">映画GIFTでMOVIE WALKER STORE等のムビチケを購入し、映画館サイトで座席指定。差額が生じる場合があります。</div>';
const opt=(key,items)=>'<select id="field-'+key+'" data-field="'+key+'">'+items.map(x=>'<option '+(state[current][key]===x?'selected':'')+'>'+esc(x)+'</option>').join('')+'</select>';
// Calendars use local date parts, never UTC conversion.
const parseDate=v=>{const p=v.split('-').map(Number);return new Date(p[0],p[1]-1,p[2],12)};
const iso=d=>[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');
const calendarMonth={};
function calendar(key,value,mode='single'){
 const base=parseDate(calendarMonth[current+key]||value),y=base.getFullYear(),m=base.getMonth(),start=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate();
 let cells='<i></i>'.repeat(start);
 for(let n=1;n<=days;n++){const d=iso(new Date(y,m,n,12)),s=state[current],past=current==='negi'&&d<nowDate();let cl=d===value?'picked':'';
 if(mode==='overlap'){cl=d>=s.mine&&d>=s.theirs?'overlap':d>=s.mine?'mine-only':'';}
 cells+='<button '+(past?'disabled':'')+' class="'+cl+'" data-action="'+(mode==='overlap'?'calendar-view':'date')+'" data-key="'+key+'" data-value="'+d+'" aria-label="'+day(d)+'" aria-pressed="'+(d===value)+'">'+n+'</button>';}
 return '<div class="calendar '+mode+'"><div class="month-nav"><button data-action="month" data-key="'+key+'" data-value="-1" aria-label="前の月">‹</button><b>'+y+' <strong>'+String(m+1).padStart(2,'0')+'</strong></b><button data-action="month" data-key="'+key+'" data-value="1" aria-label="次の月">›</button></div><div class="weekdays">'+['日','月','火','水','木','金','土'].map(x=>'<span>'+x+'</span>').join('')+'</div><div class="days">'+cells+'</div></div>';
}
function filmPoster(s,compact=false){return '<div class="mini-poster '+(compact?'compact':'')+'"><span>FICTIONAL FILM / CHOOSE YOUR MOVIE</span><div class="orbit"></div><b>'+esc(s.film)+'</b><small>作品・上映情報はデモ</small></div>';}
function going(s,k){
 if(k===0)return '<div class="invite-kicker">YOU + ME + MOVIE</div><h1 class="go-shout">この映画、<br><em>行こうぜ！</em></h1>'+filmPoster(s,true)+'<div class="invite-recipient"><span>TO</span>'+input('to',s.to,'text','maxlength="30" aria-label="誘いたい友人"')+'<b>→</b></div><div class="film-change">'+opt('film',FILMS)+'</div>';
 if(k===1)return '<div class="invite-kicker">LET’S MAKE A PLAN</div><h1>いつ、行く？</h1><div class="date-duo">'+['date','date2'].map((key,i)=>'<label class="date-pass"><span>PLAN '+(i?'B':'A')+'</span><b>'+day(s[key])+'</b>'+input(key,s[key],'date')+'</label>').join('')+'</div><p class="help">候補を2つ。予定はここから相談！</p><div class="gift-addon"><span>＋ 映画GIFTを添える</span>'+amounts()+'</div>';
 if(k===2)return '<div class="invite-kicker">YOUR INVITATION</div><div class="invitation-sheet"><b class="invite-big">一緒に<br>観よう。</b><div class="invite-movie">'+esc(s.film)+'</div>'+label('TO '+s.to+' ／ ひと言添える',area('message',s.message,160))+'<div class="pass-bottom"><b>'+day(s.date)+' / '+day(s.date2)+'</b><span>＋ '+yen(s.amount)+'</span></div></div>'+share();
 if(k===3)return lineHead('あかり')+'<div class="chat-time">今日 18:20</div><div class="line-message"><span class="line-avatar">あ</span><div class="line-bubble">'+esc(s.message).replaceAll('\n','<br>')+'</div></div><div class="line-rich line-going"><small>映画GIFT付きの招待</small><b>Going Soon</b><strong>'+esc(s.film)+'</strong><p>一緒に観よう。<br>'+day(s.date)+' or '+day(s.date2)+'</p><div>映画GIFT '+yen(s.amount)+'</div><button class="line-card-open" data-action="next">予定を相談する ↗</button></div><p class="channel-note">LINEのトークで招待を受け取り、<br>カードから予定の相談を開くイメージ。</p>';

 return '<div class="invite-kicker">I’M GOING!</div><h1 class="go-shout">じゃあ、<br><em>この日で！</em></h1><div class="reply-plans">'+[day(s.date)+' 午後',day(s.date2)+' 夕方','別の日を相談したい'].map((x,i)=>'<button class="'+(s.pick===x?'selected':'')+'" data-action="choose" data-key="pick" data-value="'+x+'"><small>'+(i<2?'PLAN '+(i?'B':'A'):'ANOTHER DAY')+'</small><b>'+x+'</b><span>↗</span></button>').join('')+'</div><p class="help">'+esc(s.film)+'を、一緒に。<br>返信後にムビチケ購入と座席指定へ進みます。</p>';
}
function negi(s,k){
 if(k===0)return '<div class="cinema-label">FROM ME, TO MY FUTURE SELF</div><h1 class="occasion-question">どんな節目の<br>自分をねぎらう？</h1><div class="occasion-options">'+OCCASIONS.map((v,i)=>'<button class="occasion-option '+(s.occasionType===v?'selected':'')+'" data-action="occasion" data-value="'+v+'" aria-pressed="'+(s.occasionType===v)+'"><span>'+['✎','▤','♡','⌂','◇','＋'][i]+'</span><b>'+v+'</b></button>').join('')+'</div>'+(s.occasionType==='その他'?'<div class="occasion-entry">'+label('ねぎらいたいこと',input('occasionOther',s.occasionOther,'text','maxlength="40" aria-label="ねぎらいたいこと" placeholder="例：引っ越しを終える自分へ"'))+'</div>':'<div class="occasion-selected">'+esc(s.occasionType)+'の節目を、映画の時間に。</div>')+'<p class="help">今の私から、未来の私へ。<br>次の画面で、ねぎらう日を選びます。</p>';
 if(k===1)return '<div class="cinema-label">A DAY FOR YOUR FUTURE SELF</div><h1>その自分を、<br>ねぎらう日は？</h1><div class="occasion-strip">'+esc(s.occasion)+'</div>'+calendar('date',s.date)+'<div class="selected-date"><span>映画GIFTが使える日</span><b>'+day(s.date)+'</b></div><p class="help">GIFTは事前購入し、選んだ日になったら利用可能に。<br>その日中にムビチケを購入し、鑑賞は後日でも。</p>';
 if(k===2)return '<div class="cinema-label">TO MY FUTURE SELF</div><div class="future-note"><small>'+day(s.date)+'の私へ ／ '+esc(s.occasion)+'</small><h1>ここまで、<br>よく頑張ったね。</h1>'+area('message',s.message,180)+'<span>今の私より</span></div><h2>今、用意しておく映画GIFT</h2>'+amounts();
 if(k===3)return '<div class="cinema-label">PAY NOW. A GIFT FOR LATER.</div><h1>今、購入して。<br>未来の自分へ贈る。</h1><div class="purchase-summary"><small>事前に購入する映画GIFT</small><b>'+yen(s.amount)+'</b><div><span>贈る相手</span><strong>未来の私</strong></div><div><span>使える日</span><strong>'+day(s.date)+'</strong></div><div><span>ねぎらうこと</span><strong>'+esc(s.occasion)+'</strong></div></div><p class="help">GIFT代金は今お支払い。利用は指定日の0:00〜23:59。<br>ムビチケ購入後、鑑賞は後日でも可。<br>GIFT利用前なら元の指定日から30日以内に1回変更。</p><label class="check"><input data-field="agree" type="checkbox" '+(s.agree?'checked':'')+'>事前購入・指定日利用の条件を確認しました。</label>';
 if(k===4)return '<div class="cinema-label">SENT TO MY FUTURE SELF</div><div class="sent-seal">✓<small>GIFT SENT</small></div><h1>未来の自分へ<br>贈りました！</h1><div class="future-delivery"><small>映画GIFT '+yen(s.amount)+' ／ 購入済み（デモ）</small><b>'+day(s.date)+' の私へ</b><span>'+esc(s.occasion)+'</span></div><div class="locked-gift"><span>LOCKED</span>'+day(s.date)+'まで、大切にお預かりします。</div><p class="help">今はまだ使えません。指定日になると、<br>過去の自分からねぎらいの言葉とGIFTが届きます。</p>'+(s.moved?'<p class="help">日付変更済み：'+day(s.original)+' → '+day(s.date)+'</p>':'<button class="text-link" data-action="reschedule">利用前に、日付を1回変更する</button>');
 if(k===5){if(!s.paid)return '<div class="cinema-label">YOUR GIFT HAS NOT BEEN RESERVED</div><h1>まずは、未来の自分に<br>GIFTを贈ろう。</h1><p class="help">事前購入すると、指定日に使えるGIFTが届きます。</p><button class="text-link" data-action="negi-restart">贈るところから体験する</button>';if(!giftDay(s))return '<div class="cinema-label">NOT YET. A GIFT FOR YOUR FUTURE.</div><h1>まだ、その日を<br>待っているところ。</h1><div class="tear-calendar"><small>GIFT UNLOCKS ON</small><b>'+parseDate(s.date).getDate()+'</b><span>'+day(s.date)+'になったら利用可能</span></div><p class="help">購入済みの映画GIFTは、指定日まで使えません。<br>下のボタンで、指定日になった状態を体験できます。</p>';
 return '<div class="cinema-label">指定日当日の受取デモ / UNLOCKED</div><h1>おつかれさま。<br>過去の私から、GIFT。</h1><div class="today-ticket"><div class="ticket-date">'+day(s.date)+'</div><small>購入済みのGIFTが使えるようになりました</small><div class="ticket-copy">'+esc(s.message)+'</div><b>映画GIFT '+yen(s.amount)+' ／ 本日23:59まで利用可</b></div>'+(s.moved?'<div class="status">日付変更済み：'+day(s.original)+' → '+day(s.date)+'</div>':'<button class="text-link" data-action="reschedule">体調がすぐれないので、日付を1回変更する</button>');}
 return '<div class="cinema-label">USE THE GIFT YOU BOUGHT BEFORE</div><h1>今日は、<br>好きな映画を選ぶ日。</h1><div class="cinema-screen">'+esc(s.film)+'<small>頑張り終えた私のための、映画の時間。</small></div><div class="cinema-seats">'+Array(12).fill('<i></i>').join('')+'</div>'+opt('film',FILMS)+'<p class="help">事前購入した映画GIFT '+yen(s.amount)+'を利用。<br>ムビチケ購入は指定日中。鑑賞日は後日も選べます。<br>指定日までの利用ロックは新規の商品条件案です。</p>';
}
function chat(who,copy,own=false){return '<div class="chat '+(own?'own':'')+'"><small>'+who+'</small><p>'+esc(copy)+'</p></div>';}
function ochi(s,k){
 if(k===0)return '<div class="planner-tab">OUR NEXT MOVIE / 予定は、あとで。</div><h1>まずは、<br>あなたのひと段落。</h1>'+calendar('mine',s.mine)+'<div class="planner-line"><span class="person-dot">私</span><b>'+day(s.mine)+'ごろから</b></div>'+input('to',s.to,'text','maxlength="30" aria-label="誘いたい人"')+'<p class="help">鑑賞日ではなく、落ち着く「目安」です。</p>';
 if(k===1)return '<div class="planner-tab">まだ、約束にしなくていい。</div><div class="chat-stream">'+chat('私 → '+s.to,'落ち着いたら、映画に行こう。',true)+'<p class="help">お返事は、落ち着いてからで大丈夫。</p>'+'</div>'+label('送るひと言',area('message',s.message,160))+'<div class="planner-gift">行こう券に映画GIFTを添える'+amounts()+'</div>'+share();
 if(k===2)return '<div class="planner-tab">'+esc(s.to)+'さんの返信</div>'+chat('届いた誘い',s.message)+'<h1>私は、このころ。</h1>'+calendar('theirs',s.theirs)+'<p class="help">'+day(s.theirs)+'ごろ。まだ予定を確定しなくて大丈夫。</p>';
 if(k===3){const date=s.mine>s.theirs?s.mine:s.theirs;return '<div class="planner-tab">TWO CALENDARS, ONE LITTLE PLAN</div><h1>ふたりの余裕が、<br>ここで重なる。</h1><div class="overlap-legend"><span>● 私 '+day(s.mine)+'〜</span><span>● '+esc(s.to)+' '+day(s.theirs)+'〜</span></div>'+calendar('theirs',date,'overlap')+'<div class="overlap-answer">'+day(date)+' ごろから、また相談。</div>'+label('そのころ、お知らせする？',opt('remind',['目安の3日前','目安の当日','通知しない']));}
 return '<div class="planner-tab">そろそろ、会えそう？</div>'+chat(s.to+'へ','少し落ち着いた？ 映画、いつ行こう。',true)+'<div class="notebook-options">'+['12月12日（土）午後','12月19日（土）夕方','まだ少し先にしたい'].map(x=>'<button class="'+(s.pick===x?'selected':'')+'" data-action="choose" data-key="pick" data-value="'+x+'"><i>'+(s.pick===x?'✓':'')+'</i>'+x+'</button>').join('')+'</div><p class="help">映画は、会う日が決まってから。<br>もう少し先でも、この約束は急がせません。</p>';
}
const OSHI={pink:{name:'ピンク',ink:'#b52386',light:'#ffe3f4'},blue:{name:'ブルー',ink:'#2058bc',light:'#e2edff'},purple:{name:'パープル',ink:'#7842ad',light:'#efe1ff'},red:{name:'レッド',ink:'#b63849',light:'#ffe3e8'},green:{name:'グリーン',ink:'#247254',light:'#e1f5e8'},yellow:{name:'イエロー',ink:'#8a6814',light:'#fff2ba'}};
const oshi=s=>OSHI[s.colour]||OSHI.pink;
function colours(s){return '<div class="colour-picker"><span>私の推しカラー</span><div>'+Object.entries(OSHI).map(([id,c])=>'<button data-action="colour" data-value="'+id+'" class="swatch '+(s.colour===id?'selected':'')+'" style="--swatch:'+c.ink+'" aria-label="推しカラー：'+c.name+'" aria-pressed="'+(s.colour===id)+'">'+(s.colour===id?'✓':'')+'</button>').join('')+'</div><small>'+oshi(s).name+'</small></div>';}
const ticketCanvasCache=new Map();
const ticketFont='"Hiragino Sans", "Yu Gothic", sans-serif';
function ticketLines(text,ctx,width){const lines=[];for(const paragraph of String(text).split('\n')){let line='';for(const char of Array.from(paragraph)){if(line&&ctx.measureText(line+char).width>width){lines.push(line);line=char;}else line+=char;}lines.push(line);}return lines;}
function fukyoCopyLines(s,size=32){const ctx=document.createElement('canvas').getContext('2d');ctx.font='500 '+size+'px '+ticketFont;return ticketLines(s.message,ctx,1072);}
function fukyoCardData(s){
 const key=JSON.stringify([s.film,s.actor,s.staff,s.message,s.colour]);if(ticketCanvasCache.has(key))return ticketCanvasCache.get(key);
 const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=900;const ctx=canvas.getContext('2d'),ink=oshi(s).ink,light=oshi(s).light;
 ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1200,900);const g=ctx.createLinearGradient(0,0,1200,900);g.addColorStop(0,'#ffffff');g.addColorStop(1,light);ctx.fillStyle=g;ctx.fillRect(0,0,1200,900);ctx.strokeStyle=ink;ctx.lineWidth=3;ctx.strokeRect(22,22,1156,856);ctx.lineWidth=1;ctx.strokeRect(34,34,1132,832);ctx.fillStyle=ink;
 function text(value,x,y,size,weight='500'){ctx.font=weight+' '+size+'px '+ticketFont;ctx.fillText(value,x,y);}
 text('RECOMMENDED BY '+s.staff+' ／ 私のおすすめ',64,83,24,'700');text('布教券',64,185,88,'900');text('♥',1058,176,80,'700');ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(64,219);ctx.lineTo(1136,219);ctx.stroke();
 let filmSize=58;ctx.font='900 '+filmSize+'px '+ticketFont;while(ctx.measureText(s.film).width>1072&&filmSize>30){filmSize-=2;ctx.font='900 '+filmSize+'px '+ticketFont;}text(s.film,64,314,filmSize,'900');text('出演者推し ／ '+s.actor+'さん',64,379,31,'700');text('ここを、観てほしい。',64,447,25,'700');
 let size=32,lines=fukyoCopyLines(s,size);while(lines.length>7&&size>24){size-=2;lines=fukyoCopyLines(s,size);}const lh=lines.length>6?34:40;ctx.font='500 '+size+'px '+ticketFont;lines.forEach((line,i)=>ctx.fillText(line,64,496+i*lh));
 ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(64,764);ctx.lineTo(1136,764);ctx.stroke();text('映画GIFT',64,823,33,'800');ctx.font='800 36px '+ticketFont;ctx.textAlign='right';ctx.fillText('100円分',1136,823);ctx.textAlign='left';text('作成イメージ ／ 見本・利用不可',64,853,20,'500');
 const data=canvas.toDataURL('image/png');if(ticketCanvasCache.size>12)ticketCanvasCache.clear();ticketCanvasCache.set(key,data);return data;
}
function fanCard(s){return '<div class="digital-ticket"><img src="'+fukyoCardData(s)+'" width="1200" height="900" alt="'+esc(s.staff)+'のおすすめ：'+esc(s.film)+'の布教券。'+esc(s.message)+'"></div>';}
function fukyo(s,k){
 if(k===0)return '<div class="fan-label">映画好きの、ガチおすすめ。</div><h1 class="fan-headline">この出演者の、<br>ここを観てほしい！</h1><div class="uchiwa"><span class="fan-top">私の推しは</span><b class="long-tag">'+esc(s.actor)+'さん</b><span class="fan-bottom">この演技、観てほしい ♡</span></div>'+label('おすすめの作品・出演者',opt('film',FUKYO_EXAMPLES.map(x=>x.film)))+'<p class="help">作品を選び、自分の言葉で布教券をつくります。</p>';
 if(k===1)return '<div class="fan-label">あなたの好きな理由を、一枚に。</div><h1>表情・声・間。<br>どこを、観てほしい？</h1><div class="scrap-note"><span class="tape"></span><b>'+esc(s.film)+' ／ '+esc(s.actor)+'さん</b>'+area('message',s.message,180)+'</div>'+label('おすすめしたい出演者',input('actor',s.actor,'text','maxlength="25"'))+'<p class="help">結末は内緒。好きなところを、自分の言葉で。</p>';
 if(k===2)return '<div class="fan-label">好きな色で、あなたの布教券に。</div><div class="fan-to">BY '+input('staff',s.staff,'text','maxlength="20" aria-label="作成者の名前"')+'</div>'+colours(s)+fanCard(s)+'<p class="help">作品・人物は架空の作例です。色と名前を選んで仕上げます。</p>';
 if(k===3)return '<div class="fan-label">YOUR RECOMMENDATION, READY.</div><h1>できた。<br>この好き、あなたにも。</h1>'+fanCard(s)+'<div class="export-details"><b>PNG画像で保存</b><span>1,200 × 900px ／ 選んだ色・名前・おすすめ文を反映</span></div><p class="help">保存後は、画像を見せたり、友人に送ったり。<br>実際の映画GIFTの発行・購入・送信は行いません。</p>';
 return '<div class="finish-mark" aria-hidden="true">✓</div><div class="fan-label">YOUR RECOMMENDATION, IN ONE IMAGE.</div><h1>あなたの「好き」が、<br>一枚になりました。</h1>'+fanCard(s)+'<p class="export-status" role="status">'+(s.saved?'PNG画像のダウンロードを開始しました。':'布教券のできあがりです。')+'</p><button class="secondary-button" data-action="export-card">画像をもう一度保存する</button><p class="help">スマートフォンでダウンロードできない場合は、<br>上の画像を長押しして保存できます。</p>';
}
let exportingCard=false;
async function saveFukyoCard(){
 if(exportingCard)return;const s=state.fukyo;if(!s.message.trim()||fukyoCopyLines(s,24).length>7){show('fukyo',1);error='おすすめ文を7行以内に収まる長さで入力してください。';render();return;}
 exportingCard=true;const buttons=[...document.querySelectorAll('[data-action="export-card"],#device footer .primary')];buttons.forEach(b=>{b.disabled=true;b.setAttribute('aria-busy','true');});
 try{await document.fonts.ready;const response=await fetch(fukyoCardData(s)),blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='布教券_'+s.film.replace(/[\\/:*?"<>|]/g,'_')+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);s.saved=true;persist();if(current==='fukyo')show('fukyo',4);}catch(e){toast('画像を長押しして保存する方法もお試しください。');}finally{exportingCard=false;buttons.forEach(b=>{b.disabled=false;b.removeAttribute('aria-busy');});}
}
function animateScene(direction='forward'){
 if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const node=$('#device .hero-cover')||$('#device .screen');if(!node?.animate)return;
 node.getAnimations().forEach(a=>a.cancel());const soft=current==='negi'||current==='dota',finish=(current==='negi'&&step===4)||(current==='fukyo'&&step===4)||direction==='reveal',travel=direction==='back'?-12:14;
 node.animate([{opacity:0,transform:soft?'translateY(14px)':`translateX(${travel}px) scale(.99)`},{opacity:1,transform:'translate(0) scale(1)'}],{duration:finish?520:soft?390:300,easing:'cubic-bezier(.2,.75,.25,1)',fill:'none'});
 const detail=$('#device .finish-mark')||$('#device .sent-seal');if(finish&&detail)detail.animate([{opacity:0,transform:'scale(.85)'},{opacity:1,transform:'scale(1)'}],{duration:620,delay:90,easing:'cubic-bezier(.16,1,.3,1)',fill:'backwards'});
}
function animateModal(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;$('.modal-wrap')?.animate([{opacity:0},{opacity:1}],{duration:180});$('.modal-box')?.animate([{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'translateY(0)'}],{duration:390,easing:'cubic-bezier(.2,.75,.25,1)'});}


function letter(s){return '<div class="letter"><small>'+esc(s.to)+'さんへ</small>'+esc(s.message)+'<div class="seal">おわびの気持ちを込めて</div></div>';}
function dota(s,k){
 if(k===0)return '<div class="letter-heading">おわびの便り</div><h1>ごめんなさいを、<br>きちんと言葉に。</h1><div class="pair">'+label('相手のお名前',input('to',s.to,'text','maxlength="30"'))+label('伝えたいこと',opt('situation',['急なキャンセル','遅刻','予定の変更']))+'</div>'+'<div class="writing-paper">'+label('おわびの手紙',area('message',s.message,240))+'</div>'+'<p class="help">事情とおわび、時間を空けてくれたお礼を。</p>';
 if(k===1)return '<h1>言葉だけでも。<br>映画を添えても。</h1><p>おわびの伝え方は、ご自身で選べます。</p>'+amounts(true)+'<div class="letter">まずは、きちんと謝る。<br>GIFTはその気持ちに添えるもの。</div><p class="help">時間で金額を決める仕組みや、返事を求める仕組みはありません。</p>';
 if(k===2)return '<h1>この言葉で、<br>気持ちは伝わるだろうか。</h1>'+letter(s)+(s.amount?'<div class="ledger"><span>そっと添える映画GIFT</span><b>'+yen(s.amount)+'</b></div>':'<p class="help">今回は、おわびの言葉だけを届けます。</p>')+share();
 if(k===3)return '<div class="letter-heading">'+esc(s.to)+'さんへ</div>'+(s.opened?'<h1>時間を空けてくれて、<br>ありがとう。</h1>'+letter(s)+'<p class="help">お返事は、落ち着いたときで大丈夫です。</p>':'<h1>おわびの手紙が<br>届いています。</h1><button class="envelope" data-action="open-letter" aria-label="封を開く"><span>TO '+esc(s.to)+'</span><i></i><b>封を開く</b><small>おわびの気持ちを込めて</small></button><p class="help">まずは、言葉を。<br>お返事や、次の約束は急ぎません。</p>');
 return '<h1>あなたの時間で、<br>楽しんでもらえたら。</h1>'+(s.amount?ticket('添えられた映画GIFT','映画を観るときに、お使いください。',s.amount):'<div class="letter">おわびの言葉を、<br>受け取りました。</div>')+'<p class="help">返事も、次の約束も、ご自分のペースで。</p>'+(s.amount?guide():'');
}
const COVER={
 going:{kicker:'映画の予定は、ここから始まる。',title:'Going<br>Soon',copy:'観たい気持ちを、<br>誘うきっかけに。',cta:'この映画で、誘ってみる ↗',object:'<div class="cover-passes"><div><small>LET’S GO TO THE MOVIES</small><b>MOVIE<br>GIFT</b><span>YOU + ME →</span></div><div><small>INVITATION</small><b>一緒に<br>行こうぜ！</b></div></div>'},
 negi:{kicker:'頑張り終える、未来の自分へ。',title:'ねぎらい<br>予約GIFT',copy:'おつかれさまを、<br>予約しよう。',cta:'頑張る自分に、映画を贈る',object:'<div class="cover-theater"><div class="cover-screen"></div><div class="cover-seat-row"><i></i><i></i><i></i><i></i><i></i></div><div class="cover-seat-row front"><i></i><i></i><i></i><i></i></div><div class="cover-reserve"><small>CINEMA / RESERVED FOR ME</small><b>私をねぎらう、一日。</b><span>今、GIFTを購入 ／ 指定日に利用</span></div></div>'},
 ochi:{kicker:'いま忙しい、あの人へ。',title:'落ち着いたら<br>行こう',copy:'「そのうち」を、<br>ふたりの約束に。',cta:'急がない映画の約束を贈る',object:'<div class="cover-planners"><div><small>MY SCHEDULE</small><b>私の<br>ひと段落</b><span>○ ○ ○ ○<br>○ ○ ● ○</span></div><div><small>YOUR SCHEDULE</small><b>あなたの<br>ひと段落</b><span>○ ○ ○ ○<br>○ ○ ● ○</span></div><i>余裕が重なるころに。</i></div>'},
 fukyo:{kicker:'映画好きの、ガチおすすめ。',title:'布教券',copy:'好きな理由を、<br>あなたの一枚に。',cta:'自分だけの布教券をつくる',object:'<div class="cover-fan-stage"><div class="cover-fan"><span>この映画</span><b>観てほしい</b><span>♡ ♡ ♡</span></div><div class="cover-oshi-card"><small>OSHI RECOMMENDATION</small><b>布教券</b><span>この好き、<br>あなたにも。</span><i>作って、画像で保存。</i></div></div>'},
 dota:{kicker:'会えなくなった、あの人へ。',title:'ごめんね<br>GIFT',copy:'まず、ちゃんと<br>ごめんなさいを。',cta:'おわびの手紙を書く',object:'<div class="cover-envelope"><span>おわびの気持ちを込めて</span><i></i><b>ごめんなさい。</b></div><div class="cover-letter-note">言葉が先。映画GIFTは、添えても。</div>'}
};
function welcome(id){const c=COVER[id];if(id==='going')return '<main class="hero-cover hero-going cinema-premiere"><img class="cinema-hero-photo" src="going-cinema-hero-v16.webp" width="900" height="1350" fetchpriority="high" alt="映画館で隣り合って座り、スクリーンを見つめる二人"><div class="cinema-hero-shade" aria-hidden="true"></div><div class="cinema-hero-content"><div class="cover-mark">映画GIFT / NEXT INVITATION</div><p class="cinema-hero-kicker">次の映画は、あの人と。</p><h1 class="cover-title">Going<br>Soon<span aria-hidden="true">↗</span></h1><p class="cinema-hero-copy">「観たい！」を、<br>「一緒に行こう」に。</p><p class="cinema-hero-note">映画GIFTを添えて、映画館へ誘おう。</p></div><div class="cinema-genre-nav"><p>どんな映画で、誘う？</p><div>'+GOING_GENRES.map(([id,label])=>'<button data-action="genre-start" data-value="'+id+'" aria-label="'+label+'の映画から招待をつくる">'+label+'<span aria-hidden="true">↗</span></button>').join('')+'</div></div></main><footer class="app-foot"><button class="primary" data-action="start">映画GIFTを添えて、誘いをつくる ↗</button><div class="demo">企画の操作デモ／実際の決済・送信は行いません</div></footer>';return '<main class="hero-cover hero-'+id+'"><div class="cover-mark">映画GIFT / GIFT EXPERIENCE</div><div class="cover-kicker">'+c.kicker+'</div><h1 class="cover-title">'+c.title+'</h1><p class="cover-copy">'+c.copy+'</p>'+c.object+'</main><footer class="app-foot"><button class="primary" data-action="start">'+c.cta+'</button>'+(id==='negi'?'<button class="secondary-button" data-action="negi-receive">届いた日から体験する →</button>':'')+'<div class="demo">企画の操作デモ／実際の決済・送信は行いません</div></footer>';}
function lineHead(name){return '<div class="channel-head"><button data-action="back" aria-label="前の場面へ">‹</button><b>'+esc(name)+'</b><span>⋯</span></div><div class="channel-label">LINEで届くイメージ</div>';}
const originalNegi=negi,originalDota=dota;
function receiptView(id,s,k){
 if(id==='negi'&&k===5&&s.paid&&giftDay(s))return '<div class="mail-toolbar"><button data-action="back" aria-label="前の場面へ">‹</button><span>受信トレイ</span><span>⋯</span></div><div class="mail-subject">今日のあなたへ。<br>おつかれさま。</div><div class="mail-sender"><span>映</span><div><b>映画GIFT</b><small>To: 未来の私　／　'+day(s.date)+' 09:00</small></div></div><div class="mail-body"><p>'+esc(s.occasion)+'の節目を迎えたあなたへ。</p><p>'+esc(s.message).replaceAll('\n','<br>')+'</p><div class="mail-gift"><small>過去の私から届いた映画GIFT</small><b>'+yen(s.amount)+'</b><span>本日23:59まで、ムビチケ購入に利用</span></div><p class="mail-sign">ここまで頑張った、あなたの時間に。<br>今の私より</p></div><p class="channel-note">事前購入したGIFTが指定日に利用可能に。<br>下のボタンから映画を選びます。</p>'+(s.moved?'':'<button class="text-link" data-action="reschedule">体調などの理由で、利用日を1回変更</button>');
 if(id==='dota'&&k===3)return lineHead('あかり')+'<div class="chat-time">今日 17:45</div><div class="line-message"><span class="line-avatar">あ</span><div class="line-bubble">急に予定を変えてしまって、ごめんなさい。<br>きちんと言葉で伝えたくて、手紙を書きました。</div></div>'+(s.opened?'<div class="line-open-letter">'+letter(s)+'</div><p class="channel-note">返事は、落ち着いたときで大丈夫。</p>':'<button class="line-letter" data-action="open-letter"><small>おわびの手紙</small><b>'+esc(s.to)+'さんへ</b><span>ごめんなさいを、言葉に。</span><i>手紙を開く</i></button><p class="channel-note">LINEで届いた便りから、<br>まず、おわびの言葉を読む。</p>');
 return ({going,negi:originalNegi,ochi,fukyo,dota:originalDota}[id])(s,k);
}
const VIEWS={going,negi:(s,k)=>receiptView('negi',s,k),ochi,fukyo,dota:(s,k)=>receiptView('dota',s,k)};
function enterNegiReceive(){negiMode='receive';Object.assign(state.negi,{paid:true,timeMode:'day',used:false});persist();history.replaceState(null,'','?case=negi&mode=receive');show('negi',5);}
function renderModes(){const modes=$('#experience-modes');if(current!=='negi'){modes.innerHTML='';return;}modes.innerHTML='<div class="mode-label">ねぎらい予約GIFTの体験を選ぶ</div><div class="mode-tabs"><button data-action="negi-send" aria-pressed="'+(negiMode==='send')+'">購入・予約する</button><button data-action="negi-receive" aria-pressed="'+(negiMode==='receive')+'">届いた日から使う</button></div>';const c=CASES.find(x=>x.id==='negi');if(negiMode==='send'&&step===5){const h=$('#context h2');if(h)h.textContent='指定日までお預かり';}const tag=$('#context .tag');if(tag)tag.textContent=negiMode==='receive'?'届いた日からの体験':'購入・予約の体験';const ids=negiMode==='receive'?[5,6]:[0,1,2,3,4,5];$('#steps').innerHTML=(negiMode==='send'?'<button data-step="-1">00　企画の入口</button>':'')+ids.map((i,j)=>'<button data-step="'+i+'" class="'+(step===i?'active':'')+'">'+String(j+1).padStart(2,'0')+'　'+(i===5&&negiMode==='send'?'指定日までお預かり':esc(c.steps[i]))+'</button>').join('');const mark=$('#device .step-mark');if(mark&&step>=0){const n=ids.indexOf(step)+1;mark.innerHTML='<span>'+String(n).padStart(2,'0')+' / '+ids.length+'</span><b>'+(negiMode==='receive'?'届いた日からの体験':'購入・予約の体験')+'</b><i style="--progress:'+n/ids.length*100+'%"></i>';}}
function enhance(){
 const c=CASES.find(x=>x.id===current),d=$('#device');
 document.body.dataset.case=current;
 $('#cases').querySelectorAll('button').forEach((b,i)=>{b.setAttribute('aria-pressed',b.dataset.case===current);b.innerHTML='<small>'+String(i+1).padStart(2,'0')+'</small><span>'+esc(CASES[i].name)+'</span><b aria-hidden="true">↗</b>';});
 $('#steps').setAttribute('aria-label','体験のステップ');$('#steps').querySelectorAll('button').forEach(b=>{if(+b.dataset.step===step)b.setAttribute('aria-current','step');});
 if(step>=0){const mark=d.querySelector('.step-mark');mark.innerHTML='<span>'+String(step+1).padStart(2,'0')+' / '+String(c.steps.length).padStart(2,'0')+'</span><b>'+esc(c.steps[step])+'</b><i style="--progress:'+((step+1)/c.steps.length*100)+'%"></i>';}
 d.querySelectorAll('[data-field]').forEach(el=>{if(!el.id)el.id='field-'+el.dataset.field;if(!el.labels?.length&&!el.getAttribute('aria-label'))el.setAttribute('aria-label',({film:'観たい映画',to:'相手のお名前',message:current==='negi'?'未来の自分への言葉':current==='dota'?'おわびの手紙':'メッセージ',date:'候補日',date2:'もう一つの候補日',staff:'配布担当者',agree:'事前購入と指定日利用の条件'})[el.dataset.field]||el.dataset.field);});
 d.querySelectorAll('button[data-action="amount"],button[data-action="choose"]').forEach(b=>b.setAttribute('aria-pressed',b.classList.contains('selected')));
 d.querySelectorAll('.calendar.overlap .days button').forEach(b=>{b.disabled=true;b.setAttribute('aria-label',b.getAttribute('aria-label')+(b.classList.contains('overlap')?'：ふたりの余裕が重なる日':''));});
 if(error){const e=d.querySelector('.error');e.id='input-error';e.tabIndex=-1;const key=/お名前/.test(error)?'to':/ひと言|言葉/.test(error)?'message':/条件/.test(error)?'agree':/日付/.test(error)?'date':'occasionOther';const f=d.querySelector('[data-field="'+key+'"]');if(f){f.setAttribute('aria-invalid','true');f.setAttribute('aria-describedby','input-error');}e.focus();}
}

function render(){
 const c=CASES.find(x=>x.id===current),s=state[current],device=$('#device');
 let vars='--paper:#fafaf5;--ink:#101820;--key:#1558ed;--accent:#f5ed59;--line:#9da6aa;--input:#fff;--panel:#fff;--head:#101820;--buttontext:#fff';
 device.className='device case-'+current+(step===-1?' is-cover':'')+' phase-'+step;device.style.cssText=current==='going'?vars:'';
 if(current==='fukyo'){device.style.setProperty('--oshi',oshi(s).ink);device.style.setProperty('--oshi-light',oshi(s).light);}
 const head=current==='going'?'<span class="brand-going">Going Soon</span>':'<span>'+esc(c.name)+'</span>';
 device.innerHTML='<header class="app-head">'+head+'<small>映画GIFT</small></header><main class="screen">'+(step>=0?'<button class="go-back" data-action="back">'+(step===0?'‹ タイトルへ':'‹ 戻る')+'</button>':'')+'<div class="step-mark" aria-label="体験の進行">'+String(step+1).padStart(2,'0')+' / '+String(c.steps.length).padStart(2,'0')+'</div>'+(error?'<div class="error" role="alert">'+error+'</div>':'')+(step<0?'':VIEWS[current](s,step))+'</main><footer class="app-foot"><button class="primary" data-action="next">'+esc(current==='negi'&&step===5&&negiMode==='send'?'届いた日からの体験へ':current==='negi'&&step===4?'予約内容を確認する':current==='negi'&&step===5&&(!giftDay(s)||!s.paid)?'指定日になった状態を体験する':current==='dota'&&step===3&&!s.opened?'まず、おわびの手紙を読む':current==='going'?['この映画で誘う！ ↗','この候補で、誘おう ↗','LINEで招待する（デモ）','予定の相談を開く ↗','この日で返信！ ↗'][step]:c.ctas[step])+'</button><div class="demo">'+(current==='negi'?'事前購入・指定日利用は新規企画案／決済はデモ':current==='fukyo'?'画像作成の試作／映画GIFTの発行・決済は行いません':'企画の操作デモ／実際の決済・送信は行いません')+'</div></footer>';
 $('#cases').innerHTML=CASES.map(x=>'<button data-case="'+x.id+'" class="'+(current===x.id?'active':'')+'">'+esc(x.name)+'</button>').join('');
 $('#steps').innerHTML='<button data-step="-1" class="'+(step===-1?'active':'')+'">00　企画の入口</button>'+c.steps.map((x,i)=>'<button data-step="'+i+'" class="'+(step===i?'active':'')+'">'+String(i+1).padStart(2,'0')+'　'+esc(x)+'</button>').join('');
 $('#context').innerHTML='<span class="tag">操作ガイド</span><h2>'+esc(step<0?c.name:c.steps[step])+'</h2><p>'+(step<0?'タイトル画面のボタンから体験を開始します。':'画面の内容を選び、下のボタンで次に進みます。')+'</p><p class="help">入力はこの端末に保存されます。<br>実際の決済・送信は行いません。</p>';
 if(step===-1)device.innerHTML=welcome(current);
 if((current==='going'||current==='dota')&&step===3)device.classList.add('channel-line');if(current==='negi'&&step===5&&s.paid&&giftDay(s))device.classList.add('channel-mail');enhance();renderModes();persist();
}
function show(id,k=-1){const previousCase=current,previousStep=step;if(typeof id==='number')id=CASES[id].id;current=CASES.some(c=>c.id===id)?id:'going';step=Math.max(-1,Math.min(CASES.find(c=>c.id===current).steps.length-1,Number(k)||0));error='';render();animateScene(previousCase===current&&step<previousStep?'back':'forward');const t=$('#device.channel-mail .mail-subject')||$('#device.channel-line .channel-head b')||$('#device .cover-title')||$('#device .step-mark');if(t){t.tabIndex=-1;t.focus({preventScroll:true});}if(matchMedia('(max-width: 760px)').matches)$('#device').scrollIntoView({block:'start',behavior:'instant'});}
function next(){
 if(step===-1){show(current,0);return}if(current==='dota'&&step===3&&!state.dota.opened){state.dota.opened=true;persist();render();animateScene('reveal');return}
 const s=state[current];error='';if(current==='fukyo'&&step===3){saveFukyoCard();return}if(current==='fukyo'&&step===4){s.saved=false;show('fukyo',0);return}if(current==='fukyo'&&step===1&&fukyoCopyLines(s,24).length>7){error='おすすめ文は7行以内に収まる長さで入力してください。';render();return}if(current==='negi'&&step===5&&negiMode==='send'){enterNegiReceive();return}
 if(current==='negi'&&step===3&&!s.agree){error='一日限定の条件をご確認ください。';render();return}
 if(['going','ochi','dota'].includes(current)&&step===0&&!String(s.to).trim()){error='お名前を入力してください。';render();return}
 if(['going','fukyo','dota'].includes(current)&&step===(current==='dota'?0:current==='going'?2:1)&&!String(s.message).trim()){error='ひと言を入力してください。';render();return}
 if(current==='negi'&&step===1&&s.date<nowDate()){error='今日以降の日付を選んでください。';render();return}
 if(current==='negi'&&step===0&&!String(s.occasion).trim()){error='ねぎらいたいことを選ぶか、その他に入力してください。';render();return}
 if(current==='negi'&&step===2&&!String(s.message).trim()){error='未来の自分への言葉を入れてください。';render();return}
 if(current==='negi'&&step===3){s.paid=true;s.timeMode='before';s.used=false;persist();}
 if(current==='negi'&&step===4){s.timeMode='before';persist();}
 if(current==='negi'&&step===5){if(!s.paid){show(current,0);return}if(!giftDay(s)){s.timeMode='day';persist();render();return}}
 if(current==='negi'&&step===6&&s.used){toast('このGIFTは利用済みです（デモ）');return}
 if(current==='negi'&&step===6&&(!s.paid||!giftDay(s))){show(current,s.paid?4:0);return}
 if(step<CASES.find(c=>c.id===current).steps.length-1){show(current,step+1);return}
 if(current==='negi')s.used=true;
 persist();modal(({going:'次の映画が、<br>ふたりの予定に。',negi:'頑張った私に、<br>映画の時間を。',ochi:'また会う約束が、<br>一歩近づいた。',dota:'ごめんねの気持ちを、<br>届けました。'})[current]||'体験を終えました','<p>'+({going:'候補日の相談を送りました。',negi:'指定日中にチケットを購入する体験を確認しました。鑑賞日は購入後に選べます。',ochi:'相手のペースを尊重した、次の相談につながりました。',dota:'気持ちを伝えたあとは、相手のペースに委ねます。'}[current])+'</p><p>実際の決済・送信・チケット購入は行っていません。</p>','もう一度試す',()=>show(current,0));$('.modal-box')?.classList.add('ending-note');
}
let modalReturn=null;function closeModal(){$('#modal').innerHTML='';document.querySelector('aside').inert=false;$('.workspace').inert=false;if(modalReturn?.isConnected)modalReturn.focus();else $('#device .primary')?.focus();}function modal(title,html,button,callback){modalReturn=document.activeElement;$('#modal').innerHTML='<div class="modal-wrap"><section class="modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title"><h2 id="modal-title">'+title+'</h2>'+html+'<button class="primary" id="modal-primary">'+button+'</button><button class="modal-close" data-action="close">閉じる</button></section></div>';$('#modal-primary').onclick=()=>{const box=$('.modal-box');if(callback(box)!==false)closeModal();};document.querySelector('aside').inert=true;$('.workspace').inert=true;$('#modal-primary').focus();animateModal();}
function reschedule(){
 const s=state.negi;if(s.moved||s.used)return;
 const base=s.original||s.date;const max=new Date(base+'T12:00:00');max.setDate(max.getDate()+30);const maxString=max.toLocaleDateString('sv-SE');
 modal('映画を選ぶ日を、変更する','<p>映画GIFTを使う前に1回だけ、元の指定日から30日以内で変更できます。事前購入済みのGIFTを、新しい指定日までお預かりします。</p><label class="field">変更する日</label><input id="move-date" type="date" min="'+base+'" max="'+maxString+'" value="'+s.date+'"><label class="field">理由</label><select id="move-reason"><option>体調がすぐれない</option><option>仕事・試験が延びた</option><option>その他</option></select>','この日に変更する',box=>{const d=box.querySelector('#move-date').value;if(!d||d<base||d>maxString){box.querySelector('p').textContent='元の日から30日以内の日付を選んでください。';return false}s.original=base;s.date=d;s.reason=box.querySelector('#move-reason').value;s.moved=true;s.timeMode='before';negiMode='send';history.replaceState(null,'','?case=negi');persist();show('negi',4);});
}
async function copyShare(){
 const payload={id:current,state:state[current],step:3};const bytes=new TextEncoder().encode(JSON.stringify(payload));const b64=btoa(String.fromCharCode(...bytes));const url=location.origin+location.pathname+'?case='+current+'#receive='+encodeURIComponent(b64);
 try{await navigator.clipboard.writeText(url);toast('受取画面のデモリンクをコピーしました');}catch{modal('受取画面のデモリンク','<p>このリンクには入力したメッセージが含まれます。</p><textarea readonly>'+esc(url)+'</textarea>','閉じる',()=>{});}
}
function toast(t){const e=document.createElement('div');e.className='toast';e.textContent=t;document.body.append(e);setTimeout(()=>e.remove(),2400);}
document.addEventListener('input',e=>{const key=e.target.dataset.field;if(!key)return;state[current][key]=e.target.type==='checkbox'?e.target.checked:e.target.value;if(current==='fukyo'&&key==='staff'){const preview=$('#device .digital-ticket img');if(preview)preview.src=fukyoCardData(state.fukyo);}if(current==='negi'&&key==='occasionOther')state.negi.occasion=e.target.value;if(current==='negi'&&key==='date'&&!state.negi.moved)state.negi.original=e.target.value;persist();});
document.addEventListener('change',e=>{const key=e.target.dataset.field;if(!key)return;state[current][key]=e.target.type==='checkbox'?e.target.checked:e.target.value;if(current==='fukyo'&&key==='film'){const preset=FUKYO_EXAMPLES.find(x=>x.film===e.target.value);if(preset)Object.assign(state.fukyo,{film:preset.film,actor:preset.actor,message:preset.message,tag:'出演者'});}persist();if(e.target.tagName==='SELECT'&&['film','spoiler'].includes(key))render();});
document.addEventListener('click',e=>{
 const b=e.target.closest('button');if(!b)return;
 if(b.dataset.case){show(b.dataset.case);history.replaceState(null,'','?case='+b.dataset.case);return}
 if(b.dataset.step!==undefined){show(current,Number(b.dataset.step));return}
 const s=state[current];switch(b.dataset.action){
 case'genre-start':{const g=GOING_GENRES.find(x=>x[0]===b.dataset.value);if(g)state.going.film=g[2];show('going',0);break;}case'negi-receive':enterNegiReceive();break;case'negi-send':negiMode='send';history.replaceState(null,'','?case=negi');show('negi',-1);break;case'export-card':saveFukyoCard();break;case'occasion':s.occasionType=b.dataset.value;s.occasion=s.occasionType==='その他'?s.occasionOther:s.occasionType;render();break;case'colour':if(OSHI[b.dataset.value]){s.colour=b.dataset.value;render();}break;case'negi-restart':negiMode='send';show('negi',0);break;case'start':if(current==='negi')negiMode='send';show(current,0);break;case'open-letter':s.opened=true;render();animateScene('reveal');break;case'date':s[b.dataset.key]=b.dataset.value;if(current==='negi'&&!s.moved)s.original=s.date;render();break;case'month':{const key=b.dataset.key,base=parseDate(calendarMonth[current+key]||s[key]);base.setDate(1);base.setMonth(base.getMonth()+Number(b.dataset.value));calendarMonth[current+key]=iso(base);render();break;}case'next':next();break;case'back':if(current==='negi'&&negiMode==='receive'&&step===5){negiMode='send';history.replaceState(null,'','?case=negi');show('negi',-1);}else{show(current,step-1);}break;case'amount':s.amount=Number(b.dataset.value);render();break;case'choose':s[b.dataset.key]=b.dataset.value;render();break;case'flip':s.back=!s.back;render();break;case'reschedule':reschedule();break;case'share':copyShare();break;case'close':closeModal();break;case'reset':state[current]=Object.assign({},defaults[current]);persist();show(current);break;
 }
});
const params=new URLSearchParams(location.search);current=params.get('case')||'going';if(current==='thanks')current='going';if(current==='bouquet')current='ochi';if(current==='negi'&&params.get('mode')==='receive'){negiMode='receive';Object.assign(state.negi,{paid:true,timeMode:'day',used:false});step=5;}if(current==='fukyo'&&params.get('view')==='line')step=3;
try{if(location.hash.startsWith('#receive=')){const binary=atob(decodeURIComponent(location.hash.slice(9)));const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));const p=JSON.parse(new TextDecoder().decode(bytes));if(CASES.some(c=>c.id===p.id)){current=p.id;state[current]=Object.assign({},defaults[current],p.state);step=3;}}}catch{}
document.addEventListener('keydown',e=>{const box=$('.modal-box');if(!box)return;if(e.key==='Escape'){e.preventDefault();closeModal();}if(e.key==='Tab'){const a=[...box.querySelectorAll('button,input,select,textarea,a[href]')].filter(x=>!x.disabled);const first=a[0],last=a.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
window.show=show;window.PROTOTYPE={CASES,FUKYO_EXAMPLES,get negiMode(){return negiMode},set negiMode(v){negiMode=v},get state(){return state},reset:()=>{state=JSON.parse(JSON.stringify(defaults));persist();render();},get current(){return current},get step(){return step}};
show(current,step);
