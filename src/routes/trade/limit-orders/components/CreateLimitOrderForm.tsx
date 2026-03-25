import { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { ArrowDown, ArrowUp } from 'lucide-react'

import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks'
import { createLimitOrder } from '../../../../slices/limitOrderSlice'
import { getAssetId } from '../../../../slices/makerApi/makerApi.slice'
import { nodeApi } from '../../../../slices/nodeApi/nodeApi.slice'

interface Props {
  onCreated?: () => void
}

const EXPIRATION_OPTIONS: { label: string; value: number | null }[] = [
  { label: '1h', value: 1 * 3600 * 1000 },
  { label: '4h', value: 4 * 3600 * 1000 },
  { label: '24h', value: 24 * 3600 * 1000 },
  { label: '1w', value: 7 * 24 * 3600 * 1000 },
  { label: '30d', value: 30 * 24 * 3600 * 1000 },
  { label: 'Never', value: null },
]

export function CreateLimitOrderForm({ onCreated }: Props) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const tradingPairs = useAppSelector((s) => s.pairs.values)
  const activePairs = useMemo(
    () => tradingPairs.filter((p) => p.is_active),
    [tradingPairs]
  )

  const [selectedPairId, setSelectedPairId] = useState(activePairs[0]?.id ?? '')
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [limitPriceStr, setLimitPriceStr] = useState('')
  const [amountStr, setAmountStr] = useState('')
  const [expirationMs, setExpirationMs] = useState<number | null>(
    24 * 3600 * 1000
  )

  const selectedPair = activePairs.find((p) => p.id === selectedPairId)
  const limitPrice = parseFloat(limitPriceStr)
  const amount = parseFloat(amountStr)

  // Compute available balance for the spending asset
  const { data: channelsData } = nodeApi.endpoints.listChannels.useQuery(
    undefined,
    { pollingInterval: 30_000 }
  )
  const { data: assetsData } = nodeApi.endpoints.listAssets.useQuery(
    undefined,
    { pollingInterval: 30_000 }
  )

  const spendingAsset = useMemo(() => {
    if (!selectedPair) return null
    return side === 'buy' ? selectedPair.quote : selectedPair.base
  }, [selectedPair, side])

  const spendingBalance = useMemo(() => {
    if (!spendingAsset || !channelsData?.channels) return undefined
    const assetId = getAssetId(spendingAsset)
    const isBtc =
      spendingAsset.ticker.toUpperCase() === 'BTC' ||
      assetId.toUpperCase() === 'BTC'

    if (isBtc) {
      return channelsData.channels
        .filter((ch: any) => ch.ready)
        .reduce((sum: number, ch: any) => sum + (ch.local_balance_sat ?? 0), 0)
    }

    const precision = spendingAsset.precision ?? 6
    const factor = Math.pow(10, precision)

    // Find asset from node assets for matching by asset_id
    const nodeAsset = (assetsData?.nia ?? []).find(
      (a: any) => a.ticker === spendingAsset.ticker
    )
    const matchId = nodeAsset?.asset_id || assetId

    return channelsData.channels
      .filter((ch: any) => ch.asset_id === matchId && ch.ready)
      .reduce(
        (sum: number, ch: any) => sum + (ch.asset_local_amount ?? 0) / factor,
        0
      )
  }, [spendingAsset, channelsData, assetsData])

  // Estimated total in quote asset
  const estimatedTotal =
    amount > 0 && limitPrice > 0 ? amount * limitPrice : undefined

  // For buy: we spend quote asset → estimated total is quote amount
  // For sell: we spend base asset → amount is what we spend
  const insufficientBalance = useMemo(() => {
    if (spendingBalance === undefined || !amount || amount <= 0) return false
    if (side === 'buy' && estimatedTotal) {
      return estimatedTotal > spendingBalance
    }
    return amount > spendingBalance
  }, [spendingBalance, amount, side, estimatedTotal])

  const handleCreate = () => {
    if (!selectedPair) {
      toast.error(
        t('limitOrders.errors.noPair', 'Please select a trading pair')
      )
      return
    }
    if (!limitPrice || limitPrice <= 0) {
      toast.error(
        t('limitOrders.errors.invalidPrice', 'Please enter a valid limit price')
      )
      return
    }
    if (!amount || amount <= 0) {
      toast.error(
        t('limitOrders.errors.invalidAmount', 'Please enter a valid amount')
      )
      return
    }

    const baseAssetId = getAssetId(selectedPair.base)
    const quoteAssetId = getAssetId(selectedPair.quote)

    // Compute amountRaw based on what we're spending
    // For buy: we spend quote asset, so amountRaw = estimatedTotal in quote precision
    // For sell: we spend base asset, so amountRaw = amount in base precision
    let amountRaw: number
    if (side === 'buy') {
      const quotePrecision = selectedPair.quote.precision ?? 6
      // For BTC amounts in msats
      if (selectedPair.quote.ticker.toUpperCase() === 'BTC') {
        amountRaw = Math.round(amount * limitPrice * 1000) // msats
      } else {
        amountRaw = Math.round(
          amount * limitPrice * Math.pow(10, quotePrecision)
        )
      }
    } else {
      const basePrecision = selectedPair.base.precision ?? 8
      if (selectedPair.base.ticker.toUpperCase() === 'BTC') {
        amountRaw = Math.round(amount * 1000) // msats
      } else {
        amountRaw = Math.round(amount * Math.pow(10, basePrecision))
      }
    }

    dispatch(
      createLimitOrder({
        amount,
        amountRaw,
        baseAssetId,
        baseAssetTicker: selectedPair.base.ticker,
        expiresAt: expirationMs ? Date.now() + expirationMs : undefined,
        limitPrice,
        pairId: selectedPair.id,
        quoteAssetId,
        quoteAssetTicker: selectedPair.quote.ticker,
        side,
      })
    )

    toast.success(t('limitOrders.notifications.created', 'Limit order created'))
    onCreated?.()
  }

  return (
    <div className="space-y-4">
      {/* Trading pair selector */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1.5">
          {t('limitOrders.form.pair', 'Trading Pair')}
        </label>
        <select
          className="w-full rounded-xl border border-border-subtle bg-surface-overlay px-3 py-2.5 text-sm text-content-primary outline-none transition-colors focus:border-primary/50"
          onChange={(e) => setSelectedPairId(e.target.value)}
          value={selectedPairId}
        >
          {activePairs.length === 0 && (
            <option value="">
              {t('limitOrders.form.noPairs', 'No pairs available')}
            </option>
          )}
          {activePairs.map((pair) => (
            <option key={pair.id} value={pair.id}>
              {pair.base.ticker}/{pair.quote.ticker}
            </option>
          ))}
        </select>
      </div>

      {/* Side toggle */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1.5">
          {t('limitOrders.form.side', 'Side')}
        </label>
        <div className="flex gap-1 rounded-xl bg-surface-overlay/50 p-1">
          <button
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              side === 'buy'
                ? 'bg-emerald-400/15 text-emerald-300 shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
            onClick={() => setSide('buy')}
          >
            <ArrowDown className="h-3.5 w-3.5" />
            {t('limitOrders.side.buy', 'Buy')}
          </button>
          <button
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ${
              side === 'sell'
                ? 'bg-rose-400/15 text-rose-300 shadow-sm'
                : 'text-content-secondary hover:text-content-primary'
            }`}
            onClick={() => setSide('sell')}
          >
            <ArrowUp className="h-3.5 w-3.5" />
            {t('limitOrders.side.sell', 'Sell')}
          </button>
        </div>
      </div>

      {/* Limit price */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1.5">
          {t('limitOrders.form.limitPrice', 'Limit Price')}{' '}
          {selectedPair && (
            <span className="text-content-tertiary">
              ({selectedPair.quote.ticker} per {selectedPair.base.ticker})
            </span>
          )}
        </label>
        <input
          className="w-full rounded-xl border border-border-subtle bg-surface-overlay px-3 py-2.5 text-sm text-content-primary outline-none transition-colors focus:border-primary/50 placeholder:text-content-tertiary"
          inputMode="decimal"
          onChange={(e) => setLimitPriceStr(e.target.value)}
          placeholder="0.00"
          type="text"
          value={limitPriceStr}
        />
      </div>

      {/* Amount */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-content-secondary">
            {t('limitOrders.form.amount', 'Amount')}{' '}
            {selectedPair && (
              <span className="text-content-tertiary">
                ({selectedPair.base.ticker})
              </span>
            )}
          </label>
          {spendingBalance !== undefined && (
            <span className="text-[10px] text-content-tertiary">
              {t('limitOrders.form.available', 'Available')}:{' '}
              {typeof spendingBalance === 'number'
                ? spendingBalance.toLocaleString('en-US', {
                    maximumFractionDigits: 6,
                  })
                : '—'}{' '}
              {spendingAsset?.ticker}
            </span>
          )}
        </div>
        <input
          className={`w-full rounded-xl border bg-surface-overlay px-3 py-2.5 text-sm text-content-primary outline-none transition-colors placeholder:text-content-tertiary ${
            insufficientBalance
              ? 'border-status-danger/50 focus:border-status-danger'
              : 'border-border-subtle focus:border-primary/50'
          }`}
          inputMode="decimal"
          onChange={(e) => setAmountStr(e.target.value)}
          placeholder="0.00"
          type="text"
          value={amountStr}
        />
        {insufficientBalance && (
          <p className="mt-1 text-[11px] text-status-danger">
            {t(
              'limitOrders.errors.insufficientBalance',
              'Insufficient balance'
            )}
          </p>
        )}
      </div>

      {/* Estimated total */}
      {estimatedTotal != null && selectedPair && (
        <div className="rounded-xl border border-border-subtle bg-surface-base/40 px-3 py-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-content-secondary">
              {t('limitOrders.form.estimatedTotal', 'Estimated Total')}
            </span>
            <span className="font-semibold text-content-primary">
              {estimatedTotal.toLocaleString('en-US', {
                maximumFractionDigits: 6,
              })}{' '}
              {selectedPair.quote.ticker}
            </span>
          </div>
        </div>
      )}

      {/* Expiration */}
      <div>
        <label className="block text-xs font-medium text-content-secondary mb-1.5">
          {t('limitOrders.form.expiration', 'Expiration')}
        </label>
        <div className="flex flex-wrap gap-1.5">
          {EXPIRATION_OPTIONS.map((opt) => (
            <button
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                expirationMs === opt.value
                  ? 'border-primary/30 bg-primary/15 text-primary'
                  : 'border-border-subtle bg-surface-overlay/60 text-content-secondary hover:text-content-primary'
              }`}
              key={opt.label}
              onClick={() => setExpirationMs(opt.value)}
            >
              {opt.label === 'Never'
                ? t('limitOrders.form.noExpiration', 'Never')
                : opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <button
        className={`mt-2 w-full rounded-2xl py-3 text-sm font-semibold transition-colors ${
          side === 'buy'
            ? 'bg-emerald-500 text-white hover:bg-emerald-400 disabled:bg-emerald-500/30 disabled:text-emerald-200/50'
            : 'bg-rose-500 text-white hover:bg-rose-400 disabled:bg-rose-500/30 disabled:text-rose-200/50'
        }`}
        disabled={
          !selectedPair ||
          !limitPrice ||
          limitPrice <= 0 ||
          !amount ||
          amount <= 0 ||
          insufficientBalance
        }
        onClick={handleCreate}
      >
        {side === 'buy'
          ? t('limitOrders.form.submitBuy', 'Place Buy Limit Order')
          : t('limitOrders.form.submitSell', 'Place Sell Limit Order')}
      </button>
    </div>
  )
}
