const state = {
  role: "owner",
  page: "dashboard",
  stocktakeStarted: false,
  webhookCount: 0,
  products: [
    {id:"P001", sku:"AA-ISUZU-40G", name:"五十铃", weight:"40g", qty:1, expiry:"2027-01-31", price:300, cost:188, discount:"正价", alert:"低库存"},
    {id:"P002", sku:"AA-AOARASHI-40G", name:"青岚", weight:"40g", qty:5, expiry:"2027-02-08", price:240, cost:142, discount:"9折", alert:"90天内"},
    {id:"P003", sku:"AA-WAKATAKE-40G", name:"若竹", weight:"40g", qty:4, expiry:"2027-04-28", price:260, cost:150, discount:"正价", alert:"正常"},
    {id:"P004", sku:"AA-ISUZU-100G", name:"五十铃", weight:"100g", qty:0, expiry:"—", price:680, cost:440, discount:"正价", alert:"查后可预售"}
  ]
};

const ownerNav = [
  ["经营", [["dashboard","总览"],["inventory","库存"],["products","产品"],["stockin","入库"],["ledger","库存流水"]]],
  ["销售", [["tasks","任务"],["preorders","预售"],["stocktake","盘点"],["settlements","月结与付款"]]],
  ["分析", [["reports","利润报表"],["announcements","公告"],["pos","POS测试"]]],
  ["系统", [["settings","规则与设置"]]]
];
const managerNav = [
  ["日常", [["dashboard","今日"],["inventory","库存与价格"],["tasks","待办"],["preorders","预售"]]],
  ["月底", [["stocktake","盘点"],["settlements","账单与付款"]]],
  ["信息", [["announcements","公告"],["pos","手动备用"]]]
];
const titles = {
  dashboard:"总览", inventory:"库存", products:"产品", productDetail:"产品详情", stockin:"新建入库",
  ledger:"库存流水", tasks:"重要任务", taskDetail:"任务详情", preorders:"预售订单", preorderDetail:"预售详情",
  preorderAvailability:"预售状态", stocktake:"月末盘点", settlementDetail:"月度寄售结算", settlements:"历史账单",
  payment:"MPay付款", reports:"利润报表", announcements:"公告", announcementDetail:"公告详情", announcementNew:"发布公告",
  pos:"POS连接与测试", settings:"规则与设置", manualSale:"手动记录销售", batchDetail:"批次详情"
};

function money(n){ return `MOP ${Number(n).toLocaleString("zh-Hans", {minimumFractionDigits:2, maximumFractionDigits:2})}`; }
function navButton(page,label){ return `<button class="nav-item ${state.page===page?"is-active":""}" data-nav="${page}">${label}</button>`; }
function renderNav(){
  const groups = state.role === "owner" ? ownerNav : managerNav;
  document.querySelector("#nav").innerHTML = groups.map(([name,items]) => `<div class="nav-section">${name}</div>${items.map(([p,l])=>navButton(p,l)).join("")}`).join("");
  const quick = state.role === "owner" ? [["dashboard","首页"],["inventory","库存"],["tasks","待办"],["settlements","月结"],["settings","我的"]] : [["dashboard","今日"],["inventory","库存"],["tasks","待办"],["stocktake","盘点"],["settlements","账单"]];
  document.querySelector("#bottom-nav").innerHTML = quick.map(([p,l])=>`<button class="${state.page===p?"is-active":""}" data-nav="${p}">${l}</button>`).join("");
}

const productRows = (compact=false) => state.products.map(p => `<div class="list-row ${p.qty<=1?"is-danger":p.alert.includes("90")?"is-warning":""}">
  <div class="product-name"><strong>${p.name} ${p.weight}</strong><span>${p.sku} · ${p.expiry}</span></div>
  <div><span class="cell-label">库存</span><strong>${p.qty} 罐</strong></div>
  <div><span class="cell-label">售价</span><strong>${money(p.price)}</strong></div>
  <div><span class="cell-label">当前标签</span><span class="status ${p.discount!=="正价"?"warning":""}">${p.discount}</span></div>
  <button class="button small secondary" data-nav="${compact?"inventory":"productDetail"}">查看</button>
</div>`).join("");

function ownerDashboard(){ return `
  <div class="hero">
    <section class="hero-panel">
      <span class="status">2026年9月</span>
      <div class="hero-number">MOP 6,821</div>
      <strong>预计本月应收</strong>
      <p>已扣除咖啡店 5% 佣金。销售仍可继续，月末会按时间戳自动封存本月账单。</p>
      <div class="hero-actions"><button class="button primary" data-nav="settlementDetail">查看月结</button><button class="button secondary" data-nav="stockin">登记入库</button></div>
    </section>
    <section class="card">
      <h2>需要你处理</h2>
      <div class="timeline">
        <div class="timeline-item"><strong>五十铃 40g 库存仅剩 1 罐</strong><span>仅提醒老板 · 刚刚</span></div>
        <div class="timeline-item"><strong>青岚 40g 进入 90 天折扣期</strong><span>负责人需放置 9 折标签</span></div>
        <div class="timeline-item"><strong>预售订单 PO-0918-03 已付款</strong><span>需要准备订货 · 预计 7–14 天</span></div>
      </div>
    </section>
  </div>
  <div class="grid cols-4">
    <div class="metric"><span>本月售出</span><strong>27 罐</strong><small>正价 21 · 临期 6</small></div>
    <div class="metric"><span>折扣让利</span><strong>MOP 394</strong><small>不含佣金</small></div>
    <div class="metric"><span>咖啡店佣金</span><strong>MOP 359</strong><small>实际销售额的 5%</small></div>
    <div class="metric"><span>预计毛利</span><strong>MOP 2,366</strong><small>销售额 − 佣金 − 采购成本 − 运费</small></div>
  </div>
  <div class="section-head"><div><h2>库存概况</h2><p>总库存按产品汇总，批次在详情内按赏味期限展开。</p></div><button class="button secondary" data-nav="inventory">全部库存</button></div>
  <div class="list">${productRows(true)}</div>`; }

function managerDashboard(){ return `
  <div class="hero">
    <section class="hero-panel">
      <span class="status">Cafe A</span>
      <div class="hero-number">3 项</div>
      <strong>今天需要处理</strong>
      <p>这里只保留影响销售、价格或顾客取货的事项。未处理 24 小时后只再提醒一次。</p>
      <div class="hero-actions"><button class="button primary" data-nav="tasks">开始处理</button><button class="button secondary" data-nav="preorderAvailability">查询能否预售</button></div>
    </section>
    <section class="card">
      <h2>重要提醒</h2>
      <div class="timeline">
        <div class="timeline-item"><strong>青岚 40g：放置 9 折标签</strong><span>今天开始 · 原价 MOP 240</span></div>
        <div class="timeline-item"><strong>预售订单到货</strong><span>请联系示例顾客 XXXX XXXX</span></div>
        <div class="timeline-item"><strong>五十铃旧批次已售完</strong><span>确认货架后，把 POS 售价改为 MOP 320</span></div>
      </div>
    </section>
  </div>
  <div class="grid cols-3">
    <button class="card" data-nav="preorderAvailability"><h3>下单前查预售</h3><p class="subtle">确认产品是否可订及预计到货时间</p></button>
    <button class="card" data-nav="manualSale"><h3>手动记录销售</h3><p class="subtle">仅在 POS 自动同步不可用时使用</p></button>
    <button class="card" data-nav="inventory"><h3>查看价格标签</h3><p class="subtle">查看当前应展示的原价或临期折扣</p></button>
  </div>`; }

function inventory(){ return `
  <div class="toolbar"><button class="button dark" data-nav="stockin">+ 入库</button><button class="button secondary" data-nav="manualSale">手动销售</button><button class="button secondary" data-nav="stocktake">开始盘点</button></div>
  ${state.role==="owner"?`<div class="notice">五十铃 40g 总库存为 1，已触发老板低库存提醒。负责人不会收到这条提醒。</div>`:""}
  <div class="section-head"><div><h2>在店库存</h2><p>数量按批次 FEFO 扣减。实体货架也应把最早到期批次放在前面。</p></div></div>
  <div class="list">${state.products.map(p=>`<div class="list-row ${p.qty<=1?"is-danger":p.discount!=="正价"?"is-warning":""}">
    <div class="product-name"><strong>${p.name} ${p.weight}</strong><span>${p.expiry} · ${p.sku}</span></div>
    <div><span class="cell-label">可售</span><strong>${p.qty} 罐</strong></div>
    <div><span class="cell-label">当前价格</span><strong>${money(p.discount==="9折"?p.price*.9:p.price)}</strong></div>
    <div><span class="cell-label">标签</span><span class="status ${p.discount!=="正价"?"warning":""}">${p.discount}</span></div>
    <button class="button small secondary" data-nav="batchDetail">批次</button>
  </div>`).join("")}</div>`; }

function products(){ return `
  <div class="toolbar"><button class="button dark" data-action="new-product">+ 新增产品</button><button class="button secondary" data-nav="preorderAvailability">预售设置</button></div>
  <div class="card table-wrap"><table><thead><tr><th>产品</th><th>SKU</th><th>规格</th><th>默认售价</th><th>默认采购成本</th><th>预售</th><th></th></tr></thead><tbody>
  ${state.products.map((p,i)=>`<tr><td><strong>${p.name}</strong></td><td>${p.sku}</td><td>${p.weight}</td><td>${money(p.price)}</td><td>${money(p.cost)}</td><td>${i===3?"7–14天":"可切换"}</td><td><button class="button small secondary" data-nav="productDetail">编辑</button></td></tr>`).join("")}
  </tbody></table></div>
  <p class="subtle">新批次会默认带出上一次采购成本和售价；本次运费单独填写并分摊。修改后只影响新批次，不改写历史。</p>`; }

function productDetail(){ return `
  <div class="grid cols-2">
    <section class="card"><h2>五十铃 40g</h2><p class="subtle">AA-ISUZU-40G</p><div class="form-grid">
      <div class="field"><label>品牌</label><input value="丸久小山园"></div><div class="field"><label>规格</label><input value="40g"></div>
      <div class="field"><label>默认采购成本</label><input value="188.00"></div><div class="field"><label>默认售价</label><input value="320.00"></div>
      <div class="field full"><label>负责人查询时显示</label><select><option>可预售 7–14天</option><option>可预售 14–21天</option><option>暂时缺货</option><option>咨询老板</option></select></div>
    </div><div class="summary-bar"><button class="button dark" data-action="save">保存</button><button class="button secondary" data-nav="products">返回</button></div></section>
    <section class="card"><h2>价格与批次</h2><div class="timeline">
      <div class="timeline-item"><strong>2027-01-31 · MOP 300</strong><span>剩余 1 罐 · 到货成本 MOP 184（含运费 4）</span></div>
      <div class="timeline-item"><strong>2027-04-28 · MOP 320</strong><span>待上架 6 罐 · 到货成本 MOP 193（含运费 5）</span></div>
    </div><div class="notice info" style="margin-top:18px">旧批次售完后才生成改价任务。不会在剩余 1 罐时打扰负责人。</div></section>
  </div>`; }

function batchDetail(){ return `
  <div class="grid cols-2">
    <section class="card"><h2>青岚 40g 批次</h2><div class="receipt-row"><span>赏味期限</span><strong>2027-02-08</strong></div><div class="receipt-row"><span>收货数量</span><strong>8 罐</strong></div><div class="receipt-row"><span>当前库存</span><strong>5 罐</strong></div><div class="receipt-row"><span>包装瑕疵</span><strong>1 罐</strong></div><div class="receipt-row"><span>采购单价</span><strong>MOP 142</strong></div><div class="receipt-row"><span>单位分摊运费</span><strong>MOP 4</strong></div><div class="receipt-row"><span>到货成本</span><strong>MOP 146</strong></div><div class="receipt-row"><span>原价</span><strong>MOP 240</strong></div></section>
    <section class="card"><h2>当前销售规则</h2><p><span class="status warning">90天内 · 9折</span></p><p>临期产品不参与“正价商品两件或以上 95 折”。若同一罐同时属于包装瑕疵与临期，只使用折后价格更低的一项，不叠加。</p><button class="button secondary" data-action="mark-defect">标记包装瑕疵数量</button></section>
  </div>
  <div class="section-head"><div><h2>批次流水</h2><p>所有增减都保留前后数量与操作来源。</p></div></div>
  <div class="card table-wrap"><table><thead><tr><th>时间</th><th>类型</th><th>数量</th><th>变更</th><th>来源</th></tr></thead><tbody><tr><td>09-18 14:35</td><td>POS销售</td><td>-1</td><td>6 → 5</td><td>#8271</td></tr><tr><td>09-12 10:20</td><td>包装瑕疵标记</td><td>1</td><td>正常 → 瑕疵</td><td>老板</td></tr><tr><td>09-01 09:02</td><td>入库</td><td>+8</td><td>0 → 8</td><td>DN-0901</td></tr></tbody></table></div>`; }

function stockin(){ return `
  <div class="grid cols-2">
    <section class="card"><h2>登记送货</h2><div class="form-grid">
      <div class="field full"><label>产品</label><select><option>五十铃 40g</option><option>青岚 40g</option><option>若竹 40g</option></select></div>
      <div class="field"><label>赏味期限</label><input type="date" value="2027-04-28"></div><div class="field"><label>数量</label><input type="number" value="6"></div>
      <div class="field"><label>采购单价 MOP</label><input value="188.00"></div><div class="field"><label>原售价 MOP</label><input value="320.00"></div>
      <div class="field"><label>本次送货总运费 MOP</label><input value="30.00"></div><div class="field"><label>运费分摊方式</label><select><option>按罐数自动分摊</option><option>手动分摊</option></select></div>
      <div class="field full"><label>备注</label><textarea placeholder="可选，例如本批次新包装"></textarea></div>
    </div><div class="notice info" style="margin-top:16px">采购成本与售价已带出上一次入库值；本次运费会分摊进每罐到货成本。包装费和其他杂费暂不记录。</div><div class="summary-bar"><button class="button dark" data-action="submit-stockin">提交给负责人确认收货</button></div></section>
    <section class="card"><h2>收货确认预览</h2><div class="receipt-row"><span>五十铃 40g</span><strong>6 罐</strong></div><div class="receipt-row"><span>赏味期限</span><strong>2027-04-28</strong></div><div class="receipt-row"><span>货架原价</span><strong>MOP 320</strong></div><p class="subtle">负责人确认数量后才计入在店库存。系统同时保留 store_id，未来新增门店无需重构核心数据。</p></section>
  </div>`; }

function ledger(){ return `
  <div class="toolbar"><select class="button secondary"><option>全部类型</option><option>入库</option><option>POS销售</option><option>手动销售</option><option>盘点调整</option><option>取回未售商品</option><option>到期下架</option><option>管理员错误更正</option></select><button class="button secondary" data-action="export">导出 Excel</button></div>
  <div class="card table-wrap"><table><thead><tr><th>时间</th><th>产品批次</th><th>类型</th><th>数量</th><th>前后库存</th><th>来源或原因</th></tr></thead><tbody>
  <tr><td>09-19 15:08</td><td>五十铃 40g<br><span class="subtle">2027-01-31</span></td><td>POS销售</td><td>-1</td><td>2 → 1</td><td>Order #8292</td></tr>
  <tr><td>09-19 10:22</td><td>若竹 40g<br><span class="subtle">2027-04-28</span></td><td>手动销售</td><td>-1</td><td>5 → 4</td><td>POS断线备用</td></tr>
  <tr><td>09-18 19:50</td><td>青岚 40g<br><span class="subtle">2027-02-08</span></td><td>盘点调整</td><td>-1</td><td>6 → 5</td><td>实盘差异</td></tr>
  </tbody></table></div>`; }

function tasks(){ return `
  <div class="grid cols-3"><div class="metric"><span>待处理</span><strong>3</strong><small>24小时后再提醒一次</small></div><div class="metric"><span>今日完成</span><strong>2</strong><small>已留操作记录</small></div><div class="metric"><span>逾期</span><strong>0</strong><small>没有未完成事项</small></div></div>
  <div class="section-head"><div><h2>重要任务</h2><p>不发送日常噪音，只保留必须影响门店操作的事项。</p></div></div>
  <div class="list">
    <div class="list-row is-warning"><div class="product-name"><strong>放置 9 折标签</strong><span>青岚 40g · 2027-02-08 · 今天起</span></div><div><span class="cell-label">负责人</span><strong>Cafe A</strong></div><div><span class="status warning">待处理</span></div><div>—</div><button class="button small dark" data-nav="taskDetail">处理</button></div>
    <div class="list-row"><div class="product-name"><strong>旧批次售完，切换售价</strong><span>五十铃 40g · POS改为 MOP 320</span></div><div><span class="cell-label">负责人</span><strong>Cafe A</strong></div><div><span class="status">待确认</span></div><div>—</div><button class="button small dark" data-nav="taskDetail">处理</button></div>
    <div class="list-row"><div class="product-name"><strong>预售已到货，联系顾客</strong><span>PO-0918-03 · 陈小姐</span></div><div><span class="cell-label">到货</span><strong>09-19</strong></div><div><span class="status blue">待通知</span></div><div>—</div><button class="button small dark" data-nav="preorderDetail">处理</button></div>
  </div>`; }

function taskDetail(){ return `
  <div class="grid cols-2"><section class="card"><span class="status warning">临期折扣任务</span><h2 style="margin-top:12px">青岚 40g 放置 9 折标签</h2><p>批次赏味期限为 2027-02-08，已进入剩余 61–90 天区间。</p><div class="receipt-row"><span>原价</span><strong>MOP 240</strong></div><div class="receipt-row"><span>现价</span><strong>MOP 216</strong></div><div class="receipt-row"><span>标签文字</span><strong>赏味期限优惠 9折</strong></div><div class="summary-bar"><button class="button dark" data-action="complete-task">已放置标签</button><button class="button secondary" data-nav="tasks">稍后处理</button></div></section>
  <section class="card"><h2>规则说明</h2><p>临期产品不参加正价商品两件或以上 95 折。标签只放在产品旁边，罐身原价贴纸无需更换。</p><div class="notice">如果任务未完成，系统会在 24 小时后再提醒一次，之后不持续轰炸。</div></section></div>`; }

function preorderAvailability(){ return `
  <div class="notice info"><strong>所有产品都必须先查再收款。</strong> 只有这里显示“可预售”时，负责人才能在 POS 选择对应的 AA-PRE- 商品并收全款。</div>
  <div class="section-head"><div><h2>当前预售状态</h2><p>没有任何产品会自动放行。40g、100g 也必须先查询；1kg 默认咨询老板。</p></div></div>
  <div class="list">
    <div class="list-row"><div class="product-name"><strong>五十铃 40g</strong><span>AA-PRE-ISUZU-40G</span></div><div><span class="status">可预售</span></div><div><strong>7–14天</strong></div><div><strong>MOP 320</strong></div><button class="button small secondary" data-action="copy-sku">复制SKU</button></div>
    <div class="list-row"><div class="product-name"><strong>青岚 40g</strong><span>AA-PRE-AOARASHI-40G</span></div><div><span class="status warning">可预售</span></div><div><strong>14–21天</strong></div><div><strong>MOP 240</strong></div><button class="button small secondary" data-action="copy-sku">复制SKU</button></div>
    <div class="list-row is-danger"><div class="product-name"><strong>若竹 100g</strong><span>AA-PRE-WAKATAKE-100G</span></div><div><span class="status danger">暂时缺货</span></div><div><strong>不可收款</strong></div><div>—</div><button class="button small secondary" disabled>暂停</button></div>
    <div class="list-row"><div class="product-name"><strong>五十铃 1kg</strong><span>不设常规预售SKU</span></div><div><span class="status blue">咨询老板</span></div><div><strong>确认后才可下单</strong></div><div>—</div><button class="button small secondary" data-action="contact-owner">联系</button></div>
  </div>`; }

function preorders(){ return `
  <div class="toolbar"><button class="button dark" data-nav="preorderAvailability">预售状态</button><button class="button secondary" data-action="manual-preorder">补录预售</button></div>
  <div class="grid cols-4"><div class="metric"><span>已付款待订货</span><strong>2</strong></div><div class="metric"><span>订货中</span><strong>3</strong></div><div class="metric"><span>已到店待通知</span><strong>1</strong></div><div class="metric"><span>待取货</span><strong>2</strong></div></div>
  <div class="section-head"><div><h2>预售订单</h2><p>负责人查询确认后建立的 POS 预售不扣现货库存；到货后建立预售专用库存并绑定订单。</p></div></div>
  <div class="list">
    <div class="list-row"><div class="product-name"><strong>PO-0918-03 · 五十铃 40g</strong><span>POS #8290 · 已收全款 MOP 320</span></div><div><span class="cell-label">顾客</span><strong>陈小姐</strong></div><div><span class="cell-label">预计</span><strong>7–14天</strong></div><div><span class="status blue">已到店</span></div><button class="button small dark" data-nav="preorderDetail">查看</button></div>
    <div class="list-row"><div class="product-name"><strong>PO-0919-01 · 青岚 40g</strong><span>POS #8297 · 已收全款 MOP 240</span></div><div><span class="cell-label">顾客</span><strong>未填</strong></div><div><span class="cell-label">预计</span><strong>14–21天</strong></div><div><span class="status warning">待补联系方式</span></div><button class="button small dark" data-nav="preorderDetail">补充</button></div>
  </div>`; }

function preorderDetail(){ return `
  <div class="grid cols-2"><section class="card"><span class="status blue">已到店 · 待通知</span><h2 style="margin-top:12px">PO-0918-03</h2><div class="receipt-row"><span>产品</span><strong>五十铃 40g × 1</strong></div><div class="receipt-row"><span>已付款</span><strong>MOP 320</strong></div><div class="receipt-row"><span>POS订单</span><strong>#8290</strong></div><div class="receipt-row"><span>顾客</span><strong>示例顾客</strong></div><div class="receipt-row"><span>电话</span><strong>XXXX XXXX</strong></div><div class="summary-bar"><button class="button dark" data-action="customer-notified">已通知顾客</button><button class="button secondary" data-action="picked-up">已取货</button></div></section>
  <section class="card"><h2>处理记录</h2><div class="timeline"><div class="timeline-item"><strong>货物送达 Cafe A</strong><span>09-19 13:20 · 老板更新</span></div><div class="timeline-item"><strong>已绑定到货批次</strong><span>2027-06-30 · 到货成本 MOP 190（已含运费）</span></div><div class="timeline-item"><strong>POS 收到全款</strong><span>09-18 16:44 · Webhook</span></div></div><div class="notice info" style="margin-top:18px">如 POS 不回传备注，负责人可在这里手动补录电话或微信。</div></section></div>`; }

function stocktake(){ return state.stocktakeStarted ? stocktakeForm() : `
  <div class="hero"><section class="hero-panel"><span class="status">2026年9月盘点</span><div class="hero-number">09-30</div><strong>固定窗口：关店后或次月开店前</strong><p>可在9月30日关店后，或10月1日开店前开始。开始时系统会固定库存快照；窗口内原则上不再销售。</p><div class="hero-actions"><button class="button primary" data-action="start-stocktake">确认已关店并开始盘点</button></div></section><section class="card"><h2>账期和付款</h2><p>9月账单按9月30日23:59:59自动截止。10月销售进入10月账单；本次盘点最晚在10月1日开店前完成，付款期限为10月3日。</p><div class="notice success">若盘点中仍收到 POS 销售，受影响产品会自动标记“需要重数”。</div></section></div>`; }

function stocktakeForm(){ return `
  <div class="notice info">快照时间：2026-09-30 21:35。五十铃 40g 在盘点后发生了 1 笔 POS 销售，需要重新确认。</div>
  <section class="card" style="margin-top:16px"><div class="section-head"><div><h2>逐项确认</h2><p>数量正确就勾选；不正确则填实际数量和原因。</p></div><span class="status">2 / 4 已确认</span></div>
    <div class="check-row"><input type="checkbox" checked aria-label="确认青岚"><div><strong>青岚 40g</strong><span class="subtle">2027-02-08</span></div><strong>系统 5</strong><input type="number" value="5"><span class="status">正确</span></div>
    <div class="check-row"><input type="checkbox" aria-label="确认五十铃"><div><strong>五十铃 40g</strong><span class="subtle">2027-01-31</span></div><strong>系统 1</strong><input type="number" value="1"><span class="status warning">请重数</span></div>
    <div class="check-row"><input type="checkbox" checked aria-label="确认若竹"><div><strong>若竹 40g</strong><span class="subtle">2027-04-28</span></div><strong>系统 4</strong><input type="number" value="4"><span class="status">正确</span></div>
    <div class="check-row"><input type="checkbox" aria-label="确认五十铃100"><div><strong>五十铃 100g</strong><span class="subtle">无现货</span></div><strong>系统 0</strong><input type="number" value="0"><span class="status">待确认</span></div>
    <div class="field" style="margin-top:16px"><label>差异原因（有差异时必填）</label><select><option>请选择</option><option>漏记销售</option><option>取回未登记</option><option>管理员错误更正</option></select></div>
    <div class="summary-bar"><span>全部确认后将生成盘点调整流水</span><button class="button dark" data-action="confirm-stocktake">确认整张盘点表</button></div>
  </section>`; }

function settlements(){ return `
  <div class="grid cols-3"><div class="metric"><span>待咖啡店确认</span><strong>1 期</strong><small>2026年9月</small></div><div class="metric"><span>待付款</span><strong>MOP 6,821</strong><small>10月3日前</small></div><div class="metric"><span>今年已收</span><strong>MOP 48,390</strong><small>8期已结清</small></div></div>
  <div class="section-head"><div><h2>历史账单</h2><p>双方都可查询；咖啡店端不显示成本与利润。</p></div></div>
  <div class="card table-wrap"><table><thead><tr><th>月份</th><th>实际销售额</th><th>佣金 5%</th><th>应付</th><th>状态</th><th></th></tr></thead><tbody>
    <tr><td>2026年9月</td><td>MOP 7,180</td><td>MOP 359</td><td class="money">MOP 6,821</td><td><span class="status warning">待盘点确认</span></td><td><button class="button small dark" data-nav="settlementDetail">查看</button></td></tr>
    <tr><td>2026年8月</td><td>MOP 6,420</td><td>MOP 321</td><td class="money">MOP 6,099</td><td><span class="status">已结清</span></td><td><button class="button small secondary" data-nav="settlementDetail">查看</button></td></tr>
    <tr><td>2026年7月</td><td>MOP 5,980</td><td>MOP 299</td><td class="money">MOP 5,681</td><td><span class="status">已结清</span></td><td><button class="button small secondary" data-nav="settlementDetail">查看</button></td></tr>
  </tbody></table></div>`; }

function settlementDetail(){ const owner = state.role === "owner"; return `
  <section class="card receipt"><div class="receipt-head"><p class="eyebrow">SEPTEMBER CONSIGNMENT STATEMENT</p><h2>2026年9月寄售结算单</h2><p class="subtle">销售截止：2026-09-30 23:59:59 · Cafe A</p></div>
  <div class="table-wrap"><table><thead><tr><th>产品</th><th>数量</th><th>原价金额</th><th>优惠</th><th>实际销售额</th></tr></thead><tbody><tr><td>五十铃 40g</td><td>10</td><td>3,080</td><td>-120</td><td>2,960</td></tr><tr><td>青岚 40g</td><td>9</td><td>2,160</td><td>-216</td><td>1,944</td></tr><tr><td>若竹 40g</td><td>8</td><td>2,080</td><td>-104</td><td>1,976</td></tr><tr><td>预售</td><td>1</td><td>300</td><td>0</td><td>300</td></tr></tbody></table></div>
  <div class="receipt-row"><span>原价销售额</span><strong>MOP 7,620</strong></div><div class="receipt-row"><span>优惠总额</span><strong>- MOP 440</strong></div><div class="receipt-row"><span>实际销售额</span><strong>MOP 7,180</strong></div><div class="receipt-row"><span>咖啡店佣金 5%</span><strong>- MOP 359</strong></div><div class="receipt-row receipt-total"><span>应付给货主</span><strong>MOP 6,821</strong></div>
  ${owner?`<div class="notice info" style="margin-top:18px">老板端附加数据：采购成本 MOP 3,926；分摊运费 MOP 120；到货成本 MOP 4,046；预计毛利 MOP 2,775。咖啡店端不会显示。</div>`:""}
  <div class="summary-bar"><button class="button secondary" data-action="download-statement">导出PDF</button><button class="button dark" data-nav="payment">${state.role==="manager"?"确认账单并去付款":"查看付款状态"}</button></div></section>`; }

function payment(){ return `
  <div class="grid cols-2"><section class="card"><span class="status warning">待转账</span><h2 style="margin-top:12px">应付 MOP 6,821</h2><p>请在 2026年10月3日前，通过 MPay 转账。小程序不会直接打开或控制 MPay。</p><div class="receipt-row"><span>收款人</span><strong>收款人姓名（示例）</strong></div><div class="receipt-row"><span>MPay注册手机号</span><strong>XXXX XXXX</strong></div><div class="summary-bar"><button class="button secondary" data-action="copy-phone">复制手机号</button><button class="button dark" data-action="mark-paid">我已转账</button></div></section>
  <section class="card"><h2>付款凭证</h2><div class="field"><label>转账参考号</label><input placeholder="可选"></div><div class="field" style="margin-top:14px"><label>上传截图</label><input type="file" accept="image/*"></div><div class="notice info" style="margin-top:16px">若10月3日仍未付款，系统当天提醒一次；10月5日仍未付款再提醒最后一次。之后由老板通过微信联系。负责人标记已付款后，提醒立即停止。</div></section></div>`; }

function reports(){ return `
  <div class="toolbar"><select class="button secondary"><option>2026年</option><option>2025年</option></select><button class="button secondary" data-action="export">导出年度Excel</button><button class="button secondary" data-action="download-report">导出PDF</button></div>
  <div class="grid cols-4"><div class="metric"><span>实际销售额</span><strong>MOP 52,884</strong><small>原价 MOP 55,160</small></div><div class="metric"><span>优惠总额</span><strong>MOP 2,276</strong><small>临期 1,662 · 多件 494 · 瑕疵 120</small></div><div class="metric"><span>佣金</span><strong>MOP 2,644</strong><small>实际销售额的 5%</small></div><div class="metric"><span>毛利</span><strong>MOP 18,441</strong><small>已扣采购成本和分摊运费</small></div></div>
  <div class="grid cols-2" style="margin-top:16px"><section class="card"><h2>月度毛利</h2><div class="spark-bars" aria-label="1月至9月毛利柱状图"><div style="height:48%"></div><div style="height:55%"></div><div style="height:44%"></div><div style="height:72%"></div><div style="height:67%"></div><div style="height:80%"></div><div style="height:74%"></div><div style="height:88%"></div><div style="height:96%"></div></div><div class="legend"><span><i></i>每月毛利</span><span>1月—9月</span></div></section>
  <section class="card"><h2>产品表现</h2><div class="receipt-row"><span>五十铃 40g</span><strong>86罐 · 毛利 MOP 9,422</strong></div><div class="receipt-row"><span>青岚 40g</span><strong>62罐 · 毛利 MOP 5,106</strong></div><div class="receipt-row"><span>若竹 40g</span><strong>49罐 · 毛利 MOP 3,783</strong></div><div class="receipt-row"><span>预售订单</span><strong>12单 · 毛利 MOP 630</strong></div></section></div>
  <div class="notice info" style="margin-top:16px">利润按每笔销售的到货成本快照计算：实际销售额 − 咖啡店佣金 − 采购成本 − 分摊运费。包装费和其他杂费暂不纳入；后续改价或改成本不会改写历史。</div>`; }

function announcements(){ return `
  <div class="toolbar">${state.role==="owner"?`<button class="button dark" data-nav="announcementNew">+ 发布公告</button>`:""}<button class="button secondary" data-action="filter-unread">只看未读</button></div>
  <div class="list">
    <div class="list-row is-warning"><div class="product-name"><strong>丸久小山园将更换外包装</strong><span>影响：五十铃、青岚 · 2026-11-01 起</span></div><div><span class="status warning">重要</span></div><div><strong>未读</strong></div><div>09-19</div><button class="button small dark" data-nav="announcementDetail">查看</button></div>
    <div class="list-row"><div class="product-name"><strong>预计后半年部分产品调价</strong><span>最终价格确认后再生成 POS 改价任务</span></div><div><span class="status blue">一般</span></div><div><strong>已读</strong></div><div>08-02</div><button class="button small secondary" data-nav="announcementDetail">查看</button></div>
  </div>`; }

function announcementDetail(){ return `
  <section class="card"><span class="status warning">重要公告</span><h2 style="margin-top:12px">丸久小山园将更换外包装</h2><p class="subtle">发布于 2026-09-19 · 预计生效 2026-11-01</p><p>供应商品牌通知，五十铃与青岚将逐步换用新包装。产品内容、规格与售价目前不变。新旧包装可能同时在店，请按赏味期限顺序销售。</p><div class="receipt-row"><span>影响品牌</span><strong>丸久小山园</strong></div><div class="receipt-row"><span>影响产品</span><strong>五十铃、青岚</strong></div><div class="summary-bar"><button class="button dark" data-action="mark-read">我已阅读</button><button class="button secondary" data-nav="announcements">返回</button></div></section>`; }

function announcementNew(){ return `
  <section class="card"><h2>发布公告</h2><div class="form-grid" style="margin-top:16px"><div class="field full"><label>标题</label><input placeholder="例如：品牌将更换包装"></div><div class="field"><label>重要程度</label><select><option>一般</option><option>重要，需要确认已读</option></select></div><div class="field"><label>生效日期</label><input type="date"></div><div class="field full"><label>影响品牌或产品</label><input placeholder="可多选"></div><div class="field full"><label>内容</label><textarea placeholder="说明变化和负责人需要知道的事项"></textarea></div></div><div class="summary-bar"><span class="subtle">重要公告未读 24 小时后只提醒一次。</span><button class="button dark" data-action="publish-announcement">发布</button></div></section>`; }

function manualSale(){ return `
  <div class="notice">仅在 POS 自动同步不可用或漏单时使用。恢复同步前请按 POS 订单号核对，避免重复扣库存。</div>
  <section class="card" style="margin-top:16px"><h2>记录一笔销售</h2><div class="form-grid" style="margin-top:16px"><div class="field full"><label>产品</label><select><option>五十铃 40g · 正价 MOP 300</option><option>青岚 40g · 临期9折 MOP 216</option><option>若竹 40g · 正价 MOP 260</option></select></div><div class="field"><label>数量</label><input type="number" value="1"></div><div class="field"><label>折扣类型</label><select><option>正价</option><option>正价商品两件或以上 95折</option><option>包装瑕疵 95折</option><option>临期 9折</option><option>临期 85折</option><option>临期 8折</option></select></div><div class="field"><label>POS订单号</label><input placeholder="例如 8298"></div><div class="field"><label>实际收款</label><input value="300.00"></div><div class="field full"><label>原因</label><input value="POS自动同步暂不可用"></div></div><div class="summary-bar"><button class="button dark" data-action="submit-manual-sale">确认并扣最早到期批次</button></div></section>`; }

function pos(){ return `
  <div class="grid cols-3"><div class="metric"><span>POS系统</span><strong>待确认</strong><small>不阻塞其他开发</small></div><div class="metric"><span>自动同步</span><strong>模拟模式</strong><small>Webhook Adapter v0</small></div><div class="metric"><span>手动备用</span><strong>可用</strong><small>需填写订单号</small></div></div>
  <div class="grid cols-2" style="margin-top:16px"><section class="card"><h2>模拟 Webhook</h2><p class="subtle">只保留 AA- 或 AA-PRE- 商品；其他商品不入库。</p><div class="code">{
  "event_id": "evt-demo-${String(state.webhookCount+1).padStart(3,"0")}",
  "type": "order.paid",
  "order_id": "8301",
  "items": [{"sku":"AA-ISUZU-40G","qty":1}]
}</div><div class="summary-bar"><button class="button dark" data-action="send-webhook">发送模拟销售</button><button class="button secondary" data-nav="manualSale">手动备用</button></div></section>
  <section class="card"><h2>适配器要求</h2><div class="setting-row"><div><strong>幂等处理</strong><p>同一 event_id 或订单行不会重复扣货</p></div><span class="status">必须</span></div><div class="setting-row"><div><strong>只读权限</strong><p>只读取商品、已付款订单和预售订单</p></div><span class="status">必须</span></div><div class="setting-row"><div><strong>最小化保存</strong><p>非 AA- 商品立即丢弃，不保存顾客资料</p></div><span class="status">必须</span></div></section></div>
  <div class="section-head"><div><h2>最近事件</h2><p>重复事件会标记为忽略。</p></div></div><div class="card table-wrap"><table><thead><tr><th>事件</th><th>订单</th><th>SKU</th><th>结果</th></tr></thead><tbody><tr><td>evt-8271</td><td>#8271</td><td>AA-AOARASHI-40G ×1</td><td><span class="status">已处理</span></td></tr><tr><td>evt-8271</td><td>#8271</td><td>AA-AOARASHI-40G ×1</td><td><span class="status blue">重复忽略</span></td></tr><tr><td>evt-8290</td><td>#8290</td><td>AA-PRE-ISUZU-40G ×1</td><td><span class="status">已建预售</span></td></tr></tbody></table></div>`; }

function settings(){ return `
  <div class="grid cols-2"><section class="card"><h2>销售与折扣规则</h2><div class="setting-row"><div><strong>咖啡店佣金</strong><p>按实际销售额计算</p></div><strong>5%</strong></div><div class="setting-row"><div><strong>正价商品两件或以上</strong><p>相同或不同正价商品均适用</p></div><strong>95折</strong></div><div class="setting-row"><div><strong>临期 61–90天</strong></div><strong>9折</strong></div><div class="setting-row"><div><strong>临期 31–60天</strong></div><strong>85折</strong></div><div class="setting-row"><div><strong>临期 1–30天</strong></div><strong>8折</strong></div><div class="setting-row"><div><strong>优惠叠加</strong><p>同一件商品只取一个折扣</p></div><button class="toggle" aria-label="优惠叠加关闭"></button></div></section>
  <section class="card"><h2>提醒与付款</h2><div class="setting-row"><div><strong>老板低库存提醒</strong><p>产品总库存小于或等于 1</p></div><button class="toggle on" aria-label="低库存提醒开启"></button></div><div class="setting-row"><div><strong>普通未处理任务</strong><p>创建时提醒，24小时后再提醒一次</p></div><button class="toggle on" aria-label="任务提醒开启"></button></div><div class="setting-row"><div><strong>月结付款期限</strong><p>3日未付提醒；5日最后提醒；之后老板微信沟通</p></div><strong>次月3日</strong></div><div class="setting-row"><div><strong>MPay收款人</strong><p>收款人姓名（示例） · XXXX XXXX</p></div><button class="button small secondary" data-action="edit-mpay">编辑</button></div></section></div>
  <div class="section-head"><div><h2>账号与门店</h2><p>当前只有老板与咖啡店负责人。数据预留 store_id，但界面保持单店。</p></div></div><div class="card"><div class="setting-row"><div><strong>老板</strong><p>完整管理、成本利润、确认收款</p></div><span class="status">OWNER</span></div><div class="setting-row"><div><strong>Cafe A 负责人</strong><p>库存确认、任务、预售、盘点、账单付款</p></div><span class="status blue">MANAGER</span></div></div>`; }

const screens = {
  dashboard:()=>state.role==="owner"?ownerDashboard():managerDashboard(), inventory, products, productDetail, batchDetail, stockin, ledger, tasks, taskDetail,
  preorderAvailability, preorders, preorderDetail, stocktake, settlements, settlementDetail, payment, reports, announcements, announcementDetail, announcementNew, manualSale, pos, settings
};

function render(){
  const roleLabel = state.role === "owner" ? "老板端" : "咖啡店负责人端";
  document.querySelector("#role-label").textContent = roleLabel;
  document.querySelector("#page-title").textContent = titles[state.page] || "页面原型";
  document.querySelectorAll(".role-button").forEach(b=>b.classList.toggle("is-active", b.dataset.role===state.role));
  renderNav();
  const fn = screens[state.page] || screens.dashboard;
  document.querySelector("#screen").innerHTML = fn();
  window.scrollTo({top:0, behavior:"smooth"});
}

let toastTimer;
function toast(message){ const t=document.querySelector("#toast"); t.textContent=message; t.classList.add("show"); clearTimeout(toastTimer); toastTimer=setTimeout(()=>t.classList.remove("show"),2500); }
function go(page){ state.page=page; history.replaceState(null,"",`#${page}`); render(); }

document.addEventListener("click", e=>{
  const role=e.target.closest("[data-role]"); if(role){ state.role=role.dataset.role; state.page="dashboard"; render(); return; }
  const nav=e.target.closest("[data-nav]"); if(nav){ go(nav.dataset.nav); return; }
  const action=e.target.closest("[data-action]")?.dataset.action; if(!action) return;
  if(action==="start-stocktake"){ state.stocktakeStarted=true; render(); return; }
  if(action==="send-webhook"){ state.webhookCount++; toast("模拟事件已处理：五十铃 40g 库存扣减 1；重复事件将被忽略"); render(); return; }
  const messages={
    "submit-stockin":"送货单已发给负责人确认，确认前不计入在店库存", "save":"产品设置已保存", "mark-defect":"已打开包装瑕疵数量登记",
    "complete-task":"任务已完成并记录处理时间", "copy-sku":"预售 SKU 已复制", "contact-owner":"已生成咨询老板的微信消息",
    "customer-notified":"已记录通知时间", "picked-up":"订单已标记为顾客取货", "confirm-stocktake":"请先完成所有勾选；确认后会生成差异流水",
    "download-statement":"结算单 PDF 已生成", "copy-phone":"MPay 注册手机号已复制", "mark-paid":"已标记转账并通知老板确认收款",
    "export":"导出文件已生成", "download-report":"年度报表 PDF 已生成", "mark-read":"已记录阅读确认", "publish-announcement":"公告已发布",
    "submit-manual-sale":"已按 FEFO 扣减库存，并建立手动销售流水", "edit-mpay":"已打开 MPay 收款资料编辑", "new-product":"已打开新增产品表单",
    "manual-preorder":"已打开预售补录表单", "filter-unread":"已筛选未读公告", "profile":"已打开账号设置"
  };
  toast(messages[action] || "操作已记录");
});

window.addEventListener("hashchange",()=>{ const p=location.hash.slice(1); if(screens[p]){state.page=p;render();} });
const initial=location.hash.slice(1); if(screens[initial]) state.page=initial;
render();
