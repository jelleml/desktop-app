import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  TrendingUp,
  CalendarClock,
  Target,
  RefreshCw,
  Bitcoin,
  Coins,
  BarChart2,
  Info,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

import { useAppSelector } from '../../../app/store/hooks'
import { useBitcoinPrice } from '../../../hooks/useBitcoinPrice'
import { nodeApi } from '../../../slices/nodeApi/nodeApi.slice'
import { BuyChannelModal } from '../../../components/BuyChannelModal'
import { DcaOrderCard } from './components/DcaOrderCard'
import { CreateDcaForm } from './components/CreateDcaForm'
import { GetUsdtModal } from './components/GetUsdtModal'
import { LiquidityBar } from './components/LiquidityBar'

type Tab = 'active' | 'history'

function formatSats(sats: number): string {
  if (sats >= 1_000_000) return `${(sats / 1_000_000).toFixed(2)}M`
  if (sats >= 1_000) return `${(sats / 1_000).toFixed(1)}k`
  return sats.toLocaleString('en-US')
}

function formatUsdt(n: number): string {
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

// ── Small stat cell used inside the performance panel ──────────────────────
function PerfCell({
  label,
  value,
  sub,
  valueClass = 'text-content-primary',
}: {
  label: string
  value: string
  sub?: string
  valueClass?: string
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="text-[11px] font-medium text-content-tertiary uppercase tracking-wide truncate">
        {label}
      </span>
      <span className={`text-sm font-semibold truncate ${valueClass}`}>{value}</span>
      {sub && <span className="text-[11px] text-content-tertiary truncate">{sub}</span>}
    </div>
  )
}

// ── Modal wrapper ──────────────────────────────────────────────────────────
function CreateOrderModal({
  currentBtcPrice,
  onClose,
}: {
  currentBtcPrice?: number
  onClose: () => void
}) {
  const { t } = useTranslation()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-base/70 backdrop-blur-sm"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md bg-surface-base border border-border-subtle rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-content-primary">
              {t('dca.createOrder', 'New DCA Order')}
            </h2>
          </div>
          <button
            className="p-1.5 rounded-lg text-content-tertiary hover:text-content-primary hover:bg-surface-overlay transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Modal body */}
        <div className="p-5">
          <CreateDcaForm currentBtcPrice={currentBtcPrice} onCreated={onClose} />
        </div>
      </div>
    </div>
  )
}

export const Component = () => {
  const { t } = useTranslation()
  const [tab, setTab] = useState<Tab>('active')
  const [showModal, setShowModal] = useState(false)
  const [showGetUsdt, setShowGetUsdt] = useState(false)
  const [showGetBtc, setShowGetBtc] = useState(false)
  const [infoOpen, setInfoOpen] = useState(false)

  const orders = useAppSelector((s) => s.dca.orders)
  const { btcPrice: currentBtcPrice } = useBitcoinPrice()

  const {
    data: channelsData,
    isFetching: isChannelsFetching,
    refetch: refetchChannels,
  } = nodeApi.endpoints.listChannels.useQuery(undefined, { pollingInterval: 30_000 })

  const {
    data: assetsData,
    isFetching: isAssetsFetching,
    refetch: refetchAssets,
  } = nodeApi.endpoints.listAssets.useQuery(undefined, { pollingInterval: 60_000 })

  // ── Order stats ────────────────────────────────────────────────────────
  const activeOrders = orders.filter((o) => o.status === 'active' || o.status === 'paused')
  const doneOrders = orders.filter((o) => o.status === 'completed' || o.status === 'cancelled')
  const displayedOrders = tab === 'active' ? activeOrders : doneOrders

  const allSuccess = orders.flatMap((o) => o.executions.filter((e) => e.status === 'success'))
  const totalBuys = allSuccess.length
  const totalSats = allSuccess.reduce((s, e) => s + e.toAmountSats, 0)
  const avgPrice =
    totalBuys > 0 ? allSuccess.reduce((s, e) => s + e.priceBtcUsdt, 0) / totalBuys : undefined

  const thirtyDaysAgo = Date.now() - 30 * 24 * 3600 * 1000
  const monthlyBuys = allSuccess.filter((e) => e.timestamp >= thirtyDaysAgo).length
  const totalFeeSats = allSuccess.reduce((s, e) => s + (e.feeSats ?? 0), 0)

  const activeScheduled = activeOrders.filter((o) => o.type === 'scheduled').length
  const activePriceTarget = activeOrders.filter((o) => o.type === 'price-target').length

  // ── Balances ───────────────────────────────────────────────────────────
  const readyChannels = (channelsData?.channels ?? []).filter((ch: any) => ch.ready)

  const usdtAsset = (assetsData?.nia ?? []).find((a: any) => a.ticker === 'USDT')
  const usdtPrecision = usdtAsset?.precision ?? 6
  const usdtChannels = usdtAsset
    ? readyChannels.filter((ch: any) => ch.asset_id === usdtAsset.asset_id)
    : []

  // Derive the LSP peer pubkey from USDT channels (they always connect to the LSP)
  const lspPubkey: string | undefined = usdtChannels[0]?.peer_pubkey

  // BTC balance counts ALL ready channels to the same LSP peer
  // (both pure BTC channels and RGB/asset channels share BTC capacity with the LSP)
  const lspChannels = lspPubkey
    ? readyChannels.filter((ch: any) => ch.peer_pubkey === lspPubkey)
    : readyChannels
  const btcLnOut = lspChannels.reduce((s: number, ch: any) => s + (ch.local_balance_sat ?? 0), 0)
  const btcLnIn = lspChannels.reduce(
    (s: number, ch: any) => s + Math.round((ch.inbound_balance_msat ?? 0) / 1000),
    0
  )

  const usdtLnOut = usdtChannels.reduce(
    (s: number, ch: any) => s + (ch.asset_local_amount ?? 0) / Math.pow(10, usdtPrecision),
    0
  )
  const usdtLnIn = usdtChannels.reduce(
    (s: number, ch: any) => s + (ch.asset_remote_amount ?? 0) / Math.pow(10, usdtPrecision),
    0
  )

  const isRefreshing = isChannelsFetching || isAssetsFetching
  const handleRefresh = () => void Promise.all([refetchChannels(), refetchAssets()])

  return (
    <>
      {/* ── Create order modal ──────────────────────────────────────────── */}
      {showModal && (
        <CreateOrderModal
          currentBtcPrice={currentBtcPrice}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* ── Get USDT modal ──────────────────────────────────────────────── */}
      <GetUsdtModal
        isOpen={showGetUsdt}
        onClose={() => setShowGetUsdt(false)}
        onSuccess={() => {
          setShowGetUsdt(false)
          void Promise.all([refetchChannels(), refetchAssets()])
        }}
      />

      {/* ── Get BTC liquidity modal ─────────────────────────────────────── */}
      <BuyChannelModal
        isOpen={showGetBtc}
        onClose={() => setShowGetBtc(false)}
        onSuccess={() => {
          setShowGetBtc(false)
          void refetchChannels()
        }}
      />

      <div className="flex flex-col h-full space-y-4 max-w-4xl mx-auto w-full">

        {/* ── Stats panel ──────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

          {/* Left: Market & Balances */}
          <div className="bg-surface-raised border border-border-subtle rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wide">
                {t('dca.section.market', 'Market & Balances')}
              </span>
              <button
                className="h-6 px-2 rounded-md text-[11px] inline-flex items-center gap-1
                           border border-border-subtle bg-surface-overlay/40 text-content-tertiary
                           hover:text-content-secondary hover:border-border-default transition-colors
                           disabled:opacity-50"
                disabled={isRefreshing}
                onClick={handleRefresh}
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing
                  ? t('dca.refreshingAmounts', 'Refreshing…')
                  : t('dca.refreshAmounts', 'Refresh')}
              </button>
            </div>

            {/* BTC spot price row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bitcoin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                <span className="text-[11px] font-medium text-content-tertiary uppercase tracking-wide">
                  {t('dca.spotPrice', 'BTC Spot')}
                </span>
              </div>
              <span className="text-sm font-semibold text-content-primary">
                {currentBtcPrice ? formatPrice(currentBtcPrice) : '—'}
              </span>
            </div>

            {/* Liquidity bars */}
            <div className="space-y-3">
              {/* BTC LN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Bitcoin className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wide">
                      {t('dca.metrics.btcLnBalance', 'BTC LN')}
                    </span>
                  </div>
                  <button
                    className="h-5 px-2 rounded-md text-[10px] font-semibold inline-flex items-center gap-1
                               bg-amber-400/10 text-amber-400 border border-amber-400/25
                               hover:bg-amber-400/20 transition-colors"
                    onClick={() => setShowGetBtc(true)}
                  >
                    <Plus className="w-2.5 h-2.5" />
                    {t('dca.addBtcLiquidity', 'Add BTC')}
                  </button>
                </div>
                <LiquidityBar
                  outbound={btcLnOut}
                  inbound={btcLnIn}
                  outboundLabel={`${formatSats(btcLnOut)} sats`}
                  inboundLabel={`${formatSats(btcLnIn)} sats`}
                  outboundColor="bg-amber-400"
                  inboundColor="bg-amber-400/20"
                />
              </div>

              {/* USDT LN */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Coins className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                    <span className="text-[11px] font-semibold text-content-secondary uppercase tracking-wide">
                      {t('dca.metrics.usdtLnBalance', 'USDT LN')}
                    </span>
                  </div>
                  <button
                    className="h-5 px-2 rounded-md text-[10px] font-semibold inline-flex items-center gap-1
                               bg-emerald-400/10 text-emerald-400 border border-emerald-400/25
                               hover:bg-emerald-400/20 transition-colors"
                    onClick={() => setShowGetUsdt(true)}
                  >
                    <Plus className="w-2.5 h-2.5" />
                    {t('dca.addUsdtLiquidity', 'Add USDT')}
                  </button>
                </div>
                <LiquidityBar
                  outbound={usdtLnOut}
                  inbound={usdtLnIn}
                  outboundLabel={`${formatUsdt(usdtLnOut)} USDT`}
                  inboundLabel={`${formatUsdt(usdtLnIn)} USDT`}
                  outboundColor="bg-emerald-400"
                  inboundColor="bg-emerald-400/20"
                />
              </div>
            </div>

            {/* Active order type breakdown */}
            <div className="pt-2 border-t border-border-subtle/50 flex items-center gap-4 text-xs">
              <span className="text-content-tertiary">{t('dca.activeOrders', 'Active')}:</span>
              <span className="flex items-center gap-1 text-primary">
                <CalendarClock className="w-3 h-3" />
                <span className="font-semibold">{activeScheduled}</span>
                <span className="text-content-tertiary">{t('dca.type.scheduled', 'Sched.')}</span>
              </span>
              <span className="flex items-center gap-1 text-status-warning">
                <Target className="w-3 h-3" />
                <span className="font-semibold">{activePriceTarget}</span>
                <span className="text-content-tertiary">{t('dca.type.priceTarget', 'Target')}</span>
              </span>
            </div>
          </div>

          {/* Right: DCA Performance */}
          <div className="bg-surface-raised border border-border-subtle rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-content-tertiary" />
              <span className="text-[11px] font-semibold text-content-tertiary uppercase tracking-wide">
                {t('dca.section.performance', 'Performance')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              <PerfCell
                label={t('dca.metrics.totalOrders', 'Orders')}
                value={String(orders.length)}
                sub={`${activeOrders.length} ${t('dca.metrics.active', 'active')}`}
              />
              <PerfCell
                label={t('dca.metrics.executions', 'Total buys')}
                value={String(totalBuys)}
                valueClass="text-status-success"
              />
              <PerfCell
                label={t('dca.metrics.accumulated', 'Accumulated')}
                value={totalSats > 0 ? `${formatSats(totalSats)} sats` : '—'}
                valueClass={totalSats > 0 ? 'text-primary' : 'text-content-primary'}
                sub={totalFeeSats > 0 ? `fees ${formatSats(totalFeeSats)} sats` : undefined}
              />
              <PerfCell
                label={t('dca.metrics.monthlyBuys', 'Last 30 days')}
                value={`${monthlyBuys} ${monthlyBuys === 1 ? 'buy' : 'buys'}`}
                sub={
                  avgPrice != null
                    ? `avg ${formatPrice(avgPrice)}`
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* ── Toolbar: tabs + info toggle + new order ───────────────────── */}
        <div className="flex items-center gap-2">
          {/* Tab pills */}
          <div className="flex gap-1 bg-surface-overlay/50 rounded-xl p-1">
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                          inline-flex items-center gap-1.5 ${
                tab === 'active'
                  ? 'bg-surface-elevated text-content-primary shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
              onClick={() => setTab('active')}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              {t('dca.tabs.active', 'Active')}
              <span className="text-xs text-content-tertiary">({activeOrders.length})</span>
            </button>
            <button
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                          inline-flex items-center gap-1.5 ${
                tab === 'history'
                  ? 'bg-surface-elevated text-content-primary shadow-sm'
                  : 'text-content-secondary hover:text-content-primary'
              }`}
              onClick={() => setTab('history')}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              {t('dca.tabs.history', 'History')}
              <span className="text-xs text-content-tertiary">({doneOrders.length})</span>
            </button>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Info toggle */}
          <button
            className={`h-8 w-8 rounded-xl inline-flex items-center justify-center border transition-colors ${
              infoOpen
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-surface-overlay/50 text-content-tertiary border-border-subtle hover:text-content-secondary'
            }`}
            title={t('dca.howItWorks.title', 'How DCA works')}
            onClick={() => setInfoOpen((v) => !v)}
          >
            <Info className="w-4 h-4" />
          </button>

          {/* New order */}
          <button
            className="h-8 px-3 rounded-xl bg-primary/15 text-primary border border-primary/30
                       hover:bg-primary/25 font-medium text-sm transition-all duration-200
                       active:scale-[0.97] inline-flex items-center gap-1.5"
            onClick={() => setShowModal(true)}
          >
            <Plus className="w-4 h-4" />
            {t('dca.createOrder', 'New Order')}
          </button>
        </div>

        {/* ── Collapsible info panel ────────────────────────────────────── */}
        {infoOpen && (
          <div className="bg-surface-raised border border-border-subtle rounded-xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-content-primary text-sm">
                {t('dca.howItWorks.title', 'How DCA works')}
              </span>
              <button
                className="text-content-tertiary hover:text-content-secondary"
                onClick={() => setInfoOpen(false)}
              >
                <ChevronUp className="w-4 h-4" />
              </button>
            </div>
            <p className="text-content-secondary leading-relaxed">
              {t(
                'dca.howItWorks.description',
                'DCA (Dollar-Cost Averaging) automatically buys BTC using your USDT Lightning balance. Each order executes only when your node is unlocked and the wallet is ready.'
              )}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="flex items-start gap-2.5 p-2.5 bg-primary/5 border border-primary/15 rounded-lg">
                <CalendarClock className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-content-primary mb-0.5">
                    {t('dca.type.scheduled', 'Scheduled')}
                  </p>
                  <p className="text-content-tertiary leading-relaxed">
                    {t(
                      'dca.howItWorks.scheduled',
                      'Buys at a fixed time interval — e.g. every 24h. Set the amount and interval once; the order runs automatically.'
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2.5 bg-status-warning/5 border border-status-warning/15 rounded-lg">
                <Target className="w-3.5 h-3.5 text-status-warning mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-content-primary mb-0.5">
                    {t('dca.type.priceTarget', 'Price Target')}
                  </p>
                  <p className="text-content-tertiary leading-relaxed">
                    {t(
                      'dca.howItWorks.priceTarget',
                      'Buys when BTC drops to or below a target price (e.g. −5% from now). Resets after each execution.'
                    )}
                  </p>
                </div>
              </div>
            </div>
            <p className="text-content-tertiary pt-1 border-t border-border-subtle/50">
              {t(
                'dca.howItWorks.actions',
                'Use ⚡ Execute to trigger an immediate buy, ⏸ Pause to pause auto-execution, or ✕ Cancel to move the order to history.'
              )}
            </p>
          </div>
        )}

        {/* ── Empty / collapsed hint when no info and no orders ──────────── */}
        {!infoOpen && displayedOrders.length === 0 && (
          <button
            className="flex items-center gap-2 text-xs text-content-tertiary hover:text-content-secondary
                       transition-colors self-start"
            onClick={() => setInfoOpen(true)}
          >
            <ChevronDown className="w-3.5 h-3.5" />
            {t('dca.showHowItWorks', 'How does DCA work?')}
          </button>
        )}

        {/* ── Order list ────────────────────────────────────────────────── */}
        {displayedOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 space-y-3">
            <div className="p-4 rounded-2xl bg-surface-overlay/50 text-content-tertiary">
              <TrendingUp className="w-7 h-7" />
            </div>
            <p className="text-content-secondary font-medium text-sm">
              {tab === 'active'
                ? t('dca.empty.active', 'No active DCA orders')
                : t('dca.empty.history', 'No order history yet')}
            </p>
            {tab === 'active' && (
              <button
                className="mt-1 px-4 py-2 rounded-xl bg-primary/15 text-primary border border-primary/30
                           hover:bg-primary/25 font-medium text-sm transition-all duration-200
                           active:scale-[0.97] inline-flex items-center gap-1.5"
                onClick={() => setShowModal(true)}
              >
                <Plus className="w-4 h-4" />
                {t('dca.createOrder', 'New Order')}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 overflow-y-auto pb-2">
            {displayedOrders.map((order) => (
              <DcaOrderCard
                currentBtcPrice={currentBtcPrice}
                key={order.id}
                order={order}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}
